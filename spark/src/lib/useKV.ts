// useKV - localStorage-based key-value store (replacement for Spark's useKV)
import { useState, useCallback, useEffect } from 'react'

type Serializable = string | number | boolean | null | object | unknown[]

export function useKV<T extends Serializable>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`spark:${key}`)
      return stored !== null ? JSON.parse(stored) as T : defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = useCallback((updater: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater
      try {
        localStorage.setItem(`spark:${key}`, JSON.stringify(next))
      } catch {
        console.warn('Failed to persist to localStorage:', key)
      }
      return next
    })
  }, [key])

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === `spark:${key}` && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T)
        } catch {
          // ignore parse errors
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key])

  return [value, set]
}

export function clearKV(key: string) {
  localStorage.removeItem(`spark:${key}`)
}

export function clearAllKV() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('spark:'))
  keys.forEach(k => localStorage.removeItem(k))
}
