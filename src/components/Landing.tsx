import { Link } from 'react-router-dom'
import { ArrowRight, Gauge, MessagesSquare, AlertTriangle, Sparkles } from 'lucide-react'
import { concepts } from '@/data/concepts'
import { ConceptGallery } from '@/components/ConceptGallery'

export function Landing() {
  return (
    <div className="space-y-16">
      <Hero />
      <PrinciplesStrip />
      <TwoApproaches />
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-600">
              Gallery
            </div>
            <h2 className="display text-4xl text-ink-900">17 concept directions</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
              Nine grounded / enterprise-ready patterns and eight bold / visionary ones. Every
              concept is grounded in one of the two approved explainability approaches and uses the
              same sofas PLP so they can be compared side-by-side.
            </p>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700 shadow-soft hover:bg-ink-50"
          >
            Full gallery <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ConceptGallery concepts={concepts} />
      </section>
      <Footer />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-ink-200 bg-hero paper shadow-card">
      <div className="noise relative px-10 pb-14 pt-16">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-600">
          <Sparkles className="h-3 w-3" />
          Design exploration · Apr 2026
        </div>
        <h1 className="display mt-4 max-w-3xl text-[68px] leading-[0.98] tracking-tight text-ink-950">
          Make ranking{' '}
          <em className="text-purple-600">legible</em>{' '}
          <br />
          to merchandisers.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-700">
          Coveo's discovery converged on two counterfactual-based approaches for explaining
          ranking-model outcomes: a per-product <strong>Ranking Impact Score</strong> and an
          LLM-powered <strong>Pairwise Narrative</strong>. This showcase presents 17 ways those
          approaches could surface to merchandisers — from the conservative to the visionary — so
          we can react, compare, and align before any line of production code is written.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/gallery"
            className="group inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-medium text-white shadow-lift hover:bg-ink-800"
          >
            Explore the 17 concepts
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/principles"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 shadow-soft hover:bg-ink-50"
          >
            Design principles from discovery
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-4">
          <HeroStat
            label="Approved approaches"
            value="2"
            sub="Ranking Impact Score · Pairwise Narrative"
          />
          <HeroStat
            label="Factor vocabulary"
            value="4"
            sub="Popularity · Freshness · Trendiness · Engagement"
          />
          <HeroStat
            label="Concept directions"
            value="17"
            sub="9 enterprise · 8 bold"
          />
        </div>
      </div>
    </section>
  )
}

function HeroStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white/70 p-4 backdrop-blur">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </div>
      <div className="display mt-1 text-5xl leading-none text-ink-950">{value}</div>
      <div className="mt-2 text-[11px] text-ink-600">{sub}</div>
    </div>
  )
}

function PrinciplesStrip() {
  const items: { n: string; title: string; body: string; tone: 'blue' | 'purple' | 'ink' }[] = [
    {
      n: '01',
      title: 'Rank, not score',
      body: 'Scores are internal artifacts. Merchandisers see ranks — so explanations live in rank.',
      tone: 'blue',
    },
    {
      n: '02',
      title: 'Competitive position',
      body: 'A factor can help one product and hurt another on the same page. Position is relative.',
      tone: 'purple',
    },
    {
      n: '03',
      title: 'Weighted impact',
      body: 'A two-rank move at the top is not a two-rank move deep in the list.',
      tone: 'ink',
    },
    {
      n: '04',
      title: 'Factors, not signals',
      body: 'Four stable factors. No raw signals, no model internals, no IP exposure.',
      tone: 'blue',
    },
    {
      n: '05',
      title: 'Honest about uncertainty',
      body: 'Explanations are valid until the next training. Rules and index are co-drivers.',
      tone: 'purple',
    },
    {
      n: '06',
      title: 'Informational, not actionable',
      body: 'The lever to act is still merch rules. Explanations help merchandisers decide.',
      tone: 'ink',
    },
  ]
  return (
    <section>
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
          Design principles
        </div>
        <h2 className="display text-4xl text-ink-900">Six truths from the discovery.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
          Every concept in this showcase is a different answer to the same constraints. These six
          principles were surfaced during the ML Explainability discovery workshop and are the
          guardrails nothing here should violate.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.n}
            className="group relative overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
          >
            <div className="flex items-baseline justify-between">
              <div
                className={
                  it.tone === 'blue'
                    ? 'text-blue-500'
                    : it.tone === 'purple'
                      ? 'text-purple-500'
                      : 'text-ink-400'
                }
              >
                <span className="font-mono text-[11px] font-semibold tracking-widest">{it.n}</span>
              </div>
            </div>
            <h3 className="mt-3 text-[15px] font-semibold text-ink-900">{it.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">{it.body}</p>
            <div
              className={
                'pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-60 ' +
                (it.tone === 'blue'
                  ? 'bg-blue-300'
                  : it.tone === 'purple'
                    ? 'bg-purple-300'
                    : 'bg-ink-200')
              }
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function TwoApproaches() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white p-7 shadow-card">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
          <Gauge className="h-3.5 w-3.5" />
          Approach 1
        </div>
        <h3 className="display mt-2 text-3xl text-ink-900">Ranking Impact Score</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          A single number per factor per product in{' '}
          <span className="font-mono text-xs">[−1, +1]</span>, derived from rank-with / rank-without
          counterfactuals. It carries the mental model inside — direction, position weight, and
          proportional change — so the merchandiser never has to reason about what ranking "means".
        </p>
        <div className="mt-5 rounded-xl border border-ink-200 bg-white p-4 text-xs text-ink-600">
          <div className="font-medium text-ink-800">Answers</div>
          <div className="mt-1">"Why is this product ranked where it is?"</div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-white p-7 shadow-card">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-600">
          <MessagesSquare className="h-3.5 w-3.5" />
          Approach 2
        </div>
        <h3 className="display mt-2 text-3xl text-ink-900">LLM Pairwise Narrative</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          A short paragraph generated from two products' rank counterfactuals using a
          mental-model–aware system prompt. Never mentions scores or model mechanics. The story{' '}
          <em>is</em> the explanation.
        </p>
        <div className="mt-5 rounded-xl border border-ink-200 bg-white p-4 text-xs text-ink-600">
          <div className="font-medium text-ink-800">Answers</div>
          <div className="mt-1">"Why is X ranked above Y?"</div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-amber-400/20 text-amber-500">
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
        <div className="text-[13px] leading-relaxed text-ink-700">
          <strong>This is a design exploration, not a product direction.</strong> Every example is
          illustrative and faithful to the approved approaches, but concepts have not been
          validated with customers. The explanations surfaced here are estimates of each factor's
          marginal effect on rank on a given page — not a literal decomposition of the model — and
          are only valid until the next model training.
        </div>
      </div>
    </footer>
  )
}
