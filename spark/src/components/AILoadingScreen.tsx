// AILoadingScreen - shows healthcare facts while AI generates
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
  message?: string
}

export function AILoadingScreen({ message }: Props) {
  const { t, language } = useLanguage()
  const [factIndex, setFactIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(i => (i + 1) % t.healthcareFacts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [t.healthcareFacts.length])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Heartbeat icon */}
      <div className="mb-6 relative">
        <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center">
          <span className="text-3xl heartbeat">❤️</span>
        </div>
        <div className="absolute -inset-2 rounded-full border border-spark-500/30 animate-ping" />
      </div>

      <p className="text-spark-400 font-semibold mb-2 font-display">
        {message || t.generatingWithAI}
      </p>

      {/* Animated dots */}
      <div className="flex gap-1 mb-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-spark-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Rotating fact */}
      <div className="max-w-sm glass-card rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide opacity-60">
          {language === 'ar' ? 'حقيقة صحية' : 'Healthcare Fact'}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            className="text-sm text-slate-300"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {t.healthcareFacts[factIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
