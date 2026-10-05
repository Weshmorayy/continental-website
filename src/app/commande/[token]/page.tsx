import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, MessageCircle, Package, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/atelier'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/**
 * Page de confirmation.
 *
 * La commande est relue par `get_order_by_token()`, une fonction publique qui
 * ne renvoie QUE ce qu'un client a le droit de savoir de sa propre commande :
 * ni adresse, ni e-mail, ni téléphone du vendeur, ni notes internes. Le jeton
 * est un UUID : le deviner est hors de portée, et aucune liste de commandes
 * n'est énumérable.
 *
 * La page est `noIndex` : une URL de confirmation n'a rien à faire dans un
 * moteur de recherche, et un jeton dans un lien indexé est un jeton publié.
 */

export const metadata: Metadata = {
  title: 'Commande enregistrée',
  robots: { index: false, follow: false },
}

interface Row {
  ref_command: string
  customer_name: string
  customer_phone: string
  order_status: string
  payment_status: string
  payment_method: string
  subtotal: number
  shipping_cost: number
  total_amount: number
  shipping_zone_name: string | null
  items: { name: string; ref?: string | null; price: number; quantity: number }[]
  created_at: string
}

const fcfa = (n: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(Number(n))).replace(/ /g, ' ')} FCFA`

const STATUS: Record<string, string> = {
  new: 'Reçue',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const PAYMENT: Record<string, string> = {
  pending: 'En attente de règlement',
  paid: 'Réglée',
  failed: 'Règlement refusé',
  refunded: 'Remboursée',
}

export default async function CommandePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const cfg = await getSiteSettings()

  if (!supabase) {
    return <Shell>La base de données n'est pas configurée.</Shell>
  }

  const { data, error } = await supabase.rpc('get_order_by_token', { p_token: token })
  const row = (Array.isArray(data) ? data[0] : null) as Row | null

  if (error || !row) {
    return (
      <Shell>
        <h1 className="display-lg text-text-primary">Commande introuvable</h1>
        <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-text-muted">
          Ce lien n&apos;existe pas ou a expiré. Si vous venez de commander,
          contactez-nous : nous retrouverons la commande avec votre nom et votre
          numéro.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/catalogue" className="btn-outline px-6 py-3 text-sm">Voir le catalogue</Link>
          <a href={`https://wa.me/${cfg.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-wa px-6 py-3 text-sm">
            <MessageCircle size={16} /> Nous contacter
          </a>
        </div>
      </Shell>
    )
  }

  const items = Array.isArray(row.items) ? row.items : []
  const waUrl = buildWhatsAppUrl(
    `Bonjour Continental, je référence ma commande ${row.ref_command}.`,
    cfg,
  )

  return (
    <div className="container-site py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 size={44} strokeWidth={1.2} className="text-text-primary" aria-hidden="true" />
          <h1 className="display-lg mt-6 text-text-primary">Commande enregistrée</h1>
          <p className="mt-3 text-sm text-text-muted">
            Merci {row.customer_name.split(' ')[0]}. Nous vous rappelons au{' '}
            {row.customer_phone} pour confirmer la livraison.
          </p>

          <p className="product-ref mt-6 rounded-full border border-border px-5 py-2 text-base text-text-primary">
            {row.ref_command}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-bg-secondary px-3.5 py-1.5 text-xs text-text-body">
              {STATUS[row.order_status] ?? row.order_status}
            </span>
            <span className="rounded-full bg-bg-secondary px-3.5 py-1.5 text-xs text-text-body">
              {PAYMENT[row.payment_status] ?? row.payment_status}
            </span>
            {row.shipping_zone_name && (
              <span className="rounded-full bg-bg-secondary px-3.5 py-1.5 text-xs text-text-body">
                {row.shipping_zone_name}
              </span>
            )}
          </div>
        </div>

        <ul className="mt-12 divide-y divide-border border-y border-border">
          {items.map((it, i) => (
            <li key={`${it.name}-${i}`} className="flex items-baseline justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{it.name}</p>
                {it.ref && <p className="product-ref mt-0.5 text-text-muted">Réf. {it.ref}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold">{fcfa(it.price * it.quantity)}</p>
                <p className="text-xs text-text-muted">× {it.quantity}</p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Sous-total</dt>
            <dd>{fcfa(row.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Livraison</dt>
            <dd>{Number(row.shipping_cost) > 0 ? fcfa(row.shipping_cost) : 'Offerte'}</dd>
          </div>
          <div className="hairline flex items-baseline justify-between pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="price-tag text-xl">{fcfa(row.total_amount)}</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa justify-center px-6 py-3 text-sm">
            <MessageCircle size={16} /> Suivre sur WhatsApp
          </a>
          <Link href="/catalogue" className="btn-outline justify-center px-6 py-3 text-sm">
            Poursuivre mes achats
          </Link>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-text-muted">
          <Package size={14} aria-hidden="true" />
          Conservez ce lien : il vous permet de retrouver votre commande.
        </p>
      </div>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-site py-20 sm:py-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        {children}
      </div>
    </div>
  )
}