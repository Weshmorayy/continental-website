import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MessageCircle, Phone, Check } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GalleryViewer from '@/components/ui/GalleryViewer'
import TechSpecTable from '@/components/ui/TechSpecTable'
import ProductCard from '@/components/ui/ProductCard'
import { products, getProductBySlug, getRelatedProducts } from '@/data/products'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'
import { generatePageMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'

// Générer les routes statiques pour tous les produits
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

// Métadonnées dynamiques — Next.js 15 : params est une Promise
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

// Next.js 15 : params est une Promise dans les Server Components
export default async function ProduitPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const related = getRelatedProducts(product)
  const waMessage = buildOrderMessage({ productName: product.name, ref: product.ref })
  const waUrl = buildWhatsAppUrl(waMessage)
  const telUrl = `tel:${siteConfig.contact.whatsapp}`

  return (
    <>
      <Header />
      <main>

        {/* Breadcrumb + Fiche */}
        <section className="bg-bg-primary pt-24 md:pt-28 pb-16 md:pb-24">
          <div className="container-site">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 mb-10" aria-label="Fil d'Ariane">
              <Link href="/" className="product-ref text-text-muted hover:text-text-primary transition-colors">
                Accueil
              </Link>
              <ChevronRight size={12} className="text-text-muted" />
              <Link href="/catalogue" className="product-ref text-text-muted hover:text-text-primary transition-colors">
                Catalogue
              </Link>
              <ChevronRight size={12} className="text-text-muted" />
              <span className="product-ref text-text-primary">{product.ref}</span>
            </nav>

            {/* Fiche principale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-start">

              {/* Galerie */}
              <div className="md:sticky md:top-24">
                <GalleryViewer images={product.images} productName={product.name} />
              </div>

              {/* Informations */}
              <div className="flex flex-col gap-6">

                {/* Badge */}
                {product.badge && (
                  <span className="inline-flex self-start px-3 py-1 bg-accent text-white text-[10px] product-ref tracking-widest uppercase">
                    {product.badge}
                  </span>
                )}

                {/* Référence + Nom */}
                <div>
                  <p className="product-ref text-text-muted tracking-[0.2em] mb-2">
                    {product.categoryLabel} — {product.ref}
                  </p>
                  <h1
                    className="font-heading font-black text-text-primary leading-tight"
                    style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                  >
                    {product.name}
                  </h1>
                </div>

                {/* Prix */}
                <div className="flex items-baseline gap-3 py-4 border-y border-border">
                  <span className="price-tag" style={{ fontSize: '2.2rem' }}>
                    {product.price.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-xs text-text-muted">
                    Prix indicatif — confirmé à la commande
                  </span>
                </div>

                {/* Features */}
                <div>
                  <p className="product-ref text-text-muted tracking-widest mb-3">
                    CARACTÉRISTIQUES
                  </p>
                  <ul className="flex flex-col gap-2">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-text-body">
                        <Check size={14} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tableau specs */}
                <TechSpecTable specs={product.specs} />

                {/* Garantie */}
                <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20">
                  <div className="w-9 h-9 bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-heading font-black text-accent text-xs">2A</span>
                  </div>
                  <p className="text-sm text-text-body">
                    <strong className="text-text-primary">Garantie 2 ans</strong> — Qualité Continentale
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent flex-1 justify-center py-4 text-sm tracking-widest uppercase"
                  >
                    <MessageCircle size={16} />
                    Commander via WhatsApp
                  </a>
                  <a
                    href={telUrl}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-4 border border-border text-text-primary text-sm hover:border-text-primary transition-all duration-250"
                  >
                    <Phone size={16} />
                    Appeler
                  </a>
                </div>

                {/* Info stock */}
                <p className="text-xs text-text-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  En stock — livraison 24–48h à Dakar
                </p>

              </div>
            </div>
          </div>
        </section>

        {/* Produits similaires */}
        {related.length > 0 && (
          <section className="bg-bg-secondary py-16 md:py-20">
            <div className="container-site">
              <p className="product-ref text-text-muted tracking-[0.25em] mb-3">
                DANS LA MÊME GAMME
              </p>
              <h2 className="font-heading font-bold text-text-primary text-3xl md:text-4xl mb-10">
                Vous pourriez aussi aimer.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
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
