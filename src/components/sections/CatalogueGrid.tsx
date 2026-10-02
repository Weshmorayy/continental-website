'use client'

import { useState, useMemo } from 'react'
import { products, categories, getProductsByCategory } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'
import { ShieldCheck, Wind, MessageCircle } from 'lucide-react'

const reassurances = [
  {
    icon: ShieldCheck,
    title: 'Garantie 24 mois',
    text: 'Remplacement ou réparation rapide, pris en charge par notre équipe technique.',
  },
  {
    icon: Wind,
    title: 'Moteurs 100% cuivre',
    text: 'Résistance accrue à la chaleur continue et aux variations de tension.',
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
      {/* Filtres — pastilles, comme samsung.com */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white hairline">
        <div className="container-site">
          <div className="flex items-center gap-2 overflow-x-auto py-3.5 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={isSelected}
                  className={`flex-shrink-0 rounded-full px-5 py-2.5 text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-text-primary text-white font-semibold'
                      : 'bg-bg-secondary text-text-body hover:bg-bg-tertiary'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-site">

          <div className="mb-10">
            <h2 className="display-lg text-text-primary" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
              {categories.find((c) => c.id === activeCategory)?.label}
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              {filtered.length} référence{filtered.length > 1 ? 's' : ''} disponible
              {filtered.length > 1 ? 's' : ''} à Dakar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Réassurance — lignes avec filets, pas 3 cartes identiques */}
          <ul className="mt-16 bg-bg-secondary rounded-2xl px-8 sm:px-10 py-9 grid grid-cols-1 md:grid-cols-3 gap-8">
            {reassurances.map((r) => {
              const Icon = r.icon
              return (
                <li key={r.title} className="flex items-start gap-4">
                  <Icon size={22} strokeWidth={1.5} className="text-text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="display-sm text-base text-text-primary">{r.title}</h3>
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
