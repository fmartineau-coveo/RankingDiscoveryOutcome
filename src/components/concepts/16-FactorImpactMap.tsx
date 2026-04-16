import { useMemo, useState } from 'react'
import {
  FACTORS,
  products,
  productById,
  factorSeparation,
  type FactorName,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { FactorChip } from '@/components/primitives/FactorChip'
import { useConceptState } from '@/lib/conceptState'
import { formatRis } from '@/lib/ris'
import { cx } from '@/lib/utils'
import { Info } from 'lucide-react'

/**
 * Concept #16 — Factor Impact Map.
 *
 * Brings back the two-axis scatter the earlier "Differentiation Map" had, but
 * with a refined Y-axis that actually encodes rank impact on THIS product
 * (not just a page-level spread metric). Quadrants carry plain-English names
 * — Decisive here · Tablestakes for this product · Unusually strong here ·
 * Minor effect — and every factor bubble is labeled with the actual rank
 * counterfactual (#current → #without).
 *
 * X-axis: how much this factor varies across the products on this PLP
 *         (factorSeparation, 0..1). Low = products look similar on it here.
 * Y-axis: how much this factor moves THIS product's rank (|RIS|, 0..1).
 *         Combines direction-free magnitude with position-weighted impact.
 *
 * Colour: blue when the factor helps the product, purple when it hurts.
 * Bubble size: scaled to rank-change magnitude so visual attention tracks
 *              the concrete movement, not just the two axes.
 */

type Point = {
  factor: FactorName
  x: number // separating power on this page (0..1)
  y: number // |RIS| (0..1)
  ris: number // signed
  rankWith: number
  rankWithout: number
  quadrant: Quadrant
}

type Quadrant = 'decisive' | 'tablestakes' | 'unusual' | 'minor'

function quadrantFor(x: number, y: number): Quadrant {
  const xHi = x >= 0.5
  const yHi = y >= 0.25
  if (xHi && yHi) return 'decisive'
  if (xHi && !yHi) return 'tablestakes'
  if (!xHi && yHi) return 'unusual'
  return 'minor'
}

export default function FactorImpactMap() {
  const { focusId, setFocusId } = useConceptState()
  const p = productById(focusId)
  const [hover, setHover] = useState<FactorName | null>(null)

  const points: Point[] = useMemo(
    () =>
      FACTORS.map((f) => {
        const e = p.factors[f]
        const x = factorSeparation[f]
        const y = Math.min(1, Math.abs(e.ris))
        return {
          factor: f,
          x,
          y,
          ris: e.ris,
          rankWith: e.rankWith,
          rankWithout: e.rankWithout,
          quadrant: quadrantFor(x, y),
        }
      }),
    [p],
  )

  return (
    <div className="space-y-6">
      {/* Intro */}
      <section className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-600">
          <Info className="h-4 w-4" />
        </div>
        <div className="text-[13px] leading-relaxed text-ink-700">
          <div className="font-semibold text-ink-900">
            Two questions at once — does the factor vary across this page, and does it actually move this product?
          </div>
          Each factor lives somewhere in this map. The <strong>horizontal axis</strong> is how much
          the factor varies across the 12 products on this PLP (low = tablestakes, high = spread
          widely). The <strong>vertical axis</strong> is how much the factor actually moves{' '}
          <strong>this product's</strong> rank. Bubble colour shows direction, bubble size tracks
          the rank counterfactual. The two axes are independent: a factor can matter here in
          general but not for this product, or the reverse.
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-[320px_1fr]">
        {/* Focus picker */}
        <aside className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Focus product
          </div>
          <select
            value={focusId}
            onChange={(e) => setFocusId(e.target.value)}
            className="mt-2 w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-sm"
          >
            {products.map((q) => (
              <option key={q.id} value={q.id}>
                #{q.factors.Popularity.rankWith} · {q.name}
              </option>
            ))}
          </select>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3">
            <ProductThumb product={p} size="sm" />
            <div className="min-w-0 text-[12px]">
              <div className="truncate font-semibold text-ink-900">{p.name}</div>
              <div className="text-ink-500">Rank #{p.factors.Popularity.rankWith}</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Quadrant legend
            </div>
            <QuadrantChip q="decisive" />
            <QuadrantChip q="tablestakes" />
            <QuadrantChip q="unusual" />
            <QuadrantChip q="minor" />
          </div>
        </aside>

        {/* Map */}
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
          <ImpactMap points={points} hover={hover} setHover={setHover} focusName={p.name} />
        </div>
      </div>

      {/* Per-factor detail */}
      <section className="grid gap-3 md:grid-cols-2">
        {points
          .slice()
          .sort((a, b) => b.y - a.y)
          .map((pt) => (
            <FactorDetail key={pt.factor} pt={pt} focusName={p.name} hover={hover === pt.factor} onHover={(h) => setHover(h ? pt.factor : null)} />
          ))}
      </section>
    </div>
  )
}

function ImpactMap({
  points,
  hover,
  setHover,
  focusName,
}: {
  points: Point[]
  hover: FactorName | null
  setHover: (f: FactorName | null) => void
  focusName: string
}) {
  const W = 820
  const H = 480
  const padL = 76
  const padR = 48
  const padT = 40
  const padB = 64
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const xFor = (x: number) => padL + x * plotW
  const yFor = (y: number) => padT + (1 - y) * plotH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto">
      <defs>
        <linearGradient id="qd-decisive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DCE6FF" />
          <stop offset="100%" stopColor="#F5EEFF" />
        </linearGradient>
        <linearGradient id="qd-tablestakes" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F7F8FC" />
          <stop offset="100%" stopColor="#EEF0F8" />
        </linearGradient>
      </defs>

      {/* Quadrant fills */}
      <rect
        x={padL + plotW / 2}
        y={padT}
        width={plotW / 2}
        height={plotH / 2}
        fill="url(#qd-decisive)"
        opacity="0.6"
      />
      <rect
        x={padL + plotW / 2}
        y={padT + plotH / 2}
        width={plotW / 2}
        height={plotH / 2}
        fill="url(#qd-tablestakes)"
        opacity="0.6"
      />

      {/* Axes */}
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#DDE1EF" />
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#DDE1EF" />

      {/* Quadrant divider lines */}
      <line
        x1={padL + plotW / 2}
        y1={padT}
        x2={padL + plotW / 2}
        y2={padT + plotH}
        stroke="#C8CCDE"
        strokeDasharray="4 4"
      />
      <line
        x1={padL}
        y1={padT + plotH * 0.75}
        x2={padL + plotW}
        y2={padT + plotH * 0.75}
        stroke="#C8CCDE"
        strokeDasharray="4 4"
      />

      {/* Quadrant labels */}
      <QuadrantLabel x={padL + plotW * 0.75} y={padT + 22} title="Decisive here" tone="purple" />
      <QuadrantLabel
        x={padL + plotW * 0.75}
        y={padT + plotH - 16}
        title="Tablestakes for this product"
        tone="muted"
      />
      <QuadrantLabel x={padL + plotW * 0.25} y={padT + 22} title="Unusually strong here" tone="amber" />
      <QuadrantLabel
        x={padL + plotW * 0.25}
        y={padT + plotH - 16}
        title="Minor effect"
        tone="muted"
      />

      {/* Axis labels */}
      <text x={padL + plotW / 2} y={H - 22} textAnchor="middle" fontSize={11} className="fill-ink-700" fontWeight={600}>
        How much the factor varies across products on this PLP →
      </text>
      <text x={padL + 8} y={H - 38} textAnchor="start" fontSize={10} className="fill-ink-400">
        low spread (tablestakes)
      </text>
      <text x={padL + plotW - 8} y={H - 38} textAnchor="end" fontSize={10} className="fill-ink-400">
        high spread (discriminating)
      </text>
      <g transform={`translate(${padL - 48}, ${padT + plotH / 2}) rotate(-90)`}>
        <text textAnchor="middle" fontSize={11} className="fill-ink-700" fontWeight={600}>
          How much the factor moves {shortName(focusName)}'s rank →
        </text>
      </g>
      <text x={padL - 12} y={padT + plotH - 6} textAnchor="end" fontSize={10} className="fill-ink-400">
        negligible
      </text>
      <text x={padL - 12} y={padT + 12} textAnchor="end" fontSize={10} className="fill-ink-400">
        maximal
      </text>

      {/* Ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={`xt-${t}`}>
          <line
            x1={xFor(t)}
            x2={xFor(t)}
            y1={padT + plotH}
            y2={padT + plotH + 4}
            stroke="#C8CCDE"
          />
          <text
            x={xFor(t)}
            y={padT + plotH + 16}
            textAnchor="middle"
            fontSize={9}
            className="fill-ink-500"
          >
            {t.toFixed(2)}
          </text>
        </g>
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={`yt-${t}`}>
          <line x1={padL - 4} x2={padL} y1={yFor(t)} y2={yFor(t)} stroke="#C8CCDE" />
          <text x={padL - 8} y={yFor(t) + 3} textAnchor="end" fontSize={9} className="fill-ink-500">
            {t.toFixed(2)}
          </text>
        </g>
      ))}

      {/* Factor bubbles */}
      {points.map((pt) => {
        const rankDelta = Math.abs(pt.rankWithout - pt.rankWith)
        const r = 12 + Math.min(48, rankDelta) * 0.8
        const color = pt.ris >= 0 ? '#3B68F4' : '#7D3EE0'
        const isHover = hover === pt.factor
        return (
          <g
            key={pt.factor}
            onMouseEnter={() => setHover(pt.factor)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={xFor(pt.x)}
              cy={yFor(pt.y)}
              r={r + 8}
              fill={color}
              opacity={isHover ? 0.18 : 0.08}
            />
            <circle
              cx={xFor(pt.x)}
              cy={yFor(pt.y)}
              r={r}
              fill={color}
              fillOpacity={isHover ? 0.95 : 0.82}
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={xFor(pt.x)}
              y={yFor(pt.y) + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="white"
            >
              {pt.factor[0]}
            </text>
            <text
              x={xFor(pt.x)}
              y={yFor(pt.y) - r - 10}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              className="fill-ink-900"
            >
              {pt.factor}
            </text>
            <text
              x={xFor(pt.x)}
              y={yFor(pt.y) + r + 16}
              textAnchor="middle"
              fontSize={10}
              className="fill-ink-600"
            >
              #{pt.rankWith} → #{pt.rankWithout} without it
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function FactorDetail({
  pt,
  focusName,
  hover,
  onHover,
}: {
  pt: Point
  focusName: string
  hover: boolean
  onHover: (h: boolean) => void
}) {
  const delta = pt.rankWithout - pt.rankWith
  const direction = pt.ris >= 0 ? 'helping' : 'hurting'
  return (
    <article
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cx(
        'rounded-2xl border p-4 shadow-soft transition-all',
        hover ? 'border-ink-900 bg-ink-50' : 'border-ink-200 bg-white',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FactorChip factor={pt.factor} tone={pt.ris >= 0 ? 'blue' : 'purple'} />
        <QuadrantChip q={pt.quadrant} compact />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-800">
        {pt.quadrant === 'decisive' && (
          <>
            <strong>Decisive here.</strong> {pt.factor} varies widely across this PLP and is
            actively {direction} {focusName}. Without this factor, the product would go from rank{' '}
            #{pt.rankWith} to #{pt.rankWithout} (
            {delta > 0 ? `+${delta}` : delta} positions).
          </>
        )}
        {pt.quadrant === 'tablestakes' && (
          <>
            <strong>Tablestakes for this product.</strong> {pt.factor} does differentiate products
            across the page, but it is not moving <em>{focusName}</em> much — its rank would shift
            by only {Math.abs(delta)} position{Math.abs(delta) === 1 ? '' : 's'} without it.
          </>
        )}
        {pt.quadrant === 'unusual' && (
          <>
            <strong>Unusually strong here.</strong> {pt.factor} looks similar across most products
            on this page, yet it is still moving {focusName} materially (rank #{pt.rankWith} →{' '}
            #{pt.rankWithout}). Worth a closer look — this product is an outlier on this factor.
          </>
        )}
        {pt.quadrant === 'minor' && (
          <>
            <strong>Minor effect.</strong> {pt.factor} neither varies much across the page nor
            moves {focusName} materially. Not a good factor to lead an explanation with here.
          </>
        )}
      </p>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-500">
        <span>
          Spread on this page:{' '}
          <span className="font-mono text-ink-700">{pt.x.toFixed(2)}</span>
        </span>
        <span className="text-ink-300">·</span>
        <span>
          RIS for {shortName(focusName)}:{' '}
          <span className="font-mono text-ink-700">{formatRis(pt.ris)}</span>
        </span>
      </div>
    </article>
  )
}

function QuadrantLabel({
  x,
  y,
  title,
  tone,
}: {
  x: number
  y: number
  title: string
  tone: 'purple' | 'muted' | 'amber'
}) {
  const fill = tone === 'purple' ? '#6328C0' : tone === 'amber' ? '#C47918' : '#6B7099'
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={10.5}
      fontWeight={700}
      fill={fill}
      letterSpacing="0.04em"
    >
      {title.toUpperCase()}
    </text>
  )
}

function QuadrantChip({ q, compact }: { q: Quadrant; compact?: boolean }) {
  const config: Record<
    Quadrant,
    { label: string; tone: string; description: string }
  > = {
    decisive: {
      label: 'Decisive here',
      tone:
        'border-purple-200 bg-purple-50 text-purple-700',
      description: 'Varies a lot on this page AND moves this product.',
    },
    tablestakes: {
      label: 'Tablestakes for this product',
      tone: 'border-ink-200 bg-ink-50 text-ink-700',
      description: 'Differentiates other products — not this one.',
    },
    unusual: {
      label: 'Unusually strong here',
      tone: 'border-amber-400/40 bg-amber-400/10 text-amber-600',
      description: 'Little page-level spread, yet moves this product.',
    },
    minor: {
      label: 'Minor effect',
      tone: 'border-ink-200 bg-white text-ink-500',
      description: 'Low spread and low per-product impact.',
    },
  }
  const c = config[q]
  if (compact) {
    return (
      <span className={cx('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', c.tone)}>
        {c.label}
      </span>
    )
  }
  return (
    <div className={cx('rounded-lg border p-2', c.tone)}>
      <div className="text-[11px] font-semibold">{c.label}</div>
      <div className="text-[10.5px] leading-snug opacity-80">{c.description}</div>
    </div>
  )
}

function shortName(name: string): string {
  // Keep the first two words for axis/inline use.
  const parts = name.split(' ')
  return parts.slice(0, 2).join(' ')
}
