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
 * Quatre choses ont été ajoutées, qui manquaient :
 *
 *   1. Un BANDEAU DE CHIFFRES (total, à traiter, chiffre d'affaires, panier
 *      moyen). Sans lui, il fallait compter les lignes pour savoir s'il
 *      restait du travail.
 *   2. Un message WhatsApp PRÉ-REMPLI qui suit l'état de la commande. Le
 *      bouton ouvrait une conversation vide : le vendeur réécrivait le même
 *      texte à chaque commande.
 *   3. Les NOTES du client, qui étaient enregistrées à la commande et
 *      affichées nulle part.
 *   4. Des ONGLETS D'ARCHIVE. Livrée et Annulée ne sont plus mêlées au travail
 *      en cours : le flux principal ne montre que ce qui reste à faire, le
 *      reste va dans son onglet. C'est le découpage du portail MG Perfume, mot
 *      pour mot, pour que le vendeur n'ait qu'un réflexe à apprendre.
 *
 * ── Une seule liste d'états pour les deux boutiques ───────────────────────
 * Les cinq états (Nouvelle, En préparation, En livraison, Livrée, Annulée)
 * viennent de `admin-types.ts` et sont communs à Continental et MG Perfume.
 * La fusion de « Confirmée » et « En préparation » en « processing » a été
 * faite des deux côtés en même temps : voir
 * supabase/migrations/20261017_unification_statuts_commandes.sql.
 */

import React, { useState, useMemo } from 'react'
import {
  Search, ShoppingBag, MessageCircle, Phone, MapPin, User,
  Copy, StickyNote, Clock, Wallet, ChevronDown, X, Calculator, Eye, Trash2,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Order, OrderItem, OrderStatus, PaymentStatus } from '@/lib/admin-types'
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/lib/admin-types'
import { supabase } from '@/lib/supabase'
import { isTestOrder } from '@/lib/testOrder'
import { paymentLabel } from '@/lib/payments'
import { waHrefFor, buildStatusMessage } from '@/lib/whatsapp'
import {
  Card, Button, Select, TextInput, TextArea, Pill, EmptyState,
  Modal, Field, ConfirmDialog, formatFcfa, formatDate,
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
  processing: 'dark',
  shipped: 'dark',
  delivered: 'ok',
  cancelled: 'danger',
}

/**
 * Une commande est « à traiter » tant qu'elle n'est ni livrée ni annulée.
 * C'est la définition qui compte pour le vendeur : ce qui reste à faire.
 *
 * Elle sert à deux endroits — la tuile du bandeau et l'onglet par défaut — et
 * n'est écrite qu'ici : les deux ne peuvent pas diverger.
 */
const OPEN_STATUSES: OrderStatus[] = ['new', 'processing', 'shipped']

/** Les états proposés au changement, dans l'ordre du parcours réel. */
const NEXT_STATUS: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled']

/**
 * Les onglets d'archive.
 *
 * ── Pourquoi « à traiter » est le premier et le défaut ────────────────────
 * Une commande livrée ou annulée n'appelle plus aucun geste. La laisser dans
 * la liste revient à demander au vendeur de la relire chaque matin pour
 * vérifier qu'elle n'attend rien. L'écran ouvre donc sur le travail réel, et
 * l'historique reste à un clic, dans son onglet.
 */
type ArchiveTab = 'open' | 'delivered' | 'cancelled' | 'all'

const ARCHIVE_TABS: { key: ArchiveTab; label: string; hint: string }[] = [
  { key: 'open', label: 'À traiter', hint: 'Ni livrées ni annulées' },
  { key: 'delivered', label: 'Livrées', hint: 'Livraisons terminées' },
  { key: 'cancelled', label: 'Annulées', hint: 'Commandes annulées' },
  { key: 'all', label: 'Toutes', hint: 'Tout l’historique' },
]

/** Une commande appartient-elle à cet onglet ? Une règle, deux usages. */
function inArchiveTab(status: OrderStatus, tab: ArchiveTab): boolean {
  if (tab === 'all') return true
  if (tab === 'open') return OPEN_STATUSES.includes(status)
  return status === tab
}

