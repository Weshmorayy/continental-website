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

import type { Product } from '@/data/products'
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

function categoryFromSlug(slug: string | null): Product['category'] {
  if (!slug) return 'ventilateur-pied'
  if (slug.includes('climat')) return 'climatiseur'
  if (slug.includes('sol') || slug.includes('industri')) return 'ventilateur-sol'
  return 'ventilateur-pied'
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

/** Un produit par son slug, avec repli local. */
export async function getSiteProduct(slug: string): Promise<Product | undefined> {
  const content = await fetchAdminContent()

  if (content) {
    const found = content.products.find((p) => p.slug === slug)
    if (found) return toSiteProduct(found, 0)
  }
  return localProducts.find((p) => p.slug === slug)
}

/** Bannières d'un emplacement. */
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
export async function getSiteCategories() {
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
  icon: string | null; num: string | null; data: Record<string, unknown> | null
}

function toBlock(r: BlockRow): ContentBlock {
  return {
    slot: r.slot, key: r.key,
    eyebrow: r.eyebrow, title: r.title, subtitle: r.subtitle, body: r.body,
    meta: r.meta, ctaLabel: r.cta_label, ctaHref: r.cta_href,
    image: r.image, imageAlt: r.image_alt, icon: r.icon, num: r.num,
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
  }
  const rows = await supabaseGet<Row[]>(
    'products?select=slug,name,ref_,price,image,image_alt,short_desc,description,' +
    'features,specs,badge,in_stock,is_featured,category_id&is_active=eq.true' +
    '&order=position.asc',
  )
  if (!rows?.length) return []

  const cats = await supabaseGet<{ id: string; slug: string }[]>('categories?select=id,slug')
  const catById = new Map((cats ?? []).map((c) => [c.id, c.slug]))

  return rows.map((r) => ({
    id: r.slug,
    slug: r.slug,
    name: r.name,
    ref: r.ref_ ?? '',
    category: categoryFromSlug(catById.get(r.category_id ?? '') ?? null),
    categoryLabel: catById.get(r.category_id ?? '') ?? 'Produit',
    price: Number(r.price) || 0,
    image: r.image ?? '',
    images: r.image ? [r.image] : [],
    features: r.features?.length ? r.features : [r.short_desc ?? ''].filter(Boolean),
    specs: toStringRecord(r.specs ?? {}),
    badge: r.badge ?? undefined,
    inStock: r.in_stock !== false,
    isBestseller: r.is_featured === true,
  }))
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
