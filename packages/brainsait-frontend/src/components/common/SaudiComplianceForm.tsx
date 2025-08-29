'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  Button,
  Grid,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  AccountBalance,
  BusinessCenter,
  LocationOn,
  VerifiedUser,
  Help,
  CheckCircle,
  Error,
  CalendarMonth,
  Phone,
  Email
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatSaudiBusinessDate, toArabicNumerals, createBilingualDate } from '../../utils/hijriCalendar';

interface SaudiComplianceFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  isRTL?: boolean;
}

interface ValidationState {
  crNumber?: boolean;
  vatNumber?: boolean;
  address?: boolean;
}

export default function SaudiComplianceForm({ 
  onSubmit, 
  initialData = {}, 
  isLoading = false,
  isRTL = true 
}: SaudiComplianceFormProps) {
  const { t, i18n } = useTranslation(['compliance', 'common']);
  
  const [formData, setFormData] = useState({
    // Commercial Registration
    crNumber: initialData.crNumber || '',
    crIssueDate: initialData.crIssueDate || '',
    crExpiryDate: initialData.crExpiryDate || '',
    crActivity: initialData.crActivity || '',
    
    // MOCI
    monocNumber: initialData.monocNumber || '',
    
    // VAT Registration
    vatNumber: initialData.vatNumber || '',
    vatRegistrationDate: initialData.vatRegistrationDate || '',
    
    // Zakat & GOSI
    zakatNumber: initialData.zakatNumber || '',
    gosiNumber: initialData.gosiNumber || '',
    
    // WASL Address
    buildingNumber: initialData.buildingNumber || '',
    streetName: initialData.streetName || '',
    district: initialData.district || '',
    city: initialData.city || '',
    region: initialData.region || '',
    postalCode: initialData.postalCode || '',
    additionalNumber: initialData.additionalNumber || '',
    
    // Healthcare (if applicable)
    saudiHealthLicense: initialData.saudiHealthLicense || '',
    cbahiAccreditationId: initialData.cbahiAccreditationId || '',
    sfdaLicenseNumber: initialData.sfdaLicenseNumber || '',
    healthCouncilRegion: initialData.healthCouncilRegion || ''
  });

  const [validationState, setValidationState] = useState<ValidationState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saudiRegions = [
    { code: 'RIYADH', nameAr: 'الرياض', nameEn: 'Riyadh' },
    { code: 'MAKKAH', nameAr: 'مكة المكرمة', nameEn: 'Makkah' },
    { code: 'MADINAH', nameAr: 'المدينة المنورة', nameEn: 'Madinah' },
    { code: 'EASTERN_PROVINCE', nameAr: 'المنطقة الشرقية', nameEn: 'Eastern Province' },
    { code: 'ASIR', nameAr: 'عسير', nameEn: 'Asir' },
    { code: 'TABUK', nameAr: 'تبوك', nameEn: 'Tabuk' },
    { code: 'QASSIM', nameAr: 'القصيم', nameEn: 'Qassim' },
    { code: 'HAIL', nameAr: 'حائل', nameEn: 'Hail' },
    { code: 'NORTHERN_BORDERS', nameAr: 'الحدود الشمالية', nameEn: 'Northern Borders' },
    { code: 'JAZAN', nameAr: 'جازان', nameEn: 'Jazan' },
    { code: 'NAJRAN', nameAr: 'نجران', nameEn: 'Najran' },
    { code: 'AL_BAHAH', nameAr: 'الباحة', nameEn: 'Al Bahah' },
    { code: 'AL_JAWF', nameAr: 'الجوف', nameEn: 'Al Jawf' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateCRNumber = (crNumber: string): boolean => {
    if (!crNumber || crNumber.length !== 10) return false;
    const firstDigit = parseInt(crNumber[0]);
    return firstDigit >= 1 && firstDigit <= 7;
  };

  const validateVATNumber = (vatNumber: string): boolean => {
    if (!vatNumber || vatNumber.length !== 15) return false;
    return vatNumber.startsWith('3') && vatNumber.endsWith('00003');
  };

  const validateSaudiPostalCode = (code: string): boolean => {
    if (!code || code.length !== 5) return false;
    const numCode = parseInt(code);
    return numCode >= 11000 && numCode <= 99999;
  };

  const handleValidation = async (field: 'cr' | 'vat' | 'address') => {
    try {
      let isValid = false;
      
      switch (field) {
        case 'cr':
          isValid = validateCRNumber(formData.crNumber);
          setValidationState(prev => ({ ...prev, crNumber: isValid }));
          if (!isValid) {
            setErrors(prev => ({ ...prev, crNumber: t('validation.saudi_validation.cr_number_format') }));
          }
          break;
          
        case 'vat':
          isValid = validateVATNumber(formData.vatNumber);
          setValidationState(prev => ({ ...prev, vatNumber: isValid }));
          if (!isValid) {
            setErrors(prev => ({ ...prev, vatNumber: t('validation.saudi_validation.vat_number_format') }));
          }
          break;
          
        case 'address':
          const addressValid = formData.buildingNumber.length === 4 &&
                              formData.streetName.length >= 3 &&
                              formData.district.length >= 3 &&
                              formData.city.length >= 3 &&
                              validateSaudiPostalCode(formData.postalCode);
          
          setValidationState(prev => ({ ...prev, address: addressValid }));
          if (!addressValid) {
            setErrors(prev => ({ ...prev, address: t('validation.saudi_validation.building_number_format') }));
          }
          break;
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.crNumber) {
      newErrors.crNumber = t('validation.saudi_validation.cr_number_required');
    } else if (!validateCRNumber(formData.crNumber)) {
      newErrors.crNumber = t('validation.saudi_validation.cr_number_format');
    }
    
    if (formData.vatNumber && !validateVATNumber(formData.vatNumber)) {
      newErrors.vatNumber = t('validation.saudi_validation.vat_number_format');
    }
    
    if (!formData.buildingNumber) {
      newErrors.buildingNumber = t('validation.saudi_validation.building_number_required');
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatSaudiBusinessDate(date, 'official');
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        maxWidth: 1200,
        mx: 'auto',
        p: 3,
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          textAlign: 'center',
          mb: 4,
          fontWeight: 600,
          color: 'primary.main'
        }}
      >
        {t('title')}
      </Typography>

      {/* Commercial Registration Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<AccountBalance color="primary" />}
          title={t('sections.commercial_registration.title')}
          subheader={t('sections.commercial_registration.description')}
          sx={{ backgroundColor: 'primary.main', color: 'white' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('sections.commercial_registration.cr_number')}
                value={formData.crNumber}
                onChange={(e) => handleInputChange('crNumber', e.target.value)}
                error={!!errors.crNumber}
                helperText={errors.crNumber}
                inputProps={{ 
                  maxLength: 10,
                  style: { textAlign: isRTL ? 'right' : 'left' }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('actions.validate_cr')}>
                        <IconButton
                          onClick={() => handleValidation('cr')}
                          disabled={!formData.crNumber}
                        >
                          {validationState.crNumber === true ? 
                            <CheckCircle color="success" /> : 
                            validationState.crNumber === false ? 
                            <Error color="error" /> : 
                            <Help />
                          }
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
                placeholder="١٢٣٤٥٦٧٨٩٠"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('sections.commercial_registration.activity')}
                value={formData.crActivity}
                onChange={(e) => handleInputChange('crActivity', e.target.value)}
                multiline
                rows={2}
                inputProps={{ style: { textAlign: isRTL ? 'right' : 'left' }}}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label={t('sections.commercial_registration.issue_date')}
                value={formData.crIssueDate}
                onChange={(e) => handleInputChange('crIssueDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText={formData.crIssueDate ? formatDateForDisplay(formData.crIssueDate) : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label={t('sections.commercial_registration.expiry_date')}
                value={formData.crExpiryDate}
                onChange={(e) => handleInputChange('crExpiryDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText={formData.crExpiryDate ? formatDateForDisplay(formData.crExpiryDate) : ''}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* VAT Registration Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<BusinessCenter color="secondary" />}
          title={t('sections.vat_registration.title')}
          subheader={t('sections.vat_registration.description')}
          sx={{ backgroundColor: 'secondary.main', color: 'white' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('sections.vat_registration.vat_number')}
                value={formData.vatNumber}
                onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                error={!!errors.vatNumber}
                helperText={errors.vatNumber}
                inputProps={{ 
                  maxLength: 15,
                  style: { textAlign: isRTL ? 'right' : 'left' }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t('actions.validate_vat')}>
                        <IconButton
                          onClick={() => handleValidation('vat')}
                          disabled={!formData.vatNumber}
                        >
                          {validationState.vatNumber === true ? 
                            <CheckCircle color="success" /> : 
                            validationState.vatNumber === false ? 
                            <Error color="error" /> : 
                            <Help />
                          }
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
                placeholder="٣١٠١٢٣٤٥٦٧٠٠٠٠٣"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label={t('sections.vat_registration.registration_date')}
                value={formData.vatRegistrationDate}
                onChange={(e) => handleInputChange('vatRegistrationDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* WASL Address Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<LocationOn color="success" />}
          title={t('sections.wasl_address.title')}
          subheader={t('sections.wasl_address.description')}
          sx={{ backgroundColor: 'success.main', color: 'white' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label={t('sections.wasl_address.building_number')}
                value={formData.buildingNumber}
                onChange={(e) => handleInputChange('buildingNumber', e.target.value)}
                error={!!errors.buildingNumber}
                helperText={errors.buildingNumber}
                inputProps={{ 
                  maxLength: 4,
                  style: { textAlign: isRTL ? 'right' : 'left' }
                }}
                placeholder="١٢٣٤"
              />
            </Grid>
            
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                label={t('sections.wasl_address.street_name')}
                value={formData.streetName}
                onChange={(e) => handleInputChange('streetName', e.target.value)}
                inputProps={{ style: { textAlign: isRTL ? 'right' : 'left' }}}
                placeholder="شارع الملك فهد"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('sections.wasl_address.district')}
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                inputProps={{ style: { textAlign: isRTL ? 'right' : 'left' }}}
                placeholder="العليا"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('sections.wasl_address.city')}
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                inputProps={{ style: { textAlign: isRTL ? 'right' : 'left' }}}
                placeholder="الرياض"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('sections.wasl_address.region')}</InputLabel>
                <Select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  label={t('sections.wasl_address.region')}
                >
                  {saudiRegions.map((region) => (
                    <MenuItem key={region.code} value={region.code}>
                      {isRTL ? region.nameAr : region.nameEn}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('sections.wasl_address.postal_code')}
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                inputProps={{ 
                  maxLength: 5,
                  style: { textAlign: isRTL ? 'right' : 'left' }
                }}
                placeholder="١١٥٦٤"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('sections.wasl_address.additional_number')}
                value={formData.additionalNumber}
                onChange={(e) => handleInputChange('additionalNumber', e.target.value)}
                inputProps={{ 
                  maxLength: 4,
                  style: { textAlign: isRTL ? 'right' : 'left' }
                }}
                placeholder="٥٦٧٨"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => handleValidation('address')}
                  startIcon={<LocationOn />}
                  disabled={!formData.buildingNumber || !formData.streetName}
                >
                  {t('actions.validate_address')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{ minWidth: 200 }}
        >
          {isLoading ? t('common:common.loading') : t('actions.update_compliance')}
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={() => window.history.back()}
        >
          {t('common:common.cancel')}
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {Object.keys(validationState).some(key => validationState[key as keyof ValidationState] === true) && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {t('notifications.validation_success')}
        </Alert>
      )}
    </Box>
  );
}