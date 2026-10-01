import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Check } from 'lucide-react'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'

const bestseller = {
  ref: 'CT-12INV-PRO',
  name: 'Climatiseur Split Inverter 12000 BTU Tropicalisé',
  slug: 'climatiseur-split-pro-inverter',
  image: '/products/climatiseur-split-pro-inverter.jpg',
  price: 195000,
  features: [
    'Refroidissement ultra-rapide conçu pour les chaleurs de Dakar',
    "Compresseur Inverter intelligent : jusqu'à 60% d'économie d'énergie",
    "Filtre antibactérien haute densité et purification active de l'air",
    'Mode Nuit Ultra Silencieux (21 dB) pour un sommeil sans perturbation',
    'Revêtement Gold Fin résistant à la corrosion saline',
  ],
}

export default function BestsellerSection() {
  const waUrl = buildWhatsAppUrl(
    buildOrderMessage({ productName: bestseller.name, ref: bestseller.ref })
  )

  return (
    <section className="bg-bg-primary py-20 md:py-28">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Scène produit — focus block blanc, beaucoup d'air */}
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="relative aspect-square w-full plinth p-10 sm:p-14 flex items-center justify-center">
                <Image
                  src={bestseller.image}
                  alt={bestseller.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              <span className="absolute -top-3 left-6 sm:left-8 rounded-full bg-accent-light text-accent px-4 py-1.5 text-[11px] product-ref tracking-[0.14em]">
                Modèle bestseller
              </span>
            </div>
          </div>

          {/* Contenu */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <p className="eyebrow mb-5">Notre plus vendu</p>

            <div className="flex items-center gap-3 mb-4">
              <span className="product-ref text-text-muted">Réf. {bestseller.ref}</span>
              <span className="w-1 h-1 rounded-full bg-border-dark" aria-hidden="true" />
              <span className="text-xs font-medium text-text-muted">Garantie 2 ans</span>
            </div>

            <h2 className="font-heading font-semibold text-text-primary text-3xl sm:text-4xl leading-[1.12] tracking-[-0.015em] mb-5">
              {bestseller.name}
            </h2>

            <p className="text-text-body leading-relaxed mb-8 max-w-lg">
              L&apos;alliance parfaite entre puissance de refroidissement immédiate et
              facture d&apos;électricité maîtrisée. L&apos;appareil idéal pour chambres spacieuses
              et salons de 20 à 35 m².
            </p>

            <ul className="space-y-3.5 w-full mb-9">
              {bestseller.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-text-body">
                  <Check size={16} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Prix + conversion */}
            <div className="w-full pt-7 border-t border-border">
              <span className="product-ref text-text-muted block mb-1.5">Prix Continental® Dakar</span>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <span className="price-tag" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.5rem)' }}>
                  {bestseller.price.toLocaleString('fr-FR')}{' '}
                  <span className="text-text-primary font-semibold">FCFA</span>
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent"
                  >
                    <MessageCircle size={17} />
                    Commander sur WhatsApp
                  </a>
                  <Link href={`/produit/${bestseller.slug}`} className="btn-outline-dark">
                    Fiche complète
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
