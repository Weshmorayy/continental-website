import type { Metadata } from 'next'
import { buildLocalBusinessJsonLd } from '@/lib/seo'
import { siteConfig } from '@/config/site'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: siteConfig.seo.keywords,
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
  icons: {
    icon: '/brand/favicon-source.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildLocalBusinessJsonLd()
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-bg-primary text-text-body font-body antialiased">
        {children}
      </body>
    </html>
  )
}
