import { Pin, Flag, Anchor } from 'lucide-react'
import type { Rule } from '@/data/mockData'
import { cx } from '@/lib/utils'

/**
 * A named merchandising rule, rendered as a distinct card with its scope,
 * rationale, and effect on rank. Used by Scorecard V3 and Merchandising
 * Archetypes so stakeholders see a consistent rule presentation wherever
 * rules are surfaced.
 */
export function RuleCard({ rule }: { rule: Rule }) {
  const cfg =
    rule.kind === 'pin'
      ? { Icon: Pin, tint: 'border-teal-400/50 bg-teal-500/5', accent: 'text-teal-500', label: 'Pin' }
      : rule.kind === 'boost'
        ? { Icon: Flag, tint: 'border-teal-400/50 bg-teal-500/5', accent: 'text-teal-500', label: 'Boost' }
        : { Icon: Anchor, tint: 'border-amber-400/50 bg-amber-400/10', accent: 'text-amber-600', label: 'Demote' }
  return (
    <li
      className={cx(
        'grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border px-4 py-3',
        cfg.tint,
      )}
    >
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white shadow-soft">
        <cfg.Icon className={cx('h-4 w-4', cfg.accent)} />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-ink-900">{rule.name}</span>
          <span
            className={cx(
              'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]',
              rule.kind === 'demote'
                ? 'border-amber-400/60 bg-white text-amber-600'
                : 'border-teal-400/60 bg-white text-teal-500',
            )}
          >
            {cfg.label}
          </span>
        </div>
        <div className="mt-0.5 text-[11px] font-mono text-ink-500">{rule.scope}</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-700">{rule.rationale}</p>
        <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-ink-900">
          Effect on this product: <span className="font-normal text-ink-700">{rule.effect}</span>
        </p>
      </div>
    </li>
  )
}

/**
 * Tiny inline chip for hinting at rule presence on an overview list (e.g.
 * the archetype rows). Keeps the row scannable without opening the expanded
 * view. One chip per rule; pluralises cleanly via the parent.
 */
export function RuleInlineChip({ rule }: { rule: Rule }) {
  const tone =
    rule.kind === 'demote'
      ? 'border-amber-400/60 bg-amber-400/10 text-amber-700'
      : 'border-teal-400/60 bg-teal-500/10 text-teal-700'
  const verb = rule.kind === 'pin' ? 'Pinned' : rule.kind === 'boost' ? 'Boosted' : 'Demoted'
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
        tone,
      )}
      title={rule.rationale}
    >
      <span
        className={cx(
          'h-1 w-1 rounded-full',
          rule.kind === 'demote' ? 'bg-amber-500' : 'bg-teal-500',
        )}
      />
      {verb} · {rule.name.replace(/\s·.*$/, '')}
    </span>
  )
}
