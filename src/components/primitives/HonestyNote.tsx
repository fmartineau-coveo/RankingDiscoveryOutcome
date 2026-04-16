import { Info } from 'lucide-react'
import { cx } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
  tone?: 'muted' | 'amber'
}

export function HonestyNote({ children, className, tone = 'muted' }: Props) {
  const toneCls =
    tone === 'amber'
      ? 'border-amber-400/60 bg-amber-400/10 text-amber-500'
      : 'border-ink-200 bg-ink-50 text-ink-600'
  return (
    <div
      className={cx(
        'flex gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed',
        toneCls,
        className,
      )}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
