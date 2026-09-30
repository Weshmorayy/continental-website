import Image from 'next/image'
import Link from 'next/link'
import { Phone, MessageCircle, Mail, MapPin, ShieldCheck } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function Footer() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Bonjour Continental, je souhaite commander un appareil.')}`

  return (
    <footer className="bg-bg-dark text-text-light border-t-2 border-accent" id="contact">
      {/* Bandeau supérieur de contact direct */}
      <div className="border-b border-border-dark py-8 bg-bg-dark-card">
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-heading font-black text-white text-2xl">
              Prêt à équiper votre espace pour les fortes chaleurs ?
            </h3>
            <p className="text-text-light-sub text-sm mt-1">
              Contactez directement notre service commercial basé à Dakar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <MessageCircle size={16} />
              WhatsApp Direct
            </a>
            <a
              href={`tel:${siteConfig.contact.whatsapp}`}
              className="btn-outline-white px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Phone size={15} />
              {siteConfig.contact.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Corps du Footer */}
      <div className="container-site py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Colonne 1 : Marque & Présentation (4 colonnes) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white p-2.5 inline-block self-start border border-border">
              <Image
                src="/brand/logo-light.png"
                alt="Continental®"
                width={150}
                height={45}
                className="h-8 w-auto object-contain"
              />
            </div>

            <p className="text-text-light-sub text-sm leading-relaxed mt-2">
              Continental® est la marque d&apos;électroménager spécialisée dans la ventilation
              robuste et la climatisation Inverter à haut rendement pour le climat de Dakar.
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-accent-light bg-accent/15 border border-accent/30 px-3 py-2 self-start mt-2">
              <ShieldCheck size={16} className="text-accent" />
              <span>Garantie Fabricant 2 Ans sur tout le catalogue</span>
            </div>
          </div>

          {/* Colonne 2 : Pages & Gammes (3 colonnes) */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-white text-lg uppercase tracking-wider mb-4 border-b border-border-dark pb-2">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-text-light-sub">
              <li>
                <Link href="/" className="hover:text-white hover:underline transition-colors">
                  Page d&apos;accueil
                </Link>
              </li>
              <li>
                <Link href="/catalogue" className="hover:text-white hover:underline transition-colors">
                  Tous les modèles
                </Link>
              </li>
              <li>
                <Link href="/catalogue?cat=ventilateur-pied" className="hover:text-white hover:underline transition-colors">
                  Ventilateurs sur pied
                </Link>
              </li>
              <li>
                <Link href="/catalogue?cat=climatiseur" className="hover:text-white hover:underline transition-colors">
                  Climatiseurs Inverter
                </Link>
              </li>
              <li>
                <Link href="/garantie" className="hover:text-white hover:underline transition-colors">
                  Politique de garantie 2 ans
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-white hover:underline transition-colors">
                  À propos de la marque
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-colors">
                  Informations de contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Coordonnées Dakar (5 colonnes) */}
          <div className="lg:col-span-5">
            <h4 className="font-heading font-bold text-white text-lg uppercase tracking-wider mb-4 border-b border-border-dark pb-2">
              Service Client & Showroom Dakar
            </h4>
            <div className="space-y-3.5 text-sm text-text-light-sub">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Région de Dakar, Sénégal</strong>
                  <span>Livraison assurée sur Dakar Plateau, Almadies, Ouakam, Médina, Guédiawaye, Pikine, Rufisque.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-accent flex-shrink-0" />
                <div>
                  <span className="text-xs text-text-light-mute uppercase font-mono block">Ligne commerciale</span>
                  <a href={`tel:${siteConfig.contact.whatsapp}`} className="text-white font-bold hover:underline">
                    {siteConfig.contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle size={18} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-xs text-text-light-mute uppercase font-mono block">Commandes WhatsApp</span>
                  <span className="text-white font-medium">Réponse 7j/7 de 08h à 20h</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border-dark text-xs text-text-light-mute">
                <p>Paiements acceptés : Wave · Orange Money · Free Money · Espèces à la livraison</p>
              </div>
            </div>
          </div>

        </div>

        {/* Barre inférieure des droits */}
        <div className="mt-14 pt-6 border-t border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-light-mute">
          <p>© {new Date().getFullYear()} Continental®. Marque déposée. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/garantie" className="hover:text-white">Garantie 2 ans</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white">SAV & Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
