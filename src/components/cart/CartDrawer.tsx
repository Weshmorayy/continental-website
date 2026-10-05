'use client'

/**
 * CartDrawer — Le panier, en tiroir.
 *
 * Monté une seule fois, dans le layout racine : il suit donc le visiteur sur
 * toutes les pages, et l'ajout se constate sans avoir à revenir au catalogue.
 *
 * Le tiroir se complète par une page complète (`/panier`) qui porte le
 * formulaire de commande. Le tiroir ne sert qu'à vérifier et ajuster les
 * lignes : sur un téléphone, un formulaire à six champs dans une lame de 380 px
 * serait inutilisable.
 *
 * Le corps de la page est verrouillé pendant l'ouverture, sinon l'arrière-plan
 * défile sous le tiroir et le défilement se fait sur la mauvaise colonne.
 */

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const fcfa = (n: number) =>
  `${new Intl.NumberFormat('fr-FR').format(n).replace(/ /g, ' ')} FCFA`

export default function CartDrawer() {
  const { lines, count, subtotal, open, setOpen, setQuantity, remove } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)

  /* Le tiroir est un `dialog`modal : il doit rendre le focus, répondre à
     Échap, et être refermé au clic extérieur. Sans cela, la touche Tab
     continue de parcourir les liens DU SITE DERRIÈRE le tiroir — un lecteur
     d'écran n' announcing plus du tout où l'on se trouve. */
  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, setOpen])

  return (
    <>
      {/* Voile — masqué tant que le tiroir est fermé, pour ne pas laisser un
          élément cliquable transparent devant la page. */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/*
        L'enveloppe CLIPPE le tiroir.

        Le panneau est monté en permanence et se tient hors écran quand il est
        fermé (`translate-x-full`). Sans cette enveloppe, le navigateur compte
        cette largeur dans la zone défilable du document : la page entière
        gagne un défilement horizontal, et le tiroir comme la page partent vers
        la droite alors que rien n'a été ouvert. Un `fixed` translate hors
        écran ne sort pas du calcul de débordement sur Chrome Android.

        `overflow-hidden` sur une enveloppe `fixed inset-0` coupe le panneau à
        la fenêtre : la glissade reste animée, mais rien ne déborde du
        document. `pointer-events-none` laisse passer les clics tant que le
        tiroir est fermé, et le panneau les reprend pour lui.
      */}
      <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Votre panier"
          aria-hidden={!open}
          className={`pointer-events-auto absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
        <div className="hairline flex items-center justify-between px-5 py-4">
          <h2 className="display-sm text-base">
            Votre panier
            {count > 0 && (
              <span className="ml-2 text-sm font-normal text-text-muted">
                {count} article{count > 1 ? 's' : ''}
              </span>
            )}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-text-primary transition-opacity hover:opacity-60"
            aria-label="Fermer le panier"
          >
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag size={40} strokeWidth={1} className="text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-muted">
              Votre panier est vide.
            </p>
            <Link
              href="/catalogue"
              onClick={() => setOpen(false)}
              className="btn-outline px-6 py-2.5 text-xs"
            >
              Voir le catalogue
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.slug} className="flex gap-4 py-4">
                  <Link
                    href={`/produit/${l.slug}`}
                    onClick={() => setOpen(false)}
                    className="stage relative h-20 w-20 flex-shrink-0 overflow-hidden"
                  >
                    {l.image ? (
                      <Image src={l.image} alt={l.name} fill
                        className="object-contain p-2" sizes="80px" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[0.6rem] text-text-muted">
                        Photo à venir
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produit/${l.slug}`}
                      onClick={() => setOpen(false)}
                      className="block text-sm font-medium text-text-primary hover:underline"
                    >
                      {l.name}
                    </Link>
                    {l.ref && (
                      <p className="product-ref mt-0.5 text-text-muted">Réf. {l.ref}</p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          onClick={() => setQuantity(l.slug, l.quantity - 1)}
                          className="p-1.5 text-text-primary transition-opacity hover:opacity-60"
                          aria-label={`Retirer un ${l.name}`}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
                          {l.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(l.slug, l.quantity + 1)}
                          disabled={l.quantity >= 99}
                          className="p-1.5 text-text-primary transition-opacity hover:opacity-60 disabled:opacity-30"
                          aria-label={`Ajouter un ${l.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <p className="text-sm font-semibold">
                        {fcfa(l.price * l.quantity)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => remove(l.slug)}
                    className="h-fit p-1.5 text-text-muted transition-colors hover:text-text-primary"
                    aria-label={`Retirer ${l.name} du panier`}
                  >
                    <Trash2 size={15} strokeWidth={1.6} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="hairline px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-text-muted">Sous-total</span>
                <span className="display-sm text-xl">{fcfa(subtotal)}</span>
              </div>
              <p className="mt-1.5 text-xs text-text-muted">
                La livraison est calculée à l&apos;étape suivante, selon la zone.
              </p>

              <Link
                href="/panier"
                onClick={() => setOpen(false)}
                className="btn-accent mt-4 w-full justify-center py-3 text-sm"
              >
                Passer commande
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="link-underline mt-3 w-full text-center text-xs text-text-muted"
              >
                Poursuivre mes achats
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </>
  )
}