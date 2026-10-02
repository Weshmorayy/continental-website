import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import type { Product } from '@/data/products'
import { buildWhatsAppUrl, buildOrderMessage } from '@/lib/whatsapp'

interface ProductCardProps {
  product: Product
  size?: 'default' | 'large'
}

/**
 * Tuile produit — surface grise SANS bordure, image en grand,
 * titre gras dessous. Aligné sur les cartes samsung.com.
 *
 * Les visuels produits ont été détourés sur fond transparent :
 * sur une surface grise, une photo à fond blanc laisserait
 * apparaître un rectangle blanc.
 */
export default function ProductCard({ product, size = 'default' }: ProductCardProps) {
  const waUrl = buildWhatsAppUrl(
    buildOrderMessage({ productName: product.name, ref: product.ref })
  )

  return (
    <article className="card-product flex flex-col group">

      {/* Image — le produit est le héros */}
      <div className="relative">
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-text-primary text-white px-3 py-1 text-[11px] font-semibold">
            {product.badge}
          </span>
        )}

        <Link
          href={`/produit/${product.slug}`}
          className={`block relative w-full ${size === 'large' ? 'h-72 sm:h-80' : 'h-64 sm:h-72'} p-8`}
          aria-label={product.name}
        >
          <Image
            src={product.image}
            alt={`${product.name} (${product.ref})`}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
          />
        </Link>
      </div>

      {/* Texte sous la tuile */}
      <div className="flex flex-col flex-1 px-6 pb-6">
        <p className="product-ref text-text-muted">{product.categoryLabel}</p>

        <Link href={`/produit/${product.slug}`} className="block mt-1.5">
          <h3 className="display-sm text-lg text-text-primary group-hover:underline">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-xs text-text-muted line-clamp-2">
          {product.features[0]}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-text-muted">Prix indicatif</span>
            <span className="price-tag">
              {product.price.toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-medium text-text-muted">FCFA</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa flex-1 px-4 py-2.5 text-xs"
              aria-label={`Commander ${product.name} sur WhatsApp`}
            >
              <MessageCircle size={15} />
              Commander
            </a>
            <Link
              href={`/produit/${product.slug}`}
              className="btn-outline px-5 py-2.5 text-xs flex-shrink-0"
            >
              Détails
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
