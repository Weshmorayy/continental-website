import { Clock, CreditCard, ShieldCheck } from 'lucide-react'
import { siteConfig } from '@/config/site'

const payments = [
  { name: 'Wave Sénégal', note: 'Sans frais' },
  { name: 'Orange Money', note: 'Disponible' },
  { name: 'Free Money', note: 'Disponible' },
  { name: 'Espèces', note: 'Au livreur' },
]

export default function LivraisonSection() {
  const waProforma = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    'Bonjour Continental, je souhaite une facture proforma pour mon entreprise.'
  )}`

  return (
    <section className="bg-bg-primary py-20 sm:py-28">
      <div className="container-site">

        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <p className="eyebrow eyebrow-center">Livraison & paiement</p>
          <h2 className="display-lg text-text-primary mt-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            Livré chez vous, payé à la réception.
          </h2>
          <p className="mt-5 text-text-body">
            Livraison gratuite à partir de{' '}
            {siteConfig.delivery.freeFrom.toLocaleString('fr-FR')} FCFA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Zones — liste avec filets, style samsung.com */}
          <div className="lg:col-span-7">
            <h3 className="display-sm text-xl text-text-primary mb-6">Délais par secteur</h3>

            <ul>
              {siteConfig.delivery.zones.map((zone) => (
                <li
                  key={zone.name}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 hairline"
                >
                  <span className="display-sm text-base text-text-primary">{zone.name}</span>
                  <span className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock size={13} />
                      {zone.delay}
                    </span>
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        zone.fee === 0 ? 'text-accent' : 'text-text-primary'
                      }`}
                    >
                      {zone.fee === 0 ? 'Gratuit' : `${zone.fee.toLocaleString('fr-FR')} FCFA`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 flex items-start gap-3 text-sm text-text-body leading-relaxed">
              <ShieldCheck size={18} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <span>
                <strong className="text-text-primary font-semibold">Contrôle sur place :</strong>{' '}
                déballez et allumez votre appareil avec le livreur avant de valider votre achat.
              </span>
            </p>
          </div>

          {/* Paiements */}
          <div className="lg:col-span-5">
            <h3 className="display-sm text-xl text-text-primary mb-6">Moyens de paiement</h3>

            <ul className="grid grid-cols-2 gap-3">
              {payments.map((pay) => (
                <li key={pay.name} className="stage px-5 py-5">
                  <span className="display-sm block text-text-primary text-sm">{pay.name}</span>
                  <span className="block text-xs text-text-muted mt-1">{pay.note}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-8 hairline">
              <p className="flex items-start gap-2.5 text-sm text-text-body mb-5">
                <CreditCard size={18} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                Besoin d&apos;une facture proforma ou d&apos;un règlement par virement entreprise ?
              </p>
              <a
                href={waProforma}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full"
              >
                Demande proforma B2B
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
