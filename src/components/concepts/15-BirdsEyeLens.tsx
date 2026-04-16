import { useMemo, useState } from 'react'
import { products, ARCHETYPES, type ArchetypeId } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { cx } from '@/lib/utils'
import { Target, Check, AlertCircle, Plus, Minus } from 'lucide-react'

/**
 * Concept 15 — Commercial Intent Check.
 *
 * Replaces the earlier Bird's-Eye anomaly view. Directly answers the third
 * question from the real discovery brief:
 *
 *   "Is this outcome aligned with my commercial intent?"
 *
 * The merchandiser expresses intent with soft weights on archetypes:
 *  - "We want Rising Stars visible in the top 10"
 *  - "Volume Drivers are fine anywhere above rank 20"
 *  - "Trendiness headwinds should not be in the top 5"
 * …and the view scores the current PLP against those rules, flagging
 * products that are aligned, products that are mismatched (deeper than
 * intended), and products that are over-ranked (shallower than intended).
 *
 * Nothing here claims to *change* the ranking — per the brief's WON'T
 * list, this is diagnostic only. The lever to act is still merchandiser
 * rules.
 */

type IntentTargets = Partial<Record<ArchetypeId, { maxRank: number; wants: 'in' | 'out' }>>

const DEFAULT_INTENT: IntentTargets = {
  'rising-star': { maxRank: 10, wants: 'in' },
  'volume-driver': { maxRank: 20, wants: 'in' },
  'freshness-favorite': { maxRank: 15, wants: 'in' },
  'conversion-leader': { maxRank: 10, wants: 'in' },
  'held-back': { maxRank: 5, wants: 'out' }, // keep out of top 5
  'buried-top-seller': { maxRank: 30, wants: 'out' }, // shouldn't be that deep
}

type Assessment = {
  status: 'aligned' | 'below' | 'above' | 'no-rule'
  note: string
}

function assess(productRank: number, archetype: ArchetypeId, intent: IntentTargets): Assessment {
  const rule = intent[archetype]
  if (!rule) return { status: 'no-rule', note: 'No intent set for this archetype.' }
  if (rule.wants === 'in') {
    if (productRank <= rule.maxRank)
      return {
        status: 'aligned',
        note: `Target is top ${rule.maxRank}. Currently at rank ${productRank} — aligned.`,
      }
    return {
      status: 'below',
      note: `Target is top ${rule.maxRank}. Currently at rank ${productRank} — deeper than intended.`,
    }
  }
  // wants 'out' of top N
  if (productRank > rule.maxRank)
    return {
      status: 'aligned',
      note: `Should stay outside top ${rule.maxRank}. Currently at rank ${productRank} — aligned.`,
    }
  return {
    status: 'above',
    note: `Should stay outside top ${rule.maxRank}. Currently at rank ${productRank} — shallower than intended.`,
  }
}

