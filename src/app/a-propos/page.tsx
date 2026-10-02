import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { generatePageMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Award, Wind, Users, MapPin, ArrowUpRight, MessageCircle } from 'lucide-react'

export const metadata = generatePageMetadata({
  title: 'À Propos — Continental®',
  description:
    'Découvrez la marque Continental® : spécialiste dakarois de la ventilation haute performance et de la climatisation Inverter tropicalisée. Notre mission, notre engagement qualité.',
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
    index: '01',
    icon: Award,
    title: 'Qualité sans compromis',
    desc: 'Chaque appareil est soumis à un protocole de contrôle rigoureux avant livraison. Moteurs cuivre pur, pales aérodynamiques et électronique certifiée pour des années d\'usage intensif.',
  },
  {
    index: '02',
    icon: Wind,
    title: 'Conçu pour le climat sahélien',
    desc: 'Les appareils Continental® sont sélectionnés et testés pour résister aux conditions extrêmes de Dakar : températures élevées, coupures de courant fréquentes et air chargé en humidité.',
  },
  {
    index: '03',
    icon: Users,
    title: 'Service de proximité',
    desc: 'Une équipe locale disponible 7 jours sur 7 pour le conseil d\'achat, la livraison rapide et les interventions SAV à domicile dans toute la région de Dakar.',
  },
  {
    index: '04',
    icon: MapPin,
    title: 'Ancrage dakarois',
    desc: 'Continental® est une marque implantée à Dakar, au service des foyers, entreprises et commerces sénégalais. Chaque commande est traitée localement par notre équipe.',
  },
]

