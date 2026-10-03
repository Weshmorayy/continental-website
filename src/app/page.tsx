import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import GammesSection from '@/components/sections/GammesSection'
import BestsellerSection from '@/components/sections/BestsellerSection'
import ArgumentsSection from '@/components/sections/ArgumentsSection'
import CatalogueApercu from '@/components/sections/CatalogueApercu'
import LivraisonSection from '@/components/sections/LivraisonSection'
import { generatePageMetadata } from '@/lib/seo'
import { getSiteProducts } from '@/lib/atelier'

export const metadata = generatePageMetadata({
  title: 'Ventilateurs & Climatiseurs à Dakar',
  description:
    'Continental® — Ventilateurs sur pied, muraux et climatiseurs haute performance. Livraison à Dakar et banlieue. Garantie 2 ans.',
  path: '/',
})

export default async function HomePage() {
  const { products, source } = await getSiteProducts()
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <GammesSection />
        <BestsellerSection />
        <ArgumentsSection />
        <CatalogueApercu products={products} totalCount={products.length} />
        <LivraisonSection />
      </main>
      <Footer />
    </>
  )
}
