/**
 * Mock data for the Ranking Explainability Concept Showcase.
 *
 * Grounded in the discovery report's stylized "Sofas" PLP example,
 * extended to ~12 products so that gallery-wide concepts (heatmap,
 * bird's-eye, archetypes, etc.) have something to work on.
 *
 * Truthfulness rules applied:
 * - Only the 4 approved LPO factors (Popularity, Freshness, Trendiness, Engagement).
 * - RIS values are in [-1, +1], internally consistent with their `rank_with`
 *   and `rank_without` pairs (we follow the report's stylized numbers for
 *   Velvet Cloud Sofa and Leather Power Recliner verbatim).
 * - No raw signal names, no scores, no percentages-of-contribution.
 * - A companion `rules` and `index` note is included for any concept that
 *   shows rank composition, per the brief's requirement to separate ML
 *   from merch actions.
 */

export type FactorName = 'Popularity' | 'Freshness' | 'Trendiness' | 'Engagement'

export const FACTORS: FactorName[] = [
  'Popularity',
  'Freshness',
  'Trendiness',
  'Engagement',
]

export type FactorEntry = {
  rankWith: number
  rankWithout: number
  /** RIS in [-1, +1]: positive = factor helps this product's competitive position */
  ris: number
}

export type Product = {
  id: string
  name: string
  /** Family / silhouette hint, used for the abstract SVG thumbnail */
  silhouette: 'modular' | 'chaise' | 'recliner' | 'loveseat' | 'sectional' | 'tufted'
  priceLabel: string
  /** Dominant brand archetype: not shown as "archetype" unless concept uses it */
  archetype: ArchetypeId
  factors: Record<FactorName, FactorEntry>
}

export type ArchetypeId =
  | 'rising-star'
  | 'volume-driver'
  | 'conversion-leader'
  | 'freshness-favorite'
  | 'brand-anchor'
  | 'at-risk'
  | 'held-back'
  | 'buried-top-seller'

export const ARCHETYPES: Record<ArchetypeId, { label: string; blurb: string; tone: 'blue' | 'purple' | 'amber' | 'rose' | 'teal' | 'ink' }> = {
  'rising-star': {
    label: 'Rising Star',
    blurb: 'Trendiness is lifting it above where Popularity alone would place it.',
    tone: 'purple',
  },
  'volume-driver': {
    label: 'Volume Driver',
    blurb: 'Popularity is the dominant force behind its position.',
    tone: 'blue',
  },
  'conversion-leader': {
    label: 'Conversion Leader',
    blurb: 'Engagement gives it a clear edge over its neighbours on this page.',
    tone: 'teal',
  },
  'freshness-favorite': {
    label: 'Freshness Favorite',
    blurb: 'A newer catalog entry that Freshness is actively helping.',
    tone: 'blue',
  },
  'brand-anchor': {
    label: 'Broadly Supported',
    blurb: 'Several factors help it; no single factor dominates.',
    tone: 'ink',
  },
  'at-risk': {
    // Softened per merchandiser feedback — avoid alarmist framing.
    label: 'Needs a closer look',
    blurb:
      'More than one factor is currently benefiting its competitors more than this product.',
    tone: 'rose',
  },
  'held-back': {
    label: 'Trendiness headwind',
    blurb:
      'Trendiness is giving its competitors a bigger lift than it gives this product.',
    tone: 'amber',
  },
  'buried-top-seller': {
    label: 'Strong Popularity, deep rank',
    blurb:
      'Popularity is helping this product, yet it still sits deep in the list. A rule or retrieval constraint may be at play.',
    tone: 'amber',
  },
}

/**
 * The 12-product sofas PLP.
 * Velvet Cloud Sofa (rank 3) and Leather Power Recliner (rank 18) match the
 * report's pairwise ablation example verbatim. Other products are illustrative
 * but derived from the same RIS formula shape.
 */
export const PLP_NAME = 'Sofas'
export const PLP_TOTAL = 184 // total candidates after retrieval, for context

