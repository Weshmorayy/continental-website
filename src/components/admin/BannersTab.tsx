'use client'

/**
 * BannersTab — Bannières de la page d'accueil et des bandeaux.
 *
 * Le champ `slot` décide de l'emplacement : c'est lui que lit la page
 * d'accueil, pas un `if` par bannière. Ajouter un emplacement est donc une
 * donnée, pas une modification de code.
 */

import React, { useState } from 'react'
import { Plus, Trash2, Pencil, ImageIcon } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Banner } from '@/lib/admin-types'
import {
  Card, Button, Field, TextInput, TextArea, Select, Toggle, Pill,
  EmptyState, ConfirmDialog,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

/** Emplacements connus de la page d'accueil. */
const SLOTS = [
  { value: 'home-hero', label: 'Bannière principale (héros)' },
  { value: 'home-strip', label: 'Bandeau sous le héros' },
  { value: 'catalogue-top', label: 'En-tête du catalogue' },
]

const BLANK: Partial<Banner> = {
  slot: 'home-hero', title: '', tag: '', subtitle: '', image: '',
  cta_label: 'Découvrir', cta_href: '/catalogue',
  object_position: 'center', active: true,
}

export default function BannersTab({ notify }: { notify: Notify }) {
  const { banners, saveBanner, deleteBanner, refresh } = useStore()
  const [editing, setEditing] = useState<Partial<Banner> | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Banner | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const error = await saveBanner(editing)
    setSaving(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    setEditing(null)
    await refresh()
    notify({ message: 'Bannière enregistrée.', tone: 'ok' })
  }

  const remove = async () => {
    if (!confirmDelete) return
    const error = await deleteBanner(confirmDelete.id)
    setConfirmDelete(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Bannière supprimée.', tone: 'ok' })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setEditing({ ...BLANK })}>
          <Plus className="h-4 w-4" /> Nouvelle bannière
        </Button>
      </div>

      {editing && (
        <Card title={editing.id ? 'Modifier la bannière' : 'Nouvelle bannière'}>
          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Emplacement">
                <Select
                  value={editing.slot ?? 'home-hero'}
                  onChange={(e) => setEditing({ ...editing, slot: e.target.value })}
                >
                  {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </Field>
              <Field label="Sur-titre" hint="Petit texte au-dessus du titre.">
                <TextInput
                  value={editing.tag ?? ''}
                  onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Titre">
              <TextInput
                value={editing.title ?? ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>

            <Field label="Sous-titre">
              <TextArea
                rows={2}
                value={editing.subtitle ?? ''}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Image" hint="Chemin ou URL. Ex. : /aesthetic/aesthetic-fan-livingroom.jpg">
                <TextInput
                  value={editing.image ?? ''}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                />
              </Field>
              <Field label="Texte alternatif" hint="Décrit l'image pour les lecteurs d'écran.">
                <TextInput
                  value={editing.image_alt ?? ''}
                  onChange={(e) => setEditing({ ...editing, image_alt: e.target.value })}
                />
              </Field>
              <Field label="Libellé du bouton">
                <TextInput
                  value={editing.cta_label ?? ''}
                  onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })}
                />
              </Field>
              <Field label="Adresse du bouton">
                <TextInput
                  value={editing.cta_href ?? ''}
                  onChange={(e) => setEditing({ ...editing, cta_href: e.target.value })}
                />
              </Field>
              <Field label="Recadrage" hint="Où se place l'image dans son cadre.">
                <Select
                  value={editing.object_position ?? 'center'}
                  onChange={(e) => setEditing({ ...editing, object_position: e.target.value })}
                >
                  {['center', 'center top', 'center bottom', 'left center', 'right center'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Rang d'affichage">
                <TextInput
                  type="number"
                  value={editing.position ?? 0}
                  onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })}
                />
              </Field>
            </div>

            {editing.image && (
              <div className="overflow-hidden rounded-2xl border border-border bg-white">
                <img src={editing.image} alt="" className="h-48 w-full object-cover" style={{ objectPosition: editing.object_position }} />
              </div>
            )}

            <Toggle
              checked={editing.active ?? true}
              onChange={(active) => setEditing({ ...editing, active })}
              label="Afficher cette bannière sur le site"
            />

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button onClick={() => setEditing(null)}>Annuler</Button>
              <Button variant="primary" onClick={save} disabled={saving || !editing.title}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {banners.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ImageIcon className="h-9 w-9" />}
            title="Aucune bannière"
            hint="Ajoutez une bannière principale pour l'accueil du site."
            action={
              <Button variant="primary" onClick={() => setEditing({ ...BLANK })}>
                <Plus className="h-4 w-4" /> Nouvelle bannière
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((b) => (
            <Card key={b.id}>
              <div className="border-b border-border bg-white">
                {b.image ? (
                  <img
                    src={b.image}
                    alt={b.image_alt ?? ''}
                    className="h-40 w-full object-cover"
                    style={{ objectPosition: b.object_position }}
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-text-muted/40">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone={b.active ? 'dark' : 'neutral'}>
                    {b.active ? 'Active' : 'Masquée'}
                  </Pill>
                  <Pill>{SLOTS.find((s) => s.value === b.slot)?.label ?? b.slot}</Pill>
                </div>
                {b.tag && <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{b.tag}</p>}
                <h4 className="font-heading text-lg font-bold leading-tight">{b.title}</h4>
                {b.subtitle && <p className="line-clamp-2 text-sm text-text-muted">{b.subtitle}</p>}
                <div className="flex gap-2 border-t border-border pt-3">
                  <Button onClick={() => setEditing({ ...b })} className="flex-1">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(b)} aria-label="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cette bannière ?"
          message={`« ${confirmDelete.title} » sera retirée du site.`}
          confirmLabel="Supprimer"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  )
}