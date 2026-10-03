'use client'

/**
 * admin/page.tsx — Portail d'administration Continental®.
 *
 * Trois états, et seulement trois :
 *   1. base non configurée  → ce qu'il faut corriger dans `.env.local` ;
 *   2. non connecté         → formulaire de connexion ;
 *   3. connecté             → le portail.
 *
 * L'état 3 exige TROIS conditions, pas une : session valide, ligne dans
 * `site_admins` (vérifiée par la base, pas par le code), et contenu privé
 * chargé. Sans la deuxième, les tables privées renvoient zéro ligne : l'écran
 * serait vide sans la moindre erreur, et l'administrateur conclurait à tort
 * que le site n'a jamais reçu de commande.
 *
 * RESPONSIVE — barre latérale fixe à partir de `lg`. En dessous, la même
 * navigation passe dans un tiroir plein écran. Aucune liste de neuf modules
 * n'est empilée en colonnes dans l'en-tête : sur 375 px, cela ne tient pas.
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck, ExternalLink, Menu, X, LogOut, Package, ShoppingBag,
  MessageSquare, Image as ImageIcon, Truck, HelpCircle, Settings,
  Database, FolderSync, ChevronRight, AlertTriangle, Loader2, Eye, Home,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { Button, Toast, ConfirmDialog } from '@/components/admin/ui'
import OrdersTab from '@/components/admin/OrdersTab'
import ProductsTab from '@/components/admin/ProductsTab'
import LeadsTab from '@/components/admin/LeadsTab'
import BannersTab from '@/components/admin/BannersTab'
import ShippingTab from '@/components/admin/ShippingTab'
import FaqTab from '@/components/admin/FaqTab'
import MediaTab from '@/components/admin/MediaTab'
import BackupsTab from '@/components/admin/BackupsTab'
import SettingsTab from '@/components/admin/SettingsTab'

type TabKey =
  | 'orders' | 'products' | 'leads' | 'banners'
  | 'shipping' | 'faq' | 'media' | 'backups' | 'settings'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'orders',   label: 'Commandes',   icon: ShoppingBag },
  { key: 'products', label: 'Catalogue',   icon: Package },
  { key: 'leads',    label: 'Demandes',    icon: MessageSquare },
  { key: 'banners',  label: 'Bannières',   icon: ImageIcon },
  { key: 'shipping', label: 'Livraison',   icon: Truck },
  { key: 'faq',      label: 'Questions',   icon: HelpCircle },
  { key: 'media',    label: 'Médiathèque', icon: FolderSync },
  { key: 'backups',  label: 'Sauvegardes', icon: Database },
  { key: 'settings', label: 'Réglages',    icon: Settings },
]

const TAB_TITLE: Record<TabKey, string> = {
  orders: 'Commandes clients',
  products: 'Catalogue produits',
  leads: 'Demandes et contacts',
  banners: 'Bannières du site',
  shipping: 'Zones et frais de livraison',
  faq: 'Questions fréquentes',
  media: 'Médiathèque',
  backups: 'Instantanés de configuration',
  settings: 'Coordonnées et réglages',
}

export default function AdminPage() {
  const {
    loading, supabaseEnabled, session, authEmail, isAdmin,
    orders, products, leads, banners, shippingZones, faqs, media, backups,
    signIn, signOut,
  } = useStore()

  const [tab, setTab] = useState<TabKey>('orders')
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'error' } | null>(null)
  const [logoutAsk, setLogoutAsk] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [authError, setAuthError] = useState('')

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setAuthError('')
    const error = await signIn(email.trim(), password)
    setBusy(false)
    if (error) setAuthError(error)
  }

  useEffect(() => {
    if (isAdmin && orders.length) setTab('orders')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  /* Verrouille le défilement de la page quand le tiroir est ouvert. */
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawer])

  /* ─────────────────────────────────────────── états 1 et 2 ─────────── */

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-3 bg-bg-secondary text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    )
  }

  if (!supabaseEnabled) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-secondary px-5 py-12">
        <div className="panel w-full max-w-lg p-7 sm:p-8">
          <AlertTriangle className="mb-4 h-7 w-7" />
          <h1 className="display-md text-2xl">Base de données non configurée</h1>
          <p className="mt-3 text-sm text-text-body">
            Le portail a besoin de l&apos;URL et de la clé publiable Supabase pour
            fonctionner. Sans elles, il ne peut ni lire le catalogue, ni enregistrer
            une commande.
          </p>
          <pre className="admin-scroll mt-5 rounded-2xl bg-bg-secondary p-4 text-xs leading-relaxed">
{`NEXT_PUBLIC_SUPABASE_URL=https://tbaizfoircknsznmpcvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…`}
          </pre>
          <p className="mt-3 text-xs text-text-muted">
            À placer dans <code className="rounded bg-bg-tertiary px-1">.env.local</code>,
            puis relancer le serveur.
          </p>
        </div>
      </div>
    )
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-secondary px-5 py-12">
        <form onSubmit={submitLogin} className="panel w-full max-w-sm p-7 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="admin-label">Administration</span>
          </div>
          <h1 className="display-md text-2xl">Connexion</h1>
          <p className="mt-1 text-sm text-text-muted">
            Réservé aux comptes enregistrés comme administrateurs du site.
          </p>

          <div className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="admin-label mb-1.5 block">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label htmlFor="password" className="admin-label mb-1.5 block">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          {authError && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-accent mt-6 w-full">
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>

          <Link
            href="/"
            className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-text-primary"
          >
            <Home className="h-3.5 w-3.5" /> Retour au site
          </Link>
        </form>
      </div>
    )
  }

  /* ─────────────────────────────────────── état 3 : le portail ───────── */

  const counts: Partial<Record<TabKey, number>> = {
    orders: orders.length,
    products: products.length,
    leads: leads.length,
    banners: banners.length,
    shipping: shippingZones.length,
    faq: faqs.length,
    media: media.length,
    backups: backups.length,
  }
  const newOrders = orders.filter((o) => o.order_status === 'new').length
  const newLeads = leads.filter((l) => l.status === 'new').length

  const NavList = ({ onPick }: { onPick?: () => void }) => (
    <nav className="space-y-0.5" aria-label="Modules">
      {TABS.map(({ key, label, icon: Icon }) => {
        const badge = key === 'orders' ? newOrders : key === 'leads' ? newLeads : 0
        const active = tab === key
        return (
          <button
            key={key}
            onClick={() => { setTab(key); onPick?.() }}
            aria-current={active ? 'page' : undefined}
            className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5
                        text-left text-sm font-semibold transition-colors ${
                          active ? 'bg-black text-white' : 'hover:bg-bg-secondary'
                        }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
              <span className={`text-xs ${active ? 'opacity-70' : 'text-text-muted'}`}>
                {counts[key] ?? 0}
              </span>
            </span>
            {badge > 0 ? (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[0.62rem] font-bold text-white">
                {badge}
              </span>
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-30" />
            )}
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-dvh bg-bg-secondary">
      {/* ══ barre supérieure — commune à toutes les tailles ══ */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawer(true)}
              className="admin-btn w-10 shrink-0 px-0 lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={drawer}
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link href="/" aria-label="Retour au site" className="shrink-0">
              <Image
                src="/brand/logo-light.png"
                alt="Continental®"
                width={150}
                height={42}
                className="h-6 w-auto object-contain sm:h-7"
              />
            </Link>
            <span className="admin-label hidden sm:inline">Administration</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden max-w-[180px] truncate text-xs text-text-muted md:inline">
              {authEmail}
            </span>
            <Link
              href="/"
              target="_blank"
              className="admin-btn hidden sm:inline-flex"
              title="Ouvrir le site dans un nouvel onglet"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Voir le site</span>
            </Link>
            <Button
              variant="ghost"
              onClick={() => setLogoutAsk(true)}
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-5 sm:px-6 lg:py-7">
        {/* ══ barre latérale — écrans larges seulement ══ */}
        <aside className="sticky top-24 hidden h-[calc(100dvh-7rem)] w-64 shrink-0 lg:block">
          <div className="panel flex h-full flex-col overflow-hidden">
            <div className="border-b border-border px-4 py-3.5">
              <p className="admin-label">Modules</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <NavList />
            </div>
            <div className="border-t border-border p-3">
              <p className="truncate text-[0.68rem] text-text-muted">{authEmail}</p>
            </div>
          </div>
        </aside>

        {/* ══ contenu ══ */}
        <main className="min-w-0 flex-1">
          <div className="panel mb-5 px-5 py-4">
            <p className="admin-label">Module actif</p>
            <h1 className="display-md mt-0.5 text-xl sm:text-2xl">{TAB_TITLE[tab]}</h1>
          </div>

          {tab === 'orders'   && <OrdersTab   notify={setToast} />}
          {tab === 'products' && <ProductsTab notify={setToast} />}
          {tab === 'leads'    && <LeadsTab    notify={setToast} newCount={newLeads} />}
          {tab === 'banners'  && <BannersTab  notify={setToast} />}
          {tab === 'shipping' && <ShippingTab notify={setToast} />}
          {tab === 'faq'      && <FaqTab      notify={setToast} />}
          {tab === 'media'    && <MediaTab    notify={setToast} />}
          {tab === 'backups'  && <BackupsTab  notify={setToast} />}
          {tab === 'settings' && <SettingsTab notify={setToast} />}
        </main>
      </div>

      {/* ══ tiroir plein écran — sous `lg` ══ */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col border-l border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="display-sm text-sm uppercase tracking-wide">Menu</span>
              <button
                onClick={() => setDrawer(false)}
                aria-label="Fermer le menu"
                className="admin-btn w-10 px-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <NavList onPick={() => setDrawer(false)} />
            </div>

            <div className="space-y-2 border-t border-border p-3">
              <Link href="/" target="_blank" className="admin-btn w-full">
                <ExternalLink className="h-3.5 w-3.5" /> Voir le site
              </Link>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => { setDrawer(false); setLogoutAsk(true) }}
              >
                <LogOut className="h-3.5 w-3.5" /> Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
      {logoutAsk && (
        <ConfirmDialog
          title="Se déconnecter"
          message="Les modifications non enregistrées seront perdues."
          confirmLabel="Se déconnecter"
          onCancel={() => setLogoutAsk(false)}
          onConfirm={async () => { setLogoutAsk(false); await signOut() }}
        />
      )}
    </div>
  )
}