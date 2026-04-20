import { useState } from 'react'
import { products, type Product } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { ArrowRight } from 'lucide-react'
import { cx } from '@/lib/utils'

/**
 * Concept 20 — Ranking Build-Up Storyboard.
 *
 * Draws from method 7.2 (sequential build-up) in the interpretability doc.
 * Four panels, left to right, showing how the ranking evolves as each
 * factor enters the picture.
 *
 * Truthfulness posture: the doc is explicit that for non-linear ranking
 * models, the build-up's per-factor attribution is order-dependent. This
 * concept presents the sequence as a *narrative device*, not a
 * decomposition. The disclaimer is shown in the UI, not hidden in a
 * tooltip.
 *
 * Data: the intermediate rankings here are stylised projections based on
 * each product's per-factor rank-with / rank-without data — they are
 * internally consistent with the ablation data we have, but not a literal
 * simulation of partial-factor models.
 */

type Step = { id: string; label: string; caption: string; topFive: { p: Product; fromStep: number | null }[] }

// Stylised build-up computed once at module load. We approximate each step's
// top-5 by summing the per-factor contributions "added" so far into a rank
// estimate, then sorting. Deliberately synthetic — stability matters more
// than per-position precision here.
function computeSteps(): Step[] {
  // Estimate per-factor rank pull for each product: rankWithout_X - rankWith_X.
  // Positive pull = factor currently lifts the product (without it, rank worsens).
  function pullSum(p: Product, factorsInPlay: Array<'Popularity' | 'Freshness' | 'Trendiness' | 'Engagement'>): number {
    return factorsInPlay.reduce((s, f) => s + (p.factors[f].rankWithout - p.factors[f].rankWith), 0)
  }

  function top5For(factorsInPlay: Array<'Popularity' | 'Freshness' | 'Trendiness' | 'Engagement'>): Product[] {
    // The product with the *highest pull sum* is the most lifted by the
    // in-play factors. We offset by rankWith so the lifted products rise
    // against the served baseline.
    return [...products]
      .map((p) => ({ p, score: -p.factors.Popularity.rankWith + pullSum(p, factorsInPlay) * 0.5 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.p)
  }

  const steps: Step[] = [
    {
      id: 'pop',
      label: 'Popularity only',
      caption: 'If the page were ranked on Popularity alone — broad shopper pull, nothing else.',
      topFive: top5For(['Popularity']).map((p) => ({ p, fromStep: null })),
    },
    {
      id: 'pop-fresh',
      label: '+ Freshness',
      caption: 'Add how recent each product is in the catalogue.',
      topFive: top5For(['Popularity', 'Freshness']).map((p) => ({ p, fromStep: null })),
    },
    {
      id: 'pop-fresh-trend',
      label: '+ Trendiness',
      caption: 'Add short-horizon momentum against the usual baseline.',
      topFive: top5For(['Popularity', 'Freshness', 'Trendiness']).map((p) => ({ p, fromStep: null })),
    },
    {
      id: 'full',
      label: 'Full ranking',
      caption: 'Add Engagement. This matches the final served ranking on the page.',
      topFive: [...products]
        .sort((a, b) => a.factors.Popularity.rankWith - b.factors.Popularity.rankWith)
        .slice(0, 5)
        .map((p) => ({ p, fromStep: null })),
    },
  ]

  // Mark newcomers: for each step (after step 0), flag which products are
  // new relative to the previous step's top 5.
  for (let i = 1; i < steps.length; i++) {
    const prevIds = new Set(steps[i - 1].topFive.map((x) => x.p.id))
    steps[i].topFive = steps[i].topFive.map((x) => ({
      ...x,
      fromStep: prevIds.has(x.p.id) ? i - 1 : null,
    }))
  }
  return steps
}

export default function BuildUpStoryboard() {
  const [steps] = useState(() => computeSteps())

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          Watch the ranking come together
        </div>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-700">
          Four snapshots of the Sofas PLP, left to right. Step 0 is Popularity-only. Each step
          adds another factor and we see the top five shift. Reading this sequentially makes the
          factors' roles legible — but the order of accumulation is a storytelling choice, not a
          property of the model. Adding factors in a different order would tell a different story.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s, i) => (
          <StepColumn key={s.id} step={s} index={i} />
        ))}
      </div>

      <section className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-[12.5px] leading-relaxed text-ink-800">
        <strong>Why this is a storyboard, not a decomposition.</strong> The model weighs all four
        factors jointly; the incremental effect of adding a factor depends on which factors are
        already in play. The panels above build up in one plausible order — they are
        directionally faithful but not a unique attribution of the final rank.
      </section>
    </div>
  )
}

function StepColumn({ step, index }: { step: Step; index: number }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
      <header>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-600">
          Step {index}
        </div>
        <h3 className="mt-0.5 text-[15px] font-semibold text-ink-900">{step.label}</h3>
        <p className="mt-1 text-[11.5px] leading-snug text-ink-600">{step.caption}</p>
      </header>
      <ol className="space-y-1.5">
        {step.topFive.map(({ p, fromStep }, rowIdx) => (
          <li
            key={p.id}
            className={cx(
              'flex items-center gap-2 rounded-lg border px-2 py-1.5',
              index > 0 && fromStep === null
                ? 'border-purple-300 bg-purple-50/60'
                : 'border-ink-100 bg-white',
            )}
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-ink-100 font-mono text-[10px] font-semibold text-ink-700">
              {rowIdx + 1}
            </span>
            <ProductThumb product={p} size="xs" />
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink-900">
              {p.name}
            </span>
            {index > 0 && fromStep === null && (
              <span
                className="inline-flex items-center gap-0.5 rounded-full bg-purple-500 px-1.5 py-0.5 text-[9px] font-semibold text-white"
                title="New in this step"
              >
                <ArrowRight className="h-2 w-2" /> new
              </span>
            )}
          </li>
        ))}
      </ol>
    </article>
  )
}
