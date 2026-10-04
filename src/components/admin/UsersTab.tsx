'use client'

/**
 * UsersTab — Comptes et autorisations.
 *
 * Deux rôles, aux portées volontairement différentes :
 *
 *   • `admin`  — l'agence. Peut gérer les autres comptes, et possède tous les
 *     modules sans avoir à les cocher un par un.
 *   • `editor` — un collaborateur du client. Ne voit QUE les modules qui lui
 *     sont accordés, et uniquement en lecture ou en écriture selon la case.
 *
 * Un module absent vaut REFUS : c'est le principe du moindre privilège. On
 * n'accorde jamais par defaut, pour qu'une omission reste une fermeture.
 *
 * Le compte ne peut pas se retirer lui-même : il se verrouillerait hors du
 * portail, et personne — pas même l'agence — ne pourrait le rattraper depuis
 * cette liste.
 */

import React, { useState, useEffect } from 'react'
import { Users, Plus, Trash2, ShieldCheck, Pencil, Loader2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { MODULE_LABEL, GRANTABLE_MODULE_KEYS } from '@/lib/admin-types'
import type { ModuleKey, Permissions, SiteAdmin } from '@/lib/admin-types'
import {
  Card, Button, Field, TextInput, Select, Toggle, Pill,
  EmptyState, ConfirmDialog, formatDate,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

const BLANK = { email: '', full_name: '', role: 'editor', permissions: {} as Permissions }

export default function UsersTab({ notify }: { notify: Notify }) {
  const { admins, saveUser, deleteUser, isOwner, authEmail, refresh, supabaseEnabled } = useStore()

  const [draft, setDraft] = useState(BLANK)
  const [editing, setEditing] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<SiteAdmin | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { void refresh() }, [refresh])

  const isNew = !editing

  const setPermission = (module: ModuleKey, level: 'none' | 'read' | 'write') => {
    setDraft((d) => {
      const next = { ...d.permissions }
      if (level === 'none') delete next[module]
      else next[module] = level
      return { ...d, permissions: next }
    })
  }

  const save = async () => {
    setBusy(true)
    const error = await saveUser(draft)
    setBusy(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    setDraft(BLANK)
    setEditing(null)
    notify({ message: isNew ? 'Compte enregistré.' : 'Droits mis à jour.', tone: 'ok' })
  }

  const startEdit = (u: SiteAdmin) => {
    setDraft({
      email: u.email,
      full_name: u.full_name ?? '',
      role: u.role,
      permissions: u.permissions ?? {},
    })
    setEditing(u.email)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* Sans compte `admin`, la liste des comptes n'est pas lisible : la base
     renvoie zéro ligne. Il faut le dire, sinon l'écran paraîtrait vide. */
  if (!isOwner) {
    return (
      <Card>
        <EmptyState
          icon={<ShieldCheck className="h-9 w-9" />}
          title="Réservé à l'agence"
          hint="Seul un compte « admin » peut ajouter des collaborateurs et modifier leurs droits. Demandez-le à l'agence si vous avez besoin d'un accès."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── formulaire ── */}
      <Card title={isNew ? 'Ajouter un compte' : `Droits de ${editing}`}>
        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Adresse e-mail"
              hint="Doit correspondre au compte créé dans Supabase Auth."
            >
              <TextInput
                type="email"
                value={draft.email}
                disabled={!isNew}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="prenom.nom@client.sn"
              />
            </Field>
            <Field label="Nom affiché">
              <TextInput
                value={draft.full_name}
                onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                placeholder="Awa Diop"
              />
            </Field>
          </div>

          <Field label="Rôle">
            <Select
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            >
              <option value="editor">Collaborateur — accès limité aux modules accordés</option>
              <option value="admin">Agence — accès complet, gère les comptes</option>
            </Select>
          </Field>

          {draft.role === 'editor' && (
            <div>
              <p className="admin-label mb-3">Modules autorisés</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {GRANTABLE_MODULE_KEYS.map((m) => {
                  const level = draft.permissions[m] ?? 'none'
                  return (
                    <li
                      key={m}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border px-3.5 py-2.5"
                    >
                      <span className="min-w-0 truncate text-sm">{MODULE_LABEL[m]}</span>
                      <Select
                        value={level}
                        onChange={(e) => setPermission(m, e.target.value as 'none' | 'read' | 'write')}
                        className="!w-28 !py-1.5 text-xs"
                        aria-label={`Droits sur ${MODULE_LABEL[m]}`}
                      >
                        <option value="none">Aucun</option>
                        <option value="read">Lecture</option>
                        <option value="write">Écriture</option>
                      </Select>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-3 text-xs text-text-muted">
                Un module laissé sur « Aucun » n&apos;apparaît pas dans le menu. Ce
                collaborateur ne verra ni les commandes, ni les demandes clients.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            {editing && (
              <Button onClick={() => { setEditing(null); setDraft(BLANK) }}>
                Annuler
              </Button>
            )}
            <Button
              variant="primary"
              onClick={save}
              disabled={busy || !draft.email.includes('@')}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isNew ? 'Ajouter' : 'Enregistrer les droits'}
            </Button>
          </div>

          {!supabaseEnabled && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
              Base non configurée : les droits ne seront pas enregistrés.
            </p>
          )}
        </div>
      </Card>

      {/* ── liste ── */}
      <Card title={`Comptes (${admins.length})`}>
        {admins.length === 0 ? (
          <EmptyState
            icon={<Users className="h-9 w-9" />}
            title="Aucun compte"
            hint="Ajoutez le premier collaborateur pour qu'il puisse administrer le site."
          />
        ) : (
          <ul className="divide-y divide-border">
            {admins.map((u) => {
              const mine = u.email === authEmail
              const granted = Object.keys(u.permissions ?? {}).length
              return (
                <li
                  key={u.email}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-text-primary">
                      {u.email}
                      {u.role === 'admin' && <Pill tone="dark">Agence</Pill>}
                      {mine && <Pill tone="ok">Vous</Pill>}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {u.full_name || 'Sans nom'} ·{' '}
                      {u.role === 'admin'
                        ? 'accès complet'
                        : granted === 0
                          ? 'aucun module accordé'
                          : `${granted} module${granted > 1 ? 's' : ''}`}
                      {u.created_at ? ` · depuis le ${formatDate(u.created_at)}` : ''}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button onClick={() => startEdit(u)}>
                      <Pencil className="h-3.5 w-3.5" /> Droits
                    </Button>
                    {/* On ne se retire pas soi-même : cela fermerait la porte
                        derrière soi, sans moyen de la rouvrir depuis cette liste. */}
                    {!mine && (
                      <Button variant="danger" onClick={() => setConfirmDelete(u)} aria-label="Supprimer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {confirmDelete && (
        <ConfirmDialog
          title="Retirer ce compte ?"
          message={
            <>
              <strong>{confirmDelete.email}</strong> perdra immédiatement tout accès
              au portail.
              {!confirmDelete.permissions || Object.keys(confirmDelete.permissions).length === 0
                ? ' Ce compte n’a de toute façon aucun module accordé.'
                : ''}
            </>
          }
          confirmLabel="Retirer le compte"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={async () => {
            const target = confirmDelete
            setConfirmDelete(null)
            const error = await deleteUser(target.email)
            if (error) { notify({ message: error, tone: 'error' }); return }
            notify({ message: 'Compte retiré.', tone: 'ok' })
          }}
        />
      )}
    </div>
  )
}