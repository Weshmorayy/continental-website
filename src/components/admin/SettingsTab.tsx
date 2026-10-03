'use client'

/**
 * SettingsTab — Coordonnées, horaires, réseaux, SEO, livraison, mentions.
 *
 * Chaque bloc est enregistré séparément : une erreur de validation sur le bloc
 * SEO ne doit pas empêcher d'enregistrer le numéro de téléphone.
 */

import React, { useState, useEffect } from 'react'
import { Check, Save } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { SiteSettings } from '@/lib/admin-types'
import { Card, Button, Field, TextInput, TextArea, Toggle } from '@/components/admin/ui'

type Notify = (t: { message: string; tone: 'ok' | 'error' }) => void

/** Bloc réutilisable : un titre, des champs, un bouton d'enregistrement. */
function Block({
  title, description, dirty, saving, onSave, children,
}: {
  title: string
  description?: string
  dirty: boolean
  saving: boolean
  onSave: () => void
  children: React.ReactNode
}) {
  return (
    <Card
      title={title}
      action={
        <Button variant={dirty ? 'primary' : 'ghost'} onClick={onSave} disabled={saving || !dirty}>
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Enregistrement…' : dirty ? 'Enregistrer' : 'À jour'}
        </Button>
      }
    >
      <div className="space-y-4 p-5">
        {description && <p className="text-sm text-text-muted">{description}</p>}
        {children}
      </div>
    </Card>
  )
}

