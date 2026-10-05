import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo'
import CartPageClient from '@/components/cart/CartPageClient'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = generatePageMetadata({
  title: 'Votre commande',
  description:
    'Vérifiez les articles de votre panier, choisissez votre zone de livraison et validez votre commande Continental®.',
  path: '/panier',
})

/**
 * Le panier porte l'en-tête et le pied de page.
 *
 * Il ne les avait pas : la page se réduisait au formulaire, sans navigation.
 * Arrivé là, le visiteur n'avait plus aucun moyen de revenir dans le site —
 * ni menu, ni logo, ni lien de bas de page. Une page de tunnel reste une page
 * du site : elle doit laisser sortir.
 */
export default function PanierPage() {
  return (
    <>
      <Header />
      <main>
        <CartPageClient />
      </main>
      <Footer />
    </>
  )
}