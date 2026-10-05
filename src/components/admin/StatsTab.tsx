'use client'

/**
 * StatsTab — Statistiques du site.
 *
 * Deux familles de chiffres, jamais mélangées, et c'est la separation qui
 * donne sa valeur à l'ecran :
 *
 *   • L'AUDIENCE — pages vues, pages les plus consultees, sources de trafic,
 *     produits les plus vus. Ce que le site a fait subir a ses visiteurs.
 *
 *   • LE COMMERCE — commandes, chiffre d'affaires, panier moyen, demandes.
 *     Ce que la societe a vendu.
 *
 * Une visite n'est pas une vente. Les additionner produirait un chiffre
 * d'affaires qui n'existe nulle part, et c'est precisement le chiffre qu'un
 * portail de commerce ne doit jamais afficher.
 *
 * ── Ce qui manquait ───────────────────────────────────────────────────────
 * L'ecran ne montrait que les commandes, et la courbe des visites restait
 * vide en permanence. Deux raisons, toutes deux reelles :
 *
 *   1. `site_events` ne recevait rien. `PageView.tsx` envoyait saRequete avec
 *      `navigator.sendBeacon()`, qui ne pose pas d'en-tete HTTP ; PostgREST
 *      exige `apikey` et repondait 401 « No API key found in request ».
 *      `sendBeacon` renvoie `true` des la mise en file d'attente, donc le
 *      repli sur `supabase.rpc()` — qui, lui, pose l'en-tete — n'etait jamais
 *      atteint. Zéro visite enregistrée, depuis toujours.
 *
 *   2. `bump_product_views()` n'etait appele par personne : le classement des
 *      produits les plus vus restait a zero.
 *
 * Les deux sont corriges (cf. `supabase/012_traffic_stats.sql`). L'ecran
 * affiche maintenant ce qui arrive reellement dans la base, et rien d'autre.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  BarChart3, ShoppingBag, MessageSquare, TrendingUp, RefreshCw,
  Eye, Users, ArrowUpRight,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import {
  Card, Button, Pill, EmptyState, formatFcfa, formatDate,
} from '@/components/admin/ui'

/** Une ligne de `public_traffic` : jour × chemin × source. */
interface TrafficRow { day: string; path: string; source: string; views: number }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Les vues sont LUES par le composant, pas passées par le portail : un
 * compteur de visites n'a rien de privé — ni IP, ni identifiant, ni URL de
 * provenance complète, seulement un nom d'hôte — et cela évite d'attendre que le
 * compte soit autorisé avant que l'écran se remplisse.
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

