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

  // Un produit dénué de photo reste consultable. `next/image` lève sur une
  // chaîne vide et emporterait avec elle toute la page produit.
  const current = images[active]
  const clean = images.filter(Boolean)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-square stage p-10 sm:p-14">
        {current ? (
          <Image
            src={current}
            alt={productName}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm text-text-muted">
            Photo à venir
          </span>
        )}
      </div>

      {clean.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Vues du produit">
          {clean.map((img, i) => (
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
