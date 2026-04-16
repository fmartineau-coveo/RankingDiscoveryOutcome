import { products, compositionByProduct, compositionLabel, type CompositionHint } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { cx } from '@/lib/utils'
import { ShieldAlert, ArrowRight } from 'lucide-react'

/**
 * Concept 08 — Rank Influence Flow.
 *
 * Reframed from the previous stacked-bar visual (which implied additive
 * composition) into a flow of influence sources that feed into the served
 * rank. Three rails are drawn on the left — Index retrieval, Merchandiser
 * rules, ML reranking — and each rail's curve into the product reflects
 * qualitative dominance, not a numeric share. The curves are rendered
 * separately (not stacked) so nothing visually invites summation.
 *
 * Strictly qualitative. Never claims a percentage. Rules-first products are
 * annotated as "rule-led" rather than with a computed rule-share.
 */

type Rail = { id: 'index' | 'rule' | 'ml'; label: string; color: string; ink: string }

const RAILS: Rail[] = [
  { id: 'index', label: 'Index retrieval', color: '#BAC0DA', ink: '#4B5282' },
  { id: 'rule', label: 'Merchandiser rules', color: '#14B8A6', ink: '#0F766E' },
  { id: 'ml', label: 'ML reranking', color: '#3B68F4', ink: '#2A4FD8' },
]

type Dominance = 'lead' | 'secondary' | 'minor'

function railDominance(hint: CompositionHint): Record<Rail['id'], Dominance> {
  switch (hint) {
    case 'rule-boosted':
    case 'rule-demoted':
      return { index: 'minor', rule: 'lead', ml: 'secondary' }
    case 'retrieval-thin':
      return { index: 'lead', rule: 'minor', ml: 'secondary' }
    case 'neutral':
    default:
      return { index: 'minor', rule: 'minor', ml: 'lead' }
  }
}

function dominanceToken(d: Dominance) {
  switch (d) {
    case 'lead':
      return { label: 'Leading force', weight: 7, opacity: 0.95 }
    case 'secondary':
      return { label: 'Supporting force', weight: 3.5, opacity: 0.7 }
    case 'minor':
      return { label: 'Background', weight: 1.5, opacity: 0.35 }
  }
}

function ruleColor(hint: CompositionHint): string {
  if (hint === 'rule-demoted') return '#E8A73C'
  return '#14B8A6'
}

