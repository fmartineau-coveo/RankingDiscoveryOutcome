import { useMemo, useState } from 'react'
import { FACTORS, products } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { risToneHex, risLabel } from '@/lib/ris'
import { cx } from '@/lib/utils'

export default function HeatmapMatrix() {
  const sorted = useMemo(
    () => [...products].sort((a, b) => a.factors.Popularity.rankWith - b.factors.Popularity.rankWith),
    [],
  )
  const [hover, setHover] = useState<{ pid: string; factor: string } | null>(null)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Sofas PLP · 12 products · 4 factors
          </div>
          <h3 className="mt-1 text-lg font-semibold text-ink-900">
            Where is each factor helping or hurting on this page?
          </h3>
        </div>
        <Legend />
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
        <div className="grid grid-cols-[minmax(280px,1fr)_repeat(4,minmax(120px,1fr))] text-sm">
          <div className="border-b border-ink-100 bg-ink-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Product · Rank
          </div>
          {FACTORS.map((f) => (
            <div
              key={f}
              className="border-b border-l border-ink-100 bg-ink-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500"
            >
              {f}
            </div>
          ))}

          {sorted.map((p) => (
            <div key={p.id} className="contents">
              <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
                <ProductThumb product={p} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink-900">{p.name}</div>
                  <div className="text-[11px] text-ink-500">{p.priceLabel}</div>
                </div>
                <span className="rounded-md border border-ink-200 bg-ink-50 px-2 py-0.5 font-mono text-[11px] text-ink-700">
                  #{p.factors.Popularity.rankWith}
                </span>
              </div>
              {FACTORS.map((f) => {
                const r = p.factors[f].ris
                const intensity = Math.min(1, Math.abs(r))
                const bg = r === 0 ? 'rgba(17,19,42,0.04)' : risToneHex(r)
                const isHover = hover?.pid === p.id && hover?.factor === f
                return (
                  <div
                    key={f}
                    className="relative border-b border-l border-ink-100"
                    onMouseEnter={() => setHover({ pid: p.id, factor: f })}
                    onMouseLeave={() => setHover(null)}
                  >
                    <div
                      className="flex h-full items-center justify-between px-3 py-3"
                      style={{
                        background: r === 0 ? undefined : `${bg}${Math.round(intensity * 220).toString(16).padStart(2, '0')}`,
                      }}
                    >
                      <span
                        className={cx(
                          'font-mono text-[12px] font-semibold',
                          Math.abs(r) < 0.05 ? 'text-ink-400' : r > 0 ? 'text-blue-900' : 'text-purple-900',
                        )}
                      >
                        {r > 0 ? `+${r.toFixed(2)}` : r.toFixed(2)}
                      </span>
                      <span
                        className={cx(
                          'hidden text-[10px] uppercase md:inline',
                          Math.abs(r) < 0.05 ? 'text-ink-400' : r > 0 ? 'text-blue-800' : 'text-purple-800',
                        )}
                      >
                        {r > 0 ? '▲' : r < 0 ? '▼' : '·'}
                      </span>
                    </div>
                    {isHover && (
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-60 -translate-x-1/2 rounded-lg border border-ink-200 bg-white p-3 text-[12px] shadow-lift">
                        <div className="font-semibold text-ink-900">{risLabel(r)}</div>
                        <div className="mt-1 text-ink-600">
                          Without {f}, {p.name} would move from rank {p.factors[f].rankWith} to rank{' '}
                          {p.factors[f].rankWithout}.
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Legend() {
  const stops = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-ink-500">Hurting</span>
      <div className="flex overflow-hidden rounded-md border border-ink-200">
        {stops.map((s, i) => (
          <div
            key={i}
            className="h-5 w-5"
            style={{
              background:
                s === 0
                  ? 'rgba(17,19,42,0.06)'
                  : `${risToneHex(s)}${Math.round(Math.abs(s) * 220).toString(16).padStart(2, '0')}`,
            }}
          />
        ))}
      </div>
      <span className="text-[11px] text-ink-500">Helping</span>
    </div>
  )
}
