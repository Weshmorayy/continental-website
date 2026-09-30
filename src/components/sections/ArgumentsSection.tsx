import { ShieldCheck, Award, Zap, Truck } from 'lucide-react'

const differentiators = [
  {
    num: '01',
    icon: Award,
    title: 'Moteur 100% Cuivre Pur',
    subtitle: 'Rendement & Longévité Supérieurs',
    desc: 'Contrairement aux moteurs standard en aluminium qui surchauffent et s\'usent en quelques mois, nos bobinages en cuivre pur résistent aux longues heures d\'utilisation continue sous forte chaleur.',
  },
  {
    num: '02',
    icon: ShieldCheck,
    title: 'Garantie Constructeur 2 Ans',
    subtitle: 'Pièces & Main-d\'Œuvre Incluses',
    desc: 'Chaque appareil Continental® bénéficie d\'une garantie ferme de 24 mois. Notre service technique basé à Dakar intervient rapidement pour tout besoin de maintenance ou d\'échange.',
  },
  {
    num: '03',
    icon: Zap,
    title: 'Performance Énergétique',
    subtitle: 'Consommation Optimisée',
    desc: 'Des compresseurs Inverter tropicalisés et des pales aérodynamiques étudiées pour délivrer un débit d\'air maximal tout en réduisant significativement votre facture Woyofal.',
  },
  {
    num: '04',
    icon: Truck,
    title: 'Livraison Rapide Dakar',
    subtitle: 'Paiement à la Réception',
    desc: 'Service de livraison réactif à Dakar Plateau, Almadies, Ouakam, Médina, Guédiawaye, Pikine et Rufisque. Possibilité de tester l\'appareil à la livraison avant règlement.',
  },
]

export default function ArgumentsSection() {
  return (
    <section className="bg-bg-dark text-text-light py-20 md:py-28 border-b border-border-dark relative overflow-hidden">
      <div className="container-site relative z-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-accent-light font-mono font-bold text-xs uppercase tracking-widest mb-3">
            <span className="w-6 h-0.5 bg-accent" />
            <span>STANDARDS INDUSTRIELS CONTINENTAL®</span>
          </div>
          <h2 className="font-heading font-black text-white text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
            Pourquoi Continental fait la différence.
          </h2>
          <p className="text-text-light-sub text-base md:text-lg mt-3 font-normal leading-relaxed">
            Dans un marché saturé d&apos;appareils bas de gamme, Continental® s&apos;engage
            sur la durabilité, la précision mécanique et un service local de proximité.
          </p>
        </div>

        {/* Grille 4 colonnes haute visibilité */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((diff) => {
            const IconComponent = diff.icon
            return (
              <div
                key={diff.num}
                className="bg-bg-dark-card border-2 border-border-dark hover:border-accent p-8 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  {/* Top Bar : Numéro & Icône bien visibles */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-heading font-black text-4xl text-accent">
                      {diff.num}
                    </span>
                    <div className="w-10 h-10 rounded-none bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-light group-hover:bg-accent group-hover:text-white transition-colors">
                      <IconComponent size={20} />
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-white text-2xl tracking-wide mb-1 leading-snug">
                    {diff.title}
                  </h3>
                  <p className="font-mono text-xs font-bold text-accent-light uppercase tracking-wider mb-4">
                    {diff.subtitle}
                  </p>
                  <p className="text-text-light-sub text-sm leading-relaxed font-normal">
                    {diff.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border-dark/60 flex items-center gap-2 text-xs font-mono text-text-light-mute">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Standard Continental®</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
