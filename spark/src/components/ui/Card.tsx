// Premium Card - glass morphism card with hover effects
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type CardVariant = 'default' | 'interactive' | 'glow' | 'success' | 'warning'
type CardSize = 'sm' | 'md' | 'lg'

interface CardProps {
  variant?: CardVariant
  size?: CardSize
  noPadding?: boolean
  children: ReactNode
  className?: string
  onClick?: () => void
}

const variantStyles: Record<CardVariant, string> = {
  default: 'border border-white/5',
  interactive: 'border border-white/10 hover:border-spark-500/30 hover:bg-white/5',
  glow: 'border border-spark-500/20 shadow-[0_0_30px_rgba(12,158,235,0.15)]',
  success: 'border border-emerald-500/30 bg-emerald-500/10',
  warning: 'border border-amber-500/30 bg-amber-500/10',
}

const sizeStyles: Record<CardSize, string> = {
  sm: 'p-3 rounded-xl',
  md: 'p-5 rounded-2xl',
  lg: 'p-8 rounded-3xl',
}

export function Card({ variant = 'default', size = 'md', noPadding = false, children, className = '', onClick }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className={`
        glass-card bg-black/20 backdrop-blur-sm
        ${variantStyles[variant]}
        ${noPadding ? '' : sizeStyles[size]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// Card Header component
interface CardHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h3 className="font-display font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// Card Footer component
interface CardFooterProps {
  children: ReactNode
  aligned?: 'left' | 'center' | 'right'
}

export function CardFooter({ children, aligned = 'right' }: CardFooterProps) {
  return (
    <div className={`flex mt-4 pt-4 border-t border-white/5 ${
      aligned === 'center' ? 'justify-center' : aligned === 'left' ? 'justify-start' : 'justify-end'
    }`}>
      {children}
    </div>
  )
}

export default Card