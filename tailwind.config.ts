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
          tertiary:  'var(--color-bg-tertiary)',
          dark:      'var(--color-bg-dark)',
          'dark-card': 'var(--color-bg-dark-card)',
          card:      'var(--color-bg-card)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          body:    'var(--color-text-body)',
          muted:   'var(--color-text-muted)',
          light:   'var(--color-text-light)',
          'light-sub': 'var(--color-text-light-sub)',
          'light-mute': 'var(--color-text-light-mute)',
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
      transitionDuration: { '200': '200ms', '300': '300ms' },
    },
  },
  plugins: [],
}

export default config
