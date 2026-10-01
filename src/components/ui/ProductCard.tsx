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
  const waUrl = buildWhatsAppUrl(
    buildOrderMessage({ productName: product.name, ref: product.ref })
  )

  return (
    <article className="flex flex-col bg-bg-primary border border-border rounded-3xl overflow-hidden transition-all duration-250 group hover:border-text-primary hover:shadow-[0_20px_50px_-32px_rgba(22,19,15,0.55)] hover:-translate-y-1">

      {/* Scène produit — blanc pur, sans bordure dure */}
      <div className="relative bg-white">
        {/* Badge produit — hors du conteneur qui tronque */}
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-text-primary text-white px-3 py-1 text-[10px] product-ref tracking-[0.14em]">
            {product.badge}
          </span>
        )}

        <Link
          href={`/produit/${product.slug}`}
          className={`block relative w-full ${size === 'large' ? 'h-64 sm:h-72' : 'h-52 sm:h-60'}`}
          aria-label={product.name}
        >
          <Image
            src={product.image}
            alt={`${product.name} (${product.ref})`}
            fill
            className="object-contain p-8 transition-transform duration-300 group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
      </div>

      {/* Informations */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <span className="product-ref text-accent tracking-[0.12em]">{product.ref}</span>
          <span className="text-[11px] text-text-muted text-right">{product.categoryLabel}</span>
        </div>

        <Link href={`/produit/${product.slug}`} className="block">
          <h3 className="font-heading font-semibold text-lg leading-snug text-text-primary group-hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <ul className="mt-4 space-y-1.5">
          {product.features.slice(0, 2).map((feat, i) => (
            <li key={i} className="text-xs text-text-muted leading-relaxed line-clamp-1">
              {feat}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <div className="flex items-baseline justify-between gap-3 pb-5">
            <span className="text-[10px] product-ref text-text-muted">Prix indicatif</span>
            <span className="font-heading font-semibold text-2xl text-text-primary">
              {product.price.toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-medium text-text-muted">FCFA</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa flex-1 px-4 py-2.5 text-xs"
              aria-label={`Commander ${product.name} sur WhatsApp`}
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
            <Link
              href={`/produit/${product.slug}`}
              className="btn-outline-dark px-4 py-2.5 text-xs flex-shrink-0"
            >
              Détails
              <ArrowRight size={14} />
            </Link>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-text-muted">
            <ShieldCheck size={13} className="text-accent flex-shrink-0" />
            Garantie fabricant 2 ans
          </p>
        </div>
      </div>
    </article>
  )
}
