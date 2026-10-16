'use client'

/**
 * LogsTab — Journal des actions.
 *
 * Chaque modification faite dans l'administration laisse une ligne : qui, quoi,
 * quand. Le journal est en ajout SEUL côté base — un déclencheur refuse
 * toute mise à jour ou suppression, même par le propriétaire.
 *
 * Le journal ne ment pas sur ce qu'il n'a pas enregistré : c'est `log_event()`
 * qui écrit, dans la même transaction que la modification.
 *
 * ── Ce qui a changé, et pourquoi ──────────────────────────────────────────
 * L'écran était un TABLEAU de cinq colonnes : sur un téléphone, cinq lignes de
 * texte comprimées, et l'auteur — l'information la plus utile — réduit à une
 * adresse e-mail tronquée. La forme retenue est celle des Commandes : un
 * BANDEAU DE CHIFFRES qui dit ce qu'il y a à voir, puis une FICHE PAR ENTRÉE
 * dont la lecture suit l'ordre de la question qu'on se pose (« qui a fait
 * quoi, et sur quoi »).
 *
 * Trois choses ont été ajoutées, qui manquaient :
 *
 *   1. Un NIVEAU par entrée, déduit du verbe d'action. Il n'existe pas de
 *      colonne « sévérité » en base : le classement se fait sur `action`
 *      (voir `levelOf`). Il sert à la pastille et au filtre.
 *   2. Des FILTRES PAR NIVEAU, en plus du module. Chercher « qui a supprimé
 *      quelque chose » demandait de parcourir la liste à l'œil.
 *   3. Un AFFICHAGE PROGRESSIF : le journal ne fait que grandir, et rendre
 *      dix ans de lignes d'un coup coûte cher pour rien.
 *
 * La palette reste MONOCHROME : gris pour l'information, noir plein pour ce
 * qui compte, et contour noir sur blanc pour une suppression. Aucune couleur
 * n'est introduite — une suppression se signale par le contraste, pas par un
 * feu rouge.
 */

import React, { useState, useMemo } from 'react'
import {
  ScrollText, Search, RefreshCw, X, User, UserRound, Boxes,
  ShieldCheck, Fingerprint, Clock,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { AuditEvent } from '@/lib/admin-types'
import { AUDIT_ACTION_LABEL } from '@/lib/admin-types'
import {
  Card, Button, TextInput, Select, Pill, EmptyState, formatDate,
} from '@/components/admin/ui'

const ENTITY_LABEL: Record<string, string> = {
  products: 'Catalogue',
  categories: 'Catégories',
  banners: 'Bannières',
  faqs: 'Questions',
  shipping_zones: 'Livraison',
  site_settings: 'Réglages',
  content_blocks: 'Contenu',
  site_admins: 'Utilisateurs',
  orders: 'Commandes',
  leads: 'Demandes',
  media: 'Médiathèque',
  site_backups: 'Sauvegardes',
}

/** Rôle de l'auteur, tel que la table `site_admins` le déclare. */
const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrateur',
  editor: 'Éditeur',
}

/* ─────────────────────────────────────────────────────────────── niveaux ── */

/**
 * Trois niveaux, et pas plus : ce qui informe, ce qui compte, ce qui détruit.
 *
 * ⚠ `AuditEvent` n'a PAS de colonne de sévérité — seulement `action`. Le
 *   niveau est donc DÉDUIT du verbe, et c'est le seul endroit où il l'est :
 *   la pastille, le filtre et le bandeau lisent tous `levelOf`. Une action
 *   inconnue tombe en « information » : on ne signale pas comme grave ce
 *   qu'on n'a pas su classer.
 */
type Level = 'info' | 'important' | 'critical'

const LEVEL_OF: Record<string, Level> = {
  update: 'info',
  logout: 'info',
  create: 'important',
  login: 'important',
  publish: 'important',
  restore: 'important',
  export: 'important',
  delete: 'critical',
}

const LEVELS: Level[] = ['info', 'important', 'critical']

const LEVEL_LABEL: Record<Level, string> = {
  info: 'Information',
  important: 'Important',
  critical: 'Sensible',
}

function levelOf(action: string): Level {
  return LEVEL_OF[action] ?? 'info'
}

/**
 * La pastille d'action porte le niveau.
 *
 * L'information est en gris, ce qui compte en noir plein, et la suppression
 * en CONTOUR noir sur blanc : dans une palette sans rouge ni ambre, c'est le
 * contraste — et non une couleur — qui distingue l'irréversible.
 */
function ActionPill({ action }: { action: string }) {
  const label = AUDIT_ACTION_LABEL[action] ?? action
  const level = levelOf(action)

  if (level === 'critical') {
    return (
      <span className="pill border border-black bg-white text-text-primary">
        {label}
      </span>
    )
  }
  return <Pill tone={level === 'important' ? 'dark' : 'neutral'}>{label}</Pill>
}

