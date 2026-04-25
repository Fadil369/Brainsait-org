// Premium Button - glowing, animated button component
import { type ReactNode, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  glow?: boolean
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-spark-500 to-emerald-500 text-white border-0',
  secondary: 'glass-card border border-white/10 text-white hover:border-spark-500/50',
  ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
}

export function Button({ variant = 'primary', size = 'md', children, glow = true, icon, className = '', style, ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={{
        ...style,
        boxShadow: glow && variant === 'primary' 
          ? '0 0 20px rgba(12, 158, 235, 0.3), 0 0 40px rgba(16, 185, 129, 0.2)' 
          : undefined,
      }}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

export default Button