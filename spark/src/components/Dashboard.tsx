// Main Dashboard - calm eye-friendly workspace
import { motion } from 'framer-motion'
import {
  ArrowCounterClockwise,
  ArrowRight,
  Check,
  Download,
  House,
  Lightning,
  Lock,
  MagicWand,
  Sparkle,
} from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { BadgeShowcase } from '@/components/BadgeShowcase'
import { PHASE_XP } from '@/lib/gameEngine'
import type { Journey, PhaseId } from '@/types'

interface Props {
  journey: Journey
  onPhaseSelect: (id: PhaseId) => void
  onResetJourney?: () => void
}

const PHASE_META: Record<PhaseId, { en: string; ar: string; help: string; helpAr: string; icon: string; xp: number }> = {
  brainstorm: {
    en: 'Brainstorm',
    ar: 'العصف الذهني',
    help: 'Clarify the problem, users, and solution direction.',
    helpAr: 'وضّح المشكلة والمستخدمين واتجاه الحل.',
    icon: '💡',
    xp: PHASE_XP.brainstorm,
  },
  story: {
    en: 'Story',
    ar: 'القصة',
    help: 'Turn your idea into a clear founder narrative.',
    helpAr: 'حوّل فكرتك إلى رواية مؤسس واضحة.',
    icon: '📖',
    xp: PHASE_XP.story,
  },
  brand: {
    en: 'Brand',
    ar: 'الهوية',
    help: 'Create naming, tone, and visual direction.',
    helpAr: 'أنشئ الاسم والنبرة والاتجاه البصري.',
    icon: '🎨',
    xp: PHASE_XP.brand,
  },
  prd: {
    en: 'PRD',
    ar: 'مواصفات المنتج',
    help: 'Write the product, compliance, and roadmap plan.',
    helpAr: 'اكتب خطة المنتج والامتثال وخارطة الطريق.',
    icon: '📋',
    xp: PHASE_XP.prd,
  },
  code: {
    en: 'Code',
    ar: 'الكود',
    help: 'Generate usable starter code from the product plan.',
    helpAr: 'أنشئ كود بداية قابل للاستخدام من خطة المنتج.',
    icon: '⚡',
    xp: PHASE_XP.code,
  },
  github: {
    en: 'Launch',
    ar: 'الإطلاق',
    help: 'Prepare your repository and launch path.',
    helpAr: 'جهّز المستودع ومسار الإطلاق.',
    icon: '🚀',
    xp: PHASE_XP.github,
  },
}

const PHASE_ORDER: PhaseId[] = ['brainstorm', 'story', 'brand', 'prd', 'code', 'github']

