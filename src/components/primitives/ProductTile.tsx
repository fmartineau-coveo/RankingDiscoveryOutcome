import type { Product } from '@/data/mockData'
import { cx } from '@/lib/utils'

type Props = {
  product: Product
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Abstract SVG thumbnail — no external imagery. Shape varies by silhouette
 * so 12 products feel visually distinct on lists/heatmaps.
 */
export function ProductThumb({ product, size = 'md', className }: Props) {
  const px = size === 'xs' ? 32 : size === 'sm' ? 48 : size === 'md' ? 72 : 120
  const palettes: Record<Product['silhouette'], [string, string]> = {
    modular: ['#DCE6FF', '#3B68F4'],
    sectional: ['#EADBFF', '#7D3EE0'],
    chaise: ['#D6F1EA', '#14B8A6'],
    recliner: ['#F4D9A5', '#E8A73C'],
    loveseat: ['#F7D0DE', '#E64778'],
    tufted: ['#DDE1EF', '#4B5079'],
  }
  const [bg, fg] = palettes[product.silhouette]
  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-xl border border-ink-200 shadow-soft',
        className,
      )}
      style={{ width: px, height: px, background: bg }}
    >
      <Silhouette silhouette={product.silhouette} color={fg} />
    </div>
  )
}

function Silhouette({ silhouette, color }: { silhouette: Product['silhouette']; color: string }) {
  const common = 'absolute inset-0'
  switch (silhouette) {
    case 'modular':
      return (
        <svg className={common} viewBox="0 0 100 100" fill="none">
          <rect x="10" y="55" width="80" height="22" rx="4" fill={color} />
          <rect x="10" y="40" width="24" height="20" rx="4" fill={color} opacity="0.85" />
          <rect x="38" y="40" width="24" height="20" rx="4" fill={color} opacity="0.85" />
          <rect x="66" y="40" width="24" height="20" rx="4" fill={color} opacity="0.85" />
          <rect x="16" y="77" width="6" height="10" rx="1" fill={color} />
          <rect x="78" y="77" width="6" height="10" rx="1" fill={color} />
        </svg>
      )
    case 'sectional':
      return (
        <svg className={common} viewBox="0 0 100 100" fill="none">
          <path d="M10 58 H58 V42 H74 V58 H90 V80 H10 Z" fill={color} />
          <path d="M10 42 H58 V58 H10 Z" fill={color} opacity="0.85" />
          <rect x="14" y="80" width="6" height="8" fill={color} />
          <rect x="80" y="80" width="6" height="8" fill={color} />
        </svg>
      )
    case 'chaise':
      return (
        <svg className={common} viewBox="0 0 100 100" fill="none">
          <path d="M10 60 H78 L88 52 V72 H10 Z" fill={color} />
          <rect x="10" y="42" width="20" height="20" rx="3" fill={color} opacity="0.85" />
          <rect x="14" y="72" width="6" height="10" fill={color} />
          <rect x="78" y="72" width="6" height="10" fill={color} />
        </svg>
      )
    case 'recliner':
      return (
        <svg className={common} viewBox="0 0 100 100" fill="none">
          <path d="M28 30 L44 28 L48 58 L30 60 Z" fill={color} opacity="0.85" />
          <rect x="20" y="58" width="60" height="18" rx="4" fill={color} />
          <path d="M80 58 L90 80 L72 80 Z" fill={color} />
          <rect x="26" y="76" width="6" height="8" fill={color} />
          <rect x="64" y="76" width="6" height="8" fill={color} />
        </svg>
      )
    case 'loveseat':
      return (
        <svg className={common} viewBox="0 0 100 100" fill="none">
          <rect x="18" y="40" width="64" height="24" rx="6" fill={color} opacity="0.85" />
          <rect x="14" y="56" width="72" height="22" rx="8" fill={color} />
          <rect x="22" y="78" width="6" height="8" fill={color} />
          <rect x="72" y="78" width="6" height="8" fill={color} />
        </svg>
      )
    case 'tufted':
      return (
        <svg className={common} viewBox="0 0 100 100" fill="none">
          <rect x="14" y="42" width="72" height="28" rx="6" fill={color} opacity="0.85" />
          <rect x="10" y="58" width="80" height="22" rx="6" fill={color} />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx={22 + i * 12} cy={52} r={2} fill="white" opacity="0.7" />
          ))}
          <rect x="20" y="80" width="6" height="8" fill={color} />
          <rect x="74" y="80" width="6" height="8" fill={color} />
        </svg>
      )
  }
}
