// App.tsx - Main orchestrating component for Spark الشرارة
import { useState, useCallback } from 'react'
import { Toaster } from 'sonner'
import { useKV } from '@/lib/useKV'
import { useLanguage } from '@/contexts/LanguageContext'
import { createInitialGameState, addXP, earnBadge, updateStreak, PHASE_XP, PHASE_BADGES } from '@/lib/gameEngine'
import { Dashboard } from '@/components/Dashboard'
import { CelebrationDialog } from '@/components/CelebrationDialog'
import { BrainstormPhase } from '@/components/phases/BrainstormPhase'
import { StoryPhase } from '@/components/phases/StoryPhase'
import { BrandPhase } from '@/components/phases/BrandPhase'
import { PRDPhase } from '@/components/phases/PRDPhase'
import { CodePhase } from '@/components/phases/CodePhase'
import { GitHubPhase } from '@/components/phases/GitHubPhase'
import type { Journey, PhaseId, ConceptCard, Story, Brand, PRD, GeneratedCode, GitHubRepo, Badge } from '@/types'

const PHASE_ORDER: PhaseId[] = ['brainstorm', 'story', 'brand', 'prd', 'code', 'github']

function createInitialJourney(): Journey {
  return {
    id: crypto.randomUUID(),
    phases: PHASE_ORDER.map((id, idx) => ({
      id,
      unlocked: idx === 0,
      completed: false,
    })),
    gameState: createInitialGameState(),
    language: 'en',
    theme: 'dark',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

interface CelebrationState {
  open: boolean
  badge?: Badge | null
  leveledUp?: boolean
  newLevel?: number
  phaseId?: string
}

function AppInner() {
  const { language } = useLanguage()
  const [journey, setJourney] = useKV<Journey>('journey', createInitialJourney())
  const [currentView, setCurrentView] = useState<'dashboard' | PhaseId>('dashboard')
  const [celebration, setCelebration] = useState<CelebrationState>({ open: false })

  // Keep journey language in sync with context language
  const effectiveJourney: Journey = { ...journey, language: language as 'en' | 'ar' }

  // Toggle theme
  const handleToggleTheme = useCallback(() => {
    setJourney(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
      updatedAt: new Date().toISOString(),
    }))
  }, [setJourney])

  // Navigate to a phase
  const handlePhaseSelect = useCallback((id: PhaseId) => {
    const phase = journey.phases.find(p => p.id === id)
    if (!phase?.unlocked) return
    setCurrentView(id)
  }, [journey.phases])

  // Back to dashboard
  const handleBack = useCallback(() => {
    setCurrentView('dashboard')
  }, [])

  // Reset journey to start fresh
  const handleResetJourney = useCallback(() => {
    setJourney(createInitialJourney())
    setCurrentView('dashboard')
    setCelebration({ open: false })
  }, [setJourney])

  // Award XP + badges when a phase completes, then return to dashboard
  const awardPhaseCompletion = useCallback((phaseId: PhaseId) => {
    // Capture derived celebration data OUTSIDE setJourney to avoid StrictMode double-fire
    let mainCelebration: CelebrationState = { open: false }
    let firstSparkBadge: Badge | null = null

    setJourney(prev => {
      const phase = prev.phases.find(p => p.id === phaseId)
      if (phase?.completed) return prev // Already completed, no duplicate awards

      let gs = updateStreak(prev.gameState)

      // First phase ever: award 'first-spark' badge (shown after main celebration)
      if (prev.phases.every(p => !p.completed)) {
        const { newState, badge } = earnBadge(gs, 'first-spark')
        gs = newState
        firstSparkBadge = badge
      }

      // Phase XP
      const xpAmount = PHASE_XP[phaseId] || 100
      const { newState: afterXP, leveledUp } = addXP(gs, xpAmount)
      gs = afterXP

      // Phase badge
      const badgeId = PHASE_BADGES[phaseId]
      let earnedBadge: Badge | null = null
      if (badgeId) {
        const { newState: afterBadge, badge } = earnBadge(gs, badgeId)
        gs = afterBadge
        earnedBadge = badge
      }

      // Streak badge
      if (gs.streak >= 3) {
        const { newState: afterStreak } = earnBadge(gs, 'streak-3')
        gs = afterStreak
      }

      gs = { ...gs, totalPhases: gs.totalPhases + 1 }

      // Unlock next phase
      const currentIdx = PHASE_ORDER.indexOf(phaseId)
      const nextPhaseId = PHASE_ORDER[currentIdx + 1]
      const newPhases = prev.phases.map(p => {
        if (p.id === phaseId) return { ...p, completed: true, completedAt: new Date().toISOString() }
        if (p.id === nextPhaseId) return { ...p, unlocked: true }
        return p
      })

      mainCelebration = { open: true, badge: earnedBadge, leveledUp, newLevel: gs.level, phaseId }

      return { ...prev, phases: newPhases, gameState: gs, updatedAt: new Date().toISOString() }
    })

    // Fire side effects ONCE outside the state updater (safe from StrictMode double-invoke)
    setCelebration(mainCelebration)
    if (firstSparkBadge) {
      const badge = firstSparkBadge
      setTimeout(() => setCelebration({ open: true, badge, phaseId }), 3500)
    }
    setTimeout(() => setCurrentView('dashboard'), 200)
  }, [setJourney])

  // ── Phase completion handlers ─────────────────────────────────────────────
  const handleBrainstormComplete = useCallback((concept: ConceptCard) => {
    setJourney(prev => ({ ...prev, concept, updatedAt: new Date().toISOString() }))
    awardPhaseCompletion('brainstorm')
  }, [setJourney, awardPhaseCompletion])

  const handleStoryComplete = useCallback((story: Story) => {
    setJourney(prev => ({ ...prev, story, updatedAt: new Date().toISOString() }))
    awardPhaseCompletion('story')
  }, [setJourney, awardPhaseCompletion])

  const handleBrandComplete = useCallback((brand: Brand) => {
    setJourney(prev => ({ ...prev, brand, updatedAt: new Date().toISOString() }))
    awardPhaseCompletion('brand')
  }, [setJourney, awardPhaseCompletion])

  const handlePRDComplete = useCallback((prd: PRD) => {
    setJourney(prev => ({ ...prev, prd, updatedAt: new Date().toISOString() }))
    awardPhaseCompletion('prd')
  }, [setJourney, awardPhaseCompletion])

  const handleCodeComplete = useCallback((code: GeneratedCode) => {
    setJourney(prev => ({ ...prev, code, updatedAt: new Date().toISOString() }))
    awardPhaseCompletion('code')
  }, [setJourney, awardPhaseCompletion])

  const handleGitHubComplete = useCallback((githubRepo: GitHubRepo) => {
    setJourney(prev => ({ ...prev, githubRepo, updatedAt: new Date().toISOString() }))
    awardPhaseCompletion('github')
  }, [setJourney, awardPhaseCompletion])

  const handleCelebrationClose = useCallback(() => setCelebration({ open: false }), [])

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderView = () => {
    switch (currentView) {
      case 'brainstorm':
        return (
          <BrainstormPhase
            initial={effectiveJourney.concept}
            onComplete={handleBrainstormComplete}
            onBack={handleBack}
          />
        )
      case 'story':
        return (
          <StoryPhase
            initial={effectiveJourney.story}
            concept={effectiveJourney.concept}
            onComplete={handleStoryComplete}
            onBack={handleBack}
          />
        )
      case 'brand':
        return (
          <BrandPhase
            initial={effectiveJourney.brand}
            concept={effectiveJourney.concept}
            onComplete={handleBrandComplete}
            onBack={handleBack}
          />
        )
      case 'prd':
        return (
          <PRDPhase
            initial={effectiveJourney.prd}
            brand={effectiveJourney.brand}
            concept={effectiveJourney.concept}
            onComplete={handlePRDComplete}
            onBack={handleBack}
          />
        )
      case 'code':
        return (
          <CodePhase
            initial={effectiveJourney.code}
            brand={effectiveJourney.brand}
            prd={effectiveJourney.prd}
            onComplete={handleCodeComplete}
            onBack={handleBack}
          />
        )
      case 'github':
        return (
          <GitHubPhase
            initial={effectiveJourney.githubRepo}
            code={effectiveJourney.code}
            brand={effectiveJourney.brand}
            journey={effectiveJourney}
            onComplete={handleGitHubComplete}
            onBack={handleBack}
          />
        )
      default:
        return (
          <Dashboard
            journey={effectiveJourney}
            onPhaseSelect={handlePhaseSelect}
            onToggleTheme={handleToggleTheme}
            onResetJourney={handleResetJourney}
          />
        )
    }
  }

  return (
    <div className={effectiveJourney.theme === 'light' ? 'light-theme' : ''}>
      {renderView()}

      <CelebrationDialog
        open={celebration.open}
        onClose={handleCelebrationClose}
        badge={celebration.badge}
        leveledUp={celebration.leveledUp}
        newLevel={celebration.newLevel}
        phaseId={celebration.phaseId}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return <AppInner />
}