export const products: Product[] = [
  {
    id: 'nordic-loft',
    name: 'Nordic Loft 3-Seater',
    silhouette: 'modular',
    priceLabel: '€1,899',
    archetype: 'volume-driver',
    factors: {
      Popularity: { rankWith: 1, rankWithout: 9, ris: 0.74 },
      Freshness: { rankWith: 1, rankWithout: 2, ris: 0.12 },
      Trendiness: { rankWith: 1, rankWithout: 3, ris: 0.26 },
      Engagement: { rankWith: 1, rankWithout: 2, ris: 0.16 },
    },
  },
  {
    id: 'meridian-modular',
    name: 'Meridian Modular',
    silhouette: 'sectional',
    priceLabel: '€2,390',
    archetype: 'rising-star',
    factors: {
      Popularity: { rankWith: 2, rankWithout: 4, ris: 0.28 },
      Freshness: { rankWith: 2, rankWithout: 3, ris: 0.14 },
      Trendiness: { rankWith: 2, rankWithout: 11, ris: 0.58 },
      Engagement: { rankWith: 2, rankWithout: 2, ris: 0.0 },
    },
  },
  {
    id: 'velvet-cloud',
    name: 'Velvet Cloud Sofa',
    silhouette: 'loveseat',
    priceLabel: '€1,549',
    archetype: 'rising-star',
    factors: {
      Popularity: { rankWith: 3, rankWithout: 5, ris: 0.22 },
      Freshness: { rankWith: 3, rankWithout: 6, ris: 0.32 },
      // The report's "Trendiness-dominant" headline case.
      Trendiness: { rankWith: 3, rankWithout: 22, ris: 0.72 },
      Engagement: { rankWith: 3, rankWithout: 4, ris: 0.06 },
    },
  },
  {
    id: 'copenhagen-linen',
    name: 'Copenhagen Linen',
    silhouette: 'loveseat',
    priceLabel: '€1,290',
    archetype: 'freshness-favorite',
    factors: {
      Popularity: { rankWith: 4, rankWithout: 7, ris: 0.24 },
      Freshness: { rankWith: 4, rankWithout: 19, ris: 0.62 },
      Trendiness: { rankWith: 4, rankWithout: 6, ris: 0.18 },
      Engagement: { rankWith: 4, rankWithout: 5, ris: 0.08 },
    },
  },
  {
    id: 'atlas-sectional',
    name: 'Atlas Sectional',
    silhouette: 'sectional',
    priceLabel: '€3,120',
    archetype: 'conversion-leader',
    factors: {
      Popularity: { rankWith: 5, rankWithout: 12, ris: 0.44 },
      Freshness: { rankWith: 5, rankWithout: 4, ris: -0.06 },
      Trendiness: { rankWith: 5, rankWithout: 8, ris: 0.2 },
      Engagement: { rankWith: 5, rankWithout: 21, ris: 0.56 },
    },
  },
  {
    id: 'aurora-curve',
    name: 'Aurora Curve',
    silhouette: 'loveseat',
    priceLabel: '€1,990',
    archetype: 'rising-star',
    factors: {
      Popularity: { rankWith: 7, rankWithout: 9, ris: 0.09 },
      Freshness: { rankWith: 7, rankWithout: 10, ris: 0.14 },
      Trendiness: { rankWith: 7, rankWithout: 18, ris: 0.36 },
      Engagement: { rankWith: 7, rankWithout: 8, ris: 0.06 },
    },
  },
  {
    id: 'lumen-chaise',
    name: 'Lumen Chaise',
    silhouette: 'chaise',
    priceLabel: '€1,149',
    archetype: 'brand-anchor',
    factors: {
      Popularity: { rankWith: 9, rankWithout: 15, ris: 0.28 },
      Freshness: { rankWith: 9, rankWithout: 7, ris: -0.14 },
      Trendiness: { rankWith: 9, rankWithout: 11, ris: 0.1 },
      Engagement: { rankWith: 9, rankWithout: 11, ris: 0.1 },
    },
  },
  {
    id: 'harbor-lounge',
    name: 'Harbor Lounge',
    silhouette: 'modular',
    priceLabel: '€2,540',
    archetype: 'held-back',
    factors: {
      Popularity: { rankWith: 12, rankWithout: 14, ris: 0.08 },
      Freshness: { rankWith: 12, rankWithout: 13, ris: 0.04 },
      // Trendiness is actively hurting: without it the product moves up.
      Trendiness: { rankWith: 12, rankWithout: 6, ris: -0.32 },
      Engagement: { rankWith: 12, rankWithout: 13, ris: 0.04 },
    },
  },
  {
    id: 'emerald-divan',
    name: 'Emerald Velvet Divan',
    silhouette: 'tufted',
    priceLabel: '€2,860',
    archetype: 'at-risk',
    factors: {
      Popularity: { rankWith: 15, rankWithout: 9, ris: -0.36 },
      Freshness: { rankWith: 15, rankWithout: 11, ris: -0.2 },
      Trendiness: { rankWith: 15, rankWithout: 13, ris: -0.12 },
      Engagement: { rankWith: 15, rankWithout: 14, ris: -0.06 },
    },
  },
  {
    id: 'leather-recliner',
    name: 'Leather Power Recliner',
    silhouette: 'recliner',
    priceLabel: '€2,199',
    archetype: 'buried-top-seller',
    factors: {
      // Matches the report's pairwise example verbatim.
      Popularity: { rankWith: 18, rankWithout: 25, ris: 0.18 },
      Freshness: { rankWith: 18, rankWithout: 13, ris: -0.22 },
      Trendiness: { rankWith: 18, rankWithout: 16, ris: -0.08 },
      Engagement: { rankWith: 18, rankWithout: 15, ris: -0.12 },
    },
  },
  {
    id: 'granite-xl',
    name: 'Granite Modular XL',
    silhouette: 'sectional',
    priceLabel: '€3,780',
    archetype: 'at-risk',
    factors: {
      Popularity: { rankWith: 22, rankWithout: 16, ris: -0.22 },
      Freshness: { rankWith: 22, rankWithout: 18, ris: -0.14 },
      Trendiness: { rankWith: 22, rankWithout: 20, ris: -0.06 },
      Engagement: { rankWith: 22, rankWithout: 22, ris: 0.0 },
    },
  },
  {
    id: 'saddle-tufted',
    name: 'Saddle Tufted Classic',
    silhouette: 'tufted',
    priceLabel: '€1,680',
    archetype: 'buried-top-seller',
    factors: {
      Popularity: { rankWith: 31, rankWithout: 54, ris: 0.3 },
      Freshness: { rankWith: 31, rankWithout: 19, ris: -0.38 },
      Trendiness: { rankWith: 31, rankWithout: 25, ris: -0.18 },
      Engagement: { rankWith: 31, rankWithout: 28, ris: -0.08 },
    },
  },
]

