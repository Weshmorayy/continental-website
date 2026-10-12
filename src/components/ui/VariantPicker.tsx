'use client'

/**
 * VariantPicker — le choix du modèle, sur une fiche déclinée.
 *
 * ── Pourquoi un composant client ──────────────────────────────────────────
 * Le prix affiché ET la ligne ajoutée au panier changent avec le modèle
 * choisi. Ces deux informations doivent suivre la même sélection : si les
 * boutons vivaient sur le serveur et le panier dans le navigateur, le visiteur
 * pourrait lire le prix du 1 cv et commander un 2 cv. Le composant porte donc
 * les trois ensemble — boutons, prix, bouton d'ajout — précisément pour qu'ils
 * ne puissent pas se désynchroniser.
 *
 * ── Ce qu'il n'affiche pas ────────────────────────────────────────────────
 * Les caractéristiques, la description et la garantie, communes aux trois
 * modèles, restent rendues par la page (composant serveur) : les déplacer ici
 * ferait grossir le JavaScript envoyé au navigateur sans rien changer au prix.
 */

import React, { useState } from 'react'
import AddToCart from '@/components/cart/AddToCart'
import type { ProductVariant } from '@/data/products'

interface Props {
  /** Slug du PRODUIT : la fiche reste une seule adresse, quel que soit le modèle. */
  slug: string
  name: string
  modelRef: string
  image: string
  /** Prix de l'entrée de base, utilisé si une variante n'en portait pas. */
  basePrice: number
  variants: ProductVariant[]
}

export default function VariantPicker({
  slug, name, modelRef, image, basePrice, variants,
}: Props) {
  // Le premier modèle est celui de l'entrée de base : c'est le prix déjà
  // affiché dans le catalogue, donc ce que le visiteur s'attend à retrouver.
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? '')
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]
  const price = selected?.price || basePrice

  if (!selected) return null

  return (
    <div className="mt-8 py-7 hairline border-t border-border">
      <fieldset>
        <legend className="product-ref text-text-muted">
          Modèle — <span className="text-text-primary">{selected.label}</span>
        </legend>

        <div className="mt-3 flex flex-wrap gap-2">
          {variants.map((v) => {
            const on = v.id === selected.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(v.id)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  on
                    ? 'border-accent bg-accent text-white'
                    : 'border-border text-text-body hover:border-text-primary'
                }`}
              >
                {v.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <p className="display-md text-text-primary text-3xl sm:text-4xl mt-6">
        {price.toLocaleString('fr-FR')}{' '}
        <span className="text-lg font-medium text-text-muted">FCFA</span>
      </p>
      <p className="text-xs text-text-muted mt-2">Confirmé à la commande</p>

      {/* Le nom porte le modèle : c'est ce que le vendeur lit dans la commande,
          et c'est la seule trace du modèle choisi une fois la fiche quittée. */}
      <div className="mt-6">
        <AddToCart
          slug={slug}
          name={`${name} — ${selected.label}`}
          modelRef={modelRef}
          price={price}
          image={image}
          lineKey={`${slug}::${selected.id}`}
          full
        />
      </div>
    </div>
  )
}
