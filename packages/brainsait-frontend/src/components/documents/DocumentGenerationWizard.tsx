'use client';

import {
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Assessment as AssessmentIcon,
    Business as BusinessIcon,
    VerifiedUser as CertificateIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Gavel as ComplianceIcon,
    Description as DescriptionIcon,
    Download as DownloadIcon,
    Language as LanguageIcon,
    Preview as PreviewIcon
} from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Step,
    StepLabel,
    Stepper,
    Typography
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useMemo, useState } from 'react';
import { useAppTheme } from '../../lib/ThemeProvider';
import { DocumentResponse, documentService } from '../../services/documentService';
import type { BilingualText } from '../../types/component.types';
import ComplianceReportGenerator from './ComplianceReportGenerator';
import DocumentPreview from './DocumentPreview';
import BusinessPlanForm from './forms/BusinessPlanForm';
import FeasibilityStudyForm from './forms/FeasibilityStudyForm';

/**
 * Document Template Interface
 */
interface DocumentTemplate {
  id: string;
  name: BilingualText;
  description: BilingualText;
  icon: React.ComponentType;
  category: 'business' | 'analysis' | 'compliance' | 'certification';
  estimatedTime: number; // in minutes
  requiredFields: string[];
  features: BilingualText[];
  saudiCompliant: boolean;
}

/**
 * Wizard Step Interface
 */
interface WizardStep {
  id: string;
  label: BilingualText;
  description: BilingualText;
  completed: boolean;
  optional: boolean;
}

/**
 * Form Data Interface
 */
interface DocumentFormData {
  templateId: string;
  language: 'ar' | 'en';
  format: 'pdf' | 'html';
  data: Record<string, any>;
  options: {
    watermark: boolean;
    digitalSignature: boolean;
    inline: boolean;
  };
}

/**
 * DocumentGenerationWizard Component Props
 */
interface DocumentGenerationWizardProps {
  onDocumentGenerated?: (document: DocumentResponse) => void;
  onClose?: () => void;
  defaultTemplate?: string;
  defaultLanguage?: 'ar' | 'en';
  embedded?: boolean;
}

/**
 * DocumentGenerationWizard Component
 * 
 * A comprehensive multi-step wizard for generating various types of documents
 * with Saudi-specific compliance and RTL support
 * 
 * @param props - Component properties
 * @returns JSX.Element
 */
