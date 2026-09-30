import { Truck, CreditCard, Clock, ShieldAlert } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function LivraisonSection() {
  return (
    <section className="bg-white py-16 md:py-24 border-b border-border">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Colonne Livraison & Délais (7 colonnes) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-3">
                <Truck size={15} />
                <span>EXPÉDITION & COUVERTURE GÉOGRAPHIQUE</span>
              </div>
              <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl mb-4">
                Livraison rapide partout dans la région de Dakar.
              </h2>
              <p className="text-text-body text-base mb-6 leading-relaxed">
                Vos commandes sont préparées et acheminées par des livreurs professionnels.
                Livraison gratuite à partir de <strong className="text-text-primary">50.000 FCFA</strong>.
              </p>
            </div>

            {/* Grille des secteurs — 3 colonnes comme avant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
              {siteConfig.delivery.zones.map((zone) => (
                <div
                  key={zone.name}
                  className="p-4 bg-bg-secondary border-2 border-border flex flex-col justify-between gap-2"
                >
                  <div>
                    <h3 className="text-sm font-bold text-text-primary leading-tight">{zone.name}</h3>
                    <span className="text-xs text-text-muted flex items-center gap-1 mt-1 font-mono">
                      <Clock size={12} /> {zone.delay}
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-1 inline-block self-start ${
                    zone.fee === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-accent border border-border'
                  }`}>
                    {zone.fee === 0 ? 'GRATUIT' : `${zone.fee.toLocaleString('fr-FR')} FCFA`}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-3">
              <ShieldAlert size={18} className="text-emerald-700 flex-shrink-0" />
              <span>
                <strong>Contrôle qualité sur place :</strong> Déballez et allumez votre appareil avec le livreur avant de valider votre achat.
              </span>
            </div>
          </div>

          {/* Colonne Paiements Sécurisés (5 colonnes) */}
          <div className="lg:col-span-5 bg-bg-secondary border-2 border-border p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-3">
                <CreditCard size={15} />
                <span>RÈGLEMENT SÉCURISÉ</span>
              </div>
              <h3 className="font-heading font-black text-text-primary text-2xl mb-4">
                Paiements locaux acceptés
              </h3>
              <p className="text-text-body text-sm mb-6 leading-relaxed">
                Réglez en toute sérénité à la livraison ou à la commande par les moyens
                de paiement les plus utilisés au Sénégal.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { name: 'Wave Sénégal', note: 'Sans frais', bg: 'bg-sky-50 border-sky-300 text-sky-900' },
                  { name: 'Orange Money', note: 'Disponible', bg: 'bg-orange-50 border-orange-300 text-orange-900' },
                  { name: 'Free Money', note: 'Disponible', bg: 'bg-red-50 border-red-300 text-red-900' },
                  { name: 'Espèces / Cash', note: 'Au livreur', bg: 'bg-slate-100 border-slate-300 text-slate-900' },
                ].map((pay) => (
                  <div key={pay.name} className={`p-3.5 border ${pay.bg} flex flex-col gap-0.5`}>
                    <span className="font-bold text-sm">{pay.name}</span>
                    <span className="text-[11px] opacity-75">{pay.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-text-muted mb-3 font-medium">
                Besoin d&apos;une facture proforma ou d&apos;un règlement virement entreprise ?
              </p>
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Bonjour Continental, je souhaite une facture proforma pour mon entreprise.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-dark w-full text-xs font-bold uppercase tracking-wider py-3"
              >
                Demande Proforma B2B
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
