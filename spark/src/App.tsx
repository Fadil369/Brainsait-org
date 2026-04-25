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

  const effectiveJourney: Journey = { ...journey, language: language as 'en' | 'ar' }

  const handlePhaseSelect = useCallback((id: PhaseId) => {
    const phase = journey.phases.find(p => p.id === id)
    if (!phase?.unlocked) return
    setCurrentView(id)
  }, [journey.phases])

  const handleBack = useCallback(() => setCurrentView('dashboard'), [])

  const handleResetJourney = useCallback(() => {
    setJourney(createInitialJourney())
    setCurrentView('dashboard')
    setCelebration({ open: false })
  }, [setJourney])

  const awardPhaseCompletion = useCallback((phaseId: PhaseId) => {
    let mainCelebration: CelebrationState = { open: false }

    setJourney(prev => {
      const phase = prev.phases.find(p => p.id === phaseId)
      if (phase?.completed) return prev

      let gs = updateStreak(prev.gameState)

      const xpAmount = PHASE_XP[phaseId] || 100
      const { newState: afterXP, leveledUp } = addXP(gs, xpAmount)
      gs = afterXP

      const badgeId = PHASE_BADGES[phaseId]
      let earnedBadge: Badge | null = null
      if (badgeId) {
        const { newState: afterBadge, badge } = earnBadge(gs, badgeId)
        gs = afterBadge
        earnedBadge = badge
      }

      if (gs.streak >= 3) {
        const { newState: afterStreak } = earnBadge(gs, 'streak-3')
        gs = afterStreak
      }

      const completedNow = prev.phases.filter(p => p.id === phaseId || p.completed).length + 1
      if (completedNow === 3) {
        const { newState: afterMilestone } = earnBadge(gs, 'halfway-hero')
        gs = afterMilestone
      }

      gs = { ...gs, totalPhases: gs.totalPhases + 1 }

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

    setCelebration(mainCelebration)
    setTimeout(() => setCurrentView('dashboard'), 200)
  }, [setJourney])

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

  const renderView = () => {
    switch (currentView) {
      case 'brainstorm':
        return <BrainstormPhase initial={effectiveJourney.concept} onComplete={handleBrainstormComplete} onBack={handleBack} />
      case 'story':
        return <StoryPhase initial={effectiveJourney.story} concept={effectiveJourney.concept} onComplete={handleStoryComplete} onBack={handleBack} />
      case 'brand':
        return <BrandPhase initial={effectiveJourney.brand} concept={effectiveJourney.concept} onComplete={handleBrandComplete} onBack={handleBack} />
      case 'prd':
        return <PRDPhase initial={effectiveJourney.prd} brand={effectiveJourney.brand} concept={effectiveJourney.concept} onComplete={handlePRDComplete} onBack={handleBack} />
      case 'code':
        return <CodePhase initial={effectiveJourney.code} brand={effectiveJourney.brand} prd={effectiveJourney.prd} onComplete={handleCodeComplete} onBack={handleBack} />
      case 'github':
        return <GitHubPhase initial={effectiveJourney.githubRepo} code={effectiveJourney.code} brand={effectiveJourney.brand} journey={effectiveJourney} onComplete={handleGitHubComplete} onBack={handleBack} />
      default:
        return (
          <Dashboard
            journey={effectiveJourney}
            onPhaseSelect={handlePhaseSelect}
            onResetJourney={handleResetJourney}
          />
        )
    }
  }

  return (
    <div>
      {renderView()}
      <CelebrationDialog open={celebration.open} onClose={handleCelebrationClose} badge={celebration.badge} leveledUp={celebration.leveledUp} newLevel={celebration.newLevel} phaseId={celebration.phaseId} />
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' } }} />
    </div>
  )
}

export default function App() {
  return <AppInner />
}