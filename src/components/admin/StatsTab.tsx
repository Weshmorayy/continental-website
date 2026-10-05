'use client'

/**
 * StatsTab — Tableau de bord du site.
 *
 * ── Deux familles de chiffres, jamais mélangées ───────────────────────────
 * C'est cette séparation qui donne sa valeur à l'écran :
 *
 *   • L'AUDIENCE — visiteurs, visites, pages vues, durée, rebond, appareils,
 *     navigateurs, pays, sources, pages et produits les plus consultés.
 *     Ce que le site a fait subir à ses visiteurs.
 *
 *   • LE COMMERCE — commandes, chiffre d'affaires, panier moyen, demandes.
 *     Ce que la société a vendu.
 *
 * Une visite n'est pas une vente. Les additionner produirait un chiffre
 * d'affaires qui n'existe nulle part, et c'est précisément le chiffre qu'un
 * portail de commerce ne doit jamais afficher. Les deux familles ont donc
 * chacune leur titre, leurs tuiles et leur source.
 *
 * ── D'où viennent les chiffres ────────────────────────────────────────────
 * L'audience vient d'Umami, auto-hébergé (`deploy/umami/`), lu par la route
 * `api/admin/analytics` — le mot de passe du compte de lecture ne quitte
 * jamais le serveur. Le commerce vient de Supabase, lu directement avec la
 * session de l'administrateur : RLS fait le tri.
 *
 * ── Ce que l'ancien compteur ne savait pas faire ──────────────────────────
 * Le compteur maison écrivait une ligne dans Supabase à chaque page vue. Il
 * ne distinguait pas deux visiteurs (un rechargement recomptait), ne filtrait
 * pas les robots, ne connaissait ni l'appareil, ni le pays, ni la durée, et sa
 * table grossissait sans limite. Il n'affichait rien d'autre que des pages
 * vues. Umami apporte ces mesures, et garde l'historique puisqu'il est chez
 * nous.
 *
 * Ce compteur n'est pas supprimé pour autant : il reste le repli tant
 * qu'Umami n'est pas configuré, et l'écran le dit alors clairement plutôt que
 * d'afficher des zéros.
 *
 * ── Les périodes ──────────────────────────────────────────────────────────
 * 24 h, 7 jours, 30 jours, 90 jours, 12 mois, depuis toujours. Chaque période
 * propose son découpage (heure, jour, semaine, mois). Le même choix pilote
 * l'audience ET le commerce : les deux moitiés de l'écran portent toujours sur
 * exactement la même fenêtre.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  BarChart3, ShoppingBag, MessageSquare, TrendingUp, RefreshCw,
  Eye, Users, ArrowUpRight, Clock, MousePointerClick, Globe,
  Monitor, Compass, ChevronDown, ChevronUp, AlertTriangle, Sparkles,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import {
  Card, Button, Pill, EmptyState, formatFcfa, formatDate,
} from '@/components/admin/ui'
import {
  PERIODS, PERIOD_LABEL, GRANULARITIES_FOR, DEFAULT_GRANULARITY,
  GRANULARITY_LABEL, GRANULARITY_PLURAL, periodStart,
  type PeriodKey, type GranularityKey,
} from '@/lib/periods'

/* ─────────────────────── formes renvoyées par la route ──────────────────── */

interface AudiencePoint { key: string; label: string; date: string; pageviews: number; visitors: number }
interface AudienceRow { value: string; count: number }

interface Report {
  configured: true
  period: PeriodKey
  granularity: GranularityKey
  effectiveUnit: 'hour' | 'day' | 'month'
  startAt: number
  endAt: number
  summary: {
    pageviews: number
    visitors: number
    visits: number
    bounces: number
    totaltime: number
    previous: { pageviews: number; visitors: number; visits: number }
  }
  derived: { bounceRate: number | null; averageDuration: number; pagesPerVisit: number | null }
  series: AudiencePoint[]
  pages: AudienceRow[]
  referrers: AudienceRow[]
  devices: AudienceRow[]
  browsers: AudienceRow[]
  countries: AudienceRow[]
  events: AudienceRow[]
}

