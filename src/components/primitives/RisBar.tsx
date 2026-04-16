import { risToneHex, formatRis } from '@/lib/ris'
import { cx } from '@/lib/utils'

type Props = {
  ris: number
  height?: number
  width?: number
  showZero?: boolean
  className?: string
}

/**
 * A diverging horizontal bar centred on zero. RIS in [-1, +1].
 * Positive extends to the right (blue family). Negative extends left (purple family).
 */
export function RisBar({ ris, height = 10, width = 220, showZero = true, className }: Props) {
  const half = width / 2
  const clamped = Math.max(-1, Math.min(1, ris))
  const px = Math.abs(clamped) * half
  const color = risToneHex(clamped)
  return (
    <div
      className={cx('relative', className)}
      style={{ width, height }}
      aria-label={`impact ${formatRis(ris)}`}
    >
      {/* Track */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'rgba(17, 19, 42, 0.06)' }}
      />
      {/* Bar */}
      <div
        className="absolute top-0 h-full rounded-full"
        style={{
          left: clamped >= 0 ? half : half - px,
          width: px,
          background: color,
          boxShadow: `0 0 0 1px ${color}22`,
        }}
      />
      {/* Zero marker */}
      {showZero && (
        <div
          className="absolute top-1/2 h-3 -translate-y-1/2 border-l border-dashed border-ink-300"
          style={{ left: half }}
        />
      )}
    </div>
  )
}
