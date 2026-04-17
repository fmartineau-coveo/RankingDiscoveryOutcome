import { useState } from 'react'
import {
  ARCHETYPES,
  FACTORS,
  products,
  dominantAbsFactor,
  type FactorName,
  type Product,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { risLabel } from '@/lib/ris'
import { cx } from '@/lib/utils'
import { ChevronDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

/**
 * Each product listed in rank order with a single archetype badge.
 * Softened labels and blurbs to avoid alarming merchandisers — per the
 * discovery's "never mislead, never alarm" posture.
 *
 * Expansion: clicking a row opens a per-product factor read that mirrors the
 * "What the model is doing" section of the Ranking Impact Scorecard V3 —
 * symmetric "lifts this product / lifts competitors" phrasing, no bars, one
 * sentence per factor, asymmetric framing (counterfactual for factors helping
 * this product, direct competitive-position statement for factors helping its
 * competitors). One row open at a time keeps the scan-the-page posture of
 * the archetype view intact.
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

type Verdict = {
  label: string
  tone: 'blue' | 'purple' | 'muted'
  direction: 'this' | 'competitors' | 'neither'
}

function softVerdict(ris: number): Verdict {
  if (Math.abs(ris) < 0.05)
    return { label: 'Negligible effect on this page', tone: 'muted', direction: 'neither' }
  if (ris > 0.6) return { label: 'Strongly lifts this product', tone: 'blue', direction: 'this' }
  if (ris > 0.3) return { label: 'Clearly lifts this product', tone: 'blue', direction: 'this' }
  if (ris > 0.05) return { label: 'Mildly lifts this product', tone: 'blue', direction: 'this' }
  if (ris < -0.6) return { label: 'Strongly lifts competitors here', tone: 'purple', direction: 'competitors' }
  if (ris < -0.3) return { label: 'Clearly lifts competitors here', tone: 'purple', direction: 'competitors' }
  return { label: 'Mildly lifts competitors here', tone: 'purple', direction: 'competitors' }
}

function factorSentence(
  factor: FactorName,
  rankWith: number,
  rankWithout: number,
  direction: Verdict['direction'],
): string {
  if (direction === 'this') {
    const delta = rankWithout - rankWith
    if (delta === 0) return `Without ${factor}, this product would still sit at rank ${rankWith}.`
    return `Without ${factor}, this product would fall from rank ${rankWith} to rank ${rankWithout}.`
  }
  if (direction === 'competitors') {
    return `${factor} is giving a bigger lift to competing products on this page than to this one.`
  }
  return `${factor} isn't meaningfully shaping this product's position here.`
}

export default function Archetypes() {
  const sorted = [...products].sort(
    (a, b) => a.factors.Popularity.rankWith - b.factors.Popularity.rankWith,
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Archetypes · auto-assigned from factor profile + rank
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-700">
          Each product carries one merchandising-friendly label derived from its dominant factor
          and its position. The label is descriptive, not prescriptive — no judgement of "good" or
          "bad". Scan the page in rank order to triage it, then{' '}
          <strong>click any row to see the full factor read</strong> for that product.
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map((p) => (
          <ProductRow
            key={p.id}
            p={p}
            expanded={expandedId === p.id}
            onToggle={() => setExpandedId((cur) => (cur === p.id ? null : p.id))}
          />
        ))}
      </div>
    </div>
  )
}

function ProductRow({
  p,
  expanded,
  onToggle,
}: {
  p: Product
  expanded: boolean
  onToggle: () => void
}) {
  const arch = ARCHETYPES[p.archetype]
  const dom = dominantAbsFactor(p)
  const r = p.factors[dom].ris
  return (
    <article
      className={cx(
        'rounded-2xl border shadow-soft transition-all',
        TONE_BG[arch.tone],
        expanded && 'shadow-card',
      )}
    >
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="grid w-full grid-cols-[48px_72px_minmax(220px,1.5fr)_minmax(280px,1fr)_minmax(220px,1fr)_28px] items-center gap-4 rounded-2xl p-3 text-left transition-colors hover:bg-white/40"
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
        <span
          className={cx(
            'grid h-7 w-7 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition-transform',
            expanded && 'rotate-180 border-ink-900 bg-ink-900 text-white',
          )}
          aria-hidden
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </button>

      {expanded && <FactorBreakdown p={p} />}
    </article>
  )
}

function FactorBreakdown({ p }: { p: Product }) {
  // Order factors by materiality (|RIS|) so the most important row is first —
  // matches the V3 "What the model is doing" convention.
  const ordered = [...FACTORS].sort(
    (a, b) => Math.abs(p.factors[b].ris) - Math.abs(p.factors[a].ris),
  )
  return (
    <div className="border-t border-ink-200/60 bg-white/70 px-4 pb-4 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
          What the model is doing on {p.name}
        </h4>
        <span className="text-[10px] text-ink-500">
          Four factors · counterfactuals on this page
        </span>
      </div>
      <ul className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200 bg-white">
        {ordered.map((f) => {
          const e = p.factors[f]
          const v = softVerdict(e.ris)
          return (
            <li
              key={f}
              className="grid grid-cols-[minmax(0,160px)_minmax(0,1fr)] items-start gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <FactorChip factor={f} tone={v.tone} size="sm" />
                <DirectionGlyph direction={v.direction} />
              </div>
              <div className="min-w-0">
                <div
                  className={cx(
                    'text-[13px] font-semibold',
                    v.tone === 'blue'
                      ? 'text-blue-800'
                      : v.tone === 'purple'
                        ? 'text-purple-800'
                        : 'text-ink-500',
                  )}
                >
                  {v.label}
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-600">
                  {factorSentence(f, e.rankWith, e.rankWithout, v.direction)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
        This read explains the four model factors only. Merchandising rules and index constraints
        can also shape where this product lands on the page — see{' '}
        <em>Rank Influence Flow</em> or the <em>Scorecard V3</em> for the full story.
      </p>
    </div>
  )
}

function DirectionGlyph({ direction }: { direction: Verdict['direction'] }) {
  if (direction === 'this')
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-100 text-blue-700">
        <ArrowUpRight className="h-3 w-3" />
      </span>
    )
  if (direction === 'competitors')
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-purple-100 text-purple-700">
        <ArrowDownRight className="h-3 w-3" />
      </span>
    )
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-100 text-ink-500">
      <Minus className="h-3 w-3" />
    </span>
  )
}
