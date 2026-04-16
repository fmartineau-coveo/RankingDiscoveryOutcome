import { TrendingUp, TrendingDown, Info, Pin as PinIcon } from 'lucide-react'
import { FACTORS, productById, topPositiveFactor, topNegativeFactor, narrativeForProduct, products, compositionByProduct, compositionLabel } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { RisBar } from '@/components/primitives/RisBar'
import { FactorChip } from '@/components/primitives/FactorChip'
import { risLabel, rankDeltaString } from '@/lib/ris'
import { useConceptState } from '@/lib/conceptState'
import { cx } from '@/lib/utils'

export default function Scorecard() {
  const { focusId, setFocusId } = useConceptState()
  const p = productById(focusId)
  const top = topPositiveFactor(p)
  const bottom = topNegativeFactor(p)
  const narrative = narrativeForProduct(p)
  const composition = compositionByProduct[p.id]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <ProductThumb product={p} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink-500">
              Sofas PLP
              <span className="h-3 w-px bg-ink-300" />
              {p.priceLabel}
              {composition !== 'neutral' && (
                <>
                  <span className="h-3 w-px bg-ink-300" />
                  <span
                    className={cx(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      composition === 'rule-boosted'
                        ? 'bg-teal-500/10 text-teal-500'
                        : composition === 'rule-demoted'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-ink-100 text-ink-600',
                    )}
                  >
                    {compositionLabel[composition]}
                  </span>
                </>
              )}
            </div>
            <h3 className="display mt-1 text-3xl leading-tight text-ink-950">{p.name}</h3>
            <div className="mt-3 flex items-center gap-2">
              <RankBadge rank={p.factors.Popularity.rankWith} total={184} size="md" />
              <span className="text-[13px] text-ink-600">of 184 candidates on this page</span>
            </div>
          </div>
        </div>

        <div
          className={cx(
            'mt-6 rounded-xl border p-4',
            top && p.factors[top].ris > 0.05
              ? 'border-blue-200 bg-blue-50/40'
              : 'border-ink-200 bg-ink-50',
          )}
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-4 w-4 text-blue-600" />
            <div className="text-[14px] leading-relaxed text-ink-800">
              <span className="font-semibold">{narrative.headline}</span>{' '}
              <span className="text-ink-700">{narrative.body}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {FACTORS.map((f) => {
            const e = p.factors[f]
            return (
              <div key={f} className="grid grid-cols-[minmax(0,150px)_1fr_minmax(0,200px)] items-center gap-4">
                <div className="flex items-center justify-between">
                  <FactorChip factor={f} tone={e.ris >= 0 ? 'blue' : 'purple'} />
                </div>
                <RisBar ris={e.ris} width={320} />
                <div className="text-[12px] text-ink-600">
                  <span className="font-medium text-ink-900">{risLabel(e.ris)}</span>
                  <span className="text-ink-500">
                    {' · '}
                    without it, {rankDeltaString(e.rankWith, e.rankWithout)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4 text-[11px] text-ink-500">
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3" /> Explanation valid as of Apr 12, 2026 · regenerates after each model training
          </div>
          <div>Ranked {p.factors.Popularity.rankWith} on this page</div>
        </div>
      </article>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Summary
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatBlock
              label="Top lift"
              value={top}
              sub="Helping the most"
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              tone="blue"
            />
            <StatBlock
              label="Top drag"
              value={bottom ?? '—'}
              sub={bottom ? 'Helping competitors more' : 'No meaningful drag'}
              icon={<TrendingDown className="h-3.5 w-3.5" />}
              tone="purple"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Inspect another product
            </div>
            <PinIcon className="h-3 w-3 text-ink-400" />
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
            The card above updates live. Use the pin button at the top of the page to save the
            current view to your collection.
          </p>
          <div className="mt-3 max-h-72 space-y-0.5 overflow-y-auto pr-0.5 scroll-slim">
            {products.map((q) => {
              const active = q.id === focusId
              return (
                <button
                  key={q.id}
                  onClick={() => setFocusId(q.id)}
                  className={cx(
                    'flex w-full items-center gap-2.5 rounded-lg border px-2 py-1.5 text-left transition-all',
                    active
                      ? 'border-ink-900 bg-ink-900 text-white shadow-card'
                      : 'border-ink-100 bg-white hover:border-ink-300',
                  )}
                >
                  <ProductThumb product={q} size="xs" />
                  <div className="min-w-0 flex-1">
                    <div className={cx('truncate text-[12px] font-medium', active ? 'text-white' : 'text-ink-900')}>
                      {q.name}
                    </div>
                    <div className={cx('text-[10px]', active ? 'text-white/60' : 'text-ink-500')}>
                      #{q.factors.Popularity.rankWith} · {q.priceLabel}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function StatBlock({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  tone: 'blue' | 'purple'
}) {
  return (
    <div
      className={
        'rounded-xl border p-3 ' +
        (tone === 'blue' ? 'border-blue-200 bg-blue-50/60' : 'border-purple-200 bg-purple-50/60')
      }
    >
      <div
        className={
          'flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ' +
          (tone === 'blue' ? 'text-blue-700' : 'text-purple-700')
        }
      >
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-ink-900">{value}</div>
      <div className="text-[11px] text-ink-600">{sub}</div>
    </div>
  )
}
