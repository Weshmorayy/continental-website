import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { products } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'

export default function CatalogueApercu() {
  const previewProducts = products.slice(0, 4)

  return (
    <section className="bg-bg-secondary py-16 md:py-24 border-b border-border">
      <div className="container-site">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-3">
              <span className="w-6 h-0.5 bg-accent" />
              <span>COLLECTION 2026</span>
            </div>
            <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl md:text-5xl tracking-tight">
              Aperçu des modèles disponibles.
            </h2>
          </div>

          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 font-bold text-accent hover:text-accent-hover text-sm tracking-wider uppercase group"
          >
            <ShoppingBag size={16} />
            <span>Tous les modèles ({products.length})</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grille 4 colonnes de produits isolés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Bannière d'ambiance intégrée */}
        <div className="mt-12 bg-white border-2 border-border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-text-primary text-xl">
                Besoin d&apos;un conseil technique personnalisé ?
              </h3>
              <p className="text-text-body text-sm mt-0.5">
                Nos techniciens vous orientent selon la surface de vos pièces et votre budget.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/221770000000?text=Bonjour%20Continental,%20j'ai%20besoin%20d'aide%20pour%20choisir%20mon%20appareil."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent px-6 py-3 text-xs font-bold uppercase tracking-wider flex-shrink-0"
          >
            Conseil WhatsApp
          </a>
        </div>

      </div>
    </section>
  )
}
