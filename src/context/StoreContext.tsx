'use client'

/**
 * StoreContext.tsx — Source unique des données Continental®.
 *
 * Un seul client Supabase pour toute l'application. Le contexte charge le
 * contenu public au démarrage, et réserve les tables privées (commandes,
 * demandes, médiathèque, sauvegardes) à l'administration authentifiée :
 * RLS les refuserait à un visiteur, inutile donc de les demander.
 *
 * Règle de conception : `save*` RENVOIE une erreur en cas d'échec et ne lève
 * jamais une exception que l'appelant pourrait ignorer. L'admin affiche le
 * message ; il n'affiche jamais « enregistré » sur une écriture refusée.
 */

import React, {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured, storageBucket } from '@/lib/supabase'
import type {
  Product, Category, Banner, ShippingZone, Faq, Order, Lead,
  SiteSettings, MediaAsset, SiteBackup, OrderStatus, PaymentStatus,
  LeadStatus, LeadKind,
} from '@/lib/admin-types'

/* ─────────────────────────────────────────────────── valeurs de repli ──── */

const EMPTY_SETTINGS: SiteSettings = {
  id: 1,
  contact: {}, social: {}, hours: {}, seo: {}, payments: {},
  delivery: {}, legal: {}, homepage: {}, updated_at: '',
}

interface StoreValue {
  /* état */
  loading: boolean
  supabaseEnabled: boolean
  session: Session | null
  authEmail: string | null
  /** `false` tant que l'appartenance à `site_admins` n'est pas confirmée. */
  isAdmin: boolean

  /* contenu public */
  products: Product[]
  categories: Category[]
  banners: Banner[]
  shippingZones: ShippingZone[]
  faqs: Faq[]
  settings: SiteSettings

  /* contenu privé */
  orders: Order[]
  leads: Lead[]
  media: MediaAsset[]
  backups: SiteBackup[]

  /* auth */
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>

  /* écritures admin */
  saveProduct: (p: Partial<Product> & { id?: string }) => Promise<string | null>
  deleteProduct: (id: string) => Promise<string | null>
  toggleProduct: (id: string, patch: Partial<Product>) => Promise<string | null>
  saveCategory: (c: Partial<Category> & { id?: string }) => Promise<string | null>
  deleteCategory: (id: string) => Promise<string | null>
  saveBanner: (b: Partial<Banner> & { id?: string }) => Promise<string | null>
  deleteBanner: (id: string) => Promise<string | null>
  saveShippingZone: (z: Partial<ShippingZone> & { id?: string }) => Promise<string | null>
  deleteShippingZone: (id: string) => Promise<string | null>
  saveFaq: (f: Partial<Faq> & { id?: string }) => Promise<string | null>
  deleteFaq: (id: string) => Promise<string | null>
  saveSettings: (patch: Partial<SiteSettings>) => Promise<string | null>
  updateOrderStatus: (id: string, patch: { order_status?: OrderStatus; payment_status?: PaymentStatus; notes?: string | null }) => Promise<string | null>
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<string | null>
  deleteLead: (id: string) => Promise<string | null>

  /* médias */
  uploadImage: (file: File, folder?: string) => Promise<string | null>
  deleteMedia: (id: string) => Promise<string | null>

  /* sauvegardes */
  createBackup: (name: string) => Promise<string | null>
  restoreBackup: (id: string) => Promise<string | null>
  deleteBackup: (id: string) => Promise<string | null>

  /* ── écritures publiques (visiteur) ── */
  submitLead: (input: { kind: LeadKind; name?: string; phone?: string; email?: string; city?: string; message?: string; productId?: string }) => Promise<string | null>
  placeOrder: (input: {
    customer: { name: string; phone: string; email?: string; address?: string }
    items: { productId: string; name: string; price: number; quantity: number; image?: string | null }[]
    shippingZone?: ShippingZone | null
    paymentMethod: string
    notes?: string
  }) => Promise<{ token: string | null; ref: string | null; error: string | null }>

  refresh: () => Promise<void>
}

