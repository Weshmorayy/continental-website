'use client'

/**
 * BackupsTab — Instantanés de configuration.
 *
 * Un instantané est une COPIE du contenu éditorial au moment où on le prend :
 * produits, bannières, zones, FAQ et coordonnées. Il permet de revenir en
 * arrière après une modification douteuse.
 *
 * ⚠ Ce n'est PAS une sauvegarde de la base. Rien n'y touche aux comptes, aux
 *   commandes ni aux demandes. Les fichiers eux-mêmes sont dans Supabase
 *   Storage et ne sont pas concernés non plus.
 */

import React, { useState } from 'react'
import { Database, Plus, Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import {
  Card, Button, Field, TextInput, EmptyState, ConfirmDialog, Pill, formatDate,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

export default function BackupsTab({ notify }: { notify: Notify }) {
  const { backups, createBackup, restoreBackup, deleteBackup, refresh } = useStore()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const take = async () => {
    setBusy(true)
    const error = await createBackup(name.trim() || 'Configuration globale')
    setBusy(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    setName('')
    notify({ message: 'Instantané créé.', tone: 'ok' })
  }

  const restore = async (id: string) => {
    setConfirmRestore(null)
    setBusy(true)
    const error = await restoreBackup(id)
    setBusy(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({
      message: 'Restauration terminée. Les éléments déjà présents ont été conservés.',
      tone: 'ok',
    })
  }

  const remove = async () => {
    if (!confirmDelete) return
    const error = await deleteBackup(confirmDelete)
    setConfirmDelete(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Instantané supprimé.', tone: 'ok' })
  }

  const count = (rows: unknown) => (Array.isArray(rows) ? rows.length : 0)

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <Field label="Nom de l'instantané" className="flex-1">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Avant refonte du catalogue"
            />
          </Field>
          <Button variant="primary" onClick={take} disabled={busy}>
            <Plus className="h-4 w-4" /> {busy ? 'Création…' : 'Prendre un instantané'}
          </Button>
        </div>
        <p className="border-t border-border bg-bg-secondary px-4 py-3 text-xs text-text-muted">
          L&apos;instantané copie le contenu éditorial en cours. Une restauration
          réajoute uniquement ce qui a disparu : elle n&apos;écrase pas vos
          modifications plus récentes.
        </p>
      </Card>

      {backups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Database className="h-9 w-9" />}
            title="Aucun instantané"
            hint="Prenez un instantané avant une modification importante du catalogue."
            action={
              <Button variant="primary" onClick={take} disabled={busy}>
                <Plus className="h-4 w-4" /> Prendre un instantané
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {backups.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-heading font-bold">{b.backup_name}</p>
                  <p className="text-xs text-text-muted">{formatDate(b.created_at)}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Pill>{count(b.products_data)} produits</Pill>
                    <Pill>{count(b.banners_data)} bannières</Pill>
                    <Pill>{count(b.shipping_data)} zones</Pill>
                    <Pill>{count(b.faqs_data)} questions</Pill>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setConfirmRestore(b.id)} disabled={busy}>
                    <RotateCcw className="h-3.5 w-3.5" /> Restaurer
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(b.id)} aria-label="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {confirmRestore && (
        <ConfirmDialog
          title="Restaurer cet instantané ?"
          message="Les éléments disparus depuis la prise de cet instantané seront réajoutés. Vos modifications plus récentes sont conservées."
          confirmLabel="Restaurer"
          onCancel={() => setConfirmRestore(null)}
          onConfirm={() => restore(confirmRestore)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cet instantané ?"
          message="Vous ne pourrez plus revenir à cet état du catalogue."
          confirmLabel="Supprimer"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  )
}