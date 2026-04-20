import { useMemo, useState } from 'react'
import {
  FACTORS,
  products,
  dominantAbsFactor,
  type Product,
  type FactorName,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { cx } from '@/lib/utils'

/**
 * Concept 23 — Ranking Stability Map.
 *
 * A page-level scan of which products are anchored and which are sensitive
 * to factor shifts on this PLP. Each product is positioned on a 2D map:
 *
 *   X-axis: current served rank (1 → deeper).
 *   Y-axis: sum of per-factor rank shifts under ablation — a proxy for
 *           how propped-up-or-held-down the product is on this page.
 *
 * Color encodes the factor currently doing the most work (positive or
 * negative) on each product. Size encodes the strength of that single factor.
 *
 * Not a prediction. Tells a merchandiser where to look first when something
 * feels off on the page.
 */

type Point = {
  p: Product
  rank: number
  instability: number
  dominant: FactorName
  dominantSigned: number
}

function computePoints(): Point[] {
  return products
    .map((p) => {
      const instability = FACTORS.reduce(
        (s, f) => s + Math.abs(p.factors[f].rankWithout - p.factors[f].rankWith),
        0,
      )
      const dominant = dominantAbsFactor(p)
      return {
        p,
        rank: p.factors.Popularity.rankWith,
        instability,
        dominant,
        dominantSigned: p.factors[dominant].ris,
      }
    })
    .sort((a, b) => a.rank - b.rank)
}

export default function StabilityMap() {
  const points = useMemo(computePoints, [])
  const [hover, setHover] = useState<string | null>(null)

  const maxRank = Math.max(...points.map((p) => p.rank))
  const maxInstability = Math.max(...points.map((p) => p.instability))

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          Where to look first on this page
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-700">
          Every product on the Sofas PLP is placed by its current rank and by how propped-up or
          held-down it is by the four factors. Low-volatility products stay where they are through
          a lot of variation; high-volatility products are riding a specific factor. Colour names
          the factor currently doing the most work for or against that product.
        </p>
      </section>

      <section className="relative rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <Map2D
          points={points}
          maxRank={maxRank}
          maxInstability={maxInstability}
          hover={hover}
          setHover={setHover}
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <QuadrantCallout
          title="Anchored near the top"
          description="Top-of-page products whose rank would survive any single-factor shift. Usually the 'safe' part of the page."
          tone="blue"
          items={points.filter((p) => p.rank <= 6 && p.instability <= 6)}
        />
        <QuadrantCallout
          title="Top-of-page + factor-dependent"
          description="High-visibility products propped up by one specific factor. Worth watching — a factor shift here changes the top of the page."
          tone="purple"
          items={points.filter((p) => p.rank <= 6 && p.instability > 6)}
        />
      </section>
    </div>
  )
}

function Map2D({
  points,
  maxRank,
  maxInstability,
  hover,
  setHover,
}: {
  points: Point[]
  maxRank: number
  maxInstability: number
  hover: string | null
  setHover: (id: string | null) => void
}) {
  const W = 860
  const H = 420
  const padL = 60
  const padR = 30
  const padT = 24
  const padB = 48
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const xFor = (rank: number) => padL + ((rank - 1) / Math.max(1, maxRank - 1)) * plotW
  const yFor = (instability: number) =>
    padT + (1 - instability / Math.max(1, maxInstability)) * plotH

  function colorFor(p: Point): string {
    if (Math.abs(p.dominantSigned) < 0.05) return '#9096B8'
    return p.dominantSigned > 0 ? '#3B68F4' : '#7D3EE0'
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto">
      {/* Axes */}
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#DDE1EF" />
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#DDE1EF" />

      {/* Axis labels */}
      <text
        x={padL + plotW / 2}
        y={H - 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        className="fill-ink-700"
      >
        Current rank on page →
      </text>
      <g transform={`translate(${padL - 40}, ${padT + plotH / 2}) rotate(-90)`}>
        <text
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          className="fill-ink-700"
        >
          How much factors move this product's rank →
        </text>
      </g>
      <text x={padL} y={H - 28} fontSize={9} className="fill-ink-400">
        top of page
      </text>
      <text
        x={padL + plotW}
        y={H - 28}
        textAnchor="end"
        fontSize={9}
        className="fill-ink-400"
      >
        deeper in page
      </text>
      <text x={padL - 6} y={padT + plotH - 4} textAnchor="end" fontSize={9} className="fill-ink-400">
        anchored
      </text>
      <text x={padL - 6} y={padT + 10} textAnchor="end" fontSize={9} className="fill-ink-400">
        sensitive
      </text>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={padL}
          x2={padL + plotW}
          y1={padT + plotH * t}
          y2={padT + plotH * t}
          stroke="#EEF0F8"
        />
      ))}

      {/* Dots */}
      {points.map((pt) => {
        const isHover = hover === pt.p.id
        return (
          <g
            key={pt.p.id}
            onMouseEnter={() => setHover(pt.p.id)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={xFor(pt.rank)}
              cy={yFor(pt.instability)}
              r={isHover ? 16 : 10}
              fill={colorFor(pt)}
              fillOpacity={isHover ? 0.95 : 0.72}
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={xFor(pt.rank)}
              y={yFor(pt.instability) + 3}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="white"
            >
              {pt.rank}
            </text>
            {isHover && (
              <g>
                <rect
                  x={xFor(pt.rank) + 18}
                  y={yFor(pt.instability) - 32}
                  rx={8}
                  width={240}
                  height={64}
                  fill="white"
                  stroke="#DDE1EF"
                />
                <text
                  x={xFor(pt.rank) + 28}
                  y={yFor(pt.instability) - 14}
                  fontSize={11.5}
                  fontWeight={600}
                  className="fill-ink-900"
                >
                  {pt.p.name}
                </text>
                <text
                  x={xFor(pt.rank) + 28}
                  y={yFor(pt.instability)}
                  fontSize={10.5}
                  className="fill-ink-600"
                >
                  Rank #{pt.rank} · {pt.dominant}{' '}
                  {pt.dominantSigned > 0 ? 'is lifting it' : 'is lifting competitors more'}
                </text>
                <text
                  x={xFor(pt.rank) + 28}
                  y={yFor(pt.instability) + 14}
                  fontSize={10.5}
                  className="fill-ink-500"
                >
                  Cumulative factor shift: {pt.instability} positions
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function QuadrantCallout({
  title,
  description,
  tone,
  items,
}: {
  title: string
  description: string
  tone: 'blue' | 'purple'
  items: Point[]
}) {
  return (
    <div
      className={cx(
        'rounded-2xl border p-5 shadow-soft',
        tone === 'blue' ? 'border-blue-200 bg-blue-50/30' : 'border-purple-200 bg-purple-50/30',
      )}
    >
      <div
        className={cx(
          'text-[10px] font-semibold uppercase tracking-[0.14em]',
          tone === 'blue' ? 'text-blue-700' : 'text-purple-700',
        )}
      >
        {title}
      </div>
      <p className="mt-1 text-[12px] leading-snug text-ink-600">{description}</p>
      {items.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-ink-300 bg-white px-3 py-3 text-[12px] text-ink-500">
          Nothing on this page sits here.
        </div>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {items.map((pt) => (
            <li
              key={pt.p.id}
              className="flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-2 py-1.5"
            >
              <RankBadge rank={pt.rank} size="sm" />
              <ProductThumb product={pt.p} size="xs" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink-900">
                {pt.p.name}
              </span>
              <FactorChip
                factor={pt.dominant}
                size="sm"
                tone={pt.dominantSigned >= 0 ? 'blue' : 'purple'}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
