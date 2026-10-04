'use client'

/**
 * ContentTab — Contenu du site public.
 *
 * Chaque section affichée sur le site correspond à un `slot` de la table
 * `content_blocks`. Ce module les expose tous, y compris ceux dont on ne
 * verrait jamais l'absence : si un bloc est masqué ou vide, la page perd une
 * phrase — pas une section entière.
 *
 * L'_{'(slot)'}_ sert de LABEL : il explique à l'administrateur où le texte
 * apparaît. « Arguments / 01 » ne veut rien dire pour lui ; « Accroche du
 * héros — grand titre de l'accueil » si.
 */

import React, { useState, useMemo } from 'react'
import { Save, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { ContentBlock } from '@/lib/admin-types'
import {
  Card, Button, Field, TextInput, TextArea, Toggle, Pill, ConfirmDialog,
} from '@/components/admin/ui'
import ImagePicker from '@/components/admin/ImagePicker'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

/** Sections du site, dans l'ordre où le visiteur les rencontre. */
const SECTIONS: { slot: string; label: string; blurb: string }[] = [
  { slot: 'hero', label: 'Accueil — héros', blurb: 'Le grand titre et l’image de très haut de page.' },
  { slot: 'gammes', label: 'Accueil — nos deux gammes', blurb: 'Les deux cartes ventilation / climatisation et leurs visuels.' },
  { slot: 'engagements', label: 'Accueil — engagements', blurb: 'Les quatre arguments numérotés.' },
  { slot: 'bestseller', label: 'Accueil — plus vendu', blurb: 'La mise en avant du produit le plus demandé.' },
  { slot: 'livraison', label: 'Accueil — livraison & paiement', blurb: 'Titres de la section, zones et facture proforma.' },
  { slot: 'catalogue-apercu', label: 'Accueil — aperçu catalogue', blurb: 'Le bandeau qui mène au catalogue.' },
  { slot: 'a-propos', label: 'Page — À propos', blurb: 'Toute la page : titre, repères, mission, valeurs, appel final.' },
  { slot: 'garantie', label: 'Page — Garantie & SAV', blurb: 'Durée de garantie, couverture, exclusions et étapes du dossier SAV.' },
  { slot: 'contact', label: 'Page — Contact', blurb: 'Coordonnées affichées, formulaire et questions fréquentes.' },
]

/** Champs TEXTuels modifiables. Volontairement restreint : `data`,
 *  `position` et `active` ne sont pas des textes, et les faire passer par
 *  `TextInput` produirait un `[object Object]` dans le champ. */
type TextField =
  | 'eyebrow' | 'title' | 'subtitle' | 'body' | 'meta'
  | 'cta_label' | 'cta_href' | 'image' | 'image_alt'

/** Champs proposés selon le bloc : inutile d'afficher une zone « image »
 *  pour une question fréquente. */
const FIELDS: Record<string, TextField[]> = {
  hero:     ['eyebrow', 'title', 'subtitle', 'image', 'image_alt', 'cta_label', 'cta_href'],
  bestseller: ['eyebrow', 'title', 'image', 'image_alt'],
  // Sur les pages internes, un bloc est souvent une simple ligne de titre,
  // de texte ou de valeur isolée : proposer sept champs vides les rend
  // illisibles.
  'a-propos':   ['eyebrow', 'title', 'body', 'meta', 'image', 'image_alt'],
  garantie:     ['eyebrow', 'title', 'body', 'meta'],
  contact:      ['eyebrow', 'title', 'body', 'meta'],
  default:      ['eyebrow', 'title', 'body', 'meta', 'image', 'image_alt'],
}

/** Libellés français — « cta_label » n'est pas une étiquette pour un humain. */
const LABELS: Record<TextField, string> = {
  eyebrow: 'Sur-titre',
  title: 'Titre',
  subtitle: 'Sous-titre',
  body: 'Texte',
  meta: 'Précision',
  cta_label: 'Libellé du bouton',
  cta_href: 'Adresse du bouton',
  image: 'Image',
  image_alt: 'Texte alternatif de l’image',
}

function BlockEditor({
  block, fields, onSave, onToggle, onDelete, saving,
}: {
  block: ContentBlock
  fields: TextField[]
  onSave: (patch: Partial<ContentBlock>) => void
  onToggle: (active: boolean) => void
  onDelete: () => void
  saving: boolean
}) {
  const [draft, setDraft] = useState<Partial<ContentBlock>>(block)
  const [askDelete, setAskDelete] = useState(false)

  // Le bloc change d'identité quand on en recharge une autre : le brouillon
  // doit suivre, sinon les modifications resteraient affichées sur la
  // mauvaise question.
  React.useEffect(() => { setDraft(block) }, [block])

  const isLong = (f: TextField) => f === 'body' || f === 'subtitle'

  return (
    <Card
      title={
        <span className="flex flex-wrap items-center gap-2">
          <span>{block.key}</span>
          {!block.active && <Pill>Masqué</Pill>}
        </span>
      }
      action={
        <Button variant={draft.active ? 'ghost' : 'primary'} onClick={() => onToggle(!draft.active)}>
          {draft.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{draft.active ? 'Masquer' : 'Afficher'}</span>
        </Button>
      }
    >
      <div className="space-y-4 p-4 sm:p-5">
        {fields.map((f) => {
          if (f === 'image') {
            return (
              <ImagePicker
                key={f}
                label="Image"
                value={draft.image ?? null}
                onChange={(next) => setDraft((d) => ({ ...d, image: next }))}
                folder="promo"
                hint={`Appliquée à « ${block.key} ».`}
              />
            )
          }
          if (f === 'image_alt') {
            return (
              <Field key={f} label="Texte alternatif de l’image" hint="Décrit l’image pour les lecteurs d’écran.">
                <TextInput
                  value={draft.image_alt ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, image_alt: e.target.value }))}
                />
              </Field>
            )
          }
          return (
            <Field key={f} label={LABELS[f]}>
              {isLong(f) ? (
                <TextArea
                  rows={3}
                  value={draft[f] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [f]: e.target.value }))}
                />
              ) : (
                <TextInput
                  value={draft[f] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [f]: e.target.value }))}
                />
              )}
            </Field>
          )
        })}

        <details className="rounded-xl border border-border bg-bg-secondary p-3">
          <summary className="cursor-pointer text-xs font-semibold text-text-muted">
            Champs avancés (JSON)
          </summary>
          <TextArea
            rows={6}
            className="mt-2 font-mono-ref text-xs"
            defaultValue={JSON.stringify(block.data ?? {}, null, 2)}
            onChange={(e) => {
              try {
                setDraft((d) => ({ ...d, data: JSON.parse(e.target.value) }))
              } catch {
                /* JSON invalide : on conserve la dernière version correcte */
              }
            }}
          />
        </details>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button variant="danger" onClick={() => setAskDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Retirer
          </Button>
          <Button variant="primary" onClick={() => onSave(draft)} disabled={saving}>
            <Save className="h-3.5 w-3.5" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>

        {askDelete && (
          <ConfirmDialog
            title="Retirer ce bloc ?"
            message="Le site affichera alors le texte de repli, pas une page vide."
            confirmLabel="Retirer"
            danger
            onCancel={() => setAskDelete(false)}
            onConfirm={() => { setAskDelete(false); onDelete() }}
          />
        )}
      </div>
    </Card>
  )
}

