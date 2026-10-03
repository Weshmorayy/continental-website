'use client'

/**
 * OrdersTab — Commandes clients.
 *
 * Filtrage par état et par paiement, recherche sur la référence, le nom, le
 * téléphone et l'adresse. Le détail s'ouvre dans un panneau : les articles
 * commandés sont dans une colonne `jsonb`, pas dans une table séparée.
 */

import React, { useState, useMemo } from 'react'
import { Search, ShoppingBag, ChevronDown, MessageCircle, Phone, Mail } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Order, OrderStatus, PaymentStatus } from '@/lib/admin-types'
import {
  ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, PAYMENT_METHOD_LABEL,
} from '@/lib/admin-types'
import {
  Card, Button, Select, TextInput, Pill, EmptyState, Th, Td,
  formatFcfa, formatDate, ConfirmDialog,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

const NEXT_STATUS: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']

const whatsappLink = (phone: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, '')}`

export default function OrdersTab({ notify }: { notify: Notify }) {
  const { orders, settings, updateOrderStatus, refresh } = useStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [payment, setPayment] = useState<'all' | PaymentStatus>('all')
  const [open, setOpen] = useState<string | null>(null)
  const [cancelAsk, setCancelAsk] = useState<Order | null>(null)

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.order_status !== status) return false
      if (payment !== 'all' && o.payment_status !== payment) return false
      if (!q) return true
      return (
        o.ref_command.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        (o.customer_address ?? '').toLowerCase().includes(q)
      )
    })
  }, [orders, search, status, payment])

  const change = async (o: Order, patch: Parameters<typeof updateOrderStatus>[1]) => {
    const error = await updateOrderStatus(o.id, patch)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Commande mise à jour.', tone: 'ok' })
  }

  const revenue = shown
    .filter((o) => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0)

  if (orders.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ShoppingBag className="h-9 w-9" />}
          title="Aucune commande pour l'instant"
          hint="Les commandes passées depuis le site apparaîtront ici automatiquement, sans rechargement."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Référence, nom, téléphone, adresse…"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="lg:w-48"
          >
            <option value="all">Tous les états</option>
            {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Select
            value={payment}
            onChange={(e) => setPayment(e.target.value as typeof payment)}
            className="lg:w-44"
          >
            <option value="all">Tous les paiements</option>
            {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <div className="rounded-full bg-bg-secondary px-4 py-2 text-xs font-semibold">
            {shown.length} commande{shown.length > 1 ? 's' : ''} ·{' '}
            {formatFcfa(revenue)}
          </div>
        </div>
      </Card>

      <Card>
        <div className="admin-scroll">
          <table className="admin-table">
            <thead className="border-b border-border">
              <tr>
                <Th>Référence</Th><Th>Client</Th><Th>Articles</Th>
                <Th>Total</Th><Th>État</Th><Th>Paiement</Th><Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((o) => {
                const expanded = open === o.id
                return (
                  <React.Fragment key={o.id}>
                    <tr className={expanded ? 'bg-bg-secondary' : ''}>
                      <Td primary>
                        <p className="font-mono-ref text-xs font-bold">{o.ref_command}</p>
                        <p className="text-xs text-text-muted">{formatDate(o.created_at)}</p>
                      </Td>
                      <Td label="Client">
                        <p className="font-semibold">{o.customer_name}</p>
                        <p className="text-xs text-text-muted">{o.customer_phone}</p>
                      </Td>
                      <Td label="Articles" className="text-text-muted">{o.items.length}</Td>
                      <Td label="Total" className="font-semibold">{formatFcfa(o.total_amount)}</Td>
                      <Td label="État">
                        <Pill tone={o.order_status === 'new' ? 'warn' : o.order_status === 'cancelled' ? 'danger' : 'ok'}>
                          {ORDER_STATUS_LABEL[o.order_status]}
                        </Pill>
                      </Td>
                      <Td label="Paiement">
                        <Pill tone={o.payment_status === 'paid' ? 'ok' : 'neutral'}>
                          {PAYMENT_METHOD_LABEL[o.payment_method] ?? o.payment_method}
                          {' · '}
                          {PAYMENT_STATUS_LABEL[o.payment_status]}
                        </Pill>
                      </Td>
                      <Td label="" className="justify-end">
                        <Button onClick={() => setOpen(expanded ? null : o.id)}>
                          Détail <ChevronDown className={`h-3.5 w-3.5 ${expanded ? 'rotate-180' : ''}`} />
                        </Button>
                      </Td>
                    </tr>

                    {expanded && (
                      <tr className="bg-bg-secondary">
                        <td colSpan={7} className="px-4 py-5">
                          <div className="grid gap-5 lg:grid-cols-2">
                            <div>
                              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                                Articles
                              </h4>
                              <ul className="space-y-2">
                                {o.items.map((it, i) => (
                                  <li key={i} className="flex items-center gap-3 rounded-xl bg-white p-2.5">
                                    {it.image && (
                                      <img src={it.image} alt="" className="h-12 w-12 rounded-lg border border-border bg-white object-contain" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-semibold">{it.name}</p>
                                      <p className="text-xs text-text-muted">
                                        {formatFcfa(it.price)} × {it.quantity}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold">
                                      {formatFcfa(Number(it.price) * it.quantity)}
                                    </p>
                                  </li>
                                ))}
                              </ul>

                              <dl className="mt-4 space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-text-muted">Sous-total</dt>
                                  <dd>{formatFcfa(o.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-text-muted">
                                    Livraison{o.shipping_zone_name ? ` — ${o.shipping_zone_name}` : ''}
                                  </dt>
                                  <dd>{Number(o.shipping_cost) === 0 ? 'Offerte' : formatFcfa(o.shipping_cost)}</dd>
                                </div>
                                <div className="flex justify-between border-t border-border pt-2 font-bold">
                                  <dt>Total</dt>
                                  <dd>{formatFcfa(o.total_amount)}</dd>
                                </div>
                              </dl>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                                  Livraison
                                </h4>
                                <p className="text-sm">{o.customer_address || '—'}</p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="primary"
                                  onClick={() =>
                                    window.open(
                                      whatsappLink(o.customer_phone), '_blank', 'noopener')
                                  }
                                >
                                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                                </Button>
                                <Button onClick={() => window.open(`tel:${o.customer_phone}`)}>
                                  <Phone className="h-3.5 w-3.5" /> Appeler
                                </Button>
                                {o.customer_email && (
                                  <Button onClick={() => window.open(`mailto:${o.customer_email}`)}>
                                    <Mail className="h-3.5 w-3.5" /> E-mail
                                  </Button>
                                )}
                              </div>

                              <div>
                                <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                                  Changer l&apos;état
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {NEXT_STATUS.filter((s) => s !== o.order_status).map((s) => (
                                    <Button
                                      key={s}
                                      variant={s === 'cancelled' ? 'danger' : s === 'delivered' ? 'primary' : 'ghost'}
                                      onClick={() => s === 'cancelled' ? setCancelAsk(o) : change(o, { order_status: s })}
                                    >
                                      {ORDER_STATUS_LABEL[s]}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-2">
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                                  Paiement
                                </label>
                                <Select
                                  value={o.payment_status}
                                  onChange={(e) => change(o, { payment_status: e.target.value as PaymentStatus })}
                                >
                                  {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                  ))}
                                </Select>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {shown.length === 0 && (
          <EmptyState title="Aucune commande ne correspond" hint="Modifiez la recherche ou les filtres." />
        )}
      </Card>

      {cancelAsk && (
        <ConfirmDialog
          title="Annuler cette commande ?"
          message={`La commande ${cancelAsk.ref_command} passera en « Annulée ».`}
          confirmLabel="Annuler la commande"
          danger
          onCancel={() => setCancelAsk(null)}
          onConfirm={async () => {
            const target = cancelAsk
            setCancelAsk(null)
            await change(target, { order_status: 'cancelled' })
          }}
        />
      )}
    </div>
  )
}