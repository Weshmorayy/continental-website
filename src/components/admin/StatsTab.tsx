'use client'

/**
 * StatsTab — Statistiques du site.
 *
 * Deux sources, jamais mélangées :
 *   • les COMMANDES et DEMANDES, qui sont des faits métier (ventes réelles) ;
 *   • les ÉVÉNEMENTS de visite, qui sont des estimations.
 *
 * Le chiffre de visites n'est pas presented comme une vente. Un tableau qui
 * additionne des visites et des commandes produit un « chiffre d'affaires »
 * qui n'existe nulle part.
 *
 * `site_events` est alimentée par un appel public `record_event()`. Aucun
 * événement n'est envoyé ici : les compter supposerait de les écrire aussi.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { BarChart3, ShoppingBag, MessageSquare, TrendingUp, RefreshCw } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import {
  Card, Button, Pill, EmptyState, formatFcfa, formatDate,
} from '@/components/admin/ui'

interface DailyStat { day: string; event: string; hits: number }

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
              <div key={d.day} className="group relative flex-1" title={`${d.day} — ${d.n}`}>
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

export default function StatsTab() {
  const { orders, leads, refresh } = useStore()
  const [stats, setStats] = useState<DailyStat[]>([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setBusy(true)
    await refresh()
    // La vue d'agrégation est publique par conception : elle ne contient que
    // des compteurs par jour, jamais ni IP, ni page vue, ni identifiant.
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/public_daily_stats?select=*&order=day.desc&limit=400`
      const res = await fetch(url, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
        },
        cache: 'no-store',
      })
      if (res.ok) setStats(await res.json())
    } catch {
      /* hors connexion : les chiffres métier restent affichés */
    } finally {
      setBusy(false)
    }
  }, [refresh])

  useEffect(() => { void load() }, [load])

  /* ─────────────────────────── chiffres métier (factuels) ────────────── */

  const paid = orders.filter((o) => o.order_status !== 'cancelled')
  const revenue = paid.reduce((s, o) => s + Number(o.total_amount), 0)
  const average = paid.length ? revenue / paid.length : 0
  const openLeads = leads.filter((l) => l.status === 'new').length

  const byStatus = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders) map.set(o.order_status, (map.get(o.order_status) ?? 0) + 1)
    return Array.from(map.entries())
  }, [orders])

  /* ────────────────────── visites (estimation, pas une vente) ─────────── */

  const visits = useMemo(() => {
    const days = new Map<string, number>()
    for (const s of stats) {
      if (s.event !== 'page_view') continue
      days.set(s.day, (days.get(s.day) ?? 0) + s.hits)
    }
    return Array.from(days.entries())
      .map(([day, n]) => ({ day, n }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-30)
  }, [stats])

  const last7 = visits.slice(-7).reduce((s, d) => s + d.n, 0)
  const prev7 = visits.slice(-14, -7).reduce((s, d) => s + d.n, 0)
  const trend = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null

  const tiles = [
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

      {/* ── chiffres d'affaires ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── visites ── */}
        <Card title="Visites — 30 derniers jours">
          <div className="p-5">
            {visits.length === 0 ? (
              <EmptyState
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
                <BarChart data={visits} label="Pages vues par jour" />
              </>
            )}
          </div>
        </Card>

        {/* ── répartition des commandes ── */}
        <Card title="Commandes par état">
          <div className="p-5">
            {byStatus.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="h-9 w-9" />}
                title="Aucune commande"
                hint="Les commandes passées depuis le site apparaîtront ici."
              />
            ) : (
              <ul className="space-y-3">
                {byStatus.map(([status, n]) => {
                  const pct = orders.length ? Math.round((n / orders.length) * 100) : 0
                  return (
                    <li key={status}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-text-body capitalize">{status}</span>
                        <span className="text-text-muted">{n}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
                        <div className="h-full rounded-full bg-black" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* ── dernières commandes ── */}
      <Card title="Dernières commandes">
        {orders.length === 0 ? (
          <EmptyState title="Rien à afficher" />
        ) : (
          <ul className="divide-y divide-border">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">{o.ref_command}</p>
                  <p className="truncate text-xs text-text-muted">
                    {o.customer_name} · {formatDate(o.created_at)}
                  </p>
                </div>
                <p className="font-semibold">{formatFcfa(o.total_amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}