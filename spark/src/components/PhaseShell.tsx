// PhaseShell - calm shared wrapper for guided phase views
import { motion } from 'framer-motion'
import { ArrowLeft, Lightning, Sparkle } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { PhaseId } from '@/types'
import { PHASE_XP } from '@/lib/gameEngine'

const PHASE_ORDER: PhaseId[] = ['brainstorm', 'story', 'brand', 'prd', 'code', 'github']

const PHASE_META: Record<PhaseId, { icon: string; label: string; labelAr: string; hint: string; hintAr: string }> = {
  brainstorm: { icon: '💡', label: 'Brainstorm', labelAr: 'العصف الذهني', hint: 'Clarify the healthcare problem and users.', hintAr: 'وضّح المشكلة الصحية والمستخدمين.' },
  story: { icon: '📖', label: 'Story', labelAr: 'القصة', hint: 'Shape the founder narrative.', hintAr: 'صغ رواية المؤسس.' },
  brand: { icon: '🎨', label: 'Brand', labelAr: 'الهوية', hint: 'Create a trustworthy identity.', hintAr: 'أنشئ هوية موثوقة.' },
  prd: { icon: '📋', label: 'PRD', labelAr: 'مواصفات المنتج', hint: 'Document the product plan.', hintAr: 'وثّق خطة المنتج.' },
  code: { icon: '⚡', label: 'Code', labelAr: 'الكود', hint: 'Generate a starter product.', hintAr: 'أنشئ منتج بداية.' },
  github: { icon: '🚀', label: 'Launch', labelAr: 'الإطلاق', hint: 'Prepare for publishing.', hintAr: 'جهّز للنشر.' },
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
    <div className="min-h-screen pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#071412]/88 backdrop-blur-xl">
        <div className={`${widthClass} mx-auto px-4 py-3 sm:px-6`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="quiet-btn flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
              aria-label={language === 'ar' ? 'رجوع' : 'Back'}
            >
              <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            </button>

            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/6 text-xl">
              {meta.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[.16em] text-spark-50/38">
                  {language === 'ar' ? 'مرحلة' : 'Phase'} {phaseNum}/6
                </span>
                <span className="xp-badge">+{xp} XP</span>
              </div>
              <h1 className="mt-1 truncate text-base font-extrabold leading-none text-white sm:text-lg">
                {language === 'ar' ? meta.labelAr : meta.label}
              </h1>
            </div>

            <a href="https://brainsait.org" className="quiet-btn hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl sm:flex" aria-label="Brainsait">
              <Lightning size={17} weight="fill" className="text-spark-300" />
            </a>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-spark-300"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: .65, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .28 }}
        className={`${widthClass} mx-auto px-4 py-5 sm:px-6 sm:py-8`}
      >
        <section className="glass-card mb-5 rounded-3xl p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-spark-300/12 text-2xl">
              {meta.icon}
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-spark-50/58">
                <Sparkle size={13} weight="fill" />
                {language === 'ar' ? 'مساعدة ذكية' : 'AI help included'}
              </div>
              <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {language === 'ar' ? meta.labelAr : meta.label}
              </h2>
              <p className="mt-2 text-sm leading-7 text-spark-50/60">
                {subtitle || (language === 'ar' ? meta.hintAr : meta.hint)}
              </p>
            </div>
          </div>
        </section>

        {children}
      </motion.main>
    </div>
  )
}
