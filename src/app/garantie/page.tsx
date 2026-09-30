import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { generatePageMetadata } from '@/lib/seo'
import { ShieldCheck, Clock, Wrench, Phone, CheckCircle2, AlertCircle } from 'lucide-react'

export const metadata = generatePageMetadata({
  title: 'Garantie Fabricant 2 Ans — Continental®',
  description: "Politique de garantie complète Continental® : 24 mois pièces et main-d'œuvre. Procédure SAV, conditions et contact technique Dakar.",
  path: '/garantie',
})

const conditions = [
  'Défaut de fabrication constaté dans les conditions normales d\'utilisation',
  'Panne électronique ou mécanique non liée à une surtension ou mauvaise manipulation',
  'Remplacement des pièces défectueuses d\'origine Continental®',
  "Main-d'œuvre technique incluse sur toute la période de garantie",
]

const nonCovered = [
  'Dommages causés par une surtension électrique ou mauvaise installation',
  'Casses ou chocs physiques constatés à la livraison sans signalement immédiat',
  'Modifications ou réparations effectuées par un technicien non agréé',
  'Usure normale des consommables (filtres, télécommandes, câbles)',
]

const steps = [
  { num: '01', title: 'Contactez notre SAV', desc: 'Appelez ou envoyez un WhatsApp avec votre numéro de commande et la description du problème constaté.' },
  { num: '02', title: 'Diagnostic à distance', desc: 'Notre technicien vous guide pour vérifier l\'origine du dysfonctionnement en 5 à 15 minutes.' },
  { num: '03', title: 'Intervention ou échange', desc: 'Selon le diagnostic, un technicien se déplace à Dakar ou procède à l\'échange direct de l\'appareil.' },
  { num: '04', title: 'Clôture du dossier', desc: 'Dossier traité en 48h à 72h ouvrables. Rapport d\'intervention remis à la clôture.' },
]

export default function GarantiePage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-bg-dark text-text-light pb-16 md:pb-24">
          <div className="container-site py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-4">
                <ShieldCheck size={16} />
                <span>PROTECTION COMPLÈTE CONTINENTAL®</span>
              </div>
              <h1 className="font-heading font-black text-white leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                Garantie Fabricant<br />24 Mois.
              </h1>
              <p className="text-text-light-sub text-lg leading-relaxed max-w-2xl">
                Chaque appareil Continental® bénéficie d&apos;une garantie officielle de <strong className="text-white">24 mois pièces et main-d&apos;œuvre</strong> à compter de la date d&apos;achat.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20 border-b border-border">
          <div className="container-site">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, label: '24 Mois', sub: 'Durée de garantie', text: "Couverture complète 2 ans, sans frais supplémentaires pour les pièces ou la main-d'œuvre." },
                { icon: Wrench, label: 'SAV Dakar', sub: 'Intervention locale', text: 'Notre équipe technique basée à Dakar intervient à domicile pour diagnostic et réparation.' },
                { icon: Clock, label: '48–72h', sub: 'Délai de traitement', text: 'Réponse technique garantie en 48 à 72 heures ouvrables après ouverture du dossier.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="bg-bg-secondary border-2 border-border p-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-accent/10 border-2 border-accent/30 flex items-center justify-center text-accent mb-5">
                      <Icon size={28} />
                    </div>
                    <span className="font-heading font-black text-4xl text-accent mb-1">{item.label}</span>
                    <span className="font-mono text-xs font-bold text-text-muted uppercase tracking-widest mb-3">{item.sub}</span>
                    <p className="text-text-body text-sm leading-relaxed">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-bg-secondary py-16 md:py-20 border-b border-border">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white border-2 border-emerald-300 p-8">
                <h2 className="font-heading font-black text-text-primary text-2xl mb-6 flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                  Ce que la garantie couvre
                </h2>
                <ul className="space-y-4">
                  {conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-text-body">
                      <CheckCircle2 size={17} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border-2 border-red-200 p-8">
                <h2 className="font-heading font-black text-text-primary text-2xl mb-6 flex items-center gap-3">
                  <AlertCircle size={24} className="text-red-600" />
                  Cas d&apos;exclusion de garantie
                </h2>
                <ul className="space-y-4">
                  {nonCovered.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-text-body">
                      <AlertCircle size={17} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container-site">
            <div className="max-w-2xl mb-12">
              <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-3">
                <span className="w-6 h-0.5 bg-accent" />
                PROCÉDURE SAV
              </div>
              <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl">
                Activer votre garantie en 4 étapes simples.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {steps.map((step) => (
                <div key={step.num} className="bg-bg-secondary border-2 border-border p-6 flex flex-col gap-4">
                  <span className="font-heading font-black text-5xl text-accent/30 leading-none">{step.num}</span>
                  <h3 className="font-heading font-bold text-text-primary text-xl">{step.title}</h3>
                  <p className="text-text-body text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-bg-dark text-text-light p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t-4 border-accent">
              <div>
                <h3 className="font-heading font-black text-white text-2xl mb-1">Déclarer une panne sous garantie</h3>
                <p className="text-text-light-sub text-sm">Service technique 7j/7 · 08h–20h · Dakar</p>
              </div>
              <a
                href="https://wa.me/221770000000?text=Bonjour%20Continental%2C%20je%20souhaite%20d%C3%A9clarer%20une%20panne%20sous%20garantie."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 flex-shrink-0"
              >
                <Phone size={15} />
                WhatsApp SAV
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