export const productById = (id: string) =>
  products.find((p) => p.id === id)!

/** The canonical "focus" product used by per-product concepts. */
export const FOCUS_PRODUCT_ID = 'velvet-cloud'
/** The canonical "B" product for pairwise concepts. */
export const PAIRWISE_B_ID = 'leather-recliner'

// -------------------------------------------------------------------------
// Pre-written pairwise narratives, hand-authored against the report's
// system prompt rules: headline → dominant factor → secondary → takeaway,
// 3–5 sentences, no hedging, no scores/signals/ablation vocabulary.
// -------------------------------------------------------------------------

export type PairwiseNarrative = {
  aId: string
  bId: string
  headline: string
  paragraphs: string[]
}

export const pairwiseVelvetVsRecliner: PairwiseNarrative = {
  aId: 'velvet-cloud',
  bId: 'leather-recliner',
  headline:
    'Trendiness is the main reason the Velvet Cloud Sofa sits above the Leather Power Recliner.',
  paragraphs: [
    'Trendiness is almost single-handedly keeping the Velvet Cloud Sofa in the top 3 — without it, the Sofa would fall from rank 3 to rank 22, while the Recliner would barely move. Freshness also favours the Sofa: it benefits from being a newer catalog entry, while the same factor actively works against the Recliner on this page.',
    'The Recliner does have strong Popularity support — without it, it would slip from rank 18 to rank 25 — but that advantage is not enough to close the gap that Trendiness creates in the Sofa\'s favour. Engagement has negligible impact on the relative ordering of these two products.',
    'In short, the Sofa is ahead because it is currently trending; the Recliner\'s Popularity is helping it, just not enough to overcome the Sofa\'s Trendiness edge.',
  ],
}

