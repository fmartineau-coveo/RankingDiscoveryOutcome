import { useMemo } from 'react'
import { FACTORS, products, type Product, type FactorName } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { cx } from '@/lib/utils'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

/**
 * Concept 19 — Tipping Point Diagnostic.
 *
 * Draws from the "progressive factor ablation" method in the interpretability
 * doc (§6). For each product on the Sofas PLP, we scan the per-factor
 * rank-with / rank-without data to identify whether a small shift in any
 * single factor would flip this product's ordering with a nearby rival.
 *
 * Not a prediction engine — a *diagnostic*. It surfaces which products are
 * deeply anchored on this page and which are on a knife's edge, so a
 * merchandiser knows where to look before they look.
 */

type Volatility = 'anchored' | 'mid' | 'on-edge'

type Analysis = {
  product: Product
  /** Closest rival & the factor that would flip them, if any. */
  nearestFlip: { rival: Product; factor: FactorName } | null
  /** Largest single-factor swing affecting this product's rank. */
  maxSwing: number
  volatility: Volatility
}

function analyze(p: Product): Analysis {
  let nearestFlip: Analysis['nearestFlip'] = null
  let maxSwing = 0

  for (const rival of products) {
    if (rival.id === p.id) continue
    for (const f of FACTORS) {
      const pFactor = p.factors[f]
      const rFactor = rival.factors[f]
      // Gap with the factor present
      const gapWith = rFactor.rankWith - pFactor.rankWith
      // Gap if this factor were removed
      const gapWithout = rFactor.rankWithout - pFactor.rankWithout
      const flipped =
        (gapWith > 0 && gapWithout < 0) || (gapWith < 0 && gapWithout > 0)
      if (flipped) {
        // Prefer the closest (smallest current gap) for nearestFlip
        if (!nearestFlip || Math.abs(gapWith) < Math.abs(rFactor.rankWith - p.factors.Popularity.rankWith)) {
          nearestFlip = { rival, factor: f }
        }
      }
    }
  }

  for (const f of FACTORS) {
    const e = p.factors[f]
    maxSwing = Math.max(maxSwing, Math.abs(e.rankWithout - e.rankWith))
  }

  const volatility: Volatility = nearestFlip
    ? 'on-edge'
    : maxSwing >= 5
      ? 'mid'
      : 'anchored'

  return { product: p, nearestFlip, maxSwing, volatility }
}

export default function TippingPointDiagnostic() {
  const analyses = useMemo(
    () =>
      products
        .map(analyze)
        .sort((a, b) => a.product.factors.Popularity.rankWith - b.product.factors.Popularity.rankWith),
    [],
  )

  const onEdge = analyses.filter((a) => a.volatility === 'on-edge').length
  const anchored = analyses.filter((a) => a.volatility === 'anchored').length

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <SummaryStat
          tone="amber"
          label="On the edge"
          value={onEdge}
          sub="Small single-factor shift would flip the order with a neighbour"
        />
        <SummaryStat
          tone="ink"
          label="Mid-sensitivity"
          value={analyses.length - onEdge - anchored}
          sub="Factors move rank meaningfully, but not enough to flip"
        />
        <SummaryStat
          tone="blue"
          label="Anchored"
          value={anchored}
          sub="Rank is stable across any single factor shift"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
        <header className="grid grid-cols-[80px_48px_minmax(220px,1fr)_140px_minmax(260px,1.2fr)] gap-4 border-b border-ink-100 bg-ink-50 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          <div>Rank</div>
          <div />
          <div>Product</div>
          <div>Stability</div>
          <div>Nearest tipping point</div>
        </header>
        {analyses.map((a) => (
          <Row key={a.product.id} a={a} />
        ))}
      </section>
    </div>
  )
}

function Row({ a }: { a: Analysis }) {
  return (
    <div className="grid grid-cols-[80px_48px_minmax(220px,1fr)_140px_minmax(260px,1.2fr)] items-center gap-4 border-b border-ink-100 px-5 py-3 last:border-b-0">
      <RankBadge rank={a.product.factors.Popularity.rankWith} size="sm" />
      <ProductThumb product={a.product} size="xs" />
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-ink-900">{a.product.name}</div>
        <div className="truncate text-[11px] text-ink-500">{a.product.priceLabel}</div>
      </div>
      <StabilityBar volatility={a.volatility} />
      <div className="text-[12px] leading-relaxed text-ink-700">
        {a.nearestFlip ? (
          <>
            A shift in <FactorChip factor={a.nearestFlip.factor} size="sm" tone="purple" /> would
            flip the order with <strong>{a.nearestFlip.rival.name}</strong>.
          </>
        ) : (
          <span className="text-ink-500">
            No single factor shift would flip the order with any neighbour on this page.
          </span>
        )}
      </div>
    </div>
  )
}

function StabilityBar({ volatility }: { volatility: Volatility }) {
  const cfg =
    volatility === 'on-edge'
      ? { text: 'On the edge', tone: 'text-amber-600', fill: 'bg-amber-500', width: '30%' }
      : volatility === 'mid'
        ? { text: 'Mid-sensitivity', tone: 'text-ink-600', fill: 'bg-ink-400', width: '60%' }
        : { text: 'Anchored', tone: 'text-blue-700', fill: 'bg-blue-500', width: '92%' }
  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={cx('h-full rounded-full', cfg.fill)} style={{ width: cfg.width }} />
      </div>
      <div className={cx('mt-1 text-[11px] font-medium', cfg.tone)}>{cfg.text}</div>
    </div>
  )
}

function SummaryStat({
  tone,
  label,
  value,
  sub,
}: {
  tone: 'amber' | 'ink' | 'blue'
  label: string
  value: number
  sub: string
}) {
  const Icon = tone === 'amber' ? AlertTriangle : tone === 'blue' ? CheckCircle2 : null
  const toneCls =
    tone === 'amber'
      ? 'border-amber-400/50 bg-amber-400/10'
      : tone === 'blue'
        ? 'border-blue-200 bg-blue-50/50'
        : 'border-ink-200 bg-white'
  return (
    <div className={cx('rounded-2xl border p-5 shadow-soft', toneCls)}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </div>
      <div className="display mt-1 text-4xl leading-none text-ink-950">{value}</div>
      <div className="mt-2 text-[11.5px] leading-snug text-ink-600">{sub}</div>
    </div>
  )
}