/**
 * Efface une commande de la base, et l'inscrit au journal.
 *
 * ── Pourquoi ces deux gestes sont écrits ici ──────────────────────────────
 * `useStore()` n'expose que des `deleteX()` dédiés aux autres tables, plus
 * jamais `mutate()` ni `audit()` : le magasin n'a pas de `deleteOrder`, et il
 * n'en fallait pas — la suppression d'une commande n'est pas une opération
 * ordinaire, c'est une exception réservée aux essais. La garder dans ce
 * module, à côté de la seule règle qui l'autorise, évite qu'un futur écran
 * l'appelle sans avoir posé la question « est-ce un test ? ».
 *
 * Les deux appels reprennent mot pour mot la convention du magasin :
 * `Prefer: return=representation`, puis vérification qu'une ligne a bien été
 * touchée — sans quoi une suppression refusée en silence (RLS) passerait
 * pour un succès.
 */
async function deleteOrderRow(id: string): Promise<string | null> {
  if (!supabase) return 'Base non configurée.'

  const result = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
    .setHeader('Prefer', 'return=representation')

  if (result.error) return `Suppression refusée : ${result.error.message}`
  if ((result.data ?? []).length === 0) {
    return 'Suppression refusée : commande introuvable ou accès non autorisé.'
  }
  return null
}

/**
 * Journalise la suppression via `log_event()`, comme le fait le magasin.
 *
 * Volontairement non bloquante : un journal en panne ne doit pas faire croire
 * à une suppression ratée, alors que la ligne, elle, est bien partie.
 */
async function auditOrderDelete(id: string, label: string | null) {
  if (!supabase) return
  const { error } = await supabase.rpc('log_event', {
    p_action: 'delete',
    p_entity: 'orders',
    p_entity_id: id,
    p_label: label,
  })
  if (error) console.error('[Continental] journalisation impossible :', error.message)
}

