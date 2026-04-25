// Premium Phase Card - interactive phase cards with hover effects
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { PhaseId } from '@/types'

type PhaseStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed'

interface PhaseCardProps {
  id: PhaseId
  title: string
  titleAr?: string
  description: string
  descriptionAr?: string
  icon: ReactNode
  status: PhaseStatus
  xp?: number
  badge?: string
  onClick?: () => void
  lockedMessage?: string
  language?: 'en' | 'ar'
}

const statusStyles: Record<PhaseStatus, string> = {
  locked: 'opacity-40 cursor-not-allowed grayscale',
  unlocked: 'cursor-pointer hover:border-spark-500/40 hover:bg-spark-500/5',
  in_progress: 'border border-spark-500/40 bg-spark-500/10 start-here-pulse',
  completed: 'border border-emerald-500/30 bg-emerald-500/5',
}

const statusIcons: Record<PhaseStatus, string> = {
  locked: '🔒',
  unlocked: '⚡',
  in_progress: '▶️',
  completed: '✓',
}

export function PhaseCard({
  id,
  title,
  titleAr,
  description,
  descriptionAr,
  icon,
  status,
  xp,
  badge,
  onClick,
  lockedMessage,
  language = 'en',
}: PhaseCardProps) {
  const isClickable = status !== 'locked'

  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      title={lockedMessage}
      whileHover={isClickable ? { scale: 1.02 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      className={`
        group relative w-full text-left p-5 rounded-2xl glass-card bg-black/20 backdrop-blur-sm
        border border-white/5 transition-all duration-300
        ${statusStyles[status]}
      `}
    >
      {/* Status icon */}
      <div className="absolute top-3 right-3 text-sm text-slate-500">
        {statusIcons[status]}
      </div>

      {/* Content */}
      <div className="flex items-start gap-4">
        <motion.div
          className="text-3xl"
          whileHover={isClickable ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-white truncate">{title}</h3>
            {status === 'completed' && <span className="text-emerald-400">✓</span>}
          </div>
          
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* XP and badge */}
          {(xp || badge) && (
            <div className="flex items-center gap-3 mt-3">
              {xp && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs">
                  +{xp} XP
                </span>
              )}
              {badge && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-spark-500/10 text-spark-400 text-xs">
                  {badge}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator line */}
      {status === 'in_progress' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-spark-500 to-emerald-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      )}

      {/* Locked message tooltip */}
      {status === 'locked' && lockedMessage && (
        <p className="text-xs text-slate-600 mt-2 italic">{lockedMessage}</p>
      )}
    </motion.button>
  )
}

// Phase Progress Mini - small inline phase indicator
interface PhaseProgressMiniProps {
  phases: Array<{ id: string; status: PhaseStatus }>
  currentPhase?: string
}

export function PhaseProgressMini({ phases }: PhaseProgressMiniProps) {
  return (
    <div className="flex items-center gap-1">
      {phases.map((phase) => (
        <motion.div
          key={phase.id}
          className={`
            h-1.5 rounded-full transition-all duration-300
            ${phase.status === 'completed' 
              ? 'bg-emerald-500 flex-1' 
              : phase.status === 'in_progress'
                ? 'bg-spark-500 flex-1 animate-pulse'
                : phase.status === 'unlocked'
                  ? 'bg-slate-600 flex-1'
                  : 'bg-slate-800 flex-1'
            }
          `}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
        />
      ))}
    </div>
  )
}

export default PhaseCard