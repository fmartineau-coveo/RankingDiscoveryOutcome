# Ranking Explainability — Concept Showcase

A desktop-first design exploration that presents **16 UI directions** for explaining Coveo's ranking models to merchandisers, grounded in the two ablation-based explainability approaches selected during the ML Explainability Layer discovery:

1. **Ranking Impact Score (RIS)** — a per-product, per-factor score in `[−1, +1]` derived from rank-with / rank-without counterfactuals.
2. **LLM Pairwise Narrative** — a short, mental-model–aware paragraph generated from two products' rank counterfactuals.

The prototype is a stakeholder-facing artefact, not a product direction. It exists so product, design, ML, and merchandising can react to concrete surfaces before any production decisions are made.

Live app — run locally with `npm install && npm run dev` (Vite, port 5173).
Live github page : https://fmartineau-coveo.github.io/RankingDiscoveryOutcome/

---

## Table of contents

- [Why this exists](#why-this-exists)
- [The problem the discovery set out to solve](#the-problem-the-discovery-set-out-to-solve)
- [The two approved approaches](#the-two-approved-approaches)
- [Design principles the prototype holds to](#design-principles-the-prototype-holds-to)
- [The 16 concepts](#the-16-concepts)
- [Truthfulness guardrails baked into the code](#truthfulness-guardrails-baked-into-the-code)
- [Project structure](#project-structure)
- [Running locally](#running-locally)
- [Known scope and limitations](#known-scope-and-limitations)
- [Source material](#source-material)

---

## Why this exists

Coveo's ranking models (LPO, SPO, and the broader family) are non-linear, listwise, and sensitive to the competitive set around every product. That makes them hard to explain — especially to merchandisers, who don't know how ranking models work, don't want to know, and shouldn't have to know. The existing CMH surfacing (signals without narrative, scores without context) has repeatedly eroded trust rather than built it.

The ML Explainability Layer discovery ran Feb 16 – Mar 31, 2026 to answer one product question:

> **How do you take something as complex and unintuitive as a ranking model, and turn it into a simple narrative that is directionally correct, doesn't violate how the model actually works, and tells merchandisers what they care about — without asking them to reason about what they see or know anything about how learning-to-rank works?**

The discovery converged on two ablation-based approaches (see below). What it did **not** produce was a UI direction. That's what this prototype is for: a concrete, credible, opinionated set of surfaces against which the team can have the next round of conversations.

## The problem the discovery set out to solve

Ranking breaks most people's intuitions in specific ways — and the prototype internalises each of them:

- **Scores are for ordering only.** A product's absolute score is meaningless; only its rank matters. Everything the merchandiser sees in this prototype is a rank.
- **Rank is relative.** A product's position is determined by every other product in the competitive set. Change the set, and the rank changes even if the product hasn't.
- **A factor can help a product's relevance while hurting its competitive position.** Lifting a product's score by 0.06 can push its rank *down* if the same factor lifts five nearby competitors by 0.10. This is why every concept frames factor effects in *competitive position*, never in "contribution".
- **Not all rank movements are equally meaningful.** A top-5 swap is a merchandising event; a rank 2,000 → 2,005 shuffle is noise, even though both have a delta of 5.
- **Signals interact non-linearly.** The scientific report rejected the "decompose the score into linear contributions" hypothesis. Ablation is counterfactual, not decomposition — and no visual in this prototype invites summation.

The hardest product constraint: **the explanation has to carry the right mental model inside it**, so the merchandiser never has to build it themselves. They read it, they get it, they move on or they act on it.

## The two approved approaches

### Approach 1 — Ranking Impact Score (RIS)

Answers **"Why is this product ranked where it is?"**

For each product × factor, we compute two quantities via factor ablation: `rank_with` (served rank with the factor present) and `rank_without` (rank if we remove that factor and retrain). The Ranking Impact Score is a function of those two numbers that returns a single bounded value in `[−1, +1]`, combining:

- **Direction** — positive if the factor helps this product's competitive position, negative if competitors benefit more from it than this product does.
- **Position weight** — top-of-list movements dominate; deep-list shuffles fade.
- **Change weight** — proportional, so rank 2 → 20 (10×) and rank 20 → 200 (10×) carry comparable weight despite the absolute deltas being 18 vs 180.

The merchandiser never sees any of this math. They see a labelled bar, a verdict ("Clearly helping"), and a plain-English headline. The mental model is inside the number.

### Approach 2 — LLM Pairwise Narrative

Answers **"Why is Product A ranked above Product B?"**

Given two products' ablation data for each factor, a mental-model–aware system prompt generates a 3–5 sentence paragraph structured as:

1. Headline naming the dominant factor driving the order.
2. What the dominant factor does to each product's competitive position.
3. Secondary factors in order of impact.
4. A one-sentence merchandising takeaway.

Tone rules enforced in the prompt: rank not score, competitive position not contribution, no hedging, no ML jargon, no signal names, concise. The prompt is the explainability method — the narrative is not a prose rendering of a separate explanation, it *is* the explanation.

## Design principles the prototype holds to

Every concept in the showcase is a different answer to the same set of constraints. These six principles are the guardrails nothing here should violate:

| # | Principle | What it means in the UI |
|---|---|---|
| 01 | **Rank, not score** | No score values, score deltas, or points are ever surfaced. Every number is a rank position. |
| 02 | **Competitive position, not absolute contribution** | Factor effects are always described as "helps / hurts *this product's* position in *this context*", never as a universal property of the factor. |
| 03 | **Weighted impact, not raw deltas** | Visuals and RIS buckets encode position sensitivity — a rank-3 move is drawn and labelled more prominently than a rank-3,000 move of equal magnitude. |
| 04 | **Factors, not signals** | Four stable merchandiser-friendly factors: Popularity, Freshness, Trendiness, Engagement. The underlying signals can evolve; the vocabulary does not. Protects IP and keeps explanations stable across model iterations. |
| 05 | **Honest about uncertainty** | Every concept detail page carries a "What this does not claim" honesty note. Explanations are labelled as valid only until the next model training; merchandiser rules and index retrieval are surfaced as co-drivers, not hidden. |
| 06 | **Informational, not actionable (today)** | The prototype never implies a direct lever on the model. Any "what to do next" is explicitly routed through merchandiser rules, because that's the only lever that actually exists. |

## The 16 concepts

Eight enterprise-ready patterns and eight bolder, more visionary ones. Every concept is anchored in one of the two approved approaches and uses the same 12-product Sofas PLP so they can be compared side by side.

### Approach 1 — Ranking Impact Score

| # | Concept | Posture | Merchandiser question it answers |
|---|---|---|---|
| 01 | **Ranking Impact Scorecard** | Enterprise | Why is this product ranked where it is? |
| 02 | **Factor Impact Radar** | Bold | What is this product's overall factor signature on this page? |
| 03 | **Counterfactual Ladder** | Enterprise | What is holding this product up — and what is holding it down? |
| 04 | **PLP Heatmap Matrix** | Enterprise | Which factors are moving which products on this page? |
| 05 | **Merchandising Archetypes** | Enterprise | What kind of product is this, in merchandising terms? |
| 06 | **Page Baseline Comparator** | Enterprise | Where does this product over- or under-index versus the page baseline? |
| 07 | **Factor Usefulness Here** | Bold | Which factors are useful to explain rank differences on this page? |
| 08 | **Rank Influence Flow** | Enterprise | Which force is shaping this product's rank — ML, a rule I wrote, or retrieval? |

### Approach 2 — LLM Pairwise Narrative

| # | Concept | Posture | Merchandiser question it answers |
|---|---|---|---|
| 09 | **Head-to-Head Narrative** | Enterprise | Why is Product A ranked above Product B? |
| 10 | **Pairwise Factor Mirror** | Bold | Which factor is creating the gap between these two products? |
| 11 | **"Why Above" Conversational Q&A** | Bold | Why is X ranked above Y — and what would change that? |
| 12 | **Swap Scenarios Explorer** | Bold | Which factor is decisive for the A-vs-B ordering? |

### Hybrid / cross-cutting

| # | Concept | Posture | Merchandiser question it answers |
|---|---|---|---|
| 13 | **Ambient PLP Overlay** | Bold | What if explanations were one hover away inside the merch tool? |
| 14 | **Rank Storyline** | Bold | Can I read this product's story in one paragraph? |
| 15 | **Commercial Intent Check** | Bold | Is this outcome aligned with my commercial intent? |
| 16 | **Factor Impact Map** | Bold | Is this factor actually relevant to explain this product, or is it just noise? |

Concepts are registered in [`src/data/concepts.ts`](src/data/concepts.ts); each has its own component under [`src/components/concepts/`](src/components/concepts/).

## Truthfulness guardrails baked into the code

The discovery has an unusually strict truthfulness bar. Three engineering decisions operationalise it:

### 1. Every rendered number is reconstructible from ablation data

Each mock product in [`src/data/mockData.ts`](src/data/mockData.ts) declares, per factor: `rankWith`, `rankWithout`, and a signed RIS. The RIS is derived from the two rank numbers — no concept surfaces a number that isn't either a rank position or a RIS. Velvet Cloud Sofa (rank 3) and Leather Power Recliner (rank 18) match the discovery report's pairwise example verbatim; the other 10 products are illustrative but follow the same formula shape.

### 2. RIS values are displayed at one decimal

The RIS is an estimate of direction and proportional shift. Rendering `+0.8147` would imply a precision the method doesn't support. A `formatRis()` helper in [`src/lib/ris.ts`](src/lib/ris.ts) rounds to one decimal and collapses negligible values to `±0.0`. All concepts consume this helper, so precision is consistent across the showcase.

### 3. Language discipline enforced at the microcopy level

The prototype's copy was audited against the discovery's "never say" list:

- Never: *score, signal, ablation, weight, attribution, coefficient, points from factor X, contribution of factor Y, a factor is good / bad.*
- Always: *rank position, competitive position, without this factor — this product would…, benefits competitors more than this product, valid until the next training.*

Concept 08 (Rank Influence Flow) was specifically redesigned away from a stacked bar — stacked bars visually invite summation, and the discovery is explicit that the three rank-influence forces (retrieval, rules, ML) do not compose additively. It now renders as three independent flow rails converging on a served-rank node; stroke weight encodes which force is leading vs supporting, never a numeric share.

### Other guardrails worth flagging

- Concept 02 (Radar) opens with a "factor signature, not composition" framing paragraph so the enclosed area isn't misread as a proportion.
- Concept 13 (Ambient PLP Overlay) hover cards follow the same 3-sentence discipline as the pairwise narrative — headline in competitive-position language, per-factor bars, a validity footer — rather than offering a bare list of numbers.
- Concept 15 (Commercial Intent Check) is explicitly positioned as diagnostic, with a clear "this does not change the ranking" disclaimer in the UI; any suggested next step routes through merchandiser rules.
- Every concept detail page carries a "What this does not claim" honesty note drawn from its entry in the concept registry.

## Project structure

```
src/
├─ App.tsx                     React Router: Overview · Principles · Gallery · Pinned · Concept detail
├─ main.tsx                    Entry point (React 18 + BrowserRouter)
├─ index.css                   Tailwind directives + bespoke utilities (.paper, .hairline, .tag, etc.)
│
├─ components/
│  ├─ Shell.tsx                Top bar + contextual sidebar listing all 16 concepts
│  ├─ Landing.tsx              Hero, principles strip, two-approaches card, gallery preview, footer
│  ├─ PrinciplesPanel.tsx      Six principles + "what we do / do not say" comparison
│  ├─ GalleryPage.tsx          Filterable grid (All / RIS / Pairwise / Enterprise / Bold)
│  ├─ ConceptGallery.tsx       Concept card with a bespoke preview SVG per concept
│  ├─ ConceptDetail.tsx        Header · question · worked example · honesty note · prev/next + pin
│  ├─ PinnedPage.tsx           Shortlist view — restores the exact product / pair / selection
│  │
│  ├─ concepts/
│  │  ├─ 01-Scorecard.tsx … 16-FactorImpactMap.tsx
│  │
│  └─ primitives/
│     ├─ RisBar.tsx            Diverging bar centred on 0, blue = helps / purple = hurts
│     ├─ FactorChip.tsx, RankBadge.tsx, ProductTile.tsx, ApproachTag.tsx,
│     ├─ HonestyNote.tsx, PinButton.tsx, ProductPicker.tsx
│
├─ data/
│  ├─ mockData.ts              12 products, RIS per factor, archetypes, composition hints,
│  │                           curated pairs, pairwise-narrative generator, scenario classifier
│  └─ concepts.ts              Registry (id, number, title, approach, posture, question, notClaimed)
│
└─ lib/
   ├─ ris.ts                   risLabel · risDirection · risToneHex · formatRis · rankDeltaString
   ├─ appState.tsx             Pinned-views store, persisted to localStorage
   ├─ conceptState.tsx         Per-concept ephemeral state (focus product, pair, selection)
   └─ utils.ts                 cx class combiner + clamp
```

Stack: React 18, React Router v6, Vite, TypeScript (strict), Tailwind 3 with an extended theme (Ink neutrals, Blue = helping, Purple = hurting, plus Rose / Amber / Teal accents), Lucide icons, Framer Motion (available but used sparingly), Inter / Instrument Serif / JetBrains Mono.

## Running locally

```bash
npm install
npm run dev        # starts Vite on http://localhost:5173
npm run build      # type-check + production bundle
npm run preview    # serve the built bundle
```

No environment variables, no backend, no external services. The LLM pairwise narratives are pre-generated and deterministic; the "Conversational Q&A" concept parses the question client-side and routes it to a pre-written response grounded in the mock ablation data.

## Known scope and limitations

- **This is an exploration, not a shipping product.** Concepts have not been validated with customers. The `AT RISK` milestone in the discovery — merchant usability tests with more than one customer — has not happened yet. The showcase exists to inform that conversation.
- **The mock PLP is Sofas.** Twelve products, 184 total candidates. Velvet Cloud Sofa and Leather Power Recliner match the discovery report's stylised pairwise example verbatim; everything else is illustrative.
- **The "Conversational Q&A" concept is mocked end-to-end.** There is no LLM call at runtime. The parser covers three intents (product-level, pairwise, what-if) and returns pre-composed responses built from the mock data, so every answer is methodologically consistent with the approved approaches.
- **The Ambient PLP Overlay is a surface pattern, not an integration.** It shows what the feature could feel like layered over a merchandising tool; it does not assume where the feature should live.
- **Concept 15 (Commercial Intent Check) is read-only by design.** It will never offer to change the ranking — the only lever available today is merchandiser rules, and the concept is explicit about that.

## Source material

The prototype is the UI response to three discovery documents:

1. **Ranking Explainability Discovery Report — A PM's Perspective.** The PM-facing synthesis. Establishes the two approved approaches, the tone/language rules, and the mental model the prototype embeds. Sections the prototype leans on most: *Why ranking is unintuitive*, *The right mental model*, *Factor Ablation-Based Explainability*, *Explainability Approach 1: RIS*, *Explainability Approach 2: LLM Pairwise Narrative*, *Possible Visualizations*.
2. **Feature Discovery Brief: ML Explainability Layer.** The original brief. Defines the core product tenets (human-in-the-loop, operational clarity, evidence-based clarity, never mislead, separate influences clearly, consistency at scale) and the MUST / SHOULD / COULD / WON'T requirements the prototype is audited against.
3. **[RankingVis] Discovery Report.** The scientific companion. Records the 10 hypotheses tested on XXXLutz data and their outcomes (ranks are more insightful than scores — supported; signals can be grouped into stable factors — supported; Top Sellers are buried by LPO — supported, and so on). The prototype's refusal to imply additivity or linearity traces directly to the "Give up the notion of linearity" recommendation in this report.

---

Built as a design exploration for the Ranking Visibility initiative. Any decisions about production direction, scope, or timeline live in the RFC that follows the discovery readout — not here.
