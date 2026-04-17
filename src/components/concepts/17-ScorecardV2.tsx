import { useMemo } from 'react'
import {
  TrendingUp,
  Info,
  Pin as PinIcon,
  CalendarClock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import {
  FACTORS,
  productById,
  topPositiveFactor,
  topNegativeFactor,
  products,
  compositionByProduct,
  compositionLabel,
  type FactorName,
  type Product,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { useConceptState } from '@/lib/conceptState'
import { cx } from '@/lib/utils'

/**
 * Concept 17 — Ranking Impact Scorecard (Version 2).
 *
 * Incremental iteration on concept 01 driven by stakeholder comments on the
 * original. The original (concept 01) is preserved for comparison; this file
 * is intentionally a sibling, not a replacement.
 *
 * Changes vs. the original, each tied to a specific comment:
 *
 *  - Comment #1 ("I would maybe rename it for something with a less negative
 *    connotation but i love the idea of showing which factors helped
 *    competitors more.")
 *      → The summary's "Top drag / Helping competitors more" is renamed to
 *        "Top lift for competitors here" (positive-framed action on both
 *        sides). The per-factor verdicts drop "helping / hurting" for the
 *        symmetric "lifts this product / lifts competitors" phrasing so
 *        neither direction reads as defective.
 *
 *  - Comment #2 ("I don't think the bars are helpful here, i think they are
 *    more misleading than helpful. i feel like just the factor label and the
 *    'without it' explanation is enough.")
 *      → RIS bars removed. Each factor row is now one short sentence:
 *        verdict + "without it, this product would …". Direction is carried
 *        by the chip tone and a small arrow icon, not by a bar.
 *
 *  - Comment #3 ("We must add this as an AC in the UI ! Totally relevant and
 *    necessary.")
 *      → The "valid until next training" note, previously a thin footer, is
 *        promoted to a prominent Validity band right under the product
 *        header, with a last-refreshed date and the next-refresh condition.
 *        Treated as an acceptance criterion, not a footnote.
 *
 *  - Comment #4 ("The 'without it' framing hints at ablation but i still think
 *    that merchandisers could find this framing helpful.")
 *      → Acknowledged. The "without [Factor], this product would …"
 *        framing stays central.
 */

type Verdict = {
  /** Plain-language phrase tying direction to beneficiary. */
  label: string
  tone: 'blue' | 'purple' | 'muted'
  /** Whether the factor is working for this product (up), competitors (down), or neither. */
  direction: 'this' | 'competitors' | 'neither'
}

function softVerdict(ris: number): Verdict {
  if (Math.abs(ris) < 0.05)
    return { label: 'Negligible effect on this page', tone: 'muted', direction: 'neither' }
  if (ris > 0.6) return { label: 'Strongly lifts this product', tone: 'blue', direction: 'this' }
  if (ris > 0.3) return { label: 'Clearly lifts this product', tone: 'blue', direction: 'this' }
  if (ris > 0.05) return { label: 'Mildly lifts this product', tone: 'blue', direction: 'this' }
  if (ris < -0.6) return { label: 'Strongly lifts competitors here', tone: 'purple', direction: 'competitors' }
  if (ris < -0.3) return { label: 'Clearly lifts competitors here', tone: 'purple', direction: 'competitors' }
  return { label: 'Mildly lifts competitors here', tone: 'purple', direction: 'competitors' }
}

/**
 * Sentence builder for a factor row. Stakeholder feedback on V1 was explicit:
 *  - For factors that HELP this product, the counterfactual "without [F], this
 *    product would drop to rank X" is intuitive and welcome.
 *  - For factors that HELP COMPETITORS, the mirror counterfactual "without
 *    [F], this product would move UP to rank X" forces the reader to mentally
 *    invert the logic ("if removing it helps, then it must be hurting") — too
 *    unintuitive. Replace it with a direct competitive-position statement
 *    that never asks the reader to do the inversion.
 *
 *  Both phrasings stay faithful to the same ablation data; only the framing
 *  around the negative case changes.
 */
function factorSentence(
  factor: FactorName,
  rankWith: number,
  rankWithout: number,
  direction: Verdict['direction'],
): string {
  if (direction === 'this') {
    const delta = rankWithout - rankWith
    if (delta === 0) return `Without ${factor}, this product would still sit at rank ${rankWith}.`
    return `Without ${factor}, this product would fall from rank ${rankWith} to rank ${rankWithout}.`
  }
  if (direction === 'competitors') {
    // Never say "removing it would move the product up". Speak to who the
    // factor is currently working for.
    return `${factor} is giving a bigger lift to competing products on this page than to this one.`
  }
  return `${factor} isn't meaningfully shaping this product's position here.`
}

/**
 * V2-local narrative. Mirrors the structure of the shared narrativeForProduct
 * but swaps the "removing it would move the product up" phrasing — used for
 * negative factors — for a direct competitive-position statement.
 */
function narrativeForV2(p: Product): { headline: string; body: string } {
  const rank = p.factors.Popularity.rankWith
  const top = topPositiveFactor(p)
  const bottom = topNegativeFactor(p)
  const topRis = p.factors[top].ris

  let headline: string
  if (topRis > 0.6) {
    headline = `${top} is the main reason ${p.name} is at rank ${rank}.`
  } else if (topRis > 0.3) {
    headline = `${top} is the clearest factor lifting ${p.name} on this page.`
  } else if (topRis > 0.05) {
    headline = `${p.name} is at rank ${rank} — broadly supported, no single factor dominates.`
  } else {
    headline = `No factor is meaningfully lifting ${p.name} on this page.`
  }

  const parts: string[] = []
  if (topRis > 0.05) {
    const t = p.factors[top]
    parts.push(
      `Without ${top}, this product would fall from rank ${t.rankWith} to rank ${t.rankWithout}.`,
    )
  }
  if (bottom) {
    parts.push(
      `${bottom} is doing more for competing products on this page than for ${p.name}.`,
    )
  }
  const composition = compositionByProduct[p.id]
  if (composition === 'rule-boosted')
    parts.push('A merchandiser rule is also boosting this product on this page.')
  if (composition === 'rule-demoted')
    parts.push('A merchandiser rule is demoting this product on this page.')
  if (composition === 'retrieval-thin')
    parts.push('Retrieval coverage for this product is thin on this query.')
  return { headline, body: parts.join(' ') }
}

export default function ScorecardV2() {
  const { focusId, setFocusId } = useConceptState()
  const p = productById(focusId)
  const top = topPositiveFactor(p)
  const bottom = topNegativeFactor(p)
  const narrative = narrativeForV2(p)
  const composition = compositionByProduct[p.id]

  // Order factors by how much they're doing (by |RIS|), descending, so the
  // most material story lives at the top of the list.
  const orderedFactors = useMemo(
    () => [...FACTORS].sort((a, b) => Math.abs(p.factors[b].ris) - Math.abs(p.factors[a].ris)),
    [p],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        {/* Product header */}
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

        {/* Validity band — promoted per comment #3 */}
        <ValidityBand />

        {/* Narrative headline */}
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

        {/* Factor list — text-forward, no bars, per comment #2 */}
        <ul className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200">
          {orderedFactors.map((f) => {
            const e = p.factors[f]
            const v = softVerdict(e.ris)
            return (
              <li key={f} className="grid grid-cols-[minmax(0,160px)_minmax(0,1fr)] items-start gap-4 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <FactorChip factor={f} tone={v.tone} />
                  <DirectionGlyph direction={v.direction} />
                </div>
                <div className="min-w-0">
                  <div
                    className={cx(
                      'text-[13.5px] font-semibold',
                      v.tone === 'blue'
                        ? 'text-blue-800'
                        : v.tone === 'purple'
                          ? 'text-purple-800'
                          : 'text-ink-500',
                    )}
                  >
                    {v.label}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-600">
                    {factorSentence(f, e.rankWith, e.rankWithout, v.direction)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Composition rail (rules + retrieval) — unchanged idea, reworded */}
        {composition !== 'neutral' && (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>
              <strong>Beyond the model:</strong>{' '}
              {composition === 'rule-boosted'
                ? 'a merchandiser rule is also boosting this product here. The rank you see is the rule + the factor forces above, not the factor forces alone.'
                : composition === 'rule-demoted'
                  ? 'a merchandiser rule is demoting this product here. The rank you see is the rule + the factor forces above, not the factor forces alone.'
                  : 'retrieval coverage for this product is thin on this query, which caps how high it can land regardless of the factor forces above.'}
            </span>
          </div>
        )}
      </article>

      <aside className="space-y-4">
        {/* Summary — renamed labels per comment #1 */}
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            What's shaping this page position?
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <StatBlock
              label="Top lift for this product"
              value={top}
              sub={
                p.factors[top].ris > 0.05
                  ? 'Working hardest in this product\'s favour'
                  : 'No factor is meaningfully lifting this product'
              }
              tone="blue"
            />
            <StatBlock
              label="Top lift for competitors here"
              value={bottom ?? '—'}
              sub={
                bottom
                  ? 'Working harder for competitors than for this product'
                  : 'Competitors are not getting a clear edge from any factor'
              }
              tone="purple"
            />
          </div>
        </div>

        {/* Product picker */}
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

        {/* Changelog pointer vs. concept 01 */}
        <div className="rounded-2xl border border-dashed border-purple-300 bg-purple-50/40 p-4 text-[11px] leading-relaxed text-ink-700">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
            What changed from v1
          </div>
          <ul className="mt-2 space-y-1.5">
            <li>· Softer, symmetric labels — "lifts this product" / "lifts competitors"</li>
            <li>· RIS bars removed, factor rows are one short sentence</li>
            <li>· Validity band promoted from footer to a top-level AC</li>
            <li>· For factors helping competitors, the reader no longer has to invert a counterfactual — we just say who the factor is working for</li>
            <li>· "Without [factor] …" framing kept, but only where it reads intuitively (factors helping this product)</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}

/**
 * The new validity band — Comment #3 asked that the "regenerates after each
 * model training" line be treated as an acceptance criterion, not a footnote.
 * It sits right under the product header, on every view, with a last-refreshed
 * timestamp and the next-refresh condition.
 */
function ValidityBand() {
  return (
    <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-white px-4 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-purple-600 shadow-soft">
        <CalendarClock className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
          Snapshot from Apr 12, 2026
          <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-600 shadow-soft">
            Refreshes each training
          </span>
        </div>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-700">
          This explanation is a point-in-time read and will regenerate the next time the ranking
          model retrains. Treat it as a current best understanding, not a fixed property of the
          product.
        </p>
      </div>
      <div className="hidden items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-[11px] text-ink-700 md:inline-flex">
        <RefreshCw className="h-3 w-3" /> Next refresh: on training
      </div>
    </div>
  )
}

function DirectionGlyph({ direction }: { direction: Verdict['direction'] }) {
  if (direction === 'this')
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-100 text-blue-700">
        <ArrowUpRight className="h-3 w-3" />
      </span>
    )
  if (direction === 'competitors')
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-purple-100 text-purple-700">
        <ArrowDownRight className="h-3 w-3" />
      </span>
    )
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-100 text-ink-500">
      <Minus className="h-3 w-3" />
    </span>
  )
}

function StatBlock({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone: 'blue' | 'purple'
}) {
  return (
    <div
      className={cx(
        'rounded-xl border p-3',
        tone === 'blue' ? 'border-blue-200 bg-blue-50/60' : 'border-purple-200 bg-purple-50/60',
      )}
    >
      <div
        className={cx(
          'text-[10px] font-semibold uppercase tracking-wider',
          tone === 'blue' ? 'text-blue-700' : 'text-purple-700',
        )}
      >
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-ink-900">{value}</div>
      <div className="text-[11px] text-ink-600">{sub}</div>
    </div>
  )
}
