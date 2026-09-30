import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const ventilateurGamme = {
  title: 'Ventilateurs',
  description: 'Sur pied, muraux, orbitaux — pour chaque pièce de la maison ou du bureau.',
  image: '/products/stand-fan-5-308r.jpg',
  href: '/catalogue?cat=ventilateur-pied',
  count: '6 modèles disponibles',
}

const climatiseurGamme = {
  title: 'Climatiseurs',
  description: 'Fraîcheur optimale, économie d\'énergie, installation professionnelle.',
  href: '/catalogue?cat=climatiseur',
  count: 'Bientôt disponible',
  comingSoon: true,
}

export default function GammesSection() {
  return (
    <section className="bg-bg-primary py-20 md:py-28">
      <div className="container-site">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="product-ref text-text-muted tracking-[0.25em] mb-3">NOS GAMMES</p>
          <h2 className="font-heading font-bold text-text-primary text-4xl md:text-5xl">
            Ventilation haute performance,<br className="hidden md:block" />
            choisie pour le climat de Dakar.
          </h2>
        </div>

        {/* 2 colonnes asymétriques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">

          {/* Grande carte — Ventilateurs */}
          <div className="md:col-span-3 relative bg-bg-secondary overflow-hidden group">
            <div className="relative h-72 md:h-96 bg-white">
              <Image
                src={ventilateurGamme.image}
                alt={ventilateurGamme.title}
                fill
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-3">
              <p className="product-ref text-text-muted tracking-widest">{ventilateurGamme.count}</p>
              <h3 className="font-heading font-bold text-text-primary text-3xl md:text-4xl">
                {ventilateurGamme.title}
              </h3>
              <p className="text-text-body text-sm leading-relaxed max-w-sm">
                {ventilateurGamme.description}
              </p>
              <Link
                href={ventilateurGamme.href}
                className="inline-flex items-center gap-2 text-accent text-sm font-medium mt-2 hover:gap-3 transition-all duration-250"
              >
                Explorer la gamme <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Petite carte — Climatiseurs */}
          <div className="md:col-span-2 relative bg-bg-dark overflow-hidden group">
            <div className="relative h-52 md:h-96 flex items-center justify-center">
              {/* Placeholder visuel pour les climatiseurs */}
              <div className="flex flex-col items-center gap-4 opacity-20">
                <div className="w-24 h-24 border-2 border-white/40 rounded-full flex items-center justify-center">
                  <span className="font-heading font-black text-white text-3xl">AC</span>
                </div>
              </div>
              {/* Badge "Bientôt" */}
              <span className="absolute top-4 left-4 px-3 py-1 bg-accent/20 border border-accent/30 text-accent text-[10px] product-ref tracking-widest uppercase">
                Bientôt
              </span>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-3">
              <p className="product-ref text-text-light/30 tracking-widest">{climatiseurGamme.count}</p>
              <h3 className="font-heading font-bold text-text-light text-3xl md:text-4xl">
                {climatiseurGamme.title}
              </h3>
              <p className="text-text-light/50 text-sm leading-relaxed max-w-sm">
                {climatiseurGamme.description}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
