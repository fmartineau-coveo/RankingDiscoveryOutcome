import { useMemo } from 'react'
import {
  TrendingUp,
  Info,
  Pin as PinIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Pin,
  Anchor,
  Flag,
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
 * Concept 18 — Ranking Impact Scorecard · Version 3.
 *
 * Builds on V2 with one major addition: merchandising rules are surfaced as a
 * first-class section alongside the factor explanation. The merchandiser now
 * sees an account of the whole served rank — the model's factor forces AND
 * the rules they themselves put in place — without the two being blended into
 * a single opaque number.
 *
 * Per latest feedback, this version:
 *  - KEEPS from V1  : the concept description (header) and the small,
 *                     unobtrusive validity disclaimer at the footer.
 *  - KEEPS from V2  : the text-forward factor rows — symmetric labels, no
 *                     bars, and the direct competitive-position framing for
 *                     factors that help competitors (no "removing it would
 *                     move the product up" inversion).
 *  - ADDS            : a concrete Merchandising Rules block, visually
 *                     distinct from the factor rows, showing named rules and
 *                     their impact on rank.
 *  - DROPS from V2  : the prominent validity band and the "what changed in
 *                     this version" changelog.
 *  - SIDEBAR        : "Top lift for this product" (V2 label) paired with the
 *                     shorter V1 "Top drag" — the merchandiser asked for that
 *                     mix specifically.
 */

// ---------------------------------------------------------------------------
// Local synthetic data — merchandising rules per product.
//
// Kept local to V3 so V1 and V2 stay untouched. Rules are realistic for a
// Sofas PLP (campaign pins, low-margin demotes, affordability pushes). The
// effect copy stays qualitative — we never claim a precise post-rule rank,
// only the rule's intent and its approximate directional weight. This is the
// honest posture: rules are operator-defined, so we can describe their intent
// verbatim, but their combined effect on the specific rank is an estimate.
// ---------------------------------------------------------------------------

type RuleKind = 'pin' | 'boost' | 'demote'

type Rule = {
  id: string
  name: string
  kind: RuleKind
  scope: string
  rationale: string
  effect: string
}

const rulesByProduct: Record<string, Rule[]> = {
  'nordic-loft': [
    {
      id: 'nordic-spring',
      name: 'Nordic Spring 2026 · pin to top',
      kind: 'pin',
      scope: 'Brand = Nordic Collection · Category = Sofas',
      rationale:
        'Nordic Collection items are pinned to the top of the Sofas page during the Spring 2026 campaign window (Mar 15 – Apr 30).',
      effect: 'Pinned to rank #1 on this page.',
    },
  ],
  'copenhagen-linen': [
    {
      id: 'q1-affordability',
      name: 'Q1 affordability push',
      kind: 'boost',
      scope: 'Price €1,000 – €2,000',
      rationale:
        'Lift mid-priced sofas to support Q1 value-conscious shoppers, without overriding the model\'s preferred ordering inside the boosted band.',
      effect: 'Small lift — sits a couple of positions higher than the four factors alone would place it.',
    },
  ],
  'atlas-sectional': [
    {
      id: 'premium-clearout',
      name: 'Premium clear-out',
      kind: 'demote',
      scope: 'Price above €3,000',
      rationale:
        'Downweight premium items to rebalance the browse toward the mid-range while clearing Q4 inventory.',
      effect: 'Held about 1 position lower than the four factors alone would place it.',
    },
  ],
  'harbor-lounge': [
    {
      id: 'low-margin-bundle',
      name: 'Low-margin bundle · demote',
      kind: 'demote',
      scope: 'Tag = bundle-sku',
      rationale:
        'Bundled SKUs are pushed below standalone SKUs on category pages, following the current mid-margin mix strategy.',
      effect: 'Held about 6 positions lower on this page than the four factors alone would place it.',
    },
  ],
  'granite-xl': [
    {
      id: 'premium-clearout-2',
      name: 'Premium clear-out',
      kind: 'demote',
      scope: 'Price above €3,000',
      rationale:
        'Same Q1 rebalancing rule as applied to other premium items — downweight to push browse toward the mid-range.',
      effect: 'Held a few positions lower than the four factors alone would place it.',
    },
  ],
  // Other products have no explicit rule entries; the empty state is explicit.
}

type Verdict = {
  label: string
  tone: 'blue' | 'purple' | 'muted'
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
    return `${factor} is giving a bigger lift to competing products on this page than to this one.`
  }
  return `${factor} isn't meaningfully shaping this product's position here.`
}

/**
 * V3 narrative. Same direct-framing philosophy as V2: counterfactuals only for
 * factors helping this product, direct statements for factors helping
 * competitors. Adds a one-sentence rule acknowledgement when applicable, so
 * the opening paragraph already hints at the full ranking story.
 */
function narrativeForV3(p: Product): { headline: string; body: string } {
  const rank = p.factors.Popularity.rankWith
  const top = topPositiveFactor(p)
  const bottom = topNegativeFactor(p)
  const topRis = p.factors[top].ris
  const rules = rulesByProduct[p.id] ?? []

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
  if (rules.length > 0) {
    const top = rules[0]
    if (top.kind === 'pin') parts.push(`A merchandising rule is pinning this product.`)
    else if (top.kind === 'boost') parts.push(`A merchandising rule is also boosting this product here.`)
    else parts.push(`A merchandising rule is also demoting this product here.`)
  }
  return { headline, body: parts.join(' ') }
}

export default function ScorecardV3() {
  const { focusId, setFocusId } = useConceptState()
  const p = productById(focusId)
  const top = topPositiveFactor(p)
  const bottom = topNegativeFactor(p)
  const narrative = narrativeForV3(p)
  const composition = compositionByProduct[p.id]
  const rules = rulesByProduct[p.id] ?? []

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

        {/* --- Model factor forces --- */}
        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
              What the model is doing
            </h4>
            <span className="text-[10px] text-ink-500">Four factors · counterfactuals on this page</span>
          </div>
          <ul className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200">
            {orderedFactors.map((f) => {
              const e = p.factors[f]
              const v = softVerdict(e.ris)
              return (
                <li
                  key={f}
                  className="grid grid-cols-[minmax(0,160px)_minmax(0,1fr)] items-start gap-4 px-4 py-3.5"
                >
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
        </section>

        {/* --- Merchandising rules --- */}
        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-700">
              Your merchandising rules on this page
            </h4>
            <span className="text-[10px] text-ink-500">
              Operator-defined · applied after the model
            </span>
          </div>
          {rules.length === 0 ? (
            <EmptyRules composition={composition} productName={p.name} />
          ) : (
            <ul className="space-y-2">
              {rules.map((r) => (
                <RuleCard key={r.id} rule={r} />
              ))}
            </ul>
          )}
        </section>

        {/* Small validity footer (from V1) */}
        <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4 text-[11px] text-ink-500">
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3" />
            Explanation valid as of Apr 12, 2026 · regenerates after each model training
          </div>
          <div>Ranked {p.factors.Popularity.rankWith} on this page</div>
        </div>
      </article>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Summary
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {/* V2 positive label + V1 drag label, per the latest ask */}
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
              label="Top drag"
              value={bottom ?? '—'}
              sub={bottom ? 'Helping competitors more' : 'No meaningful drag'}
              tone="purple"
            />
          </div>
          {rules.length > 0 && (
            <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50/40 px-3 py-2 text-[11px] leading-relaxed text-ink-700">
              <span className="font-semibold text-purple-700">
                {rules.length === 1 ? '1 rule' : `${rules.length} rules`} applied
              </span>{' '}
              on this product here. See the{' '}
              <em>Your merchandising rules</em> section for details.
            </div>
          )}
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
              const hasRules = (rulesByProduct[q.id] ?? []).length > 0
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
                  {hasRules && (
                    <span
                      className={cx(
                        'grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold',
                        active ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700',
                      )}
                      title="Has merchandising rules applied"
                    >
                      R
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function RuleCard({ rule }: { rule: Rule }) {
  const cfg =
    rule.kind === 'pin'
      ? { Icon: Pin, tint: 'border-teal-400/50 bg-teal-500/5', accent: 'text-teal-500', label: 'Pin' }
      : rule.kind === 'boost'
        ? { Icon: Flag, tint: 'border-teal-400/50 bg-teal-500/5', accent: 'text-teal-500', label: 'Boost' }
        : { Icon: Anchor, tint: 'border-amber-400/50 bg-amber-400/10', accent: 'text-amber-600', label: 'Demote' }
  return (
    <li
      className={cx(
        'grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border px-4 py-3',
        cfg.tint,
      )}
    >
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white shadow-soft">
        <cfg.Icon className={cx('h-4 w-4', cfg.accent)} />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-ink-900">{rule.name}</span>
          <span
            className={cx(
              'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]',
              rule.kind === 'demote'
                ? 'border-amber-400/60 bg-white text-amber-600'
                : 'border-teal-400/60 bg-white text-teal-500',
            )}
          >
            {cfg.label}
          </span>
        </div>
        <div className="mt-0.5 text-[11px] font-mono text-ink-500">{rule.scope}</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-700">{rule.rationale}</p>
        <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-ink-900">
          Effect on this product: <span className="font-normal text-ink-700">{rule.effect}</span>
        </p>
      </div>
    </li>
  )
}

function EmptyRules({
  composition,
  productName,
}: {
  composition: 'neutral' | 'rule-boosted' | 'rule-demoted' | 'retrieval-thin'
  productName: string
}) {
  if (composition === 'retrieval-thin') {
    return (
      <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-[12.5px] leading-relaxed text-ink-700">
        <span className="font-semibold text-ink-900">No merchandising rules apply</span> to{' '}
        {productName} on this page. Retrieval coverage is thin for this query, which caps how high
        this product can land regardless of the factor forces above — that's the binding constraint
        here, not rules.
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-[12.5px] leading-relaxed text-ink-700">
      <span className="font-semibold text-ink-900">No merchandising rules apply</span> to{' '}
      {productName} on this page. The rank you see above comes entirely from the four model
      factors. If you want to steer it, add a rule here — the model will keep running underneath.
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
