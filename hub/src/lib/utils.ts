import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function navigate(hash: string) {
  window.location.hash = hash
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
