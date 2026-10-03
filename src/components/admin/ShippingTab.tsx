'use client'

/**
 * ShippingTab — Zones de livraison, frais et délais.
 *
 * Le prix sert aussi de seuil de gratuité au moment du calcul : une zone à
 * 0 FCFA signifie « livraison offerte dans ce secteur ».
 */

import React, { useState } from 'react'
import { Plus, Trash2, Pencil, Truck } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { ShippingZone } from '@/lib/admin-types'
import {
  Card, Button, Field, TextInput, EmptyState, ConfirmDialog,
  formatFcfa,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

const BLANK: Partial<ShippingZone> = { name: '', slug: '', price: 0, delay: '', position: 0 }

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function ShippingTab({ notify }: { notify: Notify }) {
  const { shippingZones, saveShippingZone, deleteShippingZone, refresh } = useStore()
  const [editing, setEditing] = useState<Partial<ShippingZone> | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ShippingZone | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const error = await saveShippingZone(editing)
    setSaving(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    setEditing(null)
    await refresh()
    notify({ message: 'Zone enregistrée.', tone: 'ok' })
  }

  const remove = async () => {
    if (!confirmDelete) return
    const error = await deleteShippingZone(confirmDelete.id)
    setConfirmDelete(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Zone supprimée.', tone: 'ok' })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => setEditing({ ...BLANK, position: shippingZones.length + 1 })}
        >
          <Plus className="h-4 w-4" /> Nouvelle zone
        </Button>
      </div>

      {editing && (
        <Card title={editing.id ? 'Modifier la zone' : 'Nouvelle zone'}>
          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom de la zone">
                <TextInput
                  value={editing.name ?? ''}
                  onChange={(e) => {
                    const name = e.target.value
                    setEditing({
                      ...editing,
                      name,
                      // L'identifiant n'est proposé que pour une création :
                      // le changer sur une zone existante casserait les liens.
                      slug: editing.id ? editing.slug : slugify(name),
                    })
                  }}
                />
              </Field>
              <Field label="Identifiant (slug)">
                <TextInput
                  value={editing.slug ?? ''}
                  disabled={Boolean(editing.id)}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
              </Field>
              <Field label="Frais (FCFA)" hint="0 pour une livraison offerte.">
                <TextInput
                  type="number"
                  min={0}
                  value={editing.price ?? 0}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </Field>
              <Field label="Délai annoncé" hint="Ce que le client lira. Ex. : 24–48h">
                <TextInput
                  value={editing.delay ?? ''}
                  onChange={(e) => setEditing({ ...editing, delay: e.target.value })}
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
              <Button variant="primary" onClick={save} disabled={saving || !editing.name}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {shippingZones.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Truck className="h-9 w-9" />}
            title="Aucune zone de livraison"
            hint="Ajoutez au moins une zone pour que le calcul de la livraison fonctionne."
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {shippingZones.map((z) => (
              <li key={z.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-heading text-base font-bold">{z.name}</p>
                  <p className="text-xs text-text-muted">
                    {Number(z.price) === 0 ? 'Livraison offerte' : formatFcfa(z.price)}
                    {z.delay && ` · ${z.delay}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setEditing({ ...z })}>
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(z)} aria-label="Supprimer">
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
          title="Supprimer cette zone ?"
          message={`« ${confirmDelete.name} » disparaîtra du calcul de livraison.`}
          confirmLabel="Supprimer"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  )
}