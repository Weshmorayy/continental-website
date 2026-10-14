import { siteConfig } from '@/config/site'
import type { ResolvedSettings } from '@/lib/settings'
import { paymentLabel } from '@/lib/payments'

/**
 * whatsapp.ts — tout ce que le site écrit dans WhatsApp.
 *
 * ── Le numéro vient des RÉGLAGES ──────────────────────────────────────────
 * Ce module lisait `siteConfig.contact.whatsapp`, c'est-à-dire le fichier figé
 * du dépôt. Le numéro ayant ensuite été modifié dans l'administration, le site
 * continuait d'ouvrir les conversations vers l'ancien — sans le moindre
 * message d'erreur : le lien fonctionne parfaitement, il écrit seulement à la
 * mauvaise personne.
 *
 * Le numéro est donc passé en paramètre, et il vient de `getSiteSettings()`
 * côté serveur ou de `useStore()` côté client. Rien n'est mis en cache dans ce
 * module : une valeur mise en cache en mémoire donnerait un numéro différent
 * selon que la page a été générée par le serveur ou par le navigateur, ce qui
 * est exactement le genre d'incohérence difficile à diagnostiquer qu'on cherche
 * ici à éliminer.
 *
 * ── Deux sens de conversation ─────────────────────────────────────────────
 * Ce fichier porte les DEUX sens, parce qu'ils doivent se lire ensemble :
 *
 *   client → vendeur   `buildOrderRecap()`   le récapitulatif de commande
 *   vendeur → client   `buildStatusMessage()`  l'annonce d'un changement d'état
 *
 * Les écrire à deux endroits, c'est accepter qu'une commande annoncée
 * « expédiée » le soit avec une autre formulation que celle du récapitulatif —
 * et le client, lui, ne lit qu'un fil.
 */

/** Montant en FCFA, avec l'espace insécable fine du format français. */
export function fcfa(n: number | string): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)).replace(/ /g, ' ')} FCFA`
}

/**
 * Une ligne d'article telle qu'elle apparaît dans un message.
 * `× 2` n'est écrit que s'il y a plus d'un exemplaire : « × 1 » n'informe de
 * rien et allonge un message que le vendeur lit sur un téléphone.
 */
function itemLine(it: { name: string; ref?: string | null; price: number; quantity: number }): string {
  const ref = it.ref ? ` (Réf. ${it.ref})` : ''
  const qty = it.quantity > 1 ? ` × ${it.quantity}` : ''
  const total = fcfa(Number(it.price) * it.quantity)
  return `• ${it.name}${ref}${qty} — ${total}`
}

/**
 * Numéro utilisable dans un lien `wa.me` : chiffres seulement, indicatif pays
 * compris.
 *
 * Les numéros saisis dans l'administration le sont librement (`77 123 45 67`,
 * `+221 77 123 45 67`). `wa.me` n'accepte qu'une suite de chiffres commençant
 * par l'indicatif : un numéro local à 9 chiffres reçoit donc le 221. Ce n'est
 * pas une vérification d'existence, c'est une mise en forme — pour qu'un
 * numéro valide ne soit pas rejeté à cause d'une espace.
 */
export function normalizePhone(raw: string | null | undefined): string {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (digits.length === 9) return `221${digits}`
  return digits
}

/**
 * Lien vers la conversation du VENDEUR, message pré-rempli.
 * C'est le lien des pages publiques : produit, panier, contact.
 */
export function buildWhatsAppUrl(
  message: string,
  cfg: ResolvedSettings = siteConfig,
): string {
  return waHrefFor(cfg.contact.whatsapp, message)
}

/**
 * Lien vers une conversation PRÉCISE, message pré-rempli.
 *
 * Sert à l'administration, qui écrit AU CLIENT : le numéro vient alors de la
 * commande, pas des réglages. Sans cette fonction, chaque bouton WhatsApp de
 * l'administration reconstruisait l'adresse à la main — et oubliait le
 * message, si bien que le vendeur devait réécrire « bonjour, au sujet de votre
 * commande » à chaque fois.
 */
export function waHrefFor(phone: string | null | undefined, message: string): string {
  const number = normalizePhone(phone)
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${text}`
}

/**
 * Numéro de téléphone à AFFICHER, au format lisible.
 *
 * L'administration demande un numéro international lisible (`+221 78 506 55
 * 55`) et un numéro WhatsApp technique (`221785065555`). Afficher le second à
 * un client serait illisible ; afficher le premier dans un lien `tel:` et un
 * `wa.me` casserait les deux. D'où deux champs, et cette fonction qui choisit
 * ce qui convient à l'écran.
 */
export function whatsappDisplay(cfg: ResolvedSettings = siteConfig): string {
  return cfg.contact.phone || `+${cfg.contact.whatsapp}`
}

/**
 * buildOrderMessage — demande de renseignement sur UN produit.
 *
 * Le texte ne mentionne PAS le prix : il est saisi et modifiable dans
 * l'administration, donc figé dans un lien WhatsApp il serait faux au premier
 * changement de tarif. On demande au vendeur de le confirmer.
 *
 * C'est le message des boutons « Commander sur WhatsApp » d'une fiche
 * produit — pas celui d'une commande enregistrée, qui contient son
 * récapitulatif complet (voir `buildOrderRecap`).
 */
