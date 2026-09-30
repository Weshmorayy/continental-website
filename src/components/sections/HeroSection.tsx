import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function HeroSection() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite commander un produit Continental.')}`

  return (
    <section className="section-hero bg-bg-dark relative overflow-hidden">
      {/* Texture d'ambiance — grille subtile */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)',
        }}
        aria-hidden="true"
      />

      {/* Accent lumineux — coin supérieur droit */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.06]"
        style={{ background: 'var(--color-accent)', filter: 'blur(80px)' }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10 py-32 md:py-0">
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <p className="product-ref text-text-light/40 mb-6 tracking-[0.25em]">
            CONTINENTAL® — DAKAR, SÉNÉGAL
          </p>

          {/* Titre principal */}
          <h1 className="font-heading font-black text-text-light leading-[0.92] mb-8"
            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}>
            L&apos;air de<br />
            la performance.
          </h1>

          {/* Sous-titre */}
          <p className="text-text-light/60 text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
            Ventilateurs et climatiseurs certifiés Continental®.
            Livrés à Dakar et banlieue. Garantie 2 ans.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/catalogue" className="btn-accent px-8 py-4 text-sm tracking-widest uppercase">
              <ShoppingBag size={16} />
              Voir le catalogue
              <ArrowRight size={15} className="ml-1" />
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-white px-8 py-4 text-sm tracking-widest uppercase"
            >
              <MessageCircle size={16} />
              Commander sur WhatsApp
            </a>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="product-ref text-text-light text-[9px] tracking-[0.3em]">DÉFILER</span>
        <div className="w-px h-12 bg-text-light/50" />
      </div>
    </section>
  )
}
