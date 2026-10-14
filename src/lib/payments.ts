/**
 * payments.ts — les modes de règlement acceptés, et leur libellé.
 *
 * ── Pourquoi ce fichier existe ────────────────────────────────────────────
 * Le libellé d'un mode de règlement était écrit deux fois : une fois pour
 * l'écran de l'administration (`admin-types.ts`) et une fois, en clair, dans
 * les messages WhatsApp. Les deux listes pouvaient diverger sans que rien ne
 * le signale — et un message client annonçant « Wave » pour un règlement
 * saisi « orange_money » aurait été faux.
 *
 * La table vit donc ici, une seule fois. `admin-types.ts` la réexporte pour
 * que les écrans existants continuent de l'importer au même endroit.
 *
 * ── L'ORDRE compte ────────────────────────────────────────────────────────
 * C'est celui du plus fréquent au plus rare, et il est repris tel quel dans
 * les listes déroulantes. Le paiement à la livraison passe en tête : c'est le
 * mode par défaut du site.
 */

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  whatsapp: 'Paiement à la livraison',
  cash: 'Paiement à la livraison',
  wave: 'Wave',
  orange_money: 'Orange Money',
  card: 'Carte bancaire',
}

/**
 * Libellé d'un mode de règlement, jamais vide.
 *
 * Un mode inconnu (valeur ajoutée en base après la rédaction de ce fichier)
 * s'affiche tel quel plutôt que « undefined » — c'est laid, mais c'est
 * lisible, et cela vaut mieux qu'une commande dont on ne sait pas comment
 * elle est réglée.
 */
export function paymentLabel(method: string | null | undefined): string {
  if (!method) return 'Règlement non précisé'
  return PAYMENT_METHOD_LABEL[method] ?? method
}
