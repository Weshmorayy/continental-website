import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react'
import type { Product } from '@/data/products'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'

interface ProductCardProps {
  product: Product
  size?: 'default' | 'large'
}

export default function ProductCard({ product, size = 'default' }: ProductCardProps) {
  const waMessage = buildOrderMessage({ productName: product.name, ref: product.ref })
  const waUrl = buildWhatsAppUrl(waMessage)

  return (
    <article className="flex flex-col bg-white border-2 border-border hover:border-accent transition-all duration-200 group shadow-sm hover:shadow-md">
      {/* Zone Image Blanche Propre avec Badge Contrasté */}
      <div className="relative bg-white border-b border-border overflow-hidden">
        {/* Badge produit haute visibilité */}
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider uppercase bg-bg-dark text-white border border-border-dark shadow-sm">
            {product.badge}
          </span>
        )}

        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span>2 Ans Garantie</span>
        </div>

        <Link
          href={`/produit/${product.slug}`}
          className={`block relative ${size === 'large' ? 'h-64 sm:h-72' : 'h-52 sm:h-56'} w-full p-4`}
          aria-label={product.name}
        >
          <Image
            src={product.image}
            alt={`${product.name} (${product.ref})`}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
      </div>

      {/* Informations Produits Claires et Contrastées */}
      <div className="flex flex-col flex-1 p-5 gap-3 justify-between bg-white">
        <div>
          {/* Référence et Catégorie */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-accent tracking-wider uppercase">
              RÉF. {product.ref}
            </span>
            <span className="text-[11px] font-medium text-text-muted">
              {product.categoryLabel}
            </span>
          </div>

          {/* Nom Produit */}
          <Link href={`/produit/${product.slug}`}>
            <h3 className="font-heading font-bold text-xl text-text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Caractéristiques principales */}
          <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
            {product.features.slice(0, 2).map((feat, i) => (
              <li key={i} className="text-xs text-text-body font-medium flex items-start gap-1.5">
                <span className="text-accent font-bold">•</span>
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Carte : Prix FCFA et Actions */}
        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">Prix Indicatif</span>
            <span className="font-heading font-black text-2xl text-text-primary">
              {product.price.toLocaleString('fr-FR')} <span className="text-accent text-sm font-bold">FCFA</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent py-2 px-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              aria-label={`Commander ${product.name} sur WhatsApp`}
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>

            <Link
              href={`/produit/${product.slug}`}
              className="btn-outline-dark py-2 px-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"
            >
              Détails <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </article>
  )
}
