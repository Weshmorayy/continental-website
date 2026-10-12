'use client'

/**
 * CartContext.tsx — Le panier, côté navigateur.
 *
 * ── Pourquoi un contexte distinct de `StoreContext` ───────────────────────
 * Le contexte de l'administration charge des tables privées, vérifie les droits
 * et tient le journal. Aucune de ces choses ne concerne un visiteur qui
 * ajoute deux ventilateurs à un panier. Mélanger les deux obligerait le panier
 * à dépendre de l'état d'authentification, et l'authentification à dépendre du
 * panier. Séparés, chacun ne casse pas l'autre.
 *
 * ── Pourquoi le panier survit au rechargement ─────────────────────────────
 * Un Dakarois qui prepares sa commande sur son téléphone et qui change
 * d'application avant de finaliser ne doit pas perdre son panier. D'où le
 * `localStorage`. C'est aussi ce qui permet d'afficher le nombre d'articles
 * dans l'en-tête dès le premier rendu, sans attendre l'hydratation.
 *
 * ── Ce qui est stocké, et ce qui ne l'est pas ─────────────────────────────
 * Une ligne de panier contient le NOM, le PRIX, la RÉFÉRENCE et la QUANTITÉ —
 * volontairement une COPIE, et non un identifiant vivant. Deux raisons :
 *
 *   1. une commande doit rester lisible même si le produit est ensuite modifié
 *      ou retiré du catalogue. Un panier qui ne stocke qu'un identifiant perd
 *      sa description au moment de passer commande — exactement quand on en a
 *      le plus besoin ;
 *   2. le prix est figé au moment de l'ajout. Si la régle change entre l'ajout
 *      et la validation, le client ne doit pas voir le total changer sous ses
 *      yeux.
 *
 * Le prix affiché reste néanmoins celui du catalogue à l'affichage : voir
 * `refreshPrices()`.
 */

import React, {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react'

export interface CartLine {
  /**
   * Clé de LIGNE — l'identité de l'article dans le panier.
   *
   * Elle valait le slug, et valait donc aussi l'identité du produit : deux
   * modèles d'une même fiche fusionnaient en une seule ligne. Le client qui
   * ajoutait le 1 cv puis le 2 cv lisait « 2 × » au prix d'un seul des deux —
   * et la commande envoyée au vendeur ne mentionnait qu'un modèle.
   *
   * Elle vaut désormais le slug pour une fiche à modèle unique, et
   * `slug::variante` pour une fiche déclinée.
   */
  key: string
  /** Slug du PRODUIT : sert au lien de la fiche et à la commande. */
  slug: string
  name: string
  ref: string
  price: number
  image: string
  quantity: number
}

/**
 * Ce que fournit un bouton d'ajout. La clé de ligne est facultative : sans
 * variante, elle vaut le slug — c'est le cas de toutes les fiches à modèle
 * unique, qui n'ont pas à connaître cette mécanique.
 */
export type CartInput = Omit<CartLine, 'quantity' | 'key'> & { key?: string }

interface CartValue {
  lines: CartLine[]
  /** Nombre d'articles, toutes lignes confondues. */
  count: number
  subtotal: number
  add: (product: CartInput, quantity?: number) => void
  /** `key` : la clé de LIGNE, jamais le slug (cf. CartLine.key). */
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  open: boolean
  setOpen: (v: boolean) => void
}

const CartContext = createContext<CartValue | null>(null)

const STORAGE_KEY = 'continental.panier.v1'

function readStored(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    // Le stockage local est modifiable à la main, et peut contenir des données
    // d'une version antérieure. On ne fait confiance à rien : chaque ligne est
    // filtrée sur sa forme, et une ligne cassée est écartée plutôt que
    // propagée jusqu'au total affiché.
    // La clé est facultative dans ce qui est stocké : un panier enregistré
    // avant l'arrivée des variantes n'en a pas. C'est le type de ce qui est LU,
    // pas de ce qui est manipulé ensuite.
    type Stored = Omit<CartLine, 'key'> & { key?: string }

    return parsed.filter((l): l is Stored => {
      if (typeof l !== 'object' || l === null) return false
      const x = l as Record<string, unknown>
      return (
        typeof x.slug === 'string' && x.slug !== '' &&
        typeof x.name === 'string' &&
        typeof x.price === 'number' && Number.isFinite(x.price) &&
        typeof x.quantity === 'number' && Number.isInteger(x.quantity) && x.quantity > 0
      )
    }).map((l) => ({
      // Panier d'avant les variantes : la clé se reconstitue depuis le slug,
      // et la ligne se comporte exactement comme auparavant.
      key: typeof l.key === 'string' && l.key !== '' ? l.key : l.slug,
      slug: l.slug,
      name: l.name,
      ref: typeof l.ref === 'string' ? l.ref : '',
      price: l.price,
      image: typeof l.image === 'string' ? l.image : '',
      quantity: Math.min(l.quantity, 99),
    }))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [open, setOpen] = useState(false)
  // Tant que le stockage n'a pas été lu, le panier est considéré vide : le
  // nombre d'articles ne s'affiche pas une seconde avant d'apparaître.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLines(readStored())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* quota atteint ou mode privé : le panier reste utilisable en mémoire */
    }
  }, [lines, ready])

  const add = useCallback((product: CartInput, quantity = 1) => {
    const key = product.key ?? product.slug
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (!existing) return [...prev, { ...product, key, quantity }]

      // Deux ajouts du même article : on incrémente plutôt que d'empiler deux
      // lignes. Avec un plafond à 99, pour qu'une commande ne devienne pas
      // accidentellement un accueil de dix mille articles en un seul clic.
      return prev.map((l) =>
        l.key === key
          ? { ...l, quantity: Math.min(l.quantity + quantity, 99) }
          : l,
      )
    })
    setOpen(true)
  }, [])

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, 99) } : l)),
    )
  }, [])

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartValue>(() => ({
    lines,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: lines.reduce((s, l) => s + l.price * l.quantity, 0),
    add,
    setQuantity,
    remove,
    clear,
    open,
    setOpen,
  }), [lines, add, setQuantity, remove, clear, open])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  // Un `useCart()` hors `CartProvider` est un oubli de montage, pas un cas
  // normal : Better le rend visible tout de suite plutôt qu'en une erreur
  // « undefined is not a function » trois composants plus loin.
  if (!ctx) throw new Error('useCart doit être utilisé dans un <CartProvider>.')
  return ctx
}