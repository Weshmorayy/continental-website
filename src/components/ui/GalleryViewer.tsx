'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/data/products'

interface GalleryViewerProps {
  images: string[]
  productName: string
}

export default function GalleryViewer({ images, productName }: GalleryViewerProps) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Image principale — scène blanche, cadre arrondi */}
      <div className="relative h-80 md:h-[460px] w-full plinth p-8 sm:p-12">
        <Image
          src={images[active]}
          alt={productName}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Vues du produit">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={active === i}
              aria-label={`Vue ${i + 1}`}
              className={`relative w-20 h-20 flex-shrink-0 rounded-2xl border transition-all duration-200 ${
                active === i
                  ? 'border-text-primary'
                  : 'border-border hover:border-text-muted'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} vue ${i + 1}`}
                fill
                className="object-contain p-2"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
