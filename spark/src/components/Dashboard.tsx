// Main Dashboard — Premium UI
import { motion } from 'framer-motion'
import { Lightning, House, ArrowRight, Lock, Check, Trophy, Flame, Star, Download, ArrowCounterClockwise } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { BadgeShowcase } from '@/components/BadgeShowcase'
import { getXPForLevel, getXPForNextLevel, PHASE_XP } from '@/lib/gameEngine'
import type { Journey, PhaseId } from '@/types'

interface Props {
  journey: Journey
  onPhaseSelect: (id: PhaseId) => void
  onResetJourney?: () => void
}

const PHASE_META: Record<PhaseId, { en: string; ar: string; icon: string; color: string; xp: number }> = {
  brainstorm: { en: 'Define your healthcare problem', ar: 'حدّد مشكلتك الصحية', icon: '💡', color: 'from-amber-500 to-orange-500', xp: PHASE_XP.brainstorm },
  story:       { en: 'Craft your founder narrative',   ar: 'اصنع قصة مؤسسك',       icon: '📖', color: 'from-violet-500 to-purple-600', xp: PHASE_XP.story },
  brand:       { en: 'Build your visual identity',     ar: 'ابنِ هويتك البصرية',    icon: '🎨', color: 'from-pink-500 to-rose-500',    xp: PHASE_XP.brand },
  prd:         { en: 'Write your product spec',        ar: 'اكتب مواصفات منتجك',    icon: '📋', color: 'from-cyan-500 to-blue-500',    xp: PHASE_XP.prd },
  code:        { en: 'Generate production code',       ar: 'أنشئ كوداً للإنتاج',    icon: '⚡', color: 'from-emerald-500 to-teal-500', xp: PHASE_XP.code },
  github:      { en: 'Push to GitHub & deploy',        ar: 'ادفع إلى GitHub وانشر', icon: '🚀', color: 'from-slate-400 to-slate-200',  xp: PHASE_XP.github },
}

