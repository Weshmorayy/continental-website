import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-bg-secondary section-hero">
        <div className="container-site text-center">
          <p className="eyebrow eyebrow-center">Erreur 404</p>
          <h1 className="display-xl text-text-primary mx-auto mt-4 max-w-3xl" style={{ fontSize: 'clamp(2.25rem, 6.5vw, 4.25rem)' }}>
            Cette page n&apos;existe pas.
          </h1>
          <p className="mt-5 mx-auto max-w-md text-text-body text-base sm:text-lg">
            Le lien est peut-être ancien, ou le produit n&apos;est plus au catalogue.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="btn-outline px-8 py-3.5">Retour à l&apos;accueil</Link>
            <Link href="/catalogue" className="btn-accent px-8 py-3.5">Voir le catalogue</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
