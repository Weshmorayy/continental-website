import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import type { ResolvedSettings } from '@/lib/settings'

/**
 * generatePageMetadata — Helper SEO pour chaque page
 *
 * Usage dans une page :
 * export const metadata = generatePageMetadata({
 *   title: 'Ventilateurs sur Pied',
 *   description: 'Découvrez notre gamme de ventilateurs...',
 *   path: '/ventilateurs',
 * })
 */

interface PageMetaOptions {
  title: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  path = '/',
  image,
  noIndex = false,
}: PageMetaOptions): Metadata {
  const fullTitle = `${title} — ${siteConfig.name}`
  const desc = description ?? siteConfig.description
  const url = `${siteConfig.url}${path}`
  const ogImage = image ?? siteConfig.seo.ogImage

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      locale: 'fr_SN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

/**
 * JSON-LD — Schéma LocalBusiness
 * Placer dans le layout racine ou la page d'accueil
 */
/**
 * Données structurées `LocalBusiness` — la fiche que Google lit pour afficher
 * le numéro, l'adresse et les horaires dans ses résultats.
 *
 * Elle est produite côté serveur à partir des RÉGLAGES, pas du fichier de
 * configuration : un numéro de téléphone périmé dans ces données structures
 * n'est pas seulement faux pour le visiteur, il contredit ce qu'affiche la
 * page. Les deux doivent venir de la même source.
 *
 * Les champs vides sont OMIS plutôt qu'envoyés vides. Une chaîne `""` dans
 * `telephone` ou `streetAddress` est lue par Google comme une valeur
 * affirmée mais inconnue — ce qui est pire que de ne rien déclarer.
 */
export function buildLocalBusinessJsonLd(cfg: ResolvedSettings = siteConfig) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: cfg.name,
    description: cfg.description,
    url: cfg.url,
  }

  if (cfg.contact.phone) schema.telephone = cfg.contact.phone
  if (cfg.contact.email) schema.email = cfg.contact.email

  const hasAddress = cfg.contact.address !== '' || cfg.contact.city !== ''
  if (hasAddress) {
    const address: Record<string, string> = {
      '@type': 'PostalAddress',
      addressLocality: cfg.contact.city,
      addressCountry: 'SN',
    }
    if (cfg.contact.address) address.streetAddress = cfg.contact.address
    schema.address = address
  }

  if (cfg.hours.weekdays || cfg.hours.saturday) {
    schema.openingHours = [
      cfg.hours.weekdays ? `Mo-Fr ${cfg.hours.weekdays}` : null,
      cfg.hours.saturday ? `Sa ${cfg.hours.saturday}` : null,
    ].filter(Boolean).join('; ')
  }

  return schema
}
