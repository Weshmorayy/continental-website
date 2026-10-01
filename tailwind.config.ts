import type { Config } from 'tailwindcss'

/**
 * Les couleurs sont des canaux RGB bruts (`184 78 34`) stockés dans
 * globals.css. Le motif `rgb(var(--x) / <alpha-value>)` est ce qui rend
 * les modificateurs d'opacité fonctionnels — ex. `bg-bg-primary/95`,
 * `text-text-muted/60`, `border-border-dark/15`.
 *
 * ⚠ Si vous réintroduisez une couleur hexadécimale ici, les modificateurs
 *   d'opacité cesseront silencieusement de fonctionner sur cette couleur.
 */
const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`

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
          primary:    token('--color-bg-primary'),
          secondary:  token('--color-bg-secondary'),
          tertiary:   token('--color-bg-tertiary'),
          dark:       token('--color-bg-dark'),
          'dark-card':token('--color-bg-dark-card'),
          card:       token('--color-bg-card'),
        },
        text: {
          primary:     token('--color-text-primary'),
          body:        token('--color-text-body'),
          muted:       token('--color-text-muted'),
          light:       token('--color-text-light'),
          'light-sub': token('--color-text-light-sub'),
          'light-mute':token('--color-text-light-mute'),
        },
        accent: {
          DEFAULT: token('--color-accent'),
          hover:   token('--color-accent-hover'),
          light:   token('--color-accent-light'),
        },
        gold: {
          DEFAULT: token('--color-gold'),
        },
        border: {
          DEFAULT: token('--color-border'),
          dark:    token('--color-border-dark'),
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body:    ['var(--font-body)',    'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      transitionDuration: { '250': '250ms' },
    },
  },
  plugins: [],
}

export default config