// -------------------------------------------------------------------------
// Rank-composition hint for concepts that need to show how the final rank
// comes out of (index gate → merchandiser rules → ML reranking). Strictly
// qualitative, no percentages, per the brief's risk mitigation.
// -------------------------------------------------------------------------

export type CompositionHint = 'neutral' | 'rule-boosted' | 'rule-demoted' | 'retrieval-thin'

export const compositionByProduct: Record<string, CompositionHint> = {
  'nordic-loft': 'rule-boosted', // merch pinned to top for Q1 campaign
  'meridian-modular': 'neutral',
  'velvet-cloud': 'neutral',
  'copenhagen-linen': 'neutral',
  'atlas-sectional': 'neutral',
  'aurora-curve': 'neutral',
  'lumen-chaise': 'neutral',
  'harbor-lounge': 'rule-demoted', // merch rule: low-margin bundle
  'emerald-divan': 'retrieval-thin',
  'leather-recliner': 'neutral',
  'granite-xl': 'neutral',
  'saddle-tufted': 'retrieval-thin',
}

export const compositionLabel: Record<CompositionHint, string> = {
  neutral: 'ML-driven',
  'rule-boosted': 'Boosted by rule',
  'rule-demoted': 'Demoted by rule',
  'retrieval-thin': 'Weak retrieval match',
}

// -------------------------------------------------------------------------
// PLP baseline — median |RIS| per factor across the PLP. Used by the
// Page Baseline Comparator and Differentiation Map concepts.
// -------------------------------------------------------------------------

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** "Signal power" per factor: how much this factor separates products on this page (0..1). */
export const factorSeparation: Record<FactorName, number> = (() => {
  const out: Record<string, number> = {}
  for (const f of FACTORS) {
    const vals = products.map((p) => p.factors[f].ris)
    const spread = Math.max(...vals) - Math.min(...vals)
    out[f] = Math.min(1, spread / 1.6) // normalized into ~0..1
  }
  return out as Record<FactorName, number>
})()

/** Page-median |RIS| per factor (used as "what is typical"). */
export const pageMedianRis: Record<FactorName, number> = (() => {
  const out: Record<string, number> = {}
  for (const f of FACTORS) {
    out[f] = median(products.map((p) => Math.abs(p.factors[f].ris)))
  }
  return out as Record<FactorName, number>
})()

// -------------------------------------------------------------------------
// Helpers re-used across several concepts.
// -------------------------------------------------------------------------

export function topPositiveFactor(p: Product): FactorName {
  let best: FactorName = 'Popularity'
  for (const f of FACTORS) if (p.factors[f].ris > p.factors[best].ris) best = f
  return best
}

export function topNegativeFactor(p: Product): FactorName | null {
  let best: FactorName | null = null
  for (const f of FACTORS) {
    const v = p.factors[f].ris
    if (v < -0.02 && (best === null || v < p.factors[best].ris)) best = f
  }
  return best
}

export function dominantAbsFactor(p: Product): FactorName {
  let best: FactorName = 'Popularity'
  for (const f of FACTORS)
    if (Math.abs(p.factors[f].ris) > Math.abs(p.factors[best].ris)) best = f
  return best
}

