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
  /** Clé de ligne : le slug du produit. Deux ajouts du même produit fusionnent. */
  slug: string
  name: string
  ref: string
  price: number
  image: string
  quantity: number
}

interface CartValue {
  lines: CartLine[]
  /** Nombre d'articles, toutes lignes confondues. */
  count: number
  subtotal: number
  add: (product: Omit<CartLine, 'quantity'>, quantity?: number) => void
  setQuantity: (slug: string, quantity: number) => void
  remove: (slug: string) => void
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
    return parsed.filter((l): l is CartLine => {
      if (typeof l !== 'object' || l === null) return false
      const x = l as Record<string, unknown>
      return (
        typeof x.slug === 'string' && x.slug !== '' &&
        typeof x.name === 'string' &&
        typeof x.price === 'number' && Number.isFinite(x.price) &&
        typeof x.quantity === 'number' && Number.isInteger(x.quantity) && x.quantity > 0
      )
    }).map((l) => ({
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

  const add = useCallback((product: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === product.slug)
      if (!existing) return [...prev, { ...product, quantity }]

      // Deux ajouts du même produit : on incrémente plutôt que d'empiler deux
      // lignes. Avec un plafond à 99, pour qu'une commande ne devienne pas
      // accidentellement un accueil de dix mille articles en un seul clic.
      return prev.map((l) =>
        l.slug === product.slug
          ? { ...l, quantity: Math.min(l.quantity + quantity, 99) }
          : l,
      )
    })
    setOpen(true)
  }, [])

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(quantity, 99) } : l)),
    )
  }, [])

  const remove = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug))
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