// useKV - localStorage key-value store
import { useState, useCallback, useEffect } from 'react'

type Serializable = string | number | boolean | null | object | unknown[]

export function useKV<T extends Serializable>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`hub:${key}`)
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue(prev => {
        const next =
          typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater
        try {
          localStorage.setItem(`hub:${key}`, JSON.stringify(next))
        } catch {
          console.warn('Failed to persist to localStorage:', key)
        }
        return next
      })
    },
    [key],
  )

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === `hub:${key}` && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T)
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key])

  return [value, set]
}

export function clearAllKV() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('hub:'))
    .forEach(k => localStorage.removeItem(k))
}
