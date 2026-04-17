import { Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/components/Shell'
import { Landing } from '@/components/Landing'
import { ConceptDetail } from '@/components/ConceptDetail'
import { PrinciplesPanel } from '@/components/PrinciplesPanel'
import { GalleryPage } from '@/components/GalleryPage'
import { PinnedPage } from '@/components/PinnedPage'
import { AppStateProvider } from '@/lib/appState'
import { CommentsProvider } from '@/lib/comments'
import { HiddenConceptsProvider } from '@/lib/hiddenConcepts'

export default function App() {
  return (
    <AppStateProvider>
      <HiddenConceptsProvider>
        <CommentsProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/principles" element={<PrinciplesPanel />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/pinned" element={<PinnedPage />} />
            <Route path="/concepts/:id" element={<ConceptDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
        </CommentsProvider>
      </HiddenConceptsProvider>
    </AppStateProvider>
  )
}
