import { useState } from 'react'
import { Send, Sparkles, User, Wand2 } from 'lucide-react'
import {
  productById,
  products,
  narrativeForPair,
  narrativeForProduct,
  topPositiveFactor,
  topNegativeFactor,
} from '@/data/mockData'
import { cx } from '@/lib/utils'

type Turn = { role: 'user' | 'assistant'; content: React.ReactNode }

/**
 * Supports three intents, all grounded in pre-computed data:
 *  - Pairwise: "Why is X above Y?"
 *  - Product: "Why is X ranked where it is?" (uses RIS + narrativeForProduct)
 *  - What-if: "What if <Factor> were removed for X?"
 */
function answer(q: string): React.ReactNode {
  const lower = q.toLowerCase()

  // -------- Pairwise intent
  const aVsB = parsePair(q)
  if (aVsB) {
    const [a, b] = aVsB
    const nar = narrativeForPair(a, b)
    return (
      <>
        <p className="font-medium text-ink-900">{nar.headline}</p>
        {nar.paragraphs.map((p, i) => (
          <p key={i} className="mt-2">
            {p}
          </p>
        ))}
      </>
    )
  }

  // -------- What-if / ablation on a single product
  const whatIf = parseWhatIf(q)
  if (whatIf) {
    const { product, factor } = whatIf
    const e = product.factors[factor]
    const delta = e.rankWithout - e.rankWith
    const verdict =
      delta > 0
        ? `${factor} is currently helping ${product.name}. Without it, the product would drop from rank ${e.rankWith} to rank ${e.rankWithout}.`
        : delta < 0
          ? `${factor} is actually giving competitors a bigger lift than it gives ${product.name}. Without it, the product would move up from rank ${e.rankWith} to rank ${e.rankWithout}.`
          : `${factor} has no meaningful effect on ${product.name} — removing it would keep it at rank ${e.rankWith}.`
    return (
      <>
        <p className="font-medium text-ink-900">
          Without {factor}, {product.name} {delta === 0 ? 'would not move' : delta > 0 ? `would drop to rank ${e.rankWithout}` : `would move up to rank ${e.rankWithout}`}.
        </p>
        <p className="mt-2">{verdict}</p>
        <p className="mt-2 text-ink-600">
          Remember this is a single-factor counterfactual — removing two factors together is not
          the sum of removing each.
        </p>
      </>
    )
  }

  // -------- Single-product "why is X ranked here?"
  const product = parseProductRef(q)
  if (product && (lower.includes('why') || lower.includes('rank') || lower.includes('here'))) {
    const nar = narrativeForProduct(product)
    const top = topPositiveFactor(product)
    const bottom = topNegativeFactor(product)
    return (
      <>
        <p className="font-medium text-ink-900">{nar.headline}</p>
        <p className="mt-2">{nar.body}</p>
        <p className="mt-2 text-ink-600">
          Top lift on this page: <strong>{top}</strong>
          {bottom ? (
            <>
              {' '}
              · Top drag: <strong>{bottom}</strong>
            </>
          ) : (
            ''
          )}
          .
        </p>
      </>
    )
  }

  // -------- Fallback
  return (
    <p>
      I can answer two kinds of questions grounded in this PLP's rank data: <em>"Why is X ranked
      here?"</em> (product-level) and <em>"Why is X above Y?"</em> (pairwise). I also handle
      what-if questions like <em>"What if Freshness were removed for Copenhagen Linen?"</em>.
    </p>
  )
}

function parsePair(q: string): [ReturnType<typeof productById>, ReturnType<typeof productById>] | null {
  const lower = q.toLowerCase()
  // look for "above" or "vs" / "versus" keywords
  if (!(lower.includes('above') || lower.includes(' vs') || lower.includes('versus') || lower.includes('compared'))) return null
  const matches: ReturnType<typeof productById>[] = []
  for (const p of products) {
    const name = p.name.toLowerCase()
    if (lower.includes(name) || lower.includes(name.split(' ')[0])) matches.push(p)
    if (matches.length === 2) break
  }
  if (matches.length !== 2) return null
  return [matches[0], matches[1]]
}

