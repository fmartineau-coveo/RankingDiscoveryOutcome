import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

export function PrinciplesPanel() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="mb-2 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-3 w-3" /> Back to overview
        </Link>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">
          Principles
        </div>
        <h1 className="display text-5xl text-ink-950">The guardrails.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">
          The discovery produced a set of non-negotiable rules for how ranking explanations must
          feel, what they must carry inside, and what they must never claim. Every concept in this
          showcase is a different answer to those constraints.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Principle
          number="01"
          title="Rank, not score"
          body="Score is a synthetic internal artifact; its absolute value is meaningless. A merchandiser only ever sees ranks — so every explanation here frames impact as a change in rank."
        />
        <Principle
          number="02"
          title="Competitive position, not absolute contribution"
          body="A factor does not have a fixed effect. The same factor can help one product and hurt another, or help a product here and hurt it there. Every explanation describes what the factor did to this product's position in this context."
        />
        <Principle
          number="03"
          title="Weighted impact, not raw deltas"
          body="A two-rank move at rank 3 is a merchandising event; the same move at rank 2 000 is noise. The Ranking Impact Score encodes this automatically — magnitude, direction, and where in the list it happened."
        />
        <Principle
          number="04"
          title="Factors, not signals"
          body="Four merchandiser-friendly factors: Popularity, Freshness, Trendiness, Engagement. The underlying signals can evolve; the vocabulary does not. This protects IP and makes explanations stable across model iterations."
        />
        <Principle
          number="05"
          title="Honest about uncertainty"
          body="Explanations are valid until the next model training. Merchandiser rules and index retrieval are always co-drivers. Personalization may make parts of the ordering unobservable; concepts acknowledge this rather than hide it."
        />
        <Principle
          number="06"
          title="Informational, not actionable (today)"
          body="The lever to act on ranking is still the merchandiser's rules. Explanations help them decide whether to layer strategic intent on top of the model; they do not offer a direct dial into the model itself."
        />
      </div>

      <section className="rounded-2xl border border-ink-200 bg-white p-7 shadow-soft">
        <h2 className="display text-3xl text-ink-900">What we do — and do not — say</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <CheckCircle2 className="h-4 w-4" />
              We say
            </div>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-700">
              <li>"Trendiness is the main reason this product is in the top 3."</li>
              <li>"Without Freshness, this product would fall from rank 4 to rank 19."</li>
              <li>"Popularity is helping both products — but it helps the Recliner more."</li>
              <li>"Engagement has negligible impact on the gap between these two products."</li>
            </ul>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
              <XCircle className="h-4 w-4" />
              We never say
            </div>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-700">
              <li>"The model gave this product a score of 2,147."</li>
              <li>"Popularity contributes 34% to the ranking."</li>
              <li>"Popularity is a positive factor." <span className="text-ink-500">(It isn't always.)</span></li>
              <li>"Ablation shows that …" <span className="text-ink-500">(Merchandisers shouldn't need this word.)</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-gradient-to-br from-white to-ink-50 p-7 shadow-soft">
        <h2 className="display text-3xl text-ink-900">The mental model, embedded</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-700">
          Ranking is inherently unintuitive: scores aren't meaningful, rank is relative, and a
          factor can help a product's relevance while hurting its competitive position. Rather
          than teach merchandisers to think this way, the two approved approaches embed the
          correct interpretation directly inside the output — so the merchandiser can just{' '}
          <em>read</em> and move on.
        </p>
      </section>
    </div>
  )
}

function Principle({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <article className="relative rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
      <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-purple-600">
        {number}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{body}</p>
    </article>
  )
}
