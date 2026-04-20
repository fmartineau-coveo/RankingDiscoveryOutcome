import { useState, useMemo } from 'react'
import {
  FACTORS,
  products,
  type FactorName,
  type Product,
} from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { cx } from '@/lib/utils'
import { Info } from 'lucide-react'

/**
 * Concept 22 — Alternative Scenarios Gallery.
 *
 * Read-only reframe of the PDF's "What-If Simulator". Instead of letting the
 * merchandiser drag sliders to adjust factor strength (which would imply
 * they can dial the model), we present *pre-computed alternative page
 * scenarios*, each grounded in the factor ablation data we have. The
 * merchandiser inspects the scenario, reads the narrative, and decides
 * whether to layer a rule.
 *
 * Two scenario kinds are implemented from the existing data:
 *   - "If {Factor} carried less influence on this page" — approximated by
 *     using each product's rank_without[Factor] as the new ordering.
 *   - "If {Factor} were the only model force" — products re-ordered purely
 *     by how much that factor currently lifts them.
 */

type ScenarioKind = 'muted' | 'dominant'

type Scenario = {
  id: string
  kind: ScenarioKind
  factor: FactorName
  title: string
  subtitle: string
  ordering: Product[]
  narrative: string
}

function buildScenarios(): Scenario[] {
  const baseline = [...products].sort(
    (a, b) => a.factors.Popularity.rankWith - b.factors.Popularity.rankWith,
  )

  return FACTORS.flatMap((f) => {
    // Scenario A: muted factor — rank by rank_without[f]
    const mutedOrdering = [...products].sort(
      (a, b) => a.factors[f].rankWithout - b.factors[f].rankWithout,
    )
    // Scenario B: dominant factor — rank by how much that factor lifts the product
    const dominantOrdering = [...products].sort(
      (a, b) =>
        b.factors[f].rankWithout -
        b.factors[f].rankWith -
        (a.factors[f].rankWithout - a.factors[f].rankWith),
    )
    return [
      {
        id: `muted-${f}`,
        kind: 'muted' as ScenarioKind,
        factor: f,
        title: `If ${f} carried less influence`,
        subtitle: `The top of the page if ${f} weren't doing the work it's doing today.`,
        ordering: mutedOrdering,
        narrative: describeMuted(f, baseline, mutedOrdering),
      },
      {
        id: `dominant-${f}`,
        kind: 'dominant' as ScenarioKind,
        factor: f,
        title: `If ${f} were the dominant force`,
        subtitle: `The page re-sorted by how much ${f} currently lifts each product.`,
        ordering: dominantOrdering,
        narrative: describeDominant(f, baseline, dominantOrdering),
      },
    ]
  })
}

function describeMuted(f: FactorName, baseline: Product[], muted: Product[]): string {
  const base3 = baseline.slice(0, 3).map((p) => p.id)
  const muted3 = muted.slice(0, 3).map((p) => p.id)
  const droppedOut = baseline.slice(0, 3).find((p) => !muted3.includes(p.id))
  const newArrival = muted.slice(0, 3).find((p) => !base3.includes(p.id))
  if (droppedOut && newArrival) {
    return `Without ${f} doing its current work, ${newArrival.name} would break into the top 3 while ${droppedOut.name} would slip. ${f} is currently tilting the top of this page in the served order's favour.`
  }
  return `${f} has a moderate effect on the top of this page — the top 3 stays mostly the same even when its current pull is reduced.`
}

function describeDominant(f: FactorName, baseline: Product[], dominant: Product[]): string {
  const first = dominant[0]
  const baselineRank = baseline.findIndex((p) => p.id === first.id) + 1
  return `If ${f} alone decided the order, ${first.name} would lead the page (it currently sits at rank ${baselineRank}). Merchandisers can read this as: ${f} is the factor most strongly working for ${first.name} on this page, but isn't decisive enough to push it to the top in the served ranking.`
}

export default function AlternativeScenarios() {
  const scenarios = useMemo(buildScenarios, [])
  const [selectedId, setSelectedId] = useState<string>(scenarios[4].id) // default: muted Trendiness
  const active = scenarios.find((s) => s.id === selectedId)!

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
          Pre-computed alternative scenarios
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-700">
          Inspect what this Sofas page would look like under a different balance of factors. Each
          scenario is read-only and diagnostic — there is no live dial on the model. To change the
          served ranking, the lever is still your merchandising rules.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
              selectedId === s.id
                ? 'border-ink-900 bg-ink-900 text-white shadow-soft'
                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
            )}
          >
            <span
              className={cx(
                'h-1.5 w-1.5 rounded-full',
                s.kind === 'muted' ? 'bg-purple-500' : 'bg-blue-500',
              )}
            />
            {s.title}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                <FactorChip factor={active.factor} size="sm" /> scenario
              </div>
              <h3 className="mt-1 text-[17px] font-semibold text-ink-900">{active.title}</h3>
              <p className="mt-0.5 text-[12px] text-ink-600">{active.subtitle}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-700">
              <Info className="h-3 w-3" /> Read-only preview
            </div>
          </header>
          <ol className="mt-4 grid gap-1.5">
            {active.ordering.slice(0, 10).map((p, i) => {
              const servedRank = p.factors.Popularity.rankWith
              const scenarioRank = i + 1
              const delta = servedRank - scenarioRank
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-[32px_40px_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-ink-100 bg-white px-3 py-2"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-ink-900 font-mono text-[10px] font-semibold text-white">
                    {scenarioRank}
                  </span>
                  <ProductThumb product={p} size="xs" />
                  <span className="truncate text-[12.5px] font-medium text-ink-900">{p.name}</span>
                  <span className="text-[10px] text-ink-500">served #{servedRank}</span>
                  <DeltaPill delta={delta} />
                </li>
              )
            })}
          </ol>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-ink-900 bg-ink-950 p-5 text-ink-100 shadow-lift">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              What this scenario tells you
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/90">{active.narrative}</p>
            <div className="mt-4 border-t border-white/10 pt-3 text-[10px] uppercase tracking-wider text-white/40">
              Diagnostic · valid until the next model training
            </div>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              If you want to act on this
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-700">
              This view is for understanding, not intervention. If the served page isn't landing
              the outcome you want, the lever is a <strong>merchandising rule</strong> — not a
              dial on the model itself.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function DeltaPill({ delta }: { delta: number }) {
  if (Math.abs(delta) < 1)
    return (
      <span className="text-[10px] text-ink-400">no change</span>
    )
  const up = delta > 0 // scenario rank is better than served rank
  return (
    <span
      className={cx(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
        up ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700',
      )}
    >
      {up ? '↑' : '↓'} {Math.abs(delta)}
    </span>
  )
}
