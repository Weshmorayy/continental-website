import { siteConfig } from '@/config/site'

/**
 * buildWhatsAppUrl — Construit une URL de commande WhatsApp pré-remplie
 */
export function buildWhatsAppUrl(message: string): string {
  const phone = siteConfig.contact.whatsapp.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

/**
 * buildOrderMessage — Message de commande structuré, en français
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
