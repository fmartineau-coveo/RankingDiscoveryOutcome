import { FACTORS, productById, pageMedianRis, products, type FactorName } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { formatRis } from '@/lib/ris'
import { cx } from '@/lib/utils'
import { useConceptState } from '@/lib/conceptState'

/**
 * Rewritten after feedback. Previous version used abs(RIS) bars + sign-flipping
 * verdict language, which was visually incoherent: the bar could be longer than
 * the page median on the "hurting" side while the label said "under-indexing",
 * which conflated magnitude and direction.
 *
 * New design:
 * - Horizontal diverging bar, centred on 0.
 * - Bar extends RIGHT in blue when the factor is helping this product, LEFT
 *   in purple when the factor is hurting.
 * - Page median |RIS| is shown as two ticks on both sides (±typical magnitude).
 * - Verdict is plain English and consistent with what the bar shows.
 */

type Verdict =
  | { kind: 'strong-help'; note: string }
  | { kind: 'typical-help'; note: string }
  | { kind: 'strong-hurt'; note: string }
  | { kind: 'typical-hurt'; note: string }
  | { kind: 'smaller-than-typical'; note: string }
  | { kind: 'negligible'; note: string }

function verdictFor(ris: number, median: number, productName: string, factor: FactorName): Verdict {
  const mag = Math.abs(ris)
  if (mag < 0.04) return { kind: 'negligible', note: `${factor} has almost no effect on ${productName} on this page.` }
  const delta = mag - median
  if (delta > 0.1) {
    return ris > 0
      ? {
          kind: 'strong-help',
          note: `${factor} is helping ${productName} more than it helps the typical product on this page.`,
        }
      : {
          kind: 'strong-hurt',
          note: `${factor} is hurting ${productName} more than it hurts the typical product on this page.`,
        }
  }
  if (delta < -0.1) {
    return {
      kind: 'smaller-than-typical',
      note: `${factor} is having a smaller effect on ${productName} than on the typical product on this page.`,
    }
  }
  return ris > 0
    ? {
        kind: 'typical-help',
        note: `${factor} is helping ${productName} about as much as it helps the typical product on this page.`,
      }
    : {
        kind: 'typical-hurt',
        note: `${factor} is hurting ${productName} about as much as it hurts the typical product on this page.`,
      }
}

