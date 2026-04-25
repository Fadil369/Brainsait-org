// BadgeShowcase - grid of earned/unearned badges
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Badge } from '@/types'

interface Props {
  badges: Badge[]
}

export function BadgeShowcase({ badges }: Props) {
  const { t, language } = useLanguage()
  const [hoveredBadge, setHoveredBadge] = useState<Badge | null>(null)

  const earnedCount = badges.filter(b => b.earned).length
  const totalXP = badges.filter(b => b.earned).reduce((sum, b) => sum + b.xp, 0)

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm text-slate-400 uppercase tracking-wide">
          {t.yourBadges}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            <span className="text-spark-400 font-semibold">{earnedCount}</span>/{badges.length}
          </span>
          <span className="text-amber-400">+{totalXP} XP</span>
        </div>
      </div>
      
      <div className="relative grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={badge.earned ? { scale: 0.8, opacity: 0 } : {}}
            animate={badge.earned ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
            onMouseEnter={() => setHoveredBadge(badge)}
            onMouseLeave={() => setHoveredBadge(null)}
            className={`
              relative flex flex-col items-center gap-1 p-2 rounded-xl cursor-default
              transition-all duration-200
              ${badge.earned
                ? 'glass-card border border-amber-400/30 hover:border-amber-400/60 hover:scale-105'
                : 'opacity-30 grayscale'
              }
            `}
          >
            <span className="text-2xl">{badge.icon}</span>
            <span className={`text-center leading-tight ${
              badge.earned ? 'text-slate-300' : 'text-slate-600'
            }`} style={{ fontSize: '9px' }}>
              {language === 'ar' ? badge.nameAr : badge.name}
            </span>
            {badge.earned && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: i * 0.05 + 0.2 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Hover tooltip - fixed positioning */}
      {hoveredBadge && hoveredBadge.earned && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 mt-2 p-3 glass-card rounded-xl border border-amber-500/30 bg-slate-900/95 backdrop-blur"
          style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }}
        >
          <p className="font-semibold text-white text-sm">
            {language === 'ar' ? hoveredBadge.nameAr : hoveredBadge.name}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {language === 'ar' ? hoveredBadge.descriptionAr : hoveredBadge.description}
          </p>
          <p className="text-amber-400 text-xs mt-1">+{hoveredBadge.xp} XP</p>
        </motion.div>
      )}
    </div>
  )
}
