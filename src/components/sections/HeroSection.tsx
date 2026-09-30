import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, MessageCircle, Shield, Award, Wind } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function HeroSection() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Bonjour Continental, je souhaite obtenir des informations sur vos ventilateurs et climatiseurs.')}`

  return (
    <section className="relative bg-bg-dark text-text-light overflow-hidden border-b border-border-dark">
      {/* Background avec overlay propre pour garantir 100% de lisibilité */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/aesthetic/aesthetic-fan-livingroom.jpg"
          alt="Ambiance fraîcheur Continental®"
          fill
          priority
          className="object-cover object-center opacity-30 scale-105"
        />
        {/* Gradient sombre maîtrisé : aucun texte ne souffre d'un manque de contraste */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A0E] via-[#0A0E15]/95 to-[#0A0E15]/75" />
      </div>

      <div className="container-site relative z-10 py-16 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Colonne texte principale (7 colonnes) */}
          <div className="lg:col-span-7 flex flex-col items-start">

            {/* Surtitre Badge technique */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-accent/20 border border-accent text-accent-light text-xs font-mono font-bold tracking-widest uppercase mb-6 rounded-none shadow-sm">
              <Wind size={14} className="text-blue-400 flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span>CONTINENTAL® DAKAR</span>
                <span className="hidden sm:inline text-accent-light/50">·</span>
                <span className="text-blue-300">ÉLECTROMÉNAGER CERTIFIÉ</span>
              </div>
            </div>

            {/* Titre Principal percutant */}
            <h1
              className="font-heading font-black text-white leading-[0.92] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)' }}
            >
              L&apos;AIR DE LA <br />
              <span className="text-white underline decoration-accent decoration-4 underline-offset-8">
                PERFORMANCE.
              </span>
            </h1>

            {/* Description avec fort contraste */}
            <p className="text-text-light-sub text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mb-8">
              Ventilateurs industriels, brasseurs d&apos;air et climatiseurs Inverter conçus
              pour résister aux fortes chaleurs dakarroises. Moteurs 100% cuivre, silence optimisé
              et <strong className="text-white font-semibold">garantie fabricant 2 ans</strong>.
            </p>

            {/* Call to Actions clairs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                href="/catalogue"
                className="btn-accent px-8 py-4 text-sm font-bold tracking-wider uppercase text-center"
              >
                <ShoppingBag size={18} />
                Explorer le catalogue
                <ArrowRight size={16} />
              </Link>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white px-7 py-4 text-sm font-bold tracking-wider uppercase text-center flex items-center justify-center gap-2.5"
              >
                <MessageCircle size={18} className="text-emerald-400" />
                Commander sur WhatsApp
              </a>
            </div>

            {/* Micro-assurances sous les boutons */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border-dark/80 text-xs font-medium text-text-light-sub">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-accent" />
                <span>Garantie 2 ans certifiée</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-accent" />
                <span>Moteur 100% Cuivre bobiné</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Disponibilité immédiate à Dakar</span>
              </div>
            </div>

          </div>

          {/* Colonne visuelle : Produit Star en vedette (5 colonnes) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md bg-gradient-to-b from-white/10 to-white/5 p-4 sm:p-6 backdrop-blur-md border border-white/20 shadow-2xl">
              
              {/* Badge flottant */}
              <div className="absolute -top-3 -right-3 bg-accent text-white px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider shadow-lg">
                Édition 2026
              </div>

              {/* Cadre produit avec fond blanc pur pour faire ressortir l'appareil réel */}
              <div className="relative h-72 sm:h-80 w-full bg-white p-6 shadow-inner flex items-center justify-center">
                <Image
                  src="/products/ventilateur-pied-fs4011.jpg"
                  alt="Ventilateur sur pied Continental FS4011"
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 400px"
                  priority
                />
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="product-ref text-text-light-sub text-[11px]">SÉLECTION PHARE</p>
                  <h3 className="font-heading text-white font-bold text-xl leading-tight">
                    Ventilateur Télécommande 16&quot;
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-text-light-sub block">À partir de</span>
                  <span className="font-heading font-black text-2xl text-blue-400">30.000 FCFA</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
