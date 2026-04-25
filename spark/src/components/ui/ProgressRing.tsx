// Premium Progress Ring with animations
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  label?: string
  sublabel?: string
  animated?: boolean
  colors?: [string, string]
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  label,
  sublabel,
  animated = true,
  colors = ['#0c9eeb', '#10b981'],
}: ProgressRingProps) {
  const [displayProgress, setDisplayProgress] = useState(animated ? 0 : progress)
  
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayProgress(progress), 100)
      return () => clearTimeout(timer)
    }
  }, [progress, animated])

  const gradientId = `progressGrad-${Math.random().toString(36).slice(2)}`

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {/* Center label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-white" style={{ fontSize: size * 0.2 }}>
            {Math.round(displayProgress)}%
          </span>
          {label && (
            <span className="text-slate-400" style={{ fontSize: size * 0.1 }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Mini progress dot
interface ProgressDotProps {
  progress: number
  size?: number
  color?: string
}

export function ProgressDot({ progress, size = 12, color = '#0c9eeb' }: ProgressDotProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 1}
          fill="rgba(255,255,255,0.1)"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 1}
          fill={color}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
    </div>
  )
}

export default ProgressRing