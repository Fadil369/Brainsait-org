// PhaseNavigation - horizontal desktop / vertical mobile
import { motion } from 'framer-motion'
import { Lock, Check, ArrowRight } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { PhaseId, PhaseStatus } from '@/types'

const PHASE_ICONS: Record<PhaseId, string> = {
  brainstorm: '💡',
  story: '📖',
  brand: '🎨',
  prd: '📋',
  code: '⚡',
  github: '🚀',
}

interface Props {
  phases: PhaseStatus[]
  currentPhase: PhaseId
  onPhaseSelect: (id: PhaseId) => void
}

export function PhaseNavigation({ phases, currentPhase, onPhaseSelect }: Props) {
  const { t } = useLanguage()

  const phaseNames: Record<PhaseId, string> = {
    brainstorm: t.brainstorm,
    story: t.story,
    brand: t.brand,
    prd: t.prd,
    code: t.code,
    github: t.github,
  }

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center justify-between gap-2">
        {phases.map((phase, idx) => {
          const isActive = phase.id === currentPhase
          const isClickable = phase.unlocked

          return (
            <div key={phase.id} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && onPhaseSelect(phase.id)}
                disabled={!isClickable}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl flex-1 transition-all duration-200
                  ${isActive ? 'glass-card border border-spark-500/50 start-here-pulse' : ''}
                  ${phase.completed ? 'glass-card border border-emerald-500/30' : ''}
                  ${!isClickable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer glass-card-hover glass-card'}
                `}
              >
                <div className="relative">
                  <span className="text-2xl">{PHASE_ICONS[phase.id]}</span>
                  {phase.completed && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={10} weight="bold" className="text-white" />
                    </span>
                  )}
                  {!phase.unlocked && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-600 rounded-full flex items-center justify-center">
                      <Lock size={10} weight="bold" className="text-slate-300" />
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-spark-400' : 'text-slate-400'}`}>
                  {phaseNames[phase.id]}
                </span>
                <div className={`h-1 w-full rounded-full ${
                  phase.completed ? 'bg-emerald-500' : isActive ? 'bg-spark-500' : 'bg-slate-700'
                }`} />
              </button>
              {idx < phases.length - 1 && (
                <ArrowRight size={16} className="text-slate-600 mx-1 flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="md:hidden flex flex-col gap-2">
        {phases.map(phase => {
          const isActive = phase.id === currentPhase
          const isClickable = phase.unlocked

          return (
            <motion.button
              key={phase.id}
              onClick={() => isClickable && onPhaseSelect(phase.id)}
              disabled={!isClickable}
              className={`
                flex items-center gap-3 p-3 rounded-xl text-left w-full transition-all duration-200
                ${isActive ? 'glass-card border border-spark-500/50' : 'glass-card'}
                ${!isClickable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer glass-card-hover'}
              `}
              whileTap={isClickable ? { scale: 0.98 } : {}}
            >
              <span className="text-xl">{PHASE_ICONS[phase.id]}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isActive ? 'text-spark-400' : 'text-slate-300'}`}>
                  {phaseNames[phase.id]}
                </p>
              </div>
              {phase.completed ? (
                <Check size={16} className="text-emerald-400" weight="bold" />
              ) : !phase.unlocked ? (
                <Lock size={16} className="text-slate-500" />
              ) : isActive ? (
                <ArrowRight size={16} className="text-spark-400" />
              ) : null}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
