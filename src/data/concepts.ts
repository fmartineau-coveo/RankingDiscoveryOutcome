/**
 * Registry of the 28 concept directions. The detail view reads from this to
 * render metadata consistently and to wire up each concept's React component.
 */

import type { ComponentType } from 'react'

import Scorecard from '@/components/concepts/01-Scorecard'
import Radar from '@/components/concepts/02-Radar'
import CounterfactualLadder from '@/components/concepts/03-CounterfactualLadder'
import HeatmapMatrix from '@/components/concepts/04-HeatmapMatrix'
import Archetypes from '@/components/concepts/05-Archetypes'
import BaselineComparator from '@/components/concepts/06-BaselineComparator'
import DifferentiationMap from '@/components/concepts/07-DifferentiationMap'
import CompositionStack from '@/components/concepts/08-CompositionStack'
import HeadToHeadNarrative from '@/components/concepts/09-HeadToHeadNarrative'
import PairwiseMirror from '@/components/concepts/10-PairwiseMirror'
import ConversationalQA from '@/components/concepts/11-ConversationalQA'
import SwapScenarios from '@/components/concepts/12-SwapScenarios'
import AmbientPlpOverlay from '@/components/concepts/13-AmbientPlpOverlay'
import RankStoryline from '@/components/concepts/14-RankStoryline'
import CommercialIntentCheck from '@/components/concepts/15-BirdsEyeLens'
import FactorImpactMap from '@/components/concepts/16-FactorImpactMap'
import ScorecardV2 from '@/components/concepts/17-ScorecardV2'
import ScorecardV3 from '@/components/concepts/18-ScorecardV3'
import TippingPointDiagnostic from '@/components/concepts/19-TippingPoint'
import BuildUpStoryboard from '@/components/concepts/20-BuildUpStoryboard'
import BaselineSwapMap from '@/components/concepts/21-BaselineSwapMap'
import AlternativeScenarios from '@/components/concepts/22-AlternativeScenarios'
import StabilityMap from '@/components/concepts/23-StabilityMap'
import FactorWinnersLosers from '@/components/concepts/24-FactorWinnersLosers'
import DiversityAtlas from '@/components/concepts/25-DiversityAtlas'
import RankProvenanceTimeline from '@/components/concepts/26-RankProvenanceTimeline'
import DecisionPathway from '@/components/concepts/27-DecisionPathway'
import RulePreview from '@/components/concepts/28-RulePreview'

export type Approach = 'ris' | 'pairwise' | 'both'
export type Posture = 'enterprise' | 'bold'

export type ConceptMeta = {
  id: string
  number: number
  title: string
  tagline: string
  approach: Approach
  posture: Posture
  question: string
  description: string
  notClaimed: string
  group: 'approach-1' | 'approach-2' | 'hybrid'
  Component: ComponentType
}

