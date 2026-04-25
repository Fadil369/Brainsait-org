// PhaseShell — shared premium wrapper for all phase views
import { motion } from 'framer-motion'
import { ArrowLeft, Lightning } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { PhaseId } from '@/types'
import { PHASE_XP } from '@/lib/gameEngine'

const PHASE_ORDER: PhaseId[] = ['brainstorm', 'story', 'brand', 'prd', 'code', 'github']

const PHASE_META: Record<PhaseId, { icon: string; color: string; label: string; labelAr: string }> = {
  brainstorm: { icon: '💡', color: 'from-amber-500 to-orange-500',    label: 'Brainstorm', labelAr: 'العصف الذهني' },
  story:      { icon: '📖', color: 'from-violet-500 to-purple-600',   label: 'Story',      labelAr: 'القصة' },
  brand:      { icon: '🎨', color: 'from-pink-500 to-rose-500',       label: 'Brand',      labelAr: 'الهوية' },
  prd:        { icon: '📋', color: 'from-cyan-500 to-blue-500',       label: 'Product Spec', labelAr: 'مواصفات المنتج' },
  code:       { icon: '⚡', color: 'from-emerald-500 to-teal-500',    label: 'Code',       labelAr: 'الكود' },
  github:     { icon: '🚀', color: 'from-slate-400 to-slate-200',     label: 'Launch',     labelAr: 'الإطلاق' },
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
  const meta     = PHASE_META[phaseId]
  const phaseNum = PHASE_ORDER.indexOf(phaseId) + 1
  const xp       = PHASE_XP[phaseId] ?? 100

  const widthClass = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
  }[maxWidth]

  return (
    <div className="min-h-screen" style={{ background: '#020408' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-[-5%] left-[15%] w-[450px] h-[450px] rounded-full bg-cyan-600/6 blur-[120px]" />
        <div className="absolute bottom-[15%] right-[5%]  w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[90px]" />
      </div>

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-black/50">
        <div className={`${widthClass} mx-auto px-5 py-3 flex items-center gap-4`}>

          {/* Back */}
          <button
            onClick={onBack}
            className="flex-shrink-0 p-2 rounded-xl glass-card glass-card-hover text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
          </button>

          {/* Phase icon + name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-lg flex-shrink-0 shadow-md`}>
              {meta.icon}
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-white text-sm leading-none truncate">
                {language === 'ar' ? meta.labelAr : meta.label}
              </h1>
              {subtitle && (
                <p className="text-slate-500 text-xs mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Phase number + XP */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-600 font-mono">{phaseNum}/6</span>
            <span className="xp-badge">+{xp} XP</span>
          </div>

          {/* Brainsait logo mark */}
          <a href="https://brainsait.org" className="flex-shrink-0 opacity-30 hover:opacity-60 transition-opacity">
            <Lightning size={16} weight="fill" className="text-cyan-400" />
          </a>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 px-5 pb-2 max-w-3xl mx-auto">
          {PHASE_ORDER.map((id, i) => (
            <div
              key={id}
              className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                i < phaseNum - 1
                  ? 'bg-emerald-500'
                  : i === phaseNum - 1
                  ? 'bg-cyan-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`${widthClass} mx-auto px-5 py-8 relative`}
      >
        {children}
      </motion.main>
    </div>
  )
}
