'use client'

/**
 * OrdersTab — Commandes clients.
 *
 * ── Ce qui a changé, et pourquoi ──────────────────────────────────────────
 * L'écran était un TABLEAU dont chaque ligne s'ouvrait sur un détail. Sur un
 * téléphone — l'outil réel du vendeur — un tableau à sept colonnes se
 * transforme en sept cartes empilées, et il fallait ouvrir chaque commande
 * pour savoir OÙ livrer et à quel numéro rappeler. Le détail était donc
 * toujours caché au moment où il sert.
 *
 * La forme retenue est celle d'une FICHE PAR COMMANDE : tout ce qu'il faut
 * pour traiter une livraison est visible sans un clic — le nom, le numéro
 * appelable, l'adresse, la zone, le total et les articles. C'est le format
 * qui tient sur un écran de téléphone, et c'est celui du portail MG Perfume,
 * dont ce module reprend la logique.
 *
 * Trois choses ont été ajoutées, qui manquaient :
 *
 *   1. Un BANDEAU DE CHIFFRES (à traiter, chiffre d'affaires, encaissé). Sans
 *      lui, il fallait compter les lignes pour savoir s'il restait du travail.
 *   2. Un message WhatsApp PRÉ-REMPLI qui suit l'état de la commande. Le
 *      bouton ouvrait une conversation vide : le vendeur réécrivait le même
 *      texte à chaque commande.
 *   3. Les NOTES du client, qui étaient enregistrées à la commande et
 *      affichées nulle part.
 */