export default function SettingsTab({ notify }: { notify: Notify }) {
  const { settings, saveSettings, refresh } = useStore()
  const [draft, setDraft] = useState<SiteSettings>(settings)
  const [saving, setSaving] = useState<string | null>(null)

  // Le contexte arrive après le premier rendu : on resynchronise une fois.
  useEffect(() => { setDraft(settings) }, [settings])

  const section = (key: keyof SiteSettings) =>
    JSON.stringify(draft[key]) !== JSON.stringify(settings[key])

  const commit = async (key: keyof SiteSettings, message: string) => {
    setSaving(key)
    const error = await saveSettings({ [key]: draft[key] } as Partial<SiteSettings>)
    setSaving(null)
    if (error) { notify({ message: error, tone: 'error' }); return }
    await refresh()
    notify({ message, tone: 'ok' })
  }

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const setJson = (key: keyof SiteSettings, field: string, value: string | boolean) =>
    setDraft((d) => ({
      ...d,
      [key]: { ...(d[key] as Record<string, unknown>), [field]: value },
    }))

  return (
    <div className="space-y-4">
      {/* ── contact ── */}
      <Block
        title="Coordonnées"
        description="Ces informations alimentent l'en-tête, le pied de page et les boutons WhatsApp."
        dirty={section('contact')}
        saving={saving === 'contact'}
        onSave={() => commit('contact', 'Coordonnées enregistrées.')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone" hint="Format international, espace et + autorisés.">
            <TextInput
              value={draft.contact.phone ?? ''}
              onChange={(e) => setJson('contact', 'phone', e.target.value)}
            />
          </Field>
          <Field label="Numéro WhatsApp" hint="Chiffres uniquement, sans + ni espaces. Ex. : 221770000000">
            <TextInput
              value={draft.contact.whatsapp ?? ''}
              onChange={(e) => setJson('contact', 'whatsapp', e.target.value)}
            />
          </Field>
          <Field label="Adresse e-mail">
            <TextInput
              type="email"
              value={draft.contact.email ?? ''}
              onChange={(e) => setJson('contact', 'email', e.target.value)}
            />
          </Field>
          <Field label="Ville">
            <TextInput
              value={draft.contact.city ?? ''}
              onChange={(e) => setJson('contact', 'city', e.target.value)}
            />
          </Field>
          <Field label="Adresse" className="sm:col-span-2">
            <TextInput
              value={draft.contact.address ?? ''}
              onChange={(e) => setJson('contact', 'address', e.target.value)}
            />
          </Field>
        </div>
      </Block>

      {/* ── horaires ── */}
      <Block
        title="Horaires d'ouverture"
        dirty={section('hours')}
        saving={saving === 'hours'}
        onSave={() => commit('hours', 'Horaires enregistrés.')}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Semaine">
            <TextInput
              value={draft.hours.weekdays ?? ''}
              onChange={(e) => setJson('hours', 'weekdays', e.target.value)}
            />
          </Field>
          <Field label="Samedi">
            <TextInput
              value={draft.hours.saturday ?? ''}
              onChange={(e) => setJson('hours', 'saturday', e.target.value)}
            />
          </Field>
          <Field label="Dimanche">
            <TextInput
              value={draft.hours.sunday ?? ''}
              onChange={(e) => setJson('hours', 'sunday', e.target.value)}
            />
          </Field>
        </div>
      </Block>

      {/* ── réseaux ── */}
      <Block
        title="Réseaux sociaux"
        description="Laissez vide pour masquer l'icône sur le site."
        dirty={section('social')}
        saving={saving === 'social'}
        onSave={() => commit('social', 'Réseaux enregistrés.')}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Facebook">
            <TextInput
              value={draft.social.facebook ?? ''}
              onChange={(e) => setJson('social', 'facebook', e.target.value)}
            />
          </Field>
          <Field label="Instagram">
            <TextInput
              value={draft.social.instagram ?? ''}
              onChange={(e) => setJson('social', 'instagram', e.target.value)}
            />
          </Field>
          <Field label="TikTok">
            <TextInput
              value={draft.social.tiktok ?? ''}
              onChange={(e) => setJson('social', 'tiktok', e.target.value)}
            />
          </Field>
        </div>
      </Block>

      {/* ── livraison ── */}
      <Block
        title="Livraison et paiement"
        dirty={section('delivery') || section('payments')}
        saving={saving === 'delivery' || saving === 'payments'}
        onSave={async () => {
          setSaving('delivery')
          let error = await saveSettings({ delivery: draft.delivery })
          if (!error) error = await saveSettings({ payments: draft.payments })
          setSaving(null)
          if (error) { notify({ message: error, tone: 'error' }); return }
          await refresh()
          notify({ message: 'Réglages enregistrés.', tone: 'ok' })
        }}
      >
        <div className="space-y-4">
          <Field
            label="Livraison offerte à partir de (FCFA)"
            hint="0 désactive la gratuité automatique."
          >
            <TextInput
              type="number"
              min={0}
              value={String(draft.delivery.freeFrom ?? 0)}
              onChange={(e) => setJson('delivery', 'freeFrom', e.target.value)}
            />
          </Field>

          <div className="flex flex-wrap gap-5 rounded-2xl bg-bg-secondary p-4">
            {(
              [
                ['wave', 'Wave'],
                ['orangeMoney', 'Orange Money'],
                ['freeMoney', 'Free Money'],
                ['cash', 'Espèces à la livraison'],
              ] as const
            ).map(([key, label]) => (
              <Toggle
                key={key}
                checked={Boolean(draft.payments[key])}
                onChange={(next) => setJson('payments', key, next)}
                label={label}
              />
            ))}
          </div>
        </div>
      </Block>

      {/* ── SEO ── */}
      <Block
        title="Référencement"
        description="Le titre et la description s'affichent dans les résultats de recherche."
        dirty={section('seo')}
        saving={saving === 'seo'}
        onSave={() => commit('seo', 'Référencement enregistré.')}
      >
        <div className="space-y-4">
          <Field label="Titre du site">
            <TextInput
              value={String(draft.seo.title ?? '')}
              onChange={(e) => setJson('seo', 'title', e.target.value)}
            />
          </Field>
          <Field label="Description" hint="Environ 155 caractères. Ce que l'on lit sur Google.">
            <TextArea
              rows={2}
              value={String(draft.seo.description ?? '')}
              onChange={(e) => setJson('seo', 'description', e.target.value)}
            />
          </Field>
          <Field label="Mots-clés" hint="Un par ligne.">
            <TextArea
              rows={4}
              value={Array.isArray(draft.seo.keywords) ? (draft.seo.keywords as string[]).join('\n') : ''}
              onChange={(e) =>
                setJson('seo', 'keywords', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) as never)
              }
            />
          </Field>
        </div>
      </Block>

      {/* ── mentions légales ── */}
      <Block
        title="Mentions légales"
        description="Affichées en pied de page et sur la page dédiée."
        dirty={section('legal')}
        saving={saving === 'legal'}
        onSave={() => commit('legal', 'Mentions enregistrées.')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Raison sociale">
            <TextInput
              value={draft.legal.company ?? ''}
              onChange={(e) => setJson('legal', 'company', e.target.value)}
            />
          </Field>
          <Field label="RCCM / Numéro d'immatriculation">
            <TextInput
              value={draft.legal.rcm ?? ''}
              onChange={(e) => setJson('legal', 'rcm', e.target.value)}
            />
          </Field>
          <Field label="Adresse du siège" className="sm:col-span-2">
            <TextInput
              value={draft.legal.address ?? ''}
              onChange={(e) => setJson('legal', 'address', e.target.value)}
            />
          </Field>
        </div>
      </Block>
    </div>
  )
}