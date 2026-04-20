import { useMemo, useState } from 'react'
import {
  ARCHETYPES,
  products,
  type Product,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { cx } from '@/lib/utils'

/**
 * Concept 25 — Page Diversity Atlas.
 *
 * A 2D scatter plot of every product on the Sofas PLP, positioned by the
 * shape of its factor profile. Products with similar profiles land near
 * each other. Clusters are auto-labelled with the merchandiser archetype
 * most common in that area.
 *
 * Not a classifier. The coordinates are a projection of the per-factor
 * impact vector onto two axes (Popularity-dominated vs competitor-dominated
 * horizontally, Trendiness-lifted vs steady-performer vertically), so the
 * map is readable without training on what PCA means.
 */

type Point = {
  p: Product
  x: number
  y: number
  dominant: string
}

function projectProducts(): Point[] {
  return products.map((p) => {
    const pop = p.factors.Popularity.ris
    const trend = p.factors.Trendiness.ris
    const fresh = p.factors.Freshness.ris
    const eng = p.factors.Engagement.ris
    // X: how much Popularity drives this product relative to others' factors.
    //   Positive = popularity-led; negative = other forces dominate.
    const x = pop - (fresh + trend + eng) / 3
    // Y: Trendiness + Freshness relative weight vs. Engagement.
    //   Positive = "rising / momentum"; negative = "steady / conversion".
    const y = (trend + fresh) / 2 - eng
    const dominant = [
      ['Popularity', Math.abs(pop)],
      ['Freshness', Math.abs(fresh)],
      ['Trendiness', Math.abs(trend)],
      ['Engagement', Math.abs(eng)],
    ].sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] as string
    return { p, x, y, dominant }
  })
}

