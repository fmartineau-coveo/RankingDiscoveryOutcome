import { FACTORS, productById, products, type FactorName, type Product } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { FactorChip } from '@/components/primitives/FactorChip'
import { risToneHex } from '@/lib/ris'
import { useConceptState } from '@/lib/conceptState'
import { Info, Check, Minus, X } from 'lucide-react'
import { cx } from '@/lib/utils'

/**
 * Refactored again per feedback — the "Decisive / Moderate / Tablestakes"
 * and even "Strong / Some / Little spread" labels were still too abstract.
 *
 * New framing: for each factor, answer one concrete question —
 *   "Is this factor useful to explain rank differences on this page?"
 *
 * The answer is a clear Yes / Somewhat / No, the range is shown with the
 * actual product names at the top and bottom of it, and the focus product
 * is positioned within that range. No categorical jargon, no colour-coded
 * badge soup.
 */

type FactorStats = {
  factor: FactorName
  values: number[]
  min: number
  max: number
  range: number
  topProduct: Product
  bottomProduct: Product
  focusValue: number
  focusPercentile: number
}

function percentile(sorted: number[], v: number) {
  if (sorted.length === 0) return 0
  let below = 0
  for (const x of sorted) if (x < v) below++
  return below / Math.max(1, sorted.length - 1)
}

function allStats(focusId: string): FactorStats[] {
  return FACTORS.map((f) => {
    const pairs = products.map((p) => ({ p, v: p.factors[f].ris }))
    const sorted = [...pairs].sort((a, b) => a.v - b.v)
    const min = sorted[0].v
    const max = sorted[sorted.length - 1].v
    const bottomProduct = sorted[0].p
    const topProduct = sorted[sorted.length - 1].p
    const focusValue = productById(focusId).factors[f].ris
    return {
      factor: f,
      values: pairs.map((x) => x.v),
      min,
      max,
      range: max - min,
      topProduct,
      bottomProduct,
      focusValue,
      focusPercentile: percentile(
        sorted.map((x) => x.v),
        focusValue,
      ),
    }
  })
}

type Usefulness = 'yes' | 'somewhat' | 'no'
function usefulness(range: number): Usefulness {
  if (range >= 0.9) return 'yes'
  if (range >= 0.45) return 'somewhat'
  return 'no'
}

