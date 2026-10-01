import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-bg-primary section-hero">
        <div className="container-site">
          <div className="max-w-xl">
            <p className="eyebrow mb-6">Erreur 404</p>
            <h1 className="font-heading font-semibold text-text-primary text-4xl sm:text-5xl leading-[1.05] tracking-[-0.02em] mb-5">
              Cette page n&apos;existe pas.
            </h1>
            <p className="text-text-body text-lg leading-relaxed mb-10">
              Le lien est peut-être ancien, ou le produit n&apos;est plus au catalogue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="btn-accent px-8 py-4">
                Retour à l&apos;accueil
              </Link>
              <Link href="/catalogue" className="btn-outline-dark px-8 py-4">
                Voir le catalogue
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
