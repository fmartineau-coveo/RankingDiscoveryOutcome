import { ARCHETYPES, products, dominantAbsFactor, type Product } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { risLabel } from '@/lib/ris'
import { cx } from '@/lib/utils'

/**
 * Each product listed in rank order with a single archetype badge.
 * Softened labels and blurbs to avoid alarming merchandisers — per the
 * discovery's "never mislead, never alarm" posture.
 */

const TONE_BG: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50/40',
  purple: 'border-purple-200 bg-purple-50/40',
  amber: 'border-amber-400/40 bg-amber-400/10',
  rose: 'border-rose-400/40 bg-rose-400/10',
  teal: 'border-teal-500/30 bg-teal-500/10',
  ink: 'border-ink-200 bg-ink-50',
}
const TONE_CHIP: Record<string, string> = {
  blue: 'bg-blue-500 text-white',
  purple: 'bg-purple-500 text-white',
  amber: 'bg-amber-500 text-white',
  rose: 'bg-rose-500 text-white',
  teal: 'bg-teal-500 text-white',
  ink: 'bg-ink-800 text-white',
}
const TONE_TEXT: Record<string, string> = {
  blue: 'text-blue-700',
  purple: 'text-purple-700',
  amber: 'text-amber-600',
  rose: 'text-rose-500',
  teal: 'text-teal-500',
  ink: 'text-ink-700',
}

export default function Archetypes() {
  const sorted = [...products].sort(
    (a, b) => a.factors.Popularity.rankWith - b.factors.Popularity.rankWith,
  )
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Archetypes · auto-assigned from factor profile + rank
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-700">
          Each product carries one merchandising-friendly label derived from its dominant factor
          and its position. The label is descriptive, not prescriptive — no judgement of "good" or
          "bad". Use it to scan the page in rank order and decide where to intervene.
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map((p) => (
          <ProductRow key={p.id} p={p} />
        ))}
      </div>
    </div>
  )
}

function ProductRow({ p }: { p: Product }) {
  const arch = ARCHETYPES[p.archetype]
  const dom = dominantAbsFactor(p)
  const r = p.factors[dom].ris
  return (
    <article
      className={cx(
        'grid grid-cols-[48px_72px_minmax(220px,1.5fr)_minmax(280px,1fr)_minmax(220px,1fr)] items-center gap-4 rounded-2xl border p-3 shadow-soft transition-all hover:shadow-card',
        TONE_BG[arch.tone],
      )}
    >
      <RankBadge rank={p.factors.Popularity.rankWith} size="sm" />
      <ProductThumb product={p} size="sm" />
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold text-ink-900">{p.name}</div>
        <div className="truncate text-[11px] text-ink-500">{p.priceLabel}</div>
      </div>
      <div>
        <span
          className={cx(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
            TONE_CHIP[arch.tone],
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          {arch.label}
        </span>
        <p className="mt-1 text-[11.5px] leading-snug text-ink-700">{arch.blurb}</p>
      </div>
      <div className="flex items-center gap-2">
        <FactorChip factor={dom} size="sm" tone={r >= 0 ? 'blue' : 'purple'} />
        <span className={cx('text-[11px] font-medium', TONE_TEXT[r >= 0 ? 'blue' : 'purple'])}>
          {risLabel(r)}
        </span>
      </div>
    </article>
  )
}
