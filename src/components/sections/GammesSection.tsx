import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { getBlocks } from '@/lib/atelier'

/**
 * Introduction des deux gammes.
 *
 * Ces cartes NE doivent PAS montrer de photo produit isolée : la section
 * introduit une promesse (fraîcheur / confort), pas une fiche technique.
 * Le produit appartient au catalogue.
 *
 * Le visuel est donc une scène en `object-cover` au format 3:2.
 * Pour passer aux visuels promotionnels générés, remplacer simplement :
 *   /aesthetic/aesthetic-fan-livingroom.jpg     → /aesthetic/promo-ventilation.jpg
 *   /aesthetic/aesthetic-breeze-bedroom-1.jpg  → /aesthetic/promo-climatisation.jpg
 * (voir .docs/AI_IMAGE_PROMPTS.md)
 */
const gammes = [
  {
    eyebrow: 'Gamme ventilation',
    title: 'Ventilateurs pied, sol & muraux',
    intro:
      "Brasseurs d'air gros débit, ventilateurs silencieux sur pied à télécommande et modèles industriels renforcés.",
    meta: 'Modèles dès 30.000 FCFA',
    cta: 'Voir les ventilateurs',
    href: '/catalogue?cat=ventilateur-pied',
    image: '/aesthetic/aesthetic-fan-livingroom.jpg',
    alt: 'Ventilateur Continental dans un salon lumineux et aéré',
  },
  {
    eyebrow: 'Gamme climatisation',
    title: 'Climatiseurs split Inverter tropicalisés',
    intro:
      "Splits de 9.000 à 18.000 BTU, jusqu'à 60% d'économie d'énergie grâce au compresseur Inverter.",
    meta: '9.000 · 12.000 · 18.000 BTU',
    cta: 'Découvrir les splits',
    href: '/catalogue?cat=climatiseur',
    image: '/aesthetic/aesthetic-breeze-bedroom-1.jpg',
    alt: 'Chambre fraîche avec climatiseur split mural',
  },
]

export default async function GammesSection() {
  const blocks = await getBlocks('gammes')
  const byKey = new Map(blocks.map((b) => [b.key, b]))

  const heading = byKey.get('heading')
  const footer  = byKey.get('footer')

  // Les deux cartes : le repli reprend exactement le texte d'origine, pour que
  // l'absence de base ne change rien à la page.
  const ranges = [
    {
      fallback: {
        eyebrow: 'Gamme ventilation',
        title: 'Ventilateurs pied, sol & muraux',
        intro: "Brasseurs d'air gros débit, ventilateurs silencieux sur pied à télécommande et modèles industriels renforcés.",
        meta: 'Modèles dès 30.000 FCFA',
        cta: 'Voir les ventilateurs',
        href: '/catalogue?cat=ventilateur-pied',
        image: '/aesthetic/aesthetic-fan-livingroom.jpg',
        alt: 'Ventilateur Continental dans un salon lumineux et aéré',
      },
      key: 'gamme-1',
    },
    {
      fallback: {
        eyebrow: 'Gamme climatisation',
        title: 'Climatiseurs split Inverter tropicalisés',
        intro: "Splits de 9.000 à 18.000 BTU, jusqu'à 60% d'économie d'énergie grâce au compresseur Inverter.",
        meta: '9.000 · 12.000 · 18.000 BTU',
        cta: 'Découvrir les splits',
        href: '/catalogue?cat=climatiseur',
        image: '/aesthetic/aesthetic-breeze-bedroom-1.jpg',
        alt: 'Chambre fraîche avec climatiseur split mural',
      },
      key: 'gamme-2',
    },
  ].map(({ fallback, key }) => {
    const b = byKey.get(key)
    return b ? {
      eyebrow: b.eyebrow ?? fallback.eyebrow,
      title:   b.title   ?? fallback.title,
      intro:   b.body    ?? fallback.intro,
      meta:    b.meta    ?? fallback.meta,
      cta:     b.ctaLabel ?? fallback.cta,
      href:    b.ctaHref  ?? fallback.href,
      image:   b.image    ?? fallback.image,
      alt:     b.imageAlt ?? fallback.alt,
    } : fallback
  })

  return (
    <section className="bg-bg-secondary py-20 sm:py-28">
      <div className="container-site">

        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <p className="eyebrow eyebrow-center">
            {heading?.eyebrow ?? 'Nos deux gammes'}
          </p>
          <h2
            className="display-lg text-text-primary mt-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
          >
            {heading?.title ?? 'Deux façons de tenir la chaleur.'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {ranges.map((g) => (
            <article
              key={g.eyebrow}
              className="group flex flex-col bg-white border border-border rounded-[20px] overflow-hidden transition-colors duration-200 hover:border-text-primary"
            >
              {/* Scène promotionnelle — pas de photo produit isolée */}
              <Link href={g.href} className="block relative w-full aspect-[3/2] overflow-hidden">
                <Image
                  src={g.image}
                  alt={g.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </Link>

              <div className="px-7 sm:px-9 py-8 flex flex-col flex-1">
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

        <p className="mt-10 text-center text-sm text-text-muted">
          {footer?.title ?? 'Livraison à Dakar et banlieue · Paiement à la réception'} ·{' '}
          <a
            href={`tel:${siteConfig.contact.whatsapp}`}
            className="text-text-primary font-medium"
          >
            {siteConfig.contact.phone}
          </a>
        </p>

      </div>
    </section>
  )
}
