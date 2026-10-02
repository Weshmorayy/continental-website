import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { generatePageMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ArrowUpRight,
  Truck,
  Check,
} from 'lucide-react'

export const metadata = generatePageMetadata({
  title: 'Contact & Commandes — Continental®',
  description: `Contactez Continental® Dakar : commandes WhatsApp, conseil produit, SAV et livraison. Service commercial ${siteConfig.hours.weekdays}, ${siteConfig.hours.saturday}.`,
  path: '/contact',
})

const schedule = [
  { label: 'Lundi – Vendredi', value: siteConfig.hours.weekdays },
  { label: 'Samedi – Dimanche', value: siteConfig.hours.saturday },
  { label: 'Jours fériés', value: 'WhatsApp uniquement', accent: true },
]

const payments = [
  { label: 'Wave', enabled: siteConfig.payments.wave },
  { label: 'Orange Money', enabled: siteConfig.payments.orangeMoney },
  { label: 'Free Money', enabled: siteConfig.payments.freeMoney },
  { label: 'Espèces à la livraison', enabled: siteConfig.payments.cash },
]

const faqs = [
  {
    q: 'Comment passer commande ?',
    a: "Envoyez un message WhatsApp avec le modèle souhaité. Notre équipe confirme la disponibilité, organise la livraison et confirme le paiement.",
  },
  {
    q: 'Quelle garantie sur les produits ?',
    a: "Tous nos appareils bénéficient d'une garantie fabricant de 2 ans, pièces et main-d'œuvre incluses. Consultez la page Garantie pour les détails.",
  },
  {
    q: 'Quels sont les modes de paiement ?',
    a: 'Wave, Orange Money, Free Money et espèces à la livraison. Devis proforma disponible pour les entreprises sur demande.',
  },
  {
    q: 'Livrez-vous en dehors de Dakar ?',
    a: "Actuellement, notre service de livraison couvre la région de Dakar et sa banlieue immédiate. Contactez-nous pour les cas particuliers.",
  },
  {
    q: "La climatisation inclut-elle l'installation ?",
    a: "L'installation par notre technicien agréé est disponible en option. Demandez un devis installation lors de votre commande.",
  },
]

