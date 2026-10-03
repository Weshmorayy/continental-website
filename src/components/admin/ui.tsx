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

export function Pill({
  children, tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'dark' | 'warn' | 'ok' | 'danger'
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>
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