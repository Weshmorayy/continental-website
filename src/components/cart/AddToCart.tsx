'use client'

/**
 * AddToCart — Le bouton « Ajouter au panier ».
 *
 * Un composant client, parce que l'action elle-même ne peut pas l'être : le
 * panier vit dans le navigateur. Le produit, lui, arrive du serveur.
 *
 * ── La confirmation ───────────────────────────────────────────────────────
 * Ajouter un article ouvre le tiroir : c'est la seule preuve fiable que
 * l'action a porté. Un bouton qui change de texte pendant deux secondes puis
 * revient à son état initial passe inaperçu de la moitié des visiteurs, et sur
 * un site où l'on vend des ventilateurs, « je ne sais pas si j'ai bien
 * cliqué » est une cause de commande perdue.
 */

import React from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface Props {
  slug: string
  name: string
  /**
   * Référence fabricant du produit (FS40-1688, CT-43SR…).
   *
   * Volontairement `modelRef` et NON `ref` : `ref` est un mot-clé réservé de
   * React. La fiche produit est un composant serveur, et un composant serveur
   * ne peut ni créer ni transmettre une `ref` à un composant client — le
   * passage de la frontière serveur/client échoue à l'exécution avec
   * « Refs cannot be used in Server Components ». Le nom de la donnée était
   * correct, le nom de la prop ne l'était pas.
   */
  modelRef: string
  price: number
  image: string
  /** Fiche produit : le bouton prend toute la largeur. */
  full?: boolean
  /**
   * Identité de la LIGNE de panier, quand la fiche décline des modèles
   * (`slug::variante`). Sans elle, la clé vaut le slug : le comportement des
   * fiches à modèle unique est inchangé.
   */
  lineKey?: string
}

export default function AddToCart({ slug, name, modelRef, price, image, full, lineKey }: Props) {
  const { add, lines } = useCart()
  const key = lineKey ?? slug
  // Le compteur suit la LIGNE, pas le produit : « Dans le panier (1) » doit
  // décrire le modèle affiché à l'écran, pas un autre modèle de la même fiche.
  const inCart = lines.find((l) => l.key === key)?.quantity ?? 0

  return (
    <button
      type="button"
      onClick={() => add({ key, slug, name, ref: modelRef, price, image })}
      className={full ? 'btn-accent w-full justify-center py-4 text-sm' : 'btn-accent flex-1 justify-center px-4 py-2.5 text-xs'}
      aria-label={`Ajouter ${name} au panier`}
    >
      {inCart > 0 ? <Check size={full ? 17 : 15} /> : <ShoppingBag size={full ? 17 : 15} />}
      {inCart > 0 ? `Dans le panier (${inCart})` : 'Ajouter au panier'}
    </button>
  )
}