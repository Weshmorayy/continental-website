'use client'

/**
 * ProductsTab — Catalogue : liste, filtres, édition, suppression.
 *
 * Le point délicat est la suppression : RLS peut retirer la ligne du jeu de
 * résultats SANS LEVER D'ERREUR. On relit donc après coup (`refresh`) plutôt
 * que de faire confiance à `error === null`.
 */

import React, { useState, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, Package, LayoutGrid, List, Eye, EyeOff,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Product } from '@/lib/admin-types'
import {
  Card, Button, Field, TextInput, TextArea, Select, Toggle, Pill,
  LineList, SpecEditor, EmptyState, ConfirmDialog, Th, Td, formatFcfa,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

const BLANK: Partial<Product> = {
  name: '', slug: '', ref_: '', price: 0, compare_at: null,
  short_desc: '', description: '', features: [], specs: {},
  images: [], in_stock: true, is_active: true, is_featured: false, badge: '',
}

export default function ProductsTab({ notify }: { notify: Notify }) {
  const { products, categories, saveProduct, deleteProduct, toggleProduct, refresh } = useStore()

  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [showHidden, setShowHidden] = useState(false)
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (!showHidden && !p.is_active) return false
      if (cat !== 'all' && p.category_id !== cat) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.ref_ ?? '').toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      )
    })
  }, [products, search, cat, showHidden])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const error = await saveProduct(editing)
    setSaving(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    notify({ message: editing.id ? 'Produit enregistré.' : 'Produit créé.' , tone: 'ok' })
    setEditing(null)
    await refresh()
  }

  const remove = async () => {
    if (!confirmDelete) return
    const target = confirmDelete
    setConfirmDelete(null)
    const error = await deleteProduct(target.id)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Produit supprimé.', tone: 'ok' })
  }

  const toggle = async (p: Product, patch: Partial<Product>) => {
    const error = await toggleProduct(p.id, patch)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
  }

  return (
    <div className="space-y-4">
      {/* ── barre d'outils ── */}
      <Card>
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un nom, une référence…"
              className="pl-9"
            />
          </div>

          <Select value={cat} onChange={(e) => setCat(e.target.value)} className="lg:w-56">
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>

          <div className="flex items-center gap-2">
            <Toggle checked={showHidden} onChange={setShowHidden} label="Masqués" />

            <div className="flex items-center gap-1 rounded-full border border-border p-1">
              <button
                onClick={() => setView('cards')}
                aria-label="Vue grille"
                className={`rounded-full p-1.5 ${view === 'cards' ? 'bg-black text-white' : 'text-text-muted'}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView('list')}
                aria-label="Vue liste"
                className={`rounded-full p-1.5 ${view === 'list' ? 'bg-black text-white' : 'text-text-muted'}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button variant="primary" onClick={() => setEditing({ ...BLANK })}>
              <Plus className="h-4 w-4" /> Nouveau
            </Button>
          </div>
        </div>
      </Card>

      {/* ── édition ── */}
      {editing && (
        <Card title={editing.id ? `Modifier — ${editing.name}` : 'Nouveau produit'}>
          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom">
                <TextInput
                  value={editing.name ?? ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </Field>
              <Field label="Référence" hint="Référence fabricant affichée sur la fiche.">
                <TextInput
                  value={editing.ref_ ?? ''}
                  onChange={(e) => setEditing({ ...editing, ref_: e.target.value })}
                />
              </Field>
              <Field label="Prix (FCFA)">
                <TextInput
                  type="number"
                  min={0}
                  value={editing.price ?? 0}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </Field>
              <Field label="Prix barré (FCFA)" hint="Laisser vide pour ne pas afficher de remise.">
                <TextInput
                  type="number"
                  min={0}
                  value={editing.compare_at ?? ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      compare_at: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Catégorie">
                <Select
                  value={editing.category_id ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, category_id: e.target.value || null })
                  }
                >
                  <option value="">— Aucune —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </Select>
              </Field>
              <Field label="Badge" hint="Texte court : « Best-Seller », « Inverter Eco »…">
                <TextInput
                  value={editing.badge ?? ''}
                  onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                />
              </Field>
              <Field label="Identifiant d'URL (slug)" className="sm:col-span-2"
                hint="Utilisé dans l'adresse de la fiche. Lettres minuscules, tirets.">
                <TextInput
                  value={editing.slug ?? ''}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Image principale" hint="Chemin ou URL. Ex. : /products/ventilateur-pied-fs4011.jpg">
              <TextInput
                value={editing.image ?? ''}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Description courte">
                <TextArea
                  rows={3}
                  value={editing.short_desc ?? ''}
                  onChange={(e) => setEditing({ ...editing, short_desc: e.target.value })}
                />
              </Field>
              <Field label="Description complète">
                <TextArea
                  rows={3}
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Caractéristiques" hint="Une ligne par point, affiché en liste à puces.">
                <LineList
                  value={editing.features ?? []}
                  onChange={(features) => setEditing({ ...editing, features })}
                  placeholder="Moteur 100% cuivre"
                />
              </Field>
              <Field label="Tableau technique" hint="Paire caractéristique / valeur.">
                <SpecEditor
                  value={editing.specs ?? {}}
                  onChange={(specs) => setEditing({ ...editing, specs })}
                />
              </Field>
            </div>

            <Field label="Galerie" hint="Chemin ou URL par ligne. La première sert de vignette.">
              <LineList
                value={editing.images ?? []}
                onChange={(images) => setEditing({ ...editing, images })}
                placeholder="/products/mon-image.jpg"
                addLabel="Ajouter une image"
              />
            </Field>

            <div className="flex flex-wrap gap-5 rounded-2xl bg-bg-secondary p-4">
              <Toggle
                checked={editing.is_active ?? true}
                onChange={(is_active) => setEditing({ ...editing, is_active })}
                label="Visible sur le site"
              />
              <Toggle
                checked={editing.in_stock ?? true}
                onChange={(in_stock) => setEditing({ ...editing, in_stock })}
                label="En stock"
              />
              <Toggle
                checked={editing.is_featured ?? false}
                onChange={(is_featured) => setEditing({ ...editing, is_featured })}
                label="Mis en avant"
              />
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

      {/* ── liste ── */}
      {shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="h-9 w-9" />}
            title="Aucun produit à afficher"
            hint={
              search || cat !== 'all'
                ? 'Aucun produit ne correspond à ces filtres.'
                : 'Créez un premier produit pour remplir le catalogue.'
            }
            action={
              <Button variant="primary" onClick={() => setEditing({ ...BLANK })}>
                <Plus className="h-4 w-4" /> Nouveau produit
              </Button>
            }
          />
        </Card>
      ) : view === 'list' ? (
        <Card>
          <div className="admin-scroll">
            <table className="admin-table">
              <thead className="border-b border-border">
                <tr>
                  <Th>Produit</Th><Th>Catégorie</Th><Th>Prix</Th>
                  <Th>État</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shown.map((p) => (
                  <tr key={p.id}>
                    <Td primary>
                      <div className="flex items-center gap-3">
                        {p.image && (
                          <img
                            src={p.image}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-lg border border-border bg-white object-contain"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.name}</p>
                          <p className="text-xs text-text-muted">{p.ref_ ?? p.slug}</p>
                        </div>
                      </div>
                    </Td>
                    <Td label="Catégorie" className="text-text-muted">{p.category?.label ?? '—'}</Td>
                    <Td label="Prix" className="font-semibold">{formatFcfa(p.price)}</Td>
                    <Td label="État">
                      <div className="flex flex-wrap gap-1.5">
                        {!p.is_active && <Pill>Masqué</Pill>}
                        {!p.in_stock && <Pill tone="warn">Rupture</Pill>}
                        {p.is_featured && <Pill tone="dark">En avant</Pill>}
                      </div>
                    </Td>
                    <Td label="" className="justify-end">
                      <div className="flex gap-1.5">
                        <Button onClick={() => setEditing({ ...p })} aria-label="Modifier">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => toggle(p, { is_active: !p.is_active })}
                          aria-label={p.is_active ? 'Masquer' : 'Afficher'}
                        >
                          {p.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="danger" onClick={() => setConfirmDelete(p)} aria-label="Supprimer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <div className="flex items-center justify-center border-b border-border bg-white p-4">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.image_alt ?? p.name}
                    className="h-36 w-full object-contain"
                  />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center text-text-muted/40">
                    <Package className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap gap-1.5">
                  {p.badge && <Pill tone="dark">{p.badge}</Pill>}
                  {!p.is_active && <Pill>Masqué</Pill>}
                  {!p.in_stock && <Pill tone="warn">Rupture</Pill>}
                </div>
                <h4 className="font-heading text-base font-bold leading-tight">{p.name}</h4>
                <p className="text-xs text-text-muted">{p.ref_ ?? '—'}</p>
                <p className="mt-1 font-heading text-lg font-bold">{formatFcfa(p.price)}</p>

                <div className="mt-auto flex gap-2 border-t border-border pt-3">
                  <Button onClick={() => setEditing({ ...p })} className="flex-1">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </Button>
                  <Button
                    onClick={() => toggle(p, { is_active: !p.is_active })}
                    aria-label={p.is_active ? 'Masquer' : 'Afficher'}
                  >
                    {p.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(p)} aria-label="Supprimer">
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
          title="Supprimer ce produit ?"
          message={`« ${confirmDelete.name} » sera retiré du site. Cette action est définitive.`}
          confirmLabel="Supprimer"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  )
}