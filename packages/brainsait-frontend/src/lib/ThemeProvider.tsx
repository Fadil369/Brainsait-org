'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { useRouter } from 'next/router';
import { createAppTheme, ThemeContextType } from './theme';

// Create emotion cache for RTL
const createRtlCache = () => {
  return createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });
};

const createLtrCache = () => {
  return createCache({
    key: 'muiltr',
  });
};

const rtlCache = createRtlCache();
const ltrCache = createLtrCache();

// Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const router = useRouter();
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Initialize theme based on locale
  useEffect(() => {
    const locale = router.locale || 'en';
    const newLanguage = locale as 'en' | 'ar';
    const newDirection = locale === 'ar' ? 'rtl' : 'ltr';

    setLanguage(newLanguage);
    setDirection(newDirection);

    // Update HTML dir attribute
    document.documentElement.dir = newDirection;
    document.documentElement.lang = newLanguage;
  }, [router.locale]);

  const theme = createAppTheme(direction, language);
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    const newLanguage = newDirection === 'rtl' ? 'ar' : 'en';
    
    setDirection(newDirection);
    setLanguage(newLanguage);
    
    // Update HTML dir attribute
    document.documentElement.dir = newDirection;
    document.documentElement.lang = newLanguage;
    
    // Navigate to new locale
    router.push(router.asPath, router.asPath, { locale: newLanguage });
  };

  const handleSetLanguage = (lang: 'en' | 'ar') => {
    const newDirection = lang === 'ar' ? 'rtl' : 'ltr';
    
    setLanguage(lang);
    setDirection(newDirection);
    
    // Update HTML dir attribute
    document.documentElement.dir = newDirection;
    document.documentElement.lang = lang;
    
    // Navigate to new locale
    router.push(router.asPath, router.asPath, { locale: lang });
  };

  const contextValue: ThemeContextType = {
    theme,
    direction,
    language,
    toggleDirection,
    setLanguage: handleSetLanguage,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <CacheProvider value={cache}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
};

export default AppThemeProvider;