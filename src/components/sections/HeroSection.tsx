import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle, ShieldCheck, Wind } from 'lucide-react'
import { siteConfig } from '@/config/site'

const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  "Bonjour Continental, je souhaite obtenir des informations sur vos ventilateurs et climatiseurs."
)}`

const assurances = [
  { icon: ShieldCheck, label: 'Garantie 2 ans' },
  { icon: Wind,        label: 'Moteur 100% cuivre' },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-bg-primary">
      {/* Halo très discret — évite l'aplat blanc clinique sans dégradé générique */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -right-40 h-[38rem] w-[38rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232,227,219,0.9) 0%, rgba(255,255,255,0) 68%)',
        }}
      />

      <div className="container-site relative py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">

          {/* ── Colonne éditoriale (6 colonnes) ───────────── */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <p className="eyebrow mb-6">Continental® · Dakar</p>

            <h1
              className="font-heading font-semibold text-text-primary leading-[1.02] tracking-[-0.02em] mb-7"
              style={{ fontSize: 'clamp(2.75rem, 7vw, 4.75rem)' }}
            >
              La fraîcheur,
              <br />
              <span className="relative inline-block">
                sans le bruit.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 w-full h-2.5 text-accent"
                >
                  <path
                    d="M2 8C60 3 120 2 180 4c40 1.4 80 2.6 118 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-text-body text-lg sm:text-xl leading-relaxed max-w-xl mb-9">
              Ventilateurs sur pied, muraux et climatiseurs Inverter sélectionnés pour le
              climat de Dakar. Moteurs bobinés cuivre, ralentis jusqu&apos;à 21 dB et
              <strong className="text-text-primary font-semibold"> garantie fabricant 2 ans</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
              <Link
                href="/catalogue"
                className="btn-accent px-8 py-4 font-semibold"
              >
                Voir le catalogue
                <ArrowRight size={17} />
              </Link>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-dark px-7 py-4 font-semibold"
              >
                <MessageCircle size={17} />
                Commander sur WhatsApp
              </a>
            </div>

            {/* Micro-assurances — typographie, pas d'icônes en ronds répétés */}
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-8 border-t border-border">
              {assurances.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-text-body">
                  <Icon size={17} className="text-accent flex-shrink-0" />
                  {label}
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-sm text-text-body">
                <span className="w-2 h-2 rounded-full bg-[#1FA855] flex-shrink-0" aria-hidden="true" />
                Disponible immédiatement
              </li>
            </ul>
          </div>

          {/* ── Colonne visuelle (6 colonnes) ─────────────── */}
          <div className="lg:col-span-6">
            <div className="relative">

              {/* Photographie éditoriale, cadre arrondi */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-bg-secondary">
                <Image
                  src="/aesthetic/aesthetic-fan-livingroom.jpg"
                  alt="Ventilateur Continental dans un salon lumineux"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* « Focus block » blanc — le produit est le héros,
                  sur fond platinum, sans ombre ni dégradé. */}
              <div className="absolute -bottom-8 -left-2 sm:left-4 lg:-left-8 w-[19rem] max-w-[86%]">
                <div className="plinth p-5 shadow-[0_24px_60px_-30px_rgba(22,19,15,0.35)]">
                  <span className="inline-flex self-start rounded-full bg-accent-light text-accent px-3 py-1 text-[10px] product-ref tracking-[0.14em] mb-3">
                    Modèle phare
                  </span>

                  <div className="relative h-36 sm:h-40 w-full bg-white">
                    <Image
                      src="/products/ventilateur-pied-fs4011.jpg"
                      alt="Ventilateur sur pied Continental FS4011"
                      fill
                      className="object-contain p-2"
                      sizes="320px"
                    />
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-border">
                    <h3 className="font-heading font-semibold text-text-primary text-lg leading-tight">
                      Ventilateur Télécommande 16&quot;
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xs text-text-muted">À partir de</span>
                      <span className="font-heading font-bold text-2xl text-accent">
                        30.000 FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
