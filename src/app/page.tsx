import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import GammesSection from '@/components/sections/GammesSection'
import BestsellerSection from '@/components/sections/BestsellerSection'
import ArgumentsSection from '@/components/sections/ArgumentsSection'
import CatalogueApercu from '@/components/sections/CatalogueApercu'
import LivraisonSection from '@/components/sections/LivraisonSection'
import { generatePageMetadata } from '@/lib/seo'

export const metadata = generatePageMetadata({
  title: 'Ventilateurs & Climatiseurs à Dakar',
  description:
    'Continental® — Ventilateurs sur pied, muraux et climatiseurs haute performance. Livraison à Dakar et banlieue. Garantie 2 ans.',
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <GammesSection />
        <BestsellerSection />
        <ArgumentsSection />
        <CatalogueApercu />
        <LivraisonSection />
      </main>
      <Footer />
    </>
  )
}
