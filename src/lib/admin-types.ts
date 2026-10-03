/**
 * admin-types.ts — Formes des données de l'administration Continental®.
 *
 * Volontairement SEPARÉ de `src/types/index.ts`, qui décrit le catalogue
 * statique du site public (`src/data/products.ts`). Les deux ne doivent pas
 * être confondus : le site public lit ses données dans des fichiers, le
 * portail les lit dans Supabase, et les colonnes ne se ressemblent pas.
 *
 * Ces types décrivent les COLONNES RÉELLEMENT présentes en base
 * (`supabase/001_schema.sql`). Le nom `ref_` n'est pas une faute de frappe :
 * `ref` est un mot réservé en SQL, la colonne a donc dû être renommée.
 */

export interface Category {
  id: string
  slug: string
  label: string
  kind: 'physical' | 'service'
  position: number
  image: string | null
  intro: string | null
}

export interface Product {
  id: string
  slug: string
  name: string
  ref_: string | null
  sku: string | null
  category_id: string | null

  price: number
  compare_at: number | null

  image: string | null
  image_alt: string | null
  images: string[]

  short_desc: string | null
  description: string | null

  features: string[]
  /** Tableau technique : { "Puissance": "55W", … } */
  specs: Record<string, string>

  badge: string | null
  in_stock: boolean
  /** Visible publiquement. Distinct de `in_stock` : visible mais en rupture. */
  is_active: boolean
  is_featured: boolean

  position: number
  views: number

  created_at: string
  updated_at: string

  /** Renseigné par les requêtes qui font la jointure catégories. */
  category?: Category | null
}

export interface Banner {
  id: string
  slot: string
  tag: string | null
  title: string
  subtitle: string | null
  image: string | null
  image_alt: string | null
  cta_label: string | null
  cta_href: string | null
  object_position: string
  active: boolean
  position: number
}

export interface ShippingZone {
  id: string
  slug: string
  name: string
  price: number
  delay: string
  position: number
}

export interface Faq {
  id: string
  question: string
  answer: string
  category: string | null
  position: number
}

export type OrderStatus =
  | 'new' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  productId: string
  slug?: string
  name: string
  ref?: string | null
  price: number
  quantity: number
  image?: string | null
}

export interface Order {
  id: string
  ref_command: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_address: string | null

  shipping_zone_id: string | null
  shipping_zone_name: string | null
  shipping_cost: number
  subtotal: number
  total_amount: number

  items: OrderItem[]

  payment_method: string
  payment_status: PaymentStatus
  order_status: OrderStatus

  notes: string | null
  created_at: string
  updated_at: string
}

export type LeadStatus = 'new' | 'in_progress' | 'done' | 'spam'
export type LeadKind = 'contact' | 'devis' | 'newsletter' | 'whatsapp_order'

export interface Lead {
  id: string
  kind: LeadKind
  name: string | null
  phone: string | null
  email: string | null
  city: string | null
  message: string | null
  product_id: string | null
  payload: Record<string, unknown>
  status: LeadStatus
  created_at: string
  product?: Pick<Product, 'id' | 'name' | 'slug'> | null
}

export interface SiteSettings {
  id: number
  contact: Record<string, string>
  social: Record<string, string>
  hours: Record<string, string>
  seo: Record<string, unknown>
  payments: Record<string, boolean>
  delivery: Record<string, unknown>
  legal: Record<string, string>
  homepage: Record<string, unknown>
  updated_at: string
}

export interface MediaAsset {
  id: string
  path: string
  url: string
  mime: string
  size: number
  width: number | null
  height: number | null
  folder: string
  alt: string | null
  created_at: string
}

export interface SiteBackup {
  id: string
  backup_name: string
  products_data: Product[]
  banners_data: Banner[]
  shipping_data: ShippingZone[]
  faqs_data: Faq[]
  contact_data: Record<string, string>
  social_data: Record<string, string>
  created_at: string
}

/* ─────────────────────────────── libellés français ────────────────────── */

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Nouvelle',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'En attente',
  paid: 'Payée',
  failed: 'Échouée',
  refunded: 'Remboursée',
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'Nouvelle',
  in_progress: 'En cours',
  done: 'Traitée',
  spam: 'Indésirable',
}

export const LEAD_KIND_LABEL: Record<LeadKind, string> = {
  contact: 'Contact',
  devis: 'Devis',
  newsletter: 'Newsletter',
  whatsapp_order: 'Commande WhatsApp',
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  wave: 'Wave',
  orange_money: 'Orange Money',
  free_money: 'Free Money',
  cash: 'Espèces',
}