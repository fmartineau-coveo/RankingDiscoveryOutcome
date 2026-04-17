import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, EyeOff, Eye, RotateCcw } from 'lucide-react'
import { concepts, type ConceptMeta } from '@/data/concepts'
import { ConceptGallery } from '@/components/ConceptGallery'
import { useHiddenConcepts } from '@/lib/hiddenConcepts'
import { cx } from '@/lib/utils'

type Filter = 'all' | 'ris' | 'pairwise' | 'enterprise' | 'bold'

export function GalleryPage() {
  const [search] = useSearchParams()
  const { hidden, isHidden, unhide, unhideAll } = useHiddenConcepts()
  const defaultShowHidden = search.get('view') === 'hidden'
  const [filter, setFilter] = useState<Filter>('all')
  const [showHidden, setShowHidden] = useState<boolean>(defaultShowHidden)

  const byFilter = useMemo(
    () =>
      concepts.filter((c) => {
        if (filter === 'all') return true
        if (filter === 'ris') return c.approach === 'ris' || c.approach === 'both'
        if (filter === 'pairwise') return c.approach === 'pairwise' || c.approach === 'both'
        if (filter === 'enterprise') return c.posture === 'enterprise'
        if (filter === 'bold') return c.posture === 'bold'
        return true
      }),
    [filter],
  )

  const visible: ConceptMeta[] = byFilter.filter((c) => !isHidden(c.id))
  const hiddenList: ConceptMeta[] = byFilter.filter((c) => isHidden(c.id))

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
          <h1 className="display text-5xl text-ink-950">
            {concepts.length} concept directions.
          </h1>
          <div className="hidden text-xs text-ink-500 md:block">
            Showing {visible.length} of {byFilter.length}
            {hidden.length > 0 && ` · ${hidden.length} hidden`}
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

          {hidden.length > 0 && (
            <>
              <span className="mx-1 h-5 w-px bg-ink-200" />
              <button
                onClick={() => setShowHidden((v) => !v)}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  showHidden
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                )}
              >
                {showHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {showHidden ? 'Hiding hidden ones again' : `Show hidden (${hidden.length})`}
              </button>
              {showHidden && (
                <button
                  onClick={() => {
                    if (confirm(`Restore all ${hidden.length} hidden concepts?`)) unhideAll()
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                >
                  <RotateCcw className="h-3 w-3" /> Restore all
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ConceptGallery concepts={visible} />

      {showHidden && hiddenList.length > 0 && (
        <section className="pt-4">
          <div className="mb-4 flex items-end justify-between border-t border-ink-200 pt-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Hidden from your showcase
              </div>
              <h2 className="display text-3xl text-ink-900">
                {hiddenList.length} {hiddenList.length === 1 ? 'concept' : 'concepts'} hidden
              </h2>
              <p className="mt-1 max-w-2xl text-[13px] text-ink-600">
                These concepts are preserved in the codebase and still reachable by direct URL, but
                don't appear in the sidebar or landing gallery. Restore any of them at any time.
              </p>
            </div>
          </div>
          <div className="opacity-70">
            <ConceptGallery concepts={hiddenList} restorable onRestore={(id) => unhide(id)} />
          </div>
        </section>
      )}

      {visible.length === 0 && !showHidden && hidden.length > 0 && (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-10 text-center">
          <p className="text-[14px] text-ink-700">
            All {byFilter.length} concepts in this filter are hidden.
          </p>
          <button
            onClick={() => setShowHidden(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-800"
          >
            <Eye className="h-3 w-3" /> Show hidden concepts
          </button>
        </div>
      )}
    </div>
  )
}
