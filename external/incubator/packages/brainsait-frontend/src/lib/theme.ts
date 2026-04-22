import { createTheme, ThemeOptions, Direction } from '@mui/material/styles';
import { arSA, enUS } from '@mui/material/locale';

// BrainSAIT Brand Colors
const brandColors = {
  primary: {
    50: '#e8f5f3',
    100: '#c6e7e1',
    200: '#a0d7cd',
    300: '#7ac7b9',
    400: '#5ebaa9',
    500: '#42ad99', // Primary brand color
    600: '#3c9d8f',
    700: '#348a7f',
    800: '#2c776f',
    900: '#1e5751',
  },
  secondary: {
    50: '#fdf4e8',
    100: '#fae3c6',
    200: '#f7d1a0',
    300: '#f4bf7a',
    400: '#f2b15e',
    500: '#efa342', // Secondary brand color
    600: '#ed9b3c',
    700: '#ea9134',
    800: '#e7872c',
    900: '#e2771e',
  },
  healthcare: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // Healthcare blue
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
};

// Common theme options
const getThemeOptions = (direction: Direction, locale: any): ThemeOptions => ({
  direction,
  palette: {
    primary: {
      main: brandColors.primary[500],
      light: brandColors.primary[400],
      dark: brandColors.primary[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.secondary[500],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[600],
      contrastText: '#ffffff',
    },
    info: {
      main: brandColors.healthcare[500],
      light: brandColors.healthcare[400],
      dark: brandColors.healthcare[600],
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: brandColors.secondary[600],
      light: brandColors.secondary[400],
      dark: brandColors.secondary[800],
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c2c2c',
      secondary: '#666666',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: direction === 'rtl' 
      ? '"Cairo", "Tajawal", "Amiri", sans-serif'
      : '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: brandColors.primary[800],
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: brandColors.primary[800],
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: brandColors.primary[700],
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: brandColors.primary[700],
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@font-face': [
          // English fonts
          {
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: 400,
            src: 'url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap")',
          },
          // Arabic fonts
          {
            fontFamily: 'Cairo',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: 400,
            src: 'url("https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap")',
          },
        ],
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${brandColors.primary[500]} 30%, ${brandColors.primary[400]} 90%)`,
          '&:hover': {
            background: `linear-gradient(45deg, ${brandColors.primary[600]} 30%, ${brandColors.primary[500]} 90%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(45deg, ${brandColors.secondary[500]} 30%, ${brandColors.secondary[400]} 90%)`,
          '&:hover': {
            background: `linear-gradient(45deg, ${brandColors.secondary[600]} 30%, ${brandColors.secondary[500]} 90%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: `1px solid ${brandColors.primary[100]}`,
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: brandColors.primary[500],
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          backgroundColor: brandColors.primary[100],
          color: brandColors.primary[800],
        },
        colorSecondary: {
          backgroundColor: brandColors.secondary[100],
          color: brandColors.secondary[800],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            color: brandColors.primary[600],
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: brandColors.primary[500],
          height: 3,
          borderRadius: 2,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
        colorPrimary: {
          backgroundColor: brandColors.primary[100],
        },
        barColorPrimary: {
          background: `linear-gradient(45deg, ${brandColors.primary[500]} 30%, ${brandColors.primary[400]} 90%)`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: '#f1f8e9',
          color: '#2e7d32',
          border: '1px solid #c8e6c9',
        },
        standardError: {
          backgroundColor: '#ffebee',
          color: '#c62828',
          border: '1px solid #ffcdd2',
        },
        standardWarning: {
          backgroundColor: '#fff8e1',
          color: '#f57c00',
          border: '1px solid #ffecb3',
        },
        standardInfo: {
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          border: '1px solid #bbdefb',
        },
      },
    },
  },
});

// Create themes for different locales
export const createAppTheme = (direction: Direction = 'ltr', language: 'en' | 'ar' = 'en') => {
  const locale = language === 'ar' ? arSA : enUS;
  const themeOptions = getThemeOptions(direction, locale);
  
  return createTheme(themeOptions, locale);
};

// Default themes
export const lightTheme = createAppTheme('ltr', 'en');
export const lightThemeRTL = createAppTheme('rtl', 'ar');

// Theme context type
export interface ThemeContextType {
  theme: any;
  direction: Direction;
  language: 'en' | 'ar';
  toggleDirection: () => void;
  setLanguage: (lang: 'en' | 'ar') => void;
}

// Breakpoints for responsive design
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Common spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Animation constants
export const animation = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};