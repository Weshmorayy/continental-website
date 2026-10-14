'use client'

/**
 * ProductsTab — Catalogue : liste, filtres, édition, suppression.
 *
 * Le point délicat est la suppression : RLS peut retirer la ligne du jeu de
 * résultats SANS LEVER D'ERREUR. On relit donc après coup (`refresh`) plutôt
 * que de faire confiance à `error === null`.
 *
 * ── Le formulaire, revu ───────────────────────────────────────────────────
 * Il tenait sur un seul écran : une quarantaine de champs à la suite, dans une
 * fenêtre qui occupait tout le téléphone, avec le bouton « Enregistrer » tout
 * en bas. Pour changer un prix, il fallait traverser le nom, la galerie, les
 * caractéristiques et les modèles.
 *
 * Les champs sont désormais rangés en cinq onglets, et le pied de la fenêtre
 * reste visible : « Enregistrer » ne se cherche plus. Chaque onglet annonce son
 * contenu (« 3 modèles », « aucune image ») et porte un point ambre quand il
 * manque quelque chose — le vendeur voit où aller sans ouvrir les cinq.
 */

import React, { useState, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, Package, LayoutGrid, List, Eye, EyeOff,
  Tag, Camera, AlignLeft, Layers, Check, Circle,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Product, ProductVariant } from '@/lib/admin-types'
import {
  Card, Button, Field, TextInput, TextArea, Select, Toggle, Pill,
  LineList, SpecEditor, EmptyState, ConfirmDialog, Th, Td, formatFcfa,
  Modal, Tabs, type ModalTab,
} from '@/components/admin/ui'
import ImagePicker from '@/components/admin/ImagePicker'
import SlotPicker from '@/components/admin/SlotPicker'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

const BLANK: Partial<Product> = {
  name: '', slug: '', ref_: '', price: 0, compare_at: null,
  short_desc: '', description: '', features: [], specs: {},
  images: [], in_stock: true, is_active: true, is_featured: false, badge: '',
  variants: [],
}

/** Les cinq onglets du formulaire. */
type ProductTabId = 'essentiel' | 'visuels' | 'textes' | 'modeles' | 'publication'

/**
 * Une phrase d'aide par onglet, affichée dans le pied de la fenêtre.
 *
 * Elle remplace les paragraphes d'explication qui précédaient chaque champ :
 * regroupés, ils formaient un mur de texte que personne ne lisait, et ils
 * poussaient les champs hors de l'écran.
 */
const TAB_HELP: Record<ProductTabId, string> = {
  essentiel: 'Nom, adresse de la fiche, prix et classement dans le catalogue.',
  visuels: 'La photo principale et, si besoin, des vues supplémentaires.',
  textes: 'Ce que le client lit sur la fiche : accroche, description et caractéristiques.',
  modeles: 'Plusieurs tailles ou puissances sous une seule fiche, chacune à son prix.',
  publication: 'Qui voit ce produit sur le site, et sur quelles mises en avant.',
}

/**
 * « Ventilateur sur Pied 16" » → « ventilateur-sur-pied-16 ».
 *
 * L'identifiant d'URL est rempli à partir du nom tant que l'utilisateur ne
 * l'a pas modifié lui-même : c'est le champ qu'on oublie le plus souvent,
 * et son oubli ne se voit qu'en cliquant sur le produit.
 */