export function Dashboard({ journey, onPhaseSelect, onResetJourney }: Props) {
  const { t, language, setLanguage, isRTL } = useLanguage()

  const completedCount = journey.phases.filter(p => p.completed).length
  const currentPhase = journey.phases.find(p => !p.completed && p.unlocked)
  const progressPercent = (completedCount / PHASE_ORDER.length) * 100
  const isComplete = completedCount === PHASE_ORDER.length
  const gs = journey.gameState
  const earnedBadges = gs.badges.filter(b => b.earned).length
  const currentMeta = currentPhase ? PHASE_META[currentPhase.id] : PHASE_META.github

  function handleReset() {
    if (window.confirm(language === 'ar'
      ? 'هل تريد بدء رحلة جديدة؟ سيتم حذف كل تقدمك.'
      : 'Start a new journey? All current progress will be lost.'
    )) onResetJourney?.()
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ journey, exportedAt: new Date().toISOString(), version: '1.0' }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spark-journey-${journey.id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const heroTitle = isComplete
    ? (language === 'ar' ? 'رحلتك جاهزة' : 'Your journey is ready')
    : (language === 'ar' ? 'ابنِ شركتك الصحية بهدوء' : 'Build your health startup calmly')

  const heroSubtitle = language === 'ar'
    ? 'مسار بسيط من الفكرة إلى الكود والإطلاق، مع مساعدة ذكية في كل خطوة.'
    : 'A simple path from idea to story, brand, product spec, code, and launch — with AI help at each step.'

  return (
    <div className="min-h-screen pb-24 sm:pb-0" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#071412]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-spark-300 text-[#06211e]">
              <Lightning size={18} weight="fill" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold leading-none text-white">Spark</p>
              <p className="hidden truncate text-xs text-spark-50/50 sm:block">Healthcare startup builder</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={handleExport} title="Export journey" className="quiet-btn rounded-xl p-2.5">
              <Download size={16} />
            </button>
            <button onClick={handleReset} title="New journey" className="quiet-btn hidden rounded-xl p-2.5 sm:inline-flex">
              <ArrowCounterClockwise size={16} />
            </button>
            <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="quiet-btn rounded-xl px-3 py-2 text-xs font-bold">
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <a href="https://brainsait.org" target="_blank" rel="noopener noreferrer" className="quiet-btn rounded-xl p-2.5">
              <House size={16} />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .35 }}
            className="premium-panel rounded-3xl p-5 sm:p-8"
          >
            <div className="max-w-3xl space-y-5">
              <span className="hero-kicker rounded-full px-3 py-1.5 text-xs font-bold">
                <Sparkle size={14} weight="fill" />
                {language === 'ar' ? 'مساعدة ذكية خطوة بخطوة' : 'AI-guided, step by step'}
              </span>
              <h1 className="hero-title">{heroTitle}</h1>
              <p className="max-w-2xl text-base leading-8 text-spark-50/68 sm:text-lg">
                {heroSubtitle}
              </p>
              {currentPhase && !isComplete && (
                <button
                  onClick={() => onPhaseSelect(currentPhase.id)}
                  className="spark-btn inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm sm:text-base"
                >
                  <MagicWand size={18} weight="fill" />
                  <span>{completedCount === 0
                    ? (language === 'ar' ? 'ابدأ الرحلة' : 'Start journey')
                    : (language === 'ar' ? 'تابع الخطوة التالية' : 'Continue next step')
                  }</span>
                  <ArrowRight size={17} weight="bold" className={isRTL ? 'rotate-180' : ''} />
                </button>
              )}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .35, delay: .05 }}
            className="glass-card rounded-3xl p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-spark-300/14 text-spark-200">
                <MagicWand size={20} weight="duotone" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-spark-50/42">
                  {language === 'ar' ? 'اقتراح الذكاء' : 'AI suggestion'}
                </p>
                <h2 className="text-xl font-extrabold text-white">
                  {isComplete
                    ? (language === 'ar' ? 'صدّر رحلتك' : 'Export your journey')
                    : (language === 'ar' ? currentMeta.ar : currentMeta.en)
                  }
                </h2>
              </div>
            </div>
            <p className="text-sm leading-7 text-spark-50/62">
              {isComplete
                ? (language === 'ar' ? 'كل المراحل اكتملت. يمكنك حفظ نسخة من الرحلة.' : 'All phases are complete. You can save a copy of your journey.')
                : (language === 'ar' ? currentMeta.helpAr : currentMeta.help)
              }
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-bold text-spark-50/45">
                <span>{language === 'ar' ? 'التقدم' : 'Progress'}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <motion.div
                  className="h-2 rounded-full bg-spark-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: .8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.aside>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: language === 'ar' ? 'المراحل' : 'Phases', value: `${completedCount}/6` },
            { label: 'XP', value: gs.xp.toLocaleString() },
            { label: language === 'ar' ? 'المستوى' : 'Level', value: gs.level },
            { label: language === 'ar' ? 'الأوسمة' : 'Badges', value: `${earnedBadges}/${gs.badges.length}` },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .08 + i * .03 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-spark-50/42">{stat.label}</div>
            </motion.div>
          ))}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-spark-50/38">
                {language === 'ar' ? 'المسار' : 'Path'}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">{t.journeyProgress}</h2>
            </div>
            <button onClick={handleReset} className="quiet-btn hidden rounded-2xl px-4 py-2 text-xs font-bold sm:inline-flex">
              {language === 'ar' ? 'رحلة جديدة' : 'New journey'}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {journey.phases.map((phase, idx) => {
              const meta = PHASE_META[phase.id]
              const isActive = currentPhase?.id === phase.id
              const isClickable = phase.unlocked

              return (
                <motion.button
                  key={phase.id}
                  onClick={() => isClickable && onPhaseSelect(phase.id)}
                  disabled={!isClickable}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * .035 + .1 }}
                  className={[
                    'phase-card-premium glass-card glass-card-hover rounded-2xl p-5 text-start transition-all',
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-45',
                    isActive ? 'start-here-pulse border-spark-300/40' : '',
                    phase.completed ? 'border-spark-300/28' : '',
                  ].join(' ')}
                >
                  <div className="flex h-full flex-col justify-between gap-5">
                    <div>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/6 text-2xl">
                          {meta.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-spark-50/28">{String(idx + 1).padStart(2, '0')}</span>
                          {phase.completed
                            ? <Check size={17} weight="bold" className="text-spark-300" />
                            : !phase.unlocked
                            ? <Lock size={15} className="text-spark-50/25" />
                            : isActive
                            ? <ArrowRight size={16} weight="bold" className={`text-spark-300 ${isRTL ? 'rotate-180' : ''}`} />
                            : null
                          }
                        </div>
                      </div>
                      <h3 className="text-xl font-extrabold leading-tight text-white">
                        {t[phase.id as keyof typeof t] as string}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-spark-50/58">
                        {language === 'ar' ? meta.helpAr : meta.help}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="xp-badge">{phase.completed ? '✓ ' : '+'}{meta.xp} XP</span>
                      {isActive && <span className="ai-chip rounded-full px-3 py-1 text-[11px] font-bold">{language === 'ar' ? 'الخطوة التالية' : 'Next step'}</span>}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>

        <section className="mt-6">
          <BadgeShowcase badges={gs.badges} />
        </section>
      </main>

      {currentPhase && !isComplete && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-[#071412]/90 p-3 backdrop-blur-xl sm:hidden">
          <button
            onClick={() => onPhaseSelect(currentPhase.id)}
            className="spark-btn flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm"
          >
            <MagicWand size={18} weight="fill" />
            <span>{language === 'ar' ? `تابع: ${currentMeta.ar}` : `Continue: ${currentMeta.en}`}</span>
          </button>
        </div>
      )}
    </div>
  )
}