import React, { useState, useMemo } from 'react'
import {
  Search, ShoppingBag, MessageCircle, Phone, MapPin, User,
  Copy, StickyNote, Clock, Wallet, ChevronDown, X, Check,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Order, OrderStatus, PaymentStatus } from '@/lib/admin-types'
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/lib/admin-types'
import { paymentLabel } from '@/lib/payments'
import { waHrefFor, buildStatusMessage } from '@/lib/whatsapp'
import {
  Card, Button, Select, TextInput, TextArea, Pill, EmptyState,
  Modal, Field, formatFcfa, formatDate,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

type Tone = 'neutral' | 'dark' | 'warn' | 'ok' | 'danger'

/** Ce qu'on peut modifier sur une commande. Même forme que le contexte. */
type OrderPatch = {
  order_status?: OrderStatus
  payment_status?: PaymentStatus
  notes?: string | null
}

/** Applique une modification, puis confirme par un message. */
type ApplyChange = (o: Order, patch: OrderPatch, done: string) => void

/**
 * Classes écrites en LITTÉRAL.
 *
 * Tailwind lit le source, pas le résultat : une clé construite par
 * interpolation (`pill-${tone}`) produit bien la bonne chaîne à l'exécution,
 * mais le scanner ne peut rien en déduire et purge la règle. C'est ce qui
 * avait laissé toutes les pastilles de statut sans couleur.
 */
const STATUS_TONE: Record<OrderStatus, Tone> = {
  new: 'warn',
  confirmed: 'neutral',
  preparing: 'dark',
  shipped: 'dark',
  delivered: 'ok',
  cancelled: 'danger',
}

/**
 * Une commande est « à traiter » tant qu'elle n'est ni livrée ni annulée.
 * C'est la définition qui compte pour le vendeur : ce qui reste à faire.
 */
const OPEN_STATUSES: OrderStatus[] = ['new', 'confirmed', 'preparing', 'shipped']

/** Les états proposés au changement, dans l'ordre du parcours réel. */
const NEXT_STATUS: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']

export default function OrdersTab({ notify }: { notify: Notify }) {
  const { orders, updateOrderStatus, refresh } = useStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [payment, setPayment] = useState<'all' | PaymentStatus>('all')
  const [openOnly, setOpenOnly] = useState(false)
  const [limit, setLimit] = useState(20)
  const [noteFor, setNoteFor] = useState<Order | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  /* ── chiffres du bandeau ───────────────────────────────────────────────── */

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.order_status !== 'cancelled')
    return {
      total: orders.length,
      open: orders.filter((o) => OPEN_STATUSES.includes(o.order_status)).length,
      revenue: live.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
      collected: live
        .filter((o) => o.payment_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
    }
  }, [orders])

  /* ── filtrage ──────────────────────────────────────────────────────────── */

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.order_status !== status) return false
      if (payment !== 'all' && o.payment_status !== payment) return false
      if (openOnly && !OPEN_STATUSES.includes(o.order_status)) return false
      if (!q) return true
      return (
        o.ref_command.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        (o.customer_address ?? '').toLowerCase().includes(q) ||
        // Les noms d'articles étaient absents de la recherche : le vendeur
        // cherchait « ventilateur mural » et ne trouvait rien, alors que la
        // commande était bien là.
        o.items.some((it) => it.name.toLowerCase().includes(q))
      )
    })
  }, [orders, search, status, payment, openOnly])

  const visible = shown.slice(0, limit)
  const filteredRevenue = shown
    .filter((o) => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

  /* ── actions ───────────────────────────────────────────────────────────── */

  const change: ApplyChange = async (o, patch, done) => {
    setBusyId(o.id)
    const error = await updateOrderStatus(o.id, patch)
    setBusyId(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: done, tone: 'ok' })
  }

  const copyRef = async (o: Order) => {
    try {
      await navigator.clipboard.writeText(o.ref_command)
      notify({ message: `Référence ${o.ref_command} copiée.`, tone: 'ok' })
    } catch {
      // Le presse-papiers est refusé hors HTTPS et dans certains navigateurs.
      // Le dire vaut mieux que de laisser croire que c'est copié.
      notify({ message: 'Copie impossible : sélectionnez la référence à la main.', tone: 'error' })
    }
  }

  /* ── aucun commande du tout ────────────────────────────────────────────── */

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
      {/* ── bandeau de chiffres ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Commandes"
          value={String(stats.total)}
          hint="Depuis le lancement"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <Stat
          label="À traiter"
          value={String(stats.open)}
          hint="Ni livrées ni annulées"
          icon={<Clock className="h-4 w-4" />}
          strong={stats.open > 0}
        />
        <Stat
          label="Chiffre d'affaires"
          value={formatFcfa(stats.revenue)}
          hint="Hors commandes annulées"
          icon={<Wallet className="h-4 w-4" />}
        />
        <Stat
          label="Encaissé"
          value={formatFcfa(stats.collected)}
          hint="Commandes marquées payées"
          icon={<Check className="h-4 w-4" />}
        />
      </div>

      {/* ── filtres ── */}
      <Card>
        <div className="space-y-3 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Référence, client, téléphone, article…"
              className="pl-9 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Effacer la recherche"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              aria-label="Filtrer par état"
              className="sm:w-52"
            >
              <option value="all">Tous les états</option>
              {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>

            <Select
              value={payment}
              onChange={(e) => setPayment(e.target.value as typeof payment)}
              aria-label="Filtrer par règlement"
              className="sm:w-48"
            >
              <option value="all">Tous les règlements</option>
              {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>

            {/* Un seul geste pour la question quotidienne : « qu'est-ce qui
                reste à faire ? ». Un filtre par état obligeait à en choisir
                un, alors que le travail en cours en couvre quatre. */}
            <button
              type="button"
              onClick={() => setOpenOnly((v) => !v)}
              aria-pressed={openOnly}
              className={`admin-btn shrink-0 ${openOnly ? 'admin-btn-primary' : ''}`}
            >
              À traiter seulement
              {openOnly && <X className="h-3.5 w-3.5" />}
            </button>

            <p className="text-xs text-text-muted sm:ml-auto">
              {shown.length} commande{shown.length > 1 ? 's' : ''} · {formatFcfa(filteredRevenue)}
            </p>
          </div>
        </div>
      </Card>

      {/* ── fiches ── */}
      {shown.length === 0 ? (
        <Card>
          <EmptyState
            title="Aucune commande ne correspond"
            hint="Modifiez la recherche ou les filtres."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              busy={busyId === o.id}
              onChange={change}
              onCopy={copyRef}
              onEditNote={() => { setNoteFor(o); setNoteDraft(o.notes ?? '') }}
            />
          ))}

          {shown.length > visible.length && (
            <Button className="w-full" onClick={() => setLimit((n) => n + 20)}>
              Voir les {Math.min(20, shown.length - visible.length)} commandes suivantes
            </Button>
          )}
        </div>
      )}

      {/* ── note interne ── */}
      {noteFor && (
        <Modal
          size="md"
          labelledBy="note-titre"
          title="Note sur cette commande"
          subtitle={`${noteFor.ref_command} — ${noteFor.customer_name}`}
          onClose={() => setNoteFor(null)}
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => setNoteFor(null)}>Annuler</Button>
              <Button
                variant="primary"
                onClick={async () => {
                  const target = noteFor
                  setNoteFor(null)
                  await change(
                    target,
                    { notes: noteDraft.trim() || null },
                    'Note enregistrée.',
                  )
                }}
              >
                Enregistrer la note
              </Button>
            </div>
          }
        >
          <Field
            label="Note"
            hint="Visible dans l'administration seulement — jamais sur le site."
          >
            <TextArea
              rows={4}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Le client préfère être appelé après 18h…"
            />
          </Field>
        </Modal>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────── sous-vues ── */