export default function DifferentiationMap() {
  const { focusId, setFocusId } = useConceptState()
  const p = productById(focusId)
  const rows = allStats(focusId).sort((a, b) => b.range - a.range)

  return (
    <div className="space-y-6">
      {/* Intro — one question, one answer */}
      <section className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-600">
          <Info className="h-4 w-4" />
        </div>
        <div className="text-[13px] leading-relaxed text-ink-700">
          <div className="font-semibold text-ink-900">
            Which factors are useful to explain why products are ordered the way they are here?
          </div>
          A factor can only explain a rank difference between two products if those products look
          meaningfully different on that factor. For each of the four factors, we take the{' '}
          <strong>highest and lowest RIS across the {products.length} products on this page</strong>{' '}
          and show the gap. A big gap means the factor is usable to explain ranking here; a small
          gap means it isn't, <em>on this page</em>. This is a page-local observation — a factor
          that isn't useful here can be decisive on another PLP.
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
          <p className="mt-3 text-[11px] leading-relaxed text-ink-500">
            Rows sort factors from most-useful-here to least-useful-here. Each row answers{' '}
            <em>one</em> question: should this factor be used to explain rank differences on this
            page?
          </p>
        </aside>

        <div className="space-y-3">
          {rows.map((s) => (
            <FactorRow key={s.factor} stats={s} focusName={p.name} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FactorRow({ stats, focusName }: { stats: FactorStats; focusName: string }) {
  const verdict = usefulness(stats.range)

  const pctFor = (v: number) => ((v + 1) / 2) * 100
  const focusPct = pctFor(stats.focusValue)
  const rangeBarStart = pctFor(stats.min)
  const rangeBarEnd = pctFor(stats.max)

  const focusWhere =
    stats.focusPercentile >= 0.8
      ? `near the top of the range`
      : stats.focusPercentile >= 0.55
        ? `above the middle of the range`
        : stats.focusPercentile <= 0.2
          ? `near the bottom of the range`
          : stats.focusPercentile <= 0.45
            ? `below the middle of the range`
            : `around the middle of the range`

  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
      {/* Verdict-first header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FactorChip factor={stats.factor} tone="muted" />
          <UsefulnessPill value={verdict} />
        </div>
        <div className="text-[11px] text-ink-500">
          Biggest gap between two products on this factor ={' '}
          <span className="font-mono font-semibold text-ink-800">{stats.range.toFixed(2)}</span>
        </div>
      </div>

      {/* Plain-English answer — one sentence, with real product names */}
      <p className="mt-3 text-[13px] leading-relaxed text-ink-800">
        {verdict === 'yes' && (
          <>
            <strong>Yes — {stats.factor} is useful to explain ranking here.</strong> The product
            most helped by {stats.factor} ({stats.topProduct.name}, RIS{' '}
            <span className="font-mono">+{stats.max.toFixed(2)}</span>) and the product most hurt
            by it ({stats.bottomProduct.name}, RIS{' '}
            <span className="font-mono">{stats.min.toFixed(2)}</span>) are very far apart on this
            page — you can legitimately use {stats.factor} to explain why one product ranks above
            another.
          </>
        )}
        {verdict === 'somewhat' && (
          <>
            <strong>Somewhat — {stats.factor} plays a supporting role here.</strong> Products on
            this page differ moderately on it ({stats.topProduct.name} at{' '}
            <span className="font-mono">+{stats.max.toFixed(2)}</span> vs {stats.bottomProduct.name}{' '}
            at <span className="font-mono">{stats.min.toFixed(2)}</span>) — it contributes to the
            ordering without being the main driver.
          </>
        )}
        {verdict === 'no' && (
          <>
            <strong>No — {stats.factor} is not useful to explain ranking here.</strong> Every
            product on this page has a similar {stats.factor} impact (from{' '}
            <span className="font-mono">{stats.min.toFixed(2)}</span> to{' '}
            <span className="font-mono">+{stats.max.toFixed(2)}</span>) — two products being
            close or far on it is not a good reason for their position gap on this page.
          </>
        )}
      </p>

      {/* Distribution strip with anchored product names at the extremes */}
      <div className="relative mt-5 h-14">
        {/* Axis */}
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-ink-200" />
        <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-y-1/2 bg-ink-300" />
        <div className="absolute left-0 top-0 font-mono text-[10px] text-ink-400">-1</div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 font-mono text-[10px] text-ink-400">0</div>
        <div className="absolute right-0 top-0 font-mono text-[10px] text-ink-400">+1</div>

        {/* Range band */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-200"
          style={{ left: `${rangeBarStart}%`, width: `${rangeBarEnd - rangeBarStart}%` }}
        />

        {/* All product dots */}
        {stats.values.map((v, i) => (
          <div
            key={i}
            className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-500/60"
            style={{ left: `${pctFor(v)}%` }}
          />
        ))}

        {/* Extreme product labels */}
        <ExtremeLabel
          side="left"
          label={stats.bottomProduct.name}
          leftPct={pctFor(stats.min)}
        />
        <ExtremeLabel
          side="right"
          label={stats.topProduct.name}
          leftPct={pctFor(stats.max)}
        />

        {/* Focus product marker */}
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-card"
          style={{ left: `${focusPct}%`, background: risToneHex(stats.focusValue) }}
          title={`${focusName}: RIS ${stats.focusValue.toFixed(2)}`}
        />
      </div>

      {/* Focus product explanation */}
      <div className="mt-2 text-[12px] text-ink-500">
        <strong className="text-ink-800">{focusName}</strong>: RIS{' '}
        <span className="font-mono">
          {stats.focusValue > 0 ? `+${stats.focusValue.toFixed(2)}` : stats.focusValue.toFixed(2)}
        </span>{' '}
        — {focusWhere} on this page.
      </div>
    </article>
  )
}

function ExtremeLabel({
  side,
  label,
  leftPct,
}: {
  side: 'left' | 'right'
  label: string
  leftPct: number
}) {
  return (
    <div
      className="absolute top-full mt-1 max-w-[160px] truncate text-[10px] text-ink-500"
      style={{
        left: `${leftPct}%`,
        transform: side === 'left' ? 'translateX(0)' : 'translateX(-100%)',
      }}
      title={label}
    >
      {side === 'left' ? '← ' : ''}
      {label}
      {side === 'right' ? ' →' : ''}
    </div>
  )
}

function UsefulnessPill({ value }: { value: Usefulness }) {
  if (value === 'yes') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
        <Check className="h-3 w-3" /> Useful here
      </span>
    )
  }
  if (value === 'somewhat') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-semibold text-ink-700">
        <Minus className="h-3 w-3" /> Somewhat useful here
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-500">
      <X className="h-3 w-3" /> Not useful here
    </span>
  )
}
