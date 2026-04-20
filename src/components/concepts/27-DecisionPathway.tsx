import { useMemo } from 'react'
import {
  FACTORS,
  productById,
  products,
  CURATED_PAIRS,
  type FactorName,
  type Product,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { useConceptState } from '@/lib/conceptState'
import { cx } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

/**
 * Concept 27 — Decision Pathway.
 *
 * A pairwise reasoning tree. Given two products, walk factor-by-factor
 * through the order the narrative would follow (dominant factor first,
 * then secondaries, ordered by materiality). At each node, show which
 * product the factor currently favours and by how many positions of gap
 * change. The leaf is the conclusion.
 *
 * Makes the pairwise narrative inspectable: a merchandiser who wants to
 * see the reasoning behind the paragraph can trace it step by step
 * without having to compute anything themselves.
 */

type Node = {
  factor: FactorName
  favours: 'top' | 'other' | 'neutral'
  swing: number
  explanation: string
}

function analyzeNode(factor: FactorName, top: Product, other: Product): Node {
  const tf = top.factors[factor]
  const of = other.factors[factor]
  const gapWith = of.rankWith - tf.rankWith
  const gapWithout = of.rankWithout - tf.rankWithout
  const swing = gapWithout - gapWith
  const favours: Node['favours'] =
    Math.abs(swing) < 2 ? 'neutral' : swing < 0 ? 'top' : 'other'
  let explanation: string
  if (favours === 'top') {
    explanation = `Without ${factor}, the gap between the two would narrow by about ${Math.abs(swing)} position${Math.abs(swing) === 1 ? '' : 's'} — ${factor} is part of what keeps ${top.name} ahead.`
  } else if (favours === 'other') {
    explanation = `Without ${factor}, the gap would widen by about ${swing} position${swing === 1 ? '' : 's'} — ${factor} currently benefits ${other.name} more than ${top.name}.`
  } else {
    explanation = `${factor} has a minor effect on the gap between these two products here — not worth leading the story with.`
  }
  return { factor, favours, swing, explanation }
}

function buildPathway(a: Product, b: Product): { top: Product; other: Product; nodes: Node[] } {
  const top = a.factors.Popularity.rankWith <= b.factors.Popularity.rankWith ? a : b
  const other = top === a ? b : a
  const nodes = FACTORS.map((f) => analyzeNode(f, top, other)).sort(
    (x, y) => Math.abs(y.swing) - Math.abs(x.swing),
  )
  return { top, other, nodes }
}

export default function DecisionPathway() {
  const { pair, setPair } = useConceptState()
  const A = productById(pair[0])
  const B = productById(pair[1])
  const pathway = useMemo(() => buildPathway(A, B), [A, B])
  const runningGap = useMemo(() => {
    let gap = pathway.other.factors.Popularity.rankWith - pathway.top.factors.Popularity.rankWith
    const history = [gap]
    for (const n of pathway.nodes) {
      gap -= n.swing
      history.push(gap)
    }
    return history
  }, [pathway])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          The reasoning behind the narrative, step by step
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-700">
          The pairwise narrative tells you the answer. This view shows you the reasoning: factor by
          factor, in order of impact, which product each one favours on this page and by how much
          the gap between them shifts because of it.
        </p>
      </section>

      <PairSelector pair={pair} setPair={setPair} />

      <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <EndpointCard product={pathway.top} tone="blue" label="Top of the pair" />
          <div className="text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              gap
            </div>
            <div className="display text-3xl text-ink-950">
              {runningGap[0] >= 0 ? '+' : ''}
              {runningGap[0]}
            </div>
            <div className="text-[10px] text-ink-500">positions</div>
          </div>
          <EndpointCard product={pathway.other} tone="purple" label="Below" alignEnd />
        </div>

        <ol className="mt-6 space-y-3">
          {pathway.nodes.map((node, i) => (
            <PathwayNode
              key={node.factor}
              node={node}
              index={i}
              topName={pathway.top.name}
              otherName={pathway.other.name}
              runningGapBefore={runningGap[i]}
              runningGapAfter={runningGap[i + 1]}
            />
          ))}
        </ol>

        <div className="mt-6 rounded-xl border border-ink-900 bg-ink-950 p-4 text-[13px] leading-relaxed text-white">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
            Conclusion
          </div>
          <p className="mt-1 text-white">
            Reading the factors in order of impact, {pathway.top.name} is ranked above{' '}
            {pathway.other.name} because {pathway.nodes[0].factor} is the decisive factor on this
            page.{' '}
            {pathway.nodes[1]
              ? `${pathway.nodes[1].factor} ${pathway.nodes[1].favours === 'top' ? 'reinforces' : pathway.nodes[1].favours === 'other' ? 'partially counterbalances' : 'barely affects'} the outcome.`
              : ''}
          </p>
        </div>
      </section>
    </div>
  )
}

