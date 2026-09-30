'use client'

import { useState, useMemo } from 'react'
import { products, categories, getProductsByCategory } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'

export default function CatalogueGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = useMemo(
    () => getProductsByCategory(activeCategory),
    [activeCategory]
  )

  return (
    <>
      {/* Filtres */}
      <div className="bg-bg-primary border-b border-border sticky top-16 md:top-20 z-40">
        <div className="container-site">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide py-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-5 py-4 text-xs font-medium tracking-widest uppercase transition-all duration-250 border-b-2 ${
                  activeCategory === cat.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille produits */}
      <div className="bg-bg-primary py-10 md:py-14">
        <div className="container-site">
          <p className="product-ref text-text-muted mb-8">
            {filtered.length} produit{filtered.length > 1 ? 's' : ''} — {
              categories.find(c => c.id === activeCategory)?.label
            }
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Climatiseurs — placeholder */}
          {(activeCategory === 'all' || activeCategory === 'climatiseur') && (
            <div className="mt-8 p-8 md:p-12 bg-bg-dark flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="product-ref text-text-light/30 tracking-widest mb-2">PROCHAINEMENT</p>
                <h3 className="font-heading font-bold text-text-light text-2xl md:text-3xl">
                  Climatiseurs Continental®
                </h3>
                <p className="text-text-light/50 text-sm mt-2 max-w-md">
                  Notre gamme de climatiseurs arrive bientôt. Contactez-nous pour être informé de la disponibilité.
                </p>
              </div>
              <a
                href={`https://wa.me/221770000000?text=${encodeURIComponent('Bonjour, je souhaite être informé de la disponibilité des climatiseurs Continental.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent flex-shrink-0 text-sm tracking-widest uppercase"
              >
                Me prévenir
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
