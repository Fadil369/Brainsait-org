import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

const specializations = [
  'CARDIOLOGY', 'NEUROLOGY', 'ONCOLOGY', 'PEDIATRICS', 'PSYCHIATRY',
  'SURGERY', 'EMERGENCY_MEDICINE', 'INTERNAL_MEDICINE', 'RADIOLOGY',
  'PATHOLOGY', 'ANESTHESIOLOGY', 'DERMATOLOGY', 'OPHTHALMOLOGY',
  'ORTHOPEDICS', 'GYNECOLOGY', 'UROLOGY', 'ENT', 'REHABILITATION',
  'PHARMACY', 'NURSING', 'ADMINISTRATION', 'RESEARCH', 'PUBLIC_HEALTH',
  'HEALTH_INFORMATICS'
];

const aiApplications = [
  'DIAGNOSTIC_ASSISTANCE', 'TREATMENT_PLANNING', 'DRUG_DISCOVERY',
  'MEDICAL_IMAGING', 'CLINICAL_DECISION_SUPPORT', 'PATIENT_MONITORING',
  'PREDICTIVE_ANALYTICS', 'NATURAL_LANGUAGE_PROCESSING', 'ROBOTIC_SURGERY',
  'TELEMEDICINE', 'HEALTH_RECORDS_MANAGEMENT', 'RESEARCH_AUTOMATION',
  'QUALITY_ASSURANCE', 'WORKFLOW_OPTIMIZATION'
];

const countries = [
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'EG', name: 'Egypt' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' }
];

const validationSchema = Yup.object({
  specialization: Yup.string().required('Specialization is required'),
  yearsOfExperience: Yup.number().min(0).max(60).required('Years of experience is required'),
  currentPosition: Yup.string().min(2).max(200).required('Current position is required'),
  institution: Yup.string().min(2).max(200).required('Institution is required'),
  licenseNumber: Yup.string().min(3).max(50).required('License number is required'),
  licenseCountry: Yup.string().length(2).required('License country is required'),
  aiExperienceLevel: Yup.string().required('AI experience level is required'),
  interestedAIApplications: Yup.array().min(1, 'Select at least one AI application'),
  preferredLanguages: Yup.array().min(1, 'Select at least one language'),
  timeZone: Yup.string().required('Time zone is required'),
  privacyConsent: Yup.boolean().oneOf([true], 'Privacy consent is required'),
  termsAccepted: Yup.boolean().oneOf([true], 'Terms acceptance is required')
});

const steps = ['Basic Information', 'Professional Details', 'AI Experience', 'Preferences'];

interface HealthcareSMERegistrationProps {
  onComplete: (data: any) => void;
}

