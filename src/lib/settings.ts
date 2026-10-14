/**
 * settings.ts — Résolution des réglages pour la vitrine.
 *
 * ── Le problème ───────────────────────────────────────────────────────────
 * Les réglages modifiables dans l'administration (« Réglages » : téléphone,
 * WhatsApp, adresse, horaires, réseaux sociaux, moyens de paiement) sont
 * écrits dans `site_settings`. Or AUCUNE page publique ne lisait cette table :
 * le pied de page, la page contact, tous les liens WhatsApp et tous les liens
 * `tel:` prenaient leur numéro dans `src/config/site.ts`, un fichier figé
 * dans le dépôt.
 *
 * Conséquence : changer le WhatsApp dans l'administration ne changeait RIEN sur
 * le site. Le vendeur croyait avoir publié son nouveau numéro, et le site
 * envoyait toujours les clients vers l'ancien — vers un numéro qui n'existe
 * pas.
 *
 * ── La règle ──────────────────────────────────────────────────────────────
 * `siteConfig` reste la source des valeurs par DÉFAUT — jamais des valeurs
 * affichées. Chaque champ est résolu individuellement : un réglage laissé vide
 * dans l'administration ne doit pas effacer une valeur par défaut utilisable.
 * C'est la seule façon d'éviter qu'un formulaire à moitié rempli vide tout le
 * pied de page.
 *
 * Ce module ne dépend d'aucune variable d'environnement : il est importé
 * aussi bien par des composants serveur que par des composants clients. La
 * LECTURE de la base vit dans `src/lib/atelier.ts`, qui reste serveur.
 */

import { siteConfig } from '@/config/site'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/** Forme de la ligne `site_settings`, telle que stockée en JSON. */
export interface DbSettings {
  contact?: Record<string, string | null> | null
  social?: Record<string, string | null> | null
  hours?: Record<string, string | null> | null
  payments?: Record<string, boolean | null> | null
  delivery?: Record<string, unknown> | null
  legal?: Record<string, unknown> | null
  homepage?: Record<string, unknown> | null
}

export type ResolvedSettings = typeof siteConfig

/** Une chaîne non vide gagne ; sinon, le défaut du dépôt. */
function str(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback
}

/** Un booléen explicite gagne ; sinon, le défaut du dépôt. */
function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

/** Un nombre fini gagne ; sinon, le défaut du dépôt. */
function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/**
 * Numéro WhatsApp, au format international sans `+` ni espaces.
 *
 * L'administration demande un numéro tapé librement — `+221 78 506 55 55`,
 * `221785065555`, `0785065555` — et l'URL `wa.me` n'accepte qu'une suite de
 * chiffres commençant par l'indicatif pays. La normalisation est donc faite ici
 * une fois pour toutes, plutôt que comptée sur chaque lien du site.
 *
 * Un numéro sénégalais comporte 9 chiffres après le 221. Un numéro local à
 * 9 chiffres est complété par le 221 ; un numéro déjà international est laissé
 * tel quel. Ce n'est pas une vérification d'existence : c'est une mise en
 * forme, pour qu'un numéro valide ne soit pas rejeté par une faute de frappe.
 */
export function normalizeWhatsapp(raw: string): string {
  return toWaNumber(raw) || siteConfig.contact.whatsapp
}

/**
 * La même mise en forme, mais SANS repli.
 *
 * ── Pourquoi deux fonctions, et pas une ───────────────────────────────────
 * `normalizeWhatsapp` remplace un numéro vide par celui du magasin. C'est le
 * bon comportement pour le numéro DU VENDEUR : un lien de contact ne doit
 * jamais mener nulle part.
 *
 * Ce serait un comportement DANGEREUX pour le numéro d'un client : dans
 * l'administration, un bouton « Prévenir » sur une commande sans téléphone
 * ouvrirait alors une conversation avec… le vendeur lui-même, en croyant
 * écrire au client. Le repli doit donc être une décision de l'appelant, pas
 * un effet de bord du normaliseur. D'où cette fonction, qui rend une chaîne
 * vide quand il n'y a rien à composer.
 */
