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
import { resolveSettings, type ResolvedSettings, type DbSettings } from '@/lib/settings'
import type {
  Product, Category, Banner, ShippingZone, Faq, Order, Lead,
  SiteSettings, MediaAsset, SiteBackup, OrderStatus, PaymentStatus,
  LeadStatus, LeadKind, ContentBlock, AuditEvent, SiteAdmin,
  Permissions, ModuleKey,
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
  /**
   * Rôle porté par la ligne `site_admins` de la personne connectée :
   * `admin` (l'agence, passe partout) ou `editor` (droits accordés module par
   * module). Distingué de `isOwner`, qui n'est que sa traduction booléenne :
   * l'écran doit pouvoir écrire « Administrateur » ou « Éditeur », pas
   * « propriétaire / pas propriétaire ».
   */
  myRole: string | null

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
  /** Blocs de texte/image du site public. */
  blocks: ContentBlock[]
  /** Journal des actions d'administration. */
  audits: AuditEvent[]
  /** Comptes administrateurs. Seul un rôle `admin` les voit tous. */
  admins: SiteAdmin[]
  /** Droits du compte connecté. `{}` = pas d'accès. */
  myPermissions: Permissions
  /** Le compte connecté a-t-il le droit demandé sur ce module ? */
  can: (module: ModuleKey, level?: 'read' | 'write') => boolean
  /** Ce compte peut-il gérer les autres comptes ? */
  isOwner: boolean

  /* auth */
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>

  /* écritures admin */
  saveBlock: (block: Partial<ContentBlock> & { id?: string }) => Promise<string | null>
  deleteBlock: (id: string) => Promise<string | null>
  saveUser: (u: { email: string; full_name?: string | null; role?: string; permissions?: Permissions }) => Promise<string | null>
  deleteUser: (email: string) => Promise<string | null>

  saveProduct: (p: Partial<Product> & { id?: string }) => Promise<string | null>
  /** Réglages résolus (contact, horaires, paiements, livraison) pour l'affichage. */
  siteConfig: ResolvedSettings
  /** Rubriques de mise en avant en cours, tous produits confondus. */
  productBadges: { slug: string; slot: string; label: string }[]
  /** Pose ou retire une rubrique (« héros », « meilleur-vendu », promo…). */
  setProductSlot: (
    slug: string,
    slot: string | null,
    label?: string | null,
  ) => Promise<string | null>
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
  uploadImage: (
    file: File,
    folder?: string,
  ) => Promise<{ url: string } | { error: string }>
  /** Chemin du dernier dépôt réussi — permet de le sélectionner aussitôt. */
  lastUploadedPath: string | null
  deleteMedia: (id: string) => Promise<string | null>

  /* sauvegardes */
  createBackup: (name: string) => Promise<string | null>
  restoreBackup: (id: string) => Promise<string | null>
  deleteBackup: (id: string) => Promise<string | null>

  /* ── écritures publiques (visiteur) ── */
  submitLead: (input: { kind: LeadKind; name?: string; phone?: string; email?: string; city?: string; message?: string; productId?: string }) => Promise<string | null>
  placeOrder: (input: {
    customer: { name: string; phone: string; email?: string; address?: string }
    items: {
      productId: string
      name: string
      price: number
      quantity: number
      /**
       * Clé de LIGNE (`slug` ou `slug::variante`). Le serveur s'en sert pour
       * retrouver la variante commandée ; sans elle, une TV 43" serait
       * facturée au prix de la 32". Voir `CartLine.key`.
       */
      key?: string
      image?: string | null
    }[]
    shippingZone?: ShippingZone | null
    paymentMethod: string
    notes?: string
    /** Champ piège : rempli seulement par un robot. */
    honeypot?: string
  }) => Promise<{
    token: string | null
    ref: string | null
    error: string | null
    /**
     * Montants recalculés par le SERVEUR, pas par le navigateur.
     *
     * Ils valent `null` quand la commande n'a pas été enregistrée. Le panier
     * les affiche et les met dans le message WhatsApp : c'est ce qui garantit
     * que le récapitulatif correspond à ce qui est en base.
     */
    subtotal: number | null
    shippingCost: number | null
    total: number | null
  }>

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

/**
 * Traduit un refus de `create_order` en français lisible par le client.
 *
 * La fonction serveur lève des exceptions dont le message est un code
 * (`NOM_REQUIS`, `PRODUIT_INDISPONIBLE`…). `frError` les renverrait tels quels :
 * le client lirait « PRODUIT_INDISPONIBLE » au moment précis où il essaie de
 * commander. Chaque code porte ici la phrase qui dit quoi faire.
 *
 * Le code est cherché dans le message plutôt que comparé : PostgREST peut
 * l'entourer de son propre texte selon le cas.
 */
function frOrderError(error: { code?: string; message: string } | null): string {
  if (!error) return 'Erreur inconnue.'
  const message = error.message ?? ''

  const known: [string, string][] = [
    // Piège à robots : un humain ne le remplit jamais. On ne lui explique pas
    // ce qui l'a trahi — il lirait la consigne et contournerait le champ.
    ['COMMANDE_REFUSEE', "La commande n'a pas pu être enregistrée. Réessayez."],
    ['NOM_REQUIS', 'Indiquez votre nom complet.'],
    ['TELEPHONE_INVALIDE', 'Ce numéro de téléphone semble incomplet. Vérifiez-le.'],
    ['EMAIL_INVALIDE', 'Cette adresse e-mail semble incorrecte.'],
    ['PANIER_VIDE', 'Votre panier est vide.'],
    ['PANIER_TROP_GRAND', 'Votre panier contient trop de lignes. Commandez en deux fois.'],
    [
      'TROP_DE_COMMANDES',
      'Vous avez déjà passé plusieurs commandes à l’instant. Appelez-nous, on s’en occupe directement.',
    ],
    ['LIGNE_INVALIDE', 'Une ligne du panier est illisible. Videz le panier et recommencez.'],
    ['LIGNE_SANS_PRODUIT', 'Un article du panier est incomplet. Videz le panier et recommencez.'],
    ['QUANTITE_INVALIDE', 'Une quantité du panier est incorrecte.'],
    ['PRODUIT_INTROUVABLE', "Un article n'est plus au catalogue. Retirez-le du panier."],
    ['PRODUIT_INDISPONIBLE', "Un article n'est plus disponible. Retirez-le du panier."],
    ['VARIANTE_INTROUVABLE', "Le modèle choisi n'est plus disponible. Rechoisissez-le."],
    ['ZONE_INTROUVABLE', 'Cette zone de livraison n’existe plus. Rechoisissez-la.'],
    ['COMMANDE_NON_ENREGISTREE', "La commande n'a pas pu être enregistrée. Réessayez."],
  ]

  for (const [code, phrase] of known) {
    if (message.includes(code)) return phrase
  }

  // Refus inattendu : on rend le message brut plutôt que d'inventer une cause.
  return message || 'Erreur inconnue.'
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
  const [lastUploadedPath, setLastUploadedPath] = useState<string | null>(null)
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [audits, setAudits] = useState<AuditEvent[]>([])
  const [admins, setAdmins] = useState<SiteAdmin[]>([])
  const [myPermissions, setMyPermissions] = useState<Permissions>({})
  const [isOwner, setIsOwner] = useState(false)
  const [myRole, setMyRole] = useState<string | null>(null)
  /*
   * Rubriques de mise en avant en cours, lues depuis la vue publique.
   *
   * Ce n'est PAS `products.badge` : celui-ci est l'étiquette descriptive d'une
   * fiche (« Télécommande »), tandis qu'ici il s'agit des places éditoriales
   * (« héros », « meilleur-vendu », « promotion ») dont le nombre est limité et
   * dont l'attribution se fait ailleurs que sur la fiche produit.
   */
  /**
   * Réglages RÉSOLUS, prêts à afficher.
   *
   * `settings` est la ligne brute de `site_settings`. Ce champ applique les
   * valeurs par défaut du dépôt à ce qui manque, champ par champ : un
   * réglage laissé vide ne doit pas effacer une valeur utilisable.
   *
   * C'est lui que consomment le pied de page, l'en-tête et les liens WhatsApp
   * — le tout premier étant un composant client, qui ne peut pas lire la base
   * lui-même.
   */
  const [siteConfigResolved, setSiteConfigResolved] = useState<ResolvedSettings>(
    () => resolveSettings(null),
  )

  const [productBadges, setProductBadges] = useState<
    { slug: string; slot: string; label: string }[]
  >([])

  /* ────────────────────────────────────────── contenu public ─────────── */

  const loadPublic = useCallback(async () => {
    if (!supabase) return

    const [p, c, b, s, f, st, cb, pb] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(id, slug, label, kind, position, image, intro)')
        .order('position', { ascending: true }),
      supabase.from('categories').select('*').order('position', { ascending: true }),
      supabase.from('banners').select('*').order('position', { ascending: true }),
      supabase.from('shipping_zones').select('*').order('position', { ascending: true }),
      supabase.from('faqs').select('*').order('position', { ascending: true }),
      supabase.from('site_settings').select('*').limit(1),
      supabase.from('content_blocks').select('*').order('position', { ascending: true }),
      // Vue publique : elle filtre déjà les rubriques hors période, donc une
      // promotion échue disparaît de l'administration sans intervention.
      supabase.from('public_product_badges').select('slug,slot,label'),
    ])

    // Une seule alerte : la page doit rester lisible même si une table manque.
    const failed = [p, c, b, s, f, st, cb, pb].find((r) => r.error)
    if (failed) console.error('[Continental] chargement public :', frError(failed.error))

    setProducts((p.data ?? []).map((x) => ({
      ...x,
      price: Number(x.price),
      compare_at: x.compare_at === null ? null : Number(x.compare_at),
      features: safe<string[]>(x.features, []),
      images: safe<string[]>(x.images, []),
      specs: safe<Record<string, string>>(x.specs, {}),
      /*
       * Colonne `products.free_delivery`, lue sous son nom SQL comme le reste
       * de la ligne. On la normalise en booléen : `null` doit valoir « non »,
       * jamais « livraison offerte ».
       */
      free_delivery: x.free_delivery === true,
    })) as Product[])

    setProductBadges((pb.data ?? []) as { slug: string; slot: string; label: string }[])

    setCategories((c.data ?? []) as Category[])
    setBanners((b.data ?? []) as Banner[])
    setShippingZones((s.data ?? []).map((z) => ({ ...z, price: Number(z.price) })) as ShippingZone[])
    setFaqs((f.data ?? []) as Faq[])
    const settingsRow = (st.data?.[0] as unknown as DbSettings | undefined) ?? null
    setSettings((settingsRow ?? EMPTY_SETTINGS) as unknown as SiteSettings)
    // Les composants clients affichent la version résolue, pas la ligne brute :
    // c'est elle qui applique les valeurs par défaut champ par champ.
    setSiteConfigResolved(resolveSettings(settingsRow))
    setBlocks((cb.data ?? []) as ContentBlock[])
  }, [])

  /* ────────────────────────────────── contenu privé (admin) ──────────── */

  const loadPrivate = useCallback(async () => {
    if (!supabase) return
    /*
     * ⚠ L'ordre de décomposition suit EXACTEMENT l'ordre de `Promise.all`.
     *
     * Il était décomposé en `[o, l, m, b, a]` alors que la première requête
     * porte sur `audit_events` : chaque état recevait la table précédente.
     *   orders ← audit_events   → montants `undefined` → NaN partout
     *   leads   ← orders
     *   media   ← leads
     *   backups ← media
     *   audits  ← site_backups   → toujours vide → « Le journal est vide »
     *
     * Trois symptômes pour une seule cause : commandes en NaN, journal vide,
     * médiathèque et sauvegardes décalées d'une table.
     */
    const [a, o, l, m, b] = await Promise.all([
      supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(400),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
      supabase
        .from('leads')
        .select('*, product:products(id, name, slug)')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('media').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('site_backups').select('*').order('created_at', { ascending: false }).limit(30),
    ])
    const failed = [a, o, l, m, b].find((r) => r.error)
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
    setAudits((a.data ?? []) as AuditEvent[])
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
      .select('email, role, permissions')
      .eq('email', email)
      .maybeSingle()
    if (error) console.error('[Continental] vérification administrateur :', error.message)

    const allowed = Boolean(data)
    setMyPermissions((data?.permissions as Permissions) ?? {})
    setMyRole(data?.role ?? null)
    setIsOwner(data?.role === 'admin')
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

  /* ────────────────────────────── journalisation ─────────────────────── */

  /**
   * Écrit une ligne de journal via `log_event()`.
   *
   * VOLONTAIREMENT non bloquante : un échec de journalisation ne doit pas
   * faire échouer une modification déjà réussie. Mais il n'est pas silencieux
   * non plus — il est tracé sur la console, sinon on perdrait la trace d'une
   * panne du journal en même temps que l'événement à journaliser.
   */
  const audit = useCallback(
    async (
      action: string,
      entity: string,
      entityId?: string | null,
      label?: string | null,
    ) => {
      if (!supabase) return
      const { error } = await supabase.rpc('log_event', {
        p_action: action,
        p_entity: entity,
        p_entity_id: entityId ?? null,
        p_label: label ?? null,
      })
      if (error) console.error('[Continental] journalisation impossible :', error.message)
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Base non configurée : renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return error.message.toLowerCase().includes('invalid')
        ? 'Email ou mot de passe incorrect.'
        : frError(error)
    }
    await audit('login', 'session', null, email.trim())
    const admin = await checkAdmin(data.session)
    if (!admin) {
      // Déconnexion immédiate : un compte valide mais non autorisé ne doit
      // pas rester connecté avec l'impression d'avoir accès.
      await supabase.auth.signOut()
      return "Compte authentifié, mais absent de la liste des administrateurs."
    }
    return null
  }, [checkAdmin, audit])

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

  /* ─────────────────────────────────── blocs de contenu ──────────────── */

  const saveBlock = useCallback<StoreValue['saveBlock']>(async (block) => {
    const error = await persist('content_blocks', { ...block }, block.id)
    if (error) return error
    await audit(
      block.id ? 'update' : 'create',
      'content_blocks',
      block.id ?? null,
      block.title ?? block.key ?? null,
    )
    return null
  }, [persist, audit])

  const deleteBlock = useCallback<StoreValue['deleteBlock']>(async (id) => {
    const error = await mutate('content_blocks', 'delete', {}, id)
    if (error) return error
    setBlocks((prev) => prev.filter((x) => x.id !== id))
    await audit('delete', 'content_blocks', id)
    return null
  }, [mutate, audit])

  /* ──────────────────────────────────── utilisateurs ──────────────────── */

  /**
   * Droits effectifs sur un module.
   *
   * Un `permissions` vide ou absent donne TOUT à un rôle `admin` : c'est le
   * compte de l'agence, il ne doit pas être enfermé par sa propre liste. Un
   * rôle `editor`, lui, s'en tient strictement à ce qu'on lui a accordé — un
   * module absent vaut refus, jamais élévation.
   */
  const can = useCallback<StoreValue['can']>((module, level = 'read') => {
    if (!isAdmin) return false
    if (isOwner) return true
    const granted = myPermissions[module]
    if (!granted) return false
    if (level === 'read') return true
    return granted.includes('write')
  }, [isAdmin, isOwner, myPermissions])

  const saveUser = useCallback<StoreValue['saveUser']>(async (u) => {
    if (!supabase) return 'Base non configurée.'
    const email = u.email.trim().toLowerCase()

    // L'email est la CLE : un-compte-identique-diffère-t-il vraiment de son
    // adresse. On refuse donc les majuscules et les espaces, qui créeraient
    // deux lignes pour la même personne — et deux comptes sans permission.
    if (email !== u.email.trim() || !email.includes('@')) {
      return 'Adresse e-mail invalide (minuscules, sans espace).'
    }

    const row = {
      email,
      full_name: u.full_name ?? null,
      role: u.role === 'admin' ? 'admin' : 'editor',
      permissions: u.permissions ?? {},
    }

    const { error } = await supabase
      .from('site_admins')
      .upsert(row as never, { onConflict: 'email' })
      .select()

    if (error) return frError(error)

    // Relecture : un upsert refusé par RLS ne lève rien.
    const { data: read } = await supabase
      .from('site_admins').select('*').eq('email', email).maybeSingle()
    if (!read) return "Le compte n'a pas été enregistré."

    await audit(
      u.role === 'admin' ? 'create' : 'update',
      'site_admins',
      null,
      email,
    )
    const { data: all } = await supabase
      .from('site_admins').select('*').order('email', { ascending: true })
    setAdmins((all ?? []) as SiteAdmin[])
    return null
  }, [audit])

  const deleteUser = useCallback<StoreValue['deleteUser']>(async (email) => {
    if (!supabase) return 'Base non configurée.'

    // `site_admins` n'a pas de colonne `id` : sa clé primaire est `email`.
    // Le filtre `mutate()` (`.eq('id', …)`) ne s'y applique donc pas — il
    // renverrait « ligne introuvable » alors que la ligne existe, ou pire,
    // ne supprimerait rien sans le signaler. D'où la requête dédiée.
    // `.select()` est indispensable : sans lui le type de retour est `never`,
    // et PostgREST ne renvoie pas les lignes supprimées — on ne pourrait donc
    // pas distinguer « supprimé » de « refusé ».
    const { error, data } = await supabase
      .from('site_admins')
      .delete()
      .eq('email', email)
      .select('email')
      .setHeader('Prefer', 'return=representation')

    if (error) return frError(error)
    if (!data?.length) return "Ce compte n'a pas été supprimé (accès refusé)."

    setAdmins((prev) => prev.filter((x) => x.email !== email))
    await audit('delete', 'site_admins', null, email)
    return null
  }, [audit])

  /* ─────────────────────────────────────────── produits ──────────────── */


  const saveProduct = useCallback<StoreValue['saveProduct']>(async (p) => {
    const { id } = p

    /*
     * On recopie les colonnes UNE PAR UNE, au lieu d'étaler l'objet reçu.
     *
     * `saveProduct({ ...editing })` envoyait à PostgREST tout ce que la ligne
     * portait — y compris `category`, l'objet joint par
     * `select('*, category:categories(...)')` pour afficher le libellé. Or
     * `products` n'a pas de colonne `category`, seulement `category_id`.
     * PostgREST refusait donc l'écriture entière :
     *
     *   « Could not find the 'category' column of 'products' in the schema
     *     cache »
     *
     * Le défaut n'était pas dans le formulaire mais dans le transport :
     * toutes les colonnes jointes pour l'affichage repartaient vers la base.
     * La liste ci-dessous est celle des colonnes réelles de `products` ; ce
     * qui n'y figure pas — liaisons, horodatages, champs d'affichage — est
     * ignoré. Un champ d'affichage ajouté plus tard ne pourra plus casser un
     * enregistrement.
     */
    const row = {
      slug: p.slug,
      name: p.name,
      ref_: p.ref_ ?? null,
      sku: p.sku ?? null,
      category_id: p.category_id ?? null,
      price: Number(p.price ?? 0),
      compare_at: p.compare_at == null || p.compare_at === ('' as never)
        ? null : Number(p.compare_at),
      image: p.image ?? null,
      image_alt: p.image_alt ?? null,
      images: p.images ?? [],
      short_desc: p.short_desc ?? null,
      description: p.description ?? null,
      features: p.features ?? [],
      specs: p.specs ?? {},
      badge: p.badge ?? null,
      in_stock: p.in_stock ?? true,
      is_active: p.is_active ?? true,
      is_featured: p.is_featured ?? false,
      position: p.position ?? 0,
      /*
       * Livraison offerte sur cet article.
       *
       * La liste ci-dessus est la liste des colonnes RÉELLES de `products` :
       * un champ absent d'ici est silencieusement perdu à l'enregistrement.
       * La case cochée dans le formulaire n'aurait donc aucun effet — le
       * vendeur croirait offrir la livraison, et `create_order` continuerait
       * de la facturer.
       */
      free_delivery: p.free_delivery === true,
      /*
       * Modèles déclinés.
       *
       * On ne garde que les entrées EXPLOITABLES : une ligne sans libellé, ou
       * à prix nul, serait de toute façon écartée à l'affichage par
       * `toVariants` côté site. L'enregistrer ne créerait qu'un écart
       * silencieux entre ce que l'administration montre et ce que le site
       * publie — exactement le genre d'écart qu'on ne découvre qu'en recevant
       * une commande au mauvais prix.
       */
      variants: (p.variants ?? [])
        .filter((v) => (v.label ?? '').trim() !== '' && Number(v.price) > 0)
        .map((v) => ({
          id: v.id,
          label: v.label.trim(),
          price: Number(v.price),
          ...((v.power ?? '').trim() ? { power: v.power!.trim() } : {}),
          ...(v.btu === undefined || !Number.isFinite(Number(v.btu))
            ? {}
            : { btu: Number(v.btu) }),
          // Une ligne de tableau sans intitulé ou sans valeur ne s'afficherait
          // pas : on l'écarte à l'écriture plutôt que de la stocker pour rien.
          ...(v.specs && Object.keys(v.specs).length > 0
            ? {
                specs: Object.fromEntries(
                  Object.entries(v.specs)
                    .filter(([k, val]) => k.trim() !== '' && String(val).trim() !== '')
                    .map(([k, val]) => [k.trim(), String(val).trim()]),
                ),
              }
            : {}),
          ...((v.warning ?? '').trim() ? { warning: v.warning!.trim() } : {}),
        })),
    }
    const error = await persist('products', row, id)
    if (error) return error
    await audit(id ? 'update' : 'create', 'products', id, row.name ?? null)
    return null
  }, [persist, audit])

  /**
   * Pose (ou retire) une pastille de rubrique sur un produit.
   *
   * `set_slot()` applique deux règles qu'aucun écran ne peut garantir :
   *   • une place unique (« héros », « meilleur-vendu ») n'est portée que par
   *     UN produit — poser la pastille sur un autre libère l'ancienne ;
   *   • un produit ne peut pas porter deux fois la même rubrique.
   * Ce sont des index uniques en base, pas des vérifications dans le
   * formulaire : deux onglets ouverts ne peuvent pas produire deux
   * « meilleur-vendu ».
   *
   * `p_slot` à `null` retire la pastille. La fonction dépanne alors le produit
   * concerné — retirer « héros » d'un produit, c'est simplement le laisser
   * rendre la place à quelqu'un d'autre.
   *
   * Renvoie une erreur lisible ou `null`, comme les autres `save*`.
   */
  const setProductSlot = useCallback<StoreValue['setProductSlot']>(
    async (slug, slot, label) => {
      if (!supabase) return 'Base non configurée.'

      const { error } = await supabase.rpc('set_slot', {
        p_slug: slug,
        p_slot: slot ?? '',
        p_label: label || null,
      })
      if (error) {
        // 42501 : le compte est connecté mais n'a pas le droit d'écrire.
        return error.code === '42501'
          ? "Vous n'avez pas le droit de modifier les mises en avant."
          : frError(error)
      }

      // Le RPC ne renvoie que l'identifiant de la ligne créée : on relit la vue
      // pour connaître l'état réel des places, plutôt que de le supposer.
      await refresh()
      await audit('update', 'products', null, slot ? `place ${slot}` : `retrait ${slot}`)
      return null
    },
    [refresh, audit],
  )

  const deleteProduct = useCallback<StoreValue['deleteProduct']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const before = products.find((x) => x.id === id)
    const error = await mutate('products', 'delete', {}, id)
    if (error) return error
    setProducts((prev) => prev.filter((x) => x.id !== id))
    await audit('delete', 'products', id, before?.name ?? null)
    return null
  }, [mutate, audit, products])

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

  const saveBanner = useCallback<StoreValue['saveBanner']>(async (b) => {
    const error = await persist('banners', { ...b }, b.id)
    if (error) return error
    await audit(b.id ? 'update' : 'create', 'banners', b.id, b.title ?? null)
    return null
  }, [persist, audit])
  const deleteBanner = useCallback<StoreValue['deleteBanner']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('banners', 'delete', {}, id)
    if (error) return error
    setBanners((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  const saveShippingZone = useCallback<StoreValue['saveShippingZone']>(async (z) => {
    const error = await persist('shipping_zones', { ...z, price: Number(z.price ?? 0) }, z.id)
    if (error) return error
    await audit(z.id ? 'update' : 'create', 'shipping_zones', z.id, z.name ?? null)
    return null
  }, [persist, audit])
  const deleteShippingZone = useCallback<StoreValue['deleteShippingZone']>(async (id) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('shipping_zones', 'delete', {}, id)
    if (error) return error
    setShippingZones((prev) => prev.filter((x) => x.id !== id))
    return null
  }, [mutate])

  const saveFaq = useCallback<StoreValue['saveFaq']>(async (f) => {
    const error = await persist('faqs', { ...f }, f.id)
    if (error) return error
    await audit(f.id ? 'update' : 'create', 'faqs', f.id, f.question ?? null)
    return null
  }, [persist, audit])
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
    setSiteConfigResolved(resolveSettings(data as unknown as DbSettings))
    await audit('update', 'site_settings', null, Object.keys(patch).join(', '))
    return null
  }, [audit])

  /* ─────────────────────────────────────── commandes / demandes ──────── */

  const updateOrderStatus = useCallback<StoreValue['updateOrderStatus']>(async (id, patch) => {
    if (!supabase) return 'Base non configurée.'
    const error = await mutate('orders', 'update', patch as Record<string, unknown>, id)
    if (error) return error
    const label = orders.find((x) => x.id === id)?.ref_command ?? null
    setOrders((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    await audit('update', 'orders', id, label)
    return null
  }, [mutate, audit, orders])

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
    if (!supabase) return { error: 'Base non configurée.' }

    const safeName = file.name
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase()
    const path = `${folder}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage
      .from(storageBucket)
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) return { error: `Dépôt refusé : ${error.message}` }

    const { data: pub } = supabase.storage.from(storageBucket).getPublicUrl(path)
    const url = pub.publicUrl

    setLastUploadedPath(path)
    const { error: rowError } = await supabase.from('media').insert({
      path, url, mime: file.type,
      size: file.size, folder, alt: file.name,
    })
    if (rowError) return { error: `Image déposée mais non enregistrée : ${frError(rowError)}` }

    const { data: row } = await supabase.from('media').select('*').eq('path', path).maybeSingle()
    if (row) setMedia((prev) => [row as MediaAsset, ...prev])

    /*
     * On RENVOIE l'adresse publique.
     *
     * Le dépôt expose aussi `lastUploadedPath`, mais c'est un état React : le
     * relire juste après un `await` rend l'ANCIENNE valeur — l'appelant voit
     * `null` et n'attache jamais l'image au produit. Le téléversement
     * réussissait, le fichier atterrissait dans la médiathèque, et le
     * formulaire semblait ignorer l'image.
     *
     * `url` et non `path` : c'est la seule forme que le site sait afficher.
     */
    return { url }
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
   * Le navigateur n'écrit PLUS dans `orders` : la politique `orders_public_insert`
   * a été retirée et l'INSERT est révoqué pour `anon`. Tout passe par la
   * fonction `create_order`, qui recalcule les prix depuis la base — un prix
   * envoyé d'ici est ignoré — et renvoie le sous-total, les frais et le total
   * qu'elle a elle-même calculés.
   *
   * Ce que le client envoie se limite donc à ce qu'il est seul à savoir :
   * le panier (slug, variante, quantité), ses coordonnées, la zone et le mode
   * de règlement. Le prix, la référence et le jeton public viennent du serveur.
   *
   * `honeypot` est un champ caché du formulaire : un humain le laisse vide.
   */
  const placeOrder = useCallback<StoreValue['placeOrder']>(async (input) => {
    const rien = { token: null, ref: null, error: null, subtotal: null, shippingCost: null, total: null }

    if (!supabase) return { ...rien, error: 'Base non configurée.' }
    if (!input.items.length) return { ...rien, error: 'Le panier est vide.' }

    // On n'envoie QUE l'identité et la quantité : le serveur relit les prix.
    // `key` porte la variante (`slug::v-tv-43`) ; sans elle, toutes les tailles
    // d'une même fiche seraient facturées au prix de base.
    const items = input.items.map((i) => ({
      slug: i.productId,
      key: i.key ?? i.productId,
      quantity: i.quantity,
    }))

    const { data, error } = await supabase.rpc('create_order', {
      p_items: items,
      p_customer_name: input.customer.name,
      p_customer_phone: input.customer.phone,
      p_customer_email: input.customer.email ?? null,
      p_customer_address: input.customer.address ?? null,
      // Le serveur relit la zone en base et recalcule les frais : le prix
      // envoyé par le navigateur ne compte pas non plus de ce côté.
      p_shipping_zone_id: input.shippingZone?.id ?? null,
      p_payment_method: input.paymentMethod,
      p_notes: input.notes ?? null,
      p_honeypot: input.honeypot ?? null,
    })

    if (error) return { ...rien, error: frOrderError(error) }

    // `returns table` : PostgREST rend un tableau, même pour une seule ligne.
    const row = (Array.isArray(data) ? data[0] : data) as
      | { ref_command: string; public_token: string; subtotal: number; shipping_cost: number; total_amount: number }
      | undefined
    if (!row) return { ...rien, error: "Commande enregistrée, mais sa référence est introuvable." }

    return {
      token: row.public_token,
      ref: row.ref_command,
      error: null,
      subtotal: Number(row.subtotal),
      shippingCost: Number(row.shipping_cost),
      total: Number(row.total_amount),
    }
  }, [])

  const value = useMemo<StoreValue>(() => ({
    loading, supabaseEnabled: isSupabaseConfigured, session,
    authEmail: session?.user?.email ?? null, isAdmin,
    products, categories, banners, shippingZones, faqs, settings,
    orders, leads, media, backups, blocks, audits, admins,
    myPermissions, myRole, can, isOwner,
    signIn, signOut,
    saveBlock, deleteBlock, saveUser, deleteUser,
    siteConfig: siteConfigResolved,
    productBadges, saveProduct, setProductSlot, deleteProduct, toggleProduct,
    saveCategory, deleteCategory, saveBanner, deleteBanner,
    saveShippingZone, deleteShippingZone, saveFaq, deleteFaq, saveSettings,
    updateOrderStatus, updateLeadStatus, deleteLead,
    uploadImage, lastUploadedPath, deleteMedia,
    createBackup, restoreBackup, deleteBackup,
    submitLead, placeOrder, refresh,
  }), [
    loading, session, isAdmin, products, categories, banners, shippingZones,
    faqs, settings, orders, leads, media, backups, blocks, audits, admins,
    myPermissions, myRole, can, isOwner, signIn, signOut,
    saveBlock, deleteBlock, saveUser, deleteUser, audit,
    siteConfigResolved, productBadges,
    saveProduct, setProductSlot, deleteProduct, toggleProduct, saveCategory, deleteCategory,
    saveBanner, deleteBanner, saveShippingZone, deleteShippingZone, saveFaq,
    deleteFaq, saveSettings, updateOrderStatus, updateLeadStatus, deleteLead,
    uploadImage, lastUploadedPath, deleteMedia, createBackup, restoreBackup,
    deleteBackup, submitLead, placeOrder, refresh,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}