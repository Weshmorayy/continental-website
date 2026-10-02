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
        {/* ── Ouverture centrée sur gris clair, comme le héros samsung.com ── */}
        <section className="bg-bg-secondary">
          <div className="container-site pt-14 sm:pt-20 lg:pt-24 pb-14 sm:pb-20 text-center">
            <p className="eyebrow eyebrow-center">Protection complète Continental®</p>

            <h1
              className="display-xl text-text-primary mx-auto mt-5 max-w-4xl"
              style={{ fontSize: 'clamp(2.4rem, 7.5vw, 5.25rem)' }}
            >
              Garantie fabricant
              <br />24 mois.
            </h1>

            <p className="mt-7 mx-auto max-w-2xl text-base sm:text-lg text-text-body leading-relaxed">
              Chaque appareil Continental® bénéficie d&apos;une garantie officielle de{' '}
              <strong className="text-text-primary font-semibold">
                24 mois pièces et main-d&apos;œuvre
              </strong>{' '}
              à compter de la date d&apos;achat.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa px-8"
              >
                <MessageCircle size={17} />
                Déclarer une panne
              </a>
              <a
                href={`tel:${siteConfig.contact.whatsapp}`}
                className="btn-outline px-8"
              >
                <Phone size={16} />
                {siteConfig.contact.phone}
              </a>
            </div>
          </div>
        </section>

        {/* ── Chiffres clés — lignes de spécification à filets, pas trois cartes ── */}
        <section className="bg-bg-primary py-14 sm:py-20">
          <div className="container-site">
            <p className="product-ref uppercase tracking-[0.14em] text-text-muted mb-8">
              En résumé
            </p>

            <dl className="border-t border-border">
              {keyFigures.map((k, i) => {
                const Icon = k.icon
                const isLast = i === keyFigures.length - 1
                return (
                  <div
                    key={k.value}
                    className={
                      'grid sm:grid-cols-12 gap-x-8 gap-y-5 py-8 sm:py-9 items-start' +
                      (isLast ? '' : ' hairline')
                    }
                  >
                    <div className="sm:col-span-4 flex items-center gap-2.5">
                      <Icon
                        size={18}
                        strokeWidth={1.7}
                        className="text-accent flex-shrink-0"
                      />
                      <dt className="product-ref uppercase tracking-[0.12em] text-text-muted">
                        {k.label}
                      </dt>
                    </div>

                    <dd className="sm:col-span-8 sm:flex sm:items-baseline sm:gap-10">
                      <span
                        className="display-lg block sm:flex-shrink-0 text-text-primary"
                        style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
                      >
                        {k.value}
                      </span>
                      <span className="mt-3 block sm:mt-0 max-w-lg text-sm text-text-body leading-relaxed">
                        {k.text}
                      </span>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </section>

        {/* ── Couverture / Exclusions — deux tons de surface nettement distincts ── */}
        <section className="bg-bg-primary pb-16 sm:pb-24">
          <div className="container-site">
            <div className="max-w-2xl">
              <p className="product-ref uppercase tracking-[0.14em] text-text-muted">
                Périmètre de la garantie
              </p>
              <h2
                className="display-md text-text-primary mt-3"
                style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}
              >
                Ce qui est couvert, ce qui ne l&apos;est pas.
              </h2>
            </div>

            <div className="mt-12 sm:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Couvert — accent terre cuite */}
              <div className="stage p-7 sm:p-10">
                <p className="product-ref uppercase tracking-[0.14em] text-accent">
                  Couvert
                </p>

                <div className="flex items-center gap-3 mt-3 pb-6 hairline">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
                    <CheckCircle2 size={19} strokeWidth={1.8} />
                  </span>
                  <h3 className="display-sm text-xl sm:text-2xl text-text-primary">
                    Ce que la garantie couvre
                  </h3>
                </div>

                <ul>
                  {conditions.map((c, i) => (
                    <li
                      key={c}
                      className={
                        'flex items-start gap-4 py-5' +
                        (i === conditions.length - 1 ? '' : ' hairline')
                      }
                    >
                      <CheckCircle2
                        size={17}
                        strokeWidth={2}
                        className="mt-0.5 shrink-0 text-accent"
                      />
                      <span className="text-text-body leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclu — surface neutre, marqueurs gris */}
              <div className="rounded-2xl bg-bg-tertiary p-7 sm:p-10">
                <p className="product-ref uppercase tracking-[0.14em] text-text-muted">
                  Non couvert
                </p>

                <div className="flex items-center gap-3 mt-3 pb-6 hairline">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-primary text-text-primary">
                    <X size={18} strokeWidth={2.2} />
                  </span>
                  <h3 className="display-sm text-xl sm:text-2xl text-text-primary">
                    Cas d&apos;exclusion de garantie
                  </h3>
                </div>

                <ul>
                  {nonCovered.map((c, i) => (
                    <li
                      key={c}
                      className={
                        'flex items-start gap-4 py-5' +
                        (i === nonCovered.length - 1 ? '' : ' hairline')
                      }
                    >
                      <X
                        size={17}
                        strokeWidth={2.2}
                        className="mt-0.5 shrink-0 text-text-muted"
                      />
                      <span className="text-text-body leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Procédure SAV — quatre rangs numérotés ── */}
        <section className="bg-bg-secondary py-16 sm:py-24">
          <div className="container-site">
            <div className="max-w-2xl">
              <p className="product-ref uppercase tracking-[0.14em] text-text-muted">
                Procédure SAV
              </p>
              <h2
                className="display-md text-text-primary mt-3"
                style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}
              >
                Activer votre garantie en 4 étapes simples.
              </h2>
            </div>

            <ol className="mt-12 sm:mt-16 border-t border-border">
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1
                return (
                  <li
                    key={step.num}
                    className={
                      'grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-10 py-8 sm:py-10' +
                      (isLast ? '' : ' hairline')
                    }
                  >
                    <span className="font-heading font-black text-3xl sm:text-4xl leading-none text-text-muted tabular-nums">
                      {step.num}
                    </span>
                    <div className="max-w-3xl">
                      <h3 className="display-sm text-xl sm:text-2xl text-text-primary">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-text-body leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* ── Déclaration SAV — bande gris soutenu, jamais sombre ── */}
        <section className="bg-bg-tertiary py-12 sm:py-16">
          <div className="container-site grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2 className="display-sm text-xl sm:text-2xl text-text-primary">
                Déclarer une panne sous garantie
              </h2>
              <p className="mt-2 text-sm text-text-body">
                Service technique · {siteConfig.hours.weekdays} · {siteConfig.hours.saturday} ·{' '}
                dimanche {siteConfig.hours.sunday.toLowerCase()} · {siteConfig.contact.city}
              </p>
              <a
                href={`tel:${siteConfig.contact.whatsapp}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-text-primary hover:underline"
              >
                <Phone size={15} className="text-accent flex-shrink-0" />
                {siteConfig.contact.phone}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:col-span-5 lg:justify-end">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
              >
                <MessageCircle size={17} />
                WhatsApp SAV
              </a>
              <Link href="/contact" className="btn-outline">
                Autres canaux
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}