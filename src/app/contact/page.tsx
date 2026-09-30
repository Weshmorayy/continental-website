import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { generatePageMetadata } from '@/lib/seo'
import { Phone, MessageCircle, MapPin, Clock, Mail } from 'lucide-react'
import { siteConfig } from '@/config/site'

export const metadata = generatePageMetadata({
  title: 'Contact & Commandes — Continental®',
  description: 'Contactez Continental® Dakar : commandes WhatsApp, conseil produit, SAV et livraison. Service disponible 7j/7 dans la région de Dakar.',
  path: '/contact',
})

export default function ContactPage() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Bonjour Continental, je souhaite être mis en contact avec votre service commercial.')}`

  return (
    <>
      <Header />
      <main>
        {/* Hero Contact */}
        <section className="bg-bg-dark text-text-light pb-16 md:pb-24">
          <div className="container-site py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-4">
                <Phone size={15} />
                NOUS CONTACTER
              </div>
              <h1 className="font-heading font-black text-white leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                Parlez directement<br />à notre équipe.
              </h1>
              <p className="text-text-light-sub text-lg leading-relaxed max-w-2xl">
                Conseil d&apos;achat, devis, livraison ou SAV — notre équipe commerciale basée à Dakar
                répond rapidement et sans intermédiaire.
              </p>
            </div>
          </div>
        </section>

        {/* Grille de contact */}
        <section className="bg-white py-16 md:py-24 border-b border-border">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* Colonne Info Contact (7 colonnes) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-3">
                    <span className="w-6 h-0.5 bg-accent" />
                    CANAUX DE CONTACT DIRECTS
                  </div>
                  <h2 className="font-heading font-black text-text-primary text-3xl mb-6">
                    Choisissez votre mode de contact.
                  </h2>
                </div>

                {/* WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-5 sm:p-6 bg-emerald-50 border-2 border-emerald-300 hover:bg-emerald-100 transition-colors group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                    <MessageCircle size={26} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-emerald-900">WhatsApp — Commandes & Conseil</h3>
                    <p className="text-emerald-800 text-xs sm:text-sm mt-0.5">Réponse en moins de 15 minutes · 7j/7 · 08h–20h</p>
                    <p className="font-mono font-bold text-emerald-900 text-sm mt-1">{siteConfig.contact.phone}</p>
                  </div>
                  <span className="inline-block self-start sm:self-center text-emerald-700 font-bold text-xs uppercase tracking-wider bg-emerald-200 px-3 py-1.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    Ouvrir WhatsApp →
                  </span>
                </a>

                {/* Téléphone */}
                <a
                  href={`tel:${siteConfig.contact.whatsapp}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-5 sm:p-6 bg-bg-secondary border-2 border-border hover:border-accent transition-colors group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/10 border-2 border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
                    <Phone size={26} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-text-primary">Appel Téléphonique Direct</h3>
                    <p className="text-text-body text-xs sm:text-sm mt-0.5">Pour toute urgence ou demande de devis immédiate</p>
                    <p className="font-mono font-bold text-accent text-base sm:text-lg mt-1">{siteConfig.contact.phone}</p>
                  </div>
                </a>

                {/* Horaires et zones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="p-5 bg-bg-secondary border-2 border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={18} className="text-accent" />
                      <h4 className="font-bold text-text-primary">Horaires d&apos;ouverture</h4>
                    </div>
                    <div className="space-y-1.5 text-sm text-text-body">
                      <div className="flex justify-between">
                        <span>Lundi – Vendredi</span>
                        <span className="font-semibold text-text-primary">08h – 20h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samedi – Dimanche</span>
                        <span className="font-semibold text-text-primary">09h – 18h</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-border mt-2">
                        <span>Jours fériés</span>
                        <span className="font-semibold text-accent">WhatsApp uniquement</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-bg-secondary border-2 border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={18} className="text-accent" />
                      <h4 className="font-bold text-text-primary">Zones de livraison</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-text-body">
                      {siteConfig.delivery.zones.map((zone) => (
                        <li key={zone.name} className="flex justify-between items-center">
                          <span>{zone.name}</span>
                          <span className="text-xs font-mono text-text-muted">{zone.delay}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Colonne FAQ rapide (5 colonnes) */}
              <div className="lg:col-span-5">
                <h3 className="font-heading font-black text-text-primary text-2xl mb-6 pb-3 border-b-2 border-border">
                  Questions fréquentes
                </h3>

                <div className="space-y-5">
                  {[
                    {
                      q: 'Comment passer commande ?',
                      a: "Envoyez un message WhatsApp avec le modèle souhaité. Notre équipe confirme la disponibilité, organise la livraison et confirme le paiement."
                    },
                    {
                      q: 'Quelle garantie sur les produits ?',
                      a: "Tous nos appareils bénéficient d'une garantie fabricant de 2 ans, pièces et main-d'œuvre incluses. Consultez la page Garantie pour les détails."
                    },
                    {
                      q: 'Quels sont les modes de paiement ?',
                      a: "Wave, Orange Money, Free Money et espèces à la livraison. Devis proforma disponible pour les entreprises sur demande."
                    },
                    {
                      q: 'Livrez-vous en dehors de Dakar ?',
                      a: "Actuellement, notre service de livraison couvre la région de Dakar et sa banlieue immédiate. Contactez-nous pour les cas particuliers."
                    },
                    {
                      q: "La climatisation inclut-elle l'installation ?",
                      a: "L'installation par notre technicien agréé est disponible en option. Demandez un devis installation lors de votre commande."
                    },
                  ].map((faq, i) => (
                    <div key={i} className="border-b border-border pb-4">
                      <h4 className="font-bold text-text-primary text-sm mb-1.5">{faq.q}</h4>
                      <p className="text-text-body text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-5 bg-accent/10 border border-accent/30">
                  <p className="text-xs font-medium text-accent font-mono uppercase tracking-wider mb-2">Vous ne trouvez pas votre réponse ?</p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent w-full text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={15} />
                    Poser ma question WhatsApp
                  </a>
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
