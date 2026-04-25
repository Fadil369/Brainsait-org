// BadgeShowcase - premium achievement constellation
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Trophy } from '@phosphor-icons/react'
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
  const progress = badges.length ? (earnedCount / badges.length) * 100 : 0

  return (
    <div className="glass-card relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
      <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#f4c76b]/10 blur-[70px]" aria-hidden />

      <div className="relative z-10 mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.22em] text-spark-200/45">
            <Trophy size={15} weight="fill" className="text-[#f4c76b]" />
            {language === 'ar' ? 'مجموعة الإنجازات' : 'Achievement constellation'}
          </div>
          <h3 className="font-display text-3xl font-black text-white sm:text-4xl">{t.yourBadges}</h3>
        </div>

        <div className="min-w-40 rounded-2xl border border-white/8 bg-black/18 p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-spark-50/42">
            <span>{earnedCount}/{badges.length}</span>
            <span className="text-[#f4c76b]">+{totalXP} XP</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#f4c76b] to-spark-300"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: .8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 10, scale: .95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * .035, type: 'spring', stiffness: 260, damping: 22 }}
            onMouseEnter={() => setHoveredBadge(badge)}
            onMouseLeave={() => setHoveredBadge(null)}
            className={`group relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all duration-300 ${
              badge.earned
                ? 'border-[#f4c76b]/24 bg-[#f4c76b]/8 hover:-translate-y-1 hover:border-[#f4c76b]/55 hover:bg-[#f4c76b]/12'
                : 'border-white/6 bg-white/[.025] opacity-45 grayscale'
            }`}
          >
            <span className="text-3xl sm:text-4xl">{badge.icon}</span>
            <span className={`text-[10px] font-extrabold leading-tight ${badge.earned ? 'text-spark-50/78' : 'text-spark-50/32'}`}>
              {language === 'ar' ? badge.nameAr : badge.name}
            </span>
            {badge.earned && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f4c76b] shadow-[0_0_18px_rgba(244,199,107,.65)]" />
            )}
          </motion.div>
        ))}
      </div>

      {hoveredBadge && hoveredBadge.earned && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute bottom-5 left-5 right-5 z-30 rounded-2xl border border-[#f4c76b]/25 bg-[#020807]/92 p-4 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-6 sm:max-w-xs"
        >
          <p className="font-display text-lg font-black text-white">
            {language === 'ar' ? hoveredBadge.nameAr : hoveredBadge.name}
          </p>
          <p className="mt-1 text-xs leading-5 text-spark-50/58">
            {language === 'ar' ? hoveredBadge.descriptionAr : hoveredBadge.description}
          </p>
          <p className="mt-2 text-xs font-extrabold text-[#f4c76b]">+{hoveredBadge.xp} XP</p>
        </motion.div>
      )}
    </div>
  )
}
