/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const isExport = process.env.NEXT_OUTPUT === 'export'

/**
 * Hôtes distants autorisés par `next/image`.
 *
 * Les visuels choisis dans l'administration vivent dans le seau public
 * Supabase et sont stockés en adresse COMPLETE. Sans cette déclaration,
 * `next/image` refuse l'hôte au build ou à l'exécution (« hostname not
 * configured ») et l'image ne s'affiche pas — un défaut invisible côté
 * console, puisque la page continue de se rendre.
 *
 * On déduit l'hôte de la variable d'environnement pour qu'un projet
 * Supercode différent n'ait rien à reconfigurer. Si elle est absente au
 * build, on retombe sur le motif générique : mieux vaut autoriser large que
 * voir toutes les téléversions casser.
 */
const storageRemote = (() => {
  const pattern = { protocol: 'https', pathname: '/storage/v1/object/public/**' }
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    if (hostname) return [{ ...pattern, hostname }]
  } catch {
    /* variable absente ou illisible : repli ci-dessous */
  }
  return [{ ...pattern, hostname: '*.supabase.co' }]
})()

const nextConfig = {
  output: isExport ? 'export' : 'standalone',

  images: {
    /*
     * ⚠ Pas d'optimisation côté serveur, volontairement.
     *
     * `next/image` fait télécharger l'image par le serveur avant de la
     * renvoyer. Or l'hôte de stockage Supabase est joignable depuis un
     * navigateur mais pas depuis le serveur : l'optimiseur expire et
     * répond 500 — l'image est alors PLUS cassée qu'avant. Le navigateur,
     * lui, va chercher le fichier directement chez Supabase, ce qui est plus
     * rapide et toujours disponible.
     *
     * On garde donc remotePatterns : sans lui, `next/image` refuse l'hôte
     * et le composant affiche une image cassée même en mode unoptimized.
     */
    unoptimized: true,
    remotePatterns: storageRemote,
  },

  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',             value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
