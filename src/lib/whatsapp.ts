import { siteConfig } from '@/config/site'
import type { ResolvedSettings } from '@/lib/settings'

/**
 * buildWhatsAppUrl — URL de commande WhatsApp pré-remplie.
 *
 * ── Le numéro vient des RÉGLAGES ──────────────────────────────────────────
 * Cette fonction lisait `siteConfig.contact.whatsapp`, c'est-à-dire le fichier
 * figé du dépôt. Le numéro ayant ensuite été modifié dans l'administration,
 * le site continuait d'ouvrir les conversations vers l'ancien — sans le
 * moindre message d'erreur : le lien fonctionne parfaitement, il écrit
 * seulement à la mauvaise personne.
 *
 * Le numéro est donc passé en paramètre, et il vient de `getSiteSettings()`
 * côté serveur ou de `useStore()` côté client. Rien n'est mis en cache dans ce
 * module : une valeur mise en cache en mémoire donnerait un numéro différent
 * selon que la page a été générée par le serveur ou par le navigateur, ce qui
 * est exactement le genre d'incohérence difficile à diagnostiquer qu'on cherche
 * ici à éliminer.
 *
 * L'argument reste facultatif : sans lui, la fonction retombe sur les valeurs
 * par défaut, ce qui est le comportement correct pour un composant qui n'a pas
 * accès aux réglages — et ne vaut mieux qu'un numéro périmé.
 */
export function buildWhatsAppUrl(
  message: string,
  cfg: ResolvedSettings = siteConfig,
): string {
  const phone = cfg.contact.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
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
 * buildOrderMessage — Message de commande structuré, en français.
 *
 * Le texte ne mentionne PAS le prix : il est saisi et modifiable dans
 * l'administration, donc figé dans un lien WhatsApp il serait faux au premier
 * changement de tarif. On demande au vendeur de le confirmer.
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