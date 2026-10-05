'use client'

/**
 * SlotPicker — choisir la ou les rubriques d'un produit.
 *
 * La grille affiche les cinq rubriques, leur capacité, et l'occupation
 * courante. Poser une rubrique unique en libère automatiquement une autre :
 * c'est la règle de `set_slot()`, et l'interface l'annonce avant le clic plutôt
 * que de laisser une erreur survenir.
 *
 * ── Pourquoi le compteur n'est pasessimiste ──────────────────────────────
 * Pour « héros » et « meilleur-vendu », la place vaut déjà à un autre produit :
 * cliquer ne crée pas un doublon, ça le remplace. L'écran le dit, et affiche
 * le nom du produit qui cède la place. C'est la différence entre un
 * administrateur qui comprend ce qu'il fait et un administrateur qui
 * dépanne.
 */

import React, { useMemo } from 'react'
import { Crown, Flame, Sparkles, PackageX, Megaphone, Check } from 'lucide-react'
import { Button } from '@/components/admin/ui'

const SLOTS = [
  { key: 'hero',         label: 'À la une',       capacity: 1, icon: Crown,     hint: 'Le produit affiché en très grand en tête de page.' },
  { key: 'bestseller',   label: 'Meilleur-vendu', capacity: 1, icon: Flame,     hint: 'La section « Notre plus vendu ».' },
  { key: 'promo',        label: 'Promotion',      capacity: 6, icon: Megaphone, hint: 'Pastille « Promotion » sur les cartes du catalogue.' },
  { key: 'nouveau',      label: 'Nouveau',        capacity: 6, icon: Sparkles,  hint: 'Pastille « Nouveau » sur les cartes du catalogue.' },
  { key: 'stock_limite', label: 'Stock limité',   capacity: 6, icon: PackageX,  hint: 'Pour les arrivages récents, en petit nombre.' },
] as const

type SlotKey = (typeof SLOTS)[number]['key']

interface Props {
  /** Slug du produit édité. Vide pour un produit pas encore enregistré. */
  slug: string
  /** Rubriques en cours : `{ slug, slot, label }`. */
  badges: { slug: string; slot: string; label: string }[]
  /** Nom des produits, pour nommer celui qui cède une place unique. */
  productName: (slug: string) => string
  /**
   * Bascule une rubrique. Le composant NE DÉCLENCHE PAS l'écriture lui-même :
   * il ne connaît pas les droits de l'appelant, et une écriture doit pouvoir
   * être refusée proprement, avec son message.
   *
   * `label` est passé pour que le parent puisse distinguer « poser » de
   * « retirer », et appliquer la bonne étiquette.
   */
  onToggle: (slot: SlotKey, label: string, held: boolean) => Promise<void>
  /** Rubrique en cours d'écriture, pour désactiver la grille. */
  busy: SlotKey | null
}

export default function SlotPicker({ slug, badges, productName, onToggle, busy }: Props) {
  const mine = useMemo(
    () => badges.filter((b) => b.slug === slug),
    [badges, slug],
  )

  /**
   * Un produit pas encore enregistré ne peut pas porter de rubrique : la
   * fonction travaille par slug, et un slug n'existe qu'après la première
   * sauvegarde. L'écran le dit au lieu d'afficher une grille qui échouerait.
   */
  if (!slug) {
    return (
      <div className="rounded-2xl bg-bg-secondary p-4">
        <p className="admin-label">Mises en avant</p>
        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          Enregistrez d&apos;abord le produit : les rubriques se posent sur un
          produit existant, identifié par son adresse. Vous pourrez ensuite
          choisir laquelle lui attribuer.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-bg-secondary p-4">
      <p className="admin-label">Mises en avant</p>
      <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
        Les rubriques occupent un nombre de places limité. Choisir une rubrique
        déjà prise la transfère au produit que vous éditez.
      </p>

      <ul className="mt-4 space-y-2">
        {SLOTS.map(({ key, label, capacity, icon: Icon, hint }) => {
          const held = mine.find((b) => b.slot === key)
          const isMine = Boolean(held)
          const others = badges.filter((b) => b.slot === key && b.slug !== slug)
          const remaining = capacity - others.length

          return (
            <li key={key}>
              <button
                type="button"
                disabled={busy !== null}
                aria-pressed={isMine}
                onClick={() => void onToggle(key, label, isMine)}
                className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors disabled:opacity-60 ${
                  isMine
                    ? 'border-text-primary bg-white'
                    : 'border-border bg-white hover:border-text-muted'
                }`}
              >
                <Icon
                  size={16}
                  className={`mt-0.5 flex-shrink-0 ${isMine ? 'text-text-primary' : 'text-text-muted'}`}
                  aria-hidden="true"
                />

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-medium text-text-primary">{label}</span>
                    {capacity === 1 ? (
                      <span className="text-[0.65rem] text-text-muted">
                        1 place
                      </span>
                    ) : (
                      <span className="text-[0.65rem] text-text-muted">
                        {remaining} place{remaining > 1 ? 's' : ''} libre{remaining > 1 ? 's' : ''}
                      </span>
                    )}
                  </span>

                  <span className="mt-0.5 block text-[0.68rem] leading-relaxed text-text-muted">
                    {isMine
                      ? `Occupée par ce produit — étiquette « ${held?.label ?? label} ».`
                      : hint}
                  </span>

                  {!isMine && others.length > 0 && (
                    <span className="mt-1 block text-[0.65rem] leading-relaxed text-text-muted">
                      {capacity === 1
                        ? `Actuellement : ${productName(others[0].slug)}.`
                        : `Actuellement : ${others.map((o) => productName(o.slug)).join(', ')}.`}
                    </span>
                  )}
                </span>

                <span className="flex-shrink-0 pt-0.5">
                  {isMine
                    ? <Check size={15} className="text-text-primary" aria-hidden="true" />
                    : <span className="block h-[15px] w-[15px] rounded border border-border" aria-hidden="true" />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {mine.length > 0 && (
        <p className="mt-3 text-[0.65rem] leading-relaxed text-text-muted">
          Pour retirer une rubrique, cliquez dessus : elle redevient disponible
          pour un autre produit.
        </p>
      )}
    </div>
  )
}