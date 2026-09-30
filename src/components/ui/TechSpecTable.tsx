import type { Product } from '@/data/products'

interface TechSpecTableProps {
  specs: Product['specs']
}

export default function TechSpecTable({ specs }: TechSpecTableProps) {
  const entries = Object.entries(specs)

  if (entries.length === 0) return null

  return (
    <div className="border border-border">
      <div className="bg-bg-secondary px-4 py-2.5 border-b border-border">
        <p className="product-ref text-text-muted tracking-[0.2em]">CARACTÉRISTIQUES TECHNIQUES</p>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr
              key={key}
              className={i % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-secondary'}
            >
              <td className="px-4 py-2.5 text-text-muted font-medium border-r border-border w-2/5">
                {key}
              </td>
              <td className="px-4 py-2.5 text-text-primary font-mono-ref text-xs">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
