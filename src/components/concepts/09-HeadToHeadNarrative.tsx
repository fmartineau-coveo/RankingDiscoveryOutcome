import { useState } from 'react'
import { FACTORS, productById, products, narrativeForPair, CURATED_PAIRS } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { RisBar } from '@/components/primitives/RisBar'
import { useConceptState } from '@/lib/conceptState'
import { Quote, Sparkles, ArrowLeftRight } from 'lucide-react'
import { cx } from '@/lib/utils'

export default function HeadToHeadNarrative() {
  const { pair, setPair } = useConceptState()
  const [expanded, setExpanded] = useState(false)

  const A = productById(pair[0])
  const B = productById(pair[1])
  const narrative = narrativeForPair(A, B)

  return (
    <div className="space-y-6">
      <PairPicker pair={pair} setPair={setPair} />

      <div className="grid gap-4 md:grid-cols-2">
        <ProductCard product={A} tone="blue" label="A" />
        <ProductCard product={B} tone="purple" label="B" />
      </div>

      <article className="relative overflow-hidden rounded-2xl border border-ink-900 bg-ink-950 p-7 text-white shadow-lift">
        <div className="absolute right-6 top-6 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          <Sparkles className="h-3 w-3" /> Pairwise narrative
        </div>
        <Quote className="h-6 w-6 text-purple-300" />
        <h4 className="display mt-4 text-3xl leading-snug text-white">{narrative.headline}</h4>
        <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-white/80">
          {narrative.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-[11px] text-white/50">
          <span>Generated from rank-with / rank-without data for this pair</span>
          <span className="h-3 w-px bg-white/20" />
          <span>Prompt v1.2 · Apr 2026</span>
          <span className="h-3 w-px bg-white/20" />
          <span>Valid until the next model training</span>
        </div>
      </article>

      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            The rank counterfactuals the narrative is built on
          </div>
          <button
            onClick={() => setExpanded((x) => !x)}
            className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] text-ink-700 shadow-soft hover:bg-ink-50"
          >
            {expanded ? 'Hide' : 'Show'} raw numbers
          </button>
        </div>
        {expanded && (
          <div className="mt-4 grid grid-cols-[140px_1fr_1fr] items-center gap-4 text-[12px]">
            <div />
            <div className="font-medium text-ink-800">
              {A.name} (rank #{A.factors.Popularity.rankWith})
            </div>
            <div className="font-medium text-ink-800">
              {B.name} (rank #{B.factors.Popularity.rankWith})
            </div>
            {FACTORS.map((f) => (
              <Row key={f} f={f} A={A} B={B} />
            ))}
          </div>
        )}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Pick a pair to compare
          </div>
          <p className="mt-1 max-w-2xl text-[12px] text-ink-600">
            The narrative and underlying rank numbers below update from whatever pair you select.
            Each curated pair demonstrates a different scenario from the discovery's scenario
            library — a critical swap, an asymmetric impact, a convergence, a deep-list pair, etc.
          </p>
        </div>
        <button
          onClick={() => setPair([pair[1], pair[0]])}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-700 shadow-soft hover:bg-ink-50"
        >
          <ArrowLeftRight className="h-3 w-3" /> Swap A and B
        </button>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {CURATED_PAIRS.map((cp) => {
          const active = (pair[0] === cp.a && pair[1] === cp.b) || (pair[0] === cp.b && pair[1] === cp.a)
          return (
            <button
              key={cp.label}
              onClick={() => setPair([cp.a, cp.b])}
              className={cx(
                'rounded-lg border p-3 text-left transition-all',
                active
                  ? 'border-ink-900 bg-ink-900 text-white shadow-card'
                  : 'border-ink-200 bg-white hover:border-ink-300',
              )}
            >
              <div className={cx('text-[12px] font-semibold', active ? 'text-white' : 'text-ink-900')}>
                {cp.label}
              </div>
              <div className={cx('mt-0.5 text-[11px]', active ? 'text-white/60' : 'text-ink-500')}>
                {cp.scenarioLabel}
              </div>
            </button>
          )
        })}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-[11px] font-medium text-ink-500 hover:text-ink-900">
          …or pick any two products manually
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

function ProductCard({ product, tone, label }: { product: ReturnType<typeof productById>; tone: 'blue' | 'purple'; label: string }) {
  return (
    <div
      className={
        'rounded-2xl border p-5 shadow-soft ' +
        (tone === 'blue' ? 'border-blue-200 bg-blue-50/30' : 'border-purple-200 bg-purple-50/30')
      }
    >
      <div className="flex items-start gap-4">
        <ProductThumb product={product} size="md" />
        <div className="flex-1">
          <div
            className={
              'text-[11px] font-semibold uppercase tracking-[0.14em] ' +
              (tone === 'blue' ? 'text-blue-700' : 'text-purple-700')
            }
          >
            Product {label}
          </div>
          <h3 className="mt-0.5 text-lg font-semibold text-ink-900">{product.name}</h3>
          <div className="text-[12px] text-ink-600">{product.priceLabel}</div>
        </div>
        <RankBadge
          rank={product.factors.Popularity.rankWith}
          tone={tone}
          size="md"
        />
      </div>
    </div>
  )
}

function Row({ f, A, B }: { f: typeof FACTORS[number]; A: ReturnType<typeof productById>; B: ReturnType<typeof productById> }) {
  return (
    <>
      <div>
        <FactorChip factor={f} tone={'muted'} size="sm" />
      </div>
      <MiniAblation
        rankWith={A.factors[f].rankWith}
        rankWithout={A.factors[f].rankWithout}
        tone="blue"
      />
      <MiniAblation
        rankWith={B.factors[f].rankWith}
        rankWithout={B.factors[f].rankWithout}
        tone="purple"
      />
    </>
  )
}

function MiniAblation({ rankWith, rankWithout, tone }: { rankWith: number; rankWithout: number; tone: 'blue' | 'purple' }) {
  const delta = rankWithout - rankWith
  const helping = delta > 0
  const color = tone === 'blue' ? '#3B68F4' : '#7D3EE0'
  return (
    <div className="flex items-center gap-2 text-[12px] text-ink-700">
      <span className="font-mono text-[12px]">#{rankWith}</span>
      <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">→ without</span>
      <span className="font-mono font-semibold" style={{ color: Math.abs(delta) < 2 ? '#9096B8' : color }}>
        #{rankWithout}
      </span>
      <RisBar
        ris={helping ? Math.min(1, Math.abs(delta) / 20) : -Math.min(1, Math.abs(delta) / 20)}
        width={80}
        height={6}
        showZero={false}
      />
    </div>
  )
}