export function Dashboard({ journey, onPhaseSelect, onResetJourney }: Props) {
  const { t, language, setLanguage, isRTL } = useLanguage()

  const completedCount = journey.phases.filter(p => p.completed).length
  const currentPhase   = journey.phases.find(p => !p.completed && p.unlocked)
  const progressPercent = (completedCount / 6) * 100
  const isComplete      = completedCount === 6

  // XP progress within current level
  const gs = journey.gameState
  const xpFloor   = getXPForLevel(gs.level)
  const xpCeiling = getXPForNextLevel(gs.level)
  const xpPct     = Math.min(((gs.xp - xpFloor) / (xpCeiling - xpFloor)) * 100, 100)

  function handleReset() {
    if (window.confirm(language === 'ar'
      ? 'هل تريد بدء رحلة جديدة؟ سيتم حذف كل تقدمك.'
      : 'Start a new journey? All current progress will be lost.'
    )) onResetJourney?.()
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ journey, exportedAt: new Date().toISOString(), version: '1.0' }, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `spark-journey-${journey.id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen" style={{ background: '#020408' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-cyan-600/8 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-600/6 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%]  w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[80px]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Lightning size={18} className="text-white" weight="fill" />
            </div>
            <span className="font-display font-bold text-white tracking-tight hidden sm:block">
              {t.appName}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExport}
              title="Export journey"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleReset}
              title="New journey"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <ArrowCounterClockwise size={16} />
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <a
              href="https://brainsait.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <House size={16} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10 relative">

        {/* ── Hero ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          {isComplete ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
              🎉 {language === 'ar' ? 'أكملت الرحلة!' : 'Journey Complete!'}
            </div>
          ) : currentPhase ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {language === 'ar' ? 'الرحلة جارية' : 'Journey in Progress'}
            </div>
          ) : null}

          <h2 className="hero-title">
            {isComplete
              ? (language === 'ar' ? 'مبروك! شركتك جاهزة' : 'Startup Built!')
              : completedCount === 0
              ? (language === 'ar' ? 'ابنِ شركتك الصحية' : 'Build Your Health Startup')
              : t.continueJourney
            }
          </h2>

          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            {language === 'ar'
              ? 'من الفكرة إلى المنتج في 6 خطوات مدعومة بالذكاء الاصطناعي'
              : 'From idea to shipped product in 6 AI-powered steps'
            }
          </p>

          {currentPhase && !isComplete && (
            <motion.button
              onClick={() => onPhaseSelect(currentPhase.id)}
              className="spark-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>{completedCount === 0
                ? (language === 'ar' ? 'ابدأ الآن' : 'Get Started')
                : (language === 'ar' ? 'تابع رحلتك' : 'Continue Journey')
              }</span>
              <ArrowRight size={18} weight="bold" />
            </motion.button>
          )}
        </motion.section>

        {/* ── Overall progress bar ── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{completedCount}/{6} {language === 'ar' ? 'مراحل' : 'phases'}</span>
            <span className="gradient-text font-semibold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #06b6d4, #10b981)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </motion.section>

        {/* ── Stat strip ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-4 gap-3"
        >
          {[
            { icon: <Star size={18} weight="fill" className="text-cyan-400" />, value: `Lv ${gs.level}`, label: language === 'ar' ? 'المستوى' : 'Level', accent: 'cyan' },
            { icon: <Trophy size={18} weight="fill" className="text-amber-400" />, value: gs.xp.toLocaleString(), label: 'XP', accent: 'amber' },
            { icon: <Flame size={18} weight="fill" className="text-orange-400" />, value: gs.streak, label: language === 'ar' ? 'يوم متتالي' : 'Streak', accent: 'orange' },
            { icon: <Trophy size={18} weight="fill" className="text-violet-400" />, value: `${gs.badges.filter(b => b.earned).length}/${gs.badges.length}`, label: language === 'ar' ? 'أوسمة' : 'Badges', accent: 'violet' },
          ].map(({ icon, value, label, accent }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="glass-card rounded-2xl p-4 text-center space-y-1"
            >
              <div className="flex justify-center mb-1">{icon}</div>
              <div className={`font-display font-bold text-xl text-${accent}-400 tabular-nums`}>{value}</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider">{label}</div>
            </motion.div>
          ))}
        </motion.section>

        {/* ── XP level bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-1.5"
        >
          <div className="flex justify-between text-xs text-slate-600">
            <span>Level {gs.level}</span>
            <span>{gs.xp - xpFloor} / {xpCeiling - xpFloor} XP → Level {gs.level + 1}</span>
          </div>
          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </motion.div>

        {/* ── Phase cards ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            {t.journeyProgress}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journey.phases.map((phase, idx) => {
              const meta       = PHASE_META[phase.id]
              const isActive   = currentPhase?.id === phase.id
              const isClickable = phase.unlocked

              return (
                <motion.button
                  key={phase.id}
                  onClick={() => isClickable && onPhaseSelect(phase.id)}
                  disabled={!isClickable}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 + 0.3 }}
                  whileHover={isClickable ? { y: -3 } : {}}
                  whileTap={isClickable ? { scale: 0.97 } : {}}
                  className={[
                    'glass-card rounded-2xl p-5 text-left w-full relative overflow-hidden transition-all duration-300',
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
                    isActive ? 'border-cyan-500/40 start-here-pulse shadow-lg shadow-cyan-500/10' : '',
                    phase.completed ? 'border-emerald-500/30' : '',
                    isClickable && !isActive && !phase.completed ? 'glass-card-hover' : '',
                  ].join(' ')}
                >
                  {/* Subtle gradient tint on hover — shown via bg */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                  )}

                  {/* Phase number badge */}
                  <span className="absolute top-3 right-3 text-xs font-bold text-slate-700 font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl mb-4 shadow-lg`}>
                    {meta.icon}
                  </div>

                  {/* Title + status */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-display font-semibold text-sm text-white leading-tight">
                      {t[phase.id as keyof typeof t] as string}
                    </h4>
                    {phase.completed
                      ? <Check size={16} weight="bold" className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      : !phase.unlocked
                      ? <Lock size={14} className="text-slate-600 flex-shrink-0 mt-0.5" />
                      : isActive
                      ? <ArrowRight size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      : null
                    }
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {language === 'ar' ? meta.ar : meta.en}
                  </p>

                  {/* XP reward */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      phase.completed
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {phase.completed ? '✓ ' : '+'}{meta.xp} XP
                    </span>
                    {isActive && (
                      <span className="text-xs text-cyan-400 font-medium animate-pulse">
                        {language === 'ar' ? '← هنا' : 'Next →'}
                      </span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* ── Badge showcase ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BadgeShowcase badges={gs.badges} />
        </motion.section>

        {/* ── Footer ── */}
        <div className="text-center text-xs text-slate-700 pb-4">
          <a href="https://brainsait.org" className="hover:text-slate-500 transition-colors">
            Brainsait Health Incubator
          </a>
        </div>

      </main>
    </div>
  )
}
