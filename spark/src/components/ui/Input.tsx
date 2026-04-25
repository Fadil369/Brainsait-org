// Premium Input - styled input components
import { forwardRef, useState, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Eye, EyeSlash } from '@phosphor-icons/react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm text-slate-400">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-black/30 border rounded-xl px-4 py-2.5 text-white
              focus:outline-none transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-spark-500/50'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea variant
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm text-slate-400">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3 text-slate-500">
              {icon}
            </div>
          )}
          <textarea
            ref={ref}
            className={`
              w-full bg-black/30 border rounded-xl px-4 py-3 text-white
              focus:outline-none transition-all duration-200 resize-none
              ${icon ? 'pl-10' : ''}
              ${error 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-spark-500/50'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

// Password input with show/hide toggle
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ label, error, className = '', ...props }, ref) => {
    const [show, setShow] = useState(false)
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm text-slate-400">{label}</label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            className={`
              w-full bg-black/30 border rounded-xl px-4 py-2.5 text-white pr-10
              focus:outline-none transition-all duration-200
              ${error 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-spark-500/50'
              }
              ${className}
            `}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            {show ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export default Input