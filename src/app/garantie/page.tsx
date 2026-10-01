import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { generatePageMetadata } from '@/lib/seo'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { siteConfig } from '@/config/site'
import {
  ShieldCheck,
  Wrench,
  Clock,
  MessageCircle,
  CheckCircle2,
  X,
  Phone,
} from 'lucide-react'

export const metadata = generatePageMetadata({
  title: 'Garantie Fabricant 2 Ans — Continental®',
  description:
    "Politique de garantie complète Continental® : 24 mois pièces et main-d'œuvre. Procédure SAV, conditions et contact technique Dakar.",
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
  {
    num: '01',
    title: 'Contactez notre SAV',
    desc: 'Appelez ou envoyez un WhatsApp avec votre numéro de commande et la description du problème constaté.',
  },
  {
    num: '02',
    title: 'Diagnostic à distance',
    desc: 'Notre technicien vous guide pour vérifier l\'origine du dysfonctionnement en 5 à 15 minutes.',
  },
  {
    num: '03',
    title: 'Intervention ou échange',
    desc: 'Selon le diagnostic, un technicien se déplace à Dakar ou procède à l\'échange direct de l\'appareil.',
  },
  {
    num: '04',
    title: 'Clôture du dossier',
    desc: 'Dossier traité en 48h à 72h ouvrables. Rapport d\'intervention remis à la clôture.',
  },
]

const keyFigures = [
  {
    icon: ShieldCheck,
    value: '24 Mois',
    label: 'Durée de garantie',
    text: "Couverture complète 2 ans, sans frais supplémentaires pour les pièces ou la main-d'œuvre.",
  },
  {
    icon: Wrench,
    value: 'SAV Dakar',
    label: 'Intervention locale',
    text: 'Notre équipe technique basée à Dakar intervient à domicile pour diagnostic et réparation.',
  },
  {
    icon: Clock,
    value: '48–72h',
    label: 'Délai de traitement',
    text: 'Réponse technique garantie en 48 à 72 heures ouvrables après ouverture du dossier.',
  },
]

export default function GarantiePage() {
  const waUrl = buildWhatsAppUrl(
    'Bonjour Continental, je souhaite déclarer une panne sous garantie.',
  )

  return (
    <>
      <Header />
      <main>
        {/* ── Ouverture ── */}
        <section className="bg-bg-primary pt-14 pb-14 md:pt-20 md:pb-20">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow mb-6">Protection complète Continental®</p>
                <h1
                  className="font-heading font-black text-text-primary leading-[1.02] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(2.75rem, 7vw, 5.25rem)' }}
                >
                  Garantie fabricant
                  <br />
                  24 mois.
                </h1>
              </div>
              <div className="lg:col-span-5 lg:pb-2">
                <p className="text-text-body text-lg leading-relaxed">
                  Chaque appareil Continental® bénéficie d&apos;une garantie officielle de{' '}
                  <strong className="text-text-primary font-semibold">
                    24 mois pièces et main-d&apos;œuvre
                  </strong>{' '}
                  à compter de la date d&apos;achat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Chiffres clés : ligne de spécification, pas trois cartes ── */}
        <section className="bg-bg-secondary border-y border-border">
          <div className="container-site">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-y-0">
              {keyFigures.map((k, i) => {
                const Icon = k.icon
                return (
                  <div
                    key={k.value}
                    className={
                      i > 0
                        ? 'md:border-l md:border-border-dark md:pl-8 lg:pl-10'
                        : 'md:pr-8 lg:pr-10'
                    }
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <Icon size={18} className="text-accent" strokeWidth={1.7} />
                      <dt className="product-ref text-text-muted">{k.label}</dt>
                    </div>
                    <dd>
                      <span
                        className="font-heading font-black text-text-primary block leading-none tracking-[-0.02em]"
                        style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
                      >
                        {k.value}
                      </span>
                      <p className="text-text-body text-sm leading-relaxed mt-3 max-w-xs">
                        {k.text}
                      </p>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </section>

        {/* ── Couverture / Exclusions : une plaque divisée, lue d'un bloc ── */}
        <section className="bg-bg-primary py-20 md:py-28">
          <div className="container-site">
            <div className="plinth overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Couverture */}
                <div className="p-7 sm:p-10 lg:p-12">
                  <div className="flex items-center gap-3 pb-6 mb-2 border-b border-border">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
                      <CheckCircle2 size={19} strokeWidth={1.8} />
                    </span>
                    <h2 className="font-heading font-bold text-text-primary text-xl sm:text-2xl tracking-[-0.01em]">
                      Ce que la garantie couvre
                    </h2>
                  </div>
                  <ul>
                    {conditions.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-4 py-5 border-b border-border last:border-b-0"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-1 shrink-0 text-accent"
                          strokeWidth={2}
                        />
                        <span className="text-text-body leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusions — filet vertical plutôt qu'une seconde carte */}
                <div className="p-7 sm:p-10 lg:p-12 lg:border-l lg:border-border bg-bg-secondary">
                  <div className="flex items-center gap-3 pb-6 mb-2 border-b border-border-dark">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-text-primary">
                      <X size={18} strokeWidth={2.2} />
                    </span>
                    <h2 className="font-heading font-bold text-text-primary text-xl sm:text-2xl tracking-[-0.01em]">
                      Cas d&apos;exclusion de garantie
                    </h2>
                  </div>
                  <ul>
                    {nonCovered.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-4 py-5 border-b border-border-dark last:border-b-0"
                      >
                        <X size={15} className="mt-1 shrink-0 text-text-muted" strokeWidth={2.2} />
                        <span className="text-text-body leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Procédure SAV : quatre rangs numérotés ── */}
        <section className="bg-bg-secondary py-20 md:py-28">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="product-ref text-text-muted mb-5">Procédure SAV</p>
                <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl leading-[1.1] tracking-[-0.02em]">
                  Activer votre garantie en 4 étapes simples.
                </h2>
              </div>

              <div className="lg:col-span-8">
                <ol className="border-t border-border-dark">
                  {steps.map((step) => (
                    <li
                      key={step.num}
                      className="group grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-10 py-8 border-b border-border-dark"
                    >
                      <span className="font-heading font-black text-3xl md:text-4xl leading-none text-[#C9C1B7] tabular-nums transition-colors duration-200 group-hover:text-accent">
                        {step.num}
                      </span>
                      <div className="sm:flex sm:gap-8">
                        <h3 className="font-heading font-bold text-text-primary text-xl sm:text-2xl sm:w-64 sm:shrink-0 leading-snug tracking-[-0.01em]">
                          {step.title}
                        </h3>
                        <p className="text-text-body leading-relaxed mt-2 sm:mt-0 sm:max-w-md">
                          {step.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ── Déclaration SAV : bandeau sable, jamais sombre ── */}
        <section className="bg-bg-tertiary py-14 md:py-20">
          <div className="container-site">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
              <div className="flex-1">
                <h3 className="font-heading font-black text-text-primary text-2xl sm:text-3xl leading-tight tracking-[-0.015em]">
                  Déclarer une panne sous garantie
                </h3>
                <p className="text-text-body text-sm mt-2">
                  Service technique 7j/7 · 08h–20h · {siteConfig.contact.city}
                </p>
                <a
                  href={`tel:${siteConfig.contact.whatsapp}`}
                  className="link-warm mt-4 font-mono text-sm"
                >
                  <Phone size={15} />
                  {siteConfig.contact.phone}
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa"
                >
                  <MessageCircle size={17} />
                  WhatsApp SAV
                </a>
                <Link href="/contact" className="btn-outline-dark">
                  Autres canaux
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}