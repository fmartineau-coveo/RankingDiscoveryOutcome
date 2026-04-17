import { Link } from 'react-router-dom'
import { ArrowUpRight, Gauge, MessagesSquare, Layers, EyeOff, RotateCcw } from 'lucide-react'
import type { ConceptMeta } from '@/data/concepts'
import { useHiddenConcepts } from '@/lib/hiddenConcepts'
import { cx } from '@/lib/utils'

export function ConceptGallery({
  concepts,
  restorable = false,
  onRestore,
}: {
  concepts: ConceptMeta[]
  /** When true, cards show a Restore button instead of the Hide affordance. */
  restorable?: boolean
  /** Called when the user clicks Restore on a card (only used when restorable). */
  onRestore?: (id: string) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {concepts.map((c) => (
        <GalleryCard
          key={c.id}
          c={c}
          restorable={restorable}
          onRestore={onRestore ? () => onRestore(c.id) : undefined}
        />
      ))}
    </div>
  )
}

function GalleryCard({
  c,
  restorable,
  onRestore,
}: {
  c: ConceptMeta
  restorable: boolean
  onRestore?: () => void
}) {
  const { hide } = useHiddenConcepts()
  const approachIcon =
    c.approach === 'ris' ? Gauge : c.approach === 'pairwise' ? MessagesSquare : Layers
  const Icon = approachIcon
  return (
    <div className="group relative">
      <Link
        to={`/concepts/${c.id}`}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
      >
        <Preview id={c.id} />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold text-ink-400">
              {String(c.number).padStart(2, '0')}
            </span>
            <span
              className={cx(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                c.approach === 'ris'
                  ? 'bg-blue-50 text-blue-700'
                  : c.approach === 'pairwise'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-ink-100 text-ink-700',
              )}
            >
              <Icon className="h-2.5 w-2.5" />
              {c.approach === 'ris' ? 'RIS' : c.approach === 'pairwise' ? 'Pairwise' : 'Hybrid'}
            </span>
            <span className="ml-auto text-[10px] text-ink-500">
              {c.posture === 'enterprise' ? 'Enterprise-ready' : 'Bold · visionary'}
            </span>
          </div>
          <h3 className="text-[17px] font-semibold leading-tight text-ink-900">{c.title}</h3>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-600">{c.tagline}</p>
          <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3 text-[11px] text-ink-500">
            <span>{c.question}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-ink-400 transition-colors group-hover:text-ink-900" />
          </div>
        </div>
      </Link>

      {/* Hover corner action: Hide (default) or Restore (when viewing hidden) */}
      {restorable ? (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRestore?.()
          }}
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-purple-300 bg-white/95 px-2 py-1 text-[10px] font-semibold text-purple-700 shadow-soft hover:bg-purple-50"
          title="Restore this concept to the showcase"
        >
          <RotateCcw className="h-3 w-3" />
          Restore
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            hide(c.id)
          }}
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white/95 px-2 py-1 text-[10px] font-medium text-ink-600 opacity-0 shadow-soft transition-opacity hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 group-hover:opacity-100"
          title="Hide this concept from the showcase (reversible)"
        >
          <EyeOff className="h-3 w-3" />
          Hide
        </button>
      )}
    </div>
  )
}

/**
 * Tiny bespoke preview for each concept. These are generic silhouettes,
 * not miniature components, so they load fast and give each tile its own
 * feel.
 */
