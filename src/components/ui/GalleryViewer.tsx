'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryViewerProps {
  images: string[]
  productName: string
}

/** Galerie — surface grise sans bordure, produit transparent au centre. */
export default function GalleryViewer({ images, productName }: GalleryViewerProps) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-square stage p-10 sm:p-14">
        <Image
          src={images[active]}
          alt={productName}
          fill
          className="object-contain"
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
              className={`relative w-20 h-20 flex-shrink-0 rounded-2xl transition-all duration-200 ${
                active === i ? 'bg-bg-tertiary' : 'bg-bg-secondary hover:bg-bg-tertiary'
              }`}
            >
              <Image src={img} alt={`${productName} vue ${i + 1}`} fill className="object-contain p-2" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
