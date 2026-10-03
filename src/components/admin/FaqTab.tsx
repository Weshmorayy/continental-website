'use client'

/**
 * FaqTab — Questions fréquentes.
 *
 * L'ordre d'affichage est explicite (`position`) et non alphabétique : l'ordre
 * des questions est un choix éditorial.
 */

import React, { useState } from 'react'
import { Plus, Trash2, Pencil, HelpCircle } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Faq } from '@/lib/admin-types'
import {
  Card, Button, Field, TextInput, TextArea, EmptyState, ConfirmDialog,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

const BLANK: Partial<Faq> = { question: '', answer: '', category: '' }

export default function FaqTab({ notify }: { notify: Notify }) {
  const { faqs, saveFaq, deleteFaq, refresh } = useStore()
  const [editing, setEditing] = useState<Partial<Faq> | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Faq | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const error = await saveFaq(editing)
    setSaving(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    setEditing(null)
    await refresh()
    notify({ message: 'Question enregistrée.', tone: 'ok' })
  }

  const remove = async () => {
    if (!confirmDelete) return
    const error = await deleteFaq(confirmDelete.id)
    setConfirmDelete(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Question supprimée.', tone: 'ok' })
  }

  /** Déplace une question d'un rang : échange les deux positions voisines. */
  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= faqs.length) return
    const a = faqs[index]
    const b = faqs[target]
    await saveFaq({ id: a.id, position: b.position })
    await saveFaq({ id: b.id, position: a.position })
    await refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => setEditing({ ...BLANK, position: faqs.length + 1 })}
        >
          <Plus className="h-4 w-4" /> Nouvelle question
        </Button>
      </div>

      {editing && (
        <Card title={editing.id ? 'Modifier la question' : 'Nouvelle question'}>
          <div className="space-y-4 p-5">
            <Field label="Question">
              <TextInput
                value={editing.question ?? ''}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
              />
            </Field>
            <Field label="Réponse" hint="Une réponse claire et courte : le visitor la lit sur mobile.">
              <TextArea
                rows={4}
                value={editing.answer ?? ''}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rubrique" hint="Regroupe les questions. Ex. : livraison, garantie.">
                <TextInput
                  value={editing.category ?? ''}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </Field>
              <Field label="Rang d'affichage">
                <TextInput
                  type="number"
                  value={editing.position ?? 0}
                  onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })}
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button onClick={() => setEditing(null)}>Annuler</Button>
              <Button variant="primary" onClick={save} disabled={saving || !editing.question}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {faqs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<HelpCircle className="h-9 w-9" />}
            title="Aucune question"
            hint="Les questions fréquentes rassurent avant la commande."
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {faqs.map((f, i) => (
              <li key={f.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold">{f.question}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-text-muted">{f.answer}</p>
                  {f.category && (
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      {f.category}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">↑</Button>
                  <Button onClick={() => move(i, 1)} disabled={i === faqs.length - 1} aria-label="Descendre">↓</Button>
                  <Button onClick={() => setEditing({ ...f })} aria-label="Modifier">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(f)} aria-label="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cette question ?"
          message={`« ${confirmDelete.question} » sera retirée du site.`}
          confirmLabel="Supprimer"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  )
}