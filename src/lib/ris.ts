import type { FactorName } from '@/data/mockData'

export function risLabel(ris: number): string {
  if (Math.abs(ris) < 0.03) return 'Negligible'
  if (ris > 0.6) return 'Strongly helping'
  if (ris > 0.3) return 'Clearly helping'
  if (ris > 0.05) return 'Mildly helping'
  if (ris < -0.6) return 'Strongly hurting'
  if (ris < -0.3) return 'Clearly hurting'
  if (ris < -0.05) return 'Mildly hurting'
  return 'Marginal'
}

export function risDirection(ris: number): 'up' | 'down' | 'flat' {
  if (ris > 0.03) return 'up'
  if (ris < -0.03) return 'down'
  return 'flat'
}

export function risToneHex(ris: number): string {
  if (ris >= 0.5) return '#2A4FD8' // deep blue
  if (ris >= 0.15) return '#3B68F4' // blue
  if (ris > 0.03) return '#8BAEFF' // soft blue
  if (ris < -0.5) return '#6328C0' // deep purple
  if (ris < -0.15) return '#7D3EE0' // purple
  if (ris < -0.03) return '#BB8EFF' // soft purple
  return '#BAC0DA' // neutral
}

export function factorGlyph(f: FactorName): string {
  switch (f) {
    case 'Popularity':
      return 'P'
    case 'Freshness':
      return 'F'
    case 'Trendiness':
      return 'T'
    case 'Engagement':
      return 'E'
  }
}

export function factorBlurb(f: FactorName): string {
  switch (f) {
    case 'Popularity':
      return 'How broadly shoppers pick this kind of item.'
    case 'Freshness':
      return 'How recent the catalog signals are.'
    case 'Trendiness':
      return 'Short-horizon momentum vs. the usual baseline.'
    case 'Engagement':
      return 'How shoppers interact with it once they see it.'
  }
}

/** Normalise rank delta into a comparable readable string. */
export function rankDeltaString(rankWith: number, rankWithout: number): string {
  const d = rankWithout - rankWith
  if (d === 0) return 'would not move'
  const sign = d > 0 ? 'drop' : 'jump'
  return `would ${sign} to rank ${rankWithout}`
}

/**
 * Format a Ranking Impact Score for display. The method estimates direction
 * and proportional shift — rounding to one decimal communicates that honestly
 * and avoids the false precision of showing e.g. +0.8147. Values below the
 * "Negligible" threshold collapse to "0.0" so they visually quiet.
 */
export function formatRis(ris: number, { withSign = true }: { withSign?: boolean } = {}): string {
  if (Math.abs(ris) < 0.05) return withSign ? '±0.0' : '0.0'
  const rounded = Math.round(ris * 10) / 10
  const body = Math.abs(rounded).toFixed(1)
  if (!withSign) return body
  return rounded > 0 ? `+${body}` : `−${body}`
}
