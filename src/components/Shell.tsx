import { Link, NavLink, useLocation } from 'react-router-dom'
import { Sparkles, ArrowUpRight, Pin } from 'lucide-react'
import { concepts, conceptById } from '@/data/concepts'
import { cx } from '@/lib/utils'
import { useAppState } from '@/lib/appState'
import { COMMENT_ROOT_ATTR } from '@/lib/comments'
import { CommentsToolbar } from '@/components/comments/CommentsPanel'
import { CommentsLayer } from '@/components/comments/CommentsLayer'
import { useHiddenConcepts } from '@/lib/hiddenConcepts'

export function Shell({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  const isDetail = loc.pathname.startsWith('/concepts/')
  const pageLabel = labelForPath(loc.pathname)
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <TopBar />
      <div className="mx-auto flex max-w-[1440px] gap-0 px-6 pb-24 pt-6">
        <Sidebar collapsed={!isDetail} />
        {/*
          The <main> element is the comment-anchor root. All overlay pins are
          positioned absolutely inside it so they scroll with content and
          resize with the layout.
        */}
        <main
          {...{ [COMMENT_ROOT_ATTR]: '' }}
          className="relative min-w-0 flex-1"
        >
          {children}
          <CommentsLayer pageLabel={pageLabel} />
        </main>
      </div>
    </div>
  )
}

function labelForPath(pathname: string): string {
  if (pathname === '/') return 'Overview'
  if (pathname === '/principles') return 'Principles'
  if (pathname === '/gallery') return 'Gallery'
  if (pathname === '/pinned') return 'Pinned'
  if (pathname.startsWith('/concepts/')) {
    const id = pathname.split('/').pop() ?? ''
    const c = conceptById(id)
    if (c) return `Concept ${String(c.number).padStart(2, '0')} · ${c.title}`
    return 'Concept'
  }
  return pathname
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-glow">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">Ranking Explainability</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-ink-500">Concept showcase · Coveo</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <TopLink to="/">Overview</TopLink>
          <TopLink to="/principles">Principles</TopLink>
          <TopLink to="/gallery">Gallery</TopLink>
          <PinnedLink />
        </nav>
        <div className="flex items-center gap-3">
          <CommentsToolbar />
          <a
            href="https://coveo.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-700 shadow-soft hover:bg-ink-50"
          >
            Coveo.com <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </header>
  )
}

function TopLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cx(
          'rounded-md px-2.5 py-1.5 text-sm transition-colors',
          isActive ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100',
        )
      }
    >
      {children}
    </NavLink>
  )
}

function PinnedLink() {
  const { pins } = useAppState()
  return (
    <NavLink
      to="/pinned"
      className={({ isActive }) =>
        cx(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
          isActive ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100',
        )
      }
    >
      <Pin className="h-3 w-3" />
      Pinned
      {pins.length > 0 && (
        <span className="ml-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-purple-500 px-1 text-[10px] font-semibold text-white">
          {pins.length}
        </span>
      )}
    </NavLink>
  )
}

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { isHidden, hidden } = useHiddenConcepts()
  if (collapsed) return null
  const visible = concepts.filter((c) => !isHidden(c.id))
  return (
    <aside className="sticky top-20 mr-6 hidden h-[calc(100vh-5.5rem)] w-64 shrink-0 overflow-y-auto rounded-2xl border border-ink-200 bg-white p-2 shadow-soft xl:block">
      <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        <span>
          {visible.length === concepts.length
            ? `${concepts.length} concepts`
            : `${visible.length} of ${concepts.length} concepts`}
        </span>
        {hidden.length > 0 && (
          <NavLink
            to="/gallery?view=hidden"
            className="rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-purple-700 hover:bg-purple-50"
            title="See and restore hidden concepts"
          >
            {hidden.length} hidden
          </NavLink>
        )}
      </div>
      <ol className="space-y-0.5">
        {visible.map((c) => (
          <li key={c.id}>
            <NavLink
              to={`/concepts/${c.id}`}
              className={({ isActive }) =>
                cx(
                  'flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-ink-900' : 'text-ink-700 hover:bg-ink-50',
                )
              }
            >
              <span className="mt-0.5 inline-grid h-5 w-5 shrink-0 place-items-center rounded-md bg-ink-100 font-mono text-[10px] font-semibold text-ink-700">
                {String(c.number).padStart(2, '0')}
              </span>
              <span className="leading-snug">
                <span className="block font-medium">{c.title}</span>
                <span className="block text-[11px] text-ink-500">
                  {c.approach === 'ris' ? 'RIS' : c.approach === 'pairwise' ? 'Pairwise' : 'Hybrid'} ·{' '}
                  {c.posture === 'enterprise' ? 'Enterprise' : 'Bold'}
                </span>
              </span>
            </NavLink>
          </li>
        ))}
      </ol>
    </aside>
  )
}
