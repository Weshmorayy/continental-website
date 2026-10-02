import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

const gammes = [
  {
    eyebrow: 'Gamme ventilation',
    title: 'Ventilateurs pied, sol & muraux',
    intro:
      "Brasseurs d'air gros débit, ventilateurs silencieux sur pied à télécommande et modèles industriels renforcés.",
    meta: 'Modèles dès 30.000 FCFA',
    cta: 'Voir les ventilateurs',
    href: '/catalogue?cat=ventilateur-pied',
    image: '/products/ventilateur-sol-louisiane-45cm.png',
    alt: 'Brasseur d’air sol Continental',
  },
  {
    eyebrow: 'Gamme climatisation',
    title: 'Climatiseurs split Inverter tropicalisés',
    intro:
      "Splits de 9.000 à 18.000 BTU, jusqu'à 60% d'économie d'énergie grâce au compresseur Inverter.",
    meta: '9.000 · 12.000 · 18.000 BTU',
    cta: 'Découvrir les splits',
    href: '/catalogue?cat=climatiseur',
    image: '/products/climatiseur-split-pro-inverter.png',
    alt: 'Climatiseur Inverter Continental',
  },
]

export default function GammesSection() {
  return (
    <section className="bg-bg-primary py-20 sm:py-28">
      <div className="container-site">

        {/* Ouverture centrée, comme samsung.com */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <p className="eyebrow eyebrow-center">Nos deux gammes</p>
          <h2 className="display-lg text-text-primary mt-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            Deux façons de tenir la chaleur.
          </h2>
          <p className="mt-5 text-text-body">
            Chaque appareil est sélectionné et testé pour les conditions de Dakar.
          </p>
        </div>

        {/* Deux grandes tuiles grises, sans bordure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {gammes.map((g) => (
            <article key={g.eyebrow} className="stage overflow-hidden flex flex-col">
              <div className="relative h-72 sm:h-80 w-full">
                <Image
                  src={g.image}
                  alt={g.alt}
                  fill
                  className="object-contain p-10"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              <div className="px-7 sm:px-9 pb-8 flex flex-col flex-1">
                <p className="eyebrow">{g.eyebrow}</p>

                <h3 className="display-md text-text-primary text-2xl sm:text-3xl mt-3">
                  {g.title}
                </h3>

                <p className="mt-3 text-text-body text-sm leading-relaxed">{g.intro}</p>

                <div className="mt-auto pt-7 flex flex-wrap items-center justify-between gap-4">
                  <span className="product-ref text-text-muted">{g.meta}</span>
                  <Link href={g.href} className="link-underline text-text-primary text-sm">
                    <span>{g.cta}</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Rappel des services — reprise de données existantes, rien d'inventé */}
        <p className="mt-10 text-center text-sm text-text-muted">
          Livraison à Dakar et banlieue · Paiement à la réception ·{' '}
          <a href={`tel:${siteConfig.contact.whatsapp}`} className="text-text-primary font-medium">
            {siteConfig.contact.phone}
          </a>
        </p>

      </div>
    </section>
  )
}
