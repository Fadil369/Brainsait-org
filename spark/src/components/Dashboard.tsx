// Main Dashboard - AI command center
import { motion } from 'framer-motion'
import {
  ArrowCounterClockwise,
  ArrowRight,
  Brain,
  Check,
  Download,
  Flame,
  House,
  Lightning,
  Lock,
  MagicWand,
  RocketLaunch,
  Sparkle,
  Trophy,
  Waveform,
} from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { BadgeShowcase } from '@/components/BadgeShowcase'
import { getXPForLevel, getXPForNextLevel, PHASE_XP } from '@/lib/gameEngine'
import type { Journey, PhaseId } from '@/types'

interface Props {
  journey: Journey
  onPhaseSelect: (id: PhaseId) => void
  onResetJourney?: () => void
}

const PHASE_META: Record<PhaseId, { en: string; ar: string; prompt: string; promptAr: string; icon: string; color: string; xp: number }> = {
  brainstorm: {
    en: 'Problem intelligence',
    ar: 'ذكاء المشكلة',
    prompt: 'AI maps your healthcare idea into users, pain, and opportunity.',
    promptAr: 'يرسم الذكاء الاصطناعي فكرتك الصحية إلى مستخدمين وألم وفرصة.',
    icon: '💡',
    color: 'from-[#f4c76b] to-[#ff7a59]',
    xp: PHASE_XP.brainstorm,
  },
  story: {
    en: 'Founder narrative',
    ar: 'رواية المؤسس',
    prompt: 'Turn your concept into a compelling investor-ready story.',
    promptAr: 'حوّل مفهومك إلى قصة مقنعة وجاهزة للمستثمرين.',
    icon: '📖',
    color: 'from-[#a78bfa] to-[#79f2ff]',
    xp: PHASE_XP.story,
  },
  brand: {
    en: 'Brand genome',
    ar: 'جينوم العلامة',
    prompt: 'Generate naming, voice, colors, and trust signals for healthcare.',
    promptAr: 'أنشئ الاسم والصوت والألوان وإشارات الثقة للرعاية الصحية.',
    icon: '🎨',
    color: 'from-[#ff7a59] to-[#f4c76b]',
    xp: PHASE_XP.brand,
  },
  prd: {
    en: 'Product blueprint',
    ar: 'مخطط المنتج',
    prompt: 'Create a structured PRD with compliance and GTM thinking.',
    promptAr: 'أنشئ مواصفات منتج منظمة مع الامتثال واستراتيجية السوق.',
    icon: '📋',
    color: 'from-[#79f2ff] to-[#15d4aa]',
    xp: PHASE_XP.prd,
  },
  code: {
    en: 'Prototype factory',
    ar: 'مصنع النموذج',
    prompt: 'Convert the PRD into usable React/Tailwind product code.',
    promptAr: 'حوّل مواصفات المنتج إلى كود React/Tailwind قابل للاستخدام.',
    icon: '⚡',
    color: 'from-[#15d4aa] to-[#9cffdc]',
    xp: PHASE_XP.code,
  },
  github: {
    en: 'Launch system',
    ar: 'نظام الإطلاق',
    prompt: 'Package, publish, and prepare your startup for deployment.',
    promptAr: 'جهّز وانشر مشروعك وأعد شركتك الناشئة للإطلاق.',
    icon: '🚀',
    color: 'from-[#eafff8] to-[#9cffdc]',
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
  const xpFloor = getXPForLevel(gs.level)
  const xpCeiling = getXPForNextLevel(gs.level)
  const xpPct = Math.min(((gs.xp - xpFloor) / (xpCeiling - xpFloor)) * 100, 100)
  const earnedBadges = gs.badges.filter(b => b.earned).length
  const currentMeta = currentPhase ? PHASE_META[currentPhase.id] : PHASE_META.github
  const nextIndex = currentPhase ? PHASE_ORDER.indexOf(currentPhase.id) + 1 : PHASE_ORDER.length

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
    ? (language === 'ar' ? 'شركتك جاهزة للإطلاق' : 'Your Startup Is Launch-Ready')
    : (language === 'ar' ? 'مختبر ذكاء لبناء شركتك الصحية' : 'AI Venture Lab For Health Startups')

  const heroSubtitle = language === 'ar'
    ? 'حوّل فكرة الرعاية الصحية إلى قصة، هوية، مواصفات، كود، وإطلاق خلال رحلة واحدة ذكية.'
    : 'Transform a healthcare idea into story, brand, product spec, working code, and launch assets in one guided AI journey.'

  return (
    <div className="min-h-screen pb-28 sm:pb-0" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-28 left-[-20%] sm:left-[8%] h-[420px] w-[420px] rounded-full bg-spark-400/12 blur-[110px]" />
        <div className="absolute top-20 right-[-22%] sm:right-[4%] h-[360px] w-[360px] rounded-full bg-[#f4c76b]/10 blur-[100px]" />
        <div className="absolute bottom-[-18%] left-[24%] h-[380px] w-[380px] rounded-full bg-[#a78bfa]/8 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020807]/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="ai-orb flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl">
              <Lightning size={18} className="text-[#02110e]" weight="fill" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-black leading-none text-white sm:text-lg">Spark</p>
              <p className="hidden truncate text-[11px] font-semibold uppercase tracking-[.24em] text-spark-200/55 sm:block">Brainsait Venture Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={handleExport} title="Export journey" className="quiet-btn rounded-xl p-2.5">
              <Download size={16} />
            </button>
            <button onClick={handleReset} title="New journey" className="quiet-btn hidden rounded-xl p-2.5 sm:inline-flex">
              <ArrowCounterClockwise size={16} />
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="quiet-btn rounded-xl px-3 py-2 text-xs font-extrabold"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <a href="https://brainsait.org" target="_blank" rel="noopener noreferrer" className="quiet-btn rounded-xl p-2.5">
              <House size={16} />
            </a>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <section className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)] lg:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55 }}
            className="premium-panel rounded-[2rem] p-5 sm:p-8 lg:p-10"
          >
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="space-y-5">
                <span className="hero-kicker rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.2em]">
                  <Sparkle size={14} weight="fill" />
                  {language === 'ar' ? 'ذكاء اصطناعي للرعاية الصحية' : 'Healthcare AI Builder'}
                </span>
                <h1 className="hero-title max-w-4xl">{heroTitle}</h1>
                <p className="max-w-2xl text-base font-medium text-spark-50/68 sm:text-lg lg:text-xl">
                  {heroSubtitle}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
                {currentPhase && !isComplete && (
                  <motion.button
                    onClick={() => onPhaseSelect(currentPhase.id)}
                    className="spark-btn flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base"
                    whileTap={{ scale: .98 }}
                  >
                    <MagicWand size={20} weight="fill" />
                    <span>{completedCount === 0
                      ? (language === 'ar' ? 'ابدأ بناء الفكرة' : 'Start Building')
                      : (language === 'ar' ? 'تابع مع الذكاء' : 'Continue with AI')
                    }</span>
                    <ArrowRight size={18} weight="bold" className={isRTL ? 'rotate-180' : ''} />
                  </motion.button>
                )}

                <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/8 bg-black/18">
                  {[
                    { label: language === 'ar' ? 'المراحل' : 'Phases', value: `${completedCount}/6` },
                    { label: 'XP', value: gs.xp.toLocaleString() },
                    { label: language === 'ar' ? 'الأوسمة' : 'Badges', value: `${earnedBadges}/${gs.badges.length}` },
                  ].map((item) => (
                    <div key={item.label} className="border-e border-white/8 p-3 last:border-e-0 sm:p-4">
                      <div className="stat-value gradient-text tabular-nums">{item.value}</div>
                      <div className="stat-label mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .55, delay: .08 }}
            className="glass-card rounded-[2rem] p-5 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-spark-100">
                  <Brain size={20} weight="duotone" className="text-spark-300" />
                  {language === 'ar' ? 'مساعد الشرارة' : 'Spark AI Copilot'}
                </div>
                <h2 className="font-display text-2xl font-black leading-tight text-white sm:text-3xl">
                  {isComplete
                    ? (language === 'ar' ? 'جاهز للنشر' : 'Ready to launch')
                    : (language === 'ar' ? `التالي: ${currentMeta.ar}` : `Next: ${currentMeta.en}`)
                  }
                </h2>
              </div>
              <div className="ai-orb floating h-14 w-14 flex-shrink-0 rounded-2xl" />
            </div>

            <p className="mb-5 text-sm leading-7 text-spark-50/62">
              {isComplete
                ? (language === 'ar' ? 'تمت الرحلة. صدّر ملفك أو ابدأ رحلة جديدة.' : 'The venture path is complete. Export your journey or begin a new build.')
                : (language === 'ar' ? currentMeta.promptAr : currentMeta.prompt)
              }
            </p>

            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-spark-50/45">
                <span>{language === 'ar' ? 'جاهزية الرحلة' : 'Journey readiness'}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/7">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-spark-300 via-[#79f2ff] to-[#f4c76b]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              {[
                { icon: <Waveform size={15} />, text: language === 'ar' ? 'يحافظ على السياق بين المراحل' : 'Maintains context across phases' },
                { icon: <RocketLaunch size={15} />, text: language === 'ar' ? 'ينتج أصولاً قابلة للتنفيذ' : 'Produces actionable launch assets' },
                { icon: <Flame size={15} />, text: language === 'ar' ? 'يكافئ التقدم بنظام لعب' : 'Gamified momentum with XP' },
              ].map((item) => (
                <div key={item.text} className="ai-chip flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold">
                  <span className="text-spark-300">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.aside>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Trophy size={18} weight="fill" />, label: language === 'ar' ? 'المستوى' : 'Level', value: gs.level, tone: 'text-spark-300' },
            { icon: <Flame size={18} weight="fill" />, label: language === 'ar' ? 'الاستمرارية' : 'Streak', value: `${gs.streak} ${language === 'ar' ? 'يوم' : 'days'}`, tone: 'text-[#ffad75]' },
            { icon: <Lightning size={18} weight="fill" />, label: language === 'ar' ? 'تقدم المستوى' : 'Level progress', value: `${Math.round(xpPct)}%`, tone: 'text-[#79f2ff]' },
            { icon: <Brain size={18} weight="fill" />, label: language === 'ar' ? 'المرحلة الحالية' : 'Active phase', value: `${nextIndex}/6`, tone: 'text-[#f4c76b]' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .12 + i * .04 }}
              className="glass-card rounded-3xl p-4 sm:p-5"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/7 ${stat.tone}`}>{stat.icon}</div>
              <div className="text-2xl font-black text-white sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[.16em] text-spark-50/38">{stat.label}</div>
            </motion.div>
          ))}
        </section>

        <section className="mt-8 lg:mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.22em] text-spark-200/45">{language === 'ar' ? 'مسار العمل' : 'Venture path'}</p>
              <h2 className="mt-1 font-display text-3xl font-black text-white sm:text-4xl">{t.journeyProgress}</h2>
            </div>
            <button onClick={handleReset} className="quiet-btn hidden rounded-2xl px-4 py-2 text-xs font-bold sm:inline-flex">
              {language === 'ar' ? 'رحلة جديدة' : 'New journey'}
            </button>
          </div>

          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {journey.phases.map((phase, idx) => {
              const meta = PHASE_META[phase.id]
              const isActive = currentPhase?.id === phase.id
              const isClickable = phase.unlocked

              return (
                <motion.button
                  key={phase.id}
                  onClick={() => isClickable && onPhaseSelect(phase.id)}
                  disabled={!isClickable}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * .045 + .15 }}
                  whileTap={isClickable ? { scale: .985 } : {}}
                  className={[
                    'phase-card-premium glass-card glass-card-hover relative w-[82vw] flex-shrink-0 snap-center overflow-hidden rounded-[1.75rem] p-5 text-start sm:w-auto',
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-45',
                    isActive ? 'is-active start-here-pulse border-spark-300/40' : '',
                    phase.completed ? 'border-spark-300/28' : '',
                  ].join(' ')}
                >
                  <div className="relative z-10 flex h-full flex-col justify-between gap-5">
                    <div>
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} text-2xl shadow-2xl shadow-black/20`}>
                          {meta.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-spark-50/28">{String(idx + 1).padStart(2, '0')}</span>
                          {phase.completed
                            ? <Check size={18} weight="bold" className="text-spark-300" />
                            : !phase.unlocked
                            ? <Lock size={16} className="text-spark-50/25" />
                            : isActive
                            ? <ArrowRight size={17} weight="bold" className={`text-spark-300 ${isRTL ? 'rotate-180' : ''}`} />
                            : null
                          }
                        </div>
                      </div>

                      <h3 className="font-display text-2xl font-black leading-none text-white sm:text-[1.7rem]">
                        {t[phase.id as keyof typeof t] as string}
                      </h3>
                      <p className="mt-3 min-h-12 text-sm leading-6 text-spark-50/55">
                        {language === 'ar' ? meta.promptAr : meta.prompt}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="xp-badge">{phase.completed ? '✓ ' : '+'}{meta.xp} XP</span>
                      {isActive && <span className="ai-chip rounded-full px-3 py-1 text-[11px] font-extrabold">{language === 'ar' ? 'ابدأ هنا' : 'Start here'}</span>}
                      {!phase.unlocked && <span className="ai-chip rounded-full px-3 py-1 text-[11px] font-extrabold">{t.locked}</span>}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>

        <section className="mt-4">
          <BadgeShowcase badges={gs.badges} />
        </section>
      </main>

      {currentPhase && !isComplete && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-[#020807]/84 p-3 backdrop-blur-2xl sm:hidden">
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