export const concepts: ConceptMeta[] = [
  {
    id: 'scorecard',
    number: 1,
    title: 'Ranking Impact Scorecard',
    tagline: 'The canonical per-product card — the baseline all other concepts can be measured against.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'Why is this product ranked where it is?',
    description:
      'One card summarising how each of the four factors is currently affecting this product\'s competitive position on this page. A plain-language headline surfaces the dominant driver; diverging bars show direction and weighted impact at a glance.',
    notClaimed:
      'The four bars are estimates of each factor\'s marginal effect on rank on this page, not a literal decomposition of the model. Rules and index effects are called out separately.',
    group: 'approach-1',
    Component: Scorecard,
  },
  {
    id: 'radar',
    number: 2,
    title: 'Factor Impact Radar',
    tagline: 'A radial "shape" that makes a product\'s factor profile memorable at a glance.',
    approach: 'ris',
    posture: 'bold',
    question: 'What is this product\'s overall factor signature on this page?',
    description:
      'Four axes (one per factor), positive impact drawn outward in blue, negative impact drawn as an inward purple lobe. Good for repeat-view merchandisers who learn to recognise typical shapes (e.g. "a Rising Star looks like this").',
    notClaimed:
      'Radar geometry is a visual proxy for the RIS vector; the enclosed area is not a meaningful quantity and should not be summed or compared numerically.',
    group: 'approach-1',
    Component: Radar,
  },
  {
    id: 'counterfactual-ladder',
    number: 3,
    title: 'Counterfactual Ladder',
    tagline: 'Shows where the product would sit if each factor were taken away.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'What is holding this product up — and what is holding it down?',
    description:
      'A vertical rank ladder with the product\'s current position anchored, and four ghost positions it would occupy if each factor were removed in turn. Makes the counterfactual mental model literal without ever exposing the word or the math.',
    notClaimed:
      'Ghost positions are single-factor counterfactuals. They do not combine additively — removing two factors is not the sum of removing each.',
    group: 'approach-1',
    Component: CounterfactualLadder,
  },
  {
    id: 'heatmap-matrix',
    number: 4,
    title: 'PLP Heatmap Matrix',
    tagline: 'Scan a full page of products × factors in seconds.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'Which factors are moving which products on this page?',
    description:
      'Twelve rows (products, sorted by rank) × four columns (factors). Cell colour encodes direction (blue = helps, purple = hurts), intensity encodes weighted impact. Designed for a category manager triaging a whole PLP rather than inspecting one product.',
    notClaimed:
      'Cells show each factor\'s marginal effect on that product\'s rank on this page. Comparing cells across very different pages is not meaningful.',
    group: 'approach-1',
    Component: HeatmapMatrix,
  },
  {
    id: 'archetypes',
    number: 5,
    title: 'Merchandising Archetypes',
    tagline: 'Auto-labelled products using a merch-friendly vocabulary.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'What kind of product is this, in merchandising terms?',
    description:
      'Each product gets a single descriptive archetype drawn from its dominant RIS factor and its position (Rising Star, Volume Driver, Freshness Favorite, Trendiness headwind, Strong Popularity deep rank, Outpaced here…). Labels are descriptive, not alarmist — they compress the nuance of the scorecard into one tag a merchandiser can use to triage the whole page. Any merchandising rule currently in play is surfaced next to the archetype, and clicking a row expands the full factor read alongside the active rules.',
    notClaimed:
      'Archetypes are heuristics layered on top of the RIS, not formal classes learned by the model. A product may fit more than one archetype weakly.',
    group: 'approach-1',
    Component: Archetypes,
  },
  {
    id: 'baseline-comparator',
    number: 6,
    title: 'Page Baseline Comparator',
    tagline: 'How this product\'s factor profile compares to what\'s typical on this page.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'Where does this product over- or under-index versus the page baseline?',
    description:
      'Uses the brief\'s alpha/beta framing: the PLP has a typical factor profile (its "beta"), and the product deviates from it factor by factor (its "alpha"). Merchandisers see at a glance which factors this product is relying on more — or less — than its neighbours.',
    notClaimed:
      'The baseline is a median of absolute RIS across this PLP\'s products, not a cross-page benchmark. It should not be compared across different PLPs.',
    group: 'approach-1',
    Component: BaselineComparator,
  },
  {
    id: 'differentiation-map',
    number: 7,
    title: 'Factor Usefulness Here',
    tagline: 'For each factor, one clear answer: useful to explain ranking on this page, or not.',
    approach: 'ris',
    posture: 'bold',
    question: 'Which factors are useful to explain rank differences on this page?',
    description:
      'For each factor, we look at the highest and lowest RIS across the products on this PLP and return a plain-English verdict — Useful here · Somewhat useful here · Not useful here. The top and bottom products on each factor are named so the merchandiser can immediately sanity-check the claim. No abstract scoring, no jargon.',
    notClaimed:
      'Usefulness is a page-local observation, not a judgement about the factor itself. A factor that is not useful on this PLP may be decisive on another.',
    group: 'approach-1',
    Component: DifferentiationMap,
  },
  {
    id: 'composition-stack',
    number: 8,
    title: 'Rank Influence Flow',
    tagline: 'Separates ML reranking from index retrieval and merchandiser rules — without implying they add up.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'Which force is shaping this product\'s rank — ML, a rule I wrote, or retrieval?',
    description:
      'A flow visual per product: three distinct rails (index retrieval, merchandiser rules, ML reranking) feeding into the served rank. Stroke weight encodes which force is leading versus supporting for that product — never a numeric share. Makes the separation the brief explicitly requires visible and auditable without suggesting the three sources decompose additively.',
    notClaimed:
      'The rails are not additive. We do not claim share-of-contribution, and rule-led products still pass through the ML reranker. When personalization dominates, the ML portion may not be fully observable.',
    group: 'approach-1',
    Component: CompositionStack,
  },
  {
    id: 'head-to-head-narrative',
    number: 9,
    title: 'Head-to-Head Narrative',
    tagline: 'Side-by-side cards with a pairwise LLM paragraph.',
    approach: 'pairwise',
    posture: 'enterprise',
    question: 'Why is Product A ranked above Product B?',
    description:
      'Two product cards with their ranks, plus a 3–5 sentence paragraph generated by an LLM using the report\'s mental-model–aware system prompt. The paragraph opens with the dominant driver, explains each product\'s competitive position, and closes with a takeaway.',
    notClaimed:
      'The narrative is produced from rank-with / rank-without counterfactuals for this pair. It names competitive effects, not model mechanics, and is re-generated after each model retraining.',
    group: 'approach-2',
    Component: HeadToHeadNarrative,
  },
  {
    id: 'pairwise-mirror',
    number: 10,
    title: 'Pairwise Factor Mirror',
    tagline: 'A symmetric chart that makes asymmetric factor effects obvious.',
    approach: 'pairwise',
    posture: 'bold',
    question: 'Which factor is creating the gap between these two products?',
    description:
      'Product A\'s RIS is drawn on the left side, Product B\'s on the right, factor by factor. Connectors between rows flag when a factor is helping one product and hurting the other — the "asymmetric" pattern from the report\'s scenario library.',
    notClaimed:
      'Mirror pairs compare the two selected products only. They are not a statement about either product\'s standing elsewhere on the page.',
    group: 'approach-2',
    Component: PairwiseMirror,
  },
  {
    id: 'conversational-qa',
    number: 11,
    title: '"Why Above" Conversational Q&A',
    tagline: 'A chat surface that answers pairwise questions in plain language.',
    approach: 'pairwise',
    posture: 'bold',
    question: 'Why is X ranked above Y — and what would change that?',
    description:
      'The merchandiser types a natural question — "why is X above Y?", "why is X ranked where it is?" — and the system returns a short narrative in their own vocabulary. No scores, no signals, no hypotheticals; only ranks, factors, and competitive position, shaped by the same system prompt as the Head-to-Head narrative.',
    notClaimed:
      'Answers are bound to the pre-computed rank data for these products on this page. They are not a live simulation of the model, and the assistant will not answer questions that require one.',
    group: 'approach-2',
    Component: ConversationalQA,
  },
  {
    id: 'swap-scenarios',
    number: 12,
    title: 'Swap Scenarios Explorer',
    tagline: 'Four micro-ladders. Which factor, if removed, would flip the order?',
    approach: 'pairwise',
    posture: 'bold',
    question: 'Which factor is decisive for the A-vs-B ordering?',
    description:
      'A small-multiples grid, one tile per factor, each with a miniature A/B ladder showing the current positions and the positions after removing that factor. The tile whose removal flips the order is the decisive factor; others are flagged as helping, hurting, or irrelevant.',
    notClaimed:
      'Each tile is a single-factor counterfactual. Removing several factors together is not shown and would not compose additively.',
    group: 'approach-2',
    Component: SwapScenarios,
  },
  {
    id: 'ambient-plp',
    number: 13,
    title: 'Ambient PLP Overlay',
    tagline: 'Explanations layered directly over the merchandising PLP.',
    approach: 'both',
    posture: 'bold',
    question: 'What if explanations were one hover away inside the merch tool?',
    description:
      'Hover a product on a mock PLP to reveal a compact RIS summary in a floating card. Click two products to trigger a pairwise narrative in a docked panel. The most contextual pattern: explanations disappear when you don\'t need them.',
    notClaimed:
      'This is a surface-level pattern, not a recommendation about where the feature should live. It assumes integration into an existing merch workspace.',
    group: 'hybrid',
    Component: AmbientPlpOverlay,
  },
  {
    id: 'rank-storyline',
    number: 14,
    title: 'Rank Storyline',
    tagline: 'Reads like a short briefing note, not a chart.',
    approach: 'ris',
    posture: 'bold',
    question: 'Can I read this product\'s story in one paragraph?',
    description:
      'An editorial-style explanation: a headline, three short paragraphs, and factor names highlighted inline so the merchandiser can scan the story like an article. Useful when an explanation needs to be copy-pasted into an email or a stakeholder deck.',
    notClaimed:
      'The story is a stylisation of the RIS vector. The direction and relative weight are faithful; the prose is editorial.',
    group: 'hybrid',
    Component: RankStoryline,
  },
  {
    id: 'commercial-intent',
    number: 15,
    title: 'Commercial Intent Check',
    tagline:
      "Does this page's current ranking match what you said you wanted to see on it?",
    approach: 'ris',
    posture: 'bold',
    question: 'Is this outcome aligned with my commercial intent?',
    description:
      'Express your intent as soft rules on archetypes (e.g. "keep Rising Stars in the top 10", "Trendiness headwinds should stay out of the top 5"), and the view scores the current PLP against those rules — flagging aligned products, products that are deeper than intended, and products that are shallower. Diagnostic only: the lever to act is still merchandiser rules.',
    notClaimed:
      "This concept does not change the ranking. Alignment is assessed against the archetypes already assigned by the RIS and is only as accurate as those labels are on this page.",
    group: 'hybrid',
    Component: CommercialIntentCheck,
  },
  {
    id: 'factor-impact-map',
    number: 16,
    title: 'Factor Impact Map',
    tagline:
      'Two questions at once: does the factor vary across this page, and does it actually move this product?',
    approach: 'ris',
    posture: 'bold',
    question:
      'Where does each factor sit between page-level spread and per-product rank impact?',
    description:
      'A two-axis map. The horizontal axis is how much the factor varies across the products on this PLP (tablestakes → discriminating). The vertical axis is how much the factor actually moves this product\'s rank. Four quadrants name the result in plain English — Decisive here · Tablestakes for this product · Unusually strong here · Minor effect — and every bubble is labelled with the concrete counterfactual ("#3 → #22 without it") so rank impact is always on screen.',
    notClaimed:
      'The Y-axis is per-product rank impact, the X-axis is a page-local spread measure. Neither is a universal property of the factor. The map is diagnostic, not a ranking simulator.',
    group: 'hybrid',
    Component: FactorImpactMap,
  },
  {
    id: 'scorecard-v2',
    number: 17,
    title: 'Ranking Impact Scorecard · Version 2',
    tagline: 'An iteration of concept 01 shaped by stakeholder comments — softer labels, no bars, explicit validity.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'Why is this product ranked where it is — and how long is this answer valid for?',
    description:
      'A revision of the canonical Scorecard (concept 01) that carries forward four specific stakeholder notes: the "drag / hurting" vocabulary is replaced with symmetric "lifts this product / lifts competitors" phrasing; the RIS bars are removed in favour of a single-sentence verdict plus the "without [factor] …" counterfactual; the "valid until next training" disclosure is promoted from a footer to a prominent Validity band treated as a hard UI commitment; and the original competitive-position framing is preserved. Shown alongside concept 01 so stakeholders can compare the before and the after.',
    notClaimed:
      'V2 is a response to feedback on concept 01, not a replacement. Both are kept in the showcase so the deltas are inspectable. The underlying method (single-factor rank counterfactuals) is identical — only the surfacing changed.',
    group: 'approach-1',
    Component: ScorecardV2,
  },
  {
    id: 'scorecard-v3',
    number: 18,
    title: 'Ranking Impact Scorecard · Version 3',
    tagline: 'Model factor forces and concrete merchandising rules, side by side on the same card.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'Why is this product ranked where it is — from the model AND from my rules?',
    description:
      'A single-product card that tells the full story behind a served rank. For each of the four model factors, one plain-language sentence says whether it is lifting this product, lifting its competitors on this page, or not meaningfully shaping the outcome here. Underneath, every merchandising rule currently affecting the product is named in full — scope, rationale, and effect on rank — so the merchandiser sees their own intent at play alongside the model\'s. Read together and separately, it lets them interpret a rank as a specific, legible combination of forces and decide whether to trust it, tune a rule, or layer more intent on top.',
    notClaimed:
      'Rule effects are described qualitatively — we do not claim an exact rule-only counterfactual rank. For pin rules, the pinned target position is stated verbatim because that is what the rule explicitly does; for boost/demote rules, the effect is directional. Rule copy is synthetic for this prototype.',
    group: 'approach-1',
    Component: ScorecardV3,
  },
  {
    id: 'tipping-point',
    number: 19,
    title: 'Tipping Point Diagnostic',
    tagline: 'Which products on this page are deeply anchored, and which are one factor shift away from swapping?',
    approach: 'ris',
    posture: 'enterprise',
    question: 'Which products are volatile on this page — and which are rock-solid?',
    description:
      'A page-wide scan that labels each product as anchored, mid-sensitive, or on-the-edge. For every on-edge product, the view names the nearest rival and the factor whose small shift would flip the two. Helps the merchandiser know which products to watch carefully before they look, and which to trust at a glance.',
    notClaimed:
      'Stability here is a proxy built from each product\'s rank-with / rank-without data — not a prediction of future rank movement and not a statement about the live model.',
    group: 'approach-1',
    Component: TippingPointDiagnostic,
  },
  {
    id: 'build-up-storyboard',
    number: 20,
    title: 'Ranking Build-Up Storyboard',
    tagline: 'Four panels: Popularity only → + Freshness → + Trendiness → full ranking.',
    approach: 'ris',
    posture: 'bold',
    question: 'What does each factor change when it enters the picture on this page?',
    description:
      'Reads the Sofas page left to right. Panel 0 shows the top five under Popularity alone; each subsequent panel adds one more factor and highlights which products swap in or out. Designed to make the factors\' roles legible as a narrative of accumulation, not as a decomposition — the build-up order is a storytelling choice the UI calls out explicitly.',
    notClaimed:
      'The model combines the four factors jointly, not sequentially. Adding factors in a different order would produce a different build-up. The panels are directionally faithful; they are not a unique attribution of the final rank.',
    group: 'approach-1',
    Component: BuildUpStoryboard,
  },
  {
    id: 'baseline-swap-map',
    number: 21,
    title: 'Baseline-Relative Swap Map',
    tagline: 'For each factor, the products it is currently lifting and the products it is holding back against the rest.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'What is each factor currently doing on this page, compared to the other three?',
    description:
      'Pick a factor. The view lists the products this factor is lifting on this page and the products whose competitors this factor is currently benefiting more. Read it as a baseline-relative diagnostic: "compared to a view where this factor didn\'t exist, here\'s who moves."',
    notClaimed:
      'A baseline-relative read, not a claim about how the four factors combine. A product not listed is broadly unaffected by the selected factor here — not a universal property.',
    group: 'approach-1',
    Component: BaselineSwapMap,
  },
  {
    id: 'alternative-scenarios',
    number: 22,
    title: 'Alternative Scenarios Gallery',
    tagline: 'Pre-computed "what if the factor mix were different" previews — no sliders, no live dial.',
    approach: 'ris',
    posture: 'bold',
    question: 'What would this page look like under a different balance of factors?',
    description:
      'A gallery of pre-computed scenarios: "If Trendiness carried less influence", "If Freshness were dominant", and so on. Each scenario shows a top-ten preview and a short narrative explaining who rises and who falls. Read-only by design — changing the live ranking still happens through merchandising rules.',
    notClaimed:
      'Scenarios are diagnostic projections grounded in the per-factor rank counterfactuals, not live simulations of the model. There is no dial that controls the served page.',
    group: 'approach-1',
    Component: AlternativeScenarios,
  },
  {
    id: 'stability-map',
    number: 23,
    title: 'Ranking Stability Map',
    tagline: 'A 2D scan of rank versus how much the four factors move each product.',
    approach: 'ris',
    posture: 'bold',
    question: 'Which products are where they are because of many factors, and which by just one?',
    description:
      'Every product placed on a 2D map: rank on the horizontal axis, total factor-driven sensitivity on the vertical. Colour names the dominant factor currently doing the most work for or against each product. Tells a merchandiser where to look first on a page without naming specific products upfront.',
    notClaimed:
      'Sensitivity is a proxy summing each product\'s rank shifts under single-factor ablation. It is a scan-level diagnostic, not a prediction and not a literal property of the model.',
    group: 'approach-1',
    Component: StabilityMap,
  },
  {
    id: 'winners-losers',
    number: 24,
    title: 'Factor Winners & Losers',
    tagline: 'Four columns, one per factor. Who each factor is working hardest for — and against — right now.',
    approach: 'ris',
    posture: 'enterprise',
    question: 'Who is each factor currently working for on this page?',
    description:
      'A scannable board with one column per factor. In each: the top three products this factor is lifting, and the top three where this factor is lifting competitors more. Makes "what is each factor actually doing on this page" legible in one glance.',
    notClaimed:
      'Top three is a per-page observation, not a persistent property of the product. The same product ranked top-three here can fall outside it on a different PLP.',
    group: 'approach-1',
    Component: FactorWinnersLosers,
  },
  {
    id: 'diversity-atlas',
    number: 25,
    title: 'Page Diversity Atlas',
    tagline: 'Products positioned by the shape of their factor profile — find the outliers at a glance.',
    approach: 'ris',
    posture: 'bold',
    question: 'Which products behave alike on this page, and which are the outliers?',
    description:
      'A 2D atlas of the Sofas PLP. Horizontal axis separates Popularity-led products from products driven by other forces; vertical axis separates momentum-led (Trendiness + Freshness) from conversion-led (Engagement). Products near each other share a factor profile; outliers are worth a closer look.',
    notClaimed:
      'The two axes are a linear projection of the per-factor rank impact — readable, but not a PCA or a persistent taxonomy. Clusters are observations on this page only.',
    group: 'approach-1',
    Component: DiversityAtlas,
  },
  {
    id: 'rank-provenance-timeline',
    number: 26,
    title: 'Rank Provenance Timeline',
    tagline: 'Four weeks of rank with a retraining marker — and a factor called out for each period.',
    approach: 'ris',
    posture: 'bold',
    question: 'How has this product\'s rank moved over time, and what factor best accounts for each shift?',
    description:
      'A daily rank history for a selected product, with vertical markers at each model retraining. Each training period gets one annotation naming the factor whose behaviour best accounts for that week\'s trajectory — a single-factor best-fit, not a unique decomposition.',
    notClaimed:
      'Per-period factor attribution is the best single-factor fit for that period\'s shift. It is not the only possible explanation and is regenerated at every retraining. Historical data in the prototype is illustrative.',
    group: 'approach-1',
    Component: RankProvenanceTimeline,
  },
  {
    id: 'decision-pathway',
    number: 27,
    title: 'Decision Pathway',
    tagline: 'The pairwise reasoning behind the narrative, one factor at a time.',
    approach: 'pairwise',
    posture: 'bold',
    question: 'Can I inspect the factor-by-factor reasoning that leads to A being ranked above B?',
    description:
      'An inspectable tree for any pair of products. Factors are evaluated in order of impact; at each step the view names which product the factor favours, how much the gap shifts because of it, and a one-line plain-language explanation. The leaf is the conclusion the narrative delivers in prose.',
    notClaimed:
      'The order in which factors are evaluated is the narrative\'s ordering (by materiality on this pair), not the model\'s — the model weighs all factors jointly.',
    group: 'approach-2',
    Component: DecisionPathway,
  },
  {
    id: 'rule-preview',
    number: 28,
    title: 'Rule Preview',
    tagline: 'Draft a rule, see the preview page next to today\'s — model unchanged, rule composed on top.',
    approach: 'both',
    posture: 'enterprise',
    question: 'If I added this rule, what would the page look like — and would the model\'s story still hold?',
    description:
      'The merchandiser drafts a boost, demote or pin rule and sees today\'s page alongside the page they would get with the rule applied. Every shifted product is called out. The model\'s factor story for every product stays exactly the same — the rule composes on top of the served ranking, it does not dial the model.',
    notClaimed:
      'The preview is a composition of the current served ranking with the drafted rule. Conflict resolution between overlapping rules is simplified here; in production the system applies the most specific rule at serve time.',
    group: 'hybrid',
    Component: RulePreview,
  },
]

export const conceptById = (id: string) => concepts.find((c) => c.id === id)
