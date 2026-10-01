import { Truck, CreditCard, Clock } from 'lucide-react'
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
    <section className="bg-bg-secondary py-20 md:py-28">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* Zones & délais */}
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5">Livraison</p>
            <h2 className="font-heading font-semibold text-text-primary text-3xl sm:text-4xl leading-[1.1] tracking-[-0.02em] mb-4">
              Livré chez vous, payé à la réception.
            </h2>
            <p className="text-text-body leading-relaxed mb-9 max-w-lg">
              Vos commandes sont préparées et acheminées par des livreurs professionnels.
              Livraison gratuite à partir de{' '}
              <strong className="text-text-primary font-semibold">
                {siteConfig.delivery.freeFrom.toLocaleString('fr-FR')} FCFA
              </strong>
              .
            </p>

            {/* Zones — liste éditoriale, pas 6 cartes identiques */}
            <ul className="border-t border-border">
              {siteConfig.delivery.zones.map((zone) => (
                <li
                  key={zone.name}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-border"
                >
                  <span className="font-heading font-medium text-text-primary text-base">
                    {zone.name}
                  </span>
                  <span className="flex items-center gap-5">
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock size={13} />
                      {zone.delay}
                    </span>
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        zone.fee === 0 ? 'text-accent' : 'text-text-primary'
                      }`}
                    >
                      {zone.fee === 0
                        ? 'Gratuit'
                        : `${zone.fee.toLocaleString('fr-FR')} FCFA`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-7 plinth p-5 text-sm text-text-body leading-relaxed">
              <strong className="text-text-primary font-semibold">Contrôle sur place :</strong>{' '}
              déballez et allumez votre appareil avec le livreur avant de valider votre achat.
            </p>
          </div>

          {/* Paiements */}
          <div className="lg:col-span-5">
            <div className="bg-bg-primary rounded-3xl border border-border p-8 sm:p-10 h-full flex flex-col">
              <p className="eyebrow mb-5">Règlement</p>
              <h3 className="font-heading font-semibold text-text-primary text-2xl leading-snug mb-3">
                Les moyens de paiement les plus utilisés au Sénégal
              </h3>
              <p className="text-text-body text-sm leading-relaxed mb-8">
                Réglez à la commande ou directement au livreur.
              </p>

              {/* Chips neutres — pas de couleurs de marque, notamment aucun bleu */}
              <ul className="grid grid-cols-2 gap-3 mb-8">
                {payments.map((pay) => (
                  <li
                    key={pay.name}
                    className="rounded-2xl border border-border bg-bg-secondary px-4 py-3.5"
                  >
                    <span className="block text-sm font-semibold text-text-primary">{pay.name}</span>
                    <span className="block text-[11px] text-text-muted mt-0.5">{pay.note}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-7 border-t border-border">
                <p className="flex items-start gap-2.5 text-sm text-text-body mb-5">
                  <CreditCard size={17} className="text-accent mt-0.5 flex-shrink-0" />
                  Besoin d&apos;une facture proforma ou d&apos;un règlement par virement entreprise ?
                </p>
                <a
                  href={waProforma}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-dark w-full"
                >
                  Demande proforma B2B
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