export default function DiversityAtlas() {
  const [hover, setHover] = useState<string | null>(null)
  const points = useMemo(projectProducts, [])

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const xMin = Math.min(...xs) - 0.1
  const xMax = Math.max(...xs) + 0.1
  const yMin = Math.min(...ys) - 0.1
  const yMax = Math.max(...ys) + 0.1

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          Find the outliers at a glance
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-700">
          Every product on the Sofas PLP is placed by the shape of its factor profile. Products
          near each other behave similarly across Popularity, Freshness, Trendiness and Engagement
          on this page; products off on their own are the outliers worth a closer look.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
          <AtlasSvg
            points={points}
            xMin={xMin}
            xMax={xMax}
            yMin={yMin}
            yMax={yMax}
            hover={hover}
            setHover={setHover}
          />
        </section>
        <aside className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            How to read the axes
          </div>
          <ul className="mt-3 space-y-3 text-[12.5px] leading-relaxed text-ink-700">
            <li>
              <strong className="text-ink-900">Horizontal.</strong>{' '}
              Far right = this product's rank is mostly a{' '}
              <FactorChip factor="Popularity" size="sm" tone="blue" /> story. Far left = the
              product's position is driven by a mix of the other three factors.
            </li>
            <li>
              <strong className="text-ink-900">Vertical.</strong>{' '}
              Upper = momentum-led (
              <FactorChip factor="Trendiness" size="sm" tone="blue" /> and{' '}
              <FactorChip factor="Freshness" size="sm" tone="blue" /> doing the work). Lower =
              conversion-led (
              <FactorChip factor="Engagement" size="sm" tone="blue" /> carrying more of the lift).
            </li>
          </ul>
          <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-600">
            Clusters are observations on this page, not a fixed product taxonomy. The same
            products on a different PLP may cluster differently.
          </div>
        </aside>
      </div>

      <section>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          All products · click the map
        </div>
        <ul className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {points.map((pt) => (
            <li
              key={pt.p.id}
              onMouseEnter={() => setHover(pt.p.id)}
              onMouseLeave={() => setHover(null)}
              className={cx(
                'flex items-center gap-2.5 rounded-lg border bg-white px-2.5 py-1.5 transition-all',
                hover === pt.p.id ? 'border-ink-900 shadow-soft' : 'border-ink-100',
              )}
            >
              <ProductThumb product={pt.p} size="xs" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-ink-900">{pt.p.name}</div>
                <div className="truncate text-[10.5px] text-ink-500">
                  {ARCHETYPES[pt.p.archetype].label}
                </div>
              </div>
              <RankBadge rank={pt.p.factors.Popularity.rankWith} size="sm" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function AtlasSvg({
  points,
  xMin,
  xMax,
  yMin,
  yMax,
  hover,
  setHover,
}: {
  points: Point[]
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  hover: string | null
  setHover: (id: string | null) => void
}) {
  const W = 820
  const H = 440
  const padL = 60
  const padR = 40
  const padT = 40
  const padB = 50
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const xFor = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW
  const yFor = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * plotH
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto">
      {/* Quadrant tints */}
      <rect x={padL} y={padT} width={plotW / 2} height={plotH / 2} fill="#F5EEFF" fillOpacity={0.4} />
      <rect x={padL + plotW / 2} y={padT} width={plotW / 2} height={plotH / 2} fill="#EEF3FF" fillOpacity={0.4} />
      <rect x={padL} y={padT + plotH / 2} width={plotW / 2} height={plotH / 2} fill="#F7F8FC" />
      <rect x={padL + plotW / 2} y={padT + plotH / 2} width={plotW / 2} height={plotH / 2} fill="#F7F8FC" fillOpacity={0.6} />

      {/* Axes */}
      <line x1={padL} y1={padT + plotH / 2} x2={padL + plotW} y2={padT + plotH / 2} stroke="#C8CCDE" strokeDasharray="4 4" />
      <line x1={padL + plotW / 2} y1={padT} x2={padL + plotW / 2} y2={padT + plotH} stroke="#C8CCDE" strokeDasharray="4 4" />

      {/* Quadrant labels */}
      <QuadLabel x={padL + 8} y={padT + 20} text="OTHER FORCES LEAD · MOMENTUM" tone="purple" />
      <QuadLabel x={padL + plotW - 8} y={padT + 20} text="POPULARITY LEAD · MOMENTUM" tone="blue" anchor="end" />
      <QuadLabel
        x={padL + 8}
        y={padT + plotH - 10}
        text="OTHER FORCES LEAD · CONVERSION"
        tone="muted"
      />
      <QuadLabel
        x={padL + plotW - 8}
        y={padT + plotH - 10}
        text="POPULARITY LEAD · CONVERSION"
        tone="muted"
        anchor="end"
      />

      {/* Dots */}
      {points.map((pt) => {
        const isHover = hover === pt.p.id
        const cx1 = xFor(pt.x)
        const cy = yFor(pt.y)
        const color = pt.x >= (xMin + xMax) / 2 ? '#3B68F4' : '#7D3EE0'
        return (
          <g
            key={pt.p.id}
            onMouseEnter={() => setHover(pt.p.id)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={cx1} cy={cy} r={isHover ? 14 : 9} fill={color} fillOpacity={isHover ? 0.95 : 0.7} stroke="white" strokeWidth={2} />
            <text x={cx1} y={cy + 3} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">
              {pt.p.factors.Popularity.rankWith}
            </text>
            {isHover && (
              <g>
                <rect
                  x={cx1 + 16}
                  y={cy - 28}
                  rx={8}
                  width={240}
                  height={56}
                  fill="white"
                  stroke="#DDE1EF"
                />
                <text
                  x={cx1 + 26}
                  y={cy - 10}
                  fontSize={11.5}
                  fontWeight={600}
                  className="fill-ink-900"
                >
                  {pt.p.name}
                </text>
                <text x={cx1 + 26} y={cy + 6} fontSize={10.5} className="fill-ink-600">
                  Dominant factor here: {pt.dominant}
                </text>
                <text x={cx1 + 26} y={cy + 20} fontSize={10.5} className="fill-ink-500">
                  {ARCHETYPES[pt.p.archetype].label}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function QuadLabel({
  x,
  y,
  text,
  tone,
  anchor = 'start',
}: {
  x: number
  y: number
  text: string
  tone: 'purple' | 'blue' | 'muted'
  anchor?: 'start' | 'end'
}) {
  const fill = tone === 'purple' ? '#6328C0' : tone === 'blue' ? '#213CAA' : '#6B7099'
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={9.5}
      fontWeight={700}
      fill={fill}
      letterSpacing="0.08em"
    >
      {text}
    </text>
  )
}

