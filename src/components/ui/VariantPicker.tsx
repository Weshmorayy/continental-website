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
 * ── Ce qu'il affiche aussi ────────────────────────────────────────────────
 * Le tableau technique du modèle choisi. Les trois puissances partagent la
 * technologie et le montage, mais chacune a ses poids, ses dimensions et son
 * code-barres : ce sont ces lignes-là qui doivent changer avec la sélection,
 * sinon la fiche annoncerait 6,4 kg pour un appareil de 19,5 kg.
 *
 * La description et la garantie, communes, restent rendues par la page
 * (composant serveur).
 */

import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import AddToCart from '@/components/cart/AddToCart'
import TechSpecTable from '@/components/ui/TechSpecTable'
import type { ProductVariant } from '@/data/products'

interface Props {
  /** Slug du PRODUIT : la fiche reste une seule adresse, quel que soit le modèle. */
  slug: string
  name: string
  modelRef: string
  image: string
  /** Prix de l'entrée de base, utilisé si une variante n'en portait pas. */
  basePrice: number
  /**
   * Caractéristiques COMMUNES à tous les modèles (type, montage, technologie,
   * classe énergétique). Fusionnées avec celles du modèle choisi pour donner
   * UN seul tableau : deux tableaux côte à côte se répéteraient.
   */
  commonSpecs: Record<string, string>
  variants: ProductVariant[]
}

export default function VariantPicker({
  slug, name, modelRef, image, basePrice, commonSpecs, variants,
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
          price={price}
          image={image}
          /*
           * Le modèle porte sa propre référence quand il en a une. C'est le cas
           * d'une fiche déclinée par TAILLE : « CT-43SR » ne désigne qu'un 43
           * pouces, l'afficher sur un 32 pouces annoncerait au client une
           * référence qui n'est pas celle du carton qu'il reçoit. À défaut, on
           * retombe sur la référence de la fiche — le cas des climatiseurs, qui
           * partagent une référence de famille.
           */
          modelRef={selected.ref ?? modelRef}
          lineKey={`${slug}::${selected.id}`}
          full
        />
      </div>

      {/* Consigne de manutention du colis, quand ce modèle en porte une.
          Hors du tableau technique, à dessein : un avertissement de sécurité
          noyé entre « Fréquence » et « Code-barres » n'est pas lu. */}
      {selected.warning && (
        <p className="mt-6 flex items-start gap-3 border-l-2 border-text-primary pl-4 text-sm leading-relaxed text-text-body">
          <AlertTriangle
            size={18}
            strokeWidth={1.6}
            className="mt-0.5 flex-shrink-0 text-text-primary"
            aria-hidden="true"
          />
          <span>{selected.warning}</span>
        </p>
      )}

      <div className="mt-10">
        <TechSpecTable specs={{ ...commonSpecs, ...(selected.specs ?? {}) }} />
      </div>
    </div>
  )
}
