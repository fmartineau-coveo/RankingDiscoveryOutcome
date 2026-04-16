import { FACTORS, products, productById, ARCHETYPES, pageMedianRis } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { useState } from 'react'
import { cx } from '@/lib/utils'
import { GitCompare, Eye, EyeOff } from 'lucide-react'
import { useConceptState } from '@/lib/conceptState'

export default function Radar() {
  const { focusId, setFocusId } = useConceptState()
  const [compareAgainst, setCompareAgainst] = useState<'none' | 'page-median' | 'product'>('none')
  const [compareProductId, setCompareProductId] = useState<string>('leather-recliner')
  const p = productById(focusId)
  const archetype = ARCHETYPES[p.archetype]

  const primaryValues = FACTORS.map((f) => p.factors[f].ris)
  const compareValues =
    compareAgainst === 'product'
      ? FACTORS.map((f) => productById(compareProductId).factors[f].ris)
      : compareAgainst === 'page-median'
        ? FACTORS.map((f) => pageMedianRis[f]) // note: this is |RIS| median — plotted as outward neutral tone
        : null

  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-ink-200 bg-gradient-to-br from-white to-ink-50 p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <CompareToggle compareAgainst={compareAgainst} setCompareAgainst={setCompareAgainst} />
          <span className="tag-purple">Archetype · {archetype.label}</span>
        </div>
        <p className="mt-3 max-w-lg text-[11.5px] leading-relaxed text-ink-500">
          <strong className="text-ink-700">This is a factor signature, not a composition.</strong>{' '}
          Lobes on the blue side are factors lifting this product's competitive position; lobes on
          the purple side are factors benefiting its competitors more. The shape is a
          fingerprint — two products can have different shapes and still land near the same rank.
        </p>
        <div className="mt-2 grid place-items-center">
          <RadarSvg
            values={primaryValues}
            comparison={compareValues}
            comparisonIsAbs={compareAgainst === 'page-median'}
            labels={FACTORS as unknown as string[]}
          />
        </div>
        <div className="mt-2 space-y-2 text-center">
          <div className="text-[12px] leading-relaxed text-ink-600">{archetype.blurb}</div>
          {compareAgainst === 'product' && (
            <div className="mx-auto max-w-sm rounded-xl border border-ink-200 bg-white p-3 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Comparing against
              </div>
              <select
                value={compareProductId}
                onChange={(e) => setCompareProductId(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink-200 bg-white px-2 py-1 text-sm"
              >
                {products
                  .filter((q) => q.id !== focusId)
                  .map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name} · rank #{q.factors.Popularity.rankWith}
                    </option>
                  ))}
              </select>
            </div>
          )}
          {compareAgainst === 'page-median' && (
            <div className="mx-auto max-w-sm rounded-xl border border-ink-200 bg-ink-50 p-3 text-left text-[11px] leading-relaxed text-ink-600">
              The ghost ring shows the typical <strong>magnitude</strong> of each factor across all
              12 products on this PLP (page median of |RIS|). It is drawn outward only — direction
              is not meaningful at the page level.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Pick a product
          </div>
          <div className="text-[11px] text-ink-500">Sofas · Q1 2026</div>
        </div>
        <div className="mt-3 max-h-[460px] space-y-1 overflow-y-auto pr-1 scroll-slim">
          {products.map((q) => {
            const active = q.id === focusId
            return (
              <button
                key={q.id}
                onClick={() => setFocusId(q.id)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all',
                  active
                    ? 'border-ink-900 bg-ink-900 text-white shadow-card'
                    : 'border-ink-200 bg-white hover:border-ink-300',
                )}
              >
                <ProductThumb product={q} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className={cx('truncate text-[13px] font-medium', active ? 'text-white' : 'text-ink-900')}>
                    {q.name}
                  </div>
                  <div className={cx('text-[11px]', active ? 'text-white/60' : 'text-ink-500')}>
                    {ARCHETYPES[q.archetype].label}
                  </div>
                </div>
                <RankBadge
                  rank={q.factors.Popularity.rankWith}
                  tone={active ? 'blue' : 'ink'}
                  size="sm"
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CompareToggle({
  compareAgainst,
  setCompareAgainst,
}: {
  compareAgainst: 'none' | 'page-median' | 'product'
  setCompareAgainst: (v: 'none' | 'page-median' | 'product') => void
}) {
  const opts: { v: typeof compareAgainst; label: string; icon: React.ReactNode }[] = [
    { v: 'none', label: 'No overlay', icon: <EyeOff className="h-3 w-3" /> },
    { v: 'page-median', label: 'Page median', icon: <Eye className="h-3 w-3" /> },
    { v: 'product', label: 'Another product', icon: <GitCompare className="h-3 w-3" /> },
  ]
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white p-0.5 text-[11px] shadow-soft">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => setCompareAgainst(o.v)}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-colors',
            compareAgainst === o.v
              ? 'bg-ink-900 text-white'
              : 'text-ink-700 hover:bg-ink-50',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}

function RadarSvg({
  values,
  comparison,
  comparisonIsAbs,
  labels,
}: {
  values: number[]
  comparison: number[] | null
  comparisonIsAbs: boolean
  labels: string[]
}) {
  const size = 420
  const cx_ = size / 2
  const cy = size / 2
  const R = 108
  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / values.length

  const posPoints = values
    .map((v, i) => {
      const r = Math.max(0, v) * R
      const a = angleFor(i)
      return `${cx_ + Math.cos(a) * r},${cy + Math.sin(a) * r}`
    })
    .join(' ')
  const negPoints = values
    .map((v, i) => {
      const r = Math.max(0, -v) * R
      const a = angleFor(i)
      return `${cx_ + Math.cos(a) * r},${cy + Math.sin(a) * r}`
    })
    .join(' ')

  // Comparison lobes
  let cmpPosPoints = ''
  let cmpNegPoints = ''
  if (comparison) {
    cmpPosPoints = comparison
      .map((v, i) => {
        const r = Math.max(0, comparisonIsAbs ? Math.abs(v) : v) * R
        const a = angleFor(i)
        return `${cx_ + Math.cos(a) * r},${cy + Math.sin(a) * r}`
      })
      .join(' ')
    if (!comparisonIsAbs) {
      cmpNegPoints = comparison
        .map((v, i) => {
          const r = Math.max(0, -v) * R
          const a = angleFor(i)
          return `${cx_ + Math.cos(a) * r},${cy + Math.sin(a) * r}`
        })
        .join(' ')
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="bgRad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#F5EEFF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </radialGradient>
      </defs>
      <rect width={size} height={size} fill="url(#bgRad)" rx={16} />
      {/* rings */}
      {[0.25, 0.5, 0.75, 1].map((r, i) => (
        <circle
          key={i}
          cx={cx_}
          cy={cy}
          r={R * r}
          fill="none"
          stroke={i === 3 ? 'rgba(17,19,42,0.2)' : 'rgba(17,19,42,0.07)'}
        />
      ))}
      {/* axes */}
      {values.map((_, i) => {
        const a = angleFor(i)
        return (
          <line
            key={i}
            x1={cx_}
            y1={cy}
            x2={cx_ + Math.cos(a) * R}
            y2={cy + Math.sin(a) * R}
            stroke="rgba(17,19,42,0.08)"
          />
        )
      })}

      {/* Comparison — drawn first so primary sits on top */}
      {comparison && (
        <g>
          <polygon
            points={cmpPosPoints}
            fill="rgba(150,150,170,0.14)"
            stroke="rgba(100,100,130,0.5)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          {!comparisonIsAbs && cmpNegPoints && (
            <polygon
              points={cmpNegPoints}
              fill="rgba(150,150,170,0.12)"
              stroke="rgba(100,100,130,0.45)"
              strokeWidth="1.1"
              strokeDasharray="4 3"
            />
          )}
        </g>
      )}

      {/* negative lobe */}
      <polygon points={negPoints} fill="#7D3EE0" fillOpacity="0.22" stroke="#7D3EE0" strokeWidth="1.5" />
      {/* positive lobe */}
      <polygon points={posPoints} fill="#3B68F4" fillOpacity="0.28" stroke="#2A4FD8" strokeWidth="1.6" />
      {/* labels */}
      {labels.map((label, i) => {
        const a = angleFor(i)
        const r = R + 22
        const x = cx_ + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        const cosA = Math.cos(a)
        const anchor = Math.abs(cosA) < 0.3 ? 'middle' : cosA > 0 ? 'start' : 'end'
        const dx = anchor === 'start' ? 4 : anchor === 'end' ? -4 : 0
        return (
          <text
            key={label}
            x={x + dx}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-ink-700"
            fontSize={13}
            fontWeight={600}
          >
            {label}
          </text>
        )
      })}
      {/* value dots */}
      {values.map((v, i) => {
        const a = angleFor(i)
        const r = Math.abs(v) * R
        const x = cx_ + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        return <circle key={i} cx={x} cy={y} r={4} fill={v >= 0 ? '#2A4FD8' : '#7D3EE0'} />
      })}
      {/* legend */}
      <g transform={`translate(${size - 200}, ${size - 40})`}>
        <circle cx={5} cy={5} r={4} fill="#3B68F4" />
        <text x={14} y={9} fontSize={10} className="fill-ink-600">
          Helping
        </text>
        <circle cx={68} cy={5} r={4} fill="#7D3EE0" />
        <text x={78} y={9} fontSize={10} className="fill-ink-600">
          Hurting
        </text>
        {comparison && (
          <>
            <rect x={126} y={1} width={12} height={8} fill="rgba(100,100,130,0.45)" strokeDasharray="4 3" stroke="rgba(100,100,130,0.6)" />
            <text x={142} y={9} fontSize={10} className="fill-ink-600">
              Overlay
            </text>
          </>
        )}
      </g>
    </svg>
  )
}
