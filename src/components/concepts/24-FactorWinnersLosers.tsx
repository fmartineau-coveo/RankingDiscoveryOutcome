import { useMemo } from 'react'
import { FACTORS, products, type FactorName, type Product } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { cx } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * Concept 24 — Factor Winners & Losers.
 *
 * A fast scan board answering "what is each factor currently doing on this
 * page?" Four columns, one per factor. In each column:
 *   - Top 3 products most lifted by the factor (positive RIS, strongest).
 *   - Top 3 products where the factor is lifting competitors more (negative
 *     RIS, strongest).
 *
 * No narrative, no counterfactual math surfaced — just the faces of what
 * each factor is currently picking and passing over.
 */

type FactorGroup = {
  factor: FactorName
  helping: Product[]
  competitorsMore: Product[]
  summary: string
}

function buildGroups(): FactorGroup[] {
  return FACTORS.map((f) => {
    const ranked = [...products].map((p) => ({ p, ris: p.factors[f].ris }))
    const helping = ranked
      .filter((x) => x.ris > 0.05)
      .sort((a, b) => b.ris - a.ris)
      .slice(0, 3)
      .map((x) => x.p)
    const competitorsMore = ranked
      .filter((x) => x.ris < -0.05)
      .sort((a, b) => a.ris - b.ris)
      .slice(0, 3)
      .map((x) => x.p)

    let summary: string
    if (helping.length >= 3 && competitorsMore.length === 0) {
      summary = `${f} is working for much of this page without actively hurting anyone.`
    } else if (helping.length === 0 && competitorsMore.length === 0) {
      summary = `${f} isn't meaningfully shaping this page's order.`
    } else if (competitorsMore.length >= 2) {
      summary = `${f} has a clear asymmetric effect — working hard for some products and against others.`
    } else if (helping.length >= 1 && competitorsMore.length === 0) {
      summary = `${f} is lifting a handful of products here, neutral on the rest.`
    } else {
      summary = `${f} has mixed effects on this page.`
    }

    return { factor: f, helping, competitorsMore, summary }
  })
}

export default function FactorWinnersLosers() {
  const groups = useMemo(buildGroups, [])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-5 shadow-soft">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          Who each factor is working for — and against — right now
        </div>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-700">
          Four columns, one per factor. In each column, the products this factor is currently
          lifting most on this page, and the products this factor is currently favouring
          competitors of. A fast way to triage which factor to pay attention to before diving into
          a single product.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((g) => (
          <FactorColumn key={g.factor} group={g} />
        ))}
      </div>
    </div>
  )
}

function FactorColumn({ group }: { group: FactorGroup }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
      <header>
        <FactorChip factor={group.factor} />
        <p className="mt-2 text-[12px] leading-snug text-ink-700">{group.summary}</p>
      </header>

      <section>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
          <TrendingUp className="h-3 w-3" /> Lifting most on this page
        </div>
        {group.helping.length === 0 ? (
          <div className="mt-2 rounded-lg border border-dashed border-ink-300 bg-ink-50 px-2.5 py-3 text-[11px] text-ink-500">
            No product is being meaningfully lifted by {group.factor} here.
          </div>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {group.helping.map((p) => (
              <ProductRow key={p.id} p={p} tone="blue" />
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
          <TrendingDown className="h-3 w-3" /> Lifting competitors of these
        </div>
        {group.competitorsMore.length === 0 ? (
          <div className="mt-2 rounded-lg border border-dashed border-ink-300 bg-ink-50 px-2.5 py-3 text-[11px] text-ink-500">
            No product is having its competitors lifted more by {group.factor} here.
          </div>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {group.competitorsMore.map((p) => (
              <ProductRow key={p.id} p={p} tone="purple" />
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}

function ProductRow({ p, tone }: { p: Product; tone: 'blue' | 'purple' }) {
  return (
    <li
      className={cx(
        'flex items-center gap-2 rounded-lg border px-2 py-1.5',
        tone === 'blue' ? 'border-blue-200 bg-blue-50/50' : 'border-purple-200 bg-purple-50/50',
      )}
    >
      <ProductThumb product={p} size="xs" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-semibold text-ink-900">{p.name}</div>
      </div>
      <RankBadge rank={p.factors.Popularity.rankWith} size="sm" />
    </li>
  )
}
