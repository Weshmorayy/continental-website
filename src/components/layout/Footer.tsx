import Image from 'next/image'
import Link from 'next/link'
import { Phone, MessageCircle, MapPin, ShieldCheck } from 'lucide-react'
import { siteConfig } from '@/config/site'

const footerNav = [
  { label: 'Accueil', href: '/' },
  { label: 'Tous les modèles', href: '/catalogue' },
  { label: 'Ventilateurs sur pied', href: '/catalogue?cat=ventilateur-pied' },
  { label: 'Climatiseurs Inverter', href: '/catalogue?cat=climatiseur' },
]

const footerInfo = [
  { label: 'Politique de garantie 2 ans', href: '/garantie' },
  { label: 'À propos de la marque', href: '/a-propos' },
  { label: 'Informations de contact', href: '/contact' },
]

export default function Footer() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    'Bonjour Continental, je souhaite commander un appareil.'
  )}`

  return (
    <footer className="bg-bg-tertiary" id="contact">
      <div className="container-site py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Marque */}
          <div className="lg:col-span-4">
            <Image
              src="/brand/logo-light.png"
              alt="Continental®"
              width={170}
              height={48}
              className="h-9 w-auto object-contain mb-5"
            />
            <p className="text-text-body text-sm leading-relaxed max-w-xs mb-6">
              Continental® — ventilation robuste et climatisation Inverter adaptés au
              climat de Dakar.
            </p>
            <p className="inline-flex items-center gap-2 rounded-full bg-bg-primary border border-border px-4 py-2 text-xs font-medium text-text-primary">
              <ShieldCheck size={15} className="text-accent flex-shrink-0" />
              Garantie fabricant 2 ans
            </p>
          </div>

          {/* Navigation */}
          <nav className="lg:col-span-2" aria-label="Pied de page — catalogue">
            <h2 className="product-ref text-text-muted mb-5">Catalogue</h2>
            <ul className="space-y-3">
              {footerNav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-text-body hover:text-text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label="Pied de page — informations">
            <h2 className="product-ref text-text-muted mb-5">Informations</h2>
            <ul className="space-y-3">
              {footerInfo.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-text-body hover:text-text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h2 className="product-ref text-text-muted mb-5">Service commercial Dakar</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={17} className="text-accent mt-0.5 flex-shrink-0" />
                <span className="text-text-body">
                  <strong className="text-text-primary font-semibold block">Dakar, Sénégal</strong>
                  Livraison sur Dakar Plateau, Almadies, Ouakam, Médina, Guédiawaye,
                  Pikine et Rufisque.
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Phone size={17} className="text-accent flex-shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.whatsapp}`}
                  className="text-text-primary font-semibold hover:underline"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>

              <li className="flex items-center gap-3">
                <MessageCircle size={17} className="text-accent flex-shrink-0" />
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-primary font-semibold hover:underline"
                >
                  Commandes WhatsApp
                </a>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa text-sm">
                <MessageCircle size={16} />
                Écrire sur WhatsApp
              </a>
              <a href={`tel:${siteConfig.contact.whatsapp}`} className="btn-outline-dark text-sm">
                <Phone size={16} />
                Appeler
              </a>
            </div>
          </div>

        </div>

        <div className="mt-14 pt-7 border-t border-border-dark/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Continental®. Marque déposée. Tous droits réservés.</p>
          <p>Paiements : Wave · Orange Money · Free Money · Espèces</p>
        </div>
      </div>
    </footer>
  )
}