export default function ContentTab({ notify }: { notify: Notify }) {
  const { blocks, saveBlock, deleteBlock, refresh } = useStore()
  const [openSlot, setOpenSlot] = useState<string>(SECTIONS[0].slot)
  const [saving, setSaving] = useState(false)

  const bySlot = useMemo(() => {
    const map = new Map<string, ContentBlock[]>()
    for (const b of blocks) {
      const list = map.get(b.slot) ?? []
      list.push(b)
      map.set(b.slot, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.position - b.position)
    return map
  }, [blocks])

  const sectionBlocks = bySlot.get(openSlot) ?? []
  const section = SECTIONS.find((s) => s.slot === openSlot)!

  const save = async (patch: Partial<ContentBlock>) => {
    setSaving(true)
    const error = await saveBlock(patch)
    setSaving(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Contenu enregistré. Le site le recharge sous une minute.', tone: 'ok' })
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="p-4 text-sm text-text-body">
          Chaque bloc correspond à un morceau de texte ou une image du site
          public. Une modification est visible en moins d&apos;une minute.
        </p>
        <nav className="flex flex-wrap gap-2 border-t border-border p-4">
          {SECTIONS.map((s) => {
            const count = bySlot.get(s.slot)?.length ?? 0
            const active = openSlot === s.slot
            return (
              <button
                key={s.slot}
                onClick={() => setOpenSlot(s.slot)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                  active ? 'bg-black text-white' : 'bg-bg-secondary text-text-body hover:text-black'
                }`}
              >
                {s.label} · {count}
              </button>
            )
          })}
        </nav>
      </Card>

      <p className="text-xs text-text-muted">{section.blurb}</p>

      {sectionBlocks.length === 0 ? (
        <Card>
          <p className="p-10 text-center text-sm text-text-muted">
            Aucun bloc dans cette section.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sectionBlocks.map((b) => (
            <BlockEditor
              key={b.id}
              block={b}
              fields={FIELDS[section.slot] ?? FIELDS.default}
              saving={saving}
              onSave={save}
              onToggle={(active) => save({ ...b, active })}
              onDelete={async () => {
                const error = await deleteBlock(b.id)
                if (error) { notify({ message: error, tone: 'error' }); return }
                await refresh()
                notify({ message: 'Bloc retiré.', tone: 'ok' })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}