export default function OrdersTab({ notify }: { notify: Notify }) {
  const { orders, updateOrderStatus, refresh } = useStore()

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<ArchiveTab>('open')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [payment, setPayment] = useState<'all' | PaymentStatus>('all')
  const [limit, setLimit] = useState(20)
  const [noteFor, setNoteFor] = useState<Order | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  /* ── chiffres du bandeau, et compteurs des onglets ─────────────────────── */

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.order_status !== 'cancelled')
    const revenue = live.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
    return {
      total: orders.length,
      open: orders.filter((o) => OPEN_STATUSES.includes(o.order_status)).length,
      delivered: orders.filter((o) => o.order_status === 'delivered').length,
      cancelled: orders.filter((o) => o.order_status === 'cancelled').length,
      revenue,
      /*
       * Panier moyen. Il remplace l'ancien « Encaissé » : le montant encaissé
       * se lisait déjà commande par commande dans la pastille de règlement, et
       * il restait à zéro tant que le vendeur n'avait pas coché « payée ». Le
       * panier moyen, lui, ne se lit nulle part ailleurs — et il bouge, ce qui
       * en fait un chiffre qu'on regarde.
       */
      average: live.length ? revenue / live.length : 0,
    }
  }, [orders])

  /* ── filtrage ──────────────────────────────────────────────────────────── */

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (!inArchiveTab(o.order_status, tab)) return false
      if (status !== 'all' && o.order_status !== status) return false
      if (payment !== 'all' && o.payment_status !== payment) return false
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
  }, [orders, search, tab, status, payment])

  const visible = shown.slice(0, limit)
  const filteredRevenue = shown
    .filter((o) => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

  /**
   * L'écran est-il vide à cause de l'onglet, et non d'une recherche ?
   *
   * La distinction n'est pas cosmétique : répondre « aucune commande ne
   * correspond » alors que le vendeur vient de ranger sa journée lui ferait
   * croire à une perte de données. Ici, on lui dit où sont passées ses
   * commandes.
   */
  const emptyBecauseOfTab =
    shown.length === 0 && tab !== 'all' && !search.trim() && status === 'all' && payment === 'all'

  /* ── actions ───────────────────────────────────────────────────────────── */

  const change: ApplyChange = async (o, patch, done) => {
    setBusyId(o.id)
    const error = await updateOrderStatus(o.id, patch)
    setBusyId(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: done, tone: 'ok' })
  }

  /**
   * Supprime une commande « test ».
   *
   * Le garde-fou est ICI, dans la fonction, et pas seulement dans
   * l'affichage : même appelée par erreur depuis un futur bouton, elle refuse
   * toute commande qui n'est pas un test. Il n'existe aucune variable
   * « forcer » — supprimer une vraie commande est impossible, pas seulement
   * déconseillé.
   */
  const removeTestOrder = async (o: Order) => {
    if (!isTestOrder(o)) {
      notify({ message: 'Suppression refusée : ce n’est pas une commande test.', tone: 'error' })
      return
    }

    setBusyId(o.id)
    const error = await deleteOrderRow(o.id)
    if (error) {
      setBusyId(null)
      notify({ message: error, tone: 'error' })
      return
    }

    await auditOrderDelete(o.id, o.ref_command)
    await refresh()
    setBusyId(null)
    notify({ message: `Commande test ${o.ref_command} supprimée.`, tone: 'ok' })
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

  /* ── aucune commande du tout ───────────────────────────────────────────── */

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
          label="Panier moyen"
          value={formatFcfa(stats.average)}
          hint="Chiffre d'affaires ÷ commandes"
          icon={<Calculator className="h-4 w-4" />}
        />
      </div>

      {/* ── filtres ── */}
      <Card>
        <div className="space-y-3 p-4">
          {/* ── onglets d'archive ──
              La rangée défile horizontalement plutôt que de passer à la ligne :
              sur un téléphone, quatre onglets empilés repousseraient la
              première commande sous la ligne de flottaison. */}
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            role="group"
            aria-label="Ranger les commandes par état"
          >
            {ARCHIVE_TABS.map((t) => {
              const active = tab === t.key
              const count =
                t.key === 'open' ? stats.open
                  : t.key === 'delivered' ? stats.delivered
                    : t.key === 'cancelled' ? stats.cancelled
                      : stats.total
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  aria-pressed={active}
                  title={t.hint}
                  className={`admin-btn shrink-0 ${active ? 'admin-btn-primary' : ''}`}
                >
                  {t.label}
                  <span className={active ? 'opacity-75' : 'text-text-muted'}>{count}</span>
                </button>
              )
            })}
          </div>

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
              onChange={(e) => {
                const next = e.target.value as typeof status
                setStatus(next)
                /*
                 * Affiner par état ne doit jamais se heurter à l'onglet.
                 * Choisir « Livrée » alors qu'on est dans « À traiter »
                 * donnerait une liste vide sans que rien ne l'explique : on
                 * bascule donc sur « Toutes », seul onglet qui contient cet
                 * état. L'onglet suit le choix, il ne le contredit pas.
                 */
                if (next !== 'all' && !inArchiveTab(next as OrderStatus, tab)) setTab('all')
              }}
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
            title={emptyBecauseOfTab ? 'Rien à traiter' : 'Aucune commande ne correspond'}
            hint={
              emptyBecauseOfTab
                ? 'Les commandes livrées et annulées sont rangées dans leurs onglets — c’est voulu : le travail en cours reste seul à l’écran.'
                : 'Modifiez la recherche ou les filtres.'
            }
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
              onDelete={removeTestOrder}
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
  order, busy, onChange, onDelete, onCopy, onEditNote,
}: {
  order: Order
  busy: boolean
  onChange: ApplyChange
  onDelete: (o: Order) => void
  onCopy: (o: Order) => void
  onEditNote: () => void
}) {
  const [showItems, setShowItems] = useState(false)
  const [askDelete, setAskDelete] = useState(false)
  /* L'article ouvert en grand. `null` = aucune fenêtre ouverte. */
  const [preview, setPreview] = useState<OrderItem | null>(null)
  const itemCount = order.items.reduce((s, i) => s + (i.quantity || 1), 0)

  /*
   * Le mot « test » est cherché UNE fois pour toute la fiche : la pastille et
   * le bouton doivent répondre la même chose, y compris quand le nom contient
   * un accent. Deux appels séparés finiraient par diverger.
   */
  const testOrder = isTestOrder(order)

  /*
   * Le message suit l'ÉTAT de la commande : après avoir basculé en
   * « En livraison », le bouton propose l'annonce d'expédition. C'est l'ordre
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
          {/* Grosseur volontairement discrète : cette pastille n'est pas un
              état de la commande, c'est la raison pour laquelle la ligne peut
              être supprimée. Le vendeur qui cherche pourquoi doit la trouver ;
              celui qui traite une vraie commande ne doit pas la voir. */}
          {testOrder && <Pill tone="neutral">Test</Pill>}
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

        {/* ── articles ──
            Chaque ligne est un BOUTON. Le nom d'un article dépasse souvent la
            largeur d'un téléphone (« Ventilateur sur pied 16 pouces… ») et
            finissait coupé : le vendeur ne pouvait pas dire lequel des trois
            ventilateurs était commandé. La fenêtre d'aperçu montre le nom
            entier, le visuel en grand, le prix unitaire et la quantité. */}
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
                <li key={`${it.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setPreview(it)}
                    className="flex w-full items-center gap-3 rounded-xl bg-white p-2 text-left transition-colors hover:bg-bg-tertiary"
                  >
                    {it.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={it.image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg border border-border bg-white object-contain"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      {/* `title` en secours : au survol, le nom entier reste
                          lisible même là où la ligne coupe encore. */}
                      <p className="truncate text-sm font-medium" title={it.name}>{it.name}</p>
                      <p className="text-xs text-text-muted">
                        {formatFcfa(it.price)} × {it.quantity}
                        {it.ref ? ` · Réf. ${it.ref}` : ''}
                      </p>
                    </div>
                    <Eye className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                    <p className="shrink-0 text-sm font-semibold">
                      {formatFcfa(Number(it.price) * it.quantity)}
                    </p>
                  </button>
                </li>
              ))}
              <li className="pt-1 text-center text-[0.68rem] text-text-muted">
                Touchez un article pour l’afficher en entier.
              </li>
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

          {/* Le règlement n'est plus modifiable ici : le client paie en
              espèces ou par Wave à la livraison, et le vendeur n'a rien à
              trancher entre « en attente » et « payée » — la pastille de la
              fiche suffit à lire où on en est. Deux menus côte à côte
              invitaient surtout à changer le mauvais. */}
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

          {/* Suppression offerte UNIQUEMENT sur les commandes de test. Le
              bouton n'apparaît pas ailleurs, et `removeTestOrder` revérifie
              la règle de son côté : il n'y a donc aucun chemin, même en
              modifiant la page dans le navigateur, qui mène à la disparition
              d'une commande de client. */}
          {testOrder && (
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => setAskDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Supprimer</span>
            </Button>
          )}
        </div>
      </footer>

      {askDelete && (
        <ConfirmDialog
          title="Supprimer cette commande test ?"
          danger
          confirmLabel="Supprimer"
          message={
            <>
              La commande <strong>{order.ref_command}</strong> de{' '}
              <strong>{order.customer_name}</strong> a été passée pour un test.
              Sa suppression est définitive : elle quitte la liste avec ses
              articles et son total, et rien ne permet de la retrouver.
              Les commandes des vrais clients, elles, ne peuvent pas être
              supprimées.
            </>
          }
          onCancel={() => setAskDelete(false)}
          onConfirm={() => {
            setAskDelete(false)
            onDelete(order)
          }}
        />
      )}

      {/* ── aperçu d'un article ── */}
      {preview && (
        <Modal
          size="md"
          labelledBy="apercu-article"
          title="Article commandé"
          subtitle={`${order.ref_command} — ${order.customer_name}`}
          onClose={() => setPreview(null)}
          footer={
            <div className="flex justify-end">
              <Button onClick={() => setPreview(null)}>Fermer</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex min-h-32 items-center justify-center rounded-2xl bg-bg-secondary p-4">
              {preview.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={preview.image}
                  alt={preview.name}
                  className="h-32 w-32 rounded-xl border border-border bg-white object-contain"
                />
              ) : (
                <span className="text-xs text-text-muted">Aucun visuel pour cet article</span>
              )}
            </div>

            <div>
              {/* Aucune troncature ici : c'est tout l'intérêt de la fenêtre. */}
              <p className="text-base font-semibold leading-snug">{preview.name}</p>
              {preview.ref && (
                <p className="font-mono-ref mt-1 text-xs text-text-muted">Réf. {preview.ref}</p>
              )}
            </div>

            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Prix unitaire</dt>
                <dd>{formatFcfa(preview.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Quantité</dt>
                <dd>{preview.quantity}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                <dt>Total de la ligne</dt>
                <dd>{formatFcfa(Number(preview.price) * preview.quantity)}</dd>
              </div>
            </dl>
          </div>
        </Modal>
      )}
    </article>
  )
}
