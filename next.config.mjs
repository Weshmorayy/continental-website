/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const isExport = process.env.NEXT_OUTPUT === 'export'

const nextConfig = {
  output: isExport ? 'export' : 'standalone',

  images: {
    unoptimized: isExport,
  },

  reactStrictMode: true,

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