export function buildOrderMessage({
  productName,
  ref,
  quantity = 1,
}: {
  productName: string
  ref?: string
  quantity?: number
}): string {
  const lines = [
    `Bonjour, je souhaite commander :`,
    ``,
    `- Produit : ${productName}`,
    ref ? `- Référence : ${ref}` : null,
    `- Quantité : ${quantity}`,
    ``,
    `Merci de me confirmer la disponibilité et le prix.`,
  ]
    .filter((l): l is string => l !== null)
    .join('\n')

  return lines
}

/** Ce qu'un récapitulatif de commande a besoin de connaître. */
export interface OrderRecapInput {
  ref?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  items: { name: string; ref?: string | null; price: number; quantity: number }[]
  subtotal?: number
  shippingCost?: number
  shippingZoneName?: string | null
  total?: number
  paymentMethod?: string | null
  notes?: string | null
}

/**
 * buildOrderRecap — le message que le CLIENT envoie au vendeur.
 *
 * ── Pourquoi il est devenu complet ────────────────────────────────────────
 * Le message ne portait que la référence et la liste des articles, séparés par
 * des lignes vides. Le vendeur devait donc ouvrir l'administration pour
 * savoir OÙ livrer et COMMENT le client veut régler — c'est-à-dire au moment
 * précis où il est en train de répondre depuis son téléphone.
 *
 * Le message est donc construit comme un bon de commande : référence, ce qui
 * est commandé ligne à ligne, les totaux, puis les coordonnées de livraison et
 * le mode de règlement. Tout ce qu'il faut pour répondre « oui, on livre
 * demain » sans ouvrir autre chose.
 *
 * Le PRIX est mentionné ici, contrairement au message de renseignement : la
 * commande est enregistrée en base avec ces montants. Le vendeur confirme,
 * mais il ne devine pas.
 */
export function buildOrderRecap(o: OrderRecapInput): string {
  const ref = o.ref?.trim()
  const lines: (string | null)[] = [
    ref
      ? `Bonjour Continental, je viens de passer la commande ${ref}.`
      : `Bonjour Continental, je viens de passer une commande.`,
    ``,
    `*Articles*`,
    ...o.items.map(itemLine),
  ]

  const subtotal = Number(o.subtotal ?? 0)
  const shipping = Number(o.shippingCost ?? 0)
  const total = Number(o.total ?? subtotal + shipping)

  lines.push(``, `*Totaux*`)
  lines.push(`• Sous-total : ${fcfa(subtotal)}`)
  lines.push(
    o.shippingZoneName
      ? `• Livraison — ${o.shippingZoneName} : ${shipping > 0 ? fcfa(shipping) : 'offerte'}`
      : `• Livraison : ${shipping > 0 ? fcfa(shipping) : 'offerte'}`,
  )
  lines.push(`• *Total : ${fcfa(total)}*`)

  lines.push(``, `*Livraison*`)
  if (o.customerName) lines.push(`• Nom : ${o.customerName}`)
  if (o.customerPhone) lines.push(`• Téléphone : ${o.customerPhone}`)
  if (o.customerAddress) lines.push(`• Adresse : ${o.customerAddress}`)
  if (o.shippingZoneName) lines.push(`• Zone : ${o.shippingZoneName}`)

  lines.push(`• Règlement : ${paymentLabel(o.paymentMethod)}`)

  if (o.notes?.trim()) {
    lines.push(``, `*Remarque du client*`, o.notes.trim())
  }

  lines.push(``, `Merci de me confirmer le délai de livraison.`)

  return lines.filter((l): l is string => l !== null).join('\n')
}

/**
 * Statuts d'une commande, et ce que le vendeur en dit au client.
 *
 * ── Pourquoi le texte est ici et pas dans l'écran ─────────────────────────
 * Le bouton WhatsApp de l'administration ouvrait une conversation VIDE : le
 * vendeur devait écrire le message, à chaque commande, en se rappelant ce
 * qu'il fallait dire. Le texte est donc rangé avec le statut, une fois, et le
 * bouton le propose. Il reste modifiable avant l'envoi — WhatsApp ouvre un
 * champ pré-rempli, il n'envoie rien tout seul.
 *
 * Le message s'adresse au client : il dit « votre commande », pas « la
 * commande n° … ». Le numéro n'y figure que parce qu'il aide le client à
 * retrouver sa commande, pas pour identifier le dossier.
 */
export function buildStatusMessage(
  order: { ref_command: string; customer_name?: string | null; shipping_zone_name?: string | null },
  status: string,
): string {
  // Le prénom seulement : « Bonjour Awa Diop » est un courrier administratif.
  const first = (order.customer_name ?? '').trim().split(/\s+/)[0] ?? ''
  const hello = first ? `Bonjour ${first},` : 'Bonjour,'
  const ref = order.ref_command
  const zone = order.shipping_zone_name ? ` vers ${order.shipping_zone_name}` : ''

  const body: Record<string, string> = {
    new: `nous avons bien reçu votre commande ${ref}. Un conseiller vous rappelle pour confirmer la livraison.`,
    confirmed: `votre commande ${ref} est confirmée. Nous préparons votre colis.`,
    preparing: `votre commande ${ref} est en préparation dans notre entrepôt.`,
    shipped: `votre commande ${ref} est en route${zone}. Le livreur vous appelle avant de passer.`,
    delivered: `votre commande ${ref} a été livrée. Merci de votre confiance — si tout est en ordre, un mot de votre part nous fait toujours plaisir.`,
    cancelled: `votre commande ${ref} a été annulée. Si c'est une surprise, répondez à ce message : nous la remettons en route.`,
  }

  const sentence = body[status] ?? `votre commande ${ref} a été mise à jour.`
  return `${hello} ${sentence}`
}