type AnalyticsResponse =
  | ({ configured: true; error?: undefined } & Report)
  | { configured: false; problem: string | null }
  | { configured?: boolean; error: string; problem?: undefined }

/* ───────────────────────── repli : compteur Supabase ────────────────────── */

interface TrafficRow { day: string; path: string; source: string; views: number }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Le compteur de repli. Ses vues sont publiques par construction — ni IP, ni
 * identifiant, seulement un nom d'hôte de provenance — et il n'est lu que si
 * Umami n'est pas branché.
 */
async function readTraffic(): Promise<TrafficRow[]> {
  if (!SUPABASE_URL || !ANON_KEY) return []
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/public_traffic?select=*&order=day.asc&limit=2000`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }, cache: 'no-store' },
  )
  if (!res.ok) return []
  return res.json()
}

/* ──────────────────────────────── formats ──────────────────────────────── */

/** Une part, en pourcentage d'un total. Jamais de division par zéro. */
function share(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

/** « 1 min 24 » — une durée brute en secondes ne se lit pas. */
function formatDuration(seconds: number): string {
  if (!seconds) return '0 s'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  if (minutes === 0) return `${rest} s`
  if (minutes < 60) return `${minutes} min ${String(rest).padStart(2, '0')}`
  const hours = Math.floor(minutes / 60)
  return `${hours} h ${String(minutes % 60).padStart(2, '0')}`
}

/**
 * Variation en pourcentage d'une période sur la précédente.
 *
 * `null` quand la période précédente est vide : passer de 0 à 3 n'est pas une
 * progression de 300 %, c'est un début. Afficher un pourcentage dans ce cas
 * inventerait une tendance.
 */
function delta(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/** « direct » : un nom d'hôte brut ne se lit pas. */
function sourceLabel(source: string): string {
  if (source === 'direct') return 'Accès direct'
  if (!source || source === '') return 'Accès direct'
  return source
}

/** Les URL d'Umami sont des chemins : on les laisse tels quels, mais lisibles. */
function pathLabel(path: string): string {
  return path === '/' ? 'Accueil' : path
}

/* ─────────────────────────────── graphique ─────────────────────────────── */

interface Bucket { key: string; label: string; pageviews: number; visitors: number }

/**
 * Deux barres par case : pages vues (noir) et visiteurs uniques (gris).
 *
 * Les deux mesures ont des ordres de grandeur différents — une visite voit
 * souvent deux ou trois pages — mais elles se lisent l'une contre l'autre :
 * c'est l'écart entre les deux hauteurs qui indique si les visiteurs
 * explorent le site ou repartent après une page. Chaque barre est donc
 * normalisée sur le MÊME maximum, pas sur le sien : deux échelles séparées
 * donneraient deux séries de même hauteur, et l'écart disparaîtrait.
 */
function TrafficChart({ data, label }: { data: Bucket[]; label: string }) {
  const max = Math.max(...data.map((d) => Math.max(d.pageviews, d.visitors)), 1)
  const hasAny = data.some((d) => d.pageviews > 0 || d.visitors > 0)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="admin-label">{label}</p>
        <div className="flex items-center gap-4 text-[0.68rem] text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-black" aria-hidden="true" />
            Pages vues
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-bg-tertiary ring-1 ring-border" aria-hidden="true" />
            Visiteurs
          </span>
        </div>
      </div>

      {!hasAny ? (
        <p className="py-10 text-center text-sm text-text-muted">
          Aucune visite sur cette période.
        </p>
      ) : (
        <>
          <div className="flex h-44 items-end gap-[3px]" role="img" aria-label={label}>
            {data.map((d) => (
              <div
                key={d.key}
                className="group flex flex-1 flex-col items-center justify-end gap-[1px]"
                title={`${d.label} — ${d.pageviews} page(s) vue(s), ${d.visitors} visiteur(s)`}
              >
                <div className="flex h-full w-full items-end justify-center gap-[1px]">
                  <div
                    className="w-1/2 rounded-t bg-black transition-opacity group-hover:opacity-70"
                    style={{ height: `${Math.max((d.pageviews / max) * 100, d.pageviews > 0 ? 3 : 0)}%` }}
                  />
                  <div
                    className="w-1/2 rounded-t bg-bg-tertiary ring-1 ring-inset ring-border transition-opacity group-hover:opacity-70"
                    style={{ height: `${Math.max((d.visitors / max) * 100, d.visitors > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Trois repères seulement : au-delà, l'axe devient un rideau de
              chiffres sur un téléphone. */}
          <div className="mt-2.5 flex justify-between text-[0.62rem] text-text-muted">
            <span>{data[0]?.label}</span>
            {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
            <span>{data[data.length - 1]?.label}</span>
          </div>
        </>
      )}
    </div>
  )
}

