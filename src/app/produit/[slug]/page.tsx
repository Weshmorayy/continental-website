import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GalleryViewer from '@/components/ui/GalleryViewer'
import TechSpecTable from '@/components/ui/TechSpecTable'
import ProductCard from '@/components/ui/ProductCard'
import { products, getProductBySlug, getRelatedProducts } from '@/data/products'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'
import { generatePageMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return {}
  return generatePageMetadata({
    title: `${product.name} — Réf. ${product.ref}`,
    description: `${product.name} Continental® (${product.ref}). ${product.features[0]}. ${product.features[1]}. Prix : ${product.price.toLocaleString('fr-FR')} FCFA. Livraison à Dakar.`,
    path: `/produit/${product.slug}`,
    image: product.image,
  })
}

export default async function ProduitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const related = getRelatedProducts(product)
  const waUrl = buildWhatsAppUrl(
    buildOrderMessage({ productName: product.name, ref: product.ref })
  )

  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-12 sm:py-16">
          <div className="container-site">

            <nav className="flex items-center gap-2 mb-10" aria-label="Fil d'Ariane">
              <Link href="/" className="product-ref text-text-muted hover:text-text-primary transition-colors">
                Accueil
              </Link>
              <ChevronRight size={12} className="text-text-muted" aria-hidden="true" />
              <Link href="/catalogue" className="product-ref text-text-muted hover:text-text-primary transition-colors">
                Catalogue
              </Link>
              <ChevronRight size={12} className="text-text-muted" aria-hidden="true" />
              <span className="product-ref text-text-primary">{product.ref}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-6 lg:sticky lg:top-28">
                <GalleryViewer images={product.images} productName={product.name} />
              </div>

              <div className="lg:col-span-6">
                {product.badge && (
                  <span className="inline-flex rounded-full bg-accent-light text-accent px-4 py-1.5 text-xs font-semibold mb-5">
                    {product.badge}
                  </span>
                )}

                <p className="eyebrow">{product.categoryLabel}</p>

                <h1
                  className="display-lg text-text-primary mt-3"
                  style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)' }}
                >
                  {product.name}
                </h1>

                <p className="product-ref text-text-muted mt-3">Réf. {product.ref}</p>

                <div className="mt-8 py-7 hairline border-t border-border">
                  <span className="product-ref text-text-muted">Prix indicatif</span>
                  <p className="display-md text-text-primary text-3xl sm:text-4xl mt-1">
                    {product.price.toLocaleString('fr-FR')}{' '}
                    <span className="text-lg font-medium text-text-muted">FCFA</span>
                  </p>
                  <p className="text-xs text-text-muted mt-2">Confirmé à la commande</p>
                </div>

                <ul className="mt-8 space-y-3.5">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-text-body leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-9">
                  <TechSpecTable specs={product.specs} />
                </div>

                <p className="mt-8 flex items-center gap-3 text-sm text-text-body">
                  <ShieldCheck size={20} strokeWidth={1.5} className="text-accent flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary font-semibold">Garantie 2 ans</strong>{' '}
                    — pièces et main-d&apos;œuvre incluses
                  </span>
                </p>

                <div className="mt-9 flex flex-col sm:flex-row gap-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent flex-1 py-4"
                  >
                    <MessageCircle size={17} />
                    Commander via WhatsApp
                  </a>
                  <a href={`tel:${siteConfig.contact.whatsapp}`} className="btn-outline px-7 py-4">
                    <Phone size={17} />
                    Appeler
                  </a>
                </div>

                <p className="mt-5 flex items-center gap-2.5 text-xs text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-[#1FA855]" aria-hidden="true" />
                  En stock — livraison 24 à 48 h à Dakar
                </p>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-bg-secondary py-16 sm:py-24">
            <div className="container-site">
              <p className="eyebrow eyebrow-center">Dans la même gamme</p>
              <h2 className="display-lg text-text-primary text-center mt-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
                Vous pourriez aussi aimer.
              </h2>

              <div className="carousel-row -mx-5 px-5 sm:mx-0 sm:px-0 mt-12 pb-2">
                {related.map((p) => (
                  <div key={p.id} className="w-[78vw] max-w-[340px]">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