function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')            // retire les accents (diacritiques)
    .toLowerCase()
    .replace(/['’]/g, '')                 // l-cool -> lcool
    .replace(/[^a-z0-9]+/g, '-')          // tout le reste devient un tiret
    .replace(/^-+|-+$/g, '')
}

/**
 * Référence fabricant Continental, dérivée du nom et de la catégorie.
 *
 * Format observé sur la gamme réelle : deux lettres pour la famille, le
 * diamètre converti en millimètres sur deux chiffres, puis un suffixe.
 *   « Ventilateur sur Pied 16" »  → FS40-…
 *   « Ventilateur Mural 18" »     → FW45-…
 *
 * Le numéro final est tiré de l'horodatage : les références authentiques sont
 * posées par le grossiste, on ne peut pas les deviner. La valeur reste
 * modifiable — une référence provisoire se remplace, elle ne se fige pas.
 */
function makeRef(name: string, categoryId: string): string {
  const fam = categoryId.includes('mural') ? 'FW'
    : categoryId.includes('orbite') ? 'FO'
    : categoryId.includes('tv') ? 'CT'
    : categoryId.includes('climatiseur') ? 'CS'
    : 'FS'

  const pouces = /(\d{2})\s*(?:"|''|pouces)/i.exec(name)
  const mm = pouces ? String(Math.round(Number(pouces[1]) * 2.54)) : ''

  const suffixe = name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .split('-')
    .filter((w) => w.length > 2 && !/^\d+$/.test(w))
    .map((w) => w.slice(0, 2).toUpperCase())
    .join('')

  return `${fam}${mm}${suffixe ? `-${suffixe}` : ''}-${Date.now().toString().slice(-4)}`
}

/**
 * VariantsEditor — les modèles déclinés d'une fiche.
 *
 * ── Pourquoi une clé technique par modèle ─────────────────────────────────
 * Chaque modèle porte un `id` stable, invisble dans le formulaire. C'est lui
 * qui identifie la LIGNE DE PANIER (`slug::id`) : deux puissances du même
 * climatiseur doivent être deux lignes distinctes, facturées à leur propre
 * prix. Toute valeur dérivée du libellé changerait de clé à chaque
 * reformulation, et le panier d'un visiteur déjà ouvert se retrouverait avec
 * une ligne orpheline.
 *
 * Laisser la liste vide est un état normal : la fiche décrit alors un seul
 * modèle, au prix principal.
 */
function VariantsEditor({
  value, onChange, basePrice, showPower,
}: {
  value: ProductVariant[]
  onChange: (next: ProductVariant[]) => void
  basePrice: number
  /**
   * Affiche les colonnes « Puissance » et « BTU ».
   *
   * Elles n'ont de sens que sur un climatiseur. Sur un téléviseur décliné par
   * taille, deux colonnes vides occupaient la moitié de la ligne et repoussaient
   * le prix hors de l'écran d'un téléphone — pour des champs que personne ne
   * remplira jamais. Ce sont les colonnes qui s'adaptent à la fiche, pas au
   * vendeur de sauter ce qui ne le concerne pas.
   */
  showPower: boolean
}) {
  const update = (i: number, patch: Partial<ProductVariant>) =>
    onChange(value.map((v, j) => (j === i ? { ...v, ...patch } : v)))

  const add = () =>
    onChange([
      ...value,
      {
        id: `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        label: '',
        // Le prix principal est repris comme point de départ : c'est presque
        // toujours celui du premier modèle, et un champ vide enregistré à 0
        // ferait disparaître la variante du site (cf. `toVariants`).
        price: basePrice,
      },
    ])

  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))

  /* Classes écrites en littéral : Tailwind lit le source, pas le résultat. */
  const cols = showPower
    ? 'sm:grid-cols-[1.4fr_0.9fr_0.7fr_0.6fr_0.9fr_2rem]'
    : 'sm:grid-cols-[1.5fr_1fr_1fr_2rem]'

  return (
    <div className="space-y-2">
      {value.length === 0 ? (
        <p className="text-xs text-text-muted">
          Vide : la fiche décrit un seul modèle, au prix principal ci-dessus.
        </p>
      ) : (
        <>
          <div className={`hidden gap-2 text-[0.7rem] text-text-muted sm:grid ${cols}`}>
            <span>Modèle affiché</span>
            <span>Référence</span>
            {showPower && <span>Puissance</span>}
            {showPower && <span>BTU</span>}
            <span>Prix (FCFA)</span>
            <span />
          </div>

          {value.map((v, i) => (
            <div key={v.id} className="rounded-lg border border-border p-3">
              <div className={`grid gap-2 sm:items-center ${cols}`}>
                <TextInput
                  value={v.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder={showPower ? '1,5 cv — 12000 BTU' : '55 pouces'}
                  aria-label={`Libellé du modèle ${i + 1}`}
                />
                {/* La référence du modèle : sur une fiche déclinée par taille,
                    celle de la fiche ne vaut que pour une seule taille. */}
                <TextInput
                  value={v.ref ?? ''}
                  onChange={(e) => update(i, { ref: e.target.value })}
                  placeholder="CT-55SR"
                  aria-label={`Référence du modèle ${i + 1}`}
                />
                {showPower && (
                  <TextInput
                    value={v.power ?? ''}
                    onChange={(e) => update(i, { power: e.target.value })}
                    placeholder="1,5 cv"
                    aria-label={`Puissance du modèle ${i + 1}`}
                  />
                )}
                {showPower && (
                  <TextInput
                    inputMode="numeric"
                    value={v.btu === undefined ? '' : String(v.btu)}
                    onChange={(e) => {
                      const n = Number(e.target.value.replace(/\D/g, ''))
                      update(i, { btu: e.target.value === '' || !Number.isFinite(n) ? undefined : n })
                    }}
                    placeholder="12000"
                    aria-label={`BTU du modèle ${i + 1}`}
                  />
                )}
                {/* Le prix est saisi en chiffres bruts : un formatage automatique
                    pendant la frappe replacerait le curseur au mauvais endroit. */}
                <TextInput
                  inputMode="numeric"
                  value={v.price === 0 ? '' : String(v.price)}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/[^\d]/g, ''))
                    update(i, { price: Number.isFinite(n) ? n : 0 })
                  }}
                  placeholder="180000"
                  aria-label={`Prix du modèle ${i + 1}`}
                />
                <Button
                  variant="danger"
                  onClick={() => remove(i)}
                  aria-label={`Supprimer ${v.label || `le modèle ${i + 1}`}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Ce qui distingue vraiment les modèles : poids, dimensions,
                  code produit, code-barres. Ce sont ces lignes que le vendeur
                  lit sur le carton, et elles s'affichent sur la fiche à la
                  place du tableau commun. */}
              <p className="mt-3 mb-1.5 text-xs text-text-muted">Fiche technique du modèle</p>
              <SpecEditor
                value={v.specs ?? {}}
                onChange={(specs) => update(i, { specs })}
              />

              <div className="mt-3">
                <TextInput
                  value={v.warning ?? ''}
                  onChange={(e) => update(i, { warning: e.target.value })}
                  placeholder="Avertissement de manutention (facultatif)"
                  aria-label={`Avertissement du modèle ${i + 1}`}
                />
              </div>
            </div>
          ))}
        </>
      )}

      <Button onClick={add}>
        <Plus className="h-3.5 w-3.5" /> Ajouter un modèle
      </Button>
    </div>
  )
}

