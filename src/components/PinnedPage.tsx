import { Link } from 'react-router-dom'
import { Pin, Trash2, ArrowRight, Bookmark } from 'lucide-react'
import { useAppState } from '@/lib/appState'
import { concepts, conceptById } from '@/data/concepts'
import { cx } from '@/lib/utils'

export function PinnedPage() {
  const { pins, removePin } = useAppState()

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-600">
          Your collection
        </div>
        <div className="flex items-end justify-between">
          <h1 className="display text-5xl text-ink-950">Pinned views.</h1>
          <div className="text-xs text-ink-500">
            {pins.length} pinned
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">
          Build a shortlist of the concept variants you want to bring into a stakeholder
          discussion. Each pin links back to the exact view you saved — same product, same pair,
          same scenario — so nothing shifts between sessions.
        </p>
      </header>

      {pins.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pins.map((pin) => {
            const c = conceptById(pin.conceptId)
            if (!c) return null
            const q = pin.state
              ? '?' +
                new URLSearchParams(
                  Object.fromEntries(
                    Object.entries(pin.state).map(([k, v]) => [
                      k,
                      Array.isArray(v) ? v.join(',') : String(v),
                    ]),
                  ),
                ).toString()
              : ''
            return (
              <article
                key={pin.id}
                className="group relative flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-ink-400">
                    {String(c.number).padStart(2, '0')}
                  </span>
                  <span
                    className={cx(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      c.approach === 'ris'
                        ? 'bg-blue-50 text-blue-700'
                        : c.approach === 'pairwise'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-ink-100 text-ink-700',
                    )}
                  >
                    {c.approach === 'ris' ? 'RIS' : c.approach === 'pairwise' ? 'Pairwise' : 'Hybrid'}
                  </span>
                  <button
                    onClick={() => removePin(pin.id)}
                    className="ml-auto rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-rose-500"
                    title="Remove pin"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="mt-2 text-[15px] font-semibold text-ink-900">{pin.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{pin.subtitle}</p>
                <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3 text-[11px] text-ink-500">
                  <span>
                    Pinned{' '}
                    {new Date(pin.pinnedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Link
                    to={`/concepts/${pin.conceptId}${q}`}
                    className="inline-flex items-center gap-1 text-ink-700 hover:text-ink-900"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center shadow-soft">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-purple-600">
        <Bookmark className="h-5 w-5" />
      </div>
      <h3 className="display mt-4 text-2xl text-ink-900">Nothing pinned yet.</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
        Open any of the 16 concepts and use <span className="inline-flex items-center gap-1 align-middle font-medium text-ink-800"><Pin className="h-3 w-3" /> Pin view</span> in the top-right to add it to your shortlist. Pins remember the specific product, pair, or scenario you were looking at.
      </p>
      <div className="mt-5">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-ink-800"
        >
          Browse the gallery <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

// reference concepts for potential unused import elimination
void concepts
