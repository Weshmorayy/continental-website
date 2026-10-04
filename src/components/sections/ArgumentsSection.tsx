import { ShieldCheck, Award, Zap, Truck } from 'lucide-react'
import { getBlocks } from '@/lib/atelier'

/** Icônes autorisées. Un nom inconnu ne casse pas le rendu : il est ignoré. */
const ICONS: Record<string, typeof Award> = { Award, ShieldCheck, Zap, Truck }

const engagements = [
  {
    num: '01',
    icon: Award,
    title: 'Moteur 100% cuivre pur',
    desc: "Nos bobinages en cuivre résistent aux longues heures d'utilisation continue sous forte chaleur, là où les moteurs en aluminium surchauffent.",
  },
  {
    num: '02',
    icon: ShieldCheck,
    title: 'Garantie constructeur 2 ans',
    desc: "24 mois pièces et main-d'œuvre, avec un service technique basé à Dakar qui intervient rapidement.",
  },
  {
    num: '03',
    icon: Zap,
    title: 'Performance énergétique',
    desc: "Compresseurs Inverter tropicalisés et pales aérodynamiques : un débit d'air maximal pour une facture maîtrisée.",
  },
  {
    num: '04',
    icon: Truck,
    title: 'Paiement à la livraison',
    desc: "Dakar Plateau, Almadies, Ouakam, Médina, Guédiawaye, Pikine et Rufisque. Vous testez l'appareil avant de valider.",
  },
]

export default async function ArgumentsSection() {
  const blocks = await getBlocks('engagements')
  const byKey = new Map(blocks.map((b) => [b.key, b]))
  const heading = byKey.get('heading')

  const fallbacks = [
    {
      num: '01', icon: 'Award', title: 'Moteur 100% cuivre pur',
      desc: "Nos bobinages en cuivre résistent aux longues heures d'utilisation continue sous forte chaleur, là où les moteurs en aluminium surchauffent.",
    },
    {
      num: '02', icon: 'ShieldCheck', title: 'Garantie constructeur 2 ans',
      desc: "24 mois pièces et main-d'œuvre, avec un service technique basé à Dakar qui intervient rapidement.",
    },
    {
      num: '03', icon: 'Zap', title: 'Performance énergétique',
      desc: 'Compresseurs Inverter tropicalisés et pales aérodynamiques : un débit d\'air maximal pour une facture maîtrisée.',
    },
    {
      num: '04', icon: 'Truck', title: 'Paiement à la livraison',
      desc: "Dakar Plateau, Almadies, Ouakam, Médina, Guédiawaye, Pikine et Rufisque. Vous testez l'appareil avant de valider.",
    },
  ]

  const items = fallbacks.map((f) => {
    const b = byKey.get(`engagement-${f.num}`)
    if (!b) return f
    return {
      num: b.num ?? f.num,
      icon: b.icon ?? f.icon,
      title: b.title ?? f.title,
      desc: b.body ?? f.desc,
    }
  })

  return (
    <section className="bg-bg-secondary py-20 sm:py-28">
      <div className="container-site">

        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <p className="eyebrow eyebrow-center">
            {heading?.eyebrow ?? 'Nos engagements'}
          </p>
          <h2 className="display-lg text-text-primary mt-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            {heading?.title ?? 'Ce qui nous sépare du reste.'}
          </h2>
        </div>

        {/* Lignes numérotées séparées par des filets — pas 4 cartes identiques */}
        <div className="max-w-4xl mx-auto">
          {items.map((e) => {
            // Un nom d'icône inconnu retombe sur la première : mieux vaut une
            // icône par défaut qu'une section qui ne s'affiche pas.
            const Icon = ICONS[e.icon] ?? Award
            return (
              <article
                key={e.num}
                className="flex flex-col sm:flex-row gap-5 sm:gap-10 py-8 hairline last:border-b-0"
              >
                <div className="flex items-center gap-4 sm:w-52 flex-shrink-0">
                  <span className="display-md text-text-muted text-2xl">{e.num}</span>
                  <Icon size={22} strokeWidth={1.5} className="text-text-primary" />
                </div>

                <div>
                  <h3 className="display-sm text-xl text-text-primary">{e.title}</h3>
                  <p className="mt-2 text-text-body text-sm leading-relaxed max-w-2xl">{e.desc}</p>
                </div>
              </article>
            )
          })}
        </div>

      </div>
    </section>
  )
}
