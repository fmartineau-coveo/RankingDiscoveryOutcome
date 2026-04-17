import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  COMMENT_ROOT_ATTR,
  eventToPct,
  formatRelative,
  useComments,
  type Comment,
} from '@/lib/comments'
import { Check, MessageSquare, Pencil, Trash2, X, RotateCcw } from 'lucide-react'
import { cx } from '@/lib/utils'

type Draft = { xPct: number; yPct: number } | null

/**
 * Renders the full annotations layer on top of the scrollable main column:
 * - handles click-to-drop when mode === 'placing'
 * - renders every comment for the current page as a numbered pin
 * - renders the composer for a fresh draft
 * - renders the editor/viewer popover when a pin is active
 */
export function CommentsLayer({ pageLabel }: { pageLabel: string }) {
  const loc = useLocation()
  const pageKey = loc.pathname
  const {
    mode,
    setMode,
    hiddenResolved,
    commentsForPage,
    addComment,
    updateComment,
    removeComment,
  } = useComments()

  const visibleAll = commentsForPage(pageKey)
  const visible = hiddenResolved ? visibleAll.filter((c) => !c.resolved) : visibleAll

  const [draft, setDraft] = useState<Draft>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  // Capture a ref to the comment-root (the <main> element in Shell).
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[${COMMENT_ROOT_ATTR}]`)
    rootRef.current = el
  })

  // Click-to-drop when placing.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (mode !== 'placing') return

    function onClick(e: MouseEvent) {
      // Don't drop when the click is inside a comment pin, the composer, or any interactive
      // popover element — those handle their own events.
      const t = e.target as HTMLElement | null
      if (t && t.closest('[data-comments-ui]')) return
      e.preventDefault()
      e.stopPropagation()
      const pct = eventToPct(e, root!)
      setDraft(pct)
      setActiveId(null)
    }
    root.addEventListener('click', onClick, true)
    return () => root.removeEventListener('click', onClick, true)
  }, [mode])

  // Close composer / popover on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (draft) setDraft(null)
      else if (activeId) setActiveId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [draft, activeId])

  // When placing is toggled off, clear any in-flight draft.
  useEffect(() => {
    if (mode !== 'placing' && draft) setDraft(null)
  }, [mode, draft])

  // Side-effect: set crosshair cursor on <main> while placing.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (mode === 'placing') {
      root.classList.add('cursor-crosshair')
    } else {
      root.classList.remove('cursor-crosshair')
    }
    return () => root.classList.remove('cursor-crosshair')
  }, [mode])

  function numberFor(c: Comment): number {
    // Order pins by createdAt ascending so earlier pins are #1, #2, …
    const ordered = [...visible].sort((a, b) => a.createdAt - b.createdAt)
    return ordered.findIndex((x) => x.id === c.id) + 1
  }

  return (
    <>
      {/* Mode banner */}
      {mode === 'placing' && (
        <div
          data-comments-ui
          className="pointer-events-none fixed inset-x-0 top-14 z-40 flex justify-center"
        >
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-purple-300 bg-white/95 px-4 py-1.5 text-[12px] shadow-card backdrop-blur">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-purple-500 text-white">
              <MessageSquare className="h-3 w-3" />
            </span>
            <span className="text-ink-800">
              <strong>Comment mode.</strong> Click anywhere on the page to drop a comment.
            </span>
            <button
              onClick={() => setMode('idle')}
              className="rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[11px] text-ink-700 hover:bg-ink-50"
            >
              Done
            </button>
            <span className="kbd">Esc</span>
          </div>
        </div>
      )}

      {/* Existing pins */}
      {visible.map((c) => (
        <Pin
          key={c.id}
          comment={c}
          num={numberFor(c)}
          active={activeId === c.id}
          dimmed={c.resolved}
          onOpen={() => {
            setActiveId(c.id)
            setDraft(null)
            setMode('idle')
          }}
          onClose={() => setActiveId(null)}
          onUpdate={(patch) => updateComment(c.id, patch)}
          onDelete={() => {
            removeComment(c.id)
            setActiveId(null)
          }}
        />
      ))}

      {/* New-comment composer */}
      {draft && (
        <Composer
          xPct={draft.xPct}
          yPct={draft.yPct}
          onCancel={() => setDraft(null)}
          onSave={(body) => {
            if (!body.trim()) {
              setDraft(null)
              return
            }
            addComment({
              pageKey,
              pageLabel,
              xPct: draft.xPct,
              yPct: draft.yPct,
              body: body.trim(),
            })
            setDraft(null)
            setMode('idle')
          }}
        />
      )}
    </>
  )
}

function Pin({
  comment,
  num,
  active,
  dimmed,
  onOpen,
  onClose,
  onUpdate,
  onDelete,
}: {
  comment: Comment
  num: number
  active: boolean
  dimmed: boolean
  onOpen: () => void
  onClose: () => void
  onUpdate: (patch: Partial<Pick<Comment, 'body' | 'resolved'>>) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.body)

  // Reset local draft if the underlying comment body changes externally.
  useEffect(() => setDraft(comment.body), [comment.body])

  return (
    <>
      {/* Pin dot */}
      <button
        data-comments-ui
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
        className={cx(
          'group absolute z-30 -translate-x-1/2 -translate-y-full transition-transform',
          active && 'scale-110',
          dimmed && !active && 'opacity-50 hover:opacity-100',
        )}
        style={{ left: `${comment.xPct}%`, top: `${comment.yPct}%` }}
        title={comment.body}
      >
        <span className="block">
          <span
            className={cx(
              'grid h-7 w-7 place-items-center rounded-full rounded-bl-sm border-2 border-white font-mono text-[11px] font-semibold text-white shadow-lift',
              comment.resolved
                ? 'bg-ink-400'
                : 'bg-gradient-to-br from-purple-500 to-blue-500',
            )}
          >
            {num}
          </span>
          <span
            aria-hidden
            className="absolute -bottom-[3px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-l-2 border-white bg-gradient-to-br from-purple-500 to-blue-500"
            style={{
              background: comment.resolved ? '#9096B8' : undefined,
            }}
          />
        </span>
      </button>

      {/* Popover */}
      {active && (
        <div
          data-comments-ui
          onClick={(e) => e.stopPropagation()}
          className="absolute z-40 w-80 -translate-x-1/2 rounded-2xl border border-ink-200 bg-white shadow-lift"
          style={{
            left: `${comment.xPct}%`,
            top: `calc(${comment.yPct}% + 10px)`,
          }}
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5 text-[11px] text-ink-500">
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  'grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] font-semibold text-white',
                  comment.resolved ? 'bg-ink-400' : 'bg-gradient-to-br from-purple-500 to-blue-500',
                )}
              >
                {num}
              </span>
              <span className="font-medium text-ink-700">
                {comment.resolved ? 'Resolved comment' : 'Comment'}
              </span>
              <span className="text-ink-400">· {formatRelative(comment.createdAt)}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="px-4 py-3">
            {editing ? (
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    onUpdate({ body: draft })
                    setEditing(false)
                  }
                  if (e.key === 'Escape') {
                    setDraft(comment.body)
                    setEditing(false)
                  }
                }}
                className="min-h-[84px] w-full resize-y rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-ink-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
            ) : (
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-800">
                {comment.body}
              </p>
            )}
            {comment.updatedAt !== comment.createdAt && !editing && (
              <div className="mt-1.5 text-[10px] text-ink-400">
                Edited {formatRelative(comment.updatedAt)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-ink-100 bg-ink-50 px-3 py-2">
            {editing ? (
              <div className="flex w-full items-center justify-end gap-1.5">
                <button
                  onClick={() => {
                    setDraft(comment.body)
                    setEditing(false)
                  }}
                  className="rounded-md border border-ink-200 bg-white px-2.5 py-1 text-[11px] text-ink-700 hover:bg-ink-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdate({ body: draft.trim() || comment.body })
                    setEditing(false)
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-ink-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-ink-800"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] text-ink-700 hover:bg-ink-50"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => onUpdate({ resolved: !comment.resolved })}
                    className={cx(
                      'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]',
                      comment.resolved
                        ? 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                        : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
                    )}
                  >
                    {comment.resolved ? (
                      <>
                        <RotateCcw className="h-3 w-3" /> Reopen
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" /> Resolve
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Delete this comment? This cannot be undone.')) onDelete()
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] text-ink-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function Composer({
  xPct,
  yPct,
  onCancel,
  onSave,
}: {
  xPct: number
  yPct: number
  onCancel: () => void
  onSave: (body: string) => void
}) {
  const [body, setBody] = useState('')
  return (
    <>
      {/* Ghost pin showing where it'll land */}
      <div
        data-comments-ui
        className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full"
        style={{ left: `${xPct}%`, top: `${yPct}%` }}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full rounded-bl-sm border-2 border-white bg-gradient-to-br from-purple-500 to-blue-500 font-mono text-[11px] font-semibold text-white shadow-lift">
          +
        </span>
      </div>

      <div
        data-comments-ui
        onClick={(e) => e.stopPropagation()}
        className="absolute z-40 w-80 -translate-x-1/2 rounded-2xl border border-ink-200 bg-white shadow-lift"
        style={{ left: `${xPct}%`, top: `calc(${yPct}% + 10px)` }}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-purple-700">
            <MessageSquare className="h-3 w-3" />
            New comment
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="px-4 py-3">
          <textarea
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your comment…"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onSave(body)
              if (e.key === 'Escape') onCancel()
            }}
            className="min-h-[96px] w-full resize-y rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-ink-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
          <div className="mt-1.5 text-[10px] text-ink-500">
            <span className="kbd">⌘</span>
            <span className="mx-1 text-ink-400">+</span>
            <span className="kbd">Enter</span>
            <span className="ml-2">to save</span>
            <span className="mx-2 text-ink-300">·</span>
            <span className="kbd">Esc</span>
            <span className="ml-2">to cancel</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50 px-3 py-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-ink-200 bg-white px-2.5 py-1 text-[11px] text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(body)}
            disabled={!body.trim()}
            className="inline-flex items-center gap-1 rounded-md bg-ink-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-ink-800 disabled:opacity-50"
          >
            Save comment
          </button>
        </div>
      </div>
    </>
  )
}