/**
 * Une tuile de chiffre.
 *
 * `strong` met la tuile en évidence quand le chiffre demande une action :
 * « à traiter » à zéro n'a pas à crier, à douze il le doit.
 */
function Stat({
  label, value, hint, icon, strong = false,
}: {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
  strong?: boolean
}) {
  return (
    <div className={`panel p-4 ${strong ? 'border-amber-300 bg-amber-50' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="admin-label">{label}</span>
        <span className={strong ? 'text-amber-600' : 'text-text-muted'}>{icon}</span>
      </div>
      <p className="display-md mt-2 text-lg sm:text-xl">{value}</p>
      <p className="mt-0.5 text-[0.68rem] text-text-muted">{hint}</p>
    </div>
  )
}

/**
 * Une commande, en une fiche.
 *
 * L'ordre de lecture suit le geste du vendeur : qui appeler, où livrer,
 * quoi livrer, combien. Les actions sont en bas, atteignables au pouce.
 */
function OrderCard({
  order, busy, onChange, onCopy, onEditNote,
}: {
  order: Order
  busy: boolean
  onChange: ApplyChange
  onCopy: (o: Order) => void
  onEditNote: () => void
}) {
  const [showItems, setShowItems] = useState(false)
  const itemCount = order.items.reduce((s, i) => s + (i.quantity || 1), 0)

  /*
   * Le message suit l'ÉTAT de la commande : après avoir basculé en
   * « Expédiée », le bouton propose l'annonce d'expédition. C'est l'ordre
   * naturel — on change l'état, puis on prévient.
   */
  const waMessage = buildStatusMessage(order, order.order_status)
  const waHref = waHrefFor(order.customer_phone, waMessage)

  const isNew = order.order_status === 'new'

  return (
    <article className={`panel overflow-hidden ${isNew ? 'border-amber-300' : ''}`}>
      {/* filet d'alerte : une commande neuve se repère sans lire */}
      {isNew && <div className="h-1 w-full bg-amber-400" aria-hidden="true" />}

      {/* ── en-tête ── */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono-ref text-sm font-bold">{order.ref_command}</span>
          <button
            type="button"
            onClick={() => onCopy(order)}
            aria-label={`Copier la référence ${order.ref_command}`}
            className="rounded-full p-1 text-text-muted transition-colors hover:text-text-primary"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <span className="truncate text-xs text-text-muted">{formatDate(order.created_at)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Pill tone={STATUS_TONE[order.order_status]}>
            {ORDER_STATUS_LABEL[order.order_status]}
          </Pill>
          <Pill tone={order.payment_status === 'paid' ? 'ok' : 'neutral'}>
            {paymentLabel(order.payment_method)} · {PAYMENT_STATUS_LABEL[order.payment_status]}
          </Pill>
        </div>
      </header>

      <div className="space-y-4 p-4">
        {/* ── client et montants ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <User className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              {order.customer_name}
            </p>
            <p className="flex items-center gap-2 text-text-body">
              <Phone className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              <a href={`tel:${order.customer_phone}`} className="font-medium hover:underline">
                {order.customer_phone}
              </a>
            </p>
            <p className="flex items-start gap-2 text-text-body">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
              <span>{order.customer_address || order.shipping_zone_name || 'Adresse à confirmer'}</span>
            </p>
          </div>

          <dl className="space-y-1 text-sm sm:text-right">
            <div className="flex justify-between sm:justify-end sm:gap-3">
              <dt className="text-text-muted">Sous-total</dt>
              <dd>{formatFcfa(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-3">
              <dt className="text-text-muted">
                Livraison{order.shipping_zone_name ? ` — ${order.shipping_zone_name}` : ''}
              </dt>
              <dd>{Number(order.shipping_cost) > 0 ? formatFcfa(order.shipping_cost) : 'Offerte'}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 font-bold sm:justify-end sm:gap-3">
              <dt>Total</dt>
              <dd>{formatFcfa(order.total_amount)}</dd>
            </div>
          </dl>
        </div>

        {/* ── articles ── */}
        <div className="rounded-2xl bg-bg-secondary p-3">
          <button
            type="button"
            onClick={() => setShowItems((v) => !v)}
            aria-expanded={showItems}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="admin-label">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-text-muted transition-transform ${showItems ? 'rotate-180' : ''}`}
            />
          </button>

          {showItems && (
            <ul className="mt-3 space-y-2">
              {order.items.map((it, i) => (
                <li key={`${it.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-white p-2">
                  {it.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={it.image}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg border border-border bg-white object-contain"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-text-muted">
                      {formatFcfa(it.price)} × {it.quantity}
                      {it.ref ? ` · Réf. ${it.ref}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {formatFcfa(Number(it.price) * it.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── note du client ── */}
        {order.notes && (
          <p className="flex items-start gap-2 rounded-2xl border border-border px-3 py-2.5 text-sm text-text-body">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span>{order.notes}</span>
          </p>
        )}
      </div>

      {/* ── actions ── */}
      <footer className="flex flex-col gap-2 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor={`statut-${order.id}`} className="admin-label shrink-0">
            État
          </label>
          <Select
            id={`statut-${order.id}`}
            value={order.order_status}
            disabled={busy}
            onChange={(e) => {
              const next = e.target.value as OrderStatus
              void onChange(order, { order_status: next }, `Commande ${order.ref_command} : ${ORDER_STATUS_LABEL[next].toLowerCase()}.`)
            }}
            className="sm:w-44"
          >
            {/* L'état courant est dans la liste : sans lui, le menu
                s'ouvrirait sur un autre choix que ce qui est affiché. */}
            {[order.order_status, ...NEXT_STATUS.filter((s) => s !== order.order_status)].map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
            ))}
          </Select>

          <Select
            value={order.payment_status}
            disabled={busy}
            aria-label={`Règlement de ${order.ref_command}`}
            onChange={(e) => {
              const next = e.target.value as PaymentStatus
              void onChange(order, { payment_status: next }, `Règlement : ${PAYMENT_STATUS_LABEL[next].toLowerCase()}.`)
            }}
            className="sm:w-36"
          >
            {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onEditNote}>
            <StickyNote className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Note</span>
          </Button>
          <Button onClick={() => window.open(`tel:${order.customer_phone}`)}>
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Appeler</span>
          </Button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa justify-center px-4 py-2 text-xs"
            title={waMessage}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Prévenir
          </a>
        </div>
      </footer>
    </article>
  )
}
