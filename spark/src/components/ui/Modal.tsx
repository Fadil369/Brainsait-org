// Premium Modal - animated modal/dialog component
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  showClose?: boolean
  closeOnBackdrop?: boolean
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!mounted || typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className={`
              relative w-full glass-card rounded-2xl border border-white/10
              bg-black/80 backdrop-blur-xl overflow-hidden
              ${sizeStyles[size]}
            `}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-spark-500/5 pointer-events-none" />
            
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                {title && (
                  <h2 className="font-display font-semibold text-lg text-white">
                    {title}
                  </h2>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// Confirm Dialog
interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`
              px-4 py-2 rounded-xl font-semibold transition-colors
              ${variant === 'danger' 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-spark-500 text-white hover:bg-spark-600'
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default Modal