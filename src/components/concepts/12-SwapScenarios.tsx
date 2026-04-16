import { FACTORS, productById, classifyPairScenario, CURATED_PAIRS, type FactorName } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { FactorChip } from '@/components/primitives/FactorChip'
import { cx } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Minus, HelpCircle } from 'lucide-react'
import { useConceptState } from '@/lib/conceptState'
import { useMemo } from 'react'

/**
 * Handles all scenarios, not just "one factor flips":
 *  - A factor whose removal would flip the order  →  purple "decisive" tile
 *  - Narrows the gap but doesn't flip            →  blue "narrows gap" tile
 *  - Widens the gap                              →  blue "widens gap" tile
 *  - Negligible                                  →  grey "no effect" tile
 *  - Both products shift far deeper / shallower (zone-shift)  →  amber "repositions both" tile
 *
 * And an explicit "overall verdict" distinguishing:
 *  - A single factor flips → headline that factor
 *  - No factor alone flips → say so explicitly; the ordering is the combination of many
 */

type TileStatus = 'flips' | 'narrows' | 'widens' | 'zone-shift' | 'negligible'

export default function SwapScenarios() {
  const { pair, setPair } = useConceptState()
  const A = productById(pair[0])
  const B = productById(pair[1])

  const scenarios = useMemo(
    () =>
      FACTORS.map((f) => {
        const aF = A.factors[f]
        const bF = B.factors[f]
        const newA = aF.rankWithout
        const newB = bF.rankWithout
        const originalOrder = aF.rankWith < bF.rankWith
        const newOrder = newA < newB
        const gapWith = Math.abs(aF.rankWith - bF.rankWith)
        const gapWithout = Math.abs(newA - newB)
        const cls = classifyPairScenario(aF, bF)
        let status: TileStatus = 'negligible'
        if (originalOrder !== newOrder) status = 'flips'
        else if (cls === 'zone-shift') status = 'zone-shift'
        else if (gapWith - gapWithout >= 3) status = 'narrows'
        else if (gapWithout - gapWith >= 3) status = 'widens'
        else if (
          Math.abs(newA - aF.rankWith) < 2 &&
          Math.abs(newB - bF.rankWith) < 2
        )
          status = 'negligible'
        else status = 'narrows' // small shift, default description
        return { f, aF, bF, newA, newB, status }
      }),
    [A, B],
  )

  const flippers = scenarios.filter((s) => s.status === 'flips')
  const narrowers = scenarios.filter((s) => s.status === 'narrows' || s.status === 'widens')

  return (
    <div className="space-y-6">
      <PairPicker pair={pair} setPair={setPair} />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <MiniProduct product={A} tone="blue" />
        <span className="font-mono text-[11px] text-ink-500">current rank ordering</span>
        <MiniProduct product={B} tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scenarios.map((s) => (
          <ScenarioCard
            key={s.f}
            factor={s.f}
            originalA={s.aF.rankWith}
            originalB={s.bF.rankWith}
            newA={s.newA}
            newB={s.newB}
            status={s.status}
          />
        ))}
      </div>

      <VerdictBlock
        flippers={flippers.map((s) => s.f)}
        narrowers={narrowers.map((s) => ({ f: s.f, status: s.status }))}
        Aname={A.name}
        Bname={B.name}
      />
    </div>
  )
}

