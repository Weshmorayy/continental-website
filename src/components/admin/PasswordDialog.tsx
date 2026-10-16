'use client'

/**
 * admin/PasswordDialog.tsx — Confirmation protégée par mot de passe.
 *
 * Même habillage que `ConfirmDialog` (même fond assombri, même panneau, mêmes
 * boutons) : la seule différence est le champ mot de passe, exigé pour les
 * gestes qu'on ne veut pas déclencher d'un clic distrait.
 *
 * Le mot de passe vit UNIQUEMENT dans l'état local de cette fenêtre. Il n'est
 * ni journalisé, ni renvoyé au parent, ni conservé : la fenêtre se ferme, la
 * valeur disparaît avec elle. Le parent ne reçoit que la tentative.
 */

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '@/hooks/useScrollLock'
import { Button } from '@/components/admin/ui'

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || typeof document === 'undefined') return null
  return createPortal(children, document.body)
}

export default function PasswordDialog({
  title, message, confirmLabel = 'Confirmer', danger, busy, error, onCancel, onConfirm,
}: {
  title: string
  message: React.ReactNode
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  error?: string | null
  onCancel: () => void
  onConfirm: (password: string) => void
}) {
  const [password, setPassword] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Une vérification en cours ne s'interrompt pas : le parent doit pouvoir
      // terminer sa tentative et décider de la suite.
      if (e.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel, busy])

  useScrollLock(true)

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-center justify-center overscroll-contain bg-black/70 p-4">
        <div role="alertdialog" aria-modal="true" className="panel w-full max-w-sm p-6 shadow-2xl">
          <h3 className="display-md text-lg">{title}</h3>
          <p className="mt-2 text-sm text-text-body">{message}</p>

          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (busy || password.length === 0) return
              onConfirm(password)
            }}
          >
            <label htmlFor="password-confirm" className="admin-label mb-1.5 block">
              Mot de passe
            </label>
            <input
              id="password-confirm"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
              disabled={busy}
              className="admin-input"
            />

            {error && <p className="mt-2 text-sm text-red-800" role="alert">{error}</p>}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button type="button" onClick={onCancel} disabled={busy}>Annuler</Button>
              <Button
                type="submit"
                variant={danger ? 'danger' : 'primary'}
                disabled={busy || password.length === 0}
              >
                {confirmLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  )
}