export default function BaselineComparator() {
  const { focusId, setFocusId } = useConceptState()
  const p = productById(focusId)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <ProductThumb product={p} size="md" />
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-ink-500">Sofas PLP</div>
          <h3 className="mt-0.5 text-lg font-semibold text-ink-900">{p.name}</h3>
          <p className="mt-1 max-w-xl text-[13px] text-ink-600">
            How much each factor is affecting this product, compared to how much the same factor
            affects the typical product on this page. The longer the bar, the more this factor is
            moving this product. Direction (helping or hurting) is shown by which side the bar
            extends.
          </p>
        </div>
        <div className="text-right">
          <RankBadge rank={p.factors.Popularity.rankWith} total={184} />
          <select
            value={focusId}
            onChange={(e) => setFocusId(e.target.value)}
            className="mt-2 block rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
          >
            {products.map((q) => (
              <option key={q.id} value={q.id}>
                #{q.factors.Popularity.rankWith} · {q.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          <span>{p.name} vs. the typical product on this page</span>
          <div className="flex items-center gap-4 text-[10px] text-ink-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-5 rounded-full bg-gradient-to-r from-purple-600 to-purple-400" /> hurting
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" /> helping
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-0.5 bg-ink-400" /> typical impact on this page
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {FACTORS.map((f) => (
            <FactorRow
              key={f}
              factor={f}
              ris={p.factors[f].ris}
              median={pageMedianRis[f]}
              productName={p.name}
            />
          ))}
        </div>

        <VerdictSummary p={p} />
      </div>
    </div>
  )
}

function FactorRow({
  factor,
  ris,
  median,
  productName,
}: {
  factor: FactorName
  ris: number
  median: number
  productName: string
}) {
  const verdict = verdictFor(ris, median, productName, factor)
  const positive = ris >= 0

  // Geometry — the bar lives on a [-1, +1] axis, centred at 50%.
  const center = 50
  const barMag = Math.abs(ris) * 50 // half-width fraction * 100
  const barLeft = positive ? center : center - barMag
  const barWidth = barMag

  // Median ticks at ± median across the same axis.
  const medianLeftPct = center - median * 50
  const medianRightPct = center + median * 50

  const chipTone: 'blue' | 'purple' | 'muted' =
    verdict.kind === 'negligible' ? 'muted' : positive ? 'blue' : 'purple'
  const verdictTone =
    verdict.kind === 'strong-help'
      ? 'text-blue-700'
      : verdict.kind === 'strong-hurt'
        ? 'text-purple-700'
        : verdict.kind === 'negligible'
          ? 'text-ink-500'
          : 'text-ink-700'

  return (
    <div className="grid grid-cols-[120px_1fr_180px] items-center gap-5">
      <FactorChip factor={factor} tone={chipTone} />

      {/* Axis */}
      <div className="relative h-10">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-ink-100" />
        {/* Center line */}
        <div className="absolute left-1/2 top-1/2 h-6 w-px -translate-y-1/2 bg-ink-300" />
        {/* Median ticks on both sides */}
        <div
          className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-ink-400"
          style={{ left: `${medianLeftPct}%` }}
          title={`Typical impact on this page: ${formatRis(median, { withSign: false })}`}
        />
        <div
          className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-ink-400"
          style={{ left: `${medianRightPct}%` }}
          title={`Typical impact on this page: ${formatRis(median, { withSign: false })}`}
        />

        {/* Bar */}
        <div
          className={cx(
            'absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full',
            positive
              ? 'bg-gradient-to-r from-blue-400 to-blue-600'
              : 'bg-gradient-to-l from-purple-400 to-purple-600',
          )}
          style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
        />

        {/* Value knob */}
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-soft"
          style={{
            left: `${center + ris * 50}%`,
            background: positive ? '#2A4FD8' : '#6328C0',
          }}
        />

        {/* Axis labels */}
        <div className="absolute left-0 bottom-0 font-mono text-[9px] text-ink-400">strong hurt</div>
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 font-mono text-[9px] text-ink-400">neutral</div>
        <div className="absolute right-0 bottom-0 font-mono text-[9px] text-ink-400">strong help</div>
      </div>

      {/* Right: value + median reminder */}
      <div className="flex flex-col items-end">
        <span
          className={cx(
            'font-mono text-[13px] font-semibold',
            positive ? 'text-blue-700' : Math.abs(ris) < 0.04 ? 'text-ink-400' : 'text-purple-700',
          )}
        >
          {formatRis(ris)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-ink-500">
          impact · typical ±{formatRis(median, { withSign: false })}
        </span>
        <span className={cx('mt-1 text-right text-[10.5px] font-medium leading-snug', verdictTone)}>
          {verdict.kind === 'strong-help' && 'Bigger impact than typical · helping'}
          {verdict.kind === 'typical-help' && 'Around typical · helping'}
          {verdict.kind === 'strong-hurt' && 'Bigger impact than typical · hurting'}
          {verdict.kind === 'typical-hurt' && 'Around typical · hurting'}
          {verdict.kind === 'smaller-than-typical' && 'Smaller impact than typical'}
          {verdict.kind === 'negligible' && 'Negligible · no effect'}
        </span>
      </div>
    </div>
  )
}

function VerdictSummary({ p }: { p: ReturnType<typeof productById> }) {
  const strongHelp: FactorName[] = []
  const strongHurt: FactorName[] = []
  const small: FactorName[] = []
  for (const f of FACTORS) {
    const ris = p.factors[f].ris
    const mag = Math.abs(ris)
    const delta = mag - pageMedianRis[f]
    if (delta > 0.1 && ris > 0) strongHelp.push(f)
    else if (delta > 0.1 && ris < 0) strongHurt.push(f)
    else if (delta < -0.1) small.push(f)
  }
  return (
    <div className="mt-8 rounded-xl border border-ink-200 bg-ink-50 p-4 text-[13px] leading-relaxed text-ink-700">
      {strongHelp.length === 0 && strongHurt.length === 0 && small.length === 0 ? (
        <p>
          All four factors are affecting {p.name} about as much as they affect the typical product
          on this page — nothing particularly sets it apart from its neighbours here.
        </p>
      ) : (
        <>
          {strongHelp.length > 0 && (
            <p>
              <strong>{strongHelp.join(' and ')}</strong>{' '}
              {strongHelp.length > 1 ? 'are' : 'is'} helping {p.name} more than the typical
              product on this page — part of why it sits at rank {p.factors.Popularity.rankWith}.
            </p>
          )}
          {strongHurt.length > 0 && (
            <p className="mt-2">
              <strong>{strongHurt.join(' and ')}</strong>{' '}
              {strongHurt.length > 1 ? 'are' : 'is'} hurting {p.name} more than the typical
              product on this page — its competitors are benefiting from{' '}
              {strongHurt.length > 1 ? 'these factors' : 'this factor'} more than it is.
            </p>
          )}
          {small.length > 0 && (
            <p className="mt-2 text-ink-600">
              <strong>{small.join(' and ')}</strong>{' '}
              {small.length > 1 ? 'have' : 'has'} a smaller impact on {p.name} than on the typical
              product here — not what is driving its position either way.
            </p>
          )}
        </>
      )}
    </div>
  )
}
