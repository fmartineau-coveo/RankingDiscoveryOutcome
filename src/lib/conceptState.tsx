import { createContext, useContext, useState, useMemo } from 'react'
import { DEFAULT_FOCUS, DEFAULT_PAIR } from './appState'

/**
 * Small ephemeral context shared by ConceptDetail and its child concept.
 * Lets the concept page capture "what is in focus right now" so the pin
 * button can store it and the URL can restore it.
 */
type ConceptState = {
  focusId: string
  setFocusId: (id: string) => void
  pair: [string, string]
  setPair: (p: [string, string]) => void
  selection: string[]
  setSelection: (ids: string[]) => void
}

const Ctx = createContext<ConceptState | null>(null)

export function ConceptStateProvider({
  children,
  seedFocus,
  seedPair,
  seedSelection,
}: {
  children: React.ReactNode
  seedFocus?: string
  seedPair?: [string, string]
  seedSelection?: string[]
}) {
  const [focusId, setFocusId] = useState(seedFocus ?? DEFAULT_FOCUS)
  const [pair, setPair] = useState<[string, string]>(seedPair ?? DEFAULT_PAIR)
  const [selection, setSelection] = useState<string[]>(seedSelection ?? [])
  const value = useMemo(
    () => ({ focusId, setFocusId, pair, setPair, selection, setSelection }),
    [focusId, pair, selection],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useConceptState() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useConceptState must be used inside ConceptStateProvider')
  return v
}
