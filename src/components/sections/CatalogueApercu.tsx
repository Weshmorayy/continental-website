import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { products } from '@/data/products'
import { siteConfig } from '@/config/site'
import ProductCard from '@/components/ui/ProductCard'

export default function CatalogueApercu() {
  const previewProducts = products.slice(0, 4)

  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    "Bonjour Continental, j'ai besoin d'aide pour choisir mon appareil."
  )}`

  return (
    <section className="bg-bg-primary py-20 sm:py-28">
      <div className="container-site">

        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <p className="eyebrow eyebrow-center">Collection 2026</p>
          <h2 className="display-lg text-text-primary mt-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            Quelques modèles en stock.
          </h2>
        </div>

        {/* Rangée façon carrousel : la carte suivante dépasse à droite,
            comme sur samsung.com. Molette et tactile fonctionnent. */}
        <div className="carousel-row -mx-5 px-5 sm:mx-0 sm:px-0 pb-2">
          {previewProducts.map((p) => (
            <div key={p.id} className="w-[78vw] max-w-[340px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/catalogue" className="btn-outline">
            Tous les modèles ({products.length})
          </Link>
        </div>

        {/* Bandeau conseil — pleine largeur, ton gris */}
        <div className="mt-16 bg-bg-secondary rounded-2xl px-8 py-10 sm:px-12 sm:py-12 text-center">
          <h3 className="display-md text-text-primary text-2xl sm:text-3xl">
            Pas sûr du modèle adapté à votre pièce ?
          </h3>
          <p className="mt-3 text-text-body max-w-xl mx-auto">
            Donnez-nous la surface de la pièce et votre budget, on vous conseille un modèle
            précis — sans vous faire perdre de temps au téléphone.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa mt-7"
          >
            <MessageCircle size={17} />
            Demander un conseil
          </a>
        </div>

      </div>
    </section>
  )
}
