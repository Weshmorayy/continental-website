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
        {/* Ouverture centrée sur gris clair — structure samsung.com */}
        <section className="bg-bg-secondary py-16 sm:py-24 text-center">
          <div className="container-site">
            <p className="eyebrow eyebrow-center">Catalogue complet</p>
            <h1
              className="display-xl text-text-primary mx-auto mt-4 max-w-4xl"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 4.75rem)' }}
            >
              Tous nos modèles.
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-text-body text-base sm:text-lg">
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
