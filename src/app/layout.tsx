import type { Metadata } from 'next'
import { buildLocalBusinessJsonLd } from '@/lib/seo'
import { getSiteSettings } from '@/lib/atelier'
import { siteConfig } from '@/config/site'
import {
  BEFORE_SEND_HANDLER,
  BEFORE_SEND_SOURCE,
  UMAMI_SCRIPT_SRC,
  UMAMI_WEBSITE_ID,
  isAnalyticsEnabled,
} from '@/config/analytics'
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
        {/*
          * Mesure d'audience — Umami, auto-hébergé (voir `deploy/umami/`).
          *
          * Les deux balises sont écrites ici, dans la partie serveur du
          * document, et non chargées par un composant client :
          *
          *   • la première définit le filtre que le script appellera avant
          *     chaque envoi. Elle doit être exécutée AVANT le script, sinon
          *     Umami ne trouverait pas la fonction et enverrait tout — y
          *     compris les visites d'administration et les jetons de
          *     commande ;
          *   • la seconde charge le script lui-même.
          *
          * Aucune des deux n'est émise tant que les variables publiques
          * d'Umami sont absentes : sans elles, le site n'appelle rien à
          * l'extérieur, et le compteur de repli de `PageView` prend le relais.
          */}
        {isAnalyticsEnabled && (
          <>
            <script dangerouslySetInnerHTML={{ __html: BEFORE_SEND_SOURCE }} />
            <script
              defer
              src={UMAMI_SCRIPT_SRC}
              data-website-id={UMAMI_WEBSITE_ID}
              data-before-send={BEFORE_SEND_HANDLER}
            />
          </>
        )}
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