/* ─────────────────────────────────────────────────────────────── l'écran ── */

export default function LogsTab() {
  const { audits, loading, refresh } = useStore()

  const [search, setSearch] = useState('')
  const [level, setLevel] = useState<'all' | Level>('all')
  const [entity, setEntity] = useState('all')
  const [limit, setLimit] = useState(20)
  const [busy, setBusy] = useState(false)

  /* ── chiffres du bandeau ───────────────────────────────────────────────── */

  const stats = useMemo(() => {
    const midnight = new Date()
    midnight.setHours(0, 0, 0, 0)
    return {
      total: audits.length,
      today: audits.filter((a) => new Date(a.created_at) >= midnight).length,
      actors: new Set(audits.map((a) => a.actor_email).filter(Boolean)).size,
      // Le bandeau dit ce que le filtre « Sensible » isole : les deux lisent
      // `levelOf`, donc ils ne peuvent pas se contredire.
      critical: audits.filter((a) => levelOf(a.action) === 'critical').length,
    }
  }, [audits])

  /** Combien d'entrées par niveau — affiché sur chaque pilule de filtre. */
  const byLevel = useMemo(() => {
    const counts: Record<Level, number> = { info: 0, important: 0, critical: 0 }
    for (const a of audits) counts[levelOf(a.action)] += 1
    return counts
  }, [audits])

  const entities = useMemo(
    () => Array.from(new Set(audits.map((a) => a.entity))).sort(),
    [audits],
  )

  /* ── filtrage ──────────────────────────────────────────────────────────── */

  /*
   * La recherche couvre tout ce qui NOMME une entrée : le compte, son rôle,
   * le verbe d'action (en anglais comme en français), le module (en clair
   * comme en base), l'élément et son identifiant. Chercher « Sénégal » dans
   * une bannière, ou l'e-mail d'un éditeur, doit ramener la ligne.
   */
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return audits.filter((a) => {
      if (level !== 'all' && levelOf(a.action) !== level) return false
      if (entity !== 'all' && a.entity !== entity) return false
      if (!q) return true
      return (
        (a.actor_email ?? '').toLowerCase().includes(q) ||
        (a.actor_role ?? '').toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        (AUDIT_ACTION_LABEL[a.action] ?? '').toLowerCase().includes(q) ||
        a.entity.toLowerCase().includes(q) ||
        (ENTITY_LABEL[a.entity] ?? '').toLowerCase().includes(q) ||
        (a.label ?? '').toLowerCase().includes(q) ||
        (a.entity_id ?? '').toLowerCase().includes(q)
      )
    })
  }, [audits, search, level, entity])

  const visible = shown.slice(0, limit)

  /* ── journal pas encore chargé ─────────────────────────────────────────── */

  if (loading && audits.length === 0) {
    return (
      <Card>
        <div className="space-y-3 p-4" role="status" aria-live="polite">
          <span className="admin-label">Chargement du journal…</span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-bg-secondary" />
          ))}
        </div>
      </Card>
    )
  }

  /* ── aucun entrée du tout ──────────────────────────────────────────────── */

  if (audits.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ScrollText className="h-9 w-9" />}
          title="Le journal est vide"
          hint="Chaque création, modification et suppression faite dans l'administration apparaîtra ici."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── en-tête ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="display-md text-lg sm:text-xl">Journal d&apos;activité</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {stats.total} entrée{stats.total > 1 ? 's' : ''}, dans l&apos;ordre où elles
            ont eu lieu. Rien ne s&apos;efface.
          </p>
        </div>

        <Button
          onClick={async () => { setBusy(true); await refresh(); setBusy(false) }}
          disabled={busy || loading}
          aria-label="Actualiser le journal"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{busy ? 'Actualisation…' : 'Actualiser'}</span>
        </Button>
      </div>

      {/* ── bandeau de chiffres ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Entrées"
          value={String(stats.total)}
          hint="Depuis l'ouverture du journal"
          icon={<ScrollText className="h-4 w-4" />}
        />
        <Stat
          label="Aujourd'hui"
          value={String(stats.today)}
          hint="Depuis minuit"
          icon={<Clock className="h-4 w-4" />}
          strong={stats.today > 0}
        />
        <Stat
          label="Auteurs"
          value={String(stats.actors)}
          hint="Comptes ayant agi"
          icon={<UserRound className="h-4 w-4" />}
        />
        <Stat
          label="Sensibles"
          value={String(stats.critical)}
          hint="Suppressions enregistrées"
          icon={<Fingerprint className="h-4 w-4" />}
          strong={stats.critical > 0}
        />
      </div>

      {/* ── filtres ── */}
      <Card>
        <div className="space-y-3 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Compte, action, module, élément…"
              className="pl-9 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Effacer la recherche"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Le niveau n'est pas une couleur : c'est un filtre à part
                entière, avec son compte, pour répondre à « qui a supprimé
                quelque chose ? » sans parcourir la liste à l'œil. */}
            <div
              role="group"
              aria-label="Filtrer par niveau"
              className="flex flex-wrap gap-1.5"
            >
              <button
                type="button"
                onClick={() => setLevel('all')}
                aria-pressed={level === 'all'}
                className={`admin-btn shrink-0 ${level === 'all' ? 'admin-btn-primary' : ''}`}
              >
                Tous les niveaux
                <span className="text-[0.68rem] font-normal opacity-70">{stats.total}</span>
              </button>

              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  aria-pressed={level === l}
                  className={`admin-btn shrink-0 ${level === l ? 'admin-btn-primary' : ''}`}
                >
                  {LEVEL_LABEL[l]}
                  <span className="text-[0.68rem] font-normal opacity-70">{byLevel[l]}</span>
                </button>
              ))}
            </div>

            <Select
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              aria-label="Filtrer par module"
              className="lg:ml-auto lg:w-56"
            >
              <option value="all">Tous les modules</option>
              {entities.map((k) => (
                <option key={k} value={k}>{ENTITY_LABEL[k] ?? k}</option>
              ))}
            </Select>

            {/* Une seule ligne de JSX : couper l'accord après `affichée`
                insérerait une espace et donnerait « affichée s ». */}
            <p className="text-xs text-text-muted">
              {shown.length} entrée{shown.length > 1 ? 's' : ''} affichée{shown.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </Card>

      {/* ── fiches ── */}
      {shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search className="h-9 w-9" />}
            title="Aucune entrée ne correspond"
            hint="Modifiez la recherche, le niveau ou le module."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => <LogEntry key={a.id} event={a} />)}

          {shown.length > visible.length && (
            <Button className="w-full" onClick={() => setLimit((n) => n + 20)}>
              Voir les {Math.min(20, shown.length - visible.length)} entrées suivantes
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────── sous-vues ── */

/**
 * Une tuile de chiffre.
 *
 * `strong` met la tuile en évidence quand le chiffre demande l'attention :
 * « aujourd'hui : 0 » n'a pas à crier, « sensibles : 3 » le doit. La mise en
 * évidence est un FILET NOIR, pas un fond coloré — la palette n'en a pas.
 */
function Stat({
  label, value, hint, icon, strong = false,
}: {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
  strong?: boolean
}) {
  return (
    <div className={`panel p-4 ${strong ? 'border-black' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="admin-label">{label}</span>
        <span className={strong ? 'text-text-primary' : 'text-text-muted'}>{icon}</span>
      </div>
      <p className="display-md mt-2 text-lg sm:text-xl">{value}</p>
      <p className="mt-0.5 text-[0.68rem] text-text-muted">{hint}</p>
    </div>
  )
}

/**
 * Une entrée du journal, en une fiche.
 *
 * L'ordre de lecture suit la question qu'on se pose : de quand date-t-elle et
 * que s'est-il passé (en-tête), qui l'a fait et sur quoi (corps), et quelle
 * ligne exacte a été touchée (pied, seulement si l'identifiant existe).
 */
function LogEntry({ event }: { event: AuditEvent }) {
  const moduleLabel = ENTITY_LABEL[event.entity] ?? event.entity
  const title = event.label || moduleLabel
  const role = event.actor_role ? ROLE_LABEL[event.actor_role] ?? event.actor_role : null

  return (
    <article className="panel overflow-hidden">
      {/* ── en-tête : quoi, et quand ── */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <ActionPill action={event.action} />
          <span className="truncate text-sm font-semibold">{title}</span>
        </div>
        <span className="whitespace-nowrap text-xs text-text-muted">
          {formatDate(event.created_at)}
        </span>
      </header>

      {/* ── corps : qui, où, sur quoi ── */}
      <div className="grid gap-x-6 gap-y-2 px-4 py-3 text-sm sm:grid-cols-2">
        <p className="flex items-center gap-2 text-text-body">
          <User className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          <span className="truncate">{event.actor_email || 'Auteur non enregistré'}</span>
        </p>

        <p className="flex items-center gap-2 text-text-body">
          <Boxes className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          <span className="truncate">{moduleLabel}</span>
        </p>

        {role && (
          <p className="flex items-center gap-2 text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{role}</span>
          </p>
        )}
      </div>

      {/* ── pied : la ligne exacte touchée ── */}
      {event.entity_id && (
        <p className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-text-muted">
          <Fingerprint className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono-ref truncate text-xs">{event.entity_id}</span>
        </p>
      )}
    </article>
  )
}
