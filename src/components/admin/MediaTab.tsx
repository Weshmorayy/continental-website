'use client'

/**
 * MediaTab — Médiathèque : dépôt d'images vers Supabase Storage.
 *
 * Le bucket est public en LECTURE seulement. L'écriture exige un compte listé
 * dans `site_admins` : un visiteur ne peut rien déposer, même en connaissant
 * l'URL du bucket.
 *
 * L'URL renvoyée est ensuite copiée dans les fiches produit ou bannière.
 */

import React, { useState, useRef } from 'react'
import { Upload, Trash2, Copy, Check, FolderSync, Loader2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import {
  Card, Button, TextInput, EmptyState, ConfirmDialog, Pill, formatDate,
} from '@/components/admin/ui'
import type { MediaAsset } from '@/lib/admin-types'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

const MAX_MB = 10

export default function MediaTab({ notify }: { notify: Notify }) {
  const { media, uploadImage, deleteMedia, refresh } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [folder, setFolder] = useState('produits')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<MediaAsset | null>(null)

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    let failures = 0
    for (const file of Array.from(files)) {
      if (file.size > MAX_MB * 1024 * 1024) {
        notify({
          message: `${file.name} dépasse ${MAX_MB} Mo et n'a pas été déposé.`,
          tone: 'error',
        })
        failures++
        continue
      }
      const error = await uploadImage(file, folder)
      if (error) { notify({ message: error, tone: 'error' }); failures++ }
    }
    setBusy(false)
    await refresh()
    if (!failures) notify({ message: 'Images déposées.', tone: 'ok' })
  }

  const copy = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url)
      setCopied(asset.id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      notify({ message: 'Copie impossible dans ce navigateur.', tone: 'error' })
    }
  }

  const remove = async () => {
    if (!confirmDelete) return
    const error = await deleteMedia(confirmDelete.id)
    setConfirmDelete(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Image supprimée.', tone: 'ok' })
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <TextInput
            value={folder}
            onChange={(e) => setFolder(e.target.value.replace(/[^\w/-]/g, ''))}
            placeholder="dossier"
            className="sm:w-56"
            aria-label="Dossier de dépôt"
          />
          <p className="flex-1 text-xs text-text-muted">
            Les images sont déposées dans le dossier indiqué. Format accepté :
            JPEG, PNG, WebP, AVIF — {MAX_MB} Mo maximum.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { onPick(e.target.files); e.target.value = '' }}
          />
          <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? 'Dépôt…' : 'Déposer des images'}
          </Button>
        </div>
      </Card>

      {media.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderSync className="h-9 w-9" />}
            title="La médiathèque est vide"
            hint="Déposez des images ici, puis copiez leur adresse dans les fiches produit ou bannière."
            action={
              <Button variant="primary" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> Déposer une image
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((m) => (
            <Card key={m.id}>
              <div className="border-b border-border bg-white">
                <img src={m.url} alt={m.alt ?? ''} className="h-40 w-full object-contain" />
              </div>
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill>{m.folder}</Pill>
                  <Pill>{(m.size / 1024).toFixed(0)} Ko</Pill>
                </div>
                <p className="truncate text-xs text-text-muted" title={m.path}>{m.path}</p>
                <p className="text-[10px] text-text-muted">{formatDate(m.created_at)}</p>
                <div className="flex gap-2 border-t border-border pt-3">
                  <Button onClick={() => copy(m)} className="flex-1">
                    {copied === m.id
                      ? <><Check className="h-3.5 w-3.5" /> Copié</>
                      : <><Copy className="h-3.5 w-3.5" /> Copier l'adresse</>}
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(m)} aria-label="Supprimer">
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
          title="Supprimer cette image ?"
          message="Le fichier sera effacé du stockage. Les fiches qui l'utilisent afficheront une image manquante."
          confirmLabel="Supprimer"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  )
}