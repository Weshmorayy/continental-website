'use client'

import { useState, useMemo } from 'react'
import { products, categories, getProductsByCategory } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react'

export default function CatalogueGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = useMemo(
    () => getProductsByCategory(activeCategory),
    [activeCategory]
  )

  return (
    <>
      {/* Barre de filtres par catégories avec contraste franc */}
      <div className="bg-white border-b-2 border-border sticky top-16 z-30 shadow-sm">
        <div className="container-site">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-2 transition-all ${
                    isSelected
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : 'bg-bg-secondary text-text-body border-border hover:border-accent hover:text-accent'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grille des produits isolés sur fond blanc */}
      <section className="bg-bg-secondary py-12 md:py-16">
        <div className="container-site">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
            <div>
              <p className="font-mono text-xs font-bold text-accent uppercase tracking-widest">
                SÉLECTION EN TEMPS RÉEL
              </p>
              <h2 className="font-heading font-black text-text-primary text-2xl sm:text-3xl">
                {categories.find((c) => c.id === activeCategory)?.label}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-text-muted bg-white px-3 py-1.5 border border-border self-start sm:self-auto">
              {filtered.length} référence{filtered.length > 1 ? 's' : ''} certifiée{filtered.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Bandeau d'information technique */}
          <div className="mt-14 bg-white border-2 border-border p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-text-primary text-lg">Garantie 24 Mois</h4>
                  <p className="text-xs text-text-body mt-1 leading-relaxed">
                    Remplacement ou réparation rapide pris en charge par notre équipe technique.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-text-primary text-lg">Moteurs 100% Cuivre</h4>
                  <p className="text-xs text-text-body mt-1 leading-relaxed">
                    Résistance renforcée à la chaleur continue et aux variations de tension.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-text-primary text-lg">Conseil & Devis</h4>
                  <p className="text-xs text-text-body mt-1 leading-relaxed">
                    Assistance par WhatsApp avant chaque validation de commande.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
