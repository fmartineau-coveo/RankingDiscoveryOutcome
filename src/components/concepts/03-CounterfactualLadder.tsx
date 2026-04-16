import { FACTORS, productById, FOCUS_PRODUCT_ID, type FactorName } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { FactorChip } from '@/components/primitives/FactorChip'
import { cx } from '@/lib/utils'

export default function CounterfactualLadder() {
  const p = productById(FOCUS_PRODUCT_ID)
  const maxRank = 24 // clipped view — deep-list ghosts compressed into a "> 24" row

  const positionFor = (rank: number) => {
    if (rank > maxRank) return { y: 100, clipped: true }
    return { y: ((rank - 1) / (maxRank - 1)) * 100, clipped: false }
  }

  const currentRank = p.factors.Popularity.rankWith
  const current = positionFor(currentRank)

  // Stagger labels vertically when several ghost rows sit within the same band.
  // Sort factors by Y, then push labels apart by a minimum gap.
  const minGapPct = 9
  type LabelRow = { f: FactorName; y: number; labelY: number; rw: number; clipped: boolean }
  const rows: LabelRow[] = FACTORS.map((f) => {
    const rw = p.factors[f].rankWithout
    const pos = positionFor(rw)
    return { f, y: pos.y, labelY: pos.y, rw, clipped: pos.clipped }
  })
    .sort((a, b) => a.y - b.y)
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].labelY - rows[i - 1].labelY < minGapPct) {
      rows[i].labelY = rows[i - 1].labelY + minGapPct
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      {/* Ladder */}
      <div className="rounded-2xl border border-ink-200 bg-gradient-to-b from-white to-ink-50 p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-3">
          <ProductThumb product={p} size="md" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-ink-500">Sofas PLP</div>
            <h3 className="text-lg font-semibold text-ink-900">{p.name}</h3>
            <div className="text-[12px] text-ink-600">
              Currently at rank {currentRank} of 184
            </div>
          </div>
        </div>

        <div className="relative h-[460px] rounded-xl border border-ink-200 bg-white p-3">
          {/* Ruler */}
          <div className="absolute bottom-3 left-3 top-3 w-10 border-r border-ink-100 text-right">
            {[1, 5, 10, 15, 20, 24].map((r) => {
              const top = ((r - 1) / (maxRank - 1)) * 100
              return (
                <div
                  key={r}
                  className="absolute -translate-y-1/2 pr-2 font-mono text-[10px] text-ink-400"
                  style={{ top: `${top}%` }}
                >
                  #{r}
                </div>
              )
            })}
            <div className="absolute bottom-0 pr-2 font-mono text-[10px] text-ink-400">#184</div>
          </div>

          <div className="relative ml-14 h-full">
            {/* Baseline axis */}
            <div className="absolute left-0 right-0 top-0 h-full border-l-2 border-dashed border-ink-200" />

            {/* Current rank marker (solid) */}
            <LadderRow
              top={current.y}
              label={`Current rank #${currentRank}`}
              tone="current"
            />

            {/* Ghost rows per factor */}
            {rows.map((row) => {
              const rw = row.rw
              const tone = rw > currentRank ? 'help' : rw < currentRank ? 'hurt' : 'flat'
              return (
                <LadderRow
                  key={row.f}
                  top={row.y}
                  labelTop={row.labelY}
                  label={`Without ${row.f}`}
                  sub={
                    row.clipped
                      ? `would drop past #${maxRank} (to #${rw})`
                      : rw === currentRank
                        ? 'no movement'
                        : rw > currentRank
                          ? `would drop to #${rw}`
                          : `would move up to #${rw}`
                  }
                  factorTag={row.f}
                  tone={tone}
                  clipped={row.clipped}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            How to read this
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            The solid dark row is where the product sits today. Each dashed row is where it would
            sit if the corresponding factor were removed — <span className="font-medium text-blue-700">blue</span>{' '}
            rows mean the factor is helping (removing it would drop the product), <span className="font-medium text-purple-700">purple</span>{' '}
            rows mean the factor is helping competitors more (removing it would move the product up).
          </p>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Factor breakdown
          </div>
          <div className="mt-3 space-y-2">
            {FACTORS.map((f) => {
              const rw = p.factors[f].rankWithout
              const delta = rw - currentRank
              return (
                <div key={f} className="flex items-center justify-between gap-3">
                  <FactorChip factor={f} tone={delta > 0 ? 'blue' : delta < 0 ? 'purple' : 'muted'} />
                  <div className="flex items-center gap-2 text-[12px] text-ink-600">
                    <span
                      className={cx(
                        'font-mono font-semibold',
                        delta > 0 ? 'text-blue-700' : delta < 0 ? 'text-purple-700' : 'text-ink-400',
                      )}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                    <span className="text-ink-500">positions</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function LadderRow({
  top,
  labelTop,
  label,
  sub,
  factorTag,
  tone,
  clipped,
}: {
  top: number
  labelTop?: number
  label: string
  sub?: string
  factorTag?: string
  tone: 'current' | 'help' | 'hurt' | 'flat'
  clipped?: boolean
}) {
  const colors: Record<string, string> = {
    current: '#11132A',
    help: '#3B68F4',
    hurt: '#7D3EE0',
    flat: '#9096B8',
  }
  const bg: Record<string, string> = {
    current: 'bg-ink-900 text-white',
    help: 'bg-blue-50 text-blue-800 border border-blue-200',
    hurt: 'bg-purple-50 text-purple-800 border border-purple-200',
    flat: 'bg-ink-50 text-ink-600 border border-ink-200',
  }
  const lTop = labelTop ?? top
  return (
    <>
      {/* The line sits at the actual rank position */}
      <div
        className="absolute left-0 right-12 -translate-y-1/2"
        style={{ top: `${top}%` }}
      >
        <div
          className="h-0"
          style={{
            borderTop:
              tone === 'current'
                ? `2.5px solid ${colors.current}`
                : `1.5px dashed ${colors[tone]}`,
          }}
        />
      </div>
      {/* The label is anchored to the adjusted (de-collided) position */}
      <div
        className="absolute right-0 -translate-y-1/2"
        style={{ top: `${lTop}%` }}
      >
        {/* Connector from line to label if offset */}
        {Math.abs(lTop - top) > 0.1 && (
          <div
            className="absolute right-full top-1/2 h-px -translate-y-1/2"
            style={{
              width: 8,
              background: colors[tone as keyof typeof colors] ?? '#BAC0DA',
            }}
          />
        )}
        <div
          className={cx(
            'inline-flex max-w-[260px] items-center gap-2 rounded-md px-2.5 py-1 text-[11px] font-medium shadow-soft',
            bg[tone],
          )}
        >
          {factorTag && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: tone === 'current' ? 'white' : colors[tone] }}
            />
          )}
          <span className="whitespace-nowrap">
            {label}
            {sub && <span className="ml-1 font-normal opacity-80">· {sub}</span>}
            {clipped && <span className="ml-1">↓</span>}
          </span>
        </div>
      </div>
    </>
  )
}
