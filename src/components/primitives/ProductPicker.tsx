import { products, productById, type Product } from '@/data/mockData'
import { ProductThumb } from './ProductTile'
import { cx } from '@/lib/utils'
import { Check } from 'lucide-react'

type SingleProps = {
  mode: 'single'
  value: string
  onChange: (id: string) => void
  label?: string
  exclude?: string[]
  className?: string
}

type MultiProps = {
  mode: 'multi'
  value: string[]
  onChange: (ids: string[]) => void
  max?: number
  label?: string
  className?: string
}

export function ProductPicker(props: SingleProps | MultiProps) {
  return (
    <div className={cx('rounded-2xl border border-ink-200 bg-white shadow-soft', props.className)}>
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          {props.label ?? (props.mode === 'single' ? 'Pick a product' : 'Pick products')}
        </div>
        <div className="text-[11px] text-ink-500">{products.length} on this page</div>
      </div>
      <div className="max-h-[420px] space-y-0.5 overflow-y-auto p-2 scroll-slim">
        {products.map((p) => (
          <PickerRow key={p.id} p={p} {...props} />
        ))}
      </div>
    </div>
  )
}

function PickerRow({ p, ...props }: { p: Product } & (SingleProps | MultiProps)) {
  const active =
    props.mode === 'single' ? props.value === p.id : props.value.includes(p.id)
  const disabled =
    props.mode === 'single'
      ? props.exclude?.includes(p.id)
      : !active && (props.max ? props.value.length >= props.max : false)

  function handle() {
    if (disabled) return
    if (props.mode === 'single') {
      props.onChange(p.id)
    } else {
      const next = active ? props.value.filter((x) => x !== p.id) : [...props.value, p.id]
      props.onChange(next)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={disabled}
      className={cx(
        'flex w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition-all',
        active
          ? 'border-ink-900 bg-ink-900 text-white shadow-card'
          : disabled
            ? 'cursor-not-allowed border-ink-100 bg-ink-50/70 text-ink-400 opacity-70'
            : 'border-ink-100 bg-white hover:border-ink-300',
      )}
    >
      <ProductThumb product={p} size="xs" />
      <div className="min-w-0 flex-1">
        <div
          className={cx(
            'truncate text-[13px] font-medium',
            active ? 'text-white' : 'text-ink-900',
          )}
        >
          {p.name}
        </div>
        <div
          className={cx(
            'truncate text-[11px]',
            active ? 'text-white/60' : 'text-ink-500',
          )}
        >
          {p.priceLabel} · rank #{p.factors.Popularity.rankWith}
        </div>
      </div>
      {props.mode === 'multi' && active && (
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-ink-900">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  )
}

export { productById }
