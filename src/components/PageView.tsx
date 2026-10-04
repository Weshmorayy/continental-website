'use client'

/**
 * PageView.tsx — Compteur de visites.
 *
 * Le site est statique : personne côté serveur ne peut noter une visite. Le
 * compteur est donc déclenché par le navigateur, via la fonction publique
 * `record_event()`.
 *
 * Le chemin est lu depuis la route elle-même : un seul montage, dans le layout
 * racine, couvre toutes les pages. `/admin` est exclu — une session de gestion
 * n'est pas une visite de vitrine et gonflerait le chiffre.
 *
 * Une seule requête par page et par session de navigation : recharger ne doit
 * pas recompter la visite, sinon la statistique ne mesure plus rien.
 *
 * Aucune adresse IP, aucun identifiant de visiteur n'est transmis. La table
 * `site_events` ne contient qu'un nom d'événement, un chemin et un jour.
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/** Mémoire de session : empêche de recompter un rechargement. */
const seen = new Set<string>()

export default function PageView() {
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    if (!supabase) return
    if (pathname.startsWith('/admin')) return
    if (seen.has(pathname)) return
    seen.add(pathname)

    const body = JSON.stringify({ p_event: 'page_view', p_path: pathname })

    // `sendBeacon` survit à la fermeture de l'onglet, là où un `fetch` est
    // annulé : le compteur ne perd pas la visite quand le visiteur quitte la
    // page immédiatement après l'avoir ouverte.
    const queued = navigator.sendBeacon?.(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/record_event`,
      new Blob([body], { type: 'application/json' }),
    )
    if (queued) return

    void supabase.rpc('record_event', { p_event: 'page_view', p_path: pathname })
  }, [pathname])

  return null
}
