'use client'

/**
 * admin/ui.tsx — Briques d'interface du portail.
 *
 * Aucune couleur propre au back-office : surfaces, typographie et rayons
 * viennent des mêmes jetons que le site public (`globals.css`). Un portail qui
 * ne ressemble pas à la vitrine qu'il pilote devient un outil générique.
 *
 * RESPONSIVE — les tableaux se défont en cartes sous 768 px. Un tableau à
 * sept colonnes sur 375 px force un défilement horizontal et réduit chaque
 * cellule à un mot coupé ; en cartes, tout reste lisible et les actions
 * restent atteignables au pouce. Le mécanisme est dans `globals.css` :
 * chaque `<Td>` porte une étiquette `data-label` reprise en `::before`.
 */

import React, { useEffect } from 'react'
import { OBJECT_FIT_OPTIONS, OBJECT_POSITION_OPTIONS, objectPositionStyle } from '@/lib/images'

/* ─────────────────────────────────────────────────────────── conteneurs ── */

export function Card({
  children, className = '', title, action,
}: {
  children: React.ReactNode
  className?: string
  title?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <h3 className="display-sm text-sm uppercase tracking-wide sm:text-base">{title}</h3>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export function EmptyState({
  icon, title, hint, action,
}: {
  icon?: React.ReactNode
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon && <div className="text-text-muted/40">{icon}</div>}
      <p className="display-sm text-base text-text-primary">{title}</p>
      {hint && <p className="max-w-sm text-sm text-text-muted">{hint}</p>}
      {action}
    </div>
  )
}

/* ───────────────────────────────────────────────────────── formulaires ─── */

export function Field({
  label, children, hint, className = '',
}: {
  label: string
  children: React.ReactNode
  hint?: string
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="admin-label mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input {...rest} className={`admin-input ${className}`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', rows = 3, ...rest } = props
  return <textarea {...rest} rows={rows} className={`admin-input resize-y ${className}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props
  return <select {...rest} className={`admin-input ${className}`}>{children}</select>
}

export function Toggle({
  checked, onChange, label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-sm text-text-body"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-black' : 'bg-bg-tertiary'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
      <span>{label}</span>
    </button>
  )
}

/** Liste de lignes éditables (caractéristiques, galerie…). */
export function LineList({
  value, onChange, placeholder, addLabel = 'Ajouter une ligne',
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  addLabel?: string
}) {
  return (
    <div className="space-y-2">
      {value.map((line, i) => (
        <div key={i} className="flex gap-2">
          <TextInput
            value={line}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...value]
              next[i] = e.target.value
              onChange(next)
            }}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="admin-btn w-10 shrink-0 px-0 text-base"
            aria-label={`Supprimer la ligne ${i + 1}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="admin-btn w-full border-dashed"
      >
        {addLabel}
      </button>
    </div>
  )
}

/** Tableau technique clé → valeur. */
export function SpecEditor({
  value, onChange,
}: {
  value: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const entries = Object.entries(value)
  return (
    <div className="space-y-2">
      {entries.map(([key, val], i) => (
        <div key={i} className="flex gap-2">
          <TextInput
            value={key}
            placeholder="Caractéristique"
            aria-label="Nom de la caractéristique"
            onChange={(e) => {
              const next: Record<string, string> = {}
              entries.forEach(([k, v], j) => { next[j === i ? e.target.value : k] = v })
              onChange(next)
            }}
            className="w-2/5"
          />
          <TextInput
            value={val}
            placeholder="Valeur"
            aria-label={`Valeur de ${key}`}
            onChange={(e) => {
              const next: Record<string, string> = {}
              entries.forEach(([k, v], j) => { next[k] = j === i ? e.target.value : v })
              onChange(next)
            }}
          />
          <button
            type="button"
            onClick={() => {
              const next: Record<string, string> = {}
              entries.forEach(([k, v], j) => { if (j !== i) next[k] = v })
              onChange(next)
            }}
            className="admin-btn w-10 shrink-0 px-0 text-base"
            aria-label={`Supprimer ${key || 'la caractéristique'}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...value, '': '' })}
        className="admin-btn w-full border-dashed"
      >
        Ajouter une caractéristique
      </button>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────── boutons ─── */

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'quiet'

export function Button({
  variant = 'ghost', className = '', children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const variantClass = {
    primary: 'admin-btn-primary',
    ghost: '',
    quiet: 'border-transparent hover:border-border',
    danger: 'admin-btn-danger',
  }[variant]

  return (
    <button {...rest} className={`admin-btn ${variantClass} ${className}`}>
      {children}
    </button>
  )
}

/**
 * Classes de ton écrites EN LITTÉRAL, jamais par interpolation.
 *
 * ⚠ `pill-${tone}` produit exactement la même chaîne à l'exécution, mais
 *   Tailwind scanne le SOURCE, pas le résultat : il voit « pill- » et ne peut
 *   rien en déduire. Les six variantes partaient donc du CSS compilé — vérifié
 *   — et toutes les pastilles de statut s'affichaient sans fond ni couleur.
 *
 *   Les fonctions utilitaires ci-dessous sont écrites telles quelles, donc
 *   repérables par le scanner.
 */
const PILL_TONE: Record<
  'neutral' | 'dark' | 'warn' | 'ok' | 'danger',
  string
> = {
  neutral: 'bg-bg-tertiary text-text-body',
  dark: 'bg-black text-white',
  warn: 'bg-amber-100 text-amber-900',
  ok: 'bg-emerald-100 text-emerald-900',
  danger: 'bg-red-100 text-red-800',
}

export function Pill({
  children, tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'dark' | 'warn' | 'ok' | 'danger'
}) {
  return <span className={`pill ${PILL_TONE[tone]}`}>{children}</span>
}

/* ────────────────────────────────────────────────────── notifications ─── */

export function Toast({
  message, tone, onDone,
}: {
  message: string
  tone: 'ok' | 'error'
  onDone: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDone, tone === 'error' ? 7000 : 3500)
    return () => clearTimeout(t)
  }, [message, tone, onDone])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-sm rounded-2xl px-5 py-3
                  text-center text-sm font-semibold shadow-2xl sm:inset-x-auto sm:right-5 sm:text-left ${
                    tone === 'ok' ? 'bg-black text-white' : 'bg-red-600 text-white'
                  }`}
    >
      {message}
    </div>
  )
}

/* ────────────────────────────────────────────────────────── fenêtre modale ── */

/**
 * Modal — la fenêtre d'édition.
 *
 * ── Ce qui n'allait pas ───────────────────────────────────────────────────
 * Le formulaire produit s'ouvrait dans `fixed inset-0` avec `p-0` : sur un
 * téléphone, il occupait littéralement tout l'écran, bords compris. Rien ne
 * distinguait plus une fenêtre modale d'une page : l'utilisateur ne voyait ni
 * qu'il pouvait fermer, ni qu'il n'avait pas changé de page, et le fond assombri
 * qui signale « ceci est par-dessus » était entièrement recouvert.
 *
 * ── La forme retenue ──────────────────────────────────────────────────────
 * Sur téléphone, une FEUILLE qui monte du bas : coins supérieurs arrondis,
 * hauteur plafonnée à 85 % de l'écran, et le fond sombre reste visible
 * au-dessus. Le poignée grise en haut est le repère visuel de la feuille.
 *
 * Sur grand écran, une fenêtre centrée de largeur plafonnée — le formulaire ne
 * s'étire pas sur 1 400 px, où les champs se perdent.
 *
 * Le défilement vit sur le CORPS, jamais sur la fenêtre : l'en-tête (titre) et
 * le pied (Annuler / Enregistrer) restent donc visibles en permanence, y
 * compris au milieu d'un formulaire de quarante champs. C'est ce qui manquait
 * le plus : il fallait faire défiler tout le formulaire pour atteindre le
 * bouton « Enregistrer ».
 *
 * Échap ferme. Le défilement de la page derrière est bloqué, sinon un geste
 * dans la fenêtre fait défiler la liste en dessous.
 */
export function Modal({
  title, subtitle, onClose, children, footer, tabs, size = 'md', labelledBy,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  /** Barre d'onglets, rendue entre le titre et le corps. */
  tabs?: React.ReactNode
  size?: 'md' | 'lg' | 'xl'
  labelledBy?: string
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)

    // Le défilement du document est rendu à sa valeur d'origine à la fermeture,
    // et non remis à vide : deux fenêtres ouvertes l'une sur l'autre (une
    // confirmation par-dessus le formulaire) rendraient sinon la main à la page
    // alors qu'il en reste une d'ouverte.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  const width = {
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  }[size]

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/70 sm:items-center sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white
                    shadow-2xl sm:max-h-[88dvh] sm:rounded-3xl ${width}`}
      >
        {/* Poignée de feuille — visible seulement quand la fenêtre est collée
            au bas de l'écran. */}
        <div className="flex shrink-0 justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-bg-tertiary" />
        </div>

        <header className="flex shrink-0 items-start justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 id={labelledBy} className="display-sm truncate text-base">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="admin-btn w-9 shrink-0 px-0 text-base"
          >
            ×
          </button>
        </header>

        {tabs}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border bg-white px-4 py-3 sm:px-5">{footer}</div>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── onglets ── */

export type ModalTab = {
  id: string
  label: string
  icon?: React.ReactNode
  /** Précision courte : « 3 lignes », « 2 modèles »… */
  hint?: string
  /**
   * Marque l'onglet comme incomplet. Le vendeur voit ainsi, sans ouvrir chaque
   * onglet, où il reste quelque chose à faire — c'est le point qui manquait le
   * plus dans un formulaire de quarante champs : rien ne disait où regarder.
   */
  attention?: boolean
}

/**
 * Tabs — barre d'onglets défilante.
 *
 * Les libellés ne se compriment pas (`shrink-0`) : sur 360 px, cinq onglets
 * comprimés deviennent cinq mots illisibles. La barre défile horizontalement à
 * la place, ce qui est le geste naturel sur téléphone.
 */
export function Tabs({
  tabs, active, onChange,
}: {
  tabs: ModalTab[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div
      role="tablist"
      className="admin-tabs shrink-0 gap-1 overflow-x-auto border-b border-border px-2 sm:px-3"
    >
      {tabs.map((t) => {
        const on = t.id === active
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className={`relative flex shrink-0 items-center gap-2 rounded-t-lg px-3 py-2.5 text-xs font-semibold
                        transition-colors ${
                          on
                            ? 'text-text-primary'
                            : 'text-text-muted hover:text-text-body'
                        }`}
          >
            {t.icon}
            <span className="whitespace-nowrap">{t.label}</span>
            {t.hint && (
              <span className="whitespace-nowrap text-[0.65rem] font-normal text-text-muted">
                {t.hint}
              </span>
            )}
            {t.attention && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                title="Il reste quelque chose à remplir ici"
              />
            )}
            {on && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-black" />
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Disclosure — une section repliable.
 *
 * Sert aux blocs de champs qu'on ne veut pas imposer à l'ouverture : réglages
 * fins, JSON, options rares. Le contenu reste à un clic, mais il ne noie plus
 * ce que le vendeur vient faire.
 */
export function Disclosure({
  title, hint, children, defaultOpen = false,
}: {
  title: string
  hint?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen} className="rounded-2xl border border-border bg-bg-secondary">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-body">
          {title}
        </span>
        {hint && <span className="text-xs text-text-muted">{hint}</span>}
      </summary>
      <div className="border-t border-border px-4 py-4">{children}</div>
    </details>
  )
}

/**
 * ImageFitControl — comment l'image remplit son cadre, et où elle se place.
 *
 * ── Pourquoi deux réglages et pas un ──────────────────────────────────────
 * « Remplir le cadre » et « aligner en haut » répondent à deux questions
 * différentes : la première dit si l'image est rognée, la seconde dit quelle
 * partie est conservée quand elle l'est. Un seul menu déroulant obligerait à
 * mélanger les deux, et un visuel large rogné en haut n'aurait pas pu être
 * décrit.
 *
 * ── L'aperçu ──────────────────────────────────────────────────────────────
 * Les deux réglages n'ont d'effet visible que sur une image rognée : les
 * choisir à l'aveugle, dans un menu, revient à deviner. L'aperçu montre le
 * résultat dans un cadre de la forme réelle (bandeau large), avec les mêmes
 * règles que le site.
 */
export function ImageFitControl({
  image, fit, position, onChangeFit, onChangePosition, hint,
}: {
  image: string | null | undefined
  fit: string | null | undefined
  position: string | null | undefined
  onChangeFit: (next: string) => void
  onChangePosition: (next: string) => void
  hint?: string
}) {
  // Import local pour ne pas alourdir l'entête du module : seules les valeurs
  // vivent dans `lib/images`, qui est partagé avec le site public.
  const fits = OBJECT_FIT_OPTIONS
  const positions = OBJECT_POSITION_OPTIONS

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Remplissage" hint={hint}>
          <Select value={fit ?? ''} onChange={(e) => onChangeFit(e.target.value)}>
            {fits.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </Select>
        </Field>
        <Field label="Position" hint="Où l'image se place quand elle est rognée.">
          <Select
            value={position ?? ''}
            onChange={(e) => onChangePosition(e.target.value)}
            disabled={fit === 'fill' || fit === 'none'}
          >
            {positions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </Field>
      </div>

      {image ? (
        <div className="stage relative h-36 w-full overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
            style={objectPositionStyle(fit, position) ?? { objectFit: 'cover' }}
          />
        </div>
      ) : (
        <p className="rounded-xl bg-bg-secondary px-3 py-3 text-xs text-text-muted">
          Choisissez d’abord une image : le cadrage se règle sur un visuel réel.
        </p>
      )}

      <p className="text-xs text-text-muted">
        L’aperçu utilise un cadre large, comme les bandeaux du site. Une image du
        même format que son cadre n’a rien à rogner : les deux réglages restent
        alors sans effet visible.
      </p>
    </div>
  )
}

export function ConfirmDialog({
  title, message, confirmLabel = 'Confirmer', danger, onConfirm, onCancel,
}: {
  title: string
  message: React.ReactNode
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div role="alertdialog" aria-modal="true" className="panel w-full max-w-sm p-6 shadow-2xl">
        <h3 className="display-md text-lg">{title}</h3>
        <p className="mt-2 text-sm text-text-body">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button onClick={onCancel}>Annuler</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────── cellule de tableau ───── */

/**
 * `label` devient l'étiquette affichée sous 768 px.
 * `primary` transforme la cellule en titre de carte (sans étiquette répétée).
 */
export function Td({
  children, className = '', label = '', primary,
}: {
  children?: React.ReactNode
  className?: string
  label?: string
  primary?: boolean
}) {
  return (
    <td
      data-label={primary ? '' : label}
      data-cell={primary ? 'primary' : undefined}
      className={className}
    >
      {children}
    </td>
  )
}

export function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={className}>{children}</th>
}

export const formatFcfa = (n: number | string) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
    .format(Number(n))
    .replace(/ /g, ' ')} FCFA`

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })