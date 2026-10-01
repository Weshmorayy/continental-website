import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { products } from '@/data/products'
import { siteConfig } from '@/config/site'
import ProductCard from '@/components/ui/ProductCard'

export default function CatalogueApercu() {
  const previewProducts = products.slice(0, 4)

  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    "Bonjour Continental, j'ai besoin d'aide pour choisir mon appareil."
  )}`

  return (
    <section className="bg-bg-primary py-20 md:py-28">
      <div className="container-site">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="eyebrow mb-5">Collection 2026</p>
            <h2 className="font-heading font-semibold text-text-primary text-3xl sm:text-4xl md:text-[3rem] leading-[1.1] tracking-[-0.02em]">
              Quelques modèles en stock.
            </h2>
          </div>

          <Link href="/catalogue" className="btn-outline-dark flex-shrink-0">
            Tous les modèles ({products.length})
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {previewProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Bandeau conseil — intégré, pas une section centrée isolée */}
        <div className="mt-16 bg-bg-secondary rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-7">
          <div className="max-w-xl">
            <h3 className="font-heading font-semibold text-text-primary text-2xl leading-snug mb-2">
              Pas sûr du modèle adapté à votre pièce ?
            </h3>
            <p className="text-text-body text-sm leading-relaxed">
              Dites-nous la surface de la pièce et votre budget, on vous conseille un modèle
              précis — sans vous faire perdre de temps au téléphone.
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent flex-shrink-0"
          >
            <MessageCircle size={17} />
            Demander un conseil
          </a>
        </div>

      </div>
    </section>
  )
}