// -------------------------------------------------------------------------
// Pairwise scenario detection and narrative generation.
//
// Given two products, compute which report-defined scenario pattern their
// ablation data falls into per factor, then produce a narrative paragraph
// that follows the system-prompt rules (headline → dominant factor →
// secondary → takeaway, 3–5 sentences, competitive-position framing).
//
// Hand-authored overrides exist for the canonical Velvet-vs-Recliner pair
// (matching the discovery report verbatim). All other pairs are generated
// from their own raw ablation numbers so the narrative remains truthful
// regardless of which pair the user selects.
// -------------------------------------------------------------------------

export type PairScenario =
  | 'critical-swap'
  | 'order-preserved'
  | 'asymmetric'
  | 'convergence'
  | 'divergence'
  | 'zone-shift'
  | 'deep-irrelevant'
  | 'flat'

export function classifyPairScenario(
  aFactor: FactorEntry,
  bFactor: FactorEntry,
): PairScenario {
  const dA = aFactor.rankWithout - aFactor.rankWith
  const dB = bFactor.rankWithout - bFactor.rankWith
  const originalOrder = aFactor.rankWith < bFactor.rankWith ? 'A' : 'B'
  const newOrder = aFactor.rankWithout < bFactor.rankWithout ? 'A' : 'B'
  const flipped = originalOrder !== newOrder
  const bothDeep =
    Math.min(aFactor.rankWith, bFactor.rankWith) > 100 &&
    Math.min(aFactor.rankWithout, bFactor.rankWithout) > 100
  if (bothDeep) return 'deep-irrelevant'
  if (Math.abs(dA) < 2 && Math.abs(dB) < 2) return 'flat'
  // critical swap: products near the top swap positions
  if (flipped && Math.min(aFactor.rankWith, bFactor.rankWith) <= 20) return 'critical-swap'
  // asymmetric: one moves a lot, the other barely
  if ((Math.abs(dA) >= 6 && Math.abs(dB) <= 2) || (Math.abs(dB) >= 6 && Math.abs(dA) <= 2))
    return 'asymmetric'
  // convergence vs divergence on the |rank gap|
  const gapWith = Math.abs(aFactor.rankWith - bFactor.rankWith)
  const gapWithout = Math.abs(aFactor.rankWithout - bFactor.rankWithout)
  if (gapWith - gapWithout >= 4) return 'convergence'
  if (gapWithout - gapWith >= 4) return 'divergence'
  // zone shift: both move together in the same direction, order preserved
  if (!flipped && Math.sign(dA) === Math.sign(dB) && Math.abs(dA) >= 5 && Math.abs(dB) >= 5)
    return 'zone-shift'
  return 'order-preserved'
}

function verbWith(prev: number, next: number): string {
  if (next === prev) return 'would stay at rank ' + prev
  if (next > prev) return `would drop from rank ${prev} to ${next}`
  return `would move up from rank ${prev} to ${next}`
}

/**
 * Score each factor's materiality to the A-vs-B ordering and return them
 * sorted from most to least important — so the narrative can lead with the
 * dominant one, exactly as the report prescribes.
 */
export function rankFactorsForPair(a: Product, b: Product): { factor: FactorName; score: number }[] {
  return FACTORS.map((f) => {
    const dA = a.factors[f].rankWithout - a.factors[f].rankWith
    const dB = b.factors[f].rankWithout - b.factors[f].rankWith
    // Weight by (a) proximity to rank 1 — movements at the top count more —
    // and (b) how asymmetric the movement is between A and B.
    const topWeight =
      1 / Math.log2(1 + Math.min(a.factors[f].rankWith, b.factors[f].rankWith))
    const asymmetry = Math.abs(dA - dB)
    const motion = Math.abs(dA) + Math.abs(dB)
    return { factor: f, score: topWeight * (asymmetry * 1.2 + motion) }
  }).sort((x, y) => y.score - x.score)
}

/**
 * Generate a pairwise narrative for any (A, B) pair. Hand-written for the
 * canonical pair; template-generated for all others, but with the same
 * tone rules and structure.
 */
