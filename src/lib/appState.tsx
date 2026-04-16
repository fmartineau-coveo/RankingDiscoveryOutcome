import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FOCUS_PRODUCT_ID, PAIRWISE_B_ID } from '@/data/mockData'

export type Pin = {
  id: string // uuid
  conceptId: string
  title: string
  subtitle: string
  pinnedAt: string
  // Optional concept-specific state to restore the visual.
  // Deliberately loose — each concept decides what it needs.
  state?: {
    productId?: string
    pair?: [string, string]
    [k: string]: unknown
  }
}

type AppState = {
  pins: Pin[]
  addPin: (pin: Omit<Pin, 'id' | 'pinnedAt'>) => void
  removePin: (id: string) => void
  isPinned: (conceptId: string, state?: Pin['state']) => boolean
}

const Ctx = createContext<AppState | null>(null)

const STORAGE_KEY = 'coveo.ranking-viz.pins.v1'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function deepEqual(a: unknown, b: unknown) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [pins, setPins] = useState<Pin[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Pin[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pins))
    } catch {
      /* quota; ignore */
    }
  }, [pins])

  const addPin = useCallback((p: Omit<Pin, 'id' | 'pinnedAt'>) => {
    setPins((list) => {
      // Avoid dup pins of the same concept + state
      const exists = list.some(
        (x) => x.conceptId === p.conceptId && deepEqual(x.state, p.state),
      )
      if (exists) return list
      return [
        { ...p, id: uid(), pinnedAt: new Date().toISOString() },
        ...list,
      ]
    })
  }, [])

  const removePin = useCallback((id: string) => {
    setPins((list) => list.filter((x) => x.id !== id))
  }, [])

  const isPinned = useCallback(
    (conceptId: string, state?: Pin['state']) =>
      pins.some((x) => x.conceptId === conceptId && deepEqual(x.state, state)),
    [pins],
  )

  const value = useMemo<AppState>(
    () => ({ pins, addPin, removePin, isPinned }),
    [pins, addPin, removePin, isPinned],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppState() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAppState must be used inside AppStateProvider')
  return v
}

// Sensible defaults used by individual concepts.
export const DEFAULT_FOCUS = FOCUS_PRODUCT_ID
export const DEFAULT_PAIR: [string, string] = [FOCUS_PRODUCT_ID, PAIRWISE_B_ID]
