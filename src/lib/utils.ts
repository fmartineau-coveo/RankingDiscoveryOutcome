export function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ')
}

export function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x))
}
