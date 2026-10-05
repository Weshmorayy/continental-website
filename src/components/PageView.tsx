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
 * ── Pourquoi la clé passe dans l'URL ──────────────────────────────────────
 * `navigator.sendBeacon()` ne permet pas de poser d'en-tête HTTP, et PostgREST
 * refuse une requête sans `apikey` (« No API key found in request »). La clé
 * est donc transmise en paramètre de requête, que PostgREST accepte au même
 * titre que l'en-tête. C'est ce détail qui rendait le compteur totalement
 * muet : `sendBeacon` renvoie `true` dès la mise en file d'attente, même quand
 * la requête échouera six secondes plus tard, donc le repli `supabase.rpc()` en
 * aval n'était jamais atteint. La clé n'est pas un secret — elle est déjà
 * embarquée dans le bundle public et n'accorde aucun droit d'écriture.
 *
 * ── Vie privée ───────────────────────────────────────────────────────────
 * Seule la SOURCE du trafic est transmise, et seulement son nom d'hôte
 * (google.com, l.facebook.com…). Ni l'URL de provenance, ni sa chaîne de
 * requête — qui contient couramment des identifiants de campagne ou de session.
 * Une navigation interne ou une visite sans référent compte comme « direct ».
 *
 * ── Ce compteur s'efface devant Umami ────────────────────────────────────
 * Dès que `NEXT_PUBLIC_UMAMI_URL` et `NEXT_PUBLIC_UMAMI_WEBSITE_ID` sont
 * renseignées, ce composant ne fait plus rien : Umami mesure la même visite,
 * en mieux, et l'écrire ici aussi reviendrait à compter deux fois la même
 * chose dans deux systèmes.
 *
 * Il reste en place, et actif, tant qu'Umami n'est pas configuré. Un
 * déploiement peut ainsi partir avant qu'Umami soit en ligne : le site n'est
 * jamais sans mesure, et l'onglet Statistiques retombe sur ce compteur.
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { isAnalyticsEnabled } from '@/config/analytics'
import { supabase } from '@/lib/supabase'

/** Mémoire de session : empêche de recompter un rechargement. */
const seen = new Set<string>()

/**
 * Nom d'hôte du référent, ramené à « direct » pour tout ce qui n'est pas une
 * arrivée extérieure. `www.` est retiré pour ne pas compter séparément
 * `google.com` et `www.google.com`.
 */
function readSource(): string {
  const ref = document.referrer
  if (!ref) return 'direct'
  try {
    const url = new URL(ref)
    // Une navigation venue du site lui-même (clic vers une fiche produit)
    // n'est pas une source de trafic : c'est l'accueil qui l'a comptée.
    if (url.host === window.location.host) return 'direct'
    return url.hostname.replace(/^www\./, '')
  } catch {
    return 'direct'
  }
}

export default function PageView() {
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    // Umami est branché : la mesure est déjà faite, et mieux. Écrire une
    // seconde ligne dans Supabase ne ferait que gonfler la table.
    if (isAnalyticsEnabled) return
    if (!supabase) return
    if (pathname.startsWith('/admin')) return
    if (seen.has(pathname)) return
    seen.add(pathname)

    const payload = JSON.stringify({
      p_event: 'page_view',
      p_path: pathname,
      p_meta: { src: readSource() },
    })

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // `sendBeacon` survit à la fermeture de l'onglet, là où un `fetch` est
    // annulé : le compteur ne perd pas la visite quand le visiteur quitte la
    // page immédiatement après l'avoir ouverte.
    if (base && key) {
      const queued = navigator.sendBeacon?.(
        `${base}/rest/v1/rpc/record_event?apikey=${encodeURIComponent(key)}`,
        new Blob([payload], { type: 'application/json' }),
      )
      if (queued) return
    }

    // Repli : le client Supabase pose l'en-tête apikey et distingue une vraie
    // erreur d'un simple échec de mise en file d'attente.
    void supabase.rpc('record_event', {
      p_event: 'page_view',
      p_path: pathname,
      p_meta: { src: readSource() },
    })
  }, [pathname])

  return null
}