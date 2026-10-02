import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'

const bestseller = {
  ref: 'CT-12INV-PRO',
  name: 'Climatiseur Split Inverter 12000 BTU Tropicalisé',
  slug: 'climatiseur-split-pro-inverter',
  image: '/products/climatiseur-split-pro-inverter.png',
  price: 195000,
  features: [
    "Compresseur Inverter intelligent : jusqu'à 60% d'économie d'énergie",
    'Mode Nuit Ultra Silencieux (21 dB) pour un sommeil sans perturbation',
    'Revêtement Gold Fin résistant à la corrosion saline',
    'Filtre antibactérien haute densité et purification active de l’air',
  ],
}

export default function BestsellerSection() {
  const waUrl = buildWhatsAppUrl(
    buildOrderMessage({ productName: bestseller.name, ref: bestseller.ref })
  )

  return (
    <section className="bg-bg-secondary py-20 sm:py-28">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Produit sur surface grise — le visuel est le héros */}
          <div className="lg:col-span-7">
            <div className="stage relative aspect-[4/3] w-full">
              <Image
                src={bestseller.image}
                alt={bestseller.name}
                fill
                className="object-contain p-12 sm:p-16"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <span className="absolute top-6 left-6 rounded-full bg-text-primary text-white px-4 py-1.5 text-xs font-semibold">
                Modèle bestseller
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="eyebrow">Notre plus vendu</p>

            <h2 className="display-lg text-text-primary mt-4" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              {bestseller.name}
            </h2>

            <p className="mt-3 text-sm text-text-muted">Réf. {bestseller.ref} · Garantie 2 ans</p>

            <ul className="mt-8 space-y-3.5">
              {bestseller.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-text-body leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-9 pt-8 hairline">
              <span className="product-ref text-text-muted">Prix Continental® Dakar</span>
              <p className="display-md text-text-primary text-3xl mt-1">
                {bestseller.price.toLocaleString('fr-FR')}{' '}
                <span className="text-lg font-medium text-text-muted">FCFA</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-accent">
                  <MessageCircle size={17} />
                  Commander
                </a>
                <Link href={`/produit/${bestseller.slug}`} className="btn-outline">
                  Fiche complète
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
