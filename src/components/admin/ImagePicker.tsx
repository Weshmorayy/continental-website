'use client'

/**
 * admin/ImagePicker.tsx — Sélecteur d'image.
 *
 * Écrire `/aesthetic/aesthetic-fan-livingroom.jpg` dans un champ suppose de
 * connaître le chemin exact. Le selector displays the images réellement
 * déposées, permet d'en déposer une nouvelle, et rend la valeur obtenue
 * directement copiable dans le champ.
 *
 * Il accepte aussi une valeur qui n'est PAS dans la médiathèque (un visuel
 * déjà dans `public/`, par exemple) : la taper reste possible, faute de quoi
 * on ne pourrait plus utiliser les images livrées avec le dépôt.
 *
 * ⚠ Le champ reçoit `m.url`, l'adresse PUBLIQUE complète, jamais `m.path`.
 *   `path` n'est que le nom du fichier dans le seau (« produits/photo.png »)
 *   : le site le résout alors contre sa propre racine et renvoie un 404 —
 *   l'image téléversée devient invisible alors que tout semble avoir marché.
 *   C'est ce que font les visuels déposés dans `public/` (« /products/x.jpg »),
 *   d'où les deux formes de valeur acceptées en entrée.
 */

import React, { useState, useRef } from 'react'
import { Upload, X, Check, Loader2, ImageOff } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { Button, TextInput } from '@/components/admin/ui'

export default function ImagePicker({
  label, value, onChange, hint, folder = 'produits',
}: {
  label: string
  value: string | null | undefined
  onChange: (next: string | null) => void
  hint?: string
  folder?: string
}) {
  const { media, uploadImage } = useStore()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const shown = media.filter((m) =>
    !filter.trim() || m.path.toLowerCase().includes(filter.trim().toLowerCase()))

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    const file = files[0]
    const res = await uploadImage(file, folder)
    setBusy(false)
    if ('error' in res) { setUploadError(res.error); return }
    // L'adresse publique revient de l'appel : on ne relit pas un état React,
    // qui serait encore à sa valeur précédente à ce stade.
    setUploadError(null)
    onChange(res.url)
    setOpen(false)
  }

  return (
    <div>
      <span className="admin-label mb-1.5 block">{label}</span>

      <div className="flex items-start gap-3">
        {/* Aperçu — toujours blanc : les visuels Continental sont à fond blanc. */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageOff className="h-5 w-5 text-text-muted/30" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <TextInput
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="/products/mon-image.jpg ou URL"
            className="text-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOpen((v) => !v)}>
              {open ? 'Masquer la médiathèque' : 'Choisir dans la médiathèque'}
            </Button>
            {value && (
              <Button onClick={() => onChange(null)} aria-label="Retirer l'image">
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {hint && <span className="block text-xs text-text-muted">{hint}</span>}
        </div>
      </div>

      {open && (
        <div className="mt-3 rounded-2xl border border-border bg-white p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <TextInput
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrer par nom…"
              className="text-xs"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { void upload(e.target.files); e.target.value = '' }}
            />
            <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Déposer
            </Button>
          </div>

          {uploadError && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {uploadError}
            </p>
          )}

          {shown.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-text-muted">
              {media.length === 0
                ? 'Médiathèque vide — déposez une image pour commencer.'
                : 'Aucune image ne correspond à ce filtre.'}
            </p>
          ) : (
            <ul className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 lg:grid-cols-5">
              {shown.map((m) => {
                const selected = value === m.path || value === m.url
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => { onChange(m.url || m.path); setOpen(false) }}
                      title={m.path}
                      className={`relative block aspect-square w-full overflow-hidden rounded-xl border transition-colors ${
                        selected ? 'border-black' : 'border-border hover:border-text-muted'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.alt ?? ''} className="h-full w-full object-contain" />
                      {selected && (
                        <span className="absolute right-1 top-1 rounded-full bg-black p-1 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}