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
 */

import React, { useState, useMemo } from 'react'
import { ScrollText, Search, RefreshCw } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
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

const TONE: Record<string, 'neutral' | 'ok' | 'warn' | 'danger' | 'dark'> = {
  create: 'ok',
  update: 'neutral',
  delete: 'danger',
  login: 'dark',
  logout: 'neutral',
  restore: 'warn',
}

export default function LogsTab() {
  const { audits, refresh } = useStore()
  const [search, setSearch] = useState('')
  const [entity, setEntity] = useState('all')
  const [busy, setBusy] = useState(false)

  const entities = useMemo(
    () => Array.from(new Set(audits.map((a) => a.entity))),
    [audits],
  )

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return audits.filter((a) => {
      if (entity !== 'all' && a.entity !== entity) return false
      if (!q) return true
      return (
        (a.label ?? '').toLowerCase().includes(q) ||
        (a.actor_email ?? '').toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q)
      )
    })
  }, [audits, search, entity])

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
      <Card>
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un nom, un auteur, une action…"
              className="pl-9"
            />
          </div>
          <Select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="lg:w-56"
          >
            <option value="all">Tous les modules</option>
            {entities.map((k) => (
              <option key={k} value={k}>{ENTITY_LABEL[k] ?? k}</option>
            ))}
          </Select>
          <Button
            onClick={async () => { setBusy(true); await refresh(); setBusy(false) }}
            aria-label="Actualiser"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>
      </Card>

      <Card>
        <div className="admin-scroll">
          <table className="admin-table">
            <thead className="border-b border-border">
              <tr>
                <th>Quand</th>
                <th>Auteur</th>
                <th>Action</th>
                <th>Module</th>
                <th>Élément</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((a) => (
                <tr key={a.id}>
                  <td data-label="Quand" className="whitespace-nowrap text-xs text-text-muted">
                    {formatDate(a.created_at)}
                  </td>
                  <td data-label="Auteur" data-cell="primary" className="text-sm">
                    {a.actor_email || '—'}
                  </td>
                  <td data-label="Action">
                    <Pill tone={TONE[a.action] ?? 'neutral'}>
                      {AUDIT_ACTION_LABEL[a.action] ?? a.action}
                    </Pill>
                  </td>
                  <td data-label="Module" className="text-text-muted">
                    {ENTITY_LABEL[a.entity] ?? a.entity}
                  </td>
                  <td data-label="Élément" className="text-text-body">
                    {a.label || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {shown.length === 0 && (
          <EmptyState title="Aucune entrée" hint="Modifiez la recherche ou le filtre." />
        )}
      </Card>
    </div>
  )
}