/** Une barre verticale du graphique, en CSS pur — pas de librairie. */
function BarChart({ data, label }: { data: { day: string; n: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.n), 1)
  return (
    <div>
      <p className="admin-label mb-3">{label}</p>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">Aucune donnée.</p>
      ) : (
        <>
          <div className="flex h-40 items-end gap-1">
            {data.map((d) => (
              <div key={d.day} className="group relative flex-1" title={`${d.day} — ${d.n} vue(s)`}>
                <div
                  className="w-full rounded-t bg-black transition-opacity hover:opacity-70"
                  style={{ height: `${Math.max((d.n / max) * 100, d.n > 0 ? 4 : 0)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[0.62rem] text-text-muted">
            <span>{data[0]?.day.slice(5)}</span>
            <span>{data[data.length - 1]?.day.slice(5)}</span>
          </div>
        </>
      )}
    </div>
  )
}

/** Une part de marché, en pourcentage d'un total. Jamais de division par zéro. */
function share(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

/** « direct », « google.com »… : un nom d'hôte brut ne se lit pas. */
function sourceLabel(source: string): string {
  if (source === 'direct') return 'Accès direct'
  return source
}

export default function StatsTab() {
  const { orders, leads, products, refresh } = useStore()
  const [traffic, setTraffic] = useState<TrafficRow[]>([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setBusy(true)
    await refresh()
    try {
      setTraffic(await readTraffic())
    } catch {
      /* hors connexion : les chiffres métier restent affichés */
    } finally {
      setBusy(false)
    }
  }, [refresh])

  useEffect(() => { void load() }, [load])

  /* ─────────────────────────── commerce (factuel) ──────────────────────── */

  const paid = orders.filter((o) => o.order_status !== 'cancelled')
  const revenue = paid.reduce((s, o) => s + Number(o.total_amount), 0)
  const average = paid.length ? revenue / paid.length : 0
  const openLeads = leads.filter((l) => l.status === 'new').length

  const byStatus = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders) map.set(o.order_status, (map.get(o.order_status) ?? 0) + 1)
    return Array.from(map.entries())
  }, [orders])

  /* ──────────────────────────── audience (mesurée) ─────────────────────── */

  // Les 30 derniers JOURS, consécutifs : une ligne par jour, les jours sans
  // visite à zéro. Sans cela, une coupure de trafic disparaîtrait du graphique
  // au lieu de se lire comme une chute.
  const daily = useMemo(() => {
    const sum = new Map<string, number>()
    for (const t of traffic) sum.set(t.day, (sum.get(t.day) ?? 0) + t.views)

    const days: { day: string; n: number }[] = []
    const cursor = new Date()
    cursor.setDate(cursor.getDate() - 29)
    for (let i = 0; i < 30; i++) {
      const key = cursor.toISOString().slice(0, 10)
      days.push({ day: key, n: sum.get(key) ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    return days
  }, [traffic])

  const total30 = daily.reduce((s, d) => s + d.n, 0)
  const last7 = daily.slice(-7).reduce((s, d) => s + d.n, 0)
  const prev7 = daily.slice(-14, -7).reduce((s, d) => s + d.n, 0)
  const trend = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null

  /** Chemins les plus consultés, tous chemins confondus. */
  const topPages = useMemo(() => {
    const sum = new Map<string, number>()
    for (const t of traffic) sum.set(t.path, (sum.get(t.path) ?? 0) + t.views)
    return Array.from(sum.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8)
  }, [traffic])

  /** Sources de trafic. */
  const sources = useMemo(() => {
    const sum = new Map<string, number>()
    for (const t of traffic) sum.set(t.source, (sum.get(t.source) ?? 0) + t.views)
    return Array.from(sum.entries())
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6)
  }, [traffic])

  /** Produits les plus consultés : compteur cumulé en base. */
  const topProducts = useMemo(
    () =>
      products
        .filter((p) => p.views > 0)
        .sort((a, b) => b.views - a.views)
        .slice(0, 6),
    [products],
  )

  /*
   * Taux de contact : combien de visiteurs de fiche produit ont passé
   * commande. C'est le seul calcul qui rapproche les deux familles, et il
   * reste un RAPPORT entre deux mesures — jamais une somme.
   *
   * Tant qu'il n'y a aucune commande, le taux serait 0 % alors qu'aucune
   * commande n'a encore pu être passée. L'écran affiche donc « — » plutôt
   * qu'un zéro qui signifie « personne ne commande ».
   */
  const productViews = topProducts.reduce((s, p) => s + p.views, 0)
  const allViews = products.reduce((s, p) => s + p.views, 0)
  const contactRate = orders.length > 0 && allViews > 0
    ? share(orders.length, allViews)
    : null

  const hasTraffic = total30 > 0

  const tiles = [
    { label: 'Pages vues — 30 jours', value: total30.toLocaleString('fr-FR'), icon: Eye, tone: 'neutral' as const },
    { label: 'Commandes', value: String(orders.length), icon: ShoppingBag, tone: 'neutral' as const },
    { label: 'Chiffre d’affaires', value: formatFcfa(revenue), icon: TrendingUp, tone: 'dark' as const },
    { label: 'Panier moyen', value: formatFcfa(average), icon: BarChart3, tone: 'neutral' as const },
    { label: 'Demandes à traiter', value: String(openLeads), icon: MessageSquare, tone: openLeads > 0 ? 'warn' as const : 'ok' as const },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={load} aria-label="Actualiser">
          <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* ── chiffres ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tiles.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="admin-label">{label}</p>
                <p className="price-tag mt-1.5 truncate">{value}</p>
              </div>
              <Icon size={20} strokeWidth={1.5} className="flex-shrink-0 text-text-muted" />
            </div>
          </Card>
        ))}
      </div>

      {/* ── audience ── */}
      <Card title="Audience — 30 derniers jours">
        <div className="p-5">
          {!hasTraffic ? (
            <EmptyState
              icon={<Users className="h-9 w-9" />}
              title="Aucune visite enregistrée"
              hint="Le compteur se remplit dès que le site est consulté. Il mesure une estimation, pas une vente."
            />
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-baseline gap-3">
                <span className="price-tag">{last7.toLocaleString('fr-FR')}</span>
                <span className="text-sm text-text-muted">sur les 7 derniers jours</span>
                {trend !== null && (
                  <Pill tone={trend >= 0 ? 'ok' : 'warn'}>
                    {trend >= 0 ? '+' : ''}{trend} %
                  </Pill>
                )}
              </div>
              <BarChart data={daily} label="Pages vues par jour" />
            </>
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── pages les plus consultées ── */}
        <Card title="Pages les plus consultées">
          <div className="p-5">
            {topPages.length === 0 ? (
              <EmptyState title="Aucune page consultée" />
            ) : (
              <ul className="space-y-3">
                {topPages.map(({ path, views }) => (
                  <li key={path}>
                    <div className="mb-1.5 flex justify-between gap-3 text-sm">
                      <span className="truncate font-mono text-xs text-text-body">{path}</span>
                      <span className="shrink-0 text-text-muted">
                        {views} · {share(views, total30)} %
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${share(views, topPages[0].views)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* ── sources de trafic ── */}
        <Card title="Sources de trafic">
          <div className="p-5">
            {sources.length === 0 ? (
              <EmptyState title="Aucune source identifiée" />
            ) : (
              <ul className="space-y-3">
                {sources.map(({ source, views }) => (
                  <li key={source}>
                    <div className="mb-1.5 flex justify-between gap-3 text-sm">
                      <span className="truncate text-text-body">{sourceLabel(source)}</span>
                      <span className="shrink-0 text-text-muted">
                        {views} · {share(views, total30)} %
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${share(views, sources[0].views)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── produits les plus vus ── */}
        <Card title="Produits les plus consultés">
          <div className="p-5">
            {topProducts.length === 0 ? (
              <EmptyState title="Aucune fiche consultée" />
            ) : (
              <ul className="space-y-2.5">
                {topProducts.map((p) => (
                  <li key={p.slug} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-text-body">{p.name}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-text-muted">
                      <Eye size={13} aria-hidden="true" />
                      {p.views}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* ── contact ── */}
        <Card title="Commandes par état">
          <div className="p-5">
            {byStatus.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="h-9 w-9" />}
                title="Aucune commande"
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
                          style={{ width: `${share(n, orders.length)}%` }}
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
                      ? `Aucune commande n'a encore été enregistrée : le taux n'a pas de sens pour l'instant. ${productViews} vue(s) de fiche produit, ${allViews} au total.`
                      : `${orders.length} commande(s) pour ${allViews} consultation(s) de fiche produit.`}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* ── dernières commandes ── */}
      {orders.length > 0 && (
        <Card title="Dernières commandes">
          <ul className="divide-y divide-border">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">{o.ref_command}</p>
                  <p className="truncate text-xs text-text-muted">
                    {o.customer_name} · {formatDate(o.created_at)}
                  </p>
                </div>
                <p className="flex items-center gap-2 font-semibold">
                  {formatFcfa(o.total_amount)}
                  <ArrowUpRight size={14} className="text-text-muted" aria-hidden="true" />
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}