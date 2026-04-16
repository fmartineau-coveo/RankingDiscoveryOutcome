import type { FactorName } from '@/data/mockData'
import { factorGlyph } from '@/lib/ris'
import { cx } from '@/lib/utils'

type Props = {
  factor: FactorName
  size?: 'sm' | 'md'
  tone?: 'default' | 'blue' | 'purple' | 'muted'
  className?: string
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  default: 'border-ink-200 bg-white text-ink-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
  muted: 'border-ink-200 bg-ink-50 text-ink-600',
}

export function FactorChip({ factor, size = 'md', tone = 'default', className }: Props) {
  const sizeCls =
    size === 'sm'
      ? 'h-5 text-[11px] px-2'
      : 'h-7 text-xs px-2.5'
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        sizeCls,
        TONE[tone],
        className,
      )}
    >
      <span
        className={cx(
          'grid place-items-center rounded-full font-semibold',
          size === 'sm' ? 'h-3.5 w-3.5 text-[9px]' : 'h-4 w-4 text-[10px]',
          tone === 'purple'
            ? 'bg-purple-500 text-white'
            : tone === 'muted'
              ? 'bg-ink-200 text-ink-700'
              : 'bg-blue-500 text-white',
        )}
      >
        {factorGlyph(factor)}
      </span>
      {factor}
    </span>
  )
}
