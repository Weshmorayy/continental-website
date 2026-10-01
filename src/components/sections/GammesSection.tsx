import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

const gammes = [
  {
    eyebrow: 'Gamme ventilation',
    title: 'Ventilateurs pied, sol & muraux',
    intro:
      "Brasseurs d'air gros débit, ventilateurs silencieux sur pied à télécommande et modèles industriels renforcés.",
    points: [
      '3 à 8 vitesses et modes brise naturelle',
      'Moteur bobiné cuivre longue durée de vie',
      'Garantie 2 ans avec service après-vente dédié',
    ],
    meta: 'Modèles dès 30.000 FCFA',
    cta: 'Voir les ventilateurs',
    href: '/catalogue?cat=ventilateur-pied',
    image: '/products/ventilateur-sol-louisiane-45cm.jpg',
    alt: 'Brasseur d\'air sol Continental',
    stock: 'En stock à Dakar',
  },
  {
    eyebrow: 'Gamme climatisation',
    title: 'Climatiseurs split Inverter tropicalisés',
    intro:
      "Splits de 9.000 à 18.000 BTU, jusqu'à 60% d'économie d'énergie grâce au compresseur Inverter.",
    points: [
      'Compresseur T3 tropicalisé certifié 55 °C',
      'Classe énergétique A+++',
      'Traitement anti air marin côtier',
    ],
    meta: '9.000 · 12.000 · 18.000 BTU',
    cta: 'Découvrir les splits',
    href: '/catalogue?cat=climatiseur',
    image: '/products/climatiseur-split-pro-inverter.jpg',
    alt: 'Climatiseur Inverter Continental',
    stock: 'Photos en cours',
  },
]

export default function GammesSection() {
  const [grande, petite] = gammes

  return (
    <section className="bg-bg-secondary py-20 md:py-28">
      <div className="container-site">

        <div className="max-w-2xl mb-14 md:mb-20">
          <p className="eyebrow mb-5">Nos deux gammes</p>
          <h2 className="font-heading font-semibold text-text-primary text-3xl sm:text-4xl md:text-[3.25rem] leading-[1.08] tracking-[-0.02em]">
            Deux façons de tenir la chaleur.
          </h2>
        </div>

        {/* Grille asymétrique 7/5 — pas deux cartes identiques */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Carte dominante */}
          <article className="lg:col-span-7 card-warm overflow-hidden flex flex-col">
            <div className="p-7 sm:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="product-ref text-accent tracking-[0.14em]">{grande.eyebrow}</span>
                <span className="w-1 h-1 rounded-full bg-border-dark" aria-hidden="true" />
                <span className="text-xs text-text-muted">{grande.stock}</span>
              </div>

              <h3 className="font-heading font-semibold text-text-primary text-2xl sm:text-3xl leading-tight mb-3">
                {grande.title}
              </h3>
              <p className="text-text-body leading-relaxed mb-7 max-w-lg">{grande.intro}</p>

              <ul className="space-y-3">
                {grande.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-text-body">
                    <Check size={16} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Scène produit blanche — le produit est le héros */}
            <div className="relative h-72 sm:h-80 w-full bg-white border-t border-border">
              <Image
                src={grande.image}
                alt={grande.alt}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            </div>

            <div className="p-6 sm:p-7 bg-bg-secondary border-t border-border flex flex-wrap items-center justify-between gap-4">
              <span className="product-ref text-text-muted">{grande.meta}</span>
              <Link href={grande.href} className="btn-accent px-6 py-3">
                {grande.cta}
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>

          {/* Carte secondaire, décalée vers le bas */}
          <article className="lg:col-span-5 lg:mt-16 card-warm overflow-hidden flex flex-col">
            <div className="p-7 sm:p-9">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="product-ref text-accent tracking-[0.14em]">{petite.eyebrow}</span>
                <span className="w-1 h-1 rounded-full bg-border-dark" aria-hidden="true" />
                <span className="text-xs text-text-muted">{petite.stock}</span>
              </div>

              <h3 className="font-heading font-semibold text-text-primary text-2xl leading-tight mb-3">
                {petite.title}
              </h3>
              <p className="text-text-body text-sm leading-relaxed mb-6">{petite.intro}</p>

              <ul className="space-y-2.5">
                {petite.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-text-body">
                    <Check size={15} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative h-56 w-full bg-white border-t border-border">
              <Image
                src={petite.image}
                alt={petite.alt}
                fill
                className="object-contain p-7"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            <div className="p-6 bg-bg-secondary border-t border-border flex flex-wrap items-center justify-between gap-4">
              <span className="product-ref text-text-muted">{petite.meta}</span>
              <Link href={petite.href} className="link-warm text-sm">
                {petite.cta}
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>

        </div>
      </div>
    </section>
  )
}
