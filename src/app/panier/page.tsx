import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo'
import CartPageClient from '@/components/cart/CartPageClient'

export const metadata: Metadata = generatePageMetadata({
  title: 'Votre commande',
  description:
    'Vérifiez les articles de votre panier, choisissez votre zone de livraison et validez votre commande Continental®.',
  path: '/panier',
})

export default function PanierPage() {
  return <CartPageClient />
}