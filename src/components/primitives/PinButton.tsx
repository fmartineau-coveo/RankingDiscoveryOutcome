import { Pin, PinOff, Check } from 'lucide-react'
import { useAppState } from '@/lib/appState'
import { cx } from '@/lib/utils'
import { useState } from 'react'

type Props = {
  conceptId: string
  title: string
  subtitle: string
  state?: Parameters<ReturnType<typeof useAppState>['addPin']>[0]['state']
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Pin / unpin the current concept view (with optional state snapshot).
 * Storing state lets /pinned restore a specific focus product or pair.
 */
export function PinButton({ conceptId, title, subtitle, state, size = 'md', className }: Props) {
  const { addPin, removePin, isPinned, pins } = useAppState()
  const pinned = isPinned(conceptId, state)
  const [flash, setFlash] = useState(false)
  const match = pins.find(
    (p) => p.conceptId === conceptId && JSON.stringify(p.state ?? null) === JSON.stringify(state ?? null),
  )

  function handle() {
    if (pinned && match) {
      removePin(match.id)
    } else {
      addPin({ conceptId, title, subtitle, state })
      setFlash(true)
      setTimeout(() => setFlash(false), 1400)
    }
  }

  return (
    <button
      onClick={handle}
      className={cx(
        'group inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
        pinned
          ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
          : 'border-ink-200 bg-white text-ink-700 shadow-soft hover:bg-ink-50',
        size === 'sm' && 'px-2 py-1 text-[11px]',
        className,
      )}
      title={pinned ? 'Unpin this view' : 'Pin this view to your collection'}
    >
      {flash ? (
        <>
          <Check className="h-3 w-3" /> Pinned
        </>
      ) : pinned ? (
        <>
          <PinOff className="h-3 w-3" /> Pinned
        </>
      ) : (
        <>
          <Pin className="h-3 w-3" /> Pin view
        </>
      )}
    </button>
  )
}
