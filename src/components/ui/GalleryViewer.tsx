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
    <div className="flex flex-col gap-3">
      {/* Image principale */}
      <div className="relative h-72 md:h-[440px] bg-white">
        <Image
          src={images[active]}
          alt={productName}
          fill
          className="object-contain p-6 md:p-10"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Vignettes — seulement si plusieurs images */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 bg-white border-2 flex-shrink-0 transition-all duration-250 ${
                active === i ? 'border-accent' : 'border-border hover:border-text-muted'
              }`}
              aria-label={`Image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${productName} vue ${i + 1}`}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
