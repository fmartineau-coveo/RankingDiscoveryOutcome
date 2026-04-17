import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

/**
 * Comment annotations overlaid on the app.
 *
 * A comment is anchored to (a) a pageKey — the route pathname it was dropped
 * on — and (b) a relative (x, y) position expressed in percent of the main
 * content area's scroll box. Storing percentages lets the pins survive window
 * resizes; storing against scrollHeight lets them survive scroll.
 *
 * Persistence: localStorage, same pattern as AppStateProvider. No backend;
 * comments are per-browser. Export / import JSON is provided for sharing a
 * review pass with someone else.
 */

export type Comment = {
  id: string
  pageKey: string
  pageLabel: string
  /** Percentage of the comment-root's scrollWidth  (0..100). */
  xPct: number
  /** Percentage of the comment-root's scrollHeight (0..100). */
  yPct: number
  body: string
  resolved: boolean
  createdAt: number
  updatedAt: number
}

type CommentInput = {
  pageKey: string
  pageLabel: string
  xPct: number
  yPct: number
  body: string
}

export type CommentMode = 'idle' | 'placing'

type CommentsState = {
  comments: Comment[]
  mode: CommentMode
  hiddenResolved: boolean
  setMode: (m: CommentMode) => void
  toggleMode: () => void
  setHiddenResolved: (h: boolean) => void

  addComment: (c: CommentInput) => Comment
  updateComment: (id: string, patch: Partial<Pick<Comment, 'body' | 'resolved' | 'xPct' | 'yPct'>>) => void
  removeComment: (id: string) => void
  clearAll: () => void

  exportJson: () => string
  importJson: (raw: string) => { ok: boolean; added: number; error?: string }

  commentsForPage: (pageKey: string) => Comment[]
}

const Ctx = createContext<CommentsState | null>(null)

const STORAGE_KEY = 'coveo.ranking-viz.comments.v1'

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function CommentsProvider({ children }: { children: React.ReactNode }) {
  const [comments, setComments] = useState<Comment[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      // Filter to well-formed shapes; tolerate unknown extra fields.
      return parsed.filter(
        (c): c is Comment =>
          !!c &&
          typeof c.id === 'string' &&
          typeof c.pageKey === 'string' &&
          typeof c.xPct === 'number' &&
          typeof c.yPct === 'number' &&
          typeof c.body === 'string',
      )
    } catch {
      return []
    }
  })
  const [mode, setMode] = useState<CommentMode>('idle')
  const [hiddenResolved, setHiddenResolved] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments))
    } catch {
      /* quota or privacy mode; ignore */
    }
  }, [comments])

  const addComment = useCallback((c: CommentInput): Comment => {
    const now = Date.now()
    const created: Comment = {
      id: uid(),
      pageKey: c.pageKey,
      pageLabel: c.pageLabel,
      xPct: c.xPct,
      yPct: c.yPct,
      body: c.body,
      resolved: false,
      createdAt: now,
      updatedAt: now,
    }
    setComments((list) => [created, ...list])
    return created
  }, [])

  const updateComment = useCallback(
    (
      id: string,
      patch: Partial<Pick<Comment, 'body' | 'resolved' | 'xPct' | 'yPct'>>,
    ) => {
      setComments((list) =>
        list.map((c) =>
          c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
        ),
      )
    },
    [],
  )

  const removeComment = useCallback((id: string) => {
    setComments((list) => list.filter((c) => c.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setComments([])
  }, [])

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'placing' ? 'idle' : 'placing'))
  }, [])

  const exportJson = useCallback(() => {
    return JSON.stringify({ version: 1, exportedAt: Date.now(), comments }, null, 2)
  }, [comments])

  const importJson = useCallback(
    (raw: string): { ok: boolean; added: number; error?: string } => {
      try {
        const parsed = JSON.parse(raw)
        const incoming: Comment[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.comments)
            ? parsed.comments
            : []
        if (!incoming.length) return { ok: false, added: 0, error: 'No comments found in payload.' }
        const valid = incoming.filter(
          (c): c is Comment =>
            !!c &&
            typeof c.id === 'string' &&
            typeof c.pageKey === 'string' &&
            typeof c.xPct === 'number' &&
            typeof c.yPct === 'number' &&
            typeof c.body === 'string',
        )
        if (!valid.length) return { ok: false, added: 0, error: 'No well-formed comments in payload.' }
        // Merge by id; incoming wins.
        setComments((list) => {
          const byId = new Map<string, Comment>(list.map((c) => [c.id, c]))
          for (const c of valid) byId.set(c.id, c)
          return Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt)
        })
        return { ok: true, added: valid.length }
      } catch (e) {
        return { ok: false, added: 0, error: (e as Error).message }
      }
    },
    [],
  )

  const commentsForPage = useCallback(
    (pageKey: string) => comments.filter((c) => c.pageKey === pageKey),
    [comments],
  )

  // Global Escape cancels placing-mode.
  useEffect(() => {
    if (mode !== 'placing') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMode('idle')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode])

  const value = useMemo<CommentsState>(
    () => ({
      comments,
      mode,
      hiddenResolved,
      setMode,
      toggleMode,
      setHiddenResolved,
      addComment,
      updateComment,
      removeComment,
      clearAll,
      exportJson,
      importJson,
      commentsForPage,
    }),
    [
      comments,
      mode,
      hiddenResolved,
      toggleMode,
      addComment,
      updateComment,
      removeComment,
      clearAll,
      exportJson,
      importJson,
      commentsForPage,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useComments() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useComments must be used inside CommentsProvider')
  return v
}

/** Attribute that marks the scroll box comments are anchored to. */
export const COMMENT_ROOT_ATTR = 'data-comment-root'

/**
 * Convert a MouseEvent to (xPct, yPct) relative to a given container element.
 * Uses scrollWidth / scrollHeight so the percentages survive scroll position.
 */
export function eventToPct(e: MouseEvent, container: HTMLElement): { xPct: number; yPct: number } {
  const rect = container.getBoundingClientRect()
  // Absolute position within the container's scroll box:
  const x = e.clientX - rect.left + container.scrollLeft
  const y = e.clientY - rect.top + container.scrollTop
  const xPct = (x / Math.max(1, container.scrollWidth)) * 100
  const yPct = (y / Math.max(1, container.scrollHeight)) * 100
  return {
    xPct: Math.max(0, Math.min(100, xPct)),
    yPct: Math.max(0, Math.min(100, yPct)),
  }
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.round(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