export function narrativeForPair(a: Product, b: Product): PairwiseNarrative {
  // Canonical hand-authored narrative
  if (a.id === pairwiseVelvetVsRecliner.aId && b.id === pairwiseVelvetVsRecliner.bId)
    return pairwiseVelvetVsRecliner
  if (a.id === pairwiseVelvetVsRecliner.bId && b.id === pairwiseVelvetVsRecliner.aId) {
    // Invert the hand-authored narrative by swapping subject.
    return {
      aId: a.id,
      bId: b.id,
      headline: `Popularity is not enough to close the gap: the Velvet Cloud Sofa stays above the Leather Power Recliner.`,
      paragraphs: [
        `${a.name} has strong Popularity support on this page — without it, it would slip a few positions — but on its own that advantage is not enough to overcome the Velvet Cloud Sofa's Trendiness edge.`,
        `Trendiness is what keeps the Sofa in the top 3 and it has almost no effect on ${a.name}. Freshness actively works against ${a.name} here while helping the Sofa.`,
        `In short: ${a.name}'s Popularity helps, but Trendiness and Freshness are what keep the Sofa visibly ahead.`,
      ],
    }
  }

  // Generic generator — truthful, derived from raw ablation numbers.
  const ranked = rankFactorsForPair(a, b)
  const dominant = ranked[0].factor
  const secondary = ranked.slice(1, 3).filter((x) => x.score > 0.4)
  const aRank = a.factors.Popularity.rankWith
  const bRank = b.factors.Popularity.rankWith

  const aDom = a.factors[dominant]
  const bDom = b.factors[dominant]
  const scenario = classifyPairScenario(aDom, bDom)

  const headline = (() => {
    if (scenario === 'critical-swap')
      return `${dominant} is the single factor deciding whether ${a.name} or ${b.name} ranks higher.`
    if (scenario === 'asymmetric')
      return `${dominant} is disproportionately affecting one of the two products.`
    if (scenario === 'convergence')
      return `${dominant} is the main reason ${a.name} currently sits ahead of ${b.name}.`
    if (scenario === 'divergence')
      return `${dominant} is actively closing what would otherwise be a wider gap.`
    if (scenario === 'zone-shift')
      return `${dominant} moves both products, but does not decide the order between them.`
    if (scenario === 'flat')
      return `No single factor is meaningfully separating ${a.name} from ${b.name} on this page.`
    return `${dominant} is the factor most responsible for the current ordering.`
  })()

  const p1 = (() => {
    const aPart = `Without ${dominant}, ${a.name} ${verbWith(aDom.rankWith, aDom.rankWithout)}`
    const bPart = `while ${b.name} ${verbWith(bDom.rankWith, bDom.rankWithout)}`
    return `${aPart}, ${bPart}.`
  })()

  const p2Parts: string[] = []
  for (const { factor } of secondary) {
    const af = a.factors[factor]
    const bf = b.factors[factor]
    const dA = af.rankWithout - af.rankWith
    const dB = bf.rankWithout - bf.rankWith
    if (Math.abs(dA) < 2 && Math.abs(dB) < 2) continue
    if (Math.sign(dA) !== Math.sign(dB) && dA !== 0 && dB !== 0) {
      p2Parts.push(
        `${factor} works in opposite directions on the two products — ${
          dA > 0 ? `it helps ${a.name}` : `it hurts ${a.name}`
        } and ${dB > 0 ? `helps ${b.name}` : `hurts ${b.name}`}.`,
      )
    } else if (Math.abs(dA - dB) < 2) {
      p2Parts.push(
        `${factor} moves both products similarly — it is not what is driving the gap.`,
      )
    } else {
      p2Parts.push(
        `${factor} affects both, but favours ${
          Math.abs(dA) > Math.abs(dB) ? a.name : b.name
        } more.`,
      )
    }
  }
  const p2 = p2Parts.join(' ')

  const takeaway = (() => {
    if (scenario === 'flat')
      return `Their ordering on this page is not being decided by any single factor — other products on the list are doing most of the work.`
    if (scenario === 'critical-swap')
      return `If ${dominant} were removed or changed, the order between these two would flip.`
    if (scenario === 'zone-shift')
      return `Their relative order is stable; both would move together if this factor changed.`
    return `${a.name} currently sits at rank ${aRank}, ${b.name} at ${bRank}; ${dominant} is the clearest reason why.`
  })()

  return {
    aId: a.id,
    bId: b.id,
    headline,
    paragraphs: [p1, p2, takeaway].filter(Boolean),
  }
}

