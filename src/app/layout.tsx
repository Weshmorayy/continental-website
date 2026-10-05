import type { Metadata } from 'next'
import { buildLocalBusinessJsonLd } from '@/lib/seo'
import { getSiteSettings } from '@/lib/atelier'
import { siteConfig } from '@/config/site'
import PageView from '@/components/PageView'
import CartDrawer from '@/components/cart/CartDrawer'
import { CartProvider } from '@/context/CartContext'
import { StoreProvider } from '@/context/StoreContext'
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildLocalBusinessJsonLd(await getSiteSettings())
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-bg-primary text-text-body font-body antialiased">
        {/*
          * `StoreProvider` doit envelopper `CartProvider` : le panier lit les
          * zones de livraison et appelle `placeOrder()`, tous deux fournis par
          * le contexte de données. L'ordre inverse donnerait un panier qui ne
          * connaît pas les zones à la première hydratation.
          */}
        <StoreProvider>
          <CartProvider>
            <PageView />
            {children}
            {/* Le tiroir est monté une fois pour tout le site : il suit le
                visiteur sur chaque page. */}
            <CartDrawer />
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
