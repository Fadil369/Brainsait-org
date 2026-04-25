import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations, type Language, type HubTranslations } from '@/lib/i18n'

interface LanguageContextValue {
  language: Language
  t: HubTranslations
  setLanguage: (lang: Language) => void
  isRTL: boolean
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hub:lang') as Language | null
    return saved === 'ar' ? 'ar' : 'en'
  })

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('hub:lang', lang)
  }, [])

  const isRTL = language === 'ar'
  const dir = isRTL ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = dir
  }, [language, dir])

  const value: LanguageContextValue = {
    language,
    t: translations[language],
    setLanguage,
    isRTL,
    dir,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
