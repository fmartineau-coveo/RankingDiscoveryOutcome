import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

/**
 * Lets the user curate the showcase down to the concepts they want to keep.
 *
 * Hiding is reversible and stored in localStorage — the concept registry is
 * never mutated, and concept files are never deleted. Same pattern as the
 * pinned-views and comments stores. Direct URLs like /concepts/:id remain
 * accessible even for hidden concepts; only the navigation surfaces (sidebar
 * + gallery + landing preview) filter them out by default.
 *
 * If the user later decides to hard-delete a concept from the codebase, they
 * can remove its file and registry entry manually; this store will stop
 * referring to the id on the next render and quietly drop stale entries.
 */

type HiddenConceptsState = {
  hidden: string[]
  isHidden: (id: string) => boolean
  hide: (id: string) => void
  unhide: (id: string) => void
  unhideAll: () => void
}

const Ctx = createContext<HiddenConceptsState | null>(null)

const STORAGE_KEY = 'coveo.ranking-viz.hidden-concepts.v1'

export function HiddenConceptsProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden))
    } catch {
      /* quota or privacy mode; ignore */
    }
  }, [hidden])

  const isHidden = useCallback((id: string) => hidden.includes(id), [hidden])

  const hide = useCallback((id: string) => {
    setHidden((list) => (list.includes(id) ? list : [...list, id]))
  }, [])

  const unhide = useCallback((id: string) => {
    setHidden((list) => list.filter((x) => x !== id))
  }, [])

  const unhideAll = useCallback(() => setHidden([]), [])

  const value = useMemo<HiddenConceptsState>(
    () => ({ hidden, isHidden, hide, unhide, unhideAll }),
    [hidden, isHidden, hide, unhide, unhideAll],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useHiddenConcepts() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useHiddenConcepts must be used inside HiddenConceptsProvider')
  return v
}
