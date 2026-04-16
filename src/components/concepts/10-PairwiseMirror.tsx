import { FACTORS, productById, products, classifyPairScenario, CURATED_PAIRS, type FactorName } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { useConceptState } from '@/lib/conceptState'
import { ArrowLeftRight } from 'lucide-react'
import { cx } from '@/lib/utils'

const SCENARIO_LABEL: Record<string, string> = {
  'critical-swap': 'Critical swap — removing this factor flips the order',
  'asymmetric': 'Asymmetric — one product moves a lot, the other barely',
  convergence: 'Convergence — the gap would narrow',
  divergence: 'Divergence — the gap would widen',
  'order-preserved': 'Order preserved — both shift, A stays above B',
  'zone-shift': 'Zone shift — both products move to a different part of the list',
  'deep-irrelevant': 'Deep-list — movement is too deep to be meaningful',
  flat: 'Negligible — this factor is not affecting either product',
}

export default function PairwiseMirror() {
  const { pair, setPair } = useConceptState()
  const A = productById(pair[0])
  const B = productById(pair[1])

  return (
    <div className="space-y-6">
      <PairPicker pair={pair} setPair={setPair} />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <MirrorProductHeader product={A} side="left" />
        <div className="grid place-items-center">
          <span className="rounded-full border border-ink-300 bg-white px-3 py-1 text-[11px] font-semibold text-ink-600 shadow-soft">
            vs
          </span>
        </div>
        <MirrorProductHeader product={B} side="right" />
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="grid grid-cols-[1fr_200px_1fr] items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          <div className="text-right">Product A · RIS</div>
          <div className="text-center">Factor · scenario</div>
          <div>Product B · RIS</div>
        </div>

        <div className="mt-4 space-y-5">
          {FACTORS.map((f) => {
            const rA = A.factors[f].ris
            const rB = B.factors[f].ris
            const scenario = classifyPairScenario(A.factors[f], B.factors[f])
            return (
              <div key={f} className="grid grid-cols-[1fr_200px_1fr] items-center gap-3">
                <SideBar value={rA} side="left" tone="blue" />
                <div className="text-center">
                  <FactorChip factor={f} tone="muted" />
                  <div className="mt-1 text-[10px] text-ink-500 leading-tight">
                    {SCENARIO_LABEL[scenario]}
                  </div>
                </div>
                <SideBar value={rB} side="right" tone="purple" />
              </div>
            )
          })}
        </div>

        <VerdictPanel A={A} B={B} />
      </div>
    </div>
  )
}

function VerdictPanel({
  A,
  B,
}: {
  A: ReturnType<typeof productById>
  B: ReturnType<typeof productById>
}) {
  // Find the factor with the largest "asymmetry" — the one most responsible for the gap.
  const sorted = [...FACTORS].sort((x, y) => {
    const asymX = Math.abs(
      (A.factors[x].rankWithout - A.factors[x].rankWith) -
        (B.factors[x].rankWithout - B.factors[x].rankWith),
    )
    const asymY = Math.abs(
      (A.factors[y].rankWithout - A.factors[y].rankWith) -
        (B.factors[y].rankWithout - B.factors[y].rankWith),
    )
    return asymY - asymX
  })
  const dominant: FactorName = sorted[0]
  const dA = A.factors[dominant].rankWithout - A.factors[dominant].rankWith
  const dB = B.factors[dominant].rankWithout - B.factors[dominant].rankWith

  let verdict: string
  if (Math.abs(dA - dB) < 2) {
    verdict = `No single factor is meaningfully separating ${A.name} from ${B.name} on this page. The ordering is the combination of several small effects.`
  } else if (Math.sign(dA) !== Math.sign(dB) && dA !== 0 && dB !== 0) {
    verdict = `The defining pattern is asymmetric ${dominant}: it ${dA > 0 ? 'helps' : 'hurts'} ${A.name} while ${dB > 0 ? 'helping' : 'hurting'} ${B.name} — working in opposite directions on the two products.`
  } else {
    verdict = `${dominant} is the factor creating the largest gap between these two products. It ${dA > 0 ? 'helps' : 'hurts'} both, but favours ${Math.abs(dA) > Math.abs(dB) ? A.name : B.name} more.`
  }

  return (
    <div className="mt-8 rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-[13px] leading-relaxed text-ink-800">
      {verdict}
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
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Compare any two products on this page
        </div>
        <button
          onClick={() => setPair([pair[1], pair[0]])}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-700 shadow-soft hover:bg-ink-50"
        >
          <ArrowLeftRight className="h-3 w-3" /> Swap sides
        </button>
      </div>
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
              {cp.scenarioLabel}
            </button>
          )
        })}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-[11px] font-medium text-ink-500 hover:text-ink-900">
          …or pick two products from the list
        </summary>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <select
            value={pair[0]}
            onChange={(e) => setPair([e.target.value, pair[1]])}
            className="w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === pair[1]}>
                A · #{p.factors.Popularity.rankWith} · {p.name}
              </option>
            ))}
          </select>
          <select
            value={pair[1]}
            onChange={(e) => setPair([pair[0], e.target.value])}
            className="w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === pair[0]}>
                B · #{p.factors.Popularity.rankWith} · {p.name}
              </option>
            ))}
          </select>
        </div>
      </details>
    </div>
  )
}

function MirrorProductHeader({ product, side }: { product: ReturnType<typeof productById>; side: 'left' | 'right' }) {
  return (
    <div
      className={
        'flex items-center gap-3 rounded-2xl border p-4 shadow-soft ' +
        (side === 'left' ? 'border-blue-200 bg-blue-50/40' : 'border-purple-200 bg-purple-50/40 flex-row-reverse text-right')
      }
    >
      <ProductThumb product={product} size="sm" />
      <div className="min-w-0 flex-1">
        <div className={side === 'left' ? 'text-[10px] uppercase tracking-wider text-blue-700' : 'text-[10px] uppercase tracking-wider text-purple-700'}>
          Product {side === 'left' ? 'A' : 'B'}
        </div>
        <div className="truncate text-sm font-semibold text-ink-900">{product.name}</div>
      </div>
      <RankBadge
        rank={product.factors.Popularity.rankWith}
        tone={side === 'left' ? 'blue' : 'purple'}
        size="sm"
      />
    </div>
  )
}

function SideBar({ value, side, tone }: { value: number; side: 'left' | 'right'; tone: 'blue' | 'purple' }) {
  const width = Math.abs(value) * 100
  const color = tone === 'blue' ? '#3B68F4' : '#7D3EE0'
  const hurtColor = tone === 'blue' ? '#BB8EFF' : '#8BAEFF'
  const isLeft = side === 'left'
  return (
    <div className={isLeft ? 'flex items-center justify-end gap-2' : 'flex items-center gap-2'}>
      {isLeft && (
        <span className="font-mono text-[11px] text-ink-500">
          {value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)}
        </span>
      )}
      <div className={isLeft ? 'relative flex h-4 w-full justify-end' : 'relative flex h-4 w-full'}>
        <div className="absolute inset-0 rounded-full bg-ink-50" />
        <div
          className="absolute top-0 h-4 rounded-full"
          style={{
            width: `${width}%`,
            background: value >= 0 ? color : hurtColor,
            [isLeft ? 'right' : 'left']: 0,
          } as React.CSSProperties}
        />
      </div>
      {!isLeft && (
        <span className="font-mono text-[11px] text-ink-500">
          {value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)}
        </span>
      )}
    </div>
  )
}