function Preview({ id }: { id: string }) {
  const common = 'relative h-36 overflow-hidden border-b border-ink-100 bg-ink-50'
  switch (id) {
    case 'scorecard':
      return (
        <div className={cx(common, 'bg-gradient-to-br from-blue-50 to-white')}>
          <div className="absolute inset-4 rounded-xl border border-ink-200 bg-white p-3 shadow-soft">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500" />
              <div className="h-2 w-20 rounded-full bg-ink-200" />
              <div className="ml-auto h-6 w-8 rounded bg-ink-900" />
            </div>
            <div className="mt-3 space-y-1.5">
              {[0.8, 0.4, -0.3, 0.15].map((r, i) => (
                <div key={i} className="relative h-1.5 w-full rounded-full bg-ink-100">
                  <div
                    className="absolute top-0 h-1.5 rounded-full"
                    style={{
                      left: r >= 0 ? '50%' : `${50 + r * 50}%`,
                      width: `${Math.abs(r) * 50}%`,
                      background: r >= 0 ? '#3B68F4' : '#7D3EE0',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    case 'radar':
      return (
        <div className={cx(common, 'bg-gradient-to-br from-purple-50 to-white')}>
          <svg viewBox="0 0 200 144" className="absolute inset-0 h-full w-full">
            <g transform="translate(100,72)">
              {[20, 40, 60].map((r) => (
                <circle key={r} r={r} fill="none" stroke="rgba(17,19,42,0.08)" />
              ))}
              <polygon
                points="0,-60 52,0 0,30 -35,0"
                fill="rgba(59,104,244,0.28)"
                stroke="#3B68F4"
                strokeWidth="1.5"
              />
              <polygon
                points="0,-18 10,0 0,40 -18,0"
                fill="rgba(125,62,224,0.25)"
                stroke="#7D3EE0"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </div>
      )
    case 'counterfactual-ladder':
      return (
        <div className={cx(common)}>
          <div className="absolute inset-4 flex items-center gap-4">
            <div className="flex h-full flex-col justify-between py-1 text-[9px] text-ink-400">
              {[1, 5, 10, 20].map((r) => (
                <div key={r}>#{r}</div>
              ))}
            </div>
            <div className="relative h-full flex-1 rounded-lg border border-ink-200 bg-white">
              <div className="absolute left-2 right-2 top-[20%] h-1 rounded bg-ink-900" />
              <div className="absolute left-2 right-2 top-[10%] h-0.5 rounded border border-dashed border-blue-400" />
              <div className="absolute left-2 right-2 top-[42%] h-0.5 rounded border border-dashed border-purple-400" />
              <div className="absolute left-2 right-2 top-[75%] h-0.5 rounded border border-dashed border-purple-300" />
            </div>
          </div>
        </div>
      )
    case 'heatmap-matrix':
      return (
        <div className={cx(common, 'p-4')}>
          <div className="grid h-full grid-cols-4 gap-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const r = Math.sin(i * 1.3) * 0.8
              return (
                <div
                  key={i}
                  className="rounded-[3px]"
                  style={{
                    background: r >= 0 ? `rgba(59,104,244,${Math.abs(r) * 0.9})` : `rgba(125,62,224,${Math.abs(r) * 0.9})`,
                  }}
                />
              )
            })}
          </div>
        </div>
      )
    case 'archetypes':
      return (
        <div className={cx(common, 'flex flex-wrap items-center gap-2 p-5')}>
          {[
            'Rising Star',
            'Volume Driver',
            'Freshness Favorite',
            'Trendiness headwind',
            'Outpaced here',
          ].map((t, i) => (
            <span
              key={t}
              className="tag"
              style={{
                borderColor: ['#B8CEFF', '#D6B8FF', '#8BAEFF', '#F4D9A5', '#F7D0DE'][i],
                background: ['#EEF3FF', '#F5EEFF', '#EEF3FF', '#FFF5E5', '#FEEEEF'][i],
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )
    case 'baseline-comparator':
      return (
        <div className={cx(common, 'p-6')}>
          <div className="relative h-full">
            <div className="absolute left-1/2 top-0 h-full w-px bg-ink-200" />
            {[0.4, -0.2, 0.8, 0.1].map((r, i) => (
              <div key={i} className="absolute left-0 right-0" style={{ top: `${10 + i * 22}%` }}>
                <div
                  className="absolute h-2 rounded-full"
                  style={{
                    left: r >= 0 ? '50%' : `${50 + r * 50}%`,
                    width: `${Math.abs(r) * 50}%`,
                    background: r >= 0 ? '#3B68F4' : '#7D3EE0',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )
    case 'differentiation-map':
      return (
        <div className={cx(common, 'p-5')}>
          <svg viewBox="0 0 160 100" className="h-full w-full">
            <line x1="10" y1="90" x2="150" y2="90" stroke="#DDE1EF" />
            <line x1="10" y1="10" x2="10" y2="90" stroke="#DDE1EF" />
            <circle cx="40" cy="55" r="6" fill="#BB8EFF" />
            <circle cx="70" cy="30" r="9" fill="#3B68F4" />
            <circle cx="110" cy="55" r="7" fill="#8BAEFF" />
            <circle cx="130" cy="22" r="11" fill="#2A4FD8" />
          </svg>
        </div>
      )
    case 'composition-stack':
      return (
        <div className={cx(common, 'p-5')}>
          <svg viewBox="0 0 200 108" className="h-full w-full">
            <line x1="10" y1="54" x2="180" y2="54" stroke="rgba(17,19,42,0.06)" strokeDasharray="3 3" />
            {/* Index rail */}
            <path
              d="M 10 20 C 100 20, 130 54, 178 54"
              fill="none"
              stroke="#BAC0DA"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.45"
            />
            {/* Rule rail */}
            <path
              d="M 10 54 C 100 54, 130 54, 178 54"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.75"
            />
            {/* ML rail */}
            <path
              d="M 10 88 C 100 88, 130 54, 178 54"
              fill="none"
              stroke="#3B68F4"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.9"
            />
            {[20, 54, 88].map((y, i) => (
              <circle key={y} cx={10} cy={y} r={2.5} fill={['#BAC0DA', '#14B8A6', '#3B68F4'][i]} />
            ))}
            <circle cx={178} cy={54} r={8} fill="#11132A" />
            <circle cx={178} cy={54} r={3.5} fill="#FFFFFF" />
          </svg>
        </div>
      )
    case 'head-to-head-narrative':
      return (
        <div className={cx(common, 'p-4')}>
          <div className="flex h-full gap-2">
            <div className="flex-1 rounded-xl border border-blue-200 bg-white p-3">
              <div className="h-3 w-10 rounded bg-blue-200" />
              <div className="mt-2 h-10 w-full rounded bg-blue-100" />
            </div>
            <div className="grid place-items-center text-[11px] font-semibold text-ink-400">
              vs
            </div>
            <div className="flex-1 rounded-xl border border-purple-200 bg-white p-3">
              <div className="h-3 w-10 rounded bg-purple-200" />
              <div className="mt-2 h-10 w-full rounded bg-purple-100" />
            </div>
          </div>
        </div>
      )
    case 'pairwise-mirror':
      return (
        <div className={cx(common, 'p-5')}>
          <div className="space-y-2">
            {[0.6, 0.4, -0.3, 0.1].map((r, i) => (
              <div key={i} className="relative flex h-3 items-center">
                <div className="absolute left-1/2 h-full w-px bg-ink-200" />
                <div
                  className="absolute h-full rounded"
                  style={{
                    right: '50%',
                    width: `${Math.abs(r) * 40}%`,
                    background: '#3B68F4',
                  }}
                />
                <div
                  className="absolute h-full rounded"
                  style={{
                    left: '50%',
                    width: `${Math.abs(r * 0.6) * 40}%`,
                    background: '#7D3EE0',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )
    case 'conversational-qa':
      return (
        <div className={cx(common, 'p-4')}>
          <div className="space-y-2">
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-ink-900 px-3 py-1.5 text-[11px] text-white">
              Why is X ranked above Y?
            </div>
            <div className="mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] text-ink-800">
              Trendiness is the main reason …
            </div>
          </div>
        </div>
      )
    case 'swap-scenarios':
      return (
        <div className={cx(common, 'p-4')}>
          <div className="grid h-full grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col justify-between rounded-lg border border-ink-200 bg-white p-2">
                <div className="h-1.5 w-full rounded bg-ink-200" />
                <div className="flex items-end gap-1">
                  <div className={cx('h-10 w-2 rounded', i === 2 ? 'bg-purple-500' : 'bg-blue-500')} />
                  <div className={cx('h-6 w-2 rounded', i === 2 ? 'bg-blue-400' : 'bg-purple-400')} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    case 'ambient-plp':
      return (
        <div className={cx(common, 'p-3')}>
          <div className="grid h-full grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={cx(
                  'rounded-md border border-ink-200 bg-white',
                  i === 5 && 'ring-2 ring-purple-500 ring-offset-1',
                )}
              />
            ))}
          </div>
        </div>
      )
    case 'rank-storyline':
      return (
        <div className={cx(common, 'p-5')}>
          <div className="flex h-full items-center gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-4 rounded-full bg-blue-500" style={{ width: '80%' }} />
              <div className="h-3 rounded-full bg-blue-400" style={{ width: '55%' }} />
              <div className="h-2.5 rounded-full bg-blue-300" style={{ width: '35%' }} />
            </div>
            <div className="h-full w-px bg-ink-200" />
            <div className="flex flex-1 flex-col gap-1.5 items-end">
              <div className="h-4 rounded-full bg-purple-500" style={{ width: '60%' }} />
              <div className="h-3 rounded-full bg-purple-400" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      )
    case 'factor-impact-map':
      return (
        <div className={cx(common, 'p-4')}>
          <svg viewBox="0 0 220 140" className="h-full w-full">
            {/* Quadrant fills */}
            <rect x="110" y="10" width="100" height="60" fill="#F5EEFF" opacity="0.55" />
            <rect x="110" y="70" width="100" height="60" fill="#EEF0F8" opacity="0.65" />
            {/* Axes */}
            <line x1="10" y1="130" x2="210" y2="130" stroke="#DDE1EF" />
            <line x1="10" y1="10" x2="10" y2="130" stroke="#DDE1EF" />
            {/* Divider lines */}
            <line x1="110" y1="10" x2="110" y2="130" stroke="#C8CCDE" strokeDasharray="3 3" />
            <line x1="10" y1="70" x2="210" y2="70" stroke="#C8CCDE" strokeDasharray="3 3" />
            {/* Bubbles — decisive cluster top-right */}
            <circle cx="170" cy="30" r="18" fill="#3B68F4" opacity="0.85" />
            <text x="170" y="34" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">T</text>
            <circle cx="150" cy="50" r="11" fill="#3B68F4" opacity="0.75" />
            <text x="150" y="54" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">P</text>
            {/* Tablestakes */}
            <circle cx="160" cy="100" r="7" fill="#7D3EE0" opacity="0.7" />
            <text x="160" y="103" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">F</text>
            {/* Minor */}
            <circle cx="40" cy="108" r="6" fill="#BAC0DA" opacity="0.9" />
            <text x="40" y="111" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">E</text>
          </svg>
        </div>
      )
    case 'commercial-intent':
      return (
        <div className={cx(common, 'p-4')}>
          <div className="grid h-full grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-2">
              <div className="flex items-center gap-1">
                <span className="grid h-3 w-3 place-items-center rounded-full bg-blue-500">
                  <span className="block h-1 w-1 rounded-full bg-white" />
                </span>
                <span className="text-[9px] font-semibold text-blue-800">Rising Stars</span>
              </div>
              <div className="mt-1 text-[9px] text-ink-600">Top 10 · 3 aligned</div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-blue-100">
                <div className="h-full w-[78%] bg-blue-500" />
              </div>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-2">
              <div className="flex items-center gap-1">
                <span className="grid h-3 w-3 place-items-center rounded-full bg-purple-500">
                  <span className="block h-1 w-1 rounded-full bg-white" />
                </span>
                <span className="text-[9px] font-semibold text-purple-800">Deeper than intended</span>
              </div>
              <div className="mt-1 text-[9px] text-ink-600">2 products</div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-purple-100">
                <div className="h-full w-[22%] bg-purple-500" />
              </div>
            </div>
            <div className="col-span-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-2">
              <div className="text-[9px] font-semibold text-amber-600">Shallower than intended · 1</div>
            </div>
          </div>
        </div>
      )
    case 'scorecard-v3':
      return (
        <div className={cx(common, 'bg-gradient-to-br from-blue-50 to-purple-50')}>
          <div className="absolute inset-3 flex flex-col gap-2 rounded-xl border border-ink-200 bg-white p-3 shadow-soft">
            {/* Model factor block */}
            <div className="rounded-md border border-blue-200 bg-blue-50/40 p-1.5">
              <div className="text-[8px] font-semibold uppercase tracking-[0.1em] text-blue-700">
                Model factors
              </div>
              <div className="mt-1 space-y-1">
                {[0.75, 0.5, -0.3].map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span
                      className={cx(
                        'h-2 w-4 rounded-full',
                        r >= 0 ? 'bg-blue-500' : 'bg-purple-500',
                      )}
                    />
                    <span className="h-1 flex-1 rounded-full bg-ink-200" style={{ maxWidth: `${70 - i * 10}%` }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Rules block */}
            <div className="rounded-md border border-purple-200 bg-purple-50/40 p-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-purple-700">
                  Merch rules
                </span>
                <span className="rounded-full bg-white px-1 text-[7px] font-semibold text-ink-500 shadow-soft">
                  2 applied
                </span>
              </div>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="grid h-2.5 w-2.5 place-items-center rounded-sm bg-teal-500 text-[6px] font-bold text-white">
                    +
                  </span>
                  <span className="h-1 w-16 rounded-full bg-ink-200" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="grid h-2.5 w-2.5 place-items-center rounded-sm bg-amber-500 text-[6px] font-bold text-white">
                    −
                  </span>
                  <span className="h-1 w-10 rounded-full bg-ink-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    case 'scorecard-v2':
      return (
        <div className={cx(common, 'bg-gradient-to-br from-blue-50 to-purple-50')}>
          <div className="absolute inset-4 rounded-xl border border-ink-200 bg-white p-3 shadow-soft">
            {/* Validity band — the V2 signature move */}
            <div className="flex items-center gap-2 rounded-md border border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-white px-2 py-1">
              <span className="grid h-4 w-4 place-items-center rounded bg-white text-purple-600">
                <span className="block h-1.5 w-1.5 rounded-sm bg-purple-500" />
              </span>
              <span className="flex-1 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-purple-700">
                Snapshot · Apr 12
              </span>
              <span className="rounded-full bg-white px-1 text-[7.5px] font-semibold text-ink-500 shadow-soft">
                Refreshes on training
              </span>
            </div>
            {/* Text-forward factor rows — no bars, per comment #2 */}
            <div className="mt-2 space-y-1.5">
              {[
                { tone: 'blue', w: '82%' },
                { tone: 'purple', w: '64%' },
                { tone: 'blue', w: '48%' },
                { tone: 'ink', w: '36%' },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className={cx(
                      'h-2.5 w-6 rounded-full',
                      row.tone === 'blue'
                        ? 'bg-blue-500'
                        : row.tone === 'purple'
                          ? 'bg-purple-500'
                          : 'bg-ink-200',
                    )}
                  />
                  <span className="h-1.5 rounded-full bg-ink-200" style={{ width: row.w }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    default:
      return <div className={common} />
  }
}