export default function ContactPage() {
  const waUrl = buildWhatsAppUrl(
    'Bonjour Continental, je souhaite être mis en contact avec votre service commercial.',
  )

  return (
    <>
      <Header />
      <main>
        {/* ── Ouverture centrée sur gris clair ── */}
        <section className="bg-bg-secondary">
          <div className="container-site pt-14 sm:pt-20 lg:pt-24 pb-14 sm:pb-20 text-center">
            <p className="eyebrow eyebrow-center">Nous contacter</p>

            <h1
              className="display-xl text-text-primary mx-auto mt-5 max-w-4xl"
              style={{ fontSize: 'clamp(2.4rem, 7.5vw, 5.25rem)' }}
            >
              Parlez directement
              <br />à notre équipe.
            </h1>

            <p className="mt-7 mx-auto max-w-2xl text-base sm:text-lg text-text-body leading-relaxed">
              Conseil d&apos;achat, devis, livraison ou SAV — notre équipe commerciale
              basée à Dakar répond rapidement et sans intermédiaire.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa px-8"
              >
                <MessageCircle size={17} />
                Commander sur WhatsApp
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

        {/* ── Canaux — WhatsApp en grand format, téléphone en contrepoint ── */}
        <section className="bg-bg-primary py-14 sm:py-20">
          <div className="container-site">
            <p className="product-ref uppercase tracking-[0.14em] text-text-muted mb-8">
              Canaux de contact directs
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* WhatsApp — grande tuile grise, sans bordure */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="stage p-8 sm:p-10 flex flex-col justify-between gap-10 min-h-[300px] lg:col-span-7"
              >
                <div className="flex items-start gap-5">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E9F6EF] text-[#1FA855]">
                    <MessageCircle size={26} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="product-ref uppercase tracking-[0.12em] text-text-muted">
                      Canal principal
                    </p>
                    <h2 className="display-sm mt-2 text-2xl sm:text-3xl text-text-primary">
                      WhatsApp — Commandes &amp; Conseil
                    </h2>
                    <p className="mt-2 text-sm text-text-body">
                      Commandes et conseil · {siteConfig.hours.weekdays} ·{' '}
                      {siteConfig.hours.saturday}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                  <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                    {siteConfig.contact.phone}
                  </span>
                  <span className="btn-wa pointer-events-none">
                    Ouvrir WhatsApp
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </a>

              {/* Téléphone — tuile secondaire, ton plus soutenu et hauteur moindre */}
              <a
                href={`tel:${siteConfig.contact.whatsapp}`}
                className="rounded-2xl bg-bg-tertiary p-8 sm:p-10 flex flex-col gap-8 lg:col-span-5"
              >
                <div className="flex items-start gap-5">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent">
                    <Phone size={24} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="product-ref uppercase tracking-[0.12em] text-text-muted">
                      Urgence &amp; devis
                    </p>
                    <h2 className="display-sm mt-2 text-xl sm:text-2xl text-text-primary">
                      Appel téléphonique direct
                    </h2>
                    <p className="mt-2 text-sm text-text-body">
                      Pour toute urgence ou demande de devis immédiate
                    </p>
                  </div>
                </div>

                <div className="mt-auto hairline pt-6">
                  <span className="block font-heading text-xl font-bold text-text-primary">
                    {siteConfig.contact.phone}
                  </span>
                  <span className="link-underline text-text-primary text-sm mt-4 pointer-events-none">
                    <span>Lancer l&apos;appel</span>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ── Horaires & livraison — listes à filets, tailles différentes ── */}
        <section className="bg-bg-secondary py-16 sm:py-24">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

              {/* Horaires — colonne étroite */}
              <div className="lg:col-span-4">
                <div className="flex items-center gap-2.5">
                  <Clock size={18} strokeWidth={1.7} className="text-accent" />
                  <h2 className="display-sm text-xl sm:text-2xl text-text-primary">
                    Horaires d&apos;ouverture
                  </h2>
                </div>

                <dl className="mt-6 border-t border-border">
                  {schedule.map((row, i) => (
                    <div
                      key={row.label}
                      className={
                        'flex items-baseline justify-between gap-4 py-4' +
                        (i === schedule.length - 1 ? '' : ' hairline')
                      }
                    >
                      <dt className="text-sm text-text-body">{row.label}</dt>
                      <dd
                        className={
                          row.accent
                            ? 'text-sm font-semibold text-accent text-right'
                            : 'text-sm font-semibold text-text-primary text-right'
                        }
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-6 text-sm text-text-muted leading-relaxed">
                  Service commercial et service technique&nbsp;:{' '}
                  {siteConfig.contact.city}, {siteConfig.contact.country}.
                </p>
              </div>

              {/* Zones — liste éditoriale sur deux colonnes, pas six cartes */}
              <div className="lg:col-span-8">
                <div className="flex items-center gap-2.5">
                  <Truck size={18} strokeWidth={1.7} className="text-accent" />
                  <h2 className="display-sm text-xl sm:text-2xl text-text-primary">
                    Zones de livraison
                  </h2>
                </div>

                <p className="mt-5 text-sm text-text-body leading-relaxed max-w-2xl">
                  Nos livreurs interviennent dans toute la région de Dakar et sa
                  banlieue immédiate. Livraison gratuite à partir de{' '}
                  <strong className="text-text-primary font-semibold">
                    {siteConfig.delivery.freeFrom.toLocaleString('fr-FR')} FCFA
                  </strong>
                  .
                </p>

                <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 border-t border-border">
                  {siteConfig.delivery.zones.map((zone, i) => (
                    <li
                      key={zone.name}
                      className={
                        'flex items-baseline justify-between gap-4 py-4' +
                        (i === siteConfig.delivery.zones.length - 1
                          ? ''
                          : ' hairline')
                      }
                    >
                      <span className="font-heading text-base font-medium text-text-primary">
                        {zone.name}
                      </span>
                      <span className="text-sm text-text-muted whitespace-nowrap">
                        {zone.delay}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Questions fréquentes + rail d&apos;informations pratiques ── */}
        <section className="bg-bg-primary py-16 sm:py-24">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">

              {/* FAQ */}
              <div className="lg:col-span-7">
                <p className="product-ref uppercase tracking-[0.14em] text-text-muted">
                  Avant de nous écrire
                </p>
                <h2
                  className="display-md text-text-primary mt-3"
                  style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}
                >
                  Questions fréquentes
                </h2>

                <div className="mt-10 border-t border-border">
                  {faqs.map((faq, i) => (
                    <div
                      key={faq.q}
                      className={
                        'py-6' +
                        (i === faqs.length - 1 ? '' : ' hairline')
                      }
                    >
                      <h3 className="display-sm text-lg text-text-primary">
                        {faq.q}
                      </h3>
                      <p className="mt-2.5 text-text-body leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rail pratique — horaires, paiements, liens : aucun formulaire isolé */}
              <div className="lg:col-span-5">
                <div className="stage p-7 sm:p-9 lg:sticky lg:top-28">
                  <p className="product-ref uppercase tracking-[0.14em] text-text-muted">
                    Besoin d&apos;une réponse
                  </p>
                  <h2 className="display-sm mt-2 text-xl sm:text-2xl text-text-primary">
                    Vous ne trouvez pas votre réponse ?
                  </h2>
                  <p className="mt-3 text-sm text-text-body leading-relaxed">
                    Conseil d&apos;achat, devis, livraison ou SAV : nous répondons
                    directement, sans intermédiaire.
                  </p>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wa w-full mt-7"
                  >
                    <MessageCircle size={17} />
                    Poser ma question WhatsApp
                  </a>
                  <a
                    href={`tel:${siteConfig.contact.whatsapp}`}
                    className="btn-outline w-full mt-3"
                  >
                    <Phone size={16} />
                    {siteConfig.contact.phone}
                  </a>

                  <div className="mt-8 border-t border-border">
                    <div className="flex items-start gap-3 py-4 hairline">
                      <MapPin size={17} className="text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-text-body">
                        <strong className="text-text-primary font-semibold block">
                          {siteConfig.contact.city}, {siteConfig.contact.country}
                        </strong>
                        Commandes préparées et livrées localement.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 py-4 hairline">
                      <Clock size={17} className="text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-text-body">
                        <strong className="text-text-primary font-semibold block">
                          {siteConfig.hours.weekdays} — {siteConfig.hours.saturday}
                        </strong>
                        Jours fériés : WhatsApp uniquement.
                      </p>
                    </div>

                    <div className="py-4">
                      <p className="product-ref uppercase tracking-[0.12em] text-text-muted mb-3">
                        Paiements acceptés
                      </p>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {payments
                          .filter((p) => p.enabled)
                          .map((p) => (
                            <li
                              key={p.label}
                              className="flex items-center gap-2 text-sm text-text-body"
                            >
                              <Check
                                size={15}
                                strokeWidth={2.2}
                                className="text-accent flex-shrink-0"
                              />
                              {p.label}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-x-7 gap-y-3">
                    <Link
                      href="/garantie"
                      className="link-underline text-text-primary text-sm"
                    >
                      <span>Garantie &amp; SAV</span>
                    </Link>
                    <Link
                      href="/catalogue"
                      className="link-underline text-text-primary text-sm"
                    >
                      <span>Voir le catalogue</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}