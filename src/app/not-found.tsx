import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-bg-dark section-hero">
        <div className="container-site text-center">
          <p className="font-heading font-black text-text-light/10 leading-none select-none"
            style={{ fontSize: 'clamp(6rem, 20vw, 16rem)' }}
            aria-hidden="true">
            404
          </p>
          <div className="-mt-8 md:-mt-16 relative z-10">
            <h1 className="font-heading font-bold text-text-light text-3xl md:text-5xl mb-4">
              Page introuvable.
            </h1>
            <p className="text-text-light/50 text-base mb-10 max-w-sm mx-auto">
              Cette page n&apos;existe pas ou a été déplacée.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="btn-accent px-8 py-3.5 text-sm tracking-widest uppercase">
                Retour à l&apos;accueil
              </Link>
              <Link href="/catalogue" className="btn-outline-white px-8 py-3.5 text-sm tracking-widest uppercase">
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
