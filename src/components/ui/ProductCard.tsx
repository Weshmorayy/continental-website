import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
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
    <article className="relative flex flex-col bg-bg-card group">
      {/* Badge — hors overflow-hidden */}
      {product.badge && (
        <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase bg-accent text-white product-ref">
          {product.badge}
        </span>
      )}

      {/* Image produit */}
      <Link href={`/produit/${product.slug}`} className="block overflow-hidden bg-white">
        <div className={`relative ${size === 'large' ? 'h-72 md:h-80' : 'h-52 md:h-60'} w-full`}>
          <Image
            src={product.image}
            alt={`${product.name} — Réf. ${product.ref}`}
            fill
            className="object-contain p-4 transition-transform duration-350 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      {/* Infos */}
      <div className="flex flex-col flex-1 gap-3 p-4 border border-border border-t-0">
        {/* Référence */}
        <p className="product-ref">{product.categoryLabel} — {product.ref}</p>

        {/* Nom */}
        <Link href={`/produit/${product.slug}`}>
          <h3 className="font-heading font-bold text-lg text-text-primary leading-tight group-hover:text-accent transition-colors duration-250">
            {product.name}
          </h3>
        </Link>

        {/* Features (2 premières) */}
        <ul className="flex flex-col gap-1">
          {product.features.slice(0, 2).map((f) => (
            <li key={f} className="text-xs text-text-muted flex items-start gap-1.5">
              <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Prix + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <span className="price-tag">
            {product.price.toLocaleString('fr-FR')} FCFA
          </span>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent text-xs px-4 py-2.5 flex items-center gap-1.5"
            aria-label={`Commander ${product.name} via WhatsApp`}
          >
            <MessageCircle size={13} />
            Commander
          </a>
        </div>
      </div>
    </article>
  )
}
