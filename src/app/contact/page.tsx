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
} from 'lucide-react'

export const metadata = generatePageMetadata({
  title: 'Contact & Commandes — Continental®',
  description:
    'Contactez Continental® Dakar : commandes WhatsApp, conseil produit, SAV et livraison. Service disponible 7j/7 dans la région de Dakar.',
  path: '/contact',
})

const schedule = [
  { label: 'Lundi – Vendredi', value: siteConfig.hours.weekdays },
  { label: 'Samedi – Dimanche', value: siteConfig.hours.saturday },
  { label: 'Jours fériés', value: 'WhatsApp uniquement', accent: true },
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
        {/* ── Ouverture ── */}
        <section className="bg-bg-primary pt-14 pb-14 md:pt-20 md:pb-20">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow mb-6">Nous contacter</p>
                <h1
                  className="font-heading font-black text-text-primary leading-[1.02] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(2.75rem, 7vw, 5.25rem)' }}
                >
                  Parlez directement
                  <br />
                  à notre équipe.
                </h1>
              </div>
              <div className="lg:col-span-5 lg:pb-2">
                <p className="text-text-body text-lg leading-relaxed">
                  Conseil d&apos;achat, devis, livraison ou SAV — notre équipe commerciale basée à
                  Dakar répond rapidement et sans intermédiaire.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wa"
                  >
                    <MessageCircle size={17} />
                    Commander sur WhatsApp
                  </a>
                  <a href={`tel:${siteConfig.contact.whatsapp}`} className="btn-outline-dark">
                    <Phone size={16} />
                    Appeler
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Canaux : WhatsApp en grand, téléphone en contrepoint ── */}
        <section className="bg-bg-secondary py-16 md:py-24 border-y border-border">
          <div className="container-site">
            <p className="product-ref text-text-muted mb-8">Canaux de contact directs</p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* WhatsApp — carte large */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-warm group lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between gap-8 min-h-[280px]"
              >
                <div className="flex items-start gap-5">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E9F6EF] text-[#1FA855]">
                    <MessageCircle size={26} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h2 className="font-heading font-bold text-text-primary text-2xl sm:text-[1.75rem] leading-snug tracking-[-0.01em]">
                      WhatsApp — Commandes &amp; Conseil
                    </h2>
                    <p className="text-text-body text-sm mt-2">
                      Réponse en moins de 15 minutes · 7j/7 · 08h–20h
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <span className="font-mono text-2xl sm:text-[1.75rem] font-bold text-text-primary tracking-tight">
                    {siteConfig.contact.phone}
                  </span>
                  <span className="btn-wa pointer-events-none">
                    Ouvrir WhatsApp
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </a>

              {/* Téléphone — carte étroite, hauteur moindre */}
              <a
                href={`tel:${siteConfig.contact.whatsapp}`}
                className="card-warm group lg:col-span-5 p-7 sm:p-9 flex flex-col gap-6 bg-bg-primary"
              >
                <div className="flex items-start gap-5">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent">
                    <Phone size={24} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h2 className="font-heading font-bold text-text-primary text-xl sm:text-2xl leading-snug tracking-[-0.01em]">
                      Appel téléphonique direct
                    </h2>
                    <p className="text-text-body text-sm mt-2">
                      Pour toute urgence ou demande de devis immédiate
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <span className="font-mono text-xl font-bold text-text-primary block">
                    {siteConfig.contact.phone}
                  </span>
                  <span className="link-warm text-sm mt-3 pointer-events-none">
                    Lancer l&apos;appel
                    <ArrowUpRight size={15} />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ── Horaires & livraison : deux plaques de tailles différentes ── */}
        <section className="bg-bg-primary py-20 md:py-28">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Horaires — plus étroite */}
              <div className="lg:col-span-5 plinth p-7 sm:p-9">
                <div className="flex items-center gap-3 pb-6 border-b border-border">
                  <Clock size={19} className="text-accent" strokeWidth={1.7} />
                  <h2 className="font-heading font-bold text-text-primary text-xl tracking-[-0.01em]">
                    Horaires d&apos;ouverture
                  </h2>
                </div>
                <dl className="mt-2">
                  {schedule.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 py-4 border-b border-border last:border-b-0"
                    >
                      <dt className="text-text-body text-sm">{row.label}</dt>
                      <dd
                        className={
                          row.accent
                            ? 'text-accent font-semibold text-sm text-right'
                            : 'font-semibold text-text-primary text-sm text-right'
                        }
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Zones — plus large, liste en deux colonnes */}
              <div className="lg:col-span-7 plinth p-7 sm:p-9">
                <div className="flex items-center gap-3 pb-6 border-b border-border">
                  <MapPin size={19} className="text-accent" strokeWidth={1.7} />
                  <h2 className="font-heading font-bold text-text-primary text-xl tracking-[-0.01em]">
                    Zones de livraison
                  </h2>
                </div>
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                  {siteConfig.delivery.zones.map((zone) => (
                    <li
                      key={zone.name}
                      className="flex items-baseline justify-between gap-4 py-4 border-b border-border"
                    >
                      <span className="text-text-body text-sm">{zone.name}</span>
                      <span className="font-mono text-xs text-text-muted whitespace-nowrap">
                        {zone.delay}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Questions fréquentes + rail pratique, adossé au pied de page ── */}
        <section className="bg-bg-secondary py-20 md:py-28 border-t border-border">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-7">
                <p className="product-ref text-text-muted mb-5">Avant de nous écrire</p>
                <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl leading-[1.1] tracking-[-0.02em] mb-8">
                  Questions fréquentes
                </h2>

                <div className="border-t border-border-dark">
                  {faqs.map((faq) => (
                    <div key={faq.q} className="py-6 border-b border-border-dark">
                      <h3 className="font-heading font-bold text-text-primary text-lg tracking-[-0.01em]">
                        {faq.q}
                      </h3>
                      <p className="text-text-body leading-relaxed mt-2.5">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rail pratique — remplace le formulaire isolé */}
              <div className="lg:col-span-5">
                <div className="plinth p-7 sm:p-9 lg:sticky lg:top-28">
                  <h3 className="font-heading font-bold text-text-primary text-xl tracking-[-0.01em]">
                    Vous ne trouvez pas votre réponse ?
                  </h3>
                  <p className="text-text-body leading-relaxed mt-3">
                    Réponse en moins de 15 minutes · 7j/7 · 08h–20h. Conseil d&apos;achat,
                    devis, livraison ou SAV : nous répondons sans intermédiaire.
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
                    className="btn-outline-dark w-full mt-3"
                  >
                    <Phone size={16} />
                    {siteConfig.contact.phone}
                  </a>

                  <div className="mt-7 pt-6 border-t border-border flex flex-wrap gap-x-6 gap-y-2">
                    <Link href="/garantie" className="link-warm text-sm">
                      Garantie &amp; SAV
                    </Link>
                    <Link href="/catalogue" className="link-warm text-sm">
                      Voir le catalogue
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