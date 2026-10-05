'use client'

/**
 * CartPageClient — La page « Panier » : récapitulatif et formulaire.
 *
 * La commande part par `placeOrder()`, qui écrit une ligne dans `orders` puis
 * relit le jeton public. Ce jeton sert ensuite à prouver au client que la
 * commande est bien la sienne, sans compte ni mot de passe.
 *
 * ── Pourquoi le paiement se décide à la dernière étape ────────────────────
 * Le site vend aujourd'hui par WhatsApp, et Paytech.sn n'est pas encore branché.
 * Proposer « payer par carte » avant que la passerelle ne soit configurée
 * produirait des commandes que personne ne pourrait honorer. Le choix du mode
 * de règlement est donc affiché, mais tant que le paiement en ligne n'est pas
 * activé, seul WhatsApp est proposé — et le reste de l'écran n'invente rien.
 */

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Trash2, ArrowRight, MessageCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useCart, type CartLine } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

const fcfa = (n: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/ /g, ' ')} FCFA`

type Errors = Partial<Record<'name' | 'phone' | 'zone', string>>

export default function CartPageClient() {
  const { lines, subtotal, setQuantity, remove, clear } = useCart()
  const { shippingZones, placeOrder } = useStore()
  const router = useRouter()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [fatal, setFatal] = useState<string | null>(null)

  const zones = useMemo(
    () => shippingZones.filter((z) => (z as { is_active?: boolean }).is_active !== false),
    [shippingZones],
  )
  const zone = zones.find((z) => z.id === zoneId) ?? null
  const shipping = Number(zone?.price ?? 0)
  const total = subtotal + shipping

  /* ── validation ────────────────────────────────────────────────────────── */

  /**
   * Les contrôles les plus courts possibles, et seulement ceux qui empêchent
   * réellement de livrer. Le nom et le téléphone sont exigés parce que sans eux
   * la commande n'est pas rappelable ; l'adresse est facultative parce que,
   * pour Dakar Plateau, la zone de livraison suffit.
   */
  function validate(): Errors {
    const e: Errors = {}
    if (!name.trim()) e.name = 'Indiquez votre nom.'

    // Numéro sénégalais : 9 chiffres commençant par 7, avec les séparateurs
    // usuels. On retire tout ce qui n'est pas un chiffre avant de compter.
    const digits = phone.replace(/\D/g, '')
    if (!digits) e.phone = 'Indiquez votre numéro de téléphone.'
    else if (digits.length < 9) e.phone = 'Ce numéro semble incomplet.'

    if (!zoneId) e.zone = 'Choisissez votre zone de livraison.'
    return e
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setFatal(null)

    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      // Le premier champ fautif reçoit le focus : sans cela, l'erreur s'affiche
      // en haut d'un formulaire que le visiteur doit remonter pour trouver.
      document.getElementById(Object.keys(e)[0])?.focus()
      return
    }

    setBusy(true)
    const result = await placeOrder({
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        // `undefined` et non `null` : le type d'entrée distingue les deux, et
        // `placeOrder` fait déjà le `?? null` avant d'écrire en base.
        ...(address.trim() ? { address: address.trim() } : {}),
      },
      shippingZone: zone,
      items: lines.map(toOrderItem),
      paymentMethod: 'whatsapp',
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    })
    setBusy(false)

    if (result.error || !result.token) {
      setFatal(result.error ?? 'Commande enregistrée, mais sa référence est introuvable.')
      return
    }

    clear()
    router.push(`/commande/${result.token}`)
  }

  /* ── aperçu WhatsApp ───────────────────────────────────────────────────── */

  const waUrl = buildWhatsAppUrl(
    lines.length
      ? [
          'Bonjour Continental, je souhaite commander :',
          '',
          ...lines.map((l) => `• ${l.name}${l.ref ? ` (Réf. ${l.ref})` : ''} × ${l.quantity} — ${fcfa(l.price * l.quantity)}`),
          '',
          `Sous-total : ${fcfa(subtotal)}`,
          zone ? `Livraison (${zone.name}) : ${shipping > 0 ? fcfa(shipping) : 'offerte'}` : '',
          `Total : ${fcfa(total)}`,
          name ? `\nAu nom de ${name}` : '',
          phone ? `Téléphone ${phone}` : '',
        ].filter(Boolean).join('\n')
      : "Bonjour Continental, je souhaite commander.",
  )

  /* ── panier vide ───────────────────────────────────────────────────────── */

  if (lines.length === 0) {
    return (
      <div className="container-site py-20 sm:py-28">
        <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
          <h1 className="display-lg text-text-primary">Votre panier est vide</h1>
          <p className="text-sm leading-relaxed text-text-muted">
            Choisissez un appareil dans le catalogue pour commencer votre commande.
          </p>
          <Link href="/catalogue" className="btn-accent px-8 py-3.5 text-sm">
            Voir le catalogue
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-site py-12 sm:py-16">
      <h1 className="display-lg text-text-primary">Votre commande</h1>
      <p className="mt-3 text-sm text-text-muted">
        Vérifiez les articles, choisissez votre zone de livraison, puis validez.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* ── articles ── */}
        <section aria-label="Articles">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((l) => (
              <li key={l.slug} className="flex gap-5 py-6">
                <Link href={`/produit/${l.slug}`} className="stage relative h-24 w-24 flex-shrink-0">
                  {l.image ? (
                    <Image src={l.image} alt={l.name} fill className="object-contain p-2" sizes="96px" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[0.6rem] text-text-muted">
                      Photo à venir
                    </span>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/produit/${l.slug}`} className="text-base font-medium text-text-primary hover:underline">
                    {l.name}
                  </Link>
                  {l.ref && <p className="product-ref mt-1 text-text-muted">Réf. {l.ref}</p>}

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-full border border-border">
                      <button onClick={() => setQuantity(l.slug, l.quantity - 1)}
                        className="p-2 text-text-primary transition-opacity hover:opacity-60"
                        aria-label={`Retirer un ${l.name}`}>
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{l.quantity}</span>
                      <button onClick={() => setQuantity(l.slug, l.quantity + 1)}
                        disabled={l.quantity >= 99}
                        className="p-2 text-text-primary transition-opacity hover:opacity-60 disabled:opacity-30"
                        aria-label={`Ajouter un ${l.name}`}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <button onClick={() => remove(l.slug)}
                      className="flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-primary">
                      <Trash2 size={14} strokeWidth={1.6} />
                      Retirer
                    </button>

                    <p className="ml-auto text-base font-semibold">{fcfa(l.price * l.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── récapitulatif + formulaire ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-6">
            <h2 className="display-sm text-lg text-text-primary">Récapitulatif</h2>

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Sous-total</dt>
                <dd>{fcfa(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Livraison</dt>
                <dd>{zone ? (shipping > 0 ? fcfa(shipping) : 'Offerte') : '—'}</dd>
              </div>
              <div className="hairline flex items-baseline justify-between pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="price-tag text-xl">{fcfa(total)}</dd>
              </div>
            </dl>

            <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="admin-label">Nom et prénom</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'err-name' : undefined}
                  className={`mt-1.5 w-full border-b bg-transparent py-2 text-sm outline-none transition-colors ${errors.name ? 'border-red-600' : 'border-border focus:border-text-primary'}`}
                  placeholder="Awa Diop" />
                {errors.name && <p id="err-name" className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="admin-label">Téléphone</label>
                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel" placeholder="+221 77 000 00 00"
                  aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'err-phone' : undefined}
                  className={`mt-1.5 w-full border-b bg-transparent py-2 text-sm outline-none transition-colors ${errors.phone ? 'border-red-600' : 'border-border focus:border-text-primary'}`} />
                {errors.phone && <p id="err-phone" className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="zone" className="admin-label">Zone de livraison</label>
                <select id="zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}
                  aria-invalid={Boolean(errors.zone)} aria-describedby={errors.zone ? 'err-zone' : undefined}
                  className={`mt-1.5 w-full border-b bg-transparent py-2 text-sm outline-none transition-colors ${errors.zone ? 'border-red-600' : 'border-border focus:border-text-primary'}`}>
                  <option value="">Choisir une zone…</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {Number(z.price) > 0 ? `${fcfa(Number(z.price))} · ${z.delay}` : `Offerte · ${z.delay}`}
                    </option>
                  ))}
                </select>
                {errors.zone && <p id="err-zone" className="mt-1.5 text-xs text-red-600">{errors.zone}</p>}
              </div>

              <div>
                <label htmlFor="address" className="admin-label">
                  Adresse <span className="normal-case tracking-normal text-text-muted">(facultatif)</span>
                </label>
                <input id="address" value={address} onChange={(e) => setAddress(e.target.value)}
                  className="mt-1.5 w-full border-b border-border bg-transparent py-2 text-sm outline-none transition-colors focus:border-text-primary"
                  placeholder="Quartier, repère utile pour le livreur" />
              </div>

              <div>
                <label htmlFor="notes" className="admin-label">
                  Remarque <span className="normal-case tracking-normal text-text-muted">(facultatif)</span>
                </label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="mt-1.5 w-full resize-none border-b border-border bg-transparent py-2 text-sm outline-none transition-colors focus:border-text-primary"
                  placeholder="Couleurs de préférence, heure de livraison…" />
              </div>

              {fatal && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {fatal}
                </p>
              )}

              <button type="submit" disabled={busy}
                className="btn-accent w-full justify-center py-3.5 text-sm disabled:opacity-60">
                {busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
                {busy ? 'Enregistrement…' : 'Valider ma commande'}
              </button>
            </form>

            {/* Le règlement se termine sur WhatsApp : c'est là que le vendeur
                confirme le stock et la livraison. Le message est pré-rempli avec
                le panier, pour que le client n'ait rien à ressaisir. */}
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="btn-wa mt-3 w-full justify-center py-3 text-sm">
              <MessageCircle size={17} />
              Valider sur WhatsApp
            </a>
            <p className="mt-3 text-[0.68rem] leading-relaxed text-text-muted">
              « Valider ma commande » enregistre la commande et affiche sa
              référence. « Valider sur WhatsApp » ouvre la discussion avec le
              panier déjà rédigé.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

/** Une ligne de panier → une ligne de commande (`orders.items`). */
function toOrderItem(l: CartLine) {
  return {
    productId: l.slug,
    slug: l.slug,
    name: l.name,
    ref: l.ref || null,
    price: l.price,
    quantity: l.quantity,
    image: l.image || null,
  }
}