// GameStats - XP bar, level ring, streak display
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import type { GameState } from '@/types'
import { getXPForLevel, getXPForNextLevel } from '@/lib/gameEngine'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Trophy, Flame } from '@phosphor-icons/react'

interface Props {
  gameState: GameState
}

export function GameStats({ gameState }: Props) {
  const { t } = useLanguage()
  const xpForCurrentLevel = getXPForLevel(gameState.level)
  const xpForNextLevel = getXPForNextLevel(gameState.level)
  const xpInLevel = gameState.xp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progress = Math.min((xpInLevel / xpNeeded) * 100, 100)

  const earnedBadges = gameState.badges.filter(b => b.earned).length

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      {/* Level ring - premium */}
      <ProgressRing
        progress={progress}
        size={72}
        strokeWidth={5}
        label={`${gameState.level}`}
        sublabel={t.level}
        colors={['#0c9eeb', '#10b981']}
      />

      {/* Stats */}
      <div className="flex-1 w-full space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">{t.xp}</span>
          <span className="font-display font-bold text-spark-400">{gameState.xp.toLocaleString()}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0c9eeb, #10b981)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-white">{earnedBadges}</span> {t.badges}
            </span>
          </div>
          {gameState.streak > 0 && (
            <div className="flex items-center gap-1.5">
              <Flame size={16} className="text-orange-400" />
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
