// BadgeShowcase - grid of earned/unearned badges
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Badge } from '@/types'

interface Props {
  badges: Badge[]
}

export function BadgeShowcase({ badges }: Props) {
  const { t, language } = useLanguage()

  return (
    <div className="glass-card rounded-2xl p-4">
      <h3 className="font-display font-semibold text-sm text-slate-400 uppercase tracking-wide mb-4">
        {t.yourBadges}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={badge.earned ? { scale: 0.8, opacity: 0 } : {}}
            animate={badge.earned ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
            title={language === 'ar' ? badge.nameAr : badge.name}
            className={`
              relative flex flex-col items-center gap-1 p-2 rounded-xl cursor-default
              transition-all duration-200
              ${badge.earned
                ? 'glass-card border border-amber-400/30 hover:border-amber-400/60'
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
    </div>
  )
}
