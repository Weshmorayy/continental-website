import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Wind, Snowflake, CheckCircle2 } from 'lucide-react'

export default function GammesSection() {
  return (
    <section className="bg-bg-secondary py-16 md:py-24 border-b border-border">
      <div className="container-site">

        {/* Section Header avec contraste fort */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 text-accent font-mono font-bold text-xs uppercase tracking-widest mb-3">
            <span className="w-6 h-0.5 bg-accent" />
            <span>SOLUTIONS DE REFROIDISSEMENT</span>
          </div>
          <h2 className="font-heading font-black text-text-primary text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
            Deux univers conçus pour dompter la chaleur.
          </h2>
          <p className="text-text-body text-base md:text-lg mt-3 font-normal">
            Appareils testés en conditions extrêmes pour garantir une fraîcheur continue
            dans votre maison, vos bureaux ou vos locaux commerciaux à Dakar.
          </p>
        </div>

        {/* Grille des 2 Gammes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Gamme 1 : Ventilateurs */}
          <div className="bg-white border-2 border-border hover:border-accent transition-all duration-200 shadow-sm hover:shadow-lg flex flex-col justify-between group">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="px-3 py-1 bg-accent/10 text-accent font-mono font-bold text-xs uppercase tracking-wider">
                  Gamme Ventilation
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                  En Stock Immédiat
                </span>
              </div>

              <h3 className="font-heading font-black text-text-primary text-2xl sm:text-3xl mb-3">
                Ventilateurs Pied, Sol & Muraux
              </h3>
              <p className="text-text-body text-sm leading-relaxed mb-6">
                Brasseurs d&apos;air gros débit, ventilateurs silencieux sur pied à télécommande
                et modèles industriels renforcés à moteur 100% cuivre.
              </p>

              <ul className="space-y-2 mb-6 text-sm text-text-body">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  <span>3 à 8 vitesses & modes brise naturelle</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  <span>Moteur bobiné cuivre longue durée de vie</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  <span>Garantie 2 ans avec service après-vente dédié</span>
                </li>
              </ul>
            </div>

            {/* Photo Produit Isolée */}
            <div className="relative h-64 sm:h-72 w-full bg-bg-secondary/60 border-t border-border flex items-center justify-center p-6 overflow-hidden">
              <Image
                src="/products/ventilateur-sol-louisiane-45cm.jpg"
                alt="Brasseur d'air sol Continental"
                fill
                className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            </div>

            <div className="p-6 bg-white border-t border-border flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-text-muted uppercase">
                Modèles dès 30.000 FCFA
              </span>
              <Link
                href="/catalogue?cat=ventilateur-pied"
                className="inline-flex items-center gap-2 font-bold text-accent hover:text-accent-hover text-sm group-hover:translate-x-1 transition-all"
              >
                Voir les ventilateurs <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Gamme 2 : Climatiseurs */}
          <div className="bg-white border-2 border-border hover:border-accent transition-all duration-200 shadow-sm hover:shadow-lg flex flex-col justify-between group">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-900 font-mono font-bold text-xs uppercase tracking-wider">
                  Gamme Climatisation
                </span>
                <span className="text-xs font-bold text-accent bg-accent-light px-2.5 py-1 border border-blue-200">
                  Technologie Inverter
                </span>
              </div>

              <h3 className="font-heading font-black text-text-primary text-2xl sm:text-3xl mb-3">
                Climatiseurs Split Inverter Tropicalisés
              </h3>
              <p className="text-text-body text-sm leading-relaxed mb-6">
                Splits haute performance de 9.000 à 18.000 BTU. Économies d&apos;énergie jusqu&apos;à 60%,
                protection anti-corrosion Gold Fin et silence total de fonctionnement.
              </p>

              <ul className="space-y-2 mb-6 text-sm text-text-body">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  <span>Compresseur T3 tropicalisé certifié 55°C</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  <span>Consommation électrique réduite (Classe A+++)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                  <span>Traitement spécial résistance air marin côtier</span>
                </li>
              </ul>
            </div>

            {/* Photo Produit Climatiseur Isolée */}
            <div className="relative h-64 sm:h-72 w-full bg-bg-secondary/60 border-t border-border flex items-center justify-center p-6 overflow-hidden">
              <Image
                src="/products/climatiseur-split-pro-inverter.jpg"
                alt="Climatiseur Inverter Continental"
                fill
                className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            </div>

            <div className="p-6 bg-white border-t border-border flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-text-muted uppercase">
                9.000 · 12.000 · 18.000 BTU
              </span>
              <Link
                href="/catalogue?cat=climatiseur"
                className="inline-flex items-center gap-2 font-bold text-accent hover:text-accent-hover text-sm group-hover:translate-x-1 transition-all"
              >
                Découvrir les splits <ArrowRight size={16} />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
