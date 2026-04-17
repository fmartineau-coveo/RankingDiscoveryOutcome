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
    // Renamed from the earlier "Needs a closer look" — that label was
    // softened to the point of not telling the reader anything. The new
    // label describes what is actually happening on the page without
    // implying the product itself is defective.
    label: 'Outpaced here',
    blurb:
      'Multiple factors are lifting competitors more than this product on this page.',
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

// `pairwiseVelvetVsRecliner` is defined later in this file (after
// `narrativeForPair`), derived from the same generator every other pair uses
// so the voice stays consistent. Declared here as a forward reference for
// any module that imported the name historically.
export let pairwiseVelvetVsRecliner: PairwiseNarrative

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
// Concrete merchandising rules applied per product, synthetic but realistic
// for a Sofas PLP. Used by the Scorecard V3 and Merchandising Archetypes
// concepts so both read from the same source of truth.
//
// Effect copy stays qualitative on purpose. For pin rules, the pinned target
// position is stated verbatim because that is what the rule explicitly does.
// For boost/demote rules, the effect is expressed directionally, never as a
// precise rule-only counterfactual rank (we do not have that data).
// -------------------------------------------------------------------------

export type RuleKind = 'pin' | 'boost' | 'demote'

export type Rule = {
  id: string
  name: string
  kind: RuleKind
  scope: string
  rationale: string
  effect: string
}

export const rulesByProduct: Record<string, Rule[]> = {
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
      effect:
        'Small lift — sits a couple of positions higher than the four factors alone would place it.',
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
}

