import { useMemo, useState } from 'react'
import { FACTORS, products, productById, dominantAbsFactor, topNegativeFactor, narrativeForPair, type FactorName } from '@/data/mockData'
import { ProductThumb } from '@/components/primitives/ProductTile'
import { RankBadge } from '@/components/primitives/RankBadge'
import { RisBar } from '@/components/primitives/RisBar'
import { FactorChip } from '@/components/primitives/FactorChip'
import { formatRis } from '@/lib/ris'
import { cx } from '@/lib/utils'
import { MousePointer2, X } from 'lucide-react'
import { useConceptState } from '@/lib/conceptState'

export default function AmbientPlpOverlay() {
  const { pair, setPair } = useConceptState()
  const [hover, setHover] = useState<string | null>(null)
  const [factorHover, setFactorHover] = useState<FactorName | null>(null)

  const selected: string[] = useMemo(
    () => [pair[0], pair[1]].filter(Boolean),
    [pair],
  )

  function toggleSelect(id: string) {
    if (selected[0] === id || selected[1] === id) {
      // Remove
      if (selected[0] === id) setPair([selected[1] ?? id, selected[1] ?? id])
      else setPair([selected[0], selected[0]])
    } else {
      setPair([selected[1] ?? id, id])
    }
  }

  const grid = products.slice(0, 12)
  const hasBoth = selected.length === 2 && selected[0] !== selected[1]
  const A = hasBoth ? productById(selected[0]) : null
  const B = hasBoth ? productById(selected[1]) : null

  // Rank factors by how much they're doing in this pair — highlight the top one.
  const factorWork = useMemo(() => {
    if (!A || !B)
      return {} as Record<FactorName, { score: number; label: string; aRis: number; bRis: number }>
    const out = {} as Record<FactorName, { score: number; label: string; aRis: number; bRis: number }>
    for (const f of FACTORS) {
      const dA = A.factors[f].rankWithout - A.factors[f].rankWith
      const dB = B.factors[f].rankWithout - B.factors[f].rankWith
      const score = Math.abs(dA - dB) + (Math.abs(dA) + Math.abs(dB)) * 0.3
      out[f] = {
        score,
        label:
          Math.sign(dA) !== Math.sign(dB) && dA !== 0 && dB !== 0
            ? 'Opposite directions — asymmetric'
            : Math.abs(dA) > Math.abs(dB) * 2
              ? `Moves ${A.name} much more than ${B.name}`
              : Math.abs(dB) > Math.abs(dA) * 2
                ? `Moves ${B.name} much more than ${A.name}`
                : Math.abs(dA - dB) < 2
                  ? 'Minor; not driving the gap'
                  : `Favours ${Math.abs(dA) > Math.abs(dB) ? A.name : B.name}`,
        aRis: A.factors[f].ris,
        bRis: B.factors[f].ris,
      }
    }
    return out
  }, [A, B])

  const topFactor = useMemo(
    () =>
      Object.entries(factorWork)
        .sort((a, b) => b[1].score - a[1].score)
        .map(([k]) => k as FactorName)[0],
    [factorWork],
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-3 shadow-soft">
        <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[11px] text-ink-500">
          <div className="flex items-center gap-2">
            <MousePointer2 className="h-3 w-3" /> Merch tool · PLP preview · sofas
          </div>
          <div className="flex items-center gap-3">
            <span>Hover a tile to see impact</span>
            <span className="h-3 w-px bg-ink-300" />
            <span>Click two to compare</span>
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-4 gap-3">
          {grid.map((p) => {
            const isSel = selected.includes(p.id)
            const isHover = hover === p.id
            return (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                className={cx(
                  'group relative rounded-xl border bg-white p-3 text-left transition-all',
                  isSel
                    ? 'border-purple-500 shadow-glow'
                    : isHover
                      ? 'border-blue-400 shadow-card'
                      : 'border-ink-200',
                )}
              >
                <div className="relative">
                  <ProductThumb product={p} size="md" className="!w-full !h-24" />
                  <div className="absolute right-1.5 top-1.5">
                    <RankBadge rank={p.factors.Popularity.rankWith} size="sm" tone={isSel ? 'purple' : 'ink'} />
                  </div>
                  {isSel && (
                    <div className="absolute left-1.5 top-1.5 rounded-md bg-purple-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {selected.indexOf(p.id) === 0 ? 'A' : 'B'}
                    </div>
                  )}
                </div>
                <div className="mt-2 truncate text-[12px] font-medium text-ink-900">{p.name}</div>
                <div className="text-[11px] text-ink-500">{p.priceLabel}</div>

                {isHover && <HoverCard product={p} />}
              </button>
            )
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Pairwise panel
          </div>
          <button
            onClick={() => {
              const first = selected[0]
              if (first) setPair([first, first])
            }}
            className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-[11px] text-ink-600 hover:bg-ink-50"
          >
            <X className="h-3 w-3" /> Clear B
          </button>
        </div>

        {!hasBoth ? (
          <div className="mt-4 rounded-xl border border-dashed border-ink-300 bg-ink-50 p-5 text-center text-[12px] text-ink-500">
            Pick two different products on the grid to generate a pairwise narrative here.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[A!, B!].map((p, i) => (
                <div
                  key={p.id}
                  className={cx(
                    'rounded-lg border p-2',
                    i === 0 ? 'border-blue-200 bg-blue-50/40' : 'border-purple-200 bg-purple-50/40',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ProductThumb product={p} size="xs" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-semibold">{p.name}</div>
                      <div className="text-[10px] text-ink-500">#{p.factors.Popularity.rankWith}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-[12.5px] leading-relaxed text-ink-800">
              <p className="font-medium text-ink-900">
                {narrativeForPair(A!, B!).headline}
              </p>
            </div>

            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Hover a factor to see what it's doing
              </div>
              <div className="space-y-1.5">
                {FACTORS.map((f) => {
                  const isTop = f === topFactor
                  const isHover = factorHover === f
                  const data = factorWork[f]
                  if (!data) return null
                  return (
                    <div
                      key={f}
                      onMouseEnter={() => setFactorHover(f)}
                      onMouseLeave={() => setFactorHover(null)}
                      className={cx(
                        'group relative rounded-lg border px-2.5 py-2 transition-all',
                        isHover
                          ? 'border-ink-900 bg-ink-50 shadow-soft'
                          : isTop
                            ? 'border-purple-300 bg-purple-50/40'
                            : 'border-ink-100 bg-white',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <FactorChip factor={f} size="sm" tone={isTop ? 'purple' : 'muted'} />
                        {isTop && (
                          <span className="rounded-full bg-purple-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                            Doing the most work
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-2 text-[11px]">
                          <span className="font-mono text-blue-700">{formatRis(data.aRis)}</span>
                          <span className="text-ink-400">vs</span>
                          <span className="font-mono text-purple-700">{formatRis(data.bRis)}</span>
                        </div>
                      </div>
                      {(isHover || isTop) && (
                        <div
                          className={cx(
                            'mt-1.5 text-[11px] leading-relaxed',
                            isHover ? 'text-ink-800' : 'text-ink-600',
                          )}
                        >
                          {data.label}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

/**
 * Hover card for a single product. Upgraded to the report's 3-sentence
 * discipline instead of a bare list of numbers: (1) headline naming the
 * dominant factor in competitive-position language, (2) direction/magnitude
 * per factor, (3) a one-line takeaway. Matches the tone of the pairwise
 * narrative but at the product scale.
 */
function HoverCard({ product }: { product: ReturnType<typeof productById> }) {
  const rank = product.factors.Popularity.rankWith
  const dominant = dominantAbsFactor(product)
  const dom = product.factors[dominant]
  const helping = dom.ris > 0.03
  const drag = topNegativeFactor(product)
  const headline = helping
    ? `${dominant} is the clearest lift on ${product.name} — without it, it would ${
        dom.rankWithout > rank ? `drop to rank ${dom.rankWithout}` : 'not move'
      }.`
    : drag
      ? `${drag} is currently benefiting this product's competitors more than ${product.name}.`
      : `No single factor is meaningfully moving ${product.name} on this page.`

  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 rounded-xl border border-ink-200 bg-white p-3 text-[11px] shadow-lift">
      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        <span>Impact on competitive position</span>
        <span className="rounded-full bg-ink-100 px-1.5 py-0.5 font-mono text-ink-700">#{rank}</span>
      </div>
      <p className="mb-2 text-[11.5px] font-medium leading-snug text-ink-900">{headline}</p>
      <div className="space-y-1.5">
        {FACTORS.map((f) => (
          <div key={f} className="flex items-center gap-2">
            <span className="w-16 text-[10px] text-ink-600">{f}</span>
            <RisBar ris={product.factors[f].ris} width={140} height={6} />
            <span className="w-10 text-right font-mono text-[10px] text-ink-600">
              {formatRis(product.factors[f].ris)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-ink-100 pt-2 text-[10px] leading-relaxed text-ink-500">
        Rank counterfactuals for this PLP · valid until the next model training.
      </div>
    </div>
  )
}