function VerdictBlock({
  flippers,
  narrowers,
  Aname,
  Bname,
}: {
  flippers: FactorName[]
  narrowers: { f: FactorName; status: TileStatus }[]
  Aname: string
  Bname: string
}) {
  if (flippers.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-800 text-white">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              No single factor decides the order
            </div>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-800">
              On this pair, no factor on its own would flip {Aname} and {Bname} if removed. This is
              actually the common case: ranking is the combination of several small effects, not a
              single lever. Removing a factor here would shift the two products within their
              neighbourhood, but not across each other.
            </p>
            {narrowers.length > 0 && (
              <p className="mt-2 text-[12.5px] text-ink-600">
                The factors doing the most work on the{' '}
                <em>size</em> of the gap are:{' '}
                <strong>{narrowers.map((n) => n.f).join(', ')}</strong>. Their removal would narrow
                or widen the gap but not flip the order.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-purple-500 text-white">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
            {flippers.length === 1 ? 'Decisive factor' : 'Multiple factors would flip the order'}
          </div>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-800">
            {flippers.length === 1 ? (
              <>
                <strong>{flippers[0]}</strong> is the one factor whose removal would flip {Aname}{' '}
                and {Bname}. If it were not part of the ranking, the order would reverse on this
                page.
              </>
            ) : (
              <>
                Any of <strong>{flippers.join(', ')}</strong> would flip the order on its own.
                This pair is unusually sensitive — several factors are each, individually, enough
                to decide who is ahead.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function MiniProduct({ product, tone }: { product: ReturnType<typeof productById>; tone: 'blue' | 'purple' }) {
  return (
    <div
      className={cx(
        'flex items-center gap-3 rounded-xl border p-3',
        tone === 'blue' ? 'border-blue-200 bg-blue-50/50' : 'border-purple-200 bg-purple-50/50 flex-row-reverse text-right',
      )}
    >
      <ProductThumb product={product} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink-900">{product.name}</div>
        <div className="text-[11px] text-ink-500">Current rank #{product.factors.Popularity.rankWith}</div>
      </div>
    </div>
  )
}

function ScenarioCard({
  factor,
  originalA,
  originalB,
  newA,
  newB,
  status,
}: {
  factor: FactorName
  originalA: number
  originalB: number
  newA: number
  newB: number
  status: TileStatus
}) {
  const span = Math.max(30, Math.max(newA, newB, originalA, originalB) + 5)
  const yFor = (r: number) => ((r - 1) / (span - 1)) * 100

  const frame: Record<TileStatus, string> = {
    flips: 'border-purple-300 bg-purple-50/50 shadow-glow',
    narrows: 'border-blue-200 bg-blue-50/30',
    widens: 'border-blue-200 bg-blue-50/30',
    'zone-shift': 'border-amber-400/40 bg-amber-400/10',
    negligible: 'border-ink-200 bg-white',
  }

  const statusInfo: Record<TileStatus, { icon: React.ReactNode; label: string; tone: string }> = {
    flips: { icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Would flip the order', tone: 'text-purple-600' },
    narrows: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Narrows the gap; order preserved', tone: 'text-blue-700' },
    widens: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Widens the gap; order preserved', tone: 'text-blue-700' },
    'zone-shift': { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Repositions both products together', tone: 'text-amber-600' },
    negligible: { icon: <Minus className="h-3.5 w-3.5" />, label: 'No meaningful effect on this pair', tone: 'text-ink-400' },
  }

  const info = statusInfo[status]

  return (
    <div className={cx('rounded-2xl border p-4 shadow-soft transition-all', frame[status])}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Without</div>
        <FactorChip factor={factor} tone={status === 'flips' ? 'purple' : 'muted'} size="sm" />
      </div>

      <div className="relative mt-4 h-40 rounded-lg border border-ink-100 bg-white p-2">
        <div className="absolute bottom-2 left-2 right-2 top-2 grid grid-cols-2 gap-2">
          <LadderCol label="A" color="#3B68F4" original={originalA} next={newA} yFor={yFor} />
          <LadderCol label="B" color="#7D3EE0" original={originalB} next={newB} yFor={yFor} />
        </div>
      </div>

      <div className={cx('mt-3 flex items-start gap-2 text-[11px]', info.tone)}>
        <span className="mt-0.5 shrink-0">{info.icon}</span>
        <span className="text-ink-800">{info.label}</span>
      </div>
    </div>
  )
}

function LadderCol({
  label,
  color,
  original,
  next,
  yFor,
}: {
  label: string
  color: string
  original: number
  next: number
  yFor: (r: number) => number
}) {
  return (
    <div className="relative rounded-md bg-ink-50/60">
      <div className="absolute inset-x-2 top-2 text-[10px] text-ink-400">{label}</div>
      <div
        className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-soft"
        style={{ top: `${yFor(original)}%`, background: color, opacity: 0.45 }}
      />
      <div
        className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-card"
        style={{ top: `${yFor(next)}%`, background: color }}
      />
      <svg className="absolute inset-0 h-full w-full pointer-events-none">
        <line
          x1="50%"
          x2="50%"
          y1={`${yFor(original)}%`}
          y2={`${yFor(next)}%`}
          stroke={color}
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.6"
        />
      </svg>
      <div
        className="absolute right-1 font-mono text-[10px] text-ink-500"
        style={{ top: `calc(${yFor(original)}% - 5px)` }}
      >
        #{original}
      </div>
      <div
        className="absolute right-1 font-mono text-[10px] font-semibold"
        style={{ top: `calc(${yFor(next)}% - 5px)`, color }}
      >
        #{next}
      </div>
    </div>
  )
}

function PairPicker({
  pair,
  setPair,
}: {
  pair: [string, string]
  setPair: (p: [string, string]) => void
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        Choose a pair
      </div>
      <p className="mt-1 text-[12px] text-ink-600">
        The tiles below show what happens to the ordering if a factor is removed — covering every
        case, not just the "order flips" case.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CURATED_PAIRS.map((cp) => {
          const active = (pair[0] === cp.a && pair[1] === cp.b) || (pair[0] === cp.b && pair[1] === cp.a)
          return (
            <button
              key={cp.label}
              onClick={() => setPair([cp.a, cp.b])}
              className={cx(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
                active
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
              )}
            >
              {cp.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
