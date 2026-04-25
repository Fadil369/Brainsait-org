import { useState, useEffect } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Nav } from '@/components/Nav'
import { CatalogView } from '@/views/CatalogView'
import { CourseDetailView } from '@/views/CourseDetailView'
import { DiagnosticView } from '@/views/DiagnosticView'
import { QuizView } from '@/views/QuizView'
import { PathsView } from '@/views/PathsView'
import { DashboardView } from '@/views/DashboardView'
import { EnrollView } from '@/views/EnrollView'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const fn = () => {
      setHash(window.location.hash)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  return hash
}

type RouteResult = { view: string; param?: string }

function parseRoute(hash: string): RouteResult {
  const path = hash.replace(/^#\/?/, '').split('?')[0]
  if (!path || path === 'catalog') return { view: 'catalog' }
  if (path.startsWith('course/')) return { view: 'course', param: path.slice(7) }
  if (path === 'diagnostic') return { view: 'diagnostic' }
  if (path === 'quiz') return { view: 'quiz' }
  if (path === 'paths') return { view: 'paths' }
  if (path === 'dashboard') return { view: 'dashboard' }
  if (path === 'enroll') return { view: 'enroll' }
  return { view: 'catalog' }
}

function AppInner() {
  const hash = useHashRoute()
  const { view, param } = parseRoute(hash)

  return (
    <>
      <Nav currentView={view} />
      <main>
        {view === 'catalog' && <CatalogView />}
        {view === 'course' && <CourseDetailView id={param ?? ''} />}
        {view === 'diagnostic' && <DiagnosticView />}
        {view === 'quiz' && <QuizView />}
        {view === 'paths' && <PathsView />}
        {view === 'dashboard' && <DashboardView />}
        {view === 'enroll' && <EnrollView />}
      </main>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </ErrorBoundary>
  )
}