// -------------------------------------------------------------------------
// Product-level (single product) plain-language explanation, grounded in
// the RIS. Used by the Ranking Impact Scorecard and the Conversational Q&A.
// -------------------------------------------------------------------------

export function narrativeForProduct(p: Product): { headline: string; body: string } {
  const rank = p.factors.Popularity.rankWith
  const top = topPositiveFactor(p)
  const bottom = topNegativeFactor(p)
  const topRis = p.factors[top].ris

  let headline: string
  if (topRis > 0.6) {
    headline = `${top} is the dominant reason ${p.name} is at rank ${rank}.`
  } else if (topRis > 0.3) {
    headline = `${top} is the clearest factor lifting ${p.name} on this page.`
  } else if (topRis > 0.05) {
    headline = `${p.name} at rank ${rank} is broadly supported — no single factor dominates.`
  } else {
    headline = `No factor is meaningfully helping ${p.name} on this page.`
  }

  const parts: string[] = []
  if (topRis > 0.05) {
    parts.push(
      `Without ${top}, ${p.name} ${verbWith(p.factors[top].rankWith, p.factors[top].rankWithout)}.`,
    )
  }
  if (bottom) {
    parts.push(
      `${bottom} is giving this product's competitors more of a lift than it gives ${p.name} — removing it would move the product ${p.factors[bottom].rankWithout < rank ? 'up to rank ' + p.factors[bottom].rankWithout : 'down slightly'}.`,
    )
  }
  const composition = compositionByProduct[p.id]
  if (composition === 'rule-boosted')
    parts.push(`A merchandiser rule is also boosting this product on this page.`)
  if (composition === 'rule-demoted')
    parts.push(`A merchandiser rule is demoting this product on this page.`)
  if (composition === 'retrieval-thin')
    parts.push(`Retrieval coverage for this product is thin on this query.`)
  return { headline, body: parts.join(' ') }
}

// Suggested/curated pairs used by the Head-to-Head and Pairwise Mirror
// concept pickers. Each selected to surface a distinct scenario so
// stakeholders can see the narratives change with the input.
export const CURATED_PAIRS: { a: string; b: string; label: string; scenarioLabel: string }[] = [
  {
    a: 'velvet-cloud',
    b: 'leather-recliner',
    label: 'Velvet Cloud vs Leather Power Recliner',
    scenarioLabel: 'Asymmetric · Trendiness tips the scale',
  },
  {
    a: 'meridian-modular',
    b: 'atlas-sectional',
    label: 'Meridian Modular vs Atlas Sectional',
    scenarioLabel: 'Order preserved · different factor mix',
  },
  {
    a: 'copenhagen-linen',
    b: 'aurora-curve',
    label: 'Copenhagen Linen vs Aurora Curve',
    scenarioLabel: 'Convergence · Freshness drives the gap',
  },
  {
    a: 'nordic-loft',
    b: 'meridian-modular',
    label: 'Nordic Loft vs Meridian Modular',
    scenarioLabel: 'Both near the top · no single factor flips the order',
  },
  {
    a: 'harbor-lounge',
    b: 'emerald-divan',
    label: 'Harbor Lounge vs Emerald Velvet Divan',
    scenarioLabel: 'Deep-list pair · small moves, low significance',
  },
  {
    a: 'velvet-cloud',
    b: 'copenhagen-linen',
    label: 'Velvet Cloud vs Copenhagen Linen',
    scenarioLabel: 'Two Rising Stars · different dominant factors',
  },
]
