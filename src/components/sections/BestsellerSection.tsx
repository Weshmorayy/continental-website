import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ShieldCheck, Check, Sparkles } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'

const bestseller = {
  ref: 'CT-12INV-PRO',
  name: 'Climatiseur Split Inverter 12000 BTU Tropicalisé',
  slug: 'climatiseur-split-pro-inverter',
  image: '/products/climatiseur-split-pro-inverter.jpg',
  price: 195000,
  features: [
    'Refroidissement ultra-rapide conçu pour les chaleurs de Dakar',
    'Compresseur Inverter intelligent : jusqu\'à 60% d\'économie d\'énergie',
    'Filtre antibactérien haute densité et purification active de l\'air',
    'Mode Nuit Ultra Silencieux (21 dB) pour un sommeil sans perturbation',
    'Revêtement Gold Fin résistant à la corrosion saline',
  ],
}

export default function BestsellerSection() {
  const waMessage = buildOrderMessage({ productName: bestseller.name, ref: bestseller.ref })
  const waUrl = buildWhatsAppUrl(waMessage)

  return (
    <section className="bg-white py-16 md:py-24 border-b border-border">
      <div className="container-site">
        <div className="bg-bg-secondary border-2 border-border p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Image Produit Isolée sur Fond Blanc */}
            <div className="lg:col-span-6 relative">
              <div className="relative h-80 sm:h-96 md:h-[440px] w-full bg-white border border-border p-6 sm:p-10 flex items-center justify-center shadow-sm">
                <Image
                  src={bestseller.image}
                  alt={bestseller.name}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 550px"
                />
                <div className="absolute top-4 left-4 bg-accent text-white px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Sparkles size={13} /> Modèle Bestseller
                </div>
              </div>
            </div>

            {/* Contenu Technique Détaillé */}
            <div className="lg:col-span-6 flex flex-col items-start">
              
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-accent tracking-widest uppercase">
                  RÉF. {bestseller.ref}
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5">
                  Garantie 2 Ans
                </span>
              </div>

              <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                {bestseller.name}
              </h2>

              <p className="text-text-body text-base leading-relaxed mb-6 font-normal">
                L&apos;alliance parfaite entre puissance de refroidissement immédiate et
                facture d&apos;électricité maîtrisée. L&apos;appareil idéal pour chambres spacieuses
                et salons de 20 à 35 m².
              </p>

              {/* Liste des points forts avec contrastes marqués */}
              <ul className="space-y-3 mb-8 w-full">
                {bestseller.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-text-body font-medium">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={13} className="text-accent" strokeWidth={3} />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Bloc Prix & Commande */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 w-full pt-6 border-t border-border">
                <div>
                  <span className="text-xs font-mono font-bold text-text-muted uppercase block">
                    Prix Continental® Dakar
                  </span>
                  <span className="font-heading font-black text-3xl sm:text-4xl text-text-primary">
                    {bestseller.price.toLocaleString('fr-FR')} <span className="text-accent text-2xl font-bold">FCFA</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent px-6 py-3.5 text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <MessageCircle size={17} />
                    Commander WhatsApp
                  </a>

                  <Link
                    href={`/produit/${bestseller.slug}`}
                    className="btn-outline-dark px-5 py-3.5 text-sm font-bold uppercase tracking-wider"
                  >
                    Fiche Complète
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
