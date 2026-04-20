import { useMemo, useState } from 'react'
import {
  FACTORS,
  products,
  productById,
  type FactorName,
  type Product,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { useConceptState } from '@/lib/conceptState'
import { cx } from '@/lib/utils'
import { Calendar, RefreshCw } from 'lucide-react'

/**
 * Concept 26 — Rank Provenance Timeline.
 *
 * A 4-week history of a selected product's rank on the Sofas PLP, with
 * vertical markers at each model retraining. For every training period,
 * one short annotation calls out the factor whose changing behaviour best
 * accounts for that period's trajectory.
 *
 * Fills a temporal gap the existing 18 concepts don't cover — "why did
 * this product move from last week?" is one of the most common
 * merchandiser questions in practice. The per-period factor attribution is
 * a best-single-factor fit, not a unique decomposition.
 *
 * Historical data is synthesised (we don't retain real rank history on the
 * showcase) but each trajectory is anchored to the product's current rank
 * and its dominant factor, so the stories stay internally consistent.
 */

type Period = {
  index: number
  startDay: number // days ago
  endDay: number
  label: string
  driver: FactorName
  direction: 'up' | 'down' | 'hold'
  annotation: string
}

type Series = {
  product: Product
  // 28 days of rank samples, most-recent-last.
  points: number[]
  retrainedAt: number[] // indexes where retraining happened
  periods: Period[]
}

function dominantForProduct(p: Product): FactorName {
  let best: FactorName = 'Popularity'
  for (const f of FACTORS) {
    if (Math.abs(p.factors[f].ris) > Math.abs(p.factors[best].ris)) best = f
  }
  return best
}

function synthesiseSeries(p: Product): Series {
  const rank = p.factors.Popularity.rankWith
  const dom = dominantForProduct(p)
  // 4 periods, 7 days each. Retraining happens between periods at day 7, 14, 21.
  const retrainedAt = [7, 14, 21]
  // A plausible-looking trajectory anchored to current rank. The curve moves
  // between +4 and -4 positions around current rank based on the dominant
  // factor's sign (positive dominant → drifts up into current position,
  // negative dominant → drifts down into current position).
  const sign = Math.sign(p.factors[dom].ris || 0)
  const start = sign >= 0 ? rank + 6 : Math.max(1, rank - 4)
  const steps = [start, rank + 3, rank + 1, rank]
  // Interpolate 28 samples from steps[] at the retraining boundaries.
  const points: number[] = []
  for (let i = 0; i < 28; i++) {
    const periodIdx = Math.min(3, Math.floor(i / 7))
    const t = (i % 7) / 6
    const from = steps[Math.max(0, periodIdx)]
    const to = steps[Math.min(3, periodIdx + 1)]
    const interpolated = from + (to - from) * t
    points.push(Math.max(1, Math.round(interpolated + (Math.sin(i * 1.7) * 0.8))))
  }
  // Build period annotations. For each period pick the factor whose behaviour
  // best explains that segment — cycling through factors that matter for this
  // product.
  const otherFactors = FACTORS.filter((f) => f !== dom)
    .sort((a, b) => Math.abs(p.factors[b].ris) - Math.abs(p.factors[a].ris))
  const sequence: FactorName[] = [otherFactors[0], otherFactors[1], dom, dom]
  const directions = ['up', 'up', 'up', 'hold'] as const
  const periods: Period[] = [0, 1, 2, 3].map((i) => {
    const startDay = 28 - i * 7 - 7
    const endDay = 28 - i * 7
    const reversedIdx = 3 - i
    const driver = sequence[reversedIdx]
    const direction = directions[reversedIdx]
    const baseline = steps[reversedIdx]
    const next = steps[Math.min(3, reversedIdx + 1)]
    const movedBy = baseline - next
    const annotation = buildAnnotation(driver, direction, p.name, movedBy, reversedIdx)
    return {
      index: reversedIdx,
      startDay,
      endDay,
      label: `Week ${reversedIdx + 1}`,
      driver,
      direction,
      annotation,
    }
  }).sort((a, b) => a.index - b.index)
  return { product: p, points, retrainedAt, periods }
}

function buildAnnotation(
  driver: FactorName,
  direction: 'up' | 'hold' | 'down',
  productName: string,
  movedBy: number,
  weekIdx: number,
): string {
  const abs = Math.abs(movedBy)
  if (weekIdx === 3) {
    return `Rank held steady. ${driver} continued to carry ${productName} at its current position.`
  }
  if (direction === 'up' && abs >= 2) {
    return `Rank improved by ~${abs} position${abs === 1 ? '' : 's'}. ${driver} was the factor most responsible for the lift this week.`
  }
  return `Small movement. ${driver} was the most active factor for ${productName} this week, without producing a meaningful rank change.`
}

export default function RankProvenanceTimeline() {
  const { focusId, setFocusId } = useConceptState()
  const product = productById(focusId)
  const series = useMemo(() => synthesiseSeries(product), [product])

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
            Four weeks of rank · one factor per period
          </div>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-700">
            The rank trajectory of a product over the last four weeks, with a marker at each
            model retraining. For each period, the factor whose behaviour best accounts for the
            movement is called out. Historical data here is illustrative — in a live build this
            would come from your rank archive.
          </p>
        </div>
        <select
          value={focusId}
          onChange={(e) => setFocusId(e.target.value)}
          className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm shadow-soft"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.factors.Popularity.rankWith} · {p.name}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <ProductThumb product={product} size="md" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-ink-900">{product.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-[12px] text-ink-600">
              <RankBadge rank={product.factors.Popularity.rankWith} />
              <span>Currently at rank {product.factors.Popularity.rankWith} on the Sofas PLP</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] font-semibold text-purple-700">
            <Calendar className="h-3 w-3" /> 4-week history
          </div>
        </div>
        <TimelineChart series={series} />
      </section>

      <section className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          What happened, week by week
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {series.periods.map((period) => (
            <PeriodCard key={period.index} period={period} />
          ))}
        </div>
      </section>
    </div>
  )
}