export default function CommercialIntentCheck() {
  const [intent, setIntent] = useState<IntentTargets>(DEFAULT_INTENT)

  const results = useMemo(
    () =>
      products.map((p) => ({
        p,
        assessment: assess(p.factors.Popularity.rankWith, p.archetype, intent),
      })),
    [intent],
  )

  const aligned = results.filter((r) => r.assessment.status === 'aligned').length
  const below = results.filter((r) => r.assessment.status === 'below').length
  const above = results.filter((r) => r.assessment.status === 'above').length
  const noRule = results.filter((r) => r.assessment.status === 'no-rule').length
  const coverage = products.length - noRule
  const alignmentPct = coverage > 0 ? Math.round((aligned / coverage) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Intent editor */}
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-900 text-white">
            <Target className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
              Your commercial intent
            </div>
            <h3 className="mt-1 text-lg font-semibold text-ink-900">
              Tell the explainer what you'd like to see on this page.
            </h3>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-600">
              Express your intent as soft rules on product archetypes. The explainer is purely
              diagnostic: it will tell you where the current ranking is already aligned and where
              it is not — <strong>it does not change the ranking</strong>. The lever to act is
              your merchandiser rules.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(Object.keys(intent) as ArchetypeId[]).map((aid) => {
            const arch = ARCHETYPES[aid]
            const rule = intent[aid]!
            return (
              <div
                key={aid}
                className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink-900">{arch.label}</span>
                    <span className="text-[10px] text-ink-500">{arch.blurb}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[12px]">
                    <select
                      value={rule.wants}
                      onChange={(e) =>
                        setIntent((s) => ({ ...s, [aid]: { ...rule, wants: e.target.value as 'in' | 'out' } }))
                      }
                      className="rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-xs"
                    >
                      <option value="in">Keep in</option>
                      <option value="out">Keep out of</option>
                    </select>
                    <span className="text-ink-500">top</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={rule.maxRank}
                      onChange={(e) =>
                        setIntent((s) => ({
                          ...s,
                          [aid]: { ...rule, maxRank: Math.max(1, Math.min(50, parseInt(e.target.value) || 1)) },
                        }))
                      }
                      className="w-14 rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIntent((s) => {
                      const copy = { ...s }
                      delete copy[aid]
                      return copy
                    })
                  }}
                  className="rounded-md border border-ink-200 bg-white p-1 text-ink-500 hover:bg-ink-50"
                  title="Remove this rule"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
          <AddRuleButton intent={intent} setIntent={setIntent} />
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          label="Alignment"
          value={`${alignmentPct}%`}
          sub={`${aligned} of ${coverage} products matched`}
          tone="blue"
        />
        <SummaryCard
          label="Deeper than intended"
          value={String(below)}
          sub="Below where your intent would place them"
          tone="purple"
        />
        <SummaryCard
          label="Shallower than intended"
          value={String(above)}
          sub="Above where your intent would place them"
          tone="amber"
        />
        <SummaryCard
          label="Not covered by intent"
          value={String(noRule)}
          sub="No rule set for this archetype"
          tone="ink"
        />
      </section>

      {/* Result list */}
      <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
        {results
          .sort(
            (a, b) => a.p.factors.Popularity.rankWith - b.p.factors.Popularity.rankWith,
          )
          .map(({ p, assessment }) => {
            const arch = ARCHETYPES[p.archetype]
            const s = assessment.status
            const icon =
              s === 'aligned' ? (
                <Check className="h-3.5 w-3.5" />
              ) : s === 'no-rule' ? (
                <Minus className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )
            const tone =
              s === 'aligned'
                ? 'bg-blue-500 text-white'
                : s === 'below'
                  ? 'bg-purple-500 text-white'
                  : s === 'above'
                    ? 'bg-amber-500 text-white'
                    : 'bg-ink-200 text-ink-600'
            const label =
              s === 'aligned'
                ? 'Aligned'
                : s === 'below'
                  ? 'Deeper than intended'
                  : s === 'above'
                    ? 'Shallower than intended'
                    : 'No rule'
            return (
              <div
                key={p.id}
                className={cx(
                  'grid grid-cols-[80px_48px_minmax(220px,1.2fr)_minmax(200px,1fr)_minmax(200px,1.2fr)] items-center gap-3 border-b border-ink-100 px-4 py-3 last:border-b-0',
                  s === 'below' && 'bg-purple-50/30',
                  s === 'above' && 'bg-amber-400/10',
                )}
              >
                <RankBadge rank={p.factors.Popularity.rankWith} size="sm" />
                <ProductThumb product={p} size="xs" />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-ink-900">{p.name}</div>
                  <div className="text-[11px] text-ink-500">{p.priceLabel}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[10px] font-medium text-ink-700">
                    {arch.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cx(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      tone,
                    )}
                  >
                    {icon}
                    {label}
                  </span>
                  <span className="text-[11px] text-ink-500">{assessment.note}</span>
                </div>
              </div>
            )
          })}
      </section>
    </div>
  )
}

function AddRuleButton({
  intent,
  setIntent,
}: {
  intent: IntentTargets
  setIntent: React.Dispatch<React.SetStateAction<IntentTargets>>
}) {
  const missing = (Object.keys(ARCHETYPES) as ArchetypeId[]).filter((a) => !intent[a])
  if (missing.length === 0) return null
  return (
    <details className="relative rounded-xl border border-dashed border-ink-300 bg-white px-4 py-3">
      <summary className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink-700">
        <Plus className="h-3.5 w-3.5" /> Add a rule for another archetype
      </summary>
      <div className="mt-2 space-y-1">
        {missing.map((a) => (
          <button
            key={a}
            onClick={() =>
              setIntent((s) => ({ ...s, [a]: { maxRank: 10, wants: 'in' } }))
            }
            className="block w-full rounded-md border border-ink-200 bg-white px-2 py-1 text-left text-[12px] hover:bg-ink-50"
          >
            {ARCHETYPES[a].label}
          </button>
        ))}
      </div>
    </details>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone: 'blue' | 'purple' | 'amber' | 'ink'
}) {
  const toneClass = {
    blue: 'from-blue-50 to-white border-blue-200',
    purple: 'from-purple-50 to-white border-purple-200',
    amber: 'from-amber-400/10 to-white border-amber-400/40',
    ink: 'from-ink-50 to-white border-ink-200',
  }[tone]
  return (
    <div className={cx('rounded-2xl border bg-gradient-to-br p-4 shadow-soft', toneClass)}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">{label}</div>
      <div className="display mt-1 text-4xl leading-none text-ink-950">{value}</div>
      <div className="mt-1 text-[11px] text-ink-600">{sub}</div>
    </div>
  )
}
