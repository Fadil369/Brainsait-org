// CelebrationDialog - confetti + badge reveal on phase completion
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Badge } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  badge?: Badge | null
  leveledUp?: boolean
  newLevel?: number
  phaseId?: string
}

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  size: number
}

const COLORS = ['#0c9eeb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function CelebrationDialog({ open, onClose, badge, leveledUp, newLevel }: Props) {
  const { t, language } = useLanguage()
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (open) {
      setConfetti(
        Array.from({ length: 40 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          delay: Math.random() * 1,
          size: Math.random() * 8 + 4,
        }))
      )
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map(piece => (
              <motion.div
                key={piece.id}
                className="absolute top-0 rounded-sm"
                style={{
                  left: `${piece.x}%`,
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                }}
                initial={{ y: -20, rotate: 0, opacity: 1 }}
                animate={{ y: '100vh', rotate: 720, opacity: 0 }}
                transition={{ duration: 3, delay: piece.delay, ease: 'easeIn' }}
              />
            ))}
          </div>

          {/* Dialog */}
          <motion.div
            className="relative glass-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-spark-500/30"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-spark-500/5 pointer-events-none" />

            {/* Badge or level up */}
            {badge ? (
              <>
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {badge.icon}
                </motion.div>
                <p className="text-spark-400 font-medium text-sm mb-1">{t.badgeEarned}</p>
                <h2 className="font-display font-bold text-2xl text-white mb-2">
                  {language === 'ar' ? badge.nameAr : badge.name}
                </h2>
                <p className="text-slate-400 text-sm mb-1">
                  {language === 'ar' ? badge.descriptionAr : badge.description}
                </p>
                <div className="xp-badge inline-block mt-2">+{badge.xp} XP</div>
              </>
            ) : leveledUp ? (
              <>
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  ⭐
                </motion.div>
                <p className="text-spark-400 font-medium text-sm mb-1">{t.levelUp}</p>
                <h2 className="font-display font-bold text-2xl text-white mb-2">
                  {t.level} {newLevel}
                </h2>
              </>
            ) : (
              <>
                <motion.div className="text-6xl mb-4">🎉</motion.div>
                <h2 className="font-display font-bold text-2xl text-white mb-2">
                  {t.phaseComplete}
                </h2>
              </>
            )}

            <button
              onClick={onClose}
              className="mt-6 spark-btn px-6 py-2.5 rounded-xl w-full font-semibold"
            >
              {t.continue}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
