import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Phone, MessageCircle, MapPin } from 'lucide-react'
import { siteConfig } from '@/config/site'

const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
  'Bonjour Continental, je souhaite commander un appareil.'
)}`

const groups = [
  {
    label: 'Acheter',
    links: [
      { label: 'Ventilateurs sur pied', href: '/catalogue?cat=ventilateur-pied' },
      { label: 'Ventilateurs sol', href: '/catalogue?cat=ventilateur-sol' },
      { label: 'Climatiseurs Inverter', href: '/catalogue?cat=climatiseur' },
      { label: 'Tout le catalogue', href: '/catalogue' },
    ],
  },
  {
    label: 'Service',
    links: [
      { label: 'Garantie & SAV', href: '/garantie' },
      { label: 'Nous contacter', href: '/contact' },
      { label: 'À propos de la marque', href: '/a-propos' },
    ],
  },
]

export default function Footer() {
  return (
    <footer id="contact" className="bg-bg-primary">
      <div className="container-site">

        {/* Bloc marque + contact direct */}
        <div className="py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-5">
            <Image
              src="/brand/logo-light.png"
              alt="Continental®"
              width={150}
              height={42}
              className="h-7 w-auto object-contain mb-5"
            />
            <p className="text-text-body text-sm leading-relaxed max-w-sm">
              Continental® — ventilation robuste et climatisation Inverter adaptés au
              climat de Dakar. Chaque modèle est livré avec garantie fabricant 2 ans.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa text-sm">
                <MessageCircle size={16} />
                Écrire sur WhatsApp
              </a>
              <a href={`tel:${siteConfig.contact.whatsapp}`} className="btn-outline text-sm">
                <Phone size={16} />
                Appeler
              </a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <h2 className="product-ref text-text-muted uppercase tracking-[0.12em] mb-5">
              Service commercial
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={17} strokeWidth={1.5} className="text-text-primary mt-0.5 flex-shrink-0" />
                <span className="text-text-body">
                  <strong className="text-text-primary font-semibold block">Dakar, Sénégal</strong>
                  Livraison sur Dakar Plateau, Almadies, Ouakam, Médina, Guédiawaye,
                  Pikine et Rufisque.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={17} strokeWidth={1.5} className="text-text-primary flex-shrink-0" />
                <a href={`tel:${siteConfig.contact.whatsapp}`} className="text-text-primary font-semibold">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={17} strokeWidth={1.5} className="text-text-primary flex-shrink-0" />
                <span className="text-text-body">
                  Commandes WhatsApp · {siteConfig.hours.weekdays}
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="product-ref text-text-muted uppercase tracking-[0.12em] mb-5">
              Paiements acceptés
            </h2>
            <ul className="space-y-2 text-sm text-text-body">
              {['Wave', 'Orange Money', 'Free Money', 'Espèces à la livraison'].map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rangées accordéon — structure du pied de page samsung.com.
            <details> natif : aucun JavaScript requis, accessible au clavier. */}
        <div className="border-t border-border">
          {groups.map((g) => (
            <details key={g.label} className="group border-b border-border">
              <summary className="flex items-center justify-between gap-4 py-6 cursor-pointer list-none display-md text-text-primary text-lg sm:text-xl tracking-tight uppercase hover:opacity-60 transition-opacity">
                {g.label}
                <ChevronDown
                  size={22}
                  strokeWidth={1.5}
                  className="flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <ul className="pb-7 flex flex-col gap-3">
                {g.links.map((l) => (
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
            </details>
          ))}
        </div>

        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Continental®. Marque déposée. Tous droits réservés.</p>
          <p>Paiement à la livraison · Essai sur place avant validation</p>
        </div>

      </div>
    </footer>
  )
}
