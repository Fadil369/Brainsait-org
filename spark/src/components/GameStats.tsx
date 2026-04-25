// GameStats - XP bar, level ring, streak display with premium styling
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import type { GameState } from '@/types'
import { getXPForLevel, getXPForNextLevel } from '@/lib/gameEngine'
import { Trophy, Flame, Star } from '@phosphor-icons/react'

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
  const totalBadges = gameState.badges.length

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
      {/* Level badge - premium */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-spark-500 to-emerald-500 flex flex-col items-center justify-center glow-green">
          <Star size={28} className="text-white" weight="fill" />
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-slate-900 border border-spark-500 flex items-center justify-center">
            <span className="font-display font-bold text-sm text-white">{gameState.level}</span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-1 w-full space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-base text-slate-300">{t.xp}</span>
          <span className="font-display font-bold text-2xl text-spark-400">{gameState.xp.toLocaleString()}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0c9eeb, #10b981)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="flex gap-6">
          <div className="stat-card p-3 rounded-xl bg-slate-800/50">
            <Trophy size={20} className="text-amber-400 mx-auto mb-1" />
            <div className="stat-value text-amber-400">{earnedBadges}</div>
            <div className="stat-label text-slate-400">{t.badges}</div>
          </div>
          <div className="stat-card p-3 rounded-xl bg-slate-800/50">
            <Flame size={20} className="text-orange-400 mx-auto mb-1" />
            <div className="stat-value text-orange-400">{gameState.streak}</div>
            <div className="stat-label text-slate-400">{t.days}</div>
          </div>
          <div className="stat-card p-3 rounded-xl bg-slate-800/50">
            <Star size={20} className="text-spark-400 mx-auto mb-1" />
            <div className="stat-value text-spark-400">{totalBadges}</div>
            <div className="stat-label text-slate-400">Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}