const StoreContext = createContext<StoreValue | null>(null)

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore doit être utilisé dans <StoreProvider>')
  return ctx
}

/** Traduit une erreur PostgREST en français exploitable par l'administrateur. */
function frError(error: { code?: string; message: string } | null): string {
  if (!error) return 'Erreur inconnue.'
  if (error.code === '42501') {
    return "Accès refusé par la base. Soit le compte n'est pas administrateur, soit la connexion a expiré."
  }
  if (error.code === '23505') return 'Cet élément existe déjà (doublon sur un champ unique).'
  if (error.code === '23503') return 'Référence invalide : la catégorie liée n’existe plus.'
  if (error.code === '23514') return 'Valeur refusée par la base (contrainte).'
  return error.message
}

const safe = <T,>(value: unknown, fallback: T): T =>
  value === null || value === undefined ? fallback : (value as T)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [settings, setSettings] = useState<SiteSettings>(EMPTY_SETTINGS)

  const [orders, setOrders] = useState<Order[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [backups, setBackups] = useState<SiteBackup[]>([])

  /* ────────────────────────────────────────── contenu public ─────────── */

  const loadPublic = useCallback(async () => {
    if (!supabase) return

    const [p, c, b, s, f, st] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(id, slug, label, kind, position, image, intro)')
        .order('position', { ascending: true }),
      supabase.from('categories').select('*').order('position', { ascending: true }),
      supabase.from('banners').select('*').order('position', { ascending: true }),
      supabase.from('shipping_zones').select('*').order('position', { ascending: true }),
      supabase.from('faqs').select('*').order('position', { ascending: true }),
      supabase.from('site_settings').select('*').limit(1),
    ])

    // Une seule alerte : la page doit rester lisible même si une table manque.
    const failed = [p, c, b, s, f, st].find((r) => r.error)
    if (failed) console.error('[Continental] chargement public :', frError(failed.error))

    setProducts((p.data ?? []).map((x) => ({
      ...x,
      price: Number(x.price),
      compare_at: x.compare_at === null ? null : Number(x.compare_at),
      features: safe<string[]>(x.features, []),
      images: safe<string[]>(x.images, []),
      specs: safe<Record<string, string>>(x.specs, {}),
    })) as Product[])

    setCategories((c.data ?? []) as Category[])
    setBanners((b.data ?? []) as Banner[])
    setShippingZones((s.data ?? []).map((z) => ({ ...z, price: Number(z.price) })) as ShippingZone[])
    setFaqs((f.data ?? []) as Faq[])
    setSettings(st.data?.[0] ? ({ ...EMPTY_SETTINGS, ...st.data[0] }) : EMPTY_SETTINGS)
  }, [])

  /* ────────────────────────────────── contenu privé (admin) ──────────── */

  const loadPrivate = useCallback(async () => {
    if (!supabase) return
    const [o, l, m, b] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
      supabase
        .from('leads')
        .select('*, product:products(id, name, slug)')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('media').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('site_backups').select('*').order('created_at', { ascending: false }).limit(30),
    ])
    const failed = [o, l, m, b].find((r) => r.error)
    if (failed) console.error('[Continental] chargement privé :', frError(failed.error))

    setOrders((o.data ?? []).map((x) => ({
      ...x,
      subtotal: Number(x.subtotal),
      shipping_cost: Number(x.shipping_cost),
      total_amount: Number(x.total_amount),
      items: safe(x.items, []),
    })) as Order[])
    setLeads((l.data ?? []) as Lead[])
    setMedia((m.data ?? []) as MediaAsset[])
    setBackups((b.data ?? []) as SiteBackup[])
  }, [])

  /* ────────────────────────────────────────── authentification ────────── */

  /**
   * Un compte Auth ne suffit PAS : il faut aussi une ligne dans
   * `site_admins`. C'est cette table qui autorise, pas le JWT. Sans elle,
   * toutes les écritures seraient rejetées en 42501 et l'admin afficherait
   * « enregistré » sans rien écrire.
   */
  const checkAdmin = useCallback(async (s: Session | null): Promise<boolean> => {
    if (!supabase || !s) { setIsAdmin(false); return false }
    const email = s.user?.email ?? ''
    const { data, error } = await supabase
      .from('site_admins')
      .select('email, role')
      .eq('email', email)
      .maybeSingle()
    if (error) console.error('[Continental] vérification administrateur :', error.message)
    const allowed = Boolean(data)
    setIsAdmin(allowed)
    return allowed
  }, [])

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      checkAdmin(data.session ?? null).then(() => active && setLoading(false))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      checkAdmin(s)
    })

    return () => { active = false; sub.subscription.unsubscribe() }
  }, [checkAdmin])

  useEffect(() => {
    loadPublic()
  }, [loadPublic])

  useEffect(() => {
    if (isAdmin) loadPrivate()
  }, [isAdmin, loadPrivate])

  const refresh = useCallback(async () => {
    await loadPublic()
    if (isAdmin) await loadPrivate()
  }, [loadPublic, loadPrivate, isAdmin])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Base non configurée : renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return error.message.toLowerCase().includes('invalid')
        ? 'Email ou mot de passe incorrect.'
        : frError(error)
    }
    const admin = await checkAdmin(data.session)
    if (!admin) {
      // Déconnexion immédiate : un compte valide mais non autorisé ne doit
      // pas rester connecté avec l'impression d'avoir accès.
      await supabase.auth.signOut()
      return "Compte authentifié, mais absent de la liste des administrateurs."
    }
    return null
  }, [checkAdmin])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setIsAdmin(false)
    setOrders([]); setLeads([]); setMedia([]); setBackups([])
  }, [])

  /* ──────────────────────────────────────── écriture générique ───────── */

  /**
   * `upsert` avec `onConflict: 'id'`.
   *
   * ⚠ Le RÈGLE D'OR : après un upsert, on relit la ligne avec `.select()`.
   *   PostgREST peut renvoyer `[]` sans erreur — notamment quand une politique
   *   RLS filtre l'écriture. Sans cette relecture, l'écran annonce « enregistré »
   *   alors que rien n'a été écrit. `upsertErrorIfEmpty` lève dans ce cas.
   */
  const persist = useCallback(
    async (table: string, row: Record<string, unknown>, id?: string): Promise<string | null> => {
      if (!supabase) return 'Base non configurée.'
      const payload = id ? { ...row, id } : row

      const write = await supabase.from(table).upsert(payload as never, { onConflict: 'id' }).select()
      if (write.error) return frError(write.error)

      const rowId = id ?? write.data?.[0]?.id
      if (!rowId) return "L'écriture a été acceptée mais aucune ligne n'a été renvoyée : l'accès a probablement été refusé."

      // Vérification indépendante : la ligne existe-t-elle vraiment ?
      const { data: check, error: checkError } = await supabase
        .from(table).select('id').eq('id', rowId).maybeSingle()

      if (checkError) return frError(checkError)
      if (!check) return "La modification n'a pas été enregistrée (aucune ligne modifiée)."

      return null
    },
    [],
  )

  /**
   * Mutation unique pour TOUS les UPDATE et DELETE.
   *
   * ⚠ LE PIÈGE, vérifié en conditions réelles sur ce projet :
   *
   *   Une instruction DELETE refusée par RLS ne lève RIEN. PostgREST répond
   *   `204 No Content` — exactement le même code qu'une suppression réussie —
   *   et le corps est vide dans les deux cas. Un simple `if (error)` suffit
   *   donc à annoncer « supprimé » alors que la ligne est toujours en base.
   *
   *   Testé : en `anon`, `DELETE /rest/v1/products?slug=eq.ventilateur-pied-fs4011`
   *   répond 204, sans aucune erreur, et ne supprime rien.
   *
   *   La parade est l'en-tête `Prefer: return=representation` : PostgREST
   *   renvoie alors les lignes RÉELLEMENT touchées. Zéro ligne signifie accès
   *   refusé — et devient une erreur affichable au lieu d'un succès muet.
   */
  const mutate = useCallback(
    async (
      table: string,
      action: 'update' | 'delete',
      values: Record<string, unknown>,
      id: string,
    ): Promise<string | null> => {
      if (!supabase) return 'Base non configurée.'

      // `setHeader` appartient au filtre renvoyé par `.update()` / `.delete()`,
      // pas au constructeur de requête : l'en-tête se pose donc APRÈS le
      // `.eq()`, sur la chaîne déjà filtrée.
      const result =
        action === 'update'
          ? await supabase.from(table)
              .update(values as never)
              .eq('id', id)
              .setHeader('Prefer', 'return=representation')
          : await supabase.from(table)
              .delete()
              .eq('id', id)
              .setHeader('Prefer', 'return=representation')

      if (result.error) return frError(result.error)

      if ((result.data ?? []).length === 0) {
        return action === 'update'
          ? 'Modification refusée : ligne introuvable ou accès non autorisé.'
          : 'Suppression refusée : ligne introuvable ou accès non autorisé.'
      }
      return null
    },
    [],
  )

  /* ─────────────────────────────────────────── produits ──────────────── */


  const saveProduct = useCallback<StoreValue['saveProduct']>(async (p) => {
    const { id, ...rest } = p
    const row = {
      ...rest,
      price: Number(rest.price ?? 0),
      compare_at: rest.compare_at == null || rest.compare_at === ('' as never)
        ? null : Number(rest.compare_at),
      features: rest.features ?? [],
      images: rest.images ?? [],
      specs: rest.specs ?? {},
    }
    return persist('products', row, id)
  }, [persist])

  const deleteProduct = useCallback<StoreValue['deleteProduct']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('products', 'delete', {}, id)
    if (error) return error
    setProducts((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  const toggleProduct = useCallback<StoreValue['toggleProduct']>(async (id, patch) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('products', 'update', patch as Record<string, unknown>, id)
    if (error) return error
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    return null
  }, [mutate])

  /* ────────────────────────────────────── catégories / banners ───────── */

  const saveCategory = useCallback<StoreValue['saveCategory']>(
    (c) => persist('categories', { ...c }, c.id), [persist])
  const deleteCategory = useCallback<StoreValue['deleteCategory']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('categories', 'delete', {}, id)
    if (error) return error
    setCategories((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  const saveBanner = useCallback<StoreValue['saveBanner']>(
    (b) => persist('banners', { ...b }, b.id), [persist])
  const deleteBanner = useCallback<StoreValue['deleteBanner']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('banners', 'delete', {}, id)
    if (error) return error
    setBanners((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  const saveShippingZone = useCallback<StoreValue['saveShippingZone']>(
    (z) => persist('shipping_zones', { ...z, price: Number(z.price ?? 0) }, z.id), [persist])
  const deleteShippingZone = useCallback<StoreValue['deleteShippingZone']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('shipping_zones', 'delete', {}, id)
    if (error) return error
    setShippingZones((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  const saveFaq = useCallback<StoreValue['saveFaq']>(
    (f) => persist('faqs', { ...f }, f.id), [persist])
  const deleteFaq = useCallback<StoreValue['deleteFaq']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('faqs', 'delete', {}, id)
    if (error) return error
    setFaqs((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  const saveSettings = useCallback<StoreValue['saveSettings']>(async (patch) => {
    if (!supabase) return 'Base non configurée.'
    const { error } = await supabase
      .from('site_settings')
      .update(patch as never)
      .eq('id', 1)
    if (error) return frError(error)

    // Relecture, puis COMPARAISON champ par champ.
    //
    // La relecture seule ne suffit pas : si l'écriture a été refusée en
    // silence, elle renvoie l'ANCIENNE ligne — non nulle — et l'écran
    // afficherait « enregistré » alors que rien n'a bougé. Il faut donc
    // vérifier que la valeur demandée est bien celle qui est en base.
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
    if (!data) return "Les réglages n'ont pas été enregistrés."

    for (const [field, value] of Object.entries(patch)) {
      const stored = data[field as keyof SiteSettings]
      if (JSON.stringify(stored) !== JSON.stringify(value)) {
        return `Le champ « ${field} » n'a pas été enregistré : écriture refusée.`
      }
    }

    setSettings({ ...EMPTY_SETTINGS, ...data })
    return null
  }, [])

  /* ─────────────────────────────────────── commandes / demandes ──────── */

  const updateOrderStatus = useCallback<StoreValue['updateOrderStatus']>(async (id, patch) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('orders', 'update', patch as Record<string, unknown>, id)
    if (error) return error
    setOrders((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    return null
  }, [mutate])

  const updateLeadStatus = useCallback<StoreValue['updateLeadStatus']>(async (id, status) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('leads', 'update', { status }, id)
    if (error) return error
    setLeads((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
    return null
  }, [mutate])

  const deleteLead = useCallback<StoreValue['deleteLead']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('leads', 'delete', {}, id)
    if (error) return error
    setLeads((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  /* ──────────────────────────────────────────── médias ───────────────── */

  const uploadImage = useCallback<StoreValue['uploadImage']>(async (file, folder = 'racine') => {
    if (!supabase) return 'Base non configurée.'

    const safeName = file.name
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase()
    const path = `${folder}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage
      .from(storageBucket)
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) return `Dépôt refusé : ${error.message}`

    const { data: pub } = supabase.storage.from(storageBucket).getPublicUrl(path)
    const url = pub.publicUrl

    const { error: rowError } = await supabase.from('media').insert({
      path, url, mime: file.type,
      size: file.size, folder, alt: file.name,
    })
    if (rowError) return `Image déposée mais non enregistrée : ${frError(rowError)}`

    const { data: row } = await supabase.from('media').select('*').eq('path', path).maybeSingle()
    if (row) setMedia((prev) => [row as MediaAsset, ...prev])

    return null
  }, [])

  const deleteMedia = useCallback<StoreValue['deleteMedia']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const { data: item } = await supabase.from('media').select('path').eq('id', id).maybeSingle()
    if (item?.path) await supabase.storage.from(storageBucket).remove([item.path])
    const error = await mutate('media', 'delete', {}, id)
    if (error) return error
    setMedia((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  /* ────────────────────────────────────────── sauvegardes ────────────── */

  const createBackup = useCallback<StoreValue['createBackup']>(async (name) => {
    if (!supabase) return 'Base non configurée.'
    const { error } = await supabase.from('site_backups').insert({
      backup_name: name || 'Configuration globale',
      products_data: products,
      banners_data: banners,
      shipping_data: shippingZones,
      faqs_data: faqs,
      contact_data: settings.contact ?? {},
      social_data: settings.social ?? {},
    })
    if (error) return frError(error)
    await loadPrivate()
    return null
  }, [products, banners, shippingZones, faqs, settings, loadPrivate])

  /**
   * Restauration.
   *
   * ⚠ `upsert` préserve l'`id` : restaurer une sauvegarde réécrit les lignes
   *   DANS LE VIDE et n'y ajoute rien, puisque l'identifiant est déjà celui
   *   d'une ligne supprimée depuis. On force donc un nouvel identifiant à la
   *   restauration, et on ne restaure que les lignes réellement absentes.
   */
  const restoreBackup = useCallback<StoreValue['restoreBackup']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const { data: backup } = await supabase.from('site_backups').select('*').eq('id', id).maybeSingle()
    if (!backup) return 'Sauvegarde introuvable.'

    const { strip } = await import('@/lib/restore')
    // Capture locale : TypeScript ne resserre pas la preuve de non-nullité
    // à l'intérieur d'une fermeture.
    const db = supabase

    const reinsert = async (table: string, rows: Record<string, unknown>[], label: string) => {
      if (!rows?.length) return
      const { data: existing } = await db.from(table).select('slug')
      const known = new Set((existing ?? []).map((r) => r.slug))
      const missing = strip(rows).filter((r) => !known.has(String(r.slug)))
      if (!missing.length) return
      const { error } = await db.from(table).insert(missing as never)
      if (error) {
        console.error(`[Continental] restauration « ${label} » :`, error.message)
      } else {
        console.info(`[Continental] restauration « ${label} » : ${missing.length} élément(s)`)
      }
    }

    await reinsert('products', backup.products_data as never, 'Produits')
    await reinsert('banners', backup.banners_data as never, 'Bannières')
    await reinsert('shipping_zones', backup.shipping_data as never, 'Zones')
    await reinsert('faqs', backup.faqs_data as never, 'FAQ')

    await saveSettings({ contact: backup.contact_data, social: backup.social_data })
    await loadPublic()
    return null
  }, [loadPublic, saveSettings])

  const deleteBackup = useCallback<StoreValue['deleteBackup']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('site_backups', 'delete', {}, id)
    if (error) return error
    setBackups((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  /* ────────────────────────── écritures publiques (visiteur) ─────────── */

  const submitLead = useCallback<StoreValue['submitLead']>(async (input) => {
    if (!supabase) return 'Base non configurée.'
    const { error } = await supabase.from('leads').insert({
      kind: input.kind,
      name: input.name ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      city: input.city ?? null,
      message: input.message ?? null,
      product_id: input.productId ?? null,
    })
    if (error) return frError(error)
    return null
  }, [])

  /**
   * Passe commande.
   *
   * La référence est calculée CÔTÉ CLIENT puis l'insertion est relue : c'est le
   * seul moyen de connaître le jeton public, que PostgREST ne retourne pas
   * sur un INSERT nu. Sans ce jeton, la page de confirmation n'a aucun moyen
   * de prouver au client que la commande est bien la sienne.
   */
  const placeOrder = useCallback<StoreValue['placeOrder']>(async (input) => {
    if (!supabase) return { token: null, ref: null, error: 'Base non configurée.' }
    if (!input.items.length) return { token: null, ref: null, error: 'Le panier est vide.' }

    const subtotal = input.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0)
    const shipping = Number(input.shippingZone?.price ?? 0)
    const total = subtotal + shipping
    const ref = `CNT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

    const { error } = await supabase.from('orders').insert({
      ref_command: ref,
      customer_name: input.customer.name,
      customer_phone: input.customer.phone,
      customer_email: input.customer.email ?? null,
      customer_address: input.customer.address ?? null,
      shipping_zone_id: input.shippingZone?.id ?? null,
      shipping_zone_name: input.shippingZone?.name ?? null,
      shipping_cost: shipping,
      subtotal,
      total_amount: total,
      items: input.items,
      payment_method: input.paymentMethod,
      notes: input.notes ?? null,
    })
    if (error) return { token: null, ref: null, error: frError(error) }

    const { data } = await supabase
      .from('orders').select('ref_command, public_token').eq('ref_command', ref).maybeSingle()
    if (!data) return { token: null, ref: null, error: 'Commande enregistrée, mais sa référence est introuvable.' }

    return { token: data.public_token, ref: data.ref_command, error: null }
  }, [])

  const value = useMemo<StoreValue>(() => ({
    loading, supabaseEnabled: isSupabaseConfigured, session,
    authEmail: session?.user?.email ?? null, isAdmin,
    products, categories, banners, shippingZones, faqs, settings,
    orders, leads, media, backups,
    signIn, signOut,
    saveProduct, deleteProduct, toggleProduct,
    saveCategory, deleteCategory, saveBanner, deleteBanner,
    saveShippingZone, deleteShippingZone, saveFaq, deleteFaq, saveSettings,
    updateOrderStatus, updateLeadStatus, deleteLead,
    uploadImage, deleteMedia,
    createBackup, restoreBackup, deleteBackup,
    submitLead, placeOrder, refresh,
  }), [
    loading, session, isAdmin, products, categories, banners, shippingZones,
    faqs, settings, orders, leads, media, backups, signIn, signOut,
    saveProduct, deleteProduct, toggleProduct, saveCategory, deleteCategory,
    saveBanner, deleteBanner, saveShippingZone, deleteShippingZone, saveFaq,
    deleteFaq, saveSettings, updateOrderStatus, updateLeadStatus, deleteLead,
    uploadImage, deleteMedia, createBackup, restoreBackup, deleteBackup,
    submitLead, placeOrder, refresh,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}