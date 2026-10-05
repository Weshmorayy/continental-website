/**
 * api/admin/analytics/route.ts — Passerelle vers les statistiques d'audience.
 *
 * ── Pourquoi une passerelle et non un appel direct ────────────────────────
 * Le mot de passe du compte Umami doit rester sur le serveur. Le navigateur
 * n'envoie donc que son jeton de session Supabase ; cette route vérifie qui
 * parle, puis interroge Umami pour son compte.
 *
 * ── Qui a le droit ────────────────────────────────────────────────────────
 * Exactement les mêmes que pour l'onglet Statistiques du portail :
 * une ligne dans `site_admins` avec le rôle `admin`. Les statistiques
 * agrègent le trafic du site et se lisent au niveau de l'agence ; un compte
 * éditeur ne les voit pas, et cette route le refuse plutôt que de compter sur
 * le fait que l'onglet soit masqué. Un onglet masqué n'est pas une
 * autorisation : l'URL, elle, reste appelable.
 *
 * ── Ce que cette route ne renvoie pas ─────────────────────────────────────
 * Ni commandes, ni chiffre d'affaires. Ces chiffres vivent dans Supabase et
 * l'écran les lit directement avec la session de l'administrateur : RLS fait
 * le tri. Ici on ne sert que l'audience.
 */

import { NextResponse } from 'next/server'
import {
  getAudience,
  isUmamiConfigured,
  umamiConfigurationProblem,
  UMAMI_TIMEZONE,
  UmamiError,
  type GranularityKey,
  type PeriodKey,
} from '@/lib/umami'

// Aucun cache : l'écran demande des chiffres à jour, et la route est de toute
// façon protégée par une session.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PERIODS: PeriodKey[] = ['24h', '7d', '30d', '90d', '12m', 'all']
const GRANULARITIES: GranularityKey[] = ['hour', 'day', 'week', 'month']

/** Valeur par défaut si le paramètre est absent ou inconnu. */
function pick<T extends string>(raw: string | null, allowed: T[], fallback: T): T {
  return allowed.includes(raw as T) ? (raw as T) : fallback
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

  if (!url || !anon) {
    return NextResponse.json(
      { error: 'Supabase n’est pas configuré côté serveur.' },
      { status: 500 },
    )
  }

  /* ── 1. Qui appelle ? ──────────────────────────────────────────────────── */

  const header = request.headers.get('authorization') ?? ''
  const jwt = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!jwt) {
    return NextResponse.json({ error: 'Session requise.' }, { status: 401 })
  }

  // Le jeton est présenté à Supabase, qui seul peut dire s'il est valide et à
  // qui il appartient. Le croire sur parole serait laisser n'importe qui lire
  // le trafic du site en inventant une chaîne.
  const identity = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${jwt}` },
    cache: 'no-store',
  }).catch(() => null)

  if (!identity?.ok) {
    return NextResponse.json({ error: 'Session expirée ou invalide.' }, { status: 401 })
  }

  const user = (await identity.json()) as { email?: string }
  if (!user.email) {
    return NextResponse.json({ error: 'Compte sans adresse.' }, { status: 401 })
  }

  /* ── 2. Est-il administrateur ? ────────────────────────────────────────── */

  // La requête porte le jeton de l'utilisateur, pas une clé d'administration :
  // c'est RLS qui répond, et il ne peut donc lire que sa propre ligne.
  const rows = await fetch(
    `${url}/rest/v1/site_admins?select=role&email=eq.${encodeURIComponent(user.email)}&limit=1`,
    {
      headers: { apikey: anon, Authorization: `Bearer ${jwt}`, Accept: 'application/json' },
      cache: 'no-store',
    },
  ).catch(() => null)

  const admins = rows?.ok ? ((await rows.json()) as { role?: string }[]) : []
  if (admins[0]?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Les statistiques sont réservées aux comptes administrateurs.' },
      { status: 403 },
    )
  }

  /* ── 3. Umami est-il branché ? ─────────────────────────────────────────── */

  if (!isUmamiConfigured) {
    // 200 et non 500 : ce n'est pas une panne, c'est une installation qui
    // n'a pas encore été faite. L'écran affiche alors le compteur de repli et
    // la marche à suivre, sans rouge ni message d'erreur.
    return NextResponse.json({
      configured: false,
      problem: umamiConfigurationProblem(),
      timezone: UMAMI_TIMEZONE,
    })
  }

  /* ── 4. Les chiffres ───────────────────────────────────────────────────── */

  const params = new URL(request.url).searchParams
  const period = pick(params.get('period'), PERIODS, '30d')
  const granularity = pick(params.get('granularity'), GRANULARITIES, 'day')

  try {
    const report = await getAudience(period, granularity)
    return NextResponse.json({ ...report, timezone: UMAMI_TIMEZONE })
  } catch (error) {
    const message =
      error instanceof UmamiError
        ? error.message
        : 'Umami est injoignable depuis le serveur.'

    // 502 : c'est Umami qui n'a pas répondu, pas cette application. Le
    // message nomme la cause réelle — identifiants refusés, service éteint,
    // site inconnu — parce qu'un « erreur de chargement » obligerait à
    // ouvrir les journaux pour deviner laquelle.
    return NextResponse.json({ configured: true, error: message }, { status: 502 })
  }
}