function PairSelector({
  pair,
  setPair,
}: {
  pair: [string, string]
  setPair: (p: [string, string]) => void
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Try a pair
        </span>
        {CURATED_PAIRS.map((cp) => {
          const active =
            (pair[0] === cp.a && pair[1] === cp.b) || (pair[0] === cp.b && pair[1] === cp.a)
          return (
            <button
              key={cp.label}
              onClick={() => setPair([cp.a, cp.b])}
              className={cx(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                active
                  ? 'border-ink-900 bg-ink-900 text-white shadow-soft'
                  : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
              )}
            >
              {cp.label}
            </button>
          )
        })}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {(['A', 'B'] as const).map((label, i) => (
          <select
            key={label}
            value={pair[i]}
            onChange={(e) => {
              const next: [string, string] = [...pair]
              next[i] = e.target.value
              setPair(next)
            }}
            className="w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-[12.5px]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id} disabled={pair[1 - i] === p.id}>
                {label} · #{p.factors.Popularity.rankWith} · {p.name}
              </option>
            ))}
          </select>
        ))}
      </div>
    </section>
  )
}

function EndpointCard({
  product,
  tone,
  label,
  alignEnd,
}: {
  product: Product
  tone: 'blue' | 'purple'
  label: string
  alignEnd?: boolean
}) {
  return (
    <div
      className={cx(
        'flex items-center gap-3 rounded-xl border p-3',
        tone === 'blue' ? 'border-blue-200 bg-blue-50/40' : 'border-purple-200 bg-purple-50/40',
        alignEnd && 'flex-row-reverse text-right',
      )}
    >
      <ProductThumb product={product} size="sm" />
      <div className="min-w-0 flex-1">
        <div
          className={cx(
            'text-[10px] font-semibold uppercase tracking-[0.14em]',
            tone === 'blue' ? 'text-blue-700' : 'text-purple-700',
          )}
        >
          {label}
        </div>
        <div className="truncate text-[14px] font-semibold text-ink-900">{product.name}</div>
      </div>
      <RankBadge rank={product.factors.Popularity.rankWith} size="sm" tone={tone} />
    </div>
  )
}

function PathwayNode({
  node,
  index,
  topName,
  otherName,
  runningGapBefore,
  runningGapAfter,
}: {
  node: Node
  index: number
  topName: string
  otherName: string
  runningGapBefore: number
  runningGapAfter: number
}) {
  const toneCls =
    node.favours === 'top'
      ? 'border-blue-200 bg-blue-50/30'
      : node.favours === 'other'
        ? 'border-purple-200 bg-purple-50/30'
        : 'border-ink-200 bg-ink-50'
  return (
    <li className={cx('grid grid-cols-[36px_auto_minmax(0,1fr)_auto] items-start gap-4 rounded-xl border p-4', toneCls)}>
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-white font-mono text-[11px] font-semibold text-ink-700 shadow-soft">
        {index + 1}
      </span>
      <div className="flex flex-col items-start gap-1.5">
        <FactorChip
          factor={node.factor}
          tone={node.favours === 'top' ? 'blue' : node.favours === 'other' ? 'purple' : 'muted'}
        />
        <span
          className={cx(
            'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
            node.favours === 'top'
              ? 'text-blue-700'
              : node.favours === 'other'
                ? 'text-purple-700'
                : 'text-ink-500',
          )}
        >
          {node.favours === 'top' ? (
            <>Favours {topName}</>
          ) : node.favours === 'other' ? (
            <>Favours {otherName}</>
          ) : (
            <>Neutral on the gap</>
          )}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] leading-relaxed text-ink-800">{node.explanation}</p>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-500">
        <span>{runningGapBefore >= 0 ? '+' : ''}{runningGapBefore}</span>
        <ChevronRight className="h-3 w-3 text-ink-400" />
        <span
          className={cx(
            'font-semibold',
            runningGapAfter > runningGapBefore
              ? 'text-blue-700'
              : runningGapAfter < runningGapBefore
                ? 'text-purple-700'
                : 'text-ink-500',
          )}
        >
          {runningGapAfter >= 0 ? '+' : ''}{runningGapAfter}
        </span>
      </div>
    </li>
  )
}

