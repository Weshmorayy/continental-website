import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { products } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'

// Sélection : 1 bestseller + 4 autres — grille asymétrique
const featured = products.filter((p) => p.isBestseller).slice(0, 1)
const secondary = products.filter((p) => !p.isBestseller).slice(0, 4)

export default function CatalogueApercu() {
  return (
    <section className="bg-bg-primary py-20 md:py-28">
      <div className="container-site">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="product-ref text-text-muted tracking-[0.25em] mb-3">CATALOGUE</p>
            <h2 className="font-heading font-bold text-text-primary text-4xl md:text-5xl">
              Nos produits phares.
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 text-accent text-sm font-medium hover:gap-3 transition-all duration-250 self-start md:self-auto"
          >
            Voir tous les modèles <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grille asymétrique : 1 grande + 4 petites */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">

          {/* Grande carte bestseller */}
          {featured.map((p) => (
            <div key={p.id} className="md:col-span-1 lg:col-span-2 lg:row-span-1">
              <div className="h-full">
                <ProductCard product={p} size="large" />
              </div>
            </div>
          ))}

          {/* 4 petites cartes */}
          {secondary.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}

        </div>
      </div>
    </section>
  )
}