export default function AProposPage() {
  const waUrl = buildWhatsAppUrl(
    'Bonjour Continental, je souhaite être conseillé pour un achat.',
  )

  return (
    <>
      <Header />
      <main>
        {/* ── Ouverture centrée — une seule colonne, comme samsung.com ── */}
        <section className="bg-bg-primary">
          <div className="container-site pt-14 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 text-center">
            <p className="eyebrow eyebrow-center">La marque</p>

            <h1
              className="display-xl text-text-primary mx-auto mt-5 max-w-5xl"
              style={{ fontSize: 'clamp(2.4rem, 7.5vw, 5.25rem)' }}
            >
              L&apos;électroménager
              <br className="hidden sm:block" /> pensé pour Dakar.
            </h1>

            <p className="mt-7 mx-auto max-w-2xl text-base sm:text-lg text-text-body leading-relaxed">
              Continental® est le spécialiste sénégalais de la ventilation haute
              performance et de la climatisation Inverter tropicalisée. Des produits
              durables, sélectionnés pour durer sous les fortes chaleurs et les
              contraintes du réseau électrique local.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <Link href="/catalogue" className="btn-accent px-8">
                Voir le catalogue
                <ArrowUpRight size={16} />
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-text-primary text-sm"
              >
                <span>Commander sur WhatsApp</span>
              </a>
            </div>
          </div>

          {/* ── Bande photographique pleine largeur ── */}
          <div className="relative w-full h-[300px] sm:h-[440px] lg:h-[600px]">
            <Image
              src="/aesthetic/aesthetic-breeze-bedroom-2.jpg"
              alt="Ventilateur Continental® dans une chambre"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        </section>

        {/* ── Repères — bandeau gris, séparés par des filets verticaux ── */}
        <section className="bg-bg-secondary">
          <div className="container-site py-12 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-6 lg:grid-cols-4 lg:gap-y-0">
              {stats.map((s, i) => (
                <div
                  key={s.value}
                  className={
                    'lg:px-8 lg:border-l lg:border-border first:lg:border-l-0 first:lg:pl-0 last:lg:pr-0' +
                    (i > 1 ? ' sm:border-t sm:border-border sm:pt-10 lg:border-t-0 lg:pt-0' : '')
                  }
                >
                  <span
                    className="display-lg block text-text-primary"
                    style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)' }}
                  >
                    {s.value}
                  </span>
                  <span className="block mt-3 font-heading text-base font-semibold text-text-primary">
                    {s.label}
                  </span>
                  <span className="block mt-1.5 text-xs uppercase tracking-[0.14em] text-text-muted">
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Notre mission — panneau gris, image + texte dans la même surface ── */}
        <section className="bg-bg-primary py-16 sm:py-24">
          <div className="container-site">
            <div className="max-w-3xl mx-auto text-center">
              <p className="product-ref uppercase tracking-[0.14em] text-text-muted">
                Notre mission
              </p>
              <h2
                className="display-md text-text-primary mt-3"
                style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}
              >
                Rendre la fraîcheur accessible.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-text-body leading-relaxed">
                À Dakar, la chaleur n&apos;est pas un confort : c&apos;est une réalité
                quotidienne que chaque foyer doit affronter. Continental® est née de la
                conviction qu&apos;un bon appareil de ventilation ou de climatisation ne
                devrait pas être un luxe inaccessible.
              </p>
            </div>

            <div className="stage mt-12 sm:mt-16 overflow-hidden">
              <div className="grid lg:grid-cols-12">
                <div className="relative h-[280px] sm:h-[380px] lg:col-span-5 lg:h-auto lg:min-h-[440px]">
                  <Image
                    src="/aesthetic/aesthetic-fan-livingroom.jpg"
                    alt="Ventilateur Continental® dans un salon"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center"
                  />
                </div>

                <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <p className="text-text-body leading-relaxed">
                    Nos appareils sont rigoureusement sélectionnés pour leur
                    endurance dans les conditions climatiques locales, leur rapport
                    performance/prix, et leur facilité d&apos;entretien.
                  </p>
                  <p className="mt-5 text-text-body leading-relaxed">
                    <strong className="text-text-primary font-semibold">
                      Chaque ventilateur, chaque climatiseur
                    </strong>{' '}
                    que nous commercialisons est testé pour fonctionner de façon
                    optimale sous des températures atteignant 45°C, avec des variations
                    de tension fréquentes propres au réseau SENELEC.
                  </p>
                  <Link href="/catalogue" className="btn-outline self-start mt-9">
                    Découvrir la gamme
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Nos engagements — rangs numérotés à filets, aucune carte identique ── */}
        <section className="bg-bg-secondary py-16 sm:py-24">
          <div className="container-site">
            <div className="max-w-2xl">
              <p className="product-ref uppercase tracking-[0.14em] text-text-muted">
                Nos engagements
              </p>
              <h2
                className="display-md text-text-primary mt-3"
                style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}
              >
                Les valeurs qui guident Continental®.
              </h2>
              <p className="mt-5 text-text-body leading-relaxed">
                Une marque dakarois, une équipe dakaroise, des produits choisis pour
                durer ici.
              </p>
            </div>

            <ul className="mt-12 sm:mt-16 border-t border-border">
              {values.map((v, i) => {
                const Icon = v.icon
                const isLast = i === values.length - 1
                return (
                  <li
                    key={v.index}
                    className={
                      'group grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-10 py-8 sm:py-10' +
                      (isLast ? '' : ' hairline')
                    }
                  >
                    <span className="font-heading font-black text-3xl sm:text-4xl leading-none text-text-muted tabular-nums">
                      {v.index}
                    </span>

                    <div className="max-w-3xl">
                      <div className="flex items-start justify-between gap-6">
                        <h3 className="display-sm text-xl sm:text-2xl text-text-primary">
                          {v.title}
                        </h3>
                        <Icon
                          size={22}
                          strokeWidth={1.6}
                          className="text-accent flex-shrink-0 mt-1"
                        />
                      </div>
                      <p className="mt-3 text-text-body leading-relaxed">{v.desc}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* ── Renvoi vers le service — bande gris soutenu ── */}
        <section className="bg-bg-tertiary py-12 sm:py-16">
          <div className="container-site flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="lg:max-w-md">
              <h2 className="display-sm text-xl sm:text-2xl text-text-primary">
                Besoin d&apos;un conseil avant d&apos;acheter ?
              </h2>
              <p className="mt-2 text-sm text-text-body leading-relaxed">
                Équipe locale à {siteConfig.contact.city}, {siteConfig.contact.country} —
                disponible 7 jours sur 7.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start lg:items-center gap-4 lg:ml-auto">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
              >
                <MessageCircle size={17} />
                Commander sur WhatsApp
              </a>
              <Link href="/garantie" className="btn-outline">
                Garantie &amp; SAV
              </Link>
              <Link
                href="/contact"
                className="link-underline text-text-primary text-sm"
              >
                <span>Nous contacter</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}