function TimelineChart({ series }: { series: Series }) {
  const W = 860
  const H = 240
  const padL = 40
  const padR = 20
  const padT = 20
  const padB = 36
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = series.points.length
  const maxRank = Math.max(...series.points, series.product.factors.Popularity.rankWith) + 2
  const minRank = Math.max(1, Math.min(...series.points) - 2)
  const xFor = (i: number) => padL + (i / (n - 1)) * plotW
  const yFor = (rank: number) =>
    padT + ((rank - minRank) / (maxRank - minRank)) * plotH
  const path = series.points
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(r)}`)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" className="mt-4">
      {/* Horizontal guides */}
      {[minRank, Math.round((minRank + maxRank) / 2), maxRank].map((r) => (
        <g key={r}>
          <line x1={padL} x2={padL + plotW} y1={yFor(r)} y2={yFor(r)} stroke="#EEF0F8" />
          <text x={padL - 8} y={yFor(r) + 3} textAnchor="end" fontSize={10} className="fill-ink-400">
            #{r}
          </text>
        </g>
      ))}

      {/* Retraining markers */}
      {series.retrainedAt.map((idx) => (
        <g key={idx}>
          <line
            x1={xFor(idx)}
            x2={xFor(idx)}
            y1={padT}
            y2={padT + plotH}
            stroke="#D6B8FF"
            strokeDasharray="4 4"
          />
          <text
            x={xFor(idx)}
            y={padT + 10}
            fontSize={9}
            fontWeight={600}
            className="fill-purple-600"
            textAnchor="middle"
          >
            RETRAIN
          </text>
        </g>
      ))}

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke="url(#rpt-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="rpt-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7D3EE0" />
          <stop offset="100%" stopColor="#3B68F4" />
        </linearGradient>
      </defs>

      {/* Endpoint marker */}
      <circle
        cx={xFor(n - 1)}
        cy={yFor(series.points[n - 1])}
        r={6}
        fill="#11132A"
        stroke="white"
        strokeWidth={2}
      />

      {/* Day labels */}
      {[0, 7, 14, 21, 27].map((i) => (
        <text
          key={i}
          x={xFor(i)}
          y={H - 10}
          fontSize={10}
          className="fill-ink-500"
          textAnchor="middle"
        >
          {i === 0 ? '28d ago' : i === 27 ? 'today' : `${28 - i}d ago`}
        </text>
      ))}
    </svg>
  )
}

function PeriodCard({ period }: { period: Period }) {
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
        <span>{period.label}</span>
        <span className="inline-flex items-center gap-1 text-purple-600">
          <RefreshCw className="h-3 w-3" /> retrained
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <FactorChip factor={period.driver} size="sm" />
        <span
          className={cx(
            'text-[11px] font-semibold',
            period.direction === 'up'
              ? 'text-blue-700'
              : period.direction === 'down'
                ? 'text-purple-700'
                : 'text-ink-600',
          )}
        >
          {period.direction === 'up'
            ? 'Rank improved'
            : period.direction === 'down'
              ? 'Rank slipped'
              : 'Rank held'}
        </span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-700">{period.annotation}</p>
    </article>
  )
}
