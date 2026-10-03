'use client'

/**
 * admin/layout.tsx — Portefeuille de données du portail.
 *
 * VOLONTAIREMENT ISOLÉ du `layout.tsx` racine, qui n'enveloppe QUE le site
 * public. Le portail ne partage donc rien avec la vitrine : ni bandeau, ni
 * pied de page, ni aucun composant du site — et ajouter une page publique ne
 * peut pas casser l'administration, ni l'inverse.
 *
 * C'est aussi la raison du fichier `src/lib/admin-types.ts` : le portail parle
 * les colonnes Supabase, le site public parle `src/data/products.ts`. Deux
 * formes de données distinctes, deux emplacements distincts.
 */

import { StoreProvider } from '@/context/StoreContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StoreProvider>{children}</StoreProvider>
}