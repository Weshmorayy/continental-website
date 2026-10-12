/**
 * atelier.ts — Passerelle entre l'administration et le site Continental.
 *
 * PRINCIPE : le site ne sait PAS qu'une base existe. Il appelle ce module, qui
 * expose exactement la forme que les composants attendent déjà. Le jour où le
 * contenu vient de l'admin, aucun composant n'a bougé.
 *
 * MODE `build` par défaut : le contenu est récupéré au build (SEO, vitesse,
 * hébergement statique). L'enregistrement dans l'admin déclenche un rebuild.
 *
 * REPLI : si l'admin est injoignable, on retombe sur les données locales
 * (`src/data/products.ts`, `src/config/site.ts`). Un site vitrine qui tombe
 * parce que l'API d'administration est lente serait pire qu'utile.
 */

import type { Product, ProductVariant } from '@/data/products'
import { resolveSettings, type ResolvedSettings, type DbSettings } from '@/lib/settings'
import { products as localProducts, categories as localCategories } from '@/data/products'

/** Slug du tenant Continental chez l'administration. */
const TENANT = process.env.ATELIER_TENANT ?? 'continental'

/** URL de l'admin. Vide = repli local systématique. */
const ADMIN_URL = (process.env.ATELIER_ADMIN_URL ?? '').replace(/\/+$/, '')

export interface AdminSettings {
  contact?: {
    phone?: string
    whatsapp?: string
    email?: string
    address?: string
    city?: string
    country?: string
  }
  hours?: { weekdays?: string; saturday?: string; sunday?: string }
  social?: { facebook?: string; instagram?: string; tiktok?: string }
}

export interface AdminContent {
  tenant: { slug: string; name: string; locale: string }
  modules: string[]
  theme: Record<string, unknown>
  settings: AdminSettings
  products: AdminProduct[]
  categories: { slug: string; label: string; position: number }[]
  banners: {
    slot: string; title: string | null; subtitle: string | null
    image: string | null; imageAlt: string | null
    ctaLabel: string | null; ctaHref: string | null; position: number
  }[]
  faqs: { question: string; answer: string }[]
  blogPosts: { slug: string; title: string; excerpt: string | null; cover: string | null }[]
}

export interface AdminProduct {
  slug: string
  name: string
  brand: string | null
  price: string
  compareAt: string | null
  image: string | null
  imageAlt: string | null
  shortDesc: string | null
  specs: Record<string, unknown>
  features: string[]
  badge: string | null
  inStock: boolean
  featuredSlot: string | null
  categorySlug: string | null
}

/** Le site est-il branché sur l'administration ? */
export const isConnected = Boolean(ADMIN_URL)

/**
 * Récupère le contenu. Ne lève jamais : en cas d'échec, indique le repli.
 * `revalidate` : 0 en build, 3600 en développement pour voir les changements.
 */
