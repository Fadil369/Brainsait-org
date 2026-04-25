// PhaseShell - premium mobile-first wrapper for guided phase views
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Lightning, MagicWand, Sparkle } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { PhaseId } from '@/types'
import { PHASE_XP } from '@/lib/gameEngine'

const PHASE_ORDER: PhaseId[] = ['brainstorm', 'story', 'brand', 'prd', 'code', 'github']

const PHASE_META: Record<PhaseId, { icon: string; color: string; label: string; labelAr: string; hint: string; hintAr: string }> = {
  brainstorm: {
    icon: '💡',
    color: 'from-[#f4c76b] to-[#ff7a59]',
    label: 'Problem Intelligence',
    labelAr: 'ذكاء المشكلة',
    hint: 'AI is mapping your healthcare opportunity.',
    hintAr: 'الذكاء الاصطناعي يرسم فرصة الرعاية الصحية.',
  },
  story: {
    icon: '📖',
    color: 'from-[#a78bfa] to-[#79f2ff]',
    label: 'Founder Narrative',
    labelAr: 'رواية المؤسس',
    hint: 'Shape the pitch into a memorable narrative.',
    hintAr: 'صغ العرض كقصة يصعب نسيانها.',
  },
  brand: {
    icon: '🎨',
    color: 'from-[#ff7a59] to-[#f4c76b]',
    label: 'Brand Genome',
    labelAr: 'جينوم العلامة',
    hint: 'Build trust signals for patients and buyers.',
    hintAr: 'ابنِ إشارات ثقة للمرضى والمشترين.',
  },
  prd: {
    icon: '📋',
    color: 'from-[#79f2ff] to-[#15d4aa]',
    label: 'Product Blueprint',
    labelAr: 'مخطط المنتج',
    hint: 'Document the product, compliance, and GTM logic.',
    hintAr: 'وثّق المنتج والامتثال ومنطق دخول السوق.',
  },
  code: {
    icon: '⚡',
    color: 'from-[#15d4aa] to-[#9cffdc]',
    label: 'Prototype Factory',
    labelAr: 'مصنع النموذج',
    hint: 'Generate code that can become a real product.',
    hintAr: 'أنشئ كوداً يمكن أن يصبح منتجاً حقيقياً.',
  },
  github: {
    icon: '🚀',
    color: 'from-[#eafff8] to-[#9cffdc]',
    label: 'Launch System',
    labelAr: 'نظام الإطلاق',
    hint: 'Package your build for deployment and sharing.',
    hintAr: 'جهّز مشروعك للنشر والمشاركة.',
  },
}

interface Props {
  phaseId: PhaseId
  subtitle?: string
  onBack: () => void
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export function PhaseShell({ phaseId, subtitle, onBack, children, maxWidth = 'lg' }: Props) {
  const { language, isRTL } = useLanguage()
  const meta = PHASE_META[phaseId]
  const phaseNum = PHASE_ORDER.indexOf(phaseId) + 1
  const xp = PHASE_XP[phaseId] ?? 100
  const progress = (phaseNum / PHASE_ORDER.length) * 100

  const widthClass = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }[maxWidth]

  return (
    <div className="min-h-screen pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-24 left-[-18%] h-[380px] w-[380px] rounded-full bg-spark-400/12 blur-[110px]" />
        <div className="absolute top-[32%] right-[-22%] h-[320px] w-[320px] rounded-full bg-[#f4c76b]/8 blur-[100px]" />
        <div className="absolute bottom-[-18%] left-[35%] h-[340px] w-[340px] rounded-full bg-[#a78bfa]/8 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020807]/78 backdrop-blur-2xl">
        <div className={`${widthClass} mx-auto px-4 py-3 sm:px-6`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="quiet-btn flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
              aria-label={language === 'ar' ? 'رجوع' : 'Back'}
            >
              <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            </button>

            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} text-xl shadow-xl shadow-black/20`}>
              {meta.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] font-extrabold uppercase tracking-[.24em] text-spark-200/45 sm:inline">
                  {language === 'ar' ? 'مرحلة' : 'Phase'} {phaseNum}/6
                </span>
                <span className="xp-badge">+{xp} XP</span>
              </div>
              <h1 className="mt-1 truncate font-display text-base font-black leading-none text-white sm:text-xl">
                {language === 'ar' ? meta.labelAr : meta.label}
              </h1>
            </div>

            <a href="https://brainsait.org" className="quiet-btn hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl sm:flex" aria-label="Brainsait">
              <Lightning size={17} weight="fill" className="text-spark-300" />
            </a>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/7">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-spark-300 via-[#79f2ff] to-[#f4c76b]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: .8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .42 }}
        className={`${widthClass} mx-auto px-4 py-5 sm:px-6 sm:py-8`}
      >
        <section className="premium-panel mb-5 rounded-[1.75rem] p-5 sm:mb-7 sm:p-6">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[.18em] text-spark-200/70">
                <Brain size={14} weight="fill" />
                {language === 'ar' ? 'توجيه ذكي' : 'AI-guided step'}
              </div>
              <h2 className="font-display text-3xl font-black leading-none text-white sm:text-5xl">
                {language === 'ar' ? meta.labelAr : meta.label}
              </h2>
              <p className="mt-3 text-sm leading-7 text-spark-50/58 sm:text-base">
                {subtitle || (language === 'ar' ? meta.hintAr : meta.hint)}
              </p>
            </div>
            <div className="ai-orb floating flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[1.75rem] sm:h-24 sm:w-24">
              <MagicWand size={28} weight="fill" className="text-[#02110e]" />
            </div>
          </div>
        </section>

        <div className="relative">
          {children}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-spark-50/28">
          <Sparkle size={13} weight="fill" />
          <span>{language === 'ar' ? 'مدعوم بذكاء Brainsait' : 'Powered by Brainsait AI workflows'}</span>
        </div>
      </motion.main>
    </div>
  )
}