export function toWaNumber(raw: string | null | undefined): string {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (digits === '') return ''
  if (digits.length === 9) return `221${digits}`
  return digits
}

/**
 * Fusionne une ligne `site_settings` sur les valeurs par défaut.
 *
 * Le résultat a EXACTEMENT la forme de `siteConfig` : les composants peuvent
 * continuer à écrire `cfg.contact.phone` sans se demander d'où vient la
 * valeur, et le typage reste vérifié à la compilation.
 */
export function resolveSettings(db: DbSettings | null | undefined): ResolvedSettings {
  const contact = db?.contact ?? {}
  const social = db?.social ?? {}
  const hours = db?.hours ?? {}
  const payments = db?.payments ?? {}
  const delivery = (db?.delivery ?? {}) as Record<string, unknown>

  return {
    ...siteConfig,
    contact: {
      phone: str(contact.phone, siteConfig.contact.phone),
      whatsapp: normalizeWhatsapp(str(contact.whatsapp, siteConfig.contact.whatsapp)),
      email: str(contact.email, siteConfig.contact.email),
      address: str(contact.address, siteConfig.contact.address),
      neighborhood: str(contact.neighborhood, siteConfig.contact.neighborhood),
      city: str(contact.city, siteConfig.contact.city),
      country: str(contact.country, siteConfig.contact.country),
    },
    social: {
      facebook: str(social.facebook, siteConfig.social.facebook),
      instagram: str(social.instagram, siteConfig.social.instagram),
      tiktok: str(social.tiktok, siteConfig.social.tiktok),
    },
    hours: {
      weekdays: str(hours.weekdays, siteConfig.hours.weekdays),
      saturday: str(hours.saturday, siteConfig.hours.saturday),
      sunday: str(hours.sunday, siteConfig.hours.sunday),
    },
    payments: {
      wave: bool(payments.wave, siteConfig.payments.wave),
      orangeMoney: bool(payments.orangeMoney, siteConfig.payments.orangeMoney),
      card: bool(payments.card, siteConfig.payments.card),
      cash: bool(payments.cash, siteConfig.payments.cash),
    },
    delivery: {
      available: bool(delivery.available, siteConfig.delivery.available),
      freeFrom: num(delivery.freeFrom, siteConfig.delivery.freeFrom),
      /*
       * Les zones de livraison ne sont PAS dans `site_settings` : elles ont
       * leur propre table `shipping_zones`, éditable module par module, avec
       * ses propres droits d'accès et ses propres tarifs. Le champ existe
       * éventuellement dans les réglages pour un usage ponctuel, mais la
       * source de vérité reste la table.
       */
      zones: Array.isArray(delivery.zones)
        ? (delivery.zones as typeof siteConfig.delivery.zones)
        : siteConfig.delivery.zones,
    },
    seo: {
      ...siteConfig.seo,
      ogImage: str((db as { seo?: Record<string, string> } | null)?.seo?.ogImage, siteConfig.seo.ogImage),
      twitterHandle: str(
        (db as { seo?: Record<string, string> } | null)?.seo?.twitterHandle,
        siteConfig.seo.twitterHandle,
      ),
    },
  }
}

/**
 * URL de commande WhatsApp, sur le numéro RÉSOLU.
 *
 * ── Cette fonction n'est plus qu'un raccourci ─────────────────────────────
 * Elle construisait l'adresse `wa.me` elle-même, comme `buildWhatsAppUrl` de
 * `lib/whatsapp.ts` — deux endroits pour la même URL, donc deux endroits où
 * oublier `encodeURIComponent`. Elle délègue désormais.
 *
 * L'ordre des arguments est conservé (`cfg` d'abord) parce que les appels
 * existants — en-tête, pied de page — le lisent ainsi.
 *
 * Aucun cycle : `lib/whatsapp.ts` n'importe de ce fichier qu'un TYPE, effacé
 * à la compilation, donc le graphe d'exécution va dans un seul sens.
 */
export function whatsappLink(cfg: ResolvedSettings, message: string): string {
  return buildWhatsAppUrl(message, cfg)
}