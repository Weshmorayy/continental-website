'use client'

import { useState, useMemo } from 'react'
import { products, categories, getProductsByCategory } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'
import { ShieldCheck, Wind, MessageCircle } from 'lucide-react'

const reassurances = [
  {
    icon: ShieldCheck,
    title: 'Garantie 24 mois',
    text: "Remplacement ou réparation rapide, pris en charge par notre équipe technique.",
  },
  {
    icon: Wind,
    title: 'Moteurs 100% cuivre',
    text: "Résistance accrue à la chaleur continue et aux variations de tension.",
  },
  {
    icon: MessageCircle,
    title: 'Conseil avant commande',
    text: 'On vérifie la compatibilité avec votre pièce avant de valider.',
  },
]

export default function CatalogueGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = useMemo(() => getProductsByCategory(activeCategory), [activeCategory])

  return (
    <>
      {/* Filtres — pilules, style référence client */}
      <div className="sticky top-[73px] z-30 bg-bg-primary/95 backdrop-blur-md border-y border-border">
        <div className="container-site">
          <div className="flex items-center gap-2 overflow-x-auto py-3.5 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={isSelected}
                  className={`flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-text-primary text-white'
                      : 'bg-bg-secondary text-text-body hover:bg-bg-tertiary hover:text-text-primary'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <section className="bg-bg-secondary py-16 md:py-20">
        <div className="container-site">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-heading font-semibold text-text-primary text-2xl sm:text-3xl">
                {categories.find((c) => c.id === activeCategory)?.label}
              </h2>
              <p className="text-sm text-text-muted mt-1.5">
                {filtered.length} référence{filtered.length > 1 ? 's' : ''} disponible
                {filtered.length > 1 ? 's' : ''} à Dakar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Réassurance — liste horizontale, pas 3 cartes identiques */}
          <ul className="mt-16 plinth p-8 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {reassurances.map((r) => {
              const Icon = r.icon
              return (
                <li key={r.title} className="flex items-start gap-4">
                  <Icon size={22} className="text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-heading font-medium text-text-primary text-base leading-snug">
                      {r.title}
                    </h3>
                    <p className="text-sm text-text-body mt-1.5 leading-relaxed">{r.text}</p>
                  </div>
                </li>
              )
            })}
          </ul>

        </div>
      </section>
    </>
  )
}
