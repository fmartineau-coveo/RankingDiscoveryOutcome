import { cx } from '@/lib/utils'

type Props = {
  rank: number
  total?: number
  size?: 'sm' | 'md' | 'lg'
  tone?: 'ink' | 'blue' | 'purple'
  className?: string
}

export function RankBadge({ rank, total, size = 'md', tone = 'ink', className }: Props) {
  const sizeCls =
    size === 'sm'
      ? 'h-7 min-w-[3rem] px-2 text-xs'
      : size === 'md'
        ? 'h-9 min-w-[3.75rem] px-3 text-sm'
        : 'h-12 min-w-[5rem] px-4 text-lg'
  const toneCls =
    tone === 'blue'
      ? 'bg-blue-500 text-white ring-blue-200'
      : tone === 'purple'
        ? 'bg-purple-500 text-white ring-purple-200'
        : 'bg-ink-900 text-white ring-ink-300'
  return (
    <div
      className={cx(
        'inline-flex items-baseline gap-1 rounded-lg font-semibold tracking-tight ring-1 ring-inset',
        sizeCls,
        toneCls,
        className,
      )}
    >
      <span className="text-white/60">#</span>
      <span>{rank}</span>
      {total && <span className="pl-0.5 text-[10px] font-medium text-white/60">/ {total}</span>}
    </div>
  )
}
