import { useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MessageSquare,
  MessagesSquare,
  X,
  Check,
  EyeOff,
  Eye,
  Download,
  Upload,
  Trash2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { formatRelative, useComments, type Comment } from '@/lib/comments'
import { cx } from '@/lib/utils'

/**
 * Toolbar button used in the Shell top bar. Handles:
 *  - toggling placing-mode (click the "New comment" half)
 *  - opening/closing the browse panel (click the count badge)
 */
export function CommentsToolbar() {
  const { comments, mode, toggleMode } = useComments()
  const [panelOpen, setPanelOpen] = useState(false)
  const unresolved = comments.filter((c) => !c.resolved).length

  return (
    <>
      <div className="inline-flex items-stretch overflow-hidden rounded-md border border-ink-200 bg-white shadow-soft">
        <button
          onClick={toggleMode}
          className={cx(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors',
            mode === 'placing'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              : 'text-ink-700 hover:bg-ink-50',
          )}
          title={mode === 'placing' ? 'Exit comment mode' : 'Drop a comment on the page'}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {mode === 'placing' ? 'Placing…' : 'Comment'}
        </button>
        <span className="w-px bg-ink-200" />
        <button
          onClick={() => setPanelOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-ink-700 hover:bg-ink-50"
          title="Open comments panel"
        >
          <MessagesSquare className="h-3.5 w-3.5" />
          <span className="hidden md:inline">All</span>
          <span
            className={cx(
              'grid min-w-[1rem] place-items-center rounded-full px-1 font-mono text-[10px] font-semibold',
              unresolved > 0
                ? 'bg-purple-500 text-white'
                : 'bg-ink-100 text-ink-600',
            )}
          >
            {comments.length}
          </span>
        </button>
      </div>

      {panelOpen && <CommentsPanel onClose={() => setPanelOpen(false)} />}
    </>
  )
}

function CommentsPanel({ onClose }: { onClose: () => void }) {
  const {
    comments,
    hiddenResolved,
    setHiddenResolved,
    updateComment,
    removeComment,
    clearAll,
    exportJson,
    importJson,
  } = useComments()
  const nav = useNavigate()
  const loc = useLocation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  const visible = useMemo(
    () => (hiddenResolved ? comments.filter((c) => !c.resolved) : comments),
    [comments, hiddenResolved],
  )

  // Group by page label for the list.
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; key: string; items: Comment[] }>()
    for (const c of visible) {
      if (!map.has(c.pageKey))
        map.set(c.pageKey, { label: c.pageLabel || c.pageKey, key: c.pageKey, items: [] })
      map.get(c.pageKey)!.items.push(c)
    }
    for (const g of map.values()) g.items.sort((a, b) => b.updatedAt - a.updatedAt)
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [visible])

  function onExport() {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ranking-viz-comments-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function onImportClick() {
    fileRef.current?.click()
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const res = importJson(text)
      setImportMsg(
        res.ok
          ? `Imported ${res.added} comment${res.added === 1 ? '' : 's'}.`
          : `Import failed: ${res.error ?? 'unknown error'}`,
      )
      setTimeout(() => setImportMsg(null), 3500)
    }
    reader.readAsText(file)
    // Reset so the same file can be chosen again.
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-[60] h-screen w-screen" data-comments-ui>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Comments"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-ink-200 bg-white shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-600">
              <MessagesSquare className="h-3 w-3" /> Comments
            </div>
            <h2 className="display mt-1 text-2xl text-ink-900">
              {comments.length === 0
                ? 'No comments yet.'
                : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-ink-200 bg-white p-1.5 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-5 py-3">
          <button
            onClick={() => setHiddenResolved(!hiddenResolved)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]',
              hiddenResolved
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
            )}
            title={hiddenResolved ? 'Show resolved comments' : 'Hide resolved comments'}
          >
            {hiddenResolved ? (
              <>
                <EyeOff className="h-3 w-3" /> Hide resolved
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" /> Show resolved
              </>
            )}
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] text-ink-700 hover:bg-ink-50"
            disabled={comments.length === 0}
          >
            <Download className="h-3 w-3" /> Export JSON
          </button>
          <button
            onClick={onImportClick}
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] text-ink-700 hover:bg-ink-50"
          >
            <Upload className="h-3 w-3" /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onImportFile}
          />
          <button
            onClick={() => {
              if (comments.length === 0) return
              if (
                confirm(
                  `Remove all ${comments.length} comments? This cannot be undone.`,
                )
              ) {
                clearAll()
              }
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] text-ink-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            disabled={comments.length === 0}
          >
            <Trash2 className="h-3 w-3" /> Clear all
          </button>
        </div>

        {importMsg && (
          <div className="border-b border-ink-100 bg-blue-50 px-5 py-2 text-[12px] text-blue-800">
            {importMsg}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto scroll-slim">
          {grouped.length === 0 ? (
            <EmptyState />
          ) : (
            grouped.map((group) => (
              <section key={group.key} className="border-b border-ink-100">
                <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-5 py-2 backdrop-blur">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    {group.label}
                  </div>
                  <button
                    onClick={() => {
                      if (loc.pathname !== group.key) nav(group.key)
                      onClose()
                    }}
                    className="inline-flex items-center gap-0.5 text-[11px] text-ink-500 hover:text-ink-900"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <ul>
                  {group.items.map((c) => (
                    <li
                      key={c.id}
                      className={cx(
                        'group flex gap-3 border-t border-ink-100 px-5 py-3 text-[13px] first:border-t-0',
                        c.resolved && 'bg-ink-50/60',
                      )}
                    >
                      <span
                        className={cx(
                          'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full rounded-bl-sm font-mono text-[10px] font-semibold text-white',
                          c.resolved
                            ? 'bg-ink-400'
                            : 'bg-gradient-to-br from-purple-500 to-blue-500',
                        )}
                      >
                        #
                      </span>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => {
                            if (loc.pathname !== c.pageKey) nav(c.pageKey)
                            onClose()
                          }}
                          className="block w-full text-left"
                        >
                          <p
                            className={cx(
                              'whitespace-pre-wrap leading-relaxed',
                              c.resolved ? 'text-ink-500 line-through' : 'text-ink-800',
                            )}
                          >
                            {c.body}
                          </p>
                          <div className="mt-1 text-[10px] text-ink-400">
                            {formatRelative(c.createdAt)}
                            {c.updatedAt !== c.createdAt && (
                              <> · edited {formatRelative(c.updatedAt)}</>
                            )}
                          </div>
                        </button>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <button
                            onClick={() => updateComment(c.id, { resolved: !c.resolved })}
                            className={cx(
                              'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]',
                              c.resolved
                                ? 'border-ink-200 bg-white text-ink-600'
                                : 'border-blue-200 bg-blue-50 text-blue-700',
                            )}
                          >
                            {c.resolved ? (
                              <>
                                <RotateCcw className="h-2.5 w-2.5" /> Reopen
                              </>
                            ) : (
                              <>
                                <Check className="h-2.5 w-2.5" /> Resolve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this comment?')) removeComment(c.id)
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] text-ink-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <footer className="border-t border-ink-100 bg-ink-50 px-5 py-3 text-[11px] text-ink-500">
          Comments live in this browser only (localStorage). Export to share a review pass.
        </footer>
      </aside>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600">
        <MessageSquare className="h-5 w-5" />
      </div>
      <h3 className="display mt-4 text-xl text-ink-900">No comments yet.</h3>
      <p className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed text-ink-600">
        Click the <strong>Comment</strong> button in the top bar and then click anywhere on the
        page to drop one.
      </p>
    </div>
  )
}
