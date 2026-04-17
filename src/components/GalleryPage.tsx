import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { concepts } from '@/data/concepts'
import { ConceptGallery } from '@/components/ConceptGallery'
import { cx } from '@/lib/utils'

type Filter = 'all' | 'ris' | 'pairwise' | 'enterprise' | 'bold'

export function GalleryPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const filtered = concepts.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'ris') return c.approach === 'ris' || c.approach === 'both'
    if (filter === 'pairwise') return c.approach === 'pairwise' || c.approach === 'both'
    if (filter === 'enterprise') return c.posture === 'enterprise'
    if (filter === 'bold') return c.posture === 'bold'
    return true
  })
  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="mb-2 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-3 w-3" /> Back to overview
        </Link>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-600">
          Gallery
        </div>
        <div className="flex items-end justify-between gap-4">
          <h1 className="display text-5xl text-ink-950">18 concept directions.</h1>
          <div className="hidden text-xs text-ink-500 md:block">
            Showing {filtered.length} of {concepts.length}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(
            [
              ['all', 'All'],
              ['ris', 'Approach 1 · RIS'],
              ['pairwise', 'Approach 2 · Pairwise'],
              ['enterprise', 'Enterprise-ready'],
              ['bold', 'Bold / visionary'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={cx(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                filter === v
                  ? 'border-ink-900 bg-ink-900 text-white shadow-soft'
                  : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ConceptGallery concepts={filtered} />
    </div>
  )
}
