import type { Product } from '@/data/products'

interface TechSpecTableProps {
  specs: Product['specs']
}

export default function TechSpecTable({ specs }: TechSpecTableProps) {
  const entries = Object.entries(specs)

  if (entries.length === 0) return null

  return (
    <div className="rounded-3xl border border-border overflow-hidden">
      <div className="bg-bg-secondary px-6 py-4 border-b border-border">
        <p className="product-ref text-text-muted tracking-[0.2em]">Caractéristiques techniques</p>
      </div>
      <dl>
        {entries.map(([key, value], i) => (
          <div
            key={key}
            className={`grid grid-cols-1 sm:grid-cols-5 gap-1 sm:gap-4 px-6 py-3.5 ${
              i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-secondary'
            } ${i !== entries.length - 1 ? 'border-b border-border/60' : ''}`}
          >
            <dt className="text-sm text-text-muted sm:col-span-2">{key}</dt>
            <dd className="text-sm font-medium text-text-primary sm:col-span-3">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
