import Image from 'next/image'
import Link from 'next/link'
import { Phone, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function Footer() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite obtenir des informations sur vos produits.')}`

  return (
    <footer className="bg-bg-dark border-t border-border-dark" id="contact">
      <div className="container-site py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Colonne 1 — Logo + tagline */}
          <div className="flex flex-col gap-4">
            <Image
              src="/brand/logo-dark-bg.png"
              alt="Continental®"
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
            />
            <p className="text-text-light/50 text-sm leading-relaxed max-w-xs">
              Ventilateurs et climatiseurs haute performance.<br />
              Qualité certifiée — Garantie 2 ans.
            </p>
            <p className="product-ref text-text-light/30">
              Disponible à Dakar, Sénégal
            </p>
          </div>

          {/* Colonne 2 — Navigation */}
          <div>
            <h3 className="font-heading text-text-light font-bold text-lg tracking-wide mb-5">
              Navigation
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Accueil', href: '/' },
                { label: 'Catalogue', href: '/catalogue' },
                { label: 'Ventilateurs sur pied', href: '/catalogue?cat=ventilateur-pied' },
                { label: 'Ventilateurs muraux', href: '/catalogue?cat=ventilateur-mural' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-light/50 hover:text-text-light text-sm transition-colors duration-250"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Contact */}
          <div>
            <h3 className="font-heading text-text-light font-bold text-lg tracking-wide mb-5">
              Commander
            </h3>
            <div className="flex flex-col gap-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-light/80 hover:text-text-light transition-colors group"
              >
                <span className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                  <MessageCircle size={17} className="text-[#25D366]" />
                </span>
                <div>
                  <p className="text-xs text-text-light/40 uppercase tracking-wider product-ref">WhatsApp</p>
                  <p className="text-sm font-medium">{siteConfig.contact.phone}</p>
                </div>
              </a>

              <a
                href={`tel:${siteConfig.contact.whatsapp}`}
                className="flex items-center gap-3 text-text-light/80 hover:text-text-light transition-colors group"
              >
                <span className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Phone size={17} className="text-accent" />
                </span>
                <div>
                  <p className="text-xs text-text-light/40 uppercase tracking-wider product-ref">Téléphone</p>
                  <p className="text-sm font-medium">{siteConfig.contact.phone}</p>
                </div>
              </a>

              {/* Horaires */}
              <div className="mt-2 pt-4 border-t border-border-dark">
                <p className="text-xs text-text-light/40 uppercase tracking-wider product-ref mb-2">Horaires</p>
                <p className="text-sm text-text-light/60">Lun – Ven : {siteConfig.hours.weekdays}</p>
                <p className="text-sm text-text-light/60">Samedi : {siteConfig.hours.saturday}</p>
                <p className="text-sm text-text-light/60">Dimanche : {siteConfig.hours.sunday}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-border-dark flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-light/30 text-xs product-ref">
            © {new Date().getFullYear()} Continental®. Tous droits réservés.
          </p>
          <p className="text-text-light/20 text-xs product-ref">
            Qualité Continentale — Garantie 2 Ans
          </p>
        </div>
      </div>
    </footer>
  )
}