const DocumentGenerationWizard: React.FC<DocumentGenerationWizardProps> = ({
  onDocumentGenerated,
  onClose,
  defaultTemplate,
  defaultLanguage = 'ar',
  embedded = false,
}) => {
  const { t } = useTranslation(['documents', 'common']);
  const { language, direction } = useAppTheme();
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<DocumentFormData>({
    templateId: defaultTemplate || '',
    language: defaultLanguage,
    format: 'pdf',
    data: {},
    options: {
      watermark: true,
      digitalSignature: true,
      inline: false,
    },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<DocumentResponse | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Document templates configuration
  const templates: DocumentTemplate[] = useMemo(() => [
    {
      id: 'business-plan',
      name: { 
        ar: 'خطة العمل', 
        en: 'Business Plan' 
      },
      description: { 
        ar: 'خطة عمل شاملة تتضمن الأهداف والاستراتيجيات المالية والتشغيلية',
        en: 'Comprehensive business plan including objectives, financial and operational strategies'
      },
      icon: BusinessIcon,
      category: 'business',
      estimatedTime: 15,
      requiredFields: ['companyName', 'executiveSummary', 'mainObjective'],
      features: [
        { ar: 'تحليل السوق السعودي', en: 'Saudi Market Analysis' },
        { ar: 'الامتثال للأنظمة المحلية', en: 'Local Regulatory Compliance' },
        { ar: 'التوقعات المالية', en: 'Financial Projections' },
        { ar: 'تحليل المخاطر', en: 'Risk Analysis' },
      ],
      saudiCompliant: true,
    },
    {
      id: 'feasibility-study',
      name: { 
        ar: 'دراسة الجدوى', 
        en: 'Feasibility Study' 
      },
      description: { 
        ar: 'دراسة شاملة لجدوى المشروع من النواحي التقنية والمالية والتسويقية',
        en: 'Comprehensive project viability study covering technical, financial, and market aspects'
      },
      icon: AssessmentIcon,
      category: 'analysis',
      estimatedTime: 20,
      requiredFields: ['projectName', 'executiveSummary', 'marketAnalysis'],
      features: [
        { ar: 'التحليل التقني', en: 'Technical Analysis' },
        { ar: 'دراسة السوق المحلي', en: 'Local Market Study' },
        { ar: 'التحليل المالي المفصل', en: 'Detailed Financial Analysis' },
        { ar: 'تقييم المخاطر', en: 'Risk Assessment' },
      ],
      saudiCompliant: true,
    },
    {
      id: 'certificate',
      name: { 
        ar: 'شهادة الامتثال', 
        en: 'Compliance Certificate' 
      },
      description: { 
        ar: 'شهادة رسمية تؤكد امتثال الشركة للأنظمة واللوائح السعودية',
        en: 'Official certificate confirming company compliance with Saudi regulations'
      },
      icon: CertificateIcon,
      category: 'certification',
      estimatedTime: 5,
      requiredFields: ['companyName', 'crNumber', 'complianceScore'],
      features: [
        { ar: 'الشعار الرسمي', en: 'Official Emblem' },
        { ar: 'رمز الاستجابة السريعة', en: 'QR Code Verification' },
        { ar: 'التوقيع الرقمي', en: 'Digital Signature' },
        { ar: 'تاريخ الصلاحية', en: 'Validity Period' },
      ],
      saudiCompliant: true,
    },
    {
      id: 'compliance-report',
      name: { 
        ar: 'تقرير الامتثال', 
        en: 'Compliance Report' 
      },
      description: { 
        ar: 'تقرير مفصل عن حالة الامتثال مع التوصيات والإجراءات المطلوبة',
        en: 'Detailed compliance status report with recommendations and required actions'
      },
      icon: ComplianceIcon,
      category: 'compliance',
      estimatedTime: 10,
      requiredFields: ['reportPeriod', 'overallScore', 'complianceBreakdown'],
      features: [
        { ar: 'نقاط الامتثال في الوقت الفعلي', en: 'Real-time Compliance Score' },
        { ar: 'ربط APIs الحكومية', en: 'Government API Integration' },
        { ar: 'تتبع المشاكل', en: 'Issue Tracking' },
        { ar: 'خطة العمل', en: 'Action Plan' },
      ],
      saudiCompliant: true,
    },
  ], []);

  // Wizard steps configuration
  const steps: WizardStep[] = useMemo(() => [
    {
      id: 'template',
      label: { ar: 'اختيار النموذج', en: 'Template Selection' },
      description: { ar: 'اختر نوع المستند المراد إنشاؤه', en: 'Choose the type of document to generate' },
      completed: !!formData.templateId,
      optional: false,
    },
    {
      id: 'configuration',
      label: { ar: 'الإعدادات', en: 'Configuration' },
      description: { ar: 'تحديد اللغة والتنسيق والخيارات', en: 'Set language, format, and options' },
      completed: !!formData.language && !!formData.format,
      optional: false,
    },
    {
      id: 'content',
      label: { ar: 'المحتوى', en: 'Content' },
      description: { ar: 'إدخال بيانات المستند', en: 'Enter document data' },
      completed: Object.keys(formData.data).length > 0,
      optional: false,
    },
    {
      id: 'preview',
      label: { ar: 'المعاينة', en: 'Preview' },
      description: { ar: 'مراجعة المستند قبل الإنتاج النهائي', en: 'Review document before final generation' },
      completed: !!previewData,
      optional: true,
    },
    {
      id: 'generate',
      label: { ar: 'الإنتاج', en: 'Generate' },
      description: { ar: 'إنتاج وتحميل المستند النهائي', en: 'Generate and download final document' },
      completed: false,
      optional: false,
    },
  ], [formData, previewData]);

  // Get current template
  const currentTemplate = templates.find(t => t.id === formData.templateId);

  /**
   * Handle step navigation
   */
  const handleNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  }, [activeStep, steps.length]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  const handleStepClick = useCallback((stepIndex: number) => {
    // Allow clicking on completed steps or the next step
    if (stepIndex <= activeStep + 1) {
      setActiveStep(stepIndex);
    }
  }, [activeStep]);

  /**
   * Handle form data updates
   */
  const updateFormData = useCallback((updates: Partial<DocumentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  /**
   * Validate current step
   */
  const validateStep = useCallback((stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepIndex) {
      case 0: // Template selection
        if (!formData.templateId) {
          newErrors.template = t('validation.template_required');
        }
        break;
      
      case 1: // Configuration
        if (!formData.language) {
          newErrors.language = t('validation.language_required');
        }
        break;
      
      case 2: // Content
        if (currentTemplate) {
          currentTemplate.requiredFields.forEach(field => {
            if (!formData.data[field]) {
              newErrors[field] = t('validation.required_fields');
            }
          });
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, currentTemplate, t]);

  /**
   * Handle document generation
   */
  const handleGenerate = useCallback(async () => {
    if (!validateStep(2)) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      let response: DocumentResponse;

      // Call appropriate service method based on template
      switch (formData.templateId) {
        case 'business-plan':
          response = await documentService.generateBusinessPlan(
            { ...formData.data, language: formData.language, format: formData.format } as any,
            true
          );
          break;
        
        case 'feasibility-study':
          response = await documentService.generateFeasibilityStudy(
            { ...formData.data, language: formData.language, format: formData.format } as any,
            true
          );
          break;
        
        case 'certificate':
          response = await documentService.generateCertificate(
            { ...formData.data, language: formData.language, format: formData.format } as any,
            true
          );
          break;
        
        case 'compliance-report':
          response = await documentService.generateComplianceReport(
            { ...formData.data, language: formData.language, format: formData.format } as any,
            true
          );
          break;
        
        default:
          throw new Error('Invalid template selected');
      }

      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (response.success) {
        onDocumentGenerated?.(response);
        setActiveStep(steps.length - 1);
      } else {
        throw new Error(response.error?.message || 'Document generation failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setErrors({ generation: (error as Error).message });
    } finally {
      setIsGenerating(false);
    }
  }, [formData, steps.length, onDocumentGenerated, validateStep]);

  /**
   * Handle preview generation
   */
  const handlePreview = useCallback(async () => {
    if (!validateStep(2)) return;

    try {
      let response: DocumentResponse;

      // Generate preview (without download)
      switch (formData.templateId) {
        case 'business-plan':
          response = await documentService.generateBusinessPlan(
            { ...formData.data, language: formData.language, format: 'html' } as any,
            false
          );
          break;
        
        case 'feasibility-study':
          response = await documentService.generateFeasibilityStudy(
            { ...formData.data, language: formData.language, format: 'html' } as any,
            false
          );
          break;
        
        case 'certificate':
          response = await documentService.generateCertificate(
            { ...formData.data, language: formData.language, format: 'html' } as any,
            false
          );
          break;
        
        case 'compliance-report':
          response = await documentService.generateComplianceReport(
            { ...formData.data, language: formData.language, format: 'html' } as any,
            false
          );
          break;
        
        default:
          return;
      }

      if (response.success) {
        setPreviewData(response);
        setShowPreviewDialog(true);
      }
    } catch (error) {
      setErrors({ preview: (error as Error).message });
    }
  }, [formData, validateStep]);

  /**
   * Render template selection step
   */
  const renderTemplateSelection = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('documents:form.wizard.step_1')}
      </Typography>
      
      <Grid container spacing={3}>
        {templates.map(template => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: formData.templateId === template.id ? 2 : 1,
                borderColor: formData.templateId === template.id ? 'primary.main' : 'divider',
                '&amp;:hover': { borderColor: 'primary.main' },
                height: '100%',
              }}
              onClick={() => updateFormData({ templateId: template.id })}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    <template.icon />
                  </Box>
                  <Typography variant="h6">
                    {template.name[language]}
                  </Typography>
                  {template.saudiCompliant && (
                    <Chip 
                      label={language === 'ar' ? 'متوافق سعودياً' : 'Saudi Compliant'}
                      color="success"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description[language]}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {template.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature[language]}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {language === 'ar' 
                    ? `الوقت المتوقع: ${template.estimatedTime} دقيقة`
                    : `Estimated time: ${template.estimatedTime} minutes`
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {errors.template && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.template}
        </Alert>
      )}
    </Box>
  );

  /**
   * Render configuration step
   */
  const renderConfiguration = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('documents:form.wizard.step_2')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t('documents:language_selector.title')}</InputLabel>
            <Select
              value={formData.language}
              onChange={(e) => updateFormData({ language: e.target.value as 'ar' | 'en' })}
              startAdornment={<LanguageIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="ar">
                {t('documents:language_selector.arabic')}
              </MenuItem>
              <MenuItem value="en">
                {t('documents:language_selector.english')}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{language === 'ar' ? 'تنسيق المستند' : 'Document Format'}</InputLabel>
            <Select
              value={formData.format}
              onChange={(e) => updateFormData({ format: e.target.value as 'pdf' | 'html' })}
              startAdornment={<DescriptionIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="html">HTML</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {errors.language && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.language}
        </Alert>
      )}
    </Box>
  );

  /**
   * Render content step based on selected template
   */
  const renderContent = () => {
    if (!currentTemplate) return null;

    const commonProps = {
      data: formData.data,
      onChange: (data: Record<string, any>) => updateFormData({ data }),
      language: formData.language,
      errors,
    };

    switch (formData.templateId) {
      case 'business-plan':
        return <BusinessPlanForm {...commonProps} />;
      
      case 'feasibility-study':
        return <FeasibilityStudyForm {...commonProps} />;
      
      case 'compliance-report':
        return <ComplianceReportGenerator {...commonProps} />;
      
      default:
        return (
          <Alert severity="info">
            <AlertTitle>{language === 'ar' ? 'قيد التطوير' : 'Under Development'}</AlertTitle>
            {language === 'ar' 
              ? 'هذا النموذج قيد التطوير حالياً. سيكون متاحاً قريباً.'
              : 'This template is currently under development. It will be available soon.'
            }
          </Alert>
        );
    }
  };

  /**
   * Render generation step
   */
  const renderGeneration = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('documents:form.wizard.step_5')}
      </Typography>
      
      {isGenerating ? (
        <Box>
          <Typography variant="body1" gutterBottom>
            {t('documents:generation.generating')}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={generationProgress} 
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {t('documents:generation.progress', { percentage: generationProgress })}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {t('documents:generation.success')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleGenerate}
            size="large"
          >
            {language === 'ar' ? 'تحميل المستند' : 'Download Document'}
          </Button>
        </Box>
      )}
      
      {errors.generation && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>{t('documents:generation.error')}</AlertTitle>
          {errors.generation}
        </Alert>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: embedded ? '100%' : '1200px', mx: 'auto', p: 2 }}>
      {!embedded && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">
            {t('documents:title')}
          </Typography>
          
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* Progress Stepper */}
        <Stepper 
          activeStep={activeStep} 
          orientation="horizontal"
          dir={direction}
          sx={{ mb: 3 }}
        >
          {steps.map((step, index) => (
            <Step 
              key={step.id} 
              completed={step.completed}
              sx={{ cursor: index <= activeStep + 1 ? 'pointer' : 'default' }}
              onClick={() => handleStepClick(index)}
            >
              <StepLabel
                optional={
                  step.optional ? (
                    <Typography variant="caption">
                      {language === 'ar' ? 'اختياري' : 'Optional'}
                    </Typography>
                  ) : undefined
                }
              >
                {step.label[language]}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {activeStep === 0 && renderTemplateSelection()}
          {activeStep === 1 && renderConfiguration()}
          {activeStep === 2 && renderContent()}
          {activeStep === 3 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PreviewIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('documents:preview.title')}
              </Typography>
              <Button
                variant="outlined"
                onClick={handlePreview}
                startIcon={<PreviewIcon />}
              >
                {language === 'ar' ? 'معاينة المستند' : 'Preview Document'}
              </Button>
            </Box>
          )}
          {activeStep === 4 && renderGeneration()}
        </Box>
        
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={direction === 'rtl' ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          >
            {language === 'ar' ? 'السابق' : 'Back'}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep === 2 && (
              <Button
                variant="outlined"
                onClick={handlePreview}
                startIcon={<PreviewIcon />}
                disabled={!validateStep(2)}
              >
                {language === 'ar' ? 'معاينة' : 'Preview'}
              </Button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={activeStep === 3 ? handleGenerate : handleNext}
                endIcon={direction === 'rtl' ? <ArrowBackIcon /> : <ArrowForwardIcon />}
                disabled={!validateStep(activeStep)}
              >
                {activeStep === 3 
                  ? (language === 'ar' ? 'إنتاج المستند' : 'Generate Document')
                  : (language === 'ar' ? 'التالي' : 'Next')
                }
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleGenerate}
                startIcon={<DownloadIcon />}
                disabled={isGenerating}
              >
                {language === 'ar' ? 'تحميل' : 'Download'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Preview Dialog */}
      <Dialog
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {t('documents:preview.title')}
            <IconButton onClick={() => setShowPreviewDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewData && (
            <DocumentPreview
              document={previewData}
              language={formData.language}
              onEdit={() => {
                setShowPreviewDialog(false);
                setActiveStep(2);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewDialog(false)}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
          <Button variant="contained" onClick={handleGenerate}>
            {language === 'ar' ? 'إنتاج المستند النهائي' : 'Generate Final Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentGenerationWizard;