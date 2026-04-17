import { useState } from 'react'
import { FACTORS, productById, products, narrativeForPair, CURATED_PAIRS } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { RisBar } from '@/components/primitives/RisBar'
import { useConceptState } from '@/lib/conceptState'
import { Quote, Sparkles, ChevronDown } from 'lucide-react'
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

      <TryAnotherPair pair={pair} setPair={setPair} />

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

/**
 * Pair picker — product selectors are the primary UI, curated pairs moved to
 * a secondary "try another pair" row below the narrative. Matches the system
 * prompt's discipline: no internal scenario-library names in any user-facing
 * copy.
 */
function PairPicker({
  pair,
  setPair,
}: {
  pair: [string, string]
  setPair: (p: [string, string]) => void
}) {
  const A = productById(pair[0])
  const B = productById(pair[1])
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        Compare two products
      </div>
      <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink-600">
        Pick two products from the Sofas PLP and the narrative below will explain why one is
        ranked above the other, led by the factor that matters most for the pair.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ProductPickerTile
          label="Product A"
          tone="blue"
          selected={A}
          disabledId={pair[1]}
          onChange={(id) => setPair([id, pair[1]])}
        />
        <ProductPickerTile
          label="Product B"
          tone="purple"
          selected={B}
          disabledId={pair[0]}
          onChange={(id) => setPair([pair[0], id])}
        />
      </div>
    </section>
  )
}

function ProductPickerTile({
  label,
  tone,
  selected,
  disabledId,
  onChange,
}: {
  label: string
  tone: 'blue' | 'purple'
  selected: ReturnType<typeof productById>
  disabledId: string
  onChange: (id: string) => void
}) {
  return (
    <label
      className={cx(
        'group relative flex items-center gap-4 rounded-xl border-2 p-3 transition-all focus-within:ring-2',
        tone === 'blue'
          ? 'border-blue-200 bg-blue-50/40 focus-within:border-blue-500 focus-within:ring-blue-100'
          : 'border-purple-200 bg-purple-50/40 focus-within:border-purple-500 focus-within:ring-purple-100',
      )}
    >
      <ProductThumb product={selected} size="md" />
      <div className="min-w-0 flex-1">
        <div
          className={cx(
            'text-[10px] font-semibold uppercase tracking-[0.14em]',
            tone === 'blue' ? 'text-blue-700' : 'text-purple-700',
          )}
        >
          {label}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <div className="truncate text-[15px] font-semibold text-ink-900">{selected.name}</div>
          <RankBadge
            rank={selected.factors.Popularity.rankWith}
            tone={tone}
            size="sm"
          />
        </div>
        <div className="mt-0.5 text-[11px] text-ink-500">{selected.priceLabel}</div>
        <div className="relative mt-2">
          <select
            value={selected.id}
            onChange={(e) => onChange(e.target.value)}
            className={cx(
              'w-full cursor-pointer appearance-none rounded-md border bg-white px-2.5 py-1.5 pr-7 text-[12px] text-ink-800 outline-none',
              tone === 'blue' ? 'border-blue-200' : 'border-purple-200',
            )}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === disabledId}>
                Change to: #{p.factors.Popularity.rankWith} · {p.name}
                {p.id === disabledId ? ' (already selected)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cx(
              'pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2',
              tone === 'blue' ? 'text-blue-600' : 'text-purple-600',
            )}
          />
        </div>
      </div>
    </label>
  )
}

function TryAnotherPair({
  pair,
  setPair,
}: {
  pair: [string, string]
  setPair: (p: [string, string]) => void
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-ink-50/50 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Or try another pair
        </div>
        <div className="text-[11px] text-ink-500">Picks that read differently</div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {CURATED_PAIRS.map((cp) => {
          const active =
            (pair[0] === cp.a && pair[1] === cp.b) || (pair[0] === cp.b && pair[1] === cp.a)
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
    </section>
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