function parseWhatIf(q: string): { product: ReturnType<typeof productById>; factor: 'Popularity' | 'Freshness' | 'Trendiness' | 'Engagement' } | null {
  const lower = q.toLowerCase()
  if (!(lower.includes('what if') || lower.includes('without') || lower.includes('if we removed'))) return null
  const factor = ['popularity', 'freshness', 'trendiness', 'engagement'].find((f) => lower.includes(f)) as string | undefined
  if (!factor) return null
  const product = parseProductRef(q)
  if (!product) return null
  const capF = (factor[0].toUpperCase() + factor.slice(1)) as 'Popularity' | 'Freshness' | 'Trendiness' | 'Engagement'
  return { product, factor: capF }
}

function parseProductRef(q: string): ReturnType<typeof productById> | null {
  const lower = q.toLowerCase()
  // prioritise the longest matching name to avoid "Velvet" matching "Velvet Cloud" vs "Emerald Velvet"
  const ranked = [...products].sort((a, b) => b.name.length - a.name.length)
  for (const p of ranked) {
    if (lower.includes(p.name.toLowerCase())) return p
  }
  for (const p of ranked) {
    if (lower.includes(p.name.split(' ')[0].toLowerCase())) return p
  }
  return null
}

const SUGGESTED = [
  'Why is Velvet Cloud Sofa ranked above Leather Power Recliner?',
  'Why is Copenhagen Linen at rank 4?',
  'What if Trendiness were removed for Velvet Cloud Sofa?',
  "Why is Nordic Loft 3-Seater at the top?",
  "Why is Harbor Lounge at rank 12?",
]

export default function ConversationalQA() {
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: 'assistant',
      content: (
        <>
          <p className="font-medium text-ink-900">
            Ask me about any product or pair on the Sofas PLP.
          </p>
          <p className="mt-2">
            I answer three kinds of questions, all grounded in this PLP's pre-computed rank
            counterfactuals (what each product's rank would be if a given factor were removed):
          </p>
          <ul className="ml-4 mt-1 list-disc space-y-0.5 text-[13px]">
            <li>
              <em>Why is a product ranked where it is?</em> (product-level)
            </li>
            <li>
              <em>Why is product X above product Y?</em> (pairwise)
            </li>
            <li>
              <em>What if a factor were removed for product X?</em> (single-factor counterfactual)
            </li>
          </ul>
        </>
      ),
    },
  ])
  const [draft, setDraft] = useState('')

  function send(q: string) {
    setTurns((t) => [...t, { role: 'user', content: q }, { role: 'assistant', content: answer(q) }])
    setDraft('')
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl border border-ink-200 bg-gradient-to-b from-white to-ink-50 shadow-soft">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-600">
            <div className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <Sparkles className="h-3 w-3" />
            </div>
            Ranking explainer · Sofas PLP
          </div>
          <span className="tag">Grounded in RIS + pairwise counterfactuals</span>
        </div>
        <div className="max-h-[560px] space-y-4 overflow-y-auto p-5 scroll-slim">
          {turns.map((t, i) => (
            <Bubble key={i} role={t.role}>
              {t.content}
            </Bubble>
          ))}
        </div>
        <form
          className="flex items-center gap-2 border-t border-ink-100 p-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim()) send(draft.trim())
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about a product or a pair…"
            className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-sm text-white shadow-soft hover:bg-ink-800"
          >
            Send <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            <Wand2 className="h-3.5 w-3.5 text-purple-600" /> Suggested prompts
          </div>
          <div className="mt-3 space-y-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="group block w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-left text-[12px] text-ink-800 transition-colors hover:border-blue-300 hover:bg-white"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-ink-900 p-5 text-ink-100">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
            Context the LLM has
          </div>
          <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-white/80">
            <li>· Each product's rank with and without each of the 4 factors</li>
            <li>· The mental model: think in ranks, competitive position, weighted impact</li>
            <li>· Tone rules: 3–5 sentences, no hedging, no jargon, no model internals</li>
          </ul>
          <div className="mt-4 text-[10px] uppercase tracking-wider text-white/40">
            {products.length} products · {products.length * 4} rank counterfactuals in scope
          </div>
        </div>
      </aside>
    </div>
  )
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  const isUser = role === 'user'
  return (
    <div className={cx('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cx(
          'grid h-7 w-7 shrink-0 place-items-center rounded-full text-white shadow-soft',
          isUser ? 'bg-ink-900' : 'bg-gradient-to-br from-blue-500 to-purple-500',
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cx(
          'max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-soft',
          isUser
            ? 'rounded-tr-sm bg-ink-900 text-white'
            : 'rounded-tl-sm border border-ink-200 bg-white text-ink-700',
        )}
      >
        {children}
      </div>
    </div>
  )
}
