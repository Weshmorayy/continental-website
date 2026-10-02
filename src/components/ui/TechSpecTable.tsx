import type { Product } from '@/data/products'

interface TechSpecTableProps {
  specs: Product['specs']
}

/** Caractéristiques — lignes séparées par des filets, comme samsung.com. */
export default function TechSpecTable({ specs }: TechSpecTableProps) {
  const entries = Object.entries(specs)

  if (entries.length === 0) return null

  return (
    <div>
      <p className="product-ref text-text-muted uppercase tracking-[0.12em] mb-4">
        Caractéristiques techniques
      </p>

      <dl className="border-t border-border">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="grid grid-cols-1 sm:grid-cols-5 gap-1 sm:gap-6 py-4 hairline"
          >
            <dt className="text-sm text-text-muted sm:col-span-2">{key}</dt>
            <dd className="text-sm font-medium text-text-primary sm:col-span-3">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