/** Convenience lookup — returns [] for products with no rules applied. */
export function rulesFor(productId: string): Rule[] {
  return rulesByProduct[productId] ?? []
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

// ---------------------------------------------------------------------------
// Pairwise narrative generator — discovery voice.
//
// Voice rules, mirrored from the discovery report's "Example output":
//   1. Headline:   "{Dominant} is the main reason {top} is ranked above
//                   {other}." Always declarative, names the decisive factor.
//   2. Counterfactual + translation: "Without {Dominant}, {top} would
//                   {verb_top}, while {other} would {verb_other} — {meaning}."
//                   The em-dash clause turns the counterfactual numbers into
//                   a business conclusion (who's actually stronger overall,
//                   who'd overtake, who'd pull ahead).
//   3. Secondary factors: declarative, not hypothetical. Reinforcing ones
//                   read as "also favours {top}" or "provides a smaller
//                   additional boost". Counterbalancing ones read as "works
//                   the other way" or "{other} does have strong {F} support".
//   4. Negligibles: one-line dismissal — "{F1} and {F2} have negligible
//                   impact on the gap between the two products." — only when
//                   two or more factors are negligible and we have room.
//
// Interpretation discipline:
//   - `rankWithout > rankWith` means the factor is helping that product.
//   - `swing = (gap_without - gap_with)` where gap = other.rankWith -
//     top.rankWith (positive = top is ahead on the page).
//   - `swing < 0` → removing the factor narrows the gap → the factor is
//     currently creating / reinforcing top's lead.
//   - `swing > 0` → removing the factor widens the gap → the factor is
//     currently compressing top's lead (helps other more than top).
//   - `flips` → sign change of the gap → the factor is decisive for ordering.
// ---------------------------------------------------------------------------

type PairFactorAnalysis = {
  factor: FactorName
  topRankWith: number
  topRankWithout: number
  otherRankWith: number
  otherRankWithout: number
  topDelta: number
  otherDelta: number
  gapWith: number
  gapWithout: number
  swing: number
  flips: boolean
  score: number
}

function analyzePairFactor(f: FactorName, top: Product, other: Product): PairFactorAnalysis {
  const tw = top.factors[f]
  const ow = other.factors[f]
  const topDelta = tw.rankWithout - tw.rankWith
  const otherDelta = ow.rankWithout - ow.rankWith
  const gapWith = ow.rankWith - tw.rankWith
  const gapWithout = ow.rankWithout - tw.rankWithout
  const swing = gapWithout - gapWith
  const flips = (gapWith > 0 && gapWithout < 0) || (gapWith < 0 && gapWithout > 0)
  // Top-of-list movements count disproportionately (discovery's position weight)
  const topWeight = 1 / Math.log2(1 + Math.min(tw.rankWith, ow.rankWith))
  const score = topWeight * (flips ? 20 + Math.abs(swing) : Math.abs(swing))
  return {
    factor: f,
    topRankWith: tw.rankWith,
    topRankWithout: tw.rankWithout,
    otherRankWith: ow.rankWith,
    otherRankWithout: ow.rankWithout,
    topDelta,
    otherDelta,
    gapWith,
    gapWithout,
    swing,
    flips,
    score,
  }
}

/** Rank-change verb that respects size: "fall from X to Y" for big drops,
 *  "drop" for moderate, "move only from X to Y" for tiny movements,
 *  "move up from X to Y" when removing a factor improves rank. */
function rankMovementPhrase(rankWith: number, rankWithout: number): string {
  const delta = rankWithout - rankWith
  if (delta === 0) return `stay at rank ${rankWith}`
  if (Math.abs(delta) <= 2) return `move only from ${rankWith} to ${rankWithout}`
  if (delta > 0) {
    if (delta >= 15) return `fall from ${rankWith} to ${rankWithout}`
    return `drop from ${rankWith} to ${rankWithout}`
  }
  // Factor was hurting this product; removing it pulls the rank up
  if (Math.abs(delta) >= 10) return `jump from ${rankWith} to ${rankWithout}`
  return `move up from ${rankWith} to ${rankWithout}`
}

/** The em-dash clause that turns the counterfactual into a business
 *  conclusion the merchandiser can act on. */
function dominantInterpretation(dom: PairFactorAnalysis, top: Product, other: Product): string {
  // Asymmetric: dominant factor moves top a lot, other barely
  if (Math.abs(dom.topDelta) >= 10 && Math.abs(dom.otherDelta) <= 3) {
    return `meaning ${dom.factor} is almost single-handedly keeping ${top.name} in its current position`
  }
  // Order flips when dominant is removed
  if (dom.flips) {
    const flipMargin = Math.abs(dom.gapWithout)
    // Wide margin flip + other moves up while top drops = "other is stronger overall"
    const otherMovesUp = dom.otherDelta < -2
    const topDropsMaterially = dom.topDelta > 2
    if (flipMargin >= 5 && otherMovesUp && topDropsMaterially) {
      return `meaning ${other.name} is actually the stronger product on most other factors, but ${dom.factor} gives ${top.name} a decisive edge on this page`
    }
    if (flipMargin >= 5) {
      return `so ${other.name} would end up ahead of ${top.name} by a wide margin`
    }
    return `so ${other.name} would end up ahead of ${top.name}`
  }
  // No flip, but the factor is doing most of the separation work
  if (dom.swing <= -8) {
    return `meaning ${dom.factor} is doing most of the work keeping ${top.name} ahead of ${other.name}`
  }
  if (dom.swing >= 8) {
    return `meaning ${dom.factor} is the only thing narrowing what would otherwise be a wider gap`
  }
  // Default: it's still the dominant factor, just less dramatic
  return `meaning ${dom.factor} is the single biggest factor shaping their relative positions on this page`
}

/** Declarative sentence describing a secondary factor's role. */
function secondarySentence(
  sec: PairFactorAnalysis,
  top: Product,
  other: Product,
  dominantName: FactorName,
): string {
  const reinforcing = sec.swing < 0 // narrows gap when removed = currently reinforces top's lead
  if (reinforcing) {
    // Strong reinforcement + factor also actively works against other
    if (Math.abs(sec.swing) >= 8 && sec.topDelta > 3 && sec.otherDelta < -3) {
      return `${sec.factor} also favours ${top.name}: it lifts the product here while working against ${other.name}'s position, quietly widening the gap.`
    }
    if (Math.abs(sec.swing) >= 8) {
      return `${sec.factor} also favours ${top.name}, widening the gap further.`
    }
    if (Math.abs(sec.swing) >= 4) {
      return `${sec.factor} also tilts things in ${top.name}'s favour, though less dramatically.`
    }
    return `${sec.factor} provides a small additional boost to ${top.name}'s position.`
  }
  // Counterbalancing: factor currently helps other more than top (compressing the gap)
  if (sec.otherDelta >= 5) {
    // Other has strong support from this factor — name it explicitly
    return `${other.name} does have strong ${sec.factor} support — without it, ${other.name} would ${rankMovementPhrase(sec.otherRankWith, sec.otherRankWithout)} — but it isn't enough to close the gap ${dominantName} creates.`
  }
  // Quieter counterbalance
  return `${sec.factor} works the other way: it benefits ${other.name} more than ${top.name}, which is why today's gap between them is narrower than ${dominantName} alone would suggest.`
}

function negligibleSentence(negs: PairFactorAnalysis[]): string {
  const names = negs.map((n) => n.factor)
  const joined =
    names.length === 2
      ? names.join(' and ')
      : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
  return `${joined} have negligible impact on the gap between the two products.`
}

/**
 * Generate a pairwise narrative for any (A, B) pair. Always derived from the
 * two products' raw rank counterfactuals; the canonical Velvet-vs-Recliner
 * pair is no longer hand-authored separately — it flows through the same
 * generator so the voice is identical across every pair in the showcase.
 */
export function narrativeForPair(a: Product, b: Product): PairwiseNarrative {
  // Narrate from the perspective of whichever product is currently ranked
  // higher on the page. "top.name is ranked above other.name" must always
  // match reality regardless of the argument order the caller passed.
  const aRank = a.factors.Popularity.rankWith
  const bRank = b.factors.Popularity.rankWith
  const top = aRank <= bRank ? a : b
  const other = aRank <= bRank ? b : a

  const analyses = FACTORS.map((f) => analyzePairFactor(f, top, other)).sort(
    (x, y) => y.score - x.score,
  )
  const dom = analyses[0]
  const rest = analyses.slice(1)

  // Material threshold: |swing| >= 4 positions in the gap between the two.
  // Engagement-sized nudges below that read as negligible.
  const materialRest = rest.filter((x) => Math.abs(x.swing) >= 4)
  const negligibleRest = rest.filter((x) => Math.abs(x.swing) < 4)

  // Sentence 1 — headline
  const headline = `${dom.factor} is the main reason ${top.name} is ranked above ${other.name}.`

  // Sentence 2 — counterfactual + interpretation
  const s2 = `Without ${dom.factor}, ${top.name} would ${rankMovementPhrase(
    dom.topRankWith,
    dom.topRankWithout,
  )}, while ${other.name} would ${rankMovementPhrase(
    dom.otherRankWith,
    dom.otherRankWithout,
  )} — ${dominantInterpretation(dom, top, other)}.`

  // Subsequent sentences — up to 2 material secondaries, then a negligible
  // dismissal if there's room and it helps complete the picture.
  const paragraphs: string[] = [s2]
  const secondariesShown = materialRest.slice(0, 2)
  for (const sec of secondariesShown) {
    paragraphs.push(secondarySentence(sec, top, other, dom.factor))
  }
  if (secondariesShown.length < 2 && negligibleRest.length >= 2) {
    paragraphs.push(negligibleSentence(negligibleRest))
  }

  return {
    aId: a.id,
    bId: b.id,
    headline,
    paragraphs,
  }
}

// Now that the generator is defined, populate the canonical hand-authored
// reference by running the generator on Velvet Cloud vs Leather Recliner.
// Keeps the export alive for any module still importing it without carrying
// a separate hand-written copy that could drift from the generator's voice.
pairwiseVelvetVsRecliner = narrativeForPair(
  products.find((p) => p.id === 'velvet-cloud')!,
  products.find((p) => p.id === 'leather-recliner')!,
)

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

// Suggested pairs used by the Head-to-Head and Pairwise Mirror concept
// pickers. Labels describe what a merchandiser learns from each pair in
// their own vocabulary — no internal scenario-library terms (critical swap,
// asymmetric, convergence, deep-list) which the system prompt keeps for
// internal reasoning only.
export const CURATED_PAIRS: { a: string; b: string; label: string; scenarioLabel: string }[] = [
  {
    a: 'velvet-cloud',
    b: 'leather-recliner',
    label: 'Velvet Cloud vs Leather Power Recliner',
    scenarioLabel: 'Trendiness keeps a less popular product near the top',
  },
  {
    a: 'meridian-modular',
    b: 'atlas-sectional',
    label: 'Meridian Modular vs Atlas Sectional',
    scenarioLabel: 'Two top-of-page products, different reasons for their positions',
  },
  {
    a: 'copenhagen-linen',
    b: 'aurora-curve',
    label: 'Copenhagen Linen vs Aurora Curve',
    scenarioLabel: 'Freshness is what sets these two apart',
  },
  {
    a: 'nordic-loft',
    b: 'meridian-modular',
    label: 'Nordic Loft vs Meridian Modular',
    scenarioLabel: 'Popularity narrowly decides the top spot',
  },
  {
    a: 'harbor-lounge',
    b: 'emerald-divan',
    label: 'Harbor Lounge vs Emerald Velvet Divan',
    scenarioLabel: 'Popularity flips the order between two mid-list products',
  },
  {
    a: 'velvet-cloud',
    b: 'copenhagen-linen',
    label: 'Velvet Cloud vs Copenhagen Linen',
    scenarioLabel: 'Two rising products, each lifted by a different factor',
  },
]
