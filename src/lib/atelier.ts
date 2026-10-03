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
export async function getSiteProducts(): Promise<{
  products: Product[]
  source: 'admin' | 'local'
}> {
  const content = await fetchAdminContent()

  if (content && content.products.length > 0) {
    return { products: content.products.map(toSiteProduct), source: 'admin' }
  }
  return { products: localProducts, source: 'local' }
}

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