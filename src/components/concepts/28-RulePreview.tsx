import { useMemo, useState } from 'react'
import {
  products,
  rulesFor,
  type Product,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { cx } from '@/lib/utils'
import { ArrowRight, Flag, Anchor, Pin, Sparkles, Info } from 'lucide-react'

/**
 * Concept 28 — Rule Preview / Before-and-After Simulator.
 *
 * The merchandiser drafts a new rule and sees the current Sofas page next
 * to the page they would get if the rule went live. The preview composes
 * the served ranking with the rule's effect; the ML model is not changed.
 *
 * Scope:
 *   - Boost:  lift the selected product by N positions.
 *   - Demote: push the selected product down by N positions.
 *   - Pin:    force the selected product to rank 1.
 *
 * The preview annotates which products shift and whether a product's
 * model-side factor story stays unchanged (it always does — the rule is a
 * layer above the model, not a dial on it).
 */

type RuleKind = 'boost' | 'demote' | 'pin'

type DraftRule = {
  kind: RuleKind
  productId: string
  amount: number // positions for boost/demote; ignored for pin
  rationale: string
}

function applyRule(base: Product[], draft: DraftRule): Product[] {
  const sorted = [...base].sort(
    (a, b) => a.factors.Popularity.rankWith - b.factors.Popularity.rankWith,
  )
  const targetIdx = sorted.findIndex((p) => p.id === draft.productId)
  if (targetIdx === -1) return sorted
  const [target] = sorted.splice(targetIdx, 1)
  let insertAt: number
  if (draft.kind === 'pin') {
    insertAt = 0
  } else if (draft.kind === 'boost') {
    insertAt = Math.max(0, targetIdx - draft.amount)
  } else {
    insertAt = Math.min(sorted.length, targetIdx + draft.amount)
  }
  sorted.splice(insertAt, 0, target)
  return sorted
}

export default function RulePreview() {
  const [draft, setDraft] = useState<DraftRule>({
    kind: 'boost',
    productId: 'copenhagen-linen',
    amount: 3,
    rationale: 'Push the mid-priced linen sofa for Q1 value campaign',
  })

  const baseline = useMemo(
    () =>
      [...products].sort(
        (a, b) => a.factors.Popularity.rankWith - b.factors.Popularity.rankWith,
      ),
    [],
  )
  const preview = useMemo(() => applyRule(products, draft), [draft])

  const target = products.find((p) => p.id === draft.productId)!
  const currentRules = rulesFor(draft.productId)

  // Compute position changes.
  const changes = useMemo(() => {
    const baselineIndex = new Map(baseline.map((p, i) => [p.id, i + 1]))
    const previewIndex = new Map(preview.map((p, i) => [p.id, i + 1]))
    return products.map((p) => {
      const from = baselineIndex.get(p.id) ?? -1
      const to = previewIndex.get(p.id) ?? -1
      return { product: p, from, to, delta: from - to }
    })
  }, [baseline, preview])

  const materialChanges = changes.filter((c) => c.delta !== 0)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          Preview a rule before it goes live
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-700">
          Draft a new merchandising rule, see the page you would get with it applied, and confirm
          the model's factor story for every other product stays exactly the same. The rule is a
          layer above the model, not a dial on it.
        </p>
      </section>

      <RuleEditor draft={draft} setDraft={setDraft} target={target} currentRules={currentRules} />

      <section className="grid gap-5 lg:grid-cols-2">
        <RankList
          title="Today's page"
          subtitle="The served ranking right now, before your rule."
          list={baseline}
          tone="ink"
        />
        <RankList
          title="With your rule applied"
          subtitle="Preview — model unchanged, your rule composed on top."
          list={preview}
          baseline={baseline}
          highlightId={draft.productId}
          tone="purple"
        />
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            What this rule would move
          </div>
          <div className="text-[11px] text-ink-500">
            {materialChanges.length === 0
              ? 'No products shift'
              : `${materialChanges.length} products shift`}
          </div>
        </div>
        {materialChanges.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-[12.5px] text-ink-600">
            The rule, as drafted, doesn't change the served ordering. Try a larger boost, a demote,
            or a pin.
          </div>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {materialChanges
              .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
              .map((c) => (
                <ChangeRow
                  key={c.product.id}
                  product={c.product}
                  from={c.from}
                  to={c.to}
                  isTarget={c.product.id === draft.productId}
                />
              ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-ink-900 bg-ink-950 p-5 text-white shadow-lift">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
          <p className="text-[13px] leading-relaxed text-white/90">
            The model's factor story for every product on this page is unchanged by this rule — the
            factor reasoning in Scorecard V3, Head-to-Head, and every other concept still applies.
            This rule only composes on top of the served ranking to produce what the shopper sees.
          </p>
        </div>
      </section>
    </div>
  )
}

function RuleEditor({
  draft,
  setDraft,
  target,
  currentRules,
}: {
  draft: DraftRule
  setDraft: (d: DraftRule) => void
  target: Product
  currentRules: ReturnType<typeof rulesFor>
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        Draft rule
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[auto_1fr_auto]">
        {/* Kind */}
        <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-ink-200">
          {(
            [
              { kind: 'boost' as RuleKind, Icon: Flag, label: 'Boost' },
              { kind: 'demote' as RuleKind, Icon: Anchor, label: 'Demote' },
              { kind: 'pin' as RuleKind, Icon: Pin, label: 'Pin to top' },
            ]
          ).map(({ kind, Icon, label }) => (
            <button
              key={kind}
              onClick={() => setDraft({ ...draft, kind })}
              className={cx(
                'inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors',
                draft.kind === kind
                  ? kind === 'demote'
                    ? 'bg-amber-400/20 text-amber-700'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-ink-700 hover:bg-ink-50',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Product */}
        <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white px-3 py-1.5">
          <ProductThumb product={target} size="xs" />
          <select
            value={draft.productId}
            onChange={(e) => setDraft({ ...draft, productId: e.target.value })}
            className="flex-1 bg-transparent text-[12.5px] text-ink-800 outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                Apply to: #{p.factors.Popularity.rankWith} · {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount (boost/demote only) */}
        {draft.kind !== 'pin' ? (
          <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-[12.5px] text-ink-800">
            <span className="text-ink-500">by</span>
            <input
              type="number"
              min={1}
              max={15}
              value={draft.amount}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  amount: Math.max(1, Math.min(15, parseInt(e.target.value) || 1)),
                })
              }
              className="w-14 bg-transparent font-mono text-ink-900 outline-none"
            />
            <span className="text-ink-500">positions</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5 text-[12.5px] text-ink-600">
            Pins to rank 1
          </div>
        )}
      </div>

      <label className="mt-3 block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
          Rationale (for your records)
        </span>
        <input
          value={draft.rationale}
          onChange={(e) => setDraft({ ...draft, rationale: e.target.value })}
          placeholder="Why this rule is going live…"
          className="mt-1 w-full rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
        />
      </label>

      {currentRules.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[11.5px] leading-relaxed text-ink-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          {target.name} already has {currentRules.length === 1 ? 'a rule' : `${currentRules.length} rules`} in play
          ({currentRules.map((r) => r.name.replace(/\s·.*$/, '')).join(', ')}). Adding another may
          conflict; the system will pick the most specific at serve time.
        </div>
      )}
    </section>
  )
}

function RankList({
  title,
  subtitle,
  list,
  baseline,
  highlightId,
  tone,
}: {
  title: string
  subtitle: string
  list: Product[]
  baseline?: Product[]
  highlightId?: string
  tone: 'ink' | 'purple'
}) {
  const baselineIndex = baseline
    ? new Map(baseline.map((p, i) => [p.id, i + 1]))
    : null
  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
      <header>
        <div
          className={cx(
            'text-[10px] font-semibold uppercase tracking-[0.14em]',
            tone === 'purple' ? 'text-purple-700' : 'text-ink-500',
          )}
        >
          {title}
        </div>
        <p className="mt-0.5 text-[12px] text-ink-600">{subtitle}</p>
      </header>
      <ol className="mt-3 space-y-1">
        {list.slice(0, 10).map((p, i) => {
          const newRank = i + 1
          const prevRank = baselineIndex ? baselineIndex.get(p.id) ?? newRank : newRank
          const delta = prevRank - newRank
          const isTarget = highlightId && p.id === highlightId
          return (
            <li
              key={p.id}
              className={cx(
                'grid grid-cols-[32px_36px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-2.5 py-1.5',
                isTarget
                  ? 'border-purple-400 bg-purple-50/60 shadow-soft'
                  : 'border-ink-100 bg-white',
              )}
            >
              <span
                className={cx(
                  'grid h-6 w-6 place-items-center rounded-md font-mono text-[10px] font-semibold',
                  isTarget ? 'bg-purple-500 text-white' : 'bg-ink-900 text-white',
                )}
              >
                {newRank}
              </span>
              <ProductThumb product={p} size="xs" />
              <span className="truncate text-[12.5px] font-medium text-ink-900">{p.name}</span>
              {baselineIndex && delta !== 0 && (
                <span
                  className={cx(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    delta > 0 ? 'bg-blue-100 text-blue-700' : 'bg-amber-400/20 text-amber-700',
                  )}
                >
                  {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </article>
  )
}

function ChangeRow({
  product,
  from,
  to,
  isTarget,
}: {
  product: Product
  from: number
  to: number
  isTarget: boolean
}) {
  const delta = from - to
  return (
    <li
      className={cx(
        'flex items-center gap-3 rounded-lg border px-3 py-2',
        isTarget
          ? 'border-purple-300 bg-purple-50/50'
          : 'border-ink-100 bg-white',
      )}
    >
      <ProductThumb product={product} size="xs" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-semibold text-ink-900">{product.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-600">
          <RankBadge rank={from} size="sm" />
          <ArrowRight className="h-3 w-3 text-ink-400" />
          <span
            className={cx(
              'font-mono font-semibold',
              delta > 0 ? 'text-blue-700' : 'text-amber-700',
            )}
          >
            #{to}
          </span>
          <span className="text-ink-400">({delta > 0 ? '+' : ''}{delta} positions)</span>
        </div>
      </div>
      {isTarget && (
        <span className="rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          Rule target
        </span>
      )}
    </li>
  )
}
