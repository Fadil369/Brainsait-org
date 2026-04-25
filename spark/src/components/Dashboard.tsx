// Main Dashboard
import { motion } from 'framer-motion'
import { Lightning, House } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PhaseNavigation } from '@/components/PhaseNavigation'
import { GameStats } from '@/components/GameStats'
import { BadgeShowcase } from '@/components/BadgeShowcase'
import type { Journey, PhaseId } from '@/types'

interface Props {
  journey: Journey
  onPhaseSelect: (id: PhaseId) => void
  onResetJourney?: () => void
}

const PHASE_DESCS: Record<PhaseId, { en: string; ar: string; icon: string }> = {
  brainstorm: { en: 'Define your healthcare problem and target users', ar: 'حدّد مشكلتك الصحية والمستخدمين المستهدفين', icon: '💡' },
  story: { en: 'Craft your compelling founder narrative', ar: 'اصنع قصة مؤسسك المقنعة', icon: '📖' },
  brand: { en: 'Build your visual identity and personality', ar: 'ابنِ هويتك البصرية وشخصيتك', icon: '🎨' },
  prd: { en: 'Write your investor-ready product spec', ar: 'اكتب مواصفات منتجك الجاهزة للمستثمرين', icon: '📋' },
  code: { en: 'Generate production-ready code', ar: 'أنشئ كوداً جاهزاً للإنتاج', icon: '⚡' },
  github: { en: 'Push to GitHub and deploy', ar: 'ادفع إلى GitHub وانشر', icon: '🚀' },
}

export function Dashboard({ journey, onPhaseSelect, onResetJourney }: Props) {
  const { t, language, setLanguage, isRTL } = useLanguage()

  const completedCount = journey.phases.filter(p => p.completed).length
  const currentPhase = journey.phases.find(p => !p.completed && p.unlocked)
  const progressPercent = (completedCount / 6) * 100

  function handleReset() {
    if (window.confirm(language === 'ar'
      ? 'هل تريد بدء رحلة جديدة؟ سيتم حذف كل تقدمك الحالي.'
      : 'Start a new journey? All current progress will be lost.'
    )) {
      onResetJourney?.()
    }
  }

  function handleExport() {
    const data = {
      journey,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spark-journey-${journey.id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

return (
    <div className="min-h-screen" style={{ background: '#020408' }}>
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <Lightning size={22} className="text-white" weight="duotone" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-semibold text-white">
                {t.appName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <a
              href="https://brainsait.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <House size={18} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Simple hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {completedCount === 0 ? t.startJourney : t.continueJourney}
          </h2>
          <p className="text-slate-400 text-lg mb-6">
            {completedCount} of 6 phases • {journey.gameState.xp} XP • Level {journey.gameState.level}
          </p>
          <button
            onClick={() => currentPhase && onPhaseSelect(currentPhase.id)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <span>{completedCount === 0 ? 'Start' : 'Continue'}</span>
            <span>→</span>
          </button>
        </motion.section>

        {/* Progress bar */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.section>

        {/* Game stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GameStats gameState={journey.gameState} />
        </motion.section>

        {/* Game stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GameStats gameState={journey.gameState} />
        </motion.section>

        {/* Phase navigation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-display font-semibold text-slate-400 text-sm uppercase tracking-wide mb-3">
            {t.journeyProgress}
          </h3>
          <PhaseNavigation
            phases={journey.phases}
            currentPhase={currentPhase?.id || journey.phases[0].id}
            onPhaseSelect={onPhaseSelect}
          />
        </motion.section>

        {/* Phase cards grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {journey.phases.map((phase, idx) => {
            const desc = PHASE_DESCS[phase.id]
            const isClickable = phase.unlocked
            const prevPhase = idx > 0 ? journey.phases[idx - 1] : null
            const unlockHint = !isClickable && prevPhase
              ? (language === 'ar'
                ? `أكمل مرحلة "${t[prevPhase.id as keyof typeof t]}" لفتح هذه المرحلة`
                : `Complete "${t[prevPhase.id as keyof typeof t]}" to unlock`)
              : undefined

            return (
              <motion.button
                key={phase.id}
                onClick={() => isClickable && onPhaseSelect(phase.id)}
                disabled={!isClickable}
                title={unlockHint}
                className={`
                  glass-card rounded-2xl p-5 text-left w-full transition-all duration-200
                  ${isClickable ? 'glass-card-hover cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                  ${phase.completed ? 'border border-emerald-500/20' : ''}
                  ${currentPhase?.id === phase.id ? 'border border-spark-500/40 start-here-pulse' : ''}
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 + 0.3 }}
              >
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <span className="text-2xl">{desc.icon}</span>
                  <div className="flex-1">
                    <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="font-display font-semibold text-sm text-white">
                        {t[phase.id as keyof typeof t] as string}
                      </span>
                      {phase.completed && <span className="text-emerald-400">✓</span>}
                      {!isClickable && <span className="text-slate-600 text-xs">🔒</span>}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {language === 'ar' ? desc.ar : desc.en}
                    </p>
                    {!isClickable && unlockHint && (
                      <p className="text-xs text-slate-600 mt-1 italic">{unlockHint}</p>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.section>

        {/* Badge showcase */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BadgeShowcase badges={journey.gameState.badges} />
        </motion.section>
      </main>
    </div>
  )
}
