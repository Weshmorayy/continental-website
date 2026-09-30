import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          dark:      'var(--color-bg-dark)',
          card:      'var(--color-bg-card)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          light:   'var(--color-text-light)',
          body:    'var(--color-text-body)',
          muted:   'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover:   'var(--color-accent-hover)',
          light:   'var(--color-accent-light)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          dark:    'var(--color-border-dark)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      transitionDuration: { '250': '250ms', '350': '350ms' },
    },
  },
  plugins: [],
}

export default config
