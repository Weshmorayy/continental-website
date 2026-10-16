/**
 * testOrder.ts — Reconnaître une commande de test.
 *
 * ── Pourquoi une détection, et pas un bouton ──────────────────────────────
 * Le propriétaire a besoin de supprimer ses propres essais : une commande
 * passée pour vérifier que le formulaire marche, qu'un ami a validée depuis
 * son téléphone, ou qu'il a lui-même montée à l'atelier. Ces lignes restent
 * ensuite dans la liste, gonflent le chiffre d'affaires et le compte
 * « à traiter ».
 *
 * Mais une suppression ouverte à toutes les commandes est un geste qu'on
 * regrette une seule fois. Le signal retenu est donc celui que le client a
 * lui-même demandé : le mot « test » écrit dans son NOM ou dans sa NOTE au
 * moment de la commande. C'est volontairement le geste le plus simple — le
 * vendeur tape « test » dans le champ nom, et la ligne devient supprimable.
 *
 * ── Le piège à éviter ─────────────────────────────────────────────────────
 * Une recherche de sous-chaîne ferait disparaître « Testament » ou
 * « contestataire ». Le mot est donc cherché ENTIER, encadré par ce qui n'est
 * ni lettre ni chiffre — début de chaîne, espace, tiret, point, emoji…
 *
 * Le repli des accents couvre l'écriture réelle du terrain : « Test », « TEST »
 * et « tést » désignent la même chose.
 */

import type { Order } from '@/lib/admin-types'

/**
 * Le mot « test » en entier, en minuscules et sans accents (voir `normalise`).
 * Pas de drapeau `g` : la dernière position de recherche serait conservée
 * d'un appel à l'autre, et le test suivant repartirait du mauvais endroit.
 */
const TEST_WORD = /(^|[^a-z0-9])test([^a-z0-9]|$)/

/** Minuscules, sans accents : « TÉST » et « Testament » deviennent lisibles. */
function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/**
 * Une commande est « test » quand le client a mis « test » dans son nom ou
 * dans sa note. Fonction pure : même entrée, même sortie, aucun effet de bord.
 *
 * La signature n'exige que les deux champs lus — l'appelant peut donc tester
 * un brouillon de commande, pas seulement une ligne relue de la base.
 */
export function isTestOrder(order: Pick<Order, 'customer_name' | 'notes'>): boolean {
  return (
    TEST_WORD.test(normalise(order.customer_name ?? '')) ||
    TEST_WORD.test(normalise(order.notes ?? ''))
  )
}
