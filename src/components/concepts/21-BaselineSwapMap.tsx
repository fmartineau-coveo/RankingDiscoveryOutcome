import { useState, useMemo } from 'react'
import { FACTORS, products, type FactorName, type Product } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { cx } from '@/lib/utils'
import { ArrowRight, ArrowDown, ArrowUp } from 'lucide-react'

/**
 * Concept 21 — Baseline-Relative Swap Map.
 *
 * Draws from method 7.1 in the interpretability doc (baseline-relative
 * marginal effect). We compare the served ranking for the Sofas PLP against
 * the ranking *with each factor removed in turn*, and surface the swaps each
 * factor is currently producing relative to the rest.
 *
 * Read this as: "Here's what each factor is currently doing *versus what the
 * other three would do on their own*." It's a baseline-relative diagnostic,
 * not a claim about how the factors compose together.
 */

type SwapEntry = {
  factor: FactorName
  // Products whose rank changes materially when this factor is removed.
  risers: { p: Product; rankWith: number; rankWithout: number; delta: number }[]
  fallers: { p: Product; rankWith: number; rankWithout: number; delta: number }[]
}

function computeSwaps(): SwapEntry[] {
  return FACTORS.map((f) => {
    const movements = products
      .map((p) => ({
        p,
        rankWith: p.factors[f].rankWith,
        rankWithout: p.factors[f].rankWithout,
        delta: p.factors[f].rankWithout - p.factors[f].rankWith,
      }))
      .filter((m) => Math.abs(m.delta) >= 2)
    // Rising when factor removed → factor was hurting that product
    // (so factor is currently helping its competitors relative to that product)
    const risers = [...movements].filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta)
    // Falling when factor removed → factor was helping that product
    const fallers = [...movements].filter((m) => m.delta > 0).sort((a, b) => b.delta - a.delta)
    return { factor: f, risers: risers.slice(0, 3), fallers: fallers.slice(0, 3) }
  })
}

export default function BaselineSwapMap() {
  const [activeFactor, setActiveFactor] = useState<FactorName>('Trendiness')
  const swaps = useMemo(computeSwaps, [])
  const active = swaps.find((s) => s.factor === activeFactor)!

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          What is each factor doing — measured against the others
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-700">
          Pick a factor. The list below shows the products this factor is currently lifting
          against the other three, and the products it is currently holding back on this page.
          Think of it as: <em>compared to a view where this factor didn't exist</em>, here's who
          moves.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {FACTORS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFactor(f)}
            className={cx(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              activeFactor === f
                ? 'border-ink-900 bg-ink-900 text-white shadow-soft'
                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <SwapPanel
          title="Lifted by this factor"
          subtitle={`Without ${active.factor}, these products would fall.`}
          movements={active.fallers}
          tone="blue"
          ArrowIcon={ArrowDown}
        />
        <SwapPanel
          title="Held back relative to this factor"
          subtitle={`Without ${active.factor}, these products would climb — it's currently benefiting their competitors more.`}
          movements={active.risers}
          tone="purple"
          ArrowIcon={ArrowUp}
        />
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          <FactorChip factor={active.factor} size="sm" />
          at a glance
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-700">
          On this Sofas PLP, {active.factor} is actively{' '}
          {active.fallers.length > 0 ? (
            <>
              lifting <strong>{active.fallers.length}</strong>{' '}
              product{active.fallers.length === 1 ? '' : 's'}
            </>
          ) : (
            <>having no meaningful lifting effect</>
          )}{' '}
          and{' '}
          {active.risers.length > 0 ? (
            <>
              benefiting the competitors of <strong>{active.risers.length}</strong>{' '}
              other{active.risers.length === 1 ? '' : 's'}
            </>
          ) : (
            <>not materially holding anyone back</>
          )}
          . Products not listed are broadly unaffected by {active.factor} here.
        </p>
      </section>
    </div>
  )
}

function SwapPanel({
  title,
  subtitle,
  movements,
  tone,
  ArrowIcon,
}: {
  title: string
  subtitle: string
  movements: SwapEntry['risers']
  tone: 'blue' | 'purple'
  ArrowIcon: typeof ArrowDown
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
      <p className="mt-1 text-[12px] leading-snug text-ink-600">{subtitle}</p>
      {movements.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-ink-300 bg-white px-3 py-4 text-center text-[12px] text-ink-500">
          No products on this page fall into this group for the selected factor.
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {movements.map(({ p, rankWith, rankWithout }) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-ink-100 bg-white px-3 py-2"
            >
              <ProductThumb product={p} size="xs" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-ink-900">{p.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-600">
                  <RankBadge rank={rankWith} size="sm" />
                  <ArrowRight className="h-3 w-3 text-ink-400" />
                  <span
                    className={cx(
                      'font-mono font-semibold',
                      tone === 'blue' ? 'text-blue-700' : 'text-purple-700',
                    )}
                  >
                    #{rankWithout}
                  </span>
                </div>
              </div>
              <ArrowIcon
                className={cx(
                  'h-4 w-4',
                  tone === 'blue' ? 'text-blue-600' : 'text-purple-600',
                )}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