export default function CompositionStack() {
  const shown = [...products]
    .sort((a, b) => a.factors.Popularity.rankWith - b.factors.Popularity.rankWith)
    .slice(0, 8)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Rank influence flow · qualitative
          </div>
          <h3 className="mt-1 text-lg font-semibold text-ink-900">
            Which forces are shaping each product's served rank?
          </h3>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink-600">
            Each row shows three distinct sources of influence flowing into the final rank. The
            thicker a curve, the more that source is leading here. They are{' '}
            <strong>not additive</strong> — a product can be rule-led without the ML reranking
            disappearing, and retrieval constrains what either can do in the first place.
          </p>
        </div>
        <Legend />
      </header>

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
        {shown.map((p, i) => {
          const hint = compositionByProduct[p.id]
          const dom = railDominance(hint)
          return (
            <div
              key={p.id}
              className={cx(
                'grid grid-cols-[220px_minmax(0,1fr)_220px] items-center gap-5 px-5 py-4',
                i !== shown.length - 1 && 'border-b border-ink-100',
              )}
            >
              {/* Left: product identity */}
              <div className="flex items-center gap-3">
                <RankBadge rank={p.factors.Popularity.rankWith} size="sm" />
                <ProductThumb product={p} size="xs" />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-ink-900">{p.name}</div>
                  <div className="text-[11px] text-ink-500">{compositionLabel[hint]}</div>
                </div>
              </div>

              {/* Middle: the flow */}
              <FlowRow hint={hint} dom={dom} />

              {/* Right: verdict chip */}
              <VerdictChip hint={hint} />
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
        <div className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <strong>No percentages, no summation.</strong> The curves are a qualitative read of
            which influence is leading versus supporting for each product — not a decomposition of
            the rank into parts. Index retrieval always applies; when a merchandiser rule is
            active, it overrides the ML reranking for that product's position; in personalized
            Search contexts, parts of the ML portion may be unobservable from this view.
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowRow({
  hint,
  dom,
}: {
  hint: CompositionHint
  dom: Record<Rail['id'], Dominance>
}) {
  // SVG flow: three source rails on the left collapse toward a single "served rank" node on the
  // right. Each curve is drawn independently. Stroke width encodes dominance qualitatively.
  const W = 560
  const H = 108
  const rightX = W - 22
  const rightY = H / 2
  const leftX = 14

  // Rail origin Y coordinates
  const origins: Record<Rail['id'], number> = { index: 18, rule: H / 2, ml: H - 18 }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {/* faint baseline */}
        <line x1={leftX} y1={H / 2} x2={rightX} y2={H / 2} stroke="rgba(17,19,42,0.06)" strokeDasharray="3 4" />

        {/* three rails, drawn separately — no stacking */}
        {RAILS.map((rail) => {
          const d = dom[rail.id]
          const t = dominanceToken(d)
          const oy = origins[rail.id]
          const cx1 = W * 0.45
          const cx2 = W * 0.7
          const color = rail.id === 'rule' ? ruleColor(hint) : rail.color
          return (
            <g key={rail.id} opacity={t.opacity}>
              <path
                d={`M ${leftX} ${oy} C ${cx1} ${oy}, ${cx2} ${rightY}, ${rightX - 2} ${rightY}`}
                fill="none"
                stroke={color}
                strokeWidth={t.weight}
                strokeLinecap="round"
              />
              {/* rail origin tick + label */}
              <circle cx={leftX} cy={oy} r={3.5} fill={color} />
              <text
                x={leftX + 10}
                y={oy - 6}
                fontSize={10}
                fontWeight={600}
                className="fill-ink-700"
                dominantBaseline="middle"
              >
                {rail.id === 'rule' && hint === 'rule-demoted' ? 'Rule · demote' : rail.label}
              </text>
              <text
                x={leftX + 10}
                y={oy + 8}
                fontSize={9}
                className="fill-ink-500"
                dominantBaseline="middle"
              >
                {t.label}
              </text>
            </g>
          )
        })}

        {/* served rank node */}
        <g>
          <circle cx={rightX} cy={rightY} r={11} fill="#11132A" />
          <circle cx={rightX} cy={rightY} r={5} fill="#FFFFFF" />
          <text
            x={rightX}
            y={rightY + 28}
            fontSize={9}
            className="fill-ink-500"
            textAnchor="middle"
          >
            Served rank
          </text>
        </g>
      </svg>
    </div>
  )
}

function VerdictChip({ hint }: { hint: CompositionHint }) {
  const map: Record<CompositionHint, { text: string; ink: string; bg: string }> = {
    neutral: {
      text: 'ML reranking is leading here',
      ink: 'text-blue-800',
      bg: 'border-blue-200 bg-blue-50',
    },
    'rule-boosted': {
      text: 'A merch rule is pinning this product',
      ink: 'text-[#0B6D62]',
      bg: 'border-[#9CE6DD] bg-[#E8FBF7]',
    },
    'rule-demoted': {
      text: 'A merch rule is holding this product back',
      ink: 'text-[#7A4B00]',
      bg: 'border-amber-400/50 bg-amber-400/10',
    },
    'retrieval-thin': {
      text: 'Retrieval is the binding constraint',
      ink: 'text-ink-800',
      bg: 'border-ink-200 bg-ink-50',
    },
  }
  const v = map[hint]
  return (
    <div
      className={cx(
        'rounded-lg border px-3 py-1.5 text-right text-[11px] font-medium leading-snug',
        v.bg,
        v.ink,
      )}
    >
      <ArrowRight className="mr-1 inline-block h-3 w-3 align-[-1px]" />
      {v.text}
    </div>
  )
}

function Legend() {
  const items = [
    { l: 'Index retrieval', c: '#BAC0DA' },
    { l: 'Merch rule · boost', c: '#14B8A6' },
    { l: 'Merch rule · demote', c: '#E8A73C' },
    { l: 'ML reranking', c: '#3B68F4' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((it) => (
        <div key={it.l} className="flex items-center gap-1.5 text-[11px] text-ink-600">
          <span className="inline-block h-0.5 w-4 rounded-full" style={{ background: it.c }} />
          {it.l}
        </div>
      ))}
    </div>
  )
}
