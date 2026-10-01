import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MessageCircle, Phone, Check, ShieldCheck } from 'lucide-react'
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
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

export default async function ProduitPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const related = getRelatedProducts(product)
  const waUrl = buildWhatsAppUrl(
    buildOrderMessage({ productName: product.name, ref: product.ref })
  )
  const telUrl = `tel:${siteConfig.contact.whatsapp}`

  return (
    <>
      <Header />
      <main>
        <section className="bg-bg-primary pt-10 sm:pt-14 pb-16 md:pb-24">
          <div className="container-site">

            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 mb-10" aria-label="Fil d'Ariane">
              <Link href="/" className="product-ref text-text-muted hover:text-text-primary transition-colors">
                Accueil
              </Link>
              <ChevronRight size={12} className="text-text-muted/60" aria-hidden="true" />
              <Link href="/catalogue" className="product-ref text-text-muted hover:text-text-primary transition-colors">
                Catalogue
              </Link>
              <ChevronRight size={12} className="text-text-muted/60" aria-hidden="true" />
              <span className="product-ref text-text-primary">{product.ref}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              {/* Galerie */}
              <div className="lg:col-span-6 lg:sticky lg:top-28">
                <GalleryViewer images={product.images} productName={product.name} />
              </div>

              {/* Informations */}
              <div className="lg:col-span-6 flex flex-col gap-7">

                {product.badge && (
                  <span className="inline-flex self-start rounded-full bg-accent-light text-accent px-4 py-1.5 text-[11px] product-ref tracking-[0.14em]">
                    {product.badge}
                  </span>
                )}

                <div>
                  <p className="product-ref text-text-muted tracking-[0.2em] mb-3">
                    {product.categoryLabel} — {product.ref}
                  </p>
                  <h1
                    className="font-heading font-semibold text-text-primary leading-[1.1] tracking-[-0.02em]"
                    style={{ fontSize: 'clamp(1.9rem, 4vw, 2.85rem)' }}
                  >
                    {product.name}
                  </h1>
                </div>

                {/* Prix */}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-6 border-y border-border">
                  <span className="price-tag" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}>
                    {product.price.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-xs text-text-muted">
                    Prix indicatif — confirmé à la commande
                  </span>
                </div>

                {/* Caractéristiques */}
                <ul className="space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-text-body leading-relaxed">
                      <Check size={16} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                <TechSpecTable specs={product.specs} />

                {/* Garantie */}
                <p className="flex items-center gap-3 rounded-2xl bg-bg-secondary border border-border px-5 py-4">
                  <ShieldCheck size={20} className="text-accent flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-text-body">
                    <strong className="text-text-primary font-semibold">Garantie 2 ans</strong>{' '}
                    — pièces et main-d&apos;œuvre incluses
                  </span>
                </p>

                {/* Conversion */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent flex-1 py-4"
                  >
                    <MessageCircle size={17} />
                    Commander via WhatsApp
                  </a>
                  <a href={telUrl} className="btn-outline-dark px-7 py-4">
                    <Phone size={17} />
                    Appeler
                  </a>
                </div>

                <p className="flex items-center gap-2.5 text-xs text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-[#1FA855]" aria-hidden="true" />
                  En stock — livraison 24 à 48 h à Dakar
                </p>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-bg-secondary py-16 md:py-24">
            <div className="container-site">
              <p className="eyebrow mb-5">Dans la même gamme</p>
              <h2 className="font-heading font-semibold text-text-primary text-3xl md:text-4xl tracking-[-0.02em] mb-12">
                Vous pourriez aussi aimer.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
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
