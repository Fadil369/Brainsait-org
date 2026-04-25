// GameStats - XP bar, level ring, streak display
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import type { GameState } from '@/types'
import { getXPForLevel, getXPForNextLevel } from '@/lib/gameEngine'

interface Props {
  gameState: GameState
}

export function GameStats({ gameState }: Props) {
  const { t } = useLanguage()
  const xpForCurrentLevel = getXPForLevel(gameState.level)
  const xpForNextLevel = getXPForNextLevel(gameState.level)
  const xpInLevel = gameState.xp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progress = Math.min(xpInLevel / xpNeeded, 1)

  // SVG ring
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const earnedBadges = gameState.badges.filter(b => b.earned).length

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      {/* Level ring */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke="url(#sparkGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0c9eeb" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-lg text-white leading-none">{gameState.level}</span>
          <span className="text-xs text-slate-400">{t.level}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-1 w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-slate-400">{t.xp}</span>
          <span className="font-display font-bold text-spark-400">{gameState.xp.toLocaleString()}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0c9eeb, #10b981)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">🏆</span>
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-white">{earnedBadges}</span> {t.badges}
            </span>
          </div>
          {gameState.streak > 0 && (
            <div className="flex items-center gap-1.5">
              <span>🔥</span>
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-white">{gameState.streak}</span> {t.days}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