const HealthcareSMERegistration: React.FC<HealthcareSMERegistrationProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      specialization: '',
      yearsOfExperience: 0,
      currentPosition: '',
      institution: '',
      licenseNumber: '',
      licenseCountry: '',
      certifications: [],
      researchInterests: [],
      publications: [],
      aiExperienceLevel: '',
      interestedAIApplications: [],
      preferredLanguages: ['EN'],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilityForMentoring: false,
      willingToShareCaseStudies: false,
      privacyConsent: false,
      termsAccepted: false
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/healthcare-sme/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Registration failed');
        }

        const result = await response.json();
        onComplete(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('specialization')}</InputLabel>
                <Select
                  name="specialization"
                  value={formik.values.specialization}
                  onChange={formik.handleChange}
                  error={formik.touched.specialization && Boolean(formik.errors.specialization)}
                >
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {t(`specializations.${spec}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="yearsOfExperience"
                label={t('yearsOfExperience')}
                type="number"
                value={formik.values.yearsOfExperience}
                onChange={formik.handleChange}
                error={formik.touched.yearsOfExperience && Boolean(formik.errors.yearsOfExperience)}
                helperText={formik.touched.yearsOfExperience && formik.errors.yearsOfExperience}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="currentPosition"
                label={t('currentPosition')}
                value={formik.values.currentPosition}
                onChange={formik.handleChange}
                error={formik.touched.currentPosition && Boolean(formik.errors.currentPosition)}
                helperText={formik.touched.currentPosition && formik.errors.currentPosition}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="institution"
                label={t('institution')}
                value={formik.values.institution}
                onChange={formik.handleChange}
                error={formik.touched.institution && Boolean(formik.errors.institution)}
                helperText={formik.touched.institution && formik.errors.institution}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="licenseNumber"
                label={t('licenseNumber')}
                value={formik.values.licenseNumber}
                onChange={formik.handleChange}
                error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
                helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('licenseCountry')}</InputLabel>
                <Select
                  name="licenseCountry"
                  value={formik.values.licenseCountry}
                  onChange={formik.handleChange}
                  error={formik.touched.licenseCountry && Boolean(formik.errors.licenseCountry)}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={[]}
                freeSolo
                value={formik.values.certifications}
                onChange={(event, newValue) => {
                  formik.setFieldValue('certifications', newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('certifications')}
                    placeholder={t('addCertification')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={[]}
                freeSolo
                value={formik.values.researchInterests}
                onChange={(event, newValue) => {
                  formik.setFieldValue('researchInterests', newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('researchInterests')}
                    placeholder={t('addResearchInterest')}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>{t('aiExperienceLevel')}</InputLabel>
                <Select
                  name="aiExperienceLevel"
                  value={formik.values.aiExperienceLevel}
                  onChange={formik.handleChange}
                  error={formik.touched.aiExperienceLevel && Boolean(formik.errors.aiExperienceLevel)}
                >
                  <MenuItem value="BEGINNER">{t('aiLevels.BEGINNER')}</MenuItem>
                  <MenuItem value="INTERMEDIATE">{t('aiLevels.INTERMEDIATE')}</MenuItem>
                  <MenuItem value="ADVANCED">{t('aiLevels.ADVANCED')}</MenuItem>
                  <MenuItem value="EXPERT">{t('aiLevels.EXPERT')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('interestedAIApplications')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {aiApplications.map((app) => (
                  <Chip
                    key={app}
                    label={t(`aiApplications.${app}`)}
                    clickable
                    color={(formik.values.interestedAIApplications as string[]).includes(app) ? 'primary' : 'default'}
                    onClick={() => {
                      const current = formik.values.interestedAIApplications as string[];
                      const updated = current.includes(app)
                        ? current.filter(item => item !== app)
                        : [...current, app];
                      formik.setFieldValue('interestedAIApplications', updated);
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={['EN', 'AR', 'FR', 'ES', 'DE', 'JA', 'ZH']}
                value={formik.values.preferredLanguages}
                onChange={(event, newValue) => {
                  formik.setFieldValue('preferredLanguages', newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('preferredLanguages')}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="timeZone"
                label={t('timeZone')}
                value={formik.values.timeZone}
                onChange={formik.handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="availabilityForMentoring"
                    checked={formik.values.availabilityForMentoring}
                    onChange={formik.handleChange}
                  />
                }
                label={t('availabilityForMentoring')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="willingToShareCaseStudies"
                    checked={formik.values.willingToShareCaseStudies}
                    onChange={formik.handleChange}
                  />
                }
                label={t('willingToShareCaseStudies')}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="privacyConsent"
                    checked={formik.values.privacyConsent}
                    onChange={formik.handleChange}
                    required
                  />
                }
                label={t('privacyConsent')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={formik.values.termsAccepted}
                    onChange={formik.handleChange}
                    required
                  />
                }
                label={t('termsAccepted')}
              />
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        {t('healthcareSMERegistration')}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{t(`steps.${label}`)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Card>
          <CardContent>
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            {t('back')}
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formik.isValid}
            >
              {loading ? t('registering') : t('register')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              {t('next')}
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default HealthcareSMERegistration;