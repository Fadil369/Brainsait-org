// BadgeShowcase - simple achievement overview
import { motion } from 'framer-motion'
import { Trophy } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Badge } from '@/types'

interface Props {
  badges: Badge[]
}

export function BadgeShowcase({ badges }: Props) {
  const { t, language } = useLanguage()
  const earnedCount = badges.filter(b => b.earned).length
  const totalXP = badges.filter(b => b.earned).reduce((sum, b) => sum + b.xp, 0)
  const progress = badges.length ? (earnedCount / badges.length) * 100 : 0

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-spark-50/38">
            <Trophy size={15} weight="fill" className="text-[#f2c879]" />
            {language === 'ar' ? 'الإنجازات' : 'Achievements'}
          </div>
          <h3 className="text-2xl font-extrabold text-white sm:text-3xl">{t.yourBadges}</h3>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[.035] p-3 sm:min-w-44">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-spark-50/52">
            <span>{earnedCount}/{badges.length}</span>
            <span className="text-[#f2c879]">+{totalXP} XP</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-spark-300"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: .65, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * .025 }}
            className={`rounded-2xl border p-3 ${
              badge.earned
                ? 'border-[#f2c879]/24 bg-[#f2c879]/8'
                : 'border-white/6 bg-white/[.025] opacity-45 grayscale'
            }`}
          >
            <div className="mb-2 text-2xl">{badge.icon}</div>
            <div className={`text-xs font-bold leading-tight ${badge.earned ? 'text-spark-50/78' : 'text-spark-50/36'}`}>
              {language === 'ar' ? badge.nameAr : badge.name}
            </div>
            {badge.earned && <div className="mt-1 text-[11px] font-bold text-[#f2c879]">+{badge.xp} XP</div>}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
