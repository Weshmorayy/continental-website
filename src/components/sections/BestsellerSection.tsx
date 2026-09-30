import Image from 'next/image'
import { MessageCircle, Check } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'

const bestseller = {
  ref: 'FS40-1891R',
  name: 'Ventilateur sur Pied 16" Elite',
  slug: 'stand-fan-fs40-1891r',
  image: '/products/stand-fan-fs40-1891r.jpg',
  price: 30000,
  features: [
    '3 vitesses de fonctionnement',
    'Minuterie 7.5 heures',
    'Télécommande de précision incluse',
    'Fonctionnement très silencieux',
    'Inclinaison et oscillation de la tête',
    'Hauteur ajustable',
  ],
}

export default function BestsellerSection() {
  const waMessage = buildOrderMessage({ productName: bestseller.name, ref: bestseller.ref })
  const waUrl = buildWhatsAppUrl(waMessage)

  return (
    <section className="bg-bg-secondary py-20 md:py-28">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* Texte — gauche */}
          <div className="flex flex-col gap-6 order-2 md:order-1">
            <div className="flex flex-col gap-2">
              <p className="product-ref tracking-[0.25em] text-text-muted">MODÈLE {bestseller.ref}</p>
              <h2 className="font-heading font-bold text-text-primary text-4xl md:text-5xl leading-tight">
                Élégance et fraîcheur.<br />
                16 pouces sur pied.
              </h2>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-2.5 mt-2">
              {bestseller.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check size={15} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-text-body text-sm">{f}</span>
                </li>
              ))}
            </ul>

            {/* Badge garantie */}
            <div className="inline-flex items-center gap-3 border border-border bg-bg-primary px-4 py-3 self-start mt-1">
              <div className="w-8 h-8 bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="font-heading font-black text-accent text-xs">2A</span>
              </div>
              <div>
                <p className="text-xs font-medium text-text-primary">Garantie 2 Ans</p>
                <p className="text-xs text-text-muted">Qualité Continentale</p>
              </div>
            </div>

            {/* Prix + CTA */}
            <div className="flex items-center gap-6 mt-2 pt-6 border-t border-border">
              <div>
                <p className="product-ref text-text-muted mb-1">Prix indicatif</p>
                <span className="price-tag" style={{ fontSize: '2rem' }}>
                  {bestseller.price.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent px-6 py-3.5 text-sm tracking-wide"
              >
                <MessageCircle size={16} />
                Commander
              </a>
            </div>
          </div>

          {/* Image — droite */}
          <div className="relative order-1 md:order-2">
            <div className="relative h-80 md:h-[500px] bg-white">
              <Image
                src={bestseller.image}
                alt={`${bestseller.name} — Réf. ${bestseller.ref}`}
                fill
                className="object-contain p-6 md:p-10"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {/* Étiquette bestseller */}
            <div className="absolute -top-4 -right-4 bg-accent px-4 py-2 rotate-1">
              <p className="font-heading font-bold text-white text-sm tracking-wide uppercase">Best-seller</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
