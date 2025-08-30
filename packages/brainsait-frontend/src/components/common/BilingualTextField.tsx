'use client';

import {
  Language as LanguageIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { useAppTheme } from '../../lib/ThemeProvider';
import { BilingualText } from '../../types/component.types';

export interface BilingualTextFieldProps extends Omit<TextFieldProps, 'label' | 'placeholder' | 'helperText' | 'onChange' | 'value'> {
  name: string;
  label: BilingualText;
  placeholder?: BilingualText;
  helperText?: BilingualText;
  value?: { en: string; ar: string } | string;
  onChange?: (value: { en: string; ar: string }) => void;
  showLanguageToggle?: boolean;
  bilingualMode?: boolean;
  maxLength?: number;
  characterCount?: boolean;
}

const BilingualTextField: React.FC<BilingualTextFieldProps> = ({
  name,
  label,
  placeholder,
  helperText,
  value = { en: '', ar: '' },
  onChange,
  showLanguageToggle = true,
  bilingualMode = false,
  maxLength,
  characterCount = false,
  error,
  ...textFieldProps
}) => {
  const { t } = useTranslation('common');
  const { language, direction } = useAppTheme();
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ar'>(language);
  const [isBilingual, setIsBilingual] = useState(bilingualMode);

  // Normalize value to bilingual object
  const normalizedValue = typeof value === 'string' 
    ? { en: value, ar: value }
    : value;

  const currentLabel = label[activeLanguage] || label.en;
  const currentPlaceholder = placeholder?.[activeLanguage] || placeholder?.en;
  const currentHelperText = helperText?.[activeLanguage] || helperText?.en;
  const currentValue = normalizedValue[activeLanguage] || '';

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    const updatedValue = {
      ...normalizedValue,
      [activeLanguage]: newValue,
    };

    onChange?.(updatedValue);
  };

  const toggleLanguage = () => {
    setActiveLanguage(activeLanguage === 'en' ? 'ar' : 'en');
  };

  const toggleBilingualMode = () => {
    setIsBilingual(!isBilingual);
  };

  const getCharacterCount = () => {
    if (!characterCount) return null;
    
    const current = currentValue.length;
    const max = maxLength || 0;
    const percentage = maxLength ? (current / maxLength) * 100 : 0;
    
    let color: 'primary' | 'warning' | 'error' = 'primary';
    if (percentage > 90) color = 'error';
    else if (percentage > 75) color = 'warning';

    return (
      <Typography
        variant="caption"
        color={`${color}.main`}
        sx={{
          fontSize: '0.75rem',
          fontWeight: 500,
        }}
      >
        {current}{maxLength ? `/${maxLength}` : ''}
      </Typography>
    );
  };

  const renderSingleLanguageField = () => (
    <TextField
      {...textFieldProps}
      name={name}
      label={currentLabel}
      placeholder={currentPlaceholder}
      helperText={currentHelperText}
      value={currentValue}
      onChange={handleInputChange}
      error={error}
      dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
      InputProps={{
        ...textFieldProps.InputProps,
        endAdornment: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showLanguageToggle && (
              <>
                <Chip
                  size="small"
                  label={activeLanguage.toUpperCase()}
                  variant={activeLanguage === language ? 'filled' : 'outlined'}
                  color={activeLanguage === language ? 'primary' : 'default'}
                  sx={{ minWidth: 40, fontSize: '0.7rem' }}
                />
                <Tooltip title={t('common.toggle_language')}>
                  <IconButton
                    size="small"
                    onClick={toggleLanguage}
                    sx={{ p: 0.5 }}
                  >
                    <LanguageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('common.bilingual_mode')}>
                  <IconButton
                    size="small"
                    onClick={toggleBilingualMode}
                    color={isBilingual ? 'primary' : 'default'}
                    sx={{ p: 0.5 }}
                  >
                    <TranslateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {getCharacterCount()}
          </Box>
        ),
      }}
    />
  );

  const renderBilingualFields = () => (
    <FormControl fullWidth error={error}>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        {currentLabel}
      </FormLabel>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* English Field */}
        <Box>
          <TextField
            {...textFieldProps}
            name={`${name}_en`}
            label={`${label.en} (English)`}
            placeholder={placeholder?.en}
            value={normalizedValue.en}
            onChange={(e) => {
              const updatedValue = {
                ...normalizedValue,
                en: e.target.value,
              };
              onChange?.(updatedValue);
            }}
            dir="ltr"
            fullWidth
            size="small"
          />
        </Box>

        {/* Arabic Field */}
        <Box>
          <TextField
            {...textFieldProps}
            name={`${name}_ar`}
            label={`${label.ar || label.en} (العربية)`}
            placeholder={placeholder?.ar}
            value={normalizedValue.ar}
            onChange={(e) => {
              const updatedValue = {
                ...normalizedValue,
                ar: e.target.value,
              };
              onChange?.(updatedValue);
            }}
            dir="rtl"
            fullWidth
            size="small"
          />
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 1,
      }}>
        {currentHelperText && (
          <FormHelperText>{currentHelperText}</FormHelperText>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={t('common.single_language_mode')}>
            <IconButton
              size="small"
              onClick={toggleBilingualMode}
              color="primary"
              sx={{ p: 0.5 }}
            >
              <TranslateIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {getCharacterCount()}
        </Box>
      </Box>
    </FormControl>
  );

  return isBilingual ? renderBilingualFields() : renderSingleLanguageField();
};

export default BilingualTextField;