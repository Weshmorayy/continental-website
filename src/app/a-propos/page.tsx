import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { generatePageMetadata } from '@/lib/seo'
import { Award, Users, MapPin, Wind } from 'lucide-react'

export const metadata = generatePageMetadata({
  title: 'À Propos — Continental®',
  description: 'Découvrez la marque Continental® : spécialiste dakarois de la ventilation haute performance et de la climatisation Inverter tropicalisée. Notre mission, notre engagement qualité.',
  path: '/a-propos',
})

const stats = [
  { value: '6+', label: 'Modèles Ventilateurs', sub: 'Catalogue disponible' },
  { value: '3+', label: 'Gammes Climatiseurs', sub: 'De 9.000 à 18.000 BTU' },
  { value: '2 Ans', label: 'Garantie Fabricant', sub: 'Pièces & main-d\'œuvre' },
  { value: '100%', label: 'Cuivre Pur', sub: 'Bobinage moteur' },
]

const values = [
  {
    icon: Award,
    title: 'Qualité sans compromis',
    desc: 'Chaque appareil est soumis à un protocole de contrôle rigoureux avant livraison. Moteurs cuivre pur, pales aérodynamiques et électronique certifiée pour des années d\'usage intensif.',
  },
  {
    icon: Wind,
    title: 'Conçu pour le climat sahélien',
    desc: 'Les appareils Continental® sont sélectionnés et testés pour résister aux conditions extrêmes de Dakar : températures élevées, coupures de courant fréquentes et air chargé en humidité.',
  },
  {
    icon: Users,
    title: 'Service de proximité',
    desc: 'Une équipe locale disponible 7 jours sur 7 pour le conseil d\'achat, la livraison rapide et les interventions SAV à domicile dans toute la région de Dakar.',
  },
  {
    icon: MapPin,
    title: 'Ancrage dakarois',
    desc: 'Continental® est une marque implantée à Dakar, au service des foyers, entreprises et commerces sénégalais. Chaque commande est traitée localement par notre équipe.',
  },
]

export default function AProposPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero À Propos */}
        <section className="relative bg-bg-dark text-text-light pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/aesthetic/aesthetic-breeze-bedroom-2.jpg"
              alt="Atmosphère Continental®"
              fill
              className="object-cover object-center opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/90 to-transparent" />
          </div>
          <div className="container-site relative z-10 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-4">
                <span className="w-6 h-0.5 bg-accent" />
                LA MARQUE
              </div>
              <h1 className="font-heading font-black text-white leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                L&apos;électroménager<br />pensé pour Dakar.
              </h1>
              <p className="text-text-light-sub text-lg leading-relaxed max-w-2xl">
                Continental® est le spécialiste sénégalais de la ventilation haute performance
                et de la climatisation Inverter tropicalisée. Des produits durables, sélectionnés pour durer
                sous les fortes chaleurs et les contraintes du réseau électrique local.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-12 border-b border-border">
          <div className="container-site">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.value} className="text-center border-2 border-border p-6 bg-bg-secondary">
                  <span className="font-heading font-black text-4xl text-accent block">{s.value}</span>
                  <span className="font-bold text-text-primary text-sm block mt-1">{s.label}</span>
                  <span className="font-mono text-xs text-text-muted uppercase tracking-wider mt-0.5 block">{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Notre Histoire */}
        <section className="bg-bg-secondary py-16 md:py-24 border-b border-border">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-3">
                  <span className="w-6 h-0.5 bg-accent" />
                  NOTRE MISSION
                </div>
                <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                  Rendre la fraîcheur accessible.
                </h2>
                <p className="text-text-body text-base leading-relaxed mb-4">
                  À Dakar, la chaleur n&apos;est pas un confort : c&apos;est une réalité quotidienne que chaque foyer doit affronter. Continental® est née de la conviction qu&apos;un bon appareil de ventilation ou de climatisation ne devrait pas être un luxe inaccessible.
                </p>
                <p className="text-text-body text-base leading-relaxed mb-4">
                  Nos appareils sont rigoureusement sélectionnés pour leur endurance dans les conditions climatiques locales, leur rapport performance/prix, et leur facilité d&apos;entretien.
                </p>
                <p className="text-text-body text-base leading-relaxed">
                  <strong className="text-text-primary">Chaque ventilateur, chaque climatiseur</strong> que nous commercialisons est testé pour fonctionner de façon optimale sous des températures atteignant 45°C, avec des variations de tension fréquentes propres au réseau SENELEC.
                </p>
              </div>

              <div className="relative h-80 sm:h-96 md:h-[460px] w-full bg-white border-2 border-border p-6 overflow-hidden">
                <Image
                  src="/aesthetic/aesthetic-fan-livingroom.jpg"
                  alt="Atmosphère Continental - ventilateur dans un salon"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="bg-white py-16 md:py-24">
          <div className="container-site">
            <div className="max-w-2xl mb-12">
              <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-3">
                <span className="w-6 h-0.5 bg-accent" />
                NOS ENGAGEMENTS
              </div>
              <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl">
                Les valeurs qui guident Continental®.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((v) => {
                const Icon = v.icon
                return (
                  <div key={v.title} className="flex items-start gap-5 bg-bg-secondary border-2 border-border p-6 hover:border-accent transition-colors">
                    <div className="w-12 h-12 bg-accent/10 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-text-primary text-xl mb-2">{v.title}</h3>
                      <p className="text-text-body text-sm leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
