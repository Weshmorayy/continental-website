'use client'

/**
 * LeadsTab — Demandes de contact et devis.
 *
 * Ces lignes portent des coordonnées personnelles. Elles ne sont lisibles
 * que par un compte présent dans `site_admins` : la base refuse toute lecture
 * au visiteur, même authentifié ailleurs.
 */

import React, { useState, useMemo } from 'react'
import { MessageSquare, Search, Trash2, MessageCircle, Phone, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/context/StoreContext'
import type { Lead, LeadStatus } from '@/lib/admin-types'
import { LEAD_STATUS_LABEL, LEAD_KIND_LABEL } from '@/lib/admin-types'
import {
  Card, Button, Select, TextInput, Pill, EmptyState, ConfirmDialog,
  Th, Td, formatDate,
} from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

export default function LeadsTab({
  notify, newCount,
}: { notify: Notify; newCount: number }) {
  const { leads, updateLeadStatus, deleteLead, refresh } = useStore()

  const [status, setStatus] = useState<'all' | LeadStatus>('all')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null)

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((l) => {
      if (status !== 'all' && l.status !== status) return false
      if (!q) return true
      return (
        (l.name ?? '').toLowerCase().includes(q) ||
        (l.phone ?? '').toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q) ||
        (l.message ?? '').toLowerCase().includes(q)
      )
    })
  }, [leads, status, search])

  const change = async (l: Lead, next: LeadStatus) => {
    const error = await updateLeadStatus(l.id, next)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
  }

  const remove = async () => {
    if (!confirmDelete) return
    const error = await deleteLead(confirmDelete.id)
    setConfirmDelete(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message: 'Demande supprimée.', tone: 'ok' })
  }

  if (leads.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<MessageSquare className="h-9 w-9" />}
          title="Aucune demande reçue"
          hint="Les messages du formulaire de contact et les demandes de devis apparaîtront ici."
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
              placeholder="Nom, téléphone, contenu du message…"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="lg:w-48"
          >
            <option value="all">Tous les états</option>
            {Object.entries(LEAD_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <div className="rounded-full bg-bg-secondary px-4 py-2 text-xs font-semibold">
            {newCount > 0 ? `${newCount} nouvelle(s)` : 'Rien de nouveau'}
          </div>
        </div>
      </Card>

      <Card>
        <div className="admin-scroll">
          <table className="admin-table">
            <thead className="border-b border-border">
              <tr>
                <Th>Reçue</Th><Th>Type</Th><Th>Contact</Th>
                <Th>Message</Th><Th>État</Th><Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((l) => (
                <React.Fragment key={l.id}>
                  <tr className={open === l.id ? 'bg-bg-secondary' : ''}>
                    <Td label="Reçue" className="whitespace-nowrap text-xs text-text-muted">
                      {formatDate(l.created_at)}
                    </Td>
                    <Td label="Type">
                      <Pill>{LEAD_KIND_LABEL[l.kind]}</Pill>
                      {l.product && (
                        <p className="mt-1 text-xs text-text-muted">{l.product.name}</p>
                      )}
                    </Td>
                    <Td label="Contact" primary>
                      <p className="font-semibold">{l.name ?? '—'}</p>
                      <p className="text-xs text-text-muted">{l.phone ?? l.email ?? '—'}</p>
                      {l.city && <p className="text-xs text-text-muted">{l.city}</p>}
                    </Td>
                    <Td label="Message" className="max-w-[280px]">
                      <p className="truncate text-sm">{l.message ?? '—'}</p>
                      {open !== l.id && (
                        <button
                          onClick={() => setOpen(l.id)}
                          className="mt-1 text-xs font-semibold underline"
                        >
                          Lire
                        </button>
                      )}
                    </Td>
                    <Td label="État">
                      <Select
                        value={l.status}
                        onChange={(e) => change(l, e.target.value as LeadStatus)}
                        className="!py-1.5 text-xs"
                      >
                        {Object.entries(LEAD_STATUS_LABEL).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </Select>
                    </Td>
                    <Td label="" className="justify-end">
                      <Button variant="danger" onClick={() => setConfirmDelete(l)} aria-label="Supprimer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Td>
                  </tr>

                  {open === l.id && (
                    <tr className="bg-bg-secondary">
                      <td colSpan={6} className="px-4 py-5">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <div className="lg:col-span-2">
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                              Message
                            </h4>
                            <p className="whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm">
                              {l.message || 'Aucun message.'}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {l.phone && (
                                <Button
                                  onClick={() =>
                                    window.open(
                                      `https://wa.me/${l.phone!.replace(/[^0-9]/g, '')}`,
                                      '_blank', 'noopener')
                                  }
                                >
                                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                                </Button>
                              )}
                              {l.phone && (
                                <Button onClick={() => window.open(`tel:${l.phone}`)}>
                                  <Phone className="h-3.5 w-3.5" /> Appeler
                                </Button>
                              )}
                              {l.email && (
                                <Button onClick={() => window.open(`mailto:${l.email}`)}>
                                  <Mail className="h-3.5 w-3.5" /> E-mail
                                </Button>
                              )}
                            </div>

                            {l.product && (
                              <Link
                                href={`/produit/${l.product.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Voir {l.product.name} sur le site
                              </Link>
                            )}

                            <div className="flex gap-2 pt-2">
                              {l.status !== 'in_progress' && (
                                <Button onClick={() => change(l, 'in_progress')}>En cours</Button>
                              )}
                              {l.status !== 'done' && (
                                <Button variant="primary" onClick={() => change(l, 'done')}>
                                  Marquer traitée
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {shown.length === 0 && (
          <EmptyState title="Aucune demande ne correspond" hint="Modifiez la recherche ou le filtre." />
        )}
      </Card>

      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cette demande ?"
          message="Les coordonnées de cette personne seront définitivement effacées."
          confirmLabel="Supprimer"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  )
}