import type { Approach, Posture } from '@/data/concepts'
import { Gauge, MessagesSquare, Layers } from 'lucide-react'

export function ApproachTag({ approach }: { approach: Approach }) {
  if (approach === 'ris') {
    return (
      <span className="tag-blue">
        <Gauge className="h-3 w-3" />
        Approach 1 · Ranking Impact Score
      </span>
    )
  }
  if (approach === 'pairwise') {
    return (
      <span className="tag-purple">
        <MessagesSquare className="h-3 w-3" />
        Approach 2 · Pairwise Narrative
      </span>
    )
  }
  return (
    <span className="tag">
      <Layers className="h-3 w-3" />
      Both approaches
    </span>
  )
}

export function PostureTag({ posture }: { posture: Posture }) {
  return posture === 'enterprise' ? (
    <span className="tag">Enterprise-ready</span>
  ) : (
    <span className="tag" style={{ borderColor: '#EADBFF', background: '#F5EEFF', color: '#4D1C99' }}>
      Bold / visionary
    </span>
  )
}
