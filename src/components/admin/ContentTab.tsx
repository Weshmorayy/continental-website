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
 *
 * ── La liste, revue ───────────────────────────────────────────────────────
 * Chaque bloc déployait auparavant son formulaire complet, à même la page. La
 * section « À propos » en compte douze : l'écran devenait un mur de champs, et
 * retrouver « la phrase du milieu » demandait de faire défiler, puis de lire
 * chaque en-tête pour se repérer.
 *
 * Les blocs sont maintenant des LIGNES : on lit ce que contient chacun d'un
 * coup d'œil, et on ouvre celui qu'on veut dans une fenêtre à onglets. La liste
 * tient sur un écran, ce qui est le seul moyen d'y retrouver quelque chose.
 */

import React, { useState, useMemo } from 'react'
import {
  Save, Eye, EyeOff, Trash2, Type, Camera, Settings2, Pencil, FileText,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { ContentBlock } from '@/lib/admin-types'
import {
  Card, Button, Field, TextInput, TextArea, Pill, EmptyState, ConfirmDialog,
  Modal, Tabs, Disclosure, ImageFitControl, type ModalTab,
} from '@/components/admin/ui'
import ImagePicker from '@/components/admin/ImagePicker'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

/** Sections du site, dans l'ordre où le visiteur les rencontre. */
const SECTIONS: { slot: string; label: string; blurb: string }[] = [
  { slot: 'hero', label: 'Accueil — héros', blurb: 'Le grand titre et l’image de très haut de page.' },
  { slot: 'gammes', label: 'Accueil — nos gammes', blurb: 'Les cartes de gammes (ventilation, climatisation, télévision) et leurs visuels.' },
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
  /*
   * Les blocs `gamme-N` de l'accueil.
   *
   * `meta` est VOLONTAIREMENT absent de cette liste. Sur cette section, la
   * colonne ne contient pas une « précision » éditoriale : elle porte les
   * catégories que la carte regroupe, et c'est elle qui décide de quels
   * produits la carte mène. L'afficher comme un champ de texte libre
   * inviterait le vendeur à la vider en cherchant à corriger une phrase —
   * et la carte disparaîtrait de l'accueil sans qu'il comprenne pourquoi.
   * Elle est affichée en lecture seule plus bas.
   */
  gammes:    ['eyebrow', 'title', 'subtitle', 'body', 'image', 'image_alt', 'cta_label', 'cta_href'],
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

/** Les champs longs méritent une zone de texte, pas un champ d'une ligne. */
const isLong = (f: TextField) => f === 'body' || f === 'subtitle'

/** Libellé humain d'une catégorie. Repli sur le slug : afficher
 *  « ventilateur-sur-pied » est laid mais lisible, afficher « undefined »
 *  ne l'est pas. */
type LabelOf = (slug: string) => string

/**
 * Ce qu'on lit d'un bloc dans la liste.
 *
 * Un titre, sinon un sur-titre, sinon le début du texte, sinon la clé
 * technique. L'ordre suit ce qui a du sens pour un humain : le premier mot que
 * le visiteur lira est le meilleur repère pour retrouver le bloc.
 */
function summarise(b: ContentBlock): string {
  const firstLine = (b.body ?? '').split('\n')[0]
  const text = b.title || b.eyebrow || firstLine || ''
  return text.length > 90 ? `${text.slice(0, 90)}…` : text
}

type TabId = 'texte' | 'image' | 'avance'

function BlockEditor({
  block, fields, onSave, onDelete, onClose, saving, labelOf,
}: {
  block: ContentBlock
  fields: TextField[]
  labelOf: LabelOf
  onSave: (patch: Partial<ContentBlock>) => void
  onDelete: () => void
  onClose: () => void
  saving: boolean
}) {
  const [draft, setDraft] = useState<Partial<ContentBlock>>(block)
  const [askDelete, setAskDelete] = useState(false)
  const [tab, setTab] = useState<TabId>('texte')

  // Le bloc change d'identité quand on en recharge un autre : le brouillon
  // doit suivre, sinon les modifications resteraient affichées sur le
  // mauvais bloc.
  React.useEffect(() => { setDraft(block); setTab('texte') }, [block])

  /*
   * Sur la section « gammes », `meta` ne se lit pas comme du texte : c'est la
   * liste des catégories rattachées au bloc. On l'affiche donc comme des
   * étiquettes plutôt que dans un champ de saisie.
   */
  const isGamme = /^gamme-\d+$/.test(block.key)
  const gammeSlugs = (block.meta ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const hasImage = fields.includes('image')
  const textFields = fields.filter((f) => f !== 'image' && f !== 'image_alt')

  const tabs: ModalTab[] = [
    {
      id: 'texte',
      label: 'Texte',
      icon: <Type className="h-3.5 w-3.5" />,
      hint: `${textFields.length}`,
      attention: !block.title?.trim() && !block.body?.trim(),
    },
    ...(hasImage
      ? [{
          id: 'image' as TabId,
          label: 'Image',
          icon: <Camera className="h-3.5 w-3.5" />,
          hint: draft.image ? undefined : 'aucune',
          attention: !draft.image,
        }]
      : []),
    { id: 'avance', label: 'Avancé', icon: <Settings2 className="h-3.5 w-3.5" /> },
  ]

  return (
    <Modal
      size="lg"
      labelledBy="bloc-titre"
      title={block.key}
      subtitle={`Emplacement « ${block.key} » — ${block.active ? 'visible' : 'masqué'}`}
      onClose={onClose}
      tabs={<Tabs tabs={tabs} active={tab} onChange={(id) => setTab(id as TabId)} />}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="danger" onClick={() => setAskDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Retirer
          </Button>
          <Button variant="primary" onClick={() => onSave(draft)} disabled={saving}>
            <Save className="h-3.5 w-3.5" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      }
    >
      {tab === 'texte' && (
        <div className="space-y-4">
          {/* Le bloc doit dire ce qu'il regroupe AVANT les champs : c'est ce
              qui permet au vendeur de savoir qu'il est bien en train de
              modifier la carte « Téléviseurs » et pas une ventilation. */}
          {isGamme && (
            <Field
              label="Catégories regroupées"
              hint="Lie cette carte à des produits du catalogue. Déterministe : elle ne dépend pas de l'ordre des catégories."
            >
              <div className="flex flex-wrap gap-2">
                {gammeSlugs.length === 0 ? (
                  <Pill>Aucune — cette carte n’apparaît pas sur l’accueil</Pill>
                ) : (
                  gammeSlugs.map((s) => (
                    <Pill key={s}>{labelOf(s)}</Pill>
                  ))
                )}
              </div>
              {gammeSlugs.length > 0 && (
                <p className="mt-2 text-xs text-text-muted">{block.meta}</p>
              )}
            </Field>
          )}

          {textFields.map((f) => (
            <Field key={f} label={LABELS[f]}>
              {isLong(f) ? (
                <TextArea
                  rows={f === 'body' ? 5 : 3}
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
          ))}
        </div>
      )}

      {tab === 'image' && hasImage && (
        <div className="space-y-5">
          <ImagePicker
            label="Image"
            value={draft.image ?? null}
            onChange={(next) => setDraft((d) => ({ ...d, image: next }))}
            folder="promo"
            hint={`Appliquée à « ${block.key} ».`}
          />

          <Field label="Texte alternatif de l’image" hint="Décrit l’image pour les lecteurs d’écran.">
            <TextInput
              value={draft.image_alt ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, image_alt: e.target.value }))}
            />
          </Field>

          {/*
            * Le cadrage n'apparaît que dans cet onglet : il ne concerne que
            * l'image, et le mêler aux champs de texte ferait croire qu'il agit
            * sur la mise en page de la section entière.
            */}
          <Disclosure
            title="Cadrage de l’image"
            hint="Remplir, aligner en haut…"
            defaultOpen={Boolean(draft.object_fit || draft.object_position)}
          >
            <ImageFitControl
              image={draft.image}
              fit={draft.object_fit}
              position={draft.object_position}
              onChangeFit={(v) => setDraft((d) => ({ ...d, object_fit: v || null }))}
              onChangePosition={(v) => setDraft((d) => ({ ...d, object_position: v || null }))}
              hint="« Par défaut » garde le cadrage d’origine de la section."
            />
          </Disclosure>
        </div>
      )}

      {tab === 'avance' && (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-text-muted">
            Ces champs viennent d’un usage ponctuel de la section. Les modifier à
            la main peut casser son affichage : en cas de doute, ne touchez à rien.
          </p>
          <TextArea
            rows={10}
            className="font-mono-ref text-xs"
            defaultValue={JSON.stringify(block.data ?? {}, null, 2)}
            onChange={(e) => {
              try {
                setDraft((d) => ({ ...d, data: JSON.parse(e.target.value) }))
              } catch {
                /* JSON invalide : on conserve la dernière version correcte */
              }
            }}
          />
        </div>
      )}

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
    </Modal>
  )
}

export default function ContentTab({ notify }: { notify: Notify }) {
  const { blocks, saveBlock, deleteBlock, refresh, categories } = useStore()

  /* Les libellés viennent de la base, pas d'une table écrite en dur : une
   * catégorie renommée dans l'admin s'affiche ici sous son nouveau nom. */
  const labelOf: LabelOf = useMemo(() => {
    const map = new Map(categories.map((c) => [c.slug, c.label]))
    return (slug) => map.get(slug) ?? slug
  }, [categories])
  const [openSlot, setOpenSlot] = useState<string>(SECTIONS[0].slot)
  const [editingId, setEditingId] = useState<string | null>(null)
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
  const editing = sectionBlocks.find((b) => b.id === editingId) ?? null

  const save = async (patch: Partial<ContentBlock>) => {
    setSaving(true)
    const error = await saveBlock(patch)
    setSaving(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    setEditingId(null)
    await refresh()
    notify({ message: 'Contenu enregistré. Le site le recharge sous une minute.', tone: 'ok' })
  }

  /** Affiche ou masque un bloc sans ouvrir son formulaire. */
  const toggle = async (b: ContentBlock) => {
    const error = await saveBlock({ ...b, active: !b.active })
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({
      message: b.active
        ? `« ${b.key} » est masqué : le site affichera son texte de repli.`
        : `« ${b.key} » est de nouveau affiché.`,
      tone: 'ok',
    })
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
                onClick={() => { setOpenSlot(s.slot); setEditingId(null) }}
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
          <EmptyState
            icon={<FileText className="h-9 w-9" />}
            title="Aucun bloc dans cette section"
            hint="Cette section du site utilise donc ses textes d’origine."
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {sectionBlocks.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-ref text-[0.7rem] font-bold text-text-muted">
                      {b.key}
                    </span>
                    {!b.active && <Pill>Masqué</Pill>}
                    {(b.object_fit || b.object_position) && <Pill tone="dark">Cadré</Pill>}
                  </div>
                  {/* Le résumé est ce qui permet de retrouver « la phrase du
                      milieu » sans ouvrir les douze blocs l'un après l'autre. */}
                  <p className="mt-0.5 truncate text-sm text-text-body">
                    {summarise(b) || <span className="text-text-muted">Bloc vide</span>}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <Button
                    variant={b.active ? 'ghost' : 'primary'}
                    onClick={() => toggle(b)}
                    aria-label={b.active ? `Masquer ${b.key}` : `Afficher ${b.key}`}
                  >
                    {b.active
                      ? <EyeOff className="h-3.5 w-3.5" />
                      : <Eye className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{b.active ? 'Masquer' : 'Afficher'}</span>
                  </Button>
                  <Button onClick={() => setEditingId(b.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Modifier</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {editing && (
        <BlockEditor
          block={editing}
          fields={FIELDS[section.slot] ?? FIELDS.default}
          labelOf={labelOf}
          saving={saving}
          onSave={save}
          onClose={() => setEditingId(null)}
          onDelete={async () => {
            const error = await deleteBlock(editing.id)
            if (error) { notify({ message: error, tone: 'error' }); return }
            setEditingId(null)
            await refresh()
            notify({ message: 'Bloc retiré.', tone: 'ok' })
          }}
        />
      )}
    </div>
  )
}
