import type { CSSProperties } from 'react'

/**
 * images.ts — le cadrage d'une image, décidé dans l'administration.
 *
 * ── Pourquoi un style en ligne et non une classe ──────────────────────────
 * Chaque section a un cadrage historique écrit en Tailwind : le héros pose
 * `object-contain` (le produit doit rester entier), les cartes de gammes
 * `object-cover` (elles remplissent leur cadre). Ces classes sont compilées,
 * et Tailwind ne peut produire que celles qu'il voit écrites dans le code.
 *
 * Une valeur choisie dans l'administration est une donnée, pas du code : elle
 * ne peut donc pas devenir une classe. Elle est posée en style en ligne, qui
 * l'emporte sur la classe — c'est exactement ce qu'on veut, et cela évite de
 * compiler les 15 combinaisons possibles `object-` × `object-position-`.
 *
 * ── Pourquoi `undefined` et non `'cover'` ─────────────────────────────────
 * Un bloc dont le cadrage n'a jamais été touché renvoie `null`. On renvoie
 * alors un style VIDE : la section garde sa classe d'origine et rien ne bouge
 * sur le site. Écrire un défaut ici recadrerait d'un coup tous les visuels
 * déjà validés par le client.
 */

/** Valeurs de `object-fit` proposées. `""` = la section décide (défaut). */
export const OBJECT_FIT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Par défaut (recommandé)' },
  { value: 'cover', label: 'Remplir le cadre (rogne les bords)' },
  { value: 'contain', label: "Tout afficher (bandes vides si l'image est d'un autre format)" },
  { value: 'fill', label: 'Étirer (déforme)' },
  { value: 'none', label: "Taille d'origine, sans redimensionner" },
  { value: 'scale-down', label: "Réduire si l'image est plus grande, jamais agrandir" },
]

/** Valeurs de `object-position` proposées. Traduites pour un commerçant. */
export const OBJECT_POSITION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Par défaut (centré)' },
  { value: 'center top', label: 'Haut — on garde le dessus de l’image' },
  { value: 'center bottom', label: 'Bas — on garde le dessous' },
  { value: 'left center', label: 'Gauche' },
  { value: 'right center', label: 'Droite' },
  { value: 'left top', label: 'Coin haut gauche' },
  { value: 'right top', label: 'Coin haut droit' },
  { value: 'left bottom', label: 'Coin bas gauche' },
  { value: 'right bottom', label: 'Coin bas droit' },
  { value: 'center', label: 'Centré' },
]

/**
 * Style à poser sur l'image. Vide quand rien n'a été choisi : la classe
 * Tailwind de la section continue alors de s'appliquer.
 */
export function objectPositionStyle(
  fit: string | null | undefined,
  position: string | null | undefined,
): CSSProperties | undefined {
  const style: CSSProperties = {}
  if (fit && fit.trim() !== '') style.objectFit = fit.trim() as CSSProperties['objectFit']
  if (position && position.trim() !== '') style.objectPosition = position.trim()

  return Object.keys(style).length > 0 ? style : undefined
}
