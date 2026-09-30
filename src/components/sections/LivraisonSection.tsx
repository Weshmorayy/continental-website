import { Truck, CreditCard } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function LivraisonSection() {
  return (
    <section className="bg-bg-secondary py-20 md:py-28">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">

          {/* Livraison */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Truck size={18} className="text-accent" />
              </div>
              <div>
                <p className="product-ref text-text-muted tracking-widest">ZONES DE LIVRAISON</p>
                <h3 className="font-heading font-bold text-text-primary text-2xl">
                  Dakar et banlieue
                </h3>
              </div>
            </div>

            <div className="border-l-2 pl-5" style={{ borderColor: 'var(--color-accent)' }}>
              <p className="text-text-body text-sm leading-relaxed mb-4">
                Livraison disponible dans toute la région dakaroise. Livraison gratuite
                à partir de <strong className="text-text-primary">50 000 FCFA</strong> d&apos;achat.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {siteConfig.delivery.zones.map((zone) => (
                <div key={zone.name} className="flex flex-col gap-1 p-3 bg-bg-primary border border-border">
                  <p className="text-text-primary text-sm font-medium">{zone.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="product-ref text-text-muted">{zone.delay}</span>
                    <span className="product-ref text-accent">
                      {zone.fee === 0 ? 'Gratuit' : `${zone.fee.toLocaleString('fr-FR')} FCFA`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paiements */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 flex items-center justify-center flex-shrink-0">
                <CreditCard size={18} className="text-accent" />
              </div>
              <div>
                <p className="product-ref text-text-muted tracking-widest">MODES DE PAIEMENT</p>
                <h3 className="font-heading font-bold text-text-primary text-2xl">
                  Paiements acceptés
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: 'Wave', available: siteConfig.payments.wave,        color: '#0066FF' },
                { label: 'Orange Money', available: siteConfig.payments.orangeMoney, color: '#FF6600' },
                { label: 'Free Money',   available: siteConfig.payments.freeMoney,   color: '#CC0000' },
                { label: 'Espèces',      available: siteConfig.payments.cash,        color: '#3D3D3D' },
              ]
                .filter((p) => p.available)
                .map((payment) => (
                  <div
                    key={payment.label}
                    className="flex items-center gap-3 px-4 py-3 bg-bg-primary border border-border"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: payment.color }}
                    />
                    <span className="text-sm text-text-body font-medium">{payment.label}</span>
                  </div>
                ))}
            </div>

            {/* Note commande */}
            <div className="mt-2 p-4 bg-accent/5 border border-accent/20">
              <p className="text-text-primary text-sm font-medium mb-1">Comment commander ?</p>
              <p className="text-text-body text-sm leading-relaxed">
                Envoyez-nous un message WhatsApp avec la référence du produit.
                Nous confirmons la disponibilité, le prix et les modalités de livraison.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
