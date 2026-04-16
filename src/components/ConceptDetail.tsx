import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react'
import { concepts, conceptById } from '@/data/concepts'
import { ApproachTag, PostureTag } from '@/components/primitives/ApproachTag'
import { HonestyNote } from '@/components/primitives/HonestyNote'
import { ConceptStateProvider } from '@/lib/conceptState'
import { PinButton } from '@/components/primitives/PinButton'
import { useConceptState } from '@/lib/conceptState'
import { productById } from '@/data/mockData'

export function ConceptDetail() {
  const { id } = useParams()
  const [search] = useSearchParams()
  const concept = id ? conceptById(id) : null
  if (!concept) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center text-sm text-ink-600">
        Concept not found.{' '}
        <Link to="/" className="text-blue-600 underline">
          Return to gallery
        </Link>
        .
      </div>
    )
  }
  const index = concepts.findIndex((c) => c.id === concept.id)
  const prev = concepts[(index - 1 + concepts.length) % concepts.length]
  const next = concepts[(index + 1) % concepts.length]

  // Seed concept state from URL params (used when restoring a pin).
  const seedFocus = search.get('productId') ?? undefined
  const seedPairParam = search.get('pair')
  const seedPair = seedPairParam
    ? (seedPairParam.split(',').slice(0, 2) as [string, string])
    : undefined
  const seedSelection = search.get('selection')?.split(',').filter(Boolean)

  const C = concept.Component
  return (
    <ConceptStateProvider
      seedFocus={seedFocus}
      seedPair={seedPair}
      seedSelection={seedSelection}
    >
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800"
          >
            <ArrowLeft className="h-3 w-3" /> All concepts
          </Link>
          <div className="flex gap-1.5">
            <Link
              to={`/concepts/${prev.id}`}
              className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-[11px] text-ink-700 shadow-soft hover:bg-ink-50"
            >
              <ArrowLeft className="h-3 w-3" />
              {String(prev.number).padStart(2, '0')} {prev.title}
            </Link>
            <Link
              to={`/concepts/${next.id}`}
              className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-[11px] text-ink-700 shadow-soft hover:bg-ink-50"
            >
              {String(next.number).padStart(2, '0')} {next.title}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <header className="rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              <span className="font-mono text-ink-400">
                {String(concept.number).padStart(2, '0')} / {String(concepts.length).padStart(2, '0')}
              </span>
              <span className="h-3 w-px bg-ink-300" />
              <ApproachTag approach={concept.approach} />
              <PostureTag posture={concept.posture} />
            </div>
            <PinControls conceptId={concept.id} conceptTitle={concept.title} />
          </div>
          <h1 className="display mt-3 text-5xl leading-[1.05] tracking-tight text-ink-950">
            {concept.title}
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-700">
            {concept.description}
          </p>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-ink-200 bg-gradient-to-br from-blue-50/40 to-purple-50/40 p-4">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
                Merchandiser question
              </div>
              <div className="mt-0.5 text-[15px] font-medium text-ink-900">{concept.question}</div>
            </div>
          </div>
        </header>

        <section className="relative">
          <div className="rounded-2xl border border-ink-200 bg-white shadow-card">
            <div className="border-b border-ink-100 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-500">
              Worked example · Sofas PLP · Q1 2026 catalog
            </div>
            <div className="p-6 md:p-8">
              <C />
            </div>
          </div>
        </section>

        <HonestyNote>
          <span className="font-medium text-ink-800">What this does not claim · </span>
          {concept.notClaimed}
        </HonestyNote>
      </div>
    </ConceptStateProvider>
  )
}

/**
 * Pulls the concept-local state (focus product / pair) and produces a
 * sensibly worded Pin title + subtitle that resumes the exact view. The
 * shape of the snapshot depends on the concept's declared approach:
 *   - 'ris'       → single product
 *   - 'pairwise'  → pair of products
 *   - 'both'      → whichever is set
 */
function PinControls({ conceptId, conceptTitle }: { conceptId: string; conceptTitle: string }) {
  const { focusId, pair, selection } = useConceptState()
  const concept = conceptById(conceptId)!

  const state: Record<string, unknown> = {}
  let subtitle = conceptTitle
  if (concept.approach === 'pairwise' || (concept.approach === 'both' && pair[0] !== pair[1])) {
    state.pair = pair
    subtitle = `${productById(pair[0]).name} vs ${productById(pair[1]).name}`
  } else if (concept.approach === 'ris' || concept.approach === 'both') {
    if (focusId) {
      state.productId = focusId
      subtitle = productById(focusId).name
    }
  }
  if (selection && selection.length) {
    state.selection = selection
    if (!state.productId && !state.pair) {
      subtitle = `${selection.length} products selected`
    }
  }

  return (
    <PinButton
      conceptId={conceptId}
      title={conceptTitle}
      subtitle={subtitle}
      state={Object.keys(state).length ? state : undefined}
    />
  )
}
