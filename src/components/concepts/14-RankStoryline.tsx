import { FACTORS, productById, products, topPositiveFactor, topNegativeFactor, compositionByProduct, compositionLabel } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { risLabel, formatRis } from '@/lib/ris'
import { useConceptState } from '@/lib/conceptState'
import { cx } from '@/lib/utils'
import { Calendar, User, Quote } from 'lucide-react'

/**
 * Rank Storyline — an editorial, reads like a short briefing note.
 * Rebuilt per feedback: the previous columns-and-bars split was unclear.
 * This version embeds factors inline in the prose, with their direction
 * and magnitude highlighted — so the merchandiser can read it like an
 * article and walk away understanding the story.
 */

export default function RankStoryline() {
  const { focusId, setFocusId } = useConceptState()
  const p = productById(focusId)
  const top = topPositiveFactor(p)
  const bottom = topNegativeFactor(p)
  const rank = p.factors.Popularity.rankWith
  const composition = compositionByProduct[p.id]

  const positives = FACTORS.filter((f) => p.factors[f].ris > 0.05).sort(
    (a, b) => p.factors[b].ris - p.factors[a].ris,
  )
  const negatives = FACTORS.filter((f) => p.factors[f].ris < -0.05).sort(
    (a, b) => p.factors[a].ris - p.factors[b].ris,
  )

  return (
    <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
      {/* Editorial column */}
      <article className="rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-ink-500">
          <Calendar className="h-3 w-3" /> Apr 12, 2026
          <span className="h-3 w-px bg-ink-300" />
          <User className="h-3 w-3" /> Ranking Explainer
          <span className="h-3 w-px bg-ink-300" />
          Sofas PLP
        </div>

        <h1 className="display mt-4 text-4xl leading-[1.05] text-ink-950">
          {positives.length === 0
            ? `Why ${p.name} is currently at rank ${rank}.`
            : `${top} is what is keeping ${p.name} at rank ${rank}.`}
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-ink-700">
          On the <strong>Sofas</strong> PLP this week, <strong>{p.name}</strong> sits at{' '}
          <strong>rank {rank} of 184</strong>.{' '}
          {positives.length === 0 ? (
            <>No factor is meaningfully lifting it on this page — its position is essentially what
            the index and merchandiser rules produce on their own.</>
          ) : (
            <>
              The clearest force behind that position is{' '}
              <InlineFactor name={top} ris={p.factors[top].ris} />, which alone accounts for most
              of its current standing: without it, the product would fall from rank {rank} to rank{' '}
              {p.factors[top].rankWithout}.
            </>
          )}
        </p>

        {positives.length > 1 && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
            {positives.slice(1).map((f, i) => (
              <span key={f}>
                {i === 0 && <>Underneath that, </>}
                <InlineFactor name={f} ris={p.factors[f].ris} />{' '}
                {i < positives.length - 2 ? 'and ' : 'also help'}
                {i === positives.length - 2 ? ' the product, though to a smaller extent' : ''}
                {i === 0 && positives.length === 2 ? ' the product, though to a smaller extent' : ''}
                {i < positives.length - 2 ? '' : '.'}
              </span>
            ))}
          </p>
        )}

        {negatives.length > 0 && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
            The main drag on its position is <InlineFactor name={bottom!} ris={p.factors[bottom!].ris} />
            : this factor is currently giving the product's competitors a bigger lift than it
            gives the product itself. Removing it would move {p.name} up to rank{' '}
            {p.factors[bottom!].rankWithout}.
          </p>
        )}

        {composition !== 'neutral' && (
          <p className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-[14px] leading-relaxed text-ink-800">
            <strong>Beyond the model:</strong>{' '}
            {composition === 'rule-boosted'
              ? `a merchandiser rule is also boosting this product on this page. Its final position reflects both the ML reranking described above and your intentional boost.`
              : composition === 'rule-demoted'
                ? `a merchandiser rule is demoting this product on this page. Its final position reflects both the ML reranking described above and your intentional demote.`
                : `retrieval coverage for this product is thin on this query, which is pulling it lower than its factor profile would otherwise suggest.`}
          </p>
        )}

        <div className="mt-6 rounded-xl border border-ink-200 bg-gradient-to-br from-blue-50/40 to-purple-50/40 p-4">
          <Quote className="h-4 w-4 text-purple-600" />
          <p className="mt-2 text-[14px] font-medium italic leading-relaxed text-ink-900">
            {positives.length === 0 && negatives.length === 0
              ? `"Nothing in the factor mix is meaningfully separating ${p.name} from its neighbours. If you want it to move, the lever is a merchandiser rule."`
              : negatives.length === 0
                ? `"${p.name} is at rank ${rank} because ${top} is lifting it. Keep an eye on ${top} — if it changes, this product's rank will follow."`
                : `"${p.name} is at rank ${rank}: ${top} is pushing it up, ${bottom} is holding it down, and the balance is currently in the product's favour — but only just."`}
          </p>
        </div>

        <div className="mt-6 border-t border-ink-100 pt-4 text-[11px] text-ink-500">
          This story is regenerated after each model training. It reflects one-factor-at-a-time rank
          counterfactuals on the Sofas PLP — directionally correct, not a literal decomposition.
        </div>
      </article>

      {/* Context / product picker column */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <ProductThumb product={p} size="md" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-wider text-ink-500">At a glance</div>
              <div className="text-[15px] font-semibold text-ink-900">{p.name}</div>
              <div className="text-[12px] text-ink-500">
                {p.priceLabel} · {compositionLabel[composition]}
              </div>
            </div>
            <RankBadge rank={rank} />
          </div>
          <div className="mt-4 space-y-2">
            {FACTORS.map((f) => {
              const ris = p.factors[f].ris
              return (
                <div key={f} className="flex items-center gap-2 text-[12px]">
                  <FactorChip factor={f} size="sm" tone={ris >= 0 ? 'blue' : ris < -0.03 ? 'purple' : 'muted'} />
                  <span className="ml-auto font-mono text-[11px] text-ink-600">
                    {formatRis(ris)}
                  </span>
                  <span className="w-20 text-right text-[10px] text-ink-500">{risLabel(ris)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Write the story for another product
          </div>
          <div className="mt-3 max-h-80 space-y-0.5 overflow-y-auto scroll-slim">
            {products.map((q) => {
              const active = q.id === focusId
              return (
                <button
                  key={q.id}
                  onClick={() => setFocusId(q.id)}
                  className={cx(
                    'flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left',
                    active
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-100 bg-white hover:border-ink-300',
                  )}
                >
                  <ProductThumb product={q} size="xs" />
                  <div className="min-w-0 flex-1">
                    <div className={cx('truncate text-[12px]', active ? 'text-white' : 'text-ink-900')}>
                      {q.name}
                    </div>
                  </div>
                  <span
                    className={cx(
                      'font-mono text-[10px]',
                      active ? 'text-white/70' : 'text-ink-500',
                    )}
                  >
                    #{q.factors.Popularity.rankWith}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function InlineFactor({ name, ris }: { name: string; ris: number }) {
  const helping = ris >= 0
  return (
    <span
      className={cx(
        'rounded-md px-1.5 py-0.5 text-[14.5px] font-semibold',
        helping ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800',
      )}
    >
      {name}
    </span>
  )
}
