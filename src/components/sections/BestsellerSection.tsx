import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'
import { getBlock, getSupabaseProducts } from '@/lib/atelier'

const bestseller = {
  ref: 'CT-12INV-PRO',
  name: 'Climatiseur Split Inverter 12000 BTU Tropicalisé',
  slug: 'climatiseur-split-pro-inverter',
  image: '/products/climatiseur-split-pro-inverter.jpg',
  price: 195000,
  features: [
    "Compresseur Inverter intelligent : jusqu'à 60% d'économie d'énergie",
    'Mode Nuit Ultra Silencieux (21 dB) pour un sommeil sans perturbation',
    'Revêtement Gold Fin résistant à la corrosion saline',
    'Filtre antibactérien haute densité et purification active de l’air',
  ],
}

export default async function BestsellerSection() {
  const block = await getBlock('bestseller', 'bestseller')

  // Le produit vient du CATALOGUE : le bloc ne fait que désigner lequel mettre
  // en avant. Pas de fiche dupliquée, donc pas de prix qui divergent.
  const slug = String(block?.data.product_slug ?? 'climatiseur-split-pro-inverter')
  const products = await getSupabaseProducts()
  const fromDb = products.find((x) => x.slug === slug)
  const chosen = fromDb
    ? { name: fromDb.name, ref: fromDb.ref, image: fromDb.image || bestseller.image, price: fromDb.price }
    : { name: block?.title ?? bestseller.name, ref: block?.title ? '' : bestseller.ref,
        image: block?.image ?? bestseller.image, price: bestseller.price }

  const waUrl = buildWhatsAppUrl(buildOrderMessage({ productName: chosen.name, ref: chosen.ref }))

  const title  = block?.title ?? chosen.name
  const eyebrow = block?.eyebrow ?? 'Notre plus vendu'
  const badge = String(block?.data.badge ?? 'Modèle bestseller')
  const features = Array.isArray(block?.data.features) && (block!.data.features as string[]).length
    ? (block!.data.features as string[])
    : bestseller.features
  const priceLabel = new Intl.NumberFormat('fr-FR').format(chosen.price).replace(/\u202f/g, ' ') + ' FCFA'

  return (
    <section className="bg-bg-secondary py-20 sm:py-28">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Produit sur surface grise — le visuel est le héros */}
          <div className="lg:col-span-7">
            <div className="stage relative aspect-[4/3] w-full">
              <Image
                src={chosen.image}
                alt={title}
                fill
                className="object-contain p-12 sm:p-16"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <span className="absolute top-6 left-6 rounded-full bg-text-primary text-white px-4 py-1.5 text-xs font-semibold">
                {badge}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="eyebrow">{eyebrow}</p>

            <h2 className="display-lg text-text-primary mt-4" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
              {title}
            </h2>

            <p className="mt-3 text-sm text-text-muted">{chosen.ref ? `Réf. ${chosen.ref} · ` : ''}Garantie 2 ans</p>

            <ul className="mt-8 space-y-3.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-text-body leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-9 pt-8 hairline">
              <span className="product-ref text-text-muted">Prix Continental® Dakar</span>
              <p className="display-md text-text-primary text-3xl mt-1">
                {priceLabel.split(' FCFA')[0]}{' '}
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
