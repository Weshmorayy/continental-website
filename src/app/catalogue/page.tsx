import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CatalogueGrid from '@/components/sections/CatalogueGrid'
import { generatePageMetadata } from '@/lib/seo'

export const metadata = generatePageMetadata({
  title: 'Catalogue — Ventilateurs & Climatiseurs',
  description:
    "Parcourez l'ensemble de la gamme Continental® : ventilateurs sur pied, muraux, orbitaux. Commande rapide via WhatsApp. Livraison à Dakar.",
  path: '/catalogue',
})

export default function CataloguePage() {
  return (
    <>
      <Header />
      <main>
        {/* En-tête de page — blanc, pas de bandeau sombre */}
        <section className="bg-bg-primary pt-14 sm:pt-20 pb-12 sm:pb-16 border-b border-border">
          <div className="container-site">
            <p className="eyebrow mb-5">Catalogue complet</p>
            <h1
              className="font-heading font-semibold text-text-primary leading-[1.05] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.25rem)' }}
            >
              Tous nos modèles.
            </h1>
            <p className="text-text-body text-base md:text-lg mt-5 max-w-xl leading-relaxed">
              Ventilateurs sur pied, muraux et orbitaux — chaque modèle livré avec
              garantie 2 ans et paiement à la réception.
            </p>
          </div>
        </section>

        <CatalogueGrid />
      </main>
      <Footer />
    </>
  )
}
