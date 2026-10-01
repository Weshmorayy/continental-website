import { ShieldCheck, Award, Zap, Truck } from 'lucide-react'

const differentiators = [
  {
    num: '01',
    icon: Award,
    title: 'Moteur 100% cuivre pur',
    desc: "Contrairement aux moteurs standard en aluminium qui surchauffent et s'usent en quelques mois, nos bobinages en cuivre pur résistent aux longues heures d'utilisation continue sous forte chaleur.",
    meta: 'Rendement & longévité',
  },
  {
    num: '02',
    icon: ShieldCheck,
    title: 'Garantie constructeur 2 ans',
    desc: "Chaque appareil bénéficie d'une garantie ferme de 24 mois, pièces et main-d'œuvre incluses. Notre service technique basé à Dakar intervient rapidement.",
    meta: 'Pièces incluses',
  },
  {
    num: '03',
    icon: Zap,
    title: 'Performance énergétique',
    desc: "Des compresseurs Inverter tropicalisés et des pales aérodynamiques étudiées pour délivrer un débit d'air maximal tout en réduisant la facture.",
    meta: 'Consommation optimisée',
  },
  {
    num: '04',
    icon: Truck,
    title: 'Livraison rapide à Dakar',
    desc: "Dakar Plateau, Almadies, Ouakam, Médina, Guédiawaye, Pikine et Rufisque. Paiement à la réception, et vous testez l'appareil avant de valider.",
    meta: 'Paiement à la livraison',
  },
]

export default function ArgumentsSection() {
  const [first, ...rest] = differentiators

  return (
    <section className="bg-bg-tertiary py-20 md:py-28">
      <div className="container-site">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 md:mb-20">
          <div className="max-w-2xl">
            <p className="eyebrow mb-5">Nos engagements</p>
            <h2 className="font-heading font-semibold text-text-primary text-3xl sm:text-4xl md:text-[3.25rem] leading-[1.08] tracking-[-0.02em]">
              Ce qui sépare Continental du reste.
            </h2>
          </div>
          <p className="text-text-body leading-relaxed lg:max-w-sm lg:text-right">
            Dans un marché saturé d&apos;appareils bas de gamme, nous misons sur la
            durabilité et un service local de proximité.
          </p>
        </div>

        {/* Grille asymétrique — la première carte domine, pas 4 cartes identiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">

          {/* Grande carte 4 colonnes */}
          <article className="lg:col-span-4 bg-bg-primary rounded-3xl p-8 sm:p-10 border border-border flex flex-col justify-between min-h-[22rem]">
            <div>
              <div className="flex items-center gap-4 mb-7">
                <span className="font-heading font-semibold text-5xl text-accent leading-none">
                  {first.num}
                </span>
                <Award size={30} className="text-text-primary opacity-80" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading font-semibold text-text-primary text-2xl sm:text-3xl leading-tight mb-4">
                {first.title}
              </h3>
              <p className="text-text-body leading-relaxed max-w-lg">{first.desc}</p>
            </div>
            <p className="product-ref text-text-muted mt-8 pt-5 border-t border-border">
              {first.meta}
            </p>
          </article>

          {/* Carte 2 colonnes */}
          <article className="lg:col-span-2 bg-bg-primary rounded-3xl p-8 border border-border flex flex-col justify-between min-h-[22rem]">
            <div>
              <span className="font-heading font-semibold text-4xl text-accent leading-none block mb-6">
                {rest[0].num}
              </span>
              <h3 className="font-heading font-semibold text-text-primary text-xl leading-snug mb-3">
                {rest[0].title}
              </h3>
              <p className="text-text-body text-sm leading-relaxed">{rest[0].desc}</p>
            </div>
            <p className="product-ref text-text-muted mt-6 pt-4 border-t border-border">
              {rest[0].meta}
            </p>
          </article>

          {/* Deux cartes égales */}
          {rest.slice(1).map((d) => {
            const Icon = d.icon
            return (
              <article
                key={d.num}
                className="lg:col-span-3 bg-bg-primary rounded-3xl p-8 sm:p-9 border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-heading font-semibold text-4xl text-accent leading-none">
                      {d.num}
                    </span>
                    <Icon size={26} className="text-text-primary opacity-70" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading font-semibold text-text-primary text-xl leading-snug mb-3">
                    {d.title}
                  </h3>
                  <p className="text-text-body text-sm leading-relaxed">{d.desc}</p>
                </div>
                <p className="product-ref text-text-muted mt-6 pt-4 border-t border-border">
                  {d.meta}
                </p>
              </article>
            )
          })}

        </div>
      </div>
    </section>
  )
}
