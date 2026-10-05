'use client'

/**
 * ProductViewCounter.tsx — compte une consultation de fiche produit.
 *
 * La page `/produit/[slug]` est un Server Component : elle ne peut pas appeler
 * une base depuis le serveur, d'une part parce que le site est statique, et
 * d'autre part parce qu'un rendu serveur se produit aussi pour les robots
 * d'indexation et les previews de liens — une consultation de fiche n'est pas
 * une visite si personne ne l'a demandée. Le comptage part donc du navigateur,
 * comme `PageView`, via ce petit îlot client inséré dans la page.
 *
 * `bump_product_views()` existe depuis le schéma initial et `products.views`
 * est un compteur cumulé : rien ne les appelait, le classement « les plus vus »
 * restait donc bloqué à zéro pour tous les produits.
 *
 * Mêmes deux contraintes que pour `record_event` : `sendBeacon` ne pose pas
 * d'en-tête, PostgREST exige `apikey` → la clé passe dans l'URL. Et une
 * reconsultation de la même fiche dans la même session ne recompte pas.
 */

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProductViewCounter({ slug }: { slug: string }) {
  // `useRef` et non une variable de module : le décompte appartient à cette
  // instance de page. Deux onglets ouverts sur deux fiches différentes doivent
  // pouvoir compter chacune, alors qu'un module partagé les confondrait.
  const counted = useRef(false)

  useEffect(() => {
    if (counted.current) return
    if (!supabase || !slug) return
    counted.current = true

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const payload = JSON.stringify({ p_slug: slug })

    if (base && key) {
      const queued = navigator.sendBeacon?.(
        `${base}/rest/v1/rpc/bump_product_views?apikey=${encodeURIComponent(key)}`,
        new Blob([payload], { type: 'application/json' }),
      )
      if (queued) return
    }

    void supabase.rpc('bump_product_views', { p_slug: slug })
  }, [slug])

  return null
}