// Main Dashboard
import { motion } from 'framer-motion'
import { Globe, Moon, Sun, Lightning, ArrowCounterClockwise, Download, ShareNetwork } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PhaseNavigation } from '@/components/PhaseNavigation'
import { GameStats } from '@/components/GameStats'
import { BadgeShowcase } from '@/components/BadgeShowcase'
import type { Journey, PhaseId } from '@/types'

interface Props {
  journey: Journey
  onPhaseSelect: (id: PhaseId) => void
  onToggleTheme: () => void
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

export function Dashboard({ journey, onPhaseSelect, onToggleTheme, onResetJourney }: Props) {
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
    <div className="min-h-screen" style={{ background: '#050810' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-black/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center border border-spark-500/30">
              <Lightning size={20} className="text-spark-400" weight="fill" />
            </div>
            <div>
              <h1 className={`font-display font-bold text-sm text-white ${isRTL ? 'text-right' : ''}`}>
                {t.appName}
              </h1>
              <p className="text-xs text-slate-500">{t.appTagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="glass-card glass-card-hover rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Globe size={16} />
              <span className="font-medium">{language === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="glass-card glass-card-hover rounded-lg p-2 text-slate-400 hover:text-white transition-colors"
            >
              {journey.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Reset journey (only shown if journey has started) */}
            {completedCount > 0 && (
              <button
                onClick={handleExport}
                title={language === 'ar' ? 'تصدير الرحلة' : 'Export Journey'}
                className="glass-card glass-card-hover rounded-lg p-2 text-slate-500 hover:text-white transition-colors"
              >
                <Download size={16} />
              </button>
            )}
            {completedCount > 0 && (
              <button
                onClick={handleReset}
                title={language === 'ar' ? 'بدء رحلة جديدة' : 'Start new journey'}
                className="glass-card glass-card-hover rounded-lg p-2 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <ArrowCounterClockwise size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-card rounded-3xl p-6 sm:p-8 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-spark-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>

          <div className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">
                {completedCount === 0 ? t.startJourney : t.continueJourney}
              </h2>
              <p className="text-slate-400 text-sm">
                {completedCount}/{6} phases complete
              </p>
            </div>

            <button
              onClick={() => currentPhase && onPhaseSelect(currentPhase.id)}
              className="spark-btn px-6 py-3 rounded-2xl font-semibold text-white flex-shrink-0 flex items-center gap-2"
            >
              <span>{completedCount === 0 ? '🚀' : '⚡'}</span>
              {completedCount === 0 ? t.startJourney : t.continueJourney}
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative mt-6">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #0c9eeb, #10b981)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <div className={`flex justify-between mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs text-slate-500">{t.brainstorm}</span>
              <span className="text-xs text-slate-500">{t.github}</span>
            </div>
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