export async function fetchAdminContent(): Promise<AdminContent | null> {
  if (!ADMIN_URL) return null

  try {
    const res = await fetch(`${ADMIN_URL}/api/content/${TENANT}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 },
    })
    if (!res.ok) return null
    return (await res.json()) as AdminContent
  } catch {
    return null
  }
}

/* ─────────────────────────────────────────── conversion vers le site ── */

/**
 * Convertit un produit de l'admin vers la forme attendue par les composants
 * Continental. Le site ne dépend ainsi d'aucun champ de l'admin.
 */
function toSiteProduct(p: AdminProduct, index: number): Product {
  return {
    id: p.slug,
    slug: p.slug,
    name: p.name,
    ref: (p.specs?.ref as string) ?? p.slug.toUpperCase().slice(0, 12),
    category: categoryFromSlug(p.categorySlug),
    categoryLabel: p.categorySlug ?? 'Produit',
    price: Number(p.price) || 0,
    image: p.image ?? '/products/ventilateur-pied-fs4011.jpg',
    images: p.image ? [p.image] : [],
    features: p.features?.length ? p.features : [p.shortDesc ?? ''].filter(Boolean),
    specs: toStringRecord(p.specs),
    badge: p.badge ?? undefined,
    inStock: p.inStock,
    isBestseller: p.featuredSlot === 'hero' || index === 0,
  }
}

/**
 * Catégorie d'un produit, telle que la base la définit.
 *
 * Cette fonction reduisait le slug a trois valeurs figees :
 *
 *   `climatiseur` si le slug contient « climat », `ventilateur-sol` s'il
 *   contient « sol » ou « industri », `ventilateur-pied` DANS LES AUTRES CAS.
 *
 * Ce dernier cas est le defaut qui a casse le catalogue. Le slug `tv` ne
 * contient aucun de ces mots : un televiseur etait donc classe
 * « ventilateur-pied », et le filtre du catalogue le_RANGEait avec les
 * ventilateurs. Le meme sort revenait aux ventilateurs muraux et orbite,
 * qui ne contiennent ni « sol » ni « clim ». Un produit sans categorie
 * aurait, lui, ete range en « ventilateur-pied » sans un seul signal.
 *
 * Il n'y a rien a normaliser : la base porte deja le slug, et les filtres de
 * l'interface comparent des slugs. On le renvoie tel quel. Seule exception
 * maintenue, l'absence de categorie, qui doit rester affichable.
 */
function categoryFromSlug(slug: string | null): Product['category'] {
  return slug && slug.trim() !== '' ? slug.trim() : 'ventilateur-pied'
}

/** Les specs de l'admin peuvent être typées ; le site affiche des chaînes. */
function toStringRecord(specs: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(specs ?? {})) {
    if (v === null || v === undefined) continue
    out[k] = typeof v === 'object' ? JSON.stringify(v) : String(v)
  }
  return out
}

/* ─────────────────────────────────────────── API publique du site ── */

/**
 * Produits du site : contenu de l'admin si disponible, données locales sinon.
 * Utilisé par la page d'accueil, le catalogue et les fiches produit.
 */

/**
 * Un produit par son slug.
 *
 * ⚠ Elle passe volontairement par `getSiteProducts()`, donc par les MÊMES
 *   canaux que la liste du catalogue — Supabase compris.
 *
 *   Elle ne consultait jusqu'ici que le portail multi-clients et les fichiers
 *   du dépôt. Ces deux canaux ne répondent que si le site est branché sur
 *   l'administration Atelier, ce qui n'est pas le cas ici : un produit créé
 *   dans le portail Continental apparaissait alors dans le catalogue et sa
 *   fiche renvoyait un 404. Les six premiers produits fonctionnaient
 *   uniquement parce qu'ils sont aussi écrits dans `src/data/`.
 */
export async function getSiteProduct(slug: string): Promise<Product | undefined> {
  const { products } = await getSiteProducts()
  return products.find((p) => p.slug === slug)
}

/** Bannières d'un emplacement. */
/**
 * Réglages du site, RÉSOLUS depuis la base.
 *
 * Complète la série de getters qui lisaient le portail ou les fichiers mais
 * jamais Supabase — le même défaut que `getSiteProduct()` et
 * `getSiteCategories()`. Sans cette fonction, aucun réglage écrit dans
 * l'administration n'atteignait la vitrine : le numéro de WhatsApp modifié y
 * restait invisible, et tous les liens continuaient de pointer vers
 * l'ancien numéro.
 *
 * La lecture est faite avec la clé ANONYME : `site_settings` est lisible par
 * tous par conception (c'est la même donnée que celle publiée dans les balises
 * `LocalBusiness`), et la page doit pouvoir se rendre sans compte.
 *
 * Le repli est immédiat : base injoignable, ligne absente ou JSON invalide →
 * les valeurs par défaut du dépôt. Une page qui ne s'affiche pas parce qu'une
 * table est lente serait pire qu'une page qui affiche un numéro par défaut,
 * que l'administration remplacera dès le prochain enregistrement.
 */
export async function getSiteSettings(): Promise<ResolvedSettings> {
  const rows = await supabaseGet<DbSettings[]>('site_settings?select=*&id=eq.1&limit=1')
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row) return resolveSettings(null)
  return resolveSettings(row)
}

export async function getBanners(slot: string) {
  const content = await fetchAdminContent()
  if (!content) return []
  return content.banners.filter((b) => b.slot === slot).sort((a, b) => a.position - b.position)
}

/** FAQ, si le module est actif. */
export async function getFaqs() {
  const content = await fetchAdminContent()
  if (!content || !content.modules.includes('faq')) return []
  return content.faqs
}

/** Réglages éditables depuis l'admin, à fusionner avec siteConfig. */
export async function getAdminSettings(): Promise<AdminSettings | null> {
  const content = await fetchAdminContent()
  return content?.settings ?? null
}

/** Catégories, avec repli local. */
/**
 * Catégories du site : Supabase d'abord, portail multi-clients ensuite,
 * fichiers du dépôt en dernier.
 *
 * Elle ne lisait que les deux derniers canaux. Comme le portail Atelier n'est
 * pas configuré ici, la page catalogue retombait toujours sur les catégories
 * écrites dans les fichiers — celles d'avant la création du catalogue. Une
 * catégorie ajoutée dans l'administration n'apparaissait jamais : pas de
 * bouton « Téléviseurs » alors que le produit existe et s'affiche.
 */
export async function getSiteCategories() {
  const rows = await supabaseGet<{ slug: string; label: string; position: number }[]>(
    'categories?select=slug,label,position&order=position.asc',
  )
  if (rows?.length) return rows

  const content = await fetchAdminContent()
  if (content && content.categories.length > 0) return content.categories

  return localCategories.map((c) => ({ slug: c.id, label: c.label, position: 0 }))
}

/* ══════════════════════════════════════════════════════════════════════════
   SOURCE SUPABASE — le portail d'administration de ce projet
   ──────────────────────────────────────────────────────────────────────────
   `fetchAdminContent` interroge le portail multi-clients (`ATELIER_ADMIN_URL`).
   Continental dispose en plus de SON propre portail, adossé au projet Supabase
   `tbaizfoircknsznmpcvb`. Ce second canal lit la MÊME base que l'admin, ce qui
   garantit qu'une modification faite dans l'administration se retrouve ici.

   Lecture en `anon` : c'est public par nature, et ce n'est pas un problème —
   les politiques RLS de `supabase/002_rls.sql` et `005_content.sql` n'ouvrent
   que les blocs marqués `active`. Une clé `service_role` ici donnerait au
   serveur le droit de tout lire, y compris les commandes des clients.

   Même règle de repli que le canal ci-dessus : aucun échec ne doit casser un
   build. `buildBlocks()` renvoie alors les valeurs du fichier local.
   ══════════════════════════════════════════════════════════════════════════ */

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseSource = Boolean(SUPABASE_URL && SUPABASE_KEY)

export interface ContentBlock {
  slot: string
  key: string
  eyebrow: string | null
  title: string | null
  subtitle: string | null
  body: string | null
  meta: string | null
  ctaLabel: string | null
  ctaHref: string | null
  image: string | null
  imageAlt: string | null
  icon: string | null
  num: string | null
  /** Rang d'affichage. Deux blocs de rang égal sortent dans un ordre imprévisible
   *  côté Postgres : sans cette colonne, l'ordre des cartes de l'accueil peut
   *  changer d'un rendu à l'autre. */
  position: number
  data: Record<string, unknown>
}

/** Une lecture REST. Ne lève jamais. */
async function supabaseGet<T>(path: string): Promise<T | null> {
  if (!isSupabaseSource) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      // 0 en développement : un changement dans l'admin doit se voir en
      // rechargeant la page, sans attendre l'expiration du cache.
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

type BlockRow = {
  slot: string; key: string
  eyebrow: string | null; title: string | null; subtitle: string | null
  body: string | null; meta: string | null; cta_label: string | null
  cta_href: string | null; image: string | null; image_alt: string | null
  icon: string | null; num: string | null; position: number
  data: Record<string, unknown> | null
}

function toBlock(r: BlockRow): ContentBlock {
  return {
    slot: r.slot, key: r.key,
    eyebrow: r.eyebrow, title: r.title, subtitle: r.subtitle, body: r.body,
    meta: r.meta, ctaLabel: r.cta_label, ctaHref: r.cta_href,
    image: r.image, imageAlt: r.image_alt, icon: r.icon, num: r.num,
    position: r.position,
    data: r.data ?? {},
  }
}

/**
 * Blocs d'une section, triés par rang.
 * Ne renvoie `[]` que si la source est réellement vide — jamais en cas d'échec
 * réseau, où l'appelant retombera sur ses valeurs locales.
 */
export async function getBlocks(slot: string): Promise<ContentBlock[]> {
  const rows = await supabaseGet<BlockRow[]>(
    `content_blocks?select=*&slot=eq.${encodeURIComponent(slot)}&order=position.asc`,
  )
  return (rows ?? []).map(toBlock)
}

/** Un bloc précis, ou `null`. */
export async function getBlock(slot: string, key: string): Promise<ContentBlock | null> {
  const rows = await supabaseGet<BlockRow[]>(
    `content_blocks?select=*&slot=eq.${encodeURIComponent(slot)}` +
    `&key=eq.${encodeURIComponent(key)}&limit=1`,
  )
  return rows?.[0] ? toBlock(rows[0]) : null
}

/** Produits publiés, convertis vers la forme attendue par les composants. */
export async function getSupabaseProducts(): Promise<Product[]> {
  type Row = {
    slug: string; name: string; ref_: string | null; price: number
    image: string | null; image_alt: string | null; short_desc: string | null
    description: string | null; features: string[] | null
    specs: Record<string, unknown> | null; badge: string | null
    in_stock: boolean; is_featured: boolean
    category_id: string | null
    variants: unknown
  }
  const rows = await supabaseGet<Row[]>(
    'products?select=slug,name,ref_,price,image,image_alt,short_desc,description,' +
    'features,specs,badge,in_stock,is_featured,category_id,variants&is_active=eq.true' +
    '&order=position.asc',
  )
  if (!rows?.length) return []

  /*
   * On lit le LIBELLÉ en même temps que le slug.
   *
   * La requête ne demandait que `id,slug`, et le mapping s'en servait comme
   * libellé : chaque vignette affichait donc « ventilateur-sur-pied » au-dessus
   * du nom du produit, à la place de « Ventilateurs sur pied ». Le slug reste
   * nécessaire — c'est lui qui rapproche les produits d'une même gamme — mais
   * il n'a rien à faire à l'écran.
   */
  const cats = await supabaseGet<{ id: string; slug: string; label: string }[]>(
    'categories?select=id,slug,label',
  )
  const catById = new Map((cats ?? []).map((c) => [c.id, c]))

  /*
   * Les rubriques sont relues à part puis rapprochées par slug. La vue
   * `public_product_badges` filtre déjà les badges hors période : une
   * promotion échue disparaît du site sans qu'aucune ligne ne soit supprimée.
   * `supabaseGet` rend déjà `null` au moindre échec réseau ou HTTP : le
   * catalogue s'affiche alors normalement, simplement sans rubrique, ce qui est
   * préférable à une page blanche pour un problème de pastille.
   */
  const badgeRows = await supabaseGet<{ slug: string; slot: string; label: string }[]>(
    'public_product_badges?select=slug,slot,label',
  )
  const badgesBySlug = new Map<string, { slot: string; label: string }[]>()
  for (const b of badgeRows ?? []) {
    const list = badgesBySlug.get(b.slug) ?? []
    list.push({ slot: b.slot, label: b.label })
    badgesBySlug.set(b.slug, list)
  }

  return rows.map((r) => ({
    id: r.slug,
    slug: r.slug,
    name: r.name,
    ref: r.ref_ ?? '',
    category: categoryFromSlug(catById.get(r.category_id ?? '')?.slug ?? null),
    categoryLabel: catById.get(r.category_id ?? '')?.label ?? 'Produit',
    price: Number(r.price) || 0,
    image: r.image ?? '',
    images: r.image ? [r.image] : [],
    features: r.features?.length ? r.features : [r.short_desc ?? ''].filter(Boolean),
    /*
     * Les deux textes étaient récupérés par la requête mais jamais reportés
     * dans l'objet produit : la fiche n'affichait ni l'accroche ni la
     * description. Ils sont transmis par le mapping, pas relus à la demande.
     */
    shortDesc: r.short_desc ?? '',
    description: r.description ?? '',
    specs: toStringRecord(r.specs ?? {}),
    badge: r.badge ?? undefined,
    badges: sortBadges(badgesBySlug.get(r.slug) ?? []),
    inStock: r.in_stock !== false,
    isBestseller: r.is_featured === true,
    variants: toVariants(r.variants),
  }))
}

/**
 * Variantes de modèle lues depuis `products.variants`.
 *
 * La colonne est du JSON libre : une ligne écrite à la main, ou héritée d'une
 * version antérieure du schéma, peut contenir n'importe quoi. On ne fait donc
 * pas confiance à sa forme — une variante sans identifiant, sans libellé ou
 * sans prix est ÉCARTÉE plutôt que de produire un bouton qui n'ajouterait rien
 * au panier, ou pire, un prix à 0 FCFA sur la fiche.
 */
function toVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((v) => {
    if (!v || typeof v !== 'object') return []
    const o = v as Record<string, unknown>
    const id = typeof o.id === 'string' ? o.id : ''
    const label = typeof o.label === 'string' ? o.label : ''
    const price = Number(o.price)
    if (!id || !label || !Number.isFinite(price) || price <= 0) return []
    const btu = Number(o.btu)
    return [{
      id,
      label,
      price,
      power: typeof o.power === 'string' ? o.power : undefined,
      btu: Number.isFinite(btu) ? btu : undefined,
      // Le tableau du modèle passe par le même assainissement que celui de la
      // fiche : des clés vides ou non textuelles produiraient des lignes
      // fantômes dans le tableau technique.
      specs: o.specs && typeof o.specs === 'object'
        ? toStringRecord(o.specs as Record<string, unknown>)
        : undefined,
      warning: typeof o.warning === 'string' && o.warning.trim() !== ''
        ? o.warning.trim()
        : undefined,
    }]
  })
}

/**
 * Ordre d'affichage des pastilles quand un produit en porte plusieurs.
 *
 * Une promotion se dit avant un label de qualité : « -15 % » et « Télécommande »
 * sur la même vignette, c'est deux pastilles se disputant la même ligne. La
 * promotion passe donc devant, parce que c'est elle qui décide de l'achat.
 */
const BADGE_ORDER = ['promo', 'stock_limite', 'nouveau', 'bestseller', 'hero']

function sortBadges(list: { slot: string; label: string }[]) {
  return [...list].sort(
    (a, b) => BADGE_ORDER.indexOf(a.slot) - BADGE_ORDER.indexOf(b.slot),
  )
}

/**
 * Produit occupant une place précise — « héros » ou « meilleur-vendu ».
 *
 * C'est ce qui remplace les slugs écrits en dur dans les blocs de contenu.
 * Une place est une place : la base garantit qu'une seule ligne la porte, donc
 * il n'y a plus de produit de remplacement oublié quelque part, avec son prix
 * de maquette et ses arguments de vente inventés.
 */
export async function getSlotProduct(
  slot: string,
): Promise<{ product: Product; label: string } | null> {
  const { products } = await getSiteProducts()
  for (const p of products) {
    const badge = p.badges?.find((b) => b.slot === slot)
    if (badge) return { product: p, label: badge.label }
  }
  return null
}

/**
 * Produits du site : Supabase d'abord, portail multi-clients ensuite, fichiers
 * locaux en dernier. `source` indique le canal utilisé, pour l'afficher dans
 * l'administration — un site qui affiche du contenu périmé sans le dire est
 * impossible à diagnostiquer.
 */
export async function getSiteProducts(): Promise<{
  products: Product[]
  source: 'supabase' | 'admin' | 'local'
}> {
  const remote = await getSupabaseProducts()
  if (remote.length > 0) return { products: remote, source: 'supabase' }

  const content = await fetchAdminContent()
  if (content && content.products.length > 0) {
    return { products: content.products.map(toSiteProduct), source: 'admin' }
  }
  return { products: localProducts, source: 'local' }
}