/* ──────────────────────────────── tuiles ───────────────────────────────── */

interface Tile {
  label: string
  value: string
  icon: React.ElementType
  tone?: 'neutral' | 'dark' | 'warn' | 'ok'
  change?: number | null
  hint?: string
}

function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map(({ label, value, icon: Icon, tone = 'neutral', change, hint }) => (
        <Card key={label} className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="admin-label leading-snug">{label}</p>
            <Icon size={17} strokeWidth={1.5} className="flex-shrink-0 text-text-muted" aria-hidden="true" />
          </div>
          <p
            className={`price-tag mt-2 truncate ${tone === 'warn' ? 'text-amber-700' : ''}`}
            title={hint ?? value}
          >
            {value}
          </p>
          {change !== undefined && (
            <p className="mt-1.5">
              {change === null ? (
                <span className="text-[0.65rem] text-text-muted">pas de période précédente</span>
              ) : (
                <Pill tone={change >= 0 ? 'ok' : 'warn'}>
                  {change >= 0 ? '+' : ''}{change} %
                </Pill>
              )}
            </p>
          )}
        </Card>
      ))}
    </div>
  )
}

/** Une liste classée avec sa barre de proportion. */
function RankedList({
  rows, total, empty, labelOf = (v: string) => v, limit = 8,
}: {
  rows: AudienceRow[]
  total: number
  empty: string
  labelOf?: (value: string) => string
  limit?: number
}) {
  if (rows.length === 0) return <EmptyState title={empty} />
  const shown = rows.slice(0, limit)
  const max = shown[0]?.count ?? 1

  return (
    <ul className="space-y-3">
      {shown.map((row) => (
        <li key={row.value}>
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate text-text-body" title={row.value}>
              {labelOf(row.value)}
            </span>
            <span className="shrink-0 text-text-muted">
              {row.count.toLocaleString('fr-FR')} · {share(row.count, total)} %
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
            <div className="h-full rounded-full bg-black" style={{ width: `${share(row.count, max)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ─────────────────────────────── écran ─────────────────────────────────── */

export default function StatsTab() {
  const { orders, leads, products, session, refresh } = useStore()

  const [period, setPeriod] = useState<PeriodKey>('30d')
  const [granularity, setGranularity] = useState<GranularityKey>(DEFAULT_GRANULARITY['30d'])
  const [report, setReport] = useState<Report | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [traffic, setTraffic] = useState<TrafficRow[]>([])

  /* ── chargement ─────────────────────────────────────────────────────────── */

  /**
   * Interroge la route et range le résultat.
   *
   * Renvoie l'issue plutôt que de la laisser deviner par l'appelant : c'est
   * elle qui décide s'il faut aller chercher le compteur de repli, et lire
   * l'état React juste après `setState` ne le permettrait pas — la valeur ne
   * serait pas encore à jour.
   */
  const loadAnalytics = useCallback(async (): Promise<'ok' | 'fallback' | 'error'> => {
    const token = session?.access_token
    if (!token) return 'error'

    try {
      const res = await fetch(
        `/api/admin/analytics?period=${period}&granularity=${granularity}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
      )
      const data = (await res.json()) as AnalyticsResponse

      if ('error' in data && data.error) {
        setFailure(data.error)
        setReport(null)
        setProblem(null)
        return 'error'
      }
      if (data.configured === false) {
        setProblem(data.problem ?? 'Umami n’est pas configuré.')
        setReport(null)
        setFailure(null)
        return 'fallback'
      }
      setReport(data as Report)
      setProblem(null)
      setFailure(null)
      return 'ok'
    } catch {
      setFailure('La route de statistiques est injoignable.')
      setReport(null)
      return 'error'
    }
  }, [period, granularity, session])

  const load = useCallback(async () => {
    setBusy(true)
    await refresh()
    const outcome = await loadAnalytics()
    // Le compteur de repli n'est lu que s'il sert : quand Umami répond, il
    // n'apporte rien et coûte une requête.
    if (outcome !== 'ok') {
      try { setTraffic(await readTraffic()) } catch { /* hors connexion */ }
    }
    setBusy(false)
  }, [refresh, loadAnalytics])

  useEffect(() => { void load() }, [load])

  /**
   * Changer de période peut rendre le découpage courant impossible : l'heure
   * n'a pas de sens sur douze mois. On retombe alors sur le découpage par
   * défaut de la période choisie.
   */
  useEffect(() => {
    if (!GRANULARITIES_FOR[period].includes(granularity)) {
      setGranularity(DEFAULT_GRANULARITY[period])
    }
  }, [period, granularity])

  /* ── commerce : toujours filtré sur la même fenêtre ─────────────────────── */

  // La borne est calculée à partir de la période choisie, avec la MÊME table
  // de durées que le serveur (`lib/periods.ts`). Les deux moitiés de l'écran
  // portent donc sur exactement la même fenêtre. On ne lit pas la borne dans
  // la réponse d'audience : au changement de période, celle-ci décrit encore
  // la période précédente, et les tuiles de commerce suivraient avec un temps
  // de retard.
  const from = periodStart(period) ?? 0

  const ordersInPeriod = useMemo(
    () => orders.filter((o) => new Date(o.created_at).getTime() >= from),
    [orders, from],
  )

  const paid = ordersInPeriod.filter((o) => o.order_status !== 'cancelled')
  const revenue = paid.reduce((s, o) => s + Number(o.total_amount), 0)
  const average = paid.length ? revenue / paid.length : 0
  const openLeads = leads.filter(
    (l) => l.status === 'new' && new Date(l.created_at).getTime() >= from,
  ).length

  const byStatus = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of ordersInPeriod) map.set(o.order_status, (map.get(o.order_status) ?? 0) + 1)
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [ordersInPeriod])

  /* ── audience ───────────────────────────────────────────────────────────── */

  const summary = report?.summary
  const derived = report?.derived
  const series: Bucket[] = report?.series ?? []

  /**
   * Produits les plus consultés.
   *
   * Avec Umami, la mesure vient des chemins `/produit/<slug>` réellement
   * visités — c'est une mesure, pas un compteur cumulé. Le slug est traduit en
   * nom de produit quand le catalogue le connaît, sinon il reste tel quel.
   */
  const topProducts = useMemo(() => {
    if (!report) {
      return products
        .filter((p) => p.views > 0)
        .sort((a, b) => b.views - a.views)
        .slice(0, 6)
        .map((p) => ({ name: p.name, count: p.views }))
    }
    return report.pages
      .filter((p) => p.value.startsWith('/produit/'))
      .slice(0, 6)
      .map((p) => {
        const slug = p.value.replace('/produit/', '')
        const found = products.find((x) => x.slug === slug)
        return { name: found?.name ?? slug, count: p.count }
      })
  }, [report, products])

  const visitors = summary?.visitors ?? 0
  const pageviews = summary?.pageviews ?? 0
  const visits = summary?.visits ?? 0

  const audienceTiles: Tile[] = [
    {
      label: 'Visiteurs uniques',
      value: visitors.toLocaleString('fr-FR'),
      icon: Users,
      change: delta(visitors, summary?.previous.visitors ?? 0),
    },
    {
      label: 'Visites',
      value: visits.toLocaleString('fr-FR'),
      icon: MousePointerClick,
      change: delta(visits, summary?.previous.visits ?? 0),
    },
    {
      label: 'Pages vues',
      value: pageviews.toLocaleString('fr-FR'),
      icon: Eye,
      change: delta(pageviews, summary?.previous.pageviews ?? 0),
    },
    {
      label: 'Pages par visite',
      value: derived?.pagesPerVisit == null ? '—' : String(derived.pagesPerVisit),
      icon: BarChart3,
    },
    {
      label: 'Durée moyenne',
      value: formatDuration(derived?.averageDuration ?? 0),
      icon: Clock,
    },
    {
      label: 'Taux de rebond',
      value: derived?.bounceRate == null ? '—' : `${derived.bounceRate} %`,
      icon: Compass,
      hint: 'Part des visiteurs repartis après une seule page.',
    },
  ]

  const businessTiles: Tile[] = [
    { label: 'Commandes', value: ordersInPeriod.length.toLocaleString('fr-FR'), icon: ShoppingBag },
    { label: 'Chiffre d’affaires', value: formatFcfa(revenue), icon: TrendingUp, tone: 'dark' },
    { label: 'Panier moyen', value: formatFcfa(average), icon: BarChart3 },
    {
      label: 'Demandes à traiter',
      value: openLeads.toLocaleString('fr-FR'),
      icon: MessageSquare,
      tone: openLeads > 0 ? 'warn' : 'ok',
    },
  ]

  /* ── repli sans Umami : les chiffres du compteur Supabase ───────────────── */

  const fallbackDaily = useMemo(() => {
    const sum = new Map<string, number>()
    for (const t of traffic) sum.set(t.day, (sum.get(t.day) ?? 0) + t.views)
    const days: Bucket[] = []
    const cursor = new Date()
    cursor.setUTCDate(cursor.getUTCDate() - 29)
    for (let i = 0; i < 30; i++) {
      const key = cursor.toISOString().slice(0, 10)
      const [, m, d] = key.split('-')
      days.push({ key, label: `${d}/${m}`, pageviews: sum.get(key) ?? 0, visitors: 0 })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return days
  }, [traffic])

  const fallbackTotal = fallbackDaily.reduce((s, d) => s + d.pageviews, 0)

  const fallbackPages = useMemo(() => {
    const sum = new Map<string, number>()
    for (const t of traffic) sum.set(t.path, (sum.get(t.path) ?? 0) + t.views)
    return Array.from(sum.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [traffic])

  const fallbackSources = useMemo(() => {
    const sum = new Map<string, number>()
    for (const t of traffic) sum.set(t.source, (sum.get(t.source) ?? 0) + t.views)
    return Array.from(sum.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [traffic])

  /** Taux de contact : le seul rapport entre les deux familles, jamais une somme. */
  const allProductViews = products.reduce((s, p) => s + p.views, 0)
  const contactRate = ordersInPeriod.length > 0 && allProductViews > 0
    ? share(ordersInPeriod.length, allProductViews)
    : null

  /* ── rendu ──────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-4">
      {/* ── barre d'outils : période, découpage, actualisation ── */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-black text-white'
                  : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Le découpage ne s'affiche que s'il y a un choix réel : un seul
              bouton n'est pas un choix. */}
          {GRANULARITIES_FOR[period].length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="admin-label">Découpage</span>
              <div className="flex overflow-hidden rounded-full border border-border">
                {GRANULARITIES_FOR[period].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGranularity(g)}
                    aria-pressed={granularity === g}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      granularity === g
                        ? 'bg-black text-white'
                        : 'bg-white text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {GRANULARITY_LABEL[g]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button onClick={load} aria-label="Actualiser">
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* ── Umami indisponible : on dit pourquoi, et on continue ── */}
      {failure && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                Mesure d’audience injoignable
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">{failure}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                Les chiffres de commerce ci-dessous restent exacts : ils viennent de la base du
                site, pas d’Umami.
              </p>
            </div>
          </div>
        </Card>
      )}

      {problem && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="mt-0.5 flex-shrink-0 text-text-muted" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                Mesure d’audience non configurée
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Le compteur interne prend le relais, mais il ne mesure que des pages vues : ni
                visiteurs uniques, ni durée, ni appareil, ni pays. Pour activer Umami, suivre{' '}
                <span className="font-mono text-text-body">deploy/umami/README.md</span>, puis
                redéployer — les variables publiques sont figées au moment du build.
              </p>
              <p className="mt-1.5 font-mono text-[0.68rem] text-text-muted">Manque : {problem}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ══════════════════════ AUDIENCE ══════════════════════ */}

      <div className="flex items-baseline justify-between gap-3 pt-1">
        <h2 className="display-sm text-sm uppercase tracking-wide">Audience</h2>
        <span className="text-[0.68rem] text-text-muted">
          {report ? `Découpage ${GRANULARITY_PLURAL[granularity].replace('par ', '')} · ${PERIOD_LABEL[period]}` : 'Compteur interne · 30 derniers jours'}
        </span>
      </div>

      {report && <TileGrid tiles={audienceTiles} />}

      <Card>
        <div className="p-5">
          {report ? (
            <>
              <TrafficChart
                data={series}
                label={`Trafic ${GRANULARITY_PLURAL[granularity]}`}
              />
              <button
                onClick={() => setShowTable((v) => !v)}
                className="hairline mt-5 flex w-full items-center justify-center gap-1.5 pt-4 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
                aria-expanded={showTable}
              >
                {showTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showTable ? 'Masquer le détail' : `Afficher le détail (${series.length} lignes)`}
              </button>
              {showTable && (
                <div className="mt-4 max-h-80 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="hairline text-left">
                        <th className="py-2 pr-3 text-[0.68rem] uppercase tracking-wide text-text-muted">
                          {GRANULARITY_LABEL[granularity]}
                        </th>
                        <th className="py-2 pr-3 text-right text-[0.68rem] uppercase tracking-wide text-text-muted">
                          Pages vues
                        </th>
                        <th className="py-2 text-right text-[0.68rem] uppercase tracking-wide text-text-muted">
                          Visiteurs
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {series.map((point) => (
                        <tr key={point.key} className="border-b border-border/60 last:border-0">
                          <td className="py-1.5 pr-3 text-text-body">{point.label}</td>
                          <td className="py-1.5 pr-3 text-right tabular-nums">
                            {point.pageviews.toLocaleString('fr-FR')}
                          </td>
                          <td className="py-1.5 text-right tabular-nums text-text-muted">
                            {point.visitors.toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : fallbackTotal > 0 ? (
            <TrafficChart data={fallbackDaily} label="Pages vues par jour — 30 derniers jours" />
          ) : (
            <EmptyState
              icon={<Users className="h-9 w-9" />}
              title="Aucune visite enregistrée"
              hint="La mesure se remplit dès que le site est consulté. Elle ne compte que des visites publiques : l’administration est exclue."
            />
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Pages les plus consultées">
          <div className="p-5">
            {report ? (
              <RankedList
                rows={report.pages}
                total={pageviews}
                empty="Aucune page consultée"
                labelOf={pathLabel}
              />
            ) : (
              <RankedList
                rows={fallbackPages}
                total={fallbackTotal}
                empty="Aucune page consultée"
                labelOf={pathLabel}
              />
            )}
          </div>
        </Card>

        <Card title="Sources de trafic">
          <div className="p-5">
            {report ? (
              <RankedList
                rows={report.referrers}
                total={visitors}
                empty="Aucune source identifiée"
                labelOf={sourceLabel}
              />
            ) : (
              <RankedList
                rows={fallbackSources}
                total={fallbackTotal}
                empty="Aucune source identifiée"
                labelOf={sourceLabel}
              />
            )}
          </div>
        </Card>
      </div>

      {report && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Appareils" action={<Monitor size={15} className="text-text-muted" />}>
              <div className="p-5">
                <RankedList rows={report.devices} total={visitors} empty="Aucun appareil identifié" />
              </div>
            </Card>
            <Card title="Navigateurs" action={<Compass size={15} className="text-text-muted" />}>
              <div className="p-5">
                <RankedList rows={report.browsers} total={visitors} empty="Aucun navigateur identifié" />
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Pays" action={<Globe size={15} className="text-text-muted" />}>
              <div className="p-5">
                <RankedList rows={report.countries} total={visitors} empty="Aucun pays identifié" />
              </div>
            </Card>

            <Card title="Produits les plus consultés">
              <div className="p-5">
                {topProducts.length === 0 ? (
                  <EmptyState title="Aucune fiche produit consultée" />
                ) : (
                  <ul className="space-y-2.5">
                    {topProducts.map((p) => (
                      <li key={p.name} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-text-body">{p.name}</span>
                        <span className="flex shrink-0 items-center gap-1.5 text-text-muted">
                          <Eye size={13} aria-hidden="true" />
                          {p.count.toLocaleString('fr-FR')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>

          {/* Les événements n'apparaissent que s'il y en a : une carte vide
              en permanence apprendrait à ignorer la section. */}
          {report.events.length > 0 && (
            <Card title="Actions suivies">
              <div className="p-5">
                <RankedList
                  rows={report.events}
                  total={report.events.reduce((s, e) => s + e.count, 0)}
                  empty="Aucune action enregistrée"
                  limit={6}
                />
              </div>
            </Card>
          )}
        </>
      )}

      {/* ══════════════════════ COMMERCE ══════════════════════ */}

      <div className="flex items-baseline justify-between gap-3 pt-3">
        <h2 className="display-sm text-sm uppercase tracking-wide">Commerce</h2>
        <span className="text-[0.68rem] text-text-muted">{PERIOD_LABEL[period]}</span>
      </div>

      <TileGrid tiles={businessTiles} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Commandes par état">
          <div className="p-5">
            {byStatus.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="h-9 w-9" />}
                title="Aucune commande sur la période"
                hint="Les commandes passées depuis le site apparaîtront ici."
              />
            ) : (
              <>
                <ul className="space-y-3">
                  {byStatus.map(([status, n]) => (
                    <li key={status}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="capitalize text-text-body">{status}</span>
                        <span className="text-text-muted">{n}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
                        <div
                          className="h-full rounded-full bg-black"
                          style={{ width: `${share(n, ordersInPeriod.length)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="hairline mt-5 pt-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-text-muted">Taux de contact</span>
                    <span className="text-sm font-semibold">
                      {contactRate === null ? '—' : `${contactRate} %`}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.68rem] leading-relaxed text-text-muted">
                    {contactRate === null
                      ? `Aucune commande sur la période : le rapport n’a pas encore de sens. ${allProductViews} consultation(s) de fiche produit cumulées.`
                      : `${ordersInPeriod.length} commande(s) pour ${allProductViews} consultation(s) de fiche produit cumulées.`}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card title="Dernières commandes">
          {ordersInPeriod.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Aucune commande sur la période" />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {ordersInPeriod.slice(0, 6).map((o) => (
                <li
                  key={o.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{o.ref_command}</p>
                    <p className="truncate text-xs text-text-muted">
                      {o.customer_name} · {formatDate(o.created_at)}
                    </p>
                  </div>
                  <p className="flex shrink-0 items-center gap-2 font-semibold">
                    {formatFcfa(o.total_amount)}
                    <ArrowUpRight size={14} className="text-text-muted" aria-hidden="true" />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
