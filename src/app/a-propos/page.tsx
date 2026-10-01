import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { generatePageMetadata } from '@/lib/seo'
import { siteConfig } from '@/config/site'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Award, Wind, Users, MapPin, ArrowUpRight } from 'lucide-react'

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
        {/* ── Ouverture éditoriale — fond blanc, jamais sombre ── */}
        <section className="bg-bg-primary pt-14 pb-14 md:pt-20 md:pb-16">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow mb-6">La marque</p>
                <h1
                  className="font-heading font-black text-text-primary leading-[1.02] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(2.75rem, 7vw, 5.25rem)' }}
                >
                  L&apos;électroménager
                  <br />
                  pensé pour Dakar.
                </h1>
              </div>

              <div className="lg:col-span-5 lg:pb-2">
                <p className="text-text-body text-lg leading-relaxed">
                  Continental® est le spécialiste sénégalais de la ventilation haute performance
                  et de la climatisation Inverter tropicalisée. Des produits durables, sélectionnés pour durer
                  sous les fortes chaleurs et les contraintes du réseau électrique local.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/catalogue" className="btn-accent">
                    Voir le catalogue
                    <ArrowUpRight size={16} />
                  </Link>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-dark"
                  >
                    Commander sur WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bande photographique — le produit est le héros ── */}
        <section className="bg-bg-primary pb-16 md:pb-24">
          <div className="container-site">
            <figure className="plinth overflow-hidden rounded-3xl">
              <div className="relative w-full h-[260px] sm:h-[380px] md:h-[520px]">
                <Image
                  src="/aesthetic/aesthetic-breeze-bedroom-2.jpg"
                  alt="Ventilateur Continental® dans une chambre"
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover object-center"
                />
              </div>
            </figure>
          </div>
        </section>

        {/* ── Index chiffré — lignes de spécification séparées par un filet ── */}
        <section className="bg-bg-secondary py-14 md:py-20 border-y border-border">
          <div className="container-site">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
              {stats.map((s, i) => (
                <div
                  key={s.value}
                  className={
                    i % 2 === 0
                      ? 'lg:border-r lg:border-border-dark lg:pr-8'
                      : 'lg:pl-8'
                  }
                >
                  <span
                    className="font-heading font-black text-text-primary block leading-none tracking-[-0.03em]"
                    style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
                  >
                    {s.value}
                  </span>
                  <span className="font-semibold text-text-primary text-sm block mt-3">
                    {s.label}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted block mt-1">
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Notre mission — portrait éditorial, texte généreux ── */}
        <section className="bg-bg-primary py-20 md:py-28">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <figure className="plinth overflow-hidden rounded-3xl">
                  <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[600px]">
                    <Image
                      src="/aesthetic/aesthetic-fan-livingroom.jpg"
                      alt="Ventilateur Continental® dans un salon"
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover object-center"
                    />
                  </div>
                </figure>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2">
                <p className="product-ref text-text-muted mb-5">Notre mission</p>
                <h2 className="font-heading font-black text-text-primary leading-[1.08] tracking-[-0.02em] text-4xl sm:text-5xl mb-8">
                  Rendre la fraîcheur accessible.
                </h2>
                <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-text-body">
                  <p>
                    À Dakar, la chaleur n&apos;est pas un confort : c&apos;est une réalité quotidienne que chaque foyer doit affronter. Continental® est née de la conviction qu&apos;un bon appareil de ventilation ou de climatisation ne devrait pas être un luxe inaccessible.
                  </p>
                  <p>
                    Nos appareils sont rigoureusement sélectionnés pour leur endurance dans les conditions climatiques locales, leur rapport performance/prix, et leur facilité d&apos;entretien.
                  </p>
                  <p>
                    <strong className="text-text-primary font-semibold">Chaque ventilateur, chaque climatiseur</strong> que nous commercialisons est testé pour fonctionner de façon optimale sous des températures atteignant 45°C, avec des variations de tension fréquentes propres au réseau SENELEC.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Nos engagements — liste numérotée à filets, aucune carte identique ── */}
        <section className="bg-bg-secondary py-20 md:py-28">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="product-ref text-text-muted mb-5">Nos engagements</p>
                <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl leading-[1.1] tracking-[-0.02em]">
                  Les valeurs qui guident Continental®.
                </h2>
                <p className="text-text-body leading-relaxed mt-5 max-w-sm">
                  Une marque dakarois, une équipe dakaroise, des produits choisis pour durer ici.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/garantie" className="btn-outline-dark">
                    Garantie &amp; SAV
                  </Link>
                  <Link href="/contact" className="btn-accent">
                    Nous contacter
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-8">
                <ul className="border-t border-border-dark">
                  {values.map((v) => {
                    const Icon = v.icon
                    return (
                      <li
                        key={v.index}
                        className="group grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] gap-x-5 sm:gap-x-8 py-8 md:py-10 border-b border-border-dark"
                      >
                        <span className="font-heading font-black text-4xl md:text-5xl leading-none text-[#C9C1B7] tabular-nums transition-colors duration-200 group-hover:text-accent">
                          {v.index}
                        </span>
                        <span className="hidden sm:flex items-start justify-center pt-2">
                          <Icon size={22} className="text-accent" strokeWidth={1.6} />
                        </span>
                        <div>
                          <h3 className="font-heading font-bold text-text-primary text-2xl sm:text-[1.7rem] leading-snug tracking-[-0.01em]">
                            {v.title}
                          </h3>
                          <p className="text-text-body leading-relaxed mt-3 max-w-2xl">
                            {v.desc}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div className="mt-12 md:mt-16 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-border-dark pt-8">
              <p className="product-ref text-text-muted">
                {siteConfig.contact.city}, {siteConfig.contact.country}
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-warm sm:ml-auto"
              >
                Échanger avec notre équipe
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}