'use client'

/**
 * useScrollLock — bloque le défilement de la page tant qu'une couche est
 * ouverte (fenêtre modale, confirmation, tiroir de navigation).
 *
 * ── Pourquoi un compteur, et pas un simple `overflow: hidden` ─────────────
 * La version précédente vivait dans `Modal` et retenait la valeur d'origine
 * de `document.body.style.overflow` pour la remettre en place à la fermeture.
 * Cela marche pour une fenêtre seule, et échoue dès qu'il y en a deux :
 *
 *   formulaire ouvert  → verrou posé, « previous » = ''
 *   confirmation ouverte par-dessus → verrou posé, « previous » = 'hidden'
 *   confirmation fermée → overflow = 'hidden'  (la page reste bloquée)
 *   formulaire fermé → overflow = ''            (débloquée)
 *
 * …ce qui fonctionne par chance. Mais si les deux se ferment dans l'autre
 * ordre, ou si un composant tiers pose son propre verrou, les valeurs se
 * marchent dessus. Un compteur partagé règle le problème par construction :
 * la page n'est rendue à elle-même que lorsque PLUS PERSONNE ne la retient.
 *
 * ── Pourquoi ce n'est pas qu'un `overflow: hidden` sur `<body>` ───────────
 * Sur iOS, `<body>` en `overflow: hidden` ne bloque pas le geste : le
 * défilement passe par `<html>`, et Safari continue de faire glisser la page.
 * Le verrou s'applique donc aux DEUX, avec la valeur réellement calculée au
 * moment où on la lit — pas la chaîne vide, qui n'est pas la valeur d'origine
 * d'un `<html>` que la feuille de style laisse en `visible`.
 *
 * Le décalage de la barre de défilement est compensé sur `<body>` : sans
 * cela, verrouiller la page décale tout le contenu de la largeur de la barre,
 * et la page sursaute à chaque ouverture de fenêtre sur ordinateur.
 */

import { useEffect } from 'react'

let locks = 0
let previousHtmlOverflow = ''
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

function lock() {
  locks += 1
  if (locks > 1) return

  const html = document.documentElement
  const body = document.body

  previousHtmlOverflow = html.style.overflow
  previousBodyOverflow = body.style.overflow
  previousBodyPaddingRight = body.style.paddingRight

  // La largeur de la barre de défilement, mesurée avant de la retirer.
  const gap = window.innerWidth - html.clientWidth

  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'
  if (gap > 0) body.style.paddingRight = `${gap}px`
}

function unlock() {
  locks = Math.max(0, locks - 1)
  if (locks > 0) return

  document.documentElement.style.overflow = previousHtmlOverflow
  document.body.style.overflow = previousBodyOverflow
  document.body.style.paddingRight = previousBodyPaddingRight
}

export function useScrollLock(active: boolean = true) {
  useEffect(() => {
    if (!active) return
    lock()
    return unlock
  }, [active])
}
