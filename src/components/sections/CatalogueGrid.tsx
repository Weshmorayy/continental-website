'use client'

import { Suspense } from 'react'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product } from '@/data/products'
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

interface CatalogueGridProps {
  products: Product[]
  categories: { id: string; label: string }[]
}

/**
 * Reçoit ses produits du serveur : le composant ne connaît pas la source.
 * Un catalogue alimenté par l'admin et un catalogue local se rendent
 * exactement de la même façon.
 */
export default function CatalogueGrid({ products, categories }: CatalogueGridProps) {
  /*
   * Le filtre suit l'URL : `?cat=tv`.
   *
   * Les cartes « nos gammes » de l'accueil renvoient toutes vers
   * `/catalogue?cat=…`. Avant, ce paramètre était ignoré : le visiteur
   * arrivait sur le catalogue entier, et un lien qui promet « les modèles de
   * cette gamme » mensait. L'état est donc initialisé depuis l'URL, puis
   * l'URL est mise à jour à chaque changement de filtre — le bouton
   * « précédent » du navigateur ramène alors au filtre précédent au lieu de
   * sortir du catalogue.
   *
   * `useSearchParams` force le rendu côté client pour ce sous-arbre : la page
   * doit l'entourer d'un `<Suspense>`, sans quoi Next refuse de la
   * pré-rendre (erreur « useSearchParams() should be wrapped in a suspense
   * boundary »). C'est le rôle du `CatalogueGridLazy` en bas de fichier.
   */
  const searchParams = useSearchParams()
  const catFromUrl = searchParams.get('cat')

  /*
   * Une catégorie supprimée du catalogue ne doit pas laisser la page vide :
   * si le slug de l'URL ne correspond plus à rien, on retombe sur « tout ».
   */
  const initial = catFromUrl && categories.some((c) => c.id === catFromUrl) ? catFromUrl : 'all'
  const [activeCategory, setActiveCategory] = useState<string>(initial)

  const filtered = useMemo(
    () => activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory),
    [products, activeCategory],
  )

  /** Changer de filtre écrit aussi dans l'URL. `replace: false` : l'historique
      doit contenir les étapes du parcours, sinon « retour » perd le filtre. */
  const select = (id: string) => {
    setActiveCategory(id)
    const url = new URL(window.location.href)
    if (id === 'all') url.searchParams.delete('cat')
    else url.searchParams.set('cat', id)
    window.history.pushState(null, '', url.toString())
  }

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
                  onClick={() => select(cat.id)}
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

/**
 * Enveloppe de rendu différé.
 *
 * `useSearchParams` suspend le composant au premier rendu : sans cette
 * frontière, la pré-rendu de `/catalogue` échoue à la compilation. Elle est
 * définie ici plutôt que dans la page pour que le contrat reste au même
 * endroit que la contrainte qu'il apaise.
 */
export function CatalogueGridLazy(props: CatalogueGridProps) {
  return (
    <Suspense fallback={<div className="container-site py-20" aria-busy="true" />}>
      <CatalogueGrid {...props} />
    </Suspense>
  )
}