export default function ProductsTab({ notify }: { notify: Notify }) {
  const {
    products, categories, productBadges, saveProduct, setProductSlot,
    deleteProduct, toggleProduct, refresh,
  } = useStore()

  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [showHidden, setShowHidden] = useState(false)
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [slotBusy, setSlotBusy] = useState<string | null>(null)
  const [tab, setTab] = useState<ProductTabId>('essentiel')
  /** Vrai dès que l'utilisateur saisit l'identifiant lui-même. */
  const [slugTouched, setSlugTouched] = useState(false)

  /** Combien de fiches sont retirées du site, toutes catégories confondues. */
  const hiddenCount = useMemo(() => products.filter((p) => !p.is_active).length, [products])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      /*
       * « Masqués » est un FILTRE, pas une case « tout afficher ».
       *
       * C'était le défaut : allumé, il AJOUTAIT les fiches masquées à la liste
       * publiée. Sur un catalogue où une seule fiche est retirée, l'écran
       * paraissait ne rien faire — et l'utilisateur ne pouvait pas savoir si
       * le filtre avait agi ou si aucune fiche n'était masquée.
       *
       * Les deux vues sont donc exclusives : éteint on voit ce qui est en
       * ligne, allumé on ne voit QUE ce qui ne l'est pas — c'est-à-dire la vue
       * depuis laquelle on va rechercher une fiche pour la remettre en ligne.
       */
      if (showHidden !== !p.is_active) return false
      if (cat !== 'all' && p.category_id !== cat) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.ref_ ?? '').toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      )
    })
  }, [products, search, cat, showHidden])

  /**
   * Ce qu'il faut pour publier une fiche, coché ou non.
   *
   * Affiché en haut de l'onglet « Essentiel » : quatre pastilles disent d'un
   * regard ce qui manque. Sans cela, un produit sans image ou sans catégorie
   * s'enregistre sans broncher et n'apparaît nulle part — le vendeur ne
   * comprend pas pourquoi.
   */
  const readiness = useMemo(() => [
    { label: 'Nom', ok: Boolean(editing?.name?.trim()) },
    { label: 'Identifiant d’URL', ok: Boolean(editing?.slug?.trim()) },
    { label: 'Prix', ok: Number(editing?.price ?? 0) > 0 },
    { label: 'Catégorie', ok: Boolean(editing?.category_id) },
    { label: 'Image', ok: Boolean(editing?.image) },
  ], [editing])

  /** Le climatiseur est la seule gamme à parler en puissances et en BTU. */
  const showPower = useMemo(() => {
    const slug = categories.find((c) => c.id === editing?.category_id)?.slug ?? ''
    return slug.includes('climatiseur')
  }, [categories, editing?.category_id])

  const variantCount = editing?.variants?.length ?? 0

  /**
   * Le contenu de chaque onglet, décrit une fois pour le rendu.
   *
   * `attention` allume un point ambre : c'est le seul endroit du formulaire qui
   * signale une fiche incomplète, et il fonctionne même sur un onglet fermé.
   */
  const productTabs: ModalTab[] = useMemo(() => [
    {
      id: 'essentiel',
      label: 'Essentiel',
      icon: <Tag className="h-3.5 w-3.5" />,
      attention: !editing?.name?.trim() || !editing?.slug?.trim(),
    },
    {
      id: 'visuels',
      label: 'Visuels',
      icon: <Camera className="h-3.5 w-3.5" />,
      hint: editing?.image ? undefined : 'aucune',
      attention: !editing?.image,
    },
    {
      id: 'textes',
      label: 'Descriptions',
      icon: <AlignLeft className="h-3.5 w-3.5" />,
      hint: (editing?.features?.length ?? 0) > 0 ? `${editing?.features?.length} points` : undefined,
    },
    {
      id: 'modeles',
      label: 'Modèles',
      icon: <Layers className="h-3.5 w-3.5" />,
      hint: variantCount > 0 ? `${variantCount} modèles` : 'unique',
    },
    {
      id: 'publication',
      label: 'Publication',
      icon: <Eye className="h-3.5 w-3.5" />,
      attention: editing?.is_active === false,
    },
  ], [editing?.name, editing?.slug, editing?.image, editing?.features?.length, editing?.is_active, variantCount])

  /** Ouvre le formulaire sur son premier onglet, à chaque fois. */
  const openEditor = (next: Partial<Product>) => {
    setTab('essentiel')
    setEditing(next)
  }

  const save = async () => {
    if (!editing) return
    // Un produit sans identifiant s'enregistre sans erreur, mais sa fiche
    // devient /produit/ — une adresse morte, invisible pour le visiteur qui
    // clique sur la tuile. On refuse donc d'enregistrer plutôt que de créer
    // une page que personne n'atteindra.
    const slug = (editing.slug ?? '').trim()
    if (!slug) {
      // On RAMÈNE l'utilisateur sur l'onglet fautif : le champ manquant peut
      // être dans un onglet qu'il n'a pas ouvert, et un message d'erreur seul
      // le laisserait chercher.
      setTab('essentiel')
      notify({ message: "Renseignez l'identifiant d'URL (le nom suffit : il se remplit tout seul).", tone: 'error' })
      return
    }
    /*
     * Référence fabricant : deux lettres pour la famille, le diamètre en
     * pouces, puis un suffixe — d'où FS40-1688, FW45-810R. Une fiche Continental
     * sans référence est inexploitable en magasin comme en service après-vente.
     *
     * Générée seulement pour une création : une référence existe une fois
     * pour toutes, la changer ferait perdre les liens déjà diffusés.
     */
    const ref = (editing.ref_ ?? '').trim() || makeRef(editing.name ?? '', editing.category_id ?? '')

    setSaving(true)
    const error = await saveProduct({ ...editing, ref_: ref, slug: slugify(slug) })
    setSaving(false)
    if (error) { notify({ message: error, tone: 'error' }); return }
    notify({ message: editing.id ? 'Produit enregistré.' : 'Produit créé.' , tone: 'ok' })
    setEditing(null)
    await refresh()
  }

  /**
   * Pose ou retire une rubrique.
   *
   * L'écriture passe par `set_slot()`, qui applique les règles de places : une
   * rubrique unique n'est portée que par un produit, et poser celle-ci sur un
   * autre libère l'ancienne. On ne tente donc PAS de vérifier la place libre
   * avant d'appeler — la base est seule juge, et le message d'erreur qu'elle
   * renvoie est plus juste que celui qu'un formulaire aurait inventé.
   */
  const toggleSlot = async (slot: string, label: string, held: boolean) => {
    if (!editing?.slug) return
    setSlotBusy(slot)
    const error = await setProductSlot(editing.slug, held ? null : slot, label)
    setSlotBusy(null)
    notify(error
      ? { message: error, tone: 'error' }
      : { message: held ? `Rubrique « ${label} » retirée.` : `Rubrique « ${label} » attribuée.`, tone: 'ok' })
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
    const masked = patch.is_active === false
    await refresh()
    /*
     * Une fiche masquée quitte la liste en cours : sans confirmation, l'écran
     * est indiscernable d'une suppression. Le message dit donc l'effet réel,
     * et où retrouver la fiche pour la remettre en ligne.
     */
    notify({
      message: masked
        ? `« ${p.name} » est masqué : il disparaît du site. Retrouvez-le avec le filtre « Masqués uniquement ».`
        : `« ${p.name} » est de nouveau visible sur le site.`,
      tone: 'ok',
    })
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
            {/* Le compteur est la partie qui manquait : il dit d'un coup d'œil
                combien de fiches sont hors ligne, et donc si basculer ce filtre
                peut changer quelque chose. À zéro, la liste est forcément
                identique — ce n'est pas une panne. */}
            <Toggle
              checked={showHidden}
              onChange={setShowHidden}
              label={hiddenCount > 0 ? `Masqués uniquement (${hiddenCount})` : 'Masqués uniquement'}
            />

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

            <Button variant="primary" onClick={() => { setSlugTouched(false); openEditor({ ...BLANK }) }}>
              <Plus className="h-4 w-4" /> Nouveau
            </Button>
          </div>
        </div>
      </Card>

      {/* ── édition ──────────────────────────────────────────────────────
          Une vraie fenêtre modale : elle ne recouvre plus tout l'écran du
          téléphone, ses onglets rangent les quarante champs, et son pied reste
          visible pour que « Enregistrer » ne se cherche pas. */}
      {editing && (
        <Modal
          size="xl"
          labelledBy="produit-titre"
          title={editing.id ? `Modifier — ${editing.name || 'sans nom'}` : 'Nouveau produit'}
          subtitle={
            editing.id
              ? `Adresse de la fiche : /produit/${editing.slug}`
              : 'Un nom et un prix suffisent pour commencer.'
          }
          onClose={() => setEditing(null)}
          tabs={<Tabs tabs={productTabs} active={tab} onChange={(id) => setTab(id as ProductTabId)} />}
          footer={
            <div className="flex items-center justify-between gap-3">
              <p className="hidden text-xs text-text-muted sm:block">{TAB_HELP[tab]}</p>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button className="flex-1 sm:flex-none" onClick={() => setEditing(null)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1 sm:flex-none"
                  variant="primary"
                  onClick={save}
                  disabled={saving || !editing.name}
                >
                  {saving ? 'Enregistrement…' : editing.id ? 'Enregistrer' : 'Créer le produit'}
                </Button>
              </div>
            </div>
          }
        >
          {/* ── 1. Essentiel ── */}
          {tab === 'essentiel' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-bg-secondary p-3">
                <span className="admin-label mr-1">Pour publier</span>
                {readiness.map((r) => (
                  <Pill key={r.label} tone={r.ok ? 'ok' : 'neutral'}>
                    {r.ok
                      ? <Check className="mr-1 h-3 w-3" />
                      : <Circle className="mr-1 h-2.5 w-2.5" />}
                    {r.label}
                  </Pill>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom">
                  <TextInput
                    value={editing.name ?? ''}
                    onChange={(e) => {
                      const name = e.target.value
                      // Tant que l'identifiant n'a pas été saisi à la main, il
                      // suit le nom. Dès qu'il est touché, on n'y touche plus.
                      const slug = slugTouched ? editing.slug : slugify(name)
                      setEditing({ ...editing, name, slug })
                    }}
                  />
                </Field>
                <Field label="Référence" hint="Référence fabricant affichée sur la fiche.">
                  <TextInput
                    value={editing.ref_ ?? ''}
                    onChange={(e) => setEditing({ ...editing, ref_: e.target.value })}
                  />
                </Field>
                <Field label="Prix (FCFA)" hint="0 affiche « Prix sur demande ».">
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
                  hint="Utilisé dans l'adresse de la fiche. Rempli depuis le nom ; modifiable.">
                  <TextInput
                    value={editing.slug ?? ''}
                    onChange={(e) => {
                      setSlugTouched(true)
                      setEditing({ ...editing, slug: slugify(e.target.value) })
                    }}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── 2. Visuels ── */}
          {tab === 'visuels' && (
            <div className="space-y-5">
              <ImagePicker
                label="Image principale"
                value={editing.image ?? null}
                onChange={(next) => setEditing({ ...editing, image: next })}
                hint="Choisissez dans la médiathèque, ou saisissez un chemin /products/…"
              />

              <Field label="Texte alternatif de l'image" hint="Décrit l'image pour les lecteurs d'écran et pour Google.">
                <TextInput
                  value={editing.image_alt ?? ''}
                  onChange={(e) => setEditing({ ...editing, image_alt: e.target.value })}
                  placeholder="Ventilateur Continental sur pied dans un salon"
                />
              </Field>

              <Field label="Galerie" hint="Chemin ou URL par ligne. La première sert de vignette.">
                <LineList
                  value={editing.images ?? []}
                  onChange={(images) => setEditing({ ...editing, images })}
                  placeholder="/products/mon-image.jpg"
                  addLabel="Ajouter une image"
                />
              </Field>
            </div>
          )}

          {/* ── 3. Descriptions ── */}
          {tab === 'textes' && (
            <div className="space-y-5">
              <Field label="Description courte" hint="Une phrase, affichée sous le nom dans le catalogue.">
                <TextArea
                  rows={3}
                  value={editing.short_desc ?? ''}
                  onChange={(e) => setEditing({ ...editing, short_desc: e.target.value })}
                />
              </Field>
              <Field label="Description complète" hint="Séparez les paragraphes par une ligne vide.">
                <TextArea
                  rows={5}
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </Field>

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
            </div>
          )}

          {/* ── 4. Modèles ── */}
          {tab === 'modeles' && (
            <div className="space-y-4">
              <p className="rounded-2xl bg-bg-secondary p-3 text-xs leading-relaxed text-text-body">
                Plusieurs tailles ou puissances sous une même fiche : le visiteur
                les choisit sur la page produit, et chaque modèle garde son propre
                prix. Un modèle n&apos;est retenu que s&apos;il a un libellé ET un prix.
                Laissez vide pour un modèle unique.
              </p>
              <VariantsEditor
                value={editing.variants ?? []}
                onChange={(variants) => setEditing({ ...editing, variants })}
                basePrice={editing.price ?? 0}
                showPower={showPower}
              />
            </div>
          )}

          {/* ── 5. Publication ── */}
          {tab === 'publication' && (
            <div className="space-y-4">
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

              <SlotPicker
                slug={editing.slug ?? ''}
                badges={productBadges}
                productName={(s) => products.find((p) => p.slug === s)?.name ?? s}
                onToggle={toggleSlot}
                busy={slotBusy as never}
              />
            </div>
          )}
        </Modal>
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
                : showHidden
                  /* Filtre « masqués » allumé et liste vide : c'est une
                     information, pas une absence de contenu — tout est en
                     ligne, rien n'a été retiré. */
                  ? 'Aucune fiche n’est masquée : tout le catalogue est en ligne.'
                  : 'Créez un premier produit pour remplir le catalogue.'
            }
            action={
              <Button variant="primary" onClick={() => { setSlugTouched(false); openEditor({ ...BLANK }) }}>
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
                        {/* La fiche déclinée n'a qu'une carte au catalogue :
                            sans cette pastille, rien ne dit au vendeur que
                            trois modèles se cachent derrière. */}
                        {(p.variants?.length ?? 0) > 1 && <Pill>{p.variants?.length} modèles</Pill>}
                      </div>
                    </Td>
                    <Td label="" className="justify-end">
                      <div className="flex gap-1.5">
                        <Button onClick={() => { setSlugTouched(true); openEditor({ ...p }) }} aria-label="Modifier">
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
                  {(p.variants?.length ?? 0) > 1 && <Pill>{p.variants?.length} modèles</Pill>}
                </div>
                <h4 className="font-heading text-base font-bold leading-tight">{p.name}</h4>
                <p className="text-xs text-text-muted">{p.ref_ ?? '—'}</p>
                <p className="mt-1 font-heading text-lg font-bold">{formatFcfa(p.price)}</p>

                <div className="mt-auto flex gap-2 border-t border-border pt-3">
                  <Button onClick={() => { setSlugTouched(true); openEditor({ ...p }) }} className="flex-1">
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
