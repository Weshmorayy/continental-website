import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CatalogueGrid from '@/components/sections/CatalogueGrid'
import { generatePageMetadata } from '@/lib/seo'

export const metadata = generatePageMetadata({
  title: 'Catalogue — Ventilateurs & Climatiseurs',
  description:
    'Parcourez l\'ensemble de la gamme Continental® : ventilateurs sur pied, muraux, orbitaux. Commande rapide via WhatsApp. Livraison à Dakar.',
  path: '/catalogue',
})

export default function CataloguePage() {
  return (
    <>
      <Header />
      <main>
        {/* Header page catalogue */}
        <section className="bg-bg-dark pt-28 md:pt-36 pb-14 md:pb-20">
          <div className="container-site">
            <p className="product-ref text-text-light/30 tracking-[0.25em] mb-4">
              CONTINENTAL® — CATALOGUE COMPLET
            </p>
            <h1 className="font-heading font-black text-text-light leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              Tous nos modèles.
            </h1>
            <p className="text-text-light/50 text-base md:text-lg mt-4 max-w-xl">
              Ventilateurs sur pied, muraux et orbitaux — chaque modèle livré avec garantie 2 ans.
            </p>
          </div>
        </section>

        <CatalogueGrid />
      </main>
      <Footer />
    </>
  )
}
