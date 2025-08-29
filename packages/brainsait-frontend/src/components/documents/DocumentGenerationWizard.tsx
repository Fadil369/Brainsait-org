'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Gavel as ComplianceIcon,
  Certificate as CertificateIcon,
  Language as LanguageIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAppTheme } from '../../lib/ThemeProvider';
import { documentService, DocumentResponse } from '../../services/documentService';
import type { BilingualText } from '../../types/component.types';
import BusinessPlanForm from './forms/BusinessPlanForm';
import FeasibilityStudyForm from './forms/FeasibilityStudyForm';
import DocumentPreview from './DocumentPreview';
import ComplianceReportGenerator from './ComplianceReportGenerator';

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
  data: Record&lt;string, any&gt;;
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
  onDocumentGenerated?: (document: DocumentResponse) =&gt; void;
  onClose?: () =&gt; void;
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
const DocumentGenerationWizard: React.FC&lt;DocumentGenerationWizardProps&gt; = ({
  onDocumentGenerated,
  onClose,
  defaultTemplate,
  defaultLanguage = 'ar',
  embedded = false,
}) =&gt; {
  const { t } = useTranslation(['documents', 'common']);
  const { language, direction } = useAppTheme();
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState&lt;DocumentFormData&gt;({
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
  const [errors, setErrors] = useState&lt;Record&lt;string, string&gt;&gt;({});
  const [previewData, setPreviewData] = useState&lt;DocumentResponse | null&gt;(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Document templates configuration
  const templates: DocumentTemplate[] = useMemo(() =&gt; [
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
  const steps: WizardStep[] = useMemo(() =&gt; [
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
      completed: Object.keys(formData.data).length &gt; 0,
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
  const currentTemplate = templates.find(t =&gt; t.id === formData.templateId);

  /**
   * Handle step navigation
   */
  const handleNext = useCallback(() =&gt; {
    if (activeStep &lt; steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  }, [activeStep, steps.length]);

  const handleBack = useCallback(() =&gt; {
    if (activeStep &gt; 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  const handleStepClick = useCallback((stepIndex: number) =&gt; {
    // Allow clicking on completed steps or the next step
    if (stepIndex &lt;= activeStep + 1) {
      setActiveStep(stepIndex);
    }
  }, [activeStep]);

  /**
   * Handle form data updates
   */
  const updateFormData = useCallback((updates: Partial&lt;DocumentFormData&gt;) =&gt; {
    setFormData(prev =&gt; ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  /**
   * Validate current step
   */
  const validateStep = useCallback((stepIndex: number): boolean =&gt; {
    const newErrors: Record&lt;string, string&gt; = {};

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
          currentTemplate.requiredFields.forEach(field =&gt; {
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
  const handleGenerate = useCallback(async () =&gt; {
    if (!validateStep(2)) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() =&gt; {
      setGenerationProgress(prev =&gt; Math.min(prev + 10, 90));
    }, 500);

    try {
      let response: DocumentResponse;

      // Call appropriate service method based on template
      switch (formData.templateId) {
        case 'business-plan':
          response = await documentService.generateBusinessPlan(
            { ...formData.data, language: formData.language, format: formData.format },
            true
          );
          break;
        
        case 'feasibility-study':
          response = await documentService.generateFeasibilityStudy(
            { ...formData.data, language: formData.language, format: formData.format },
            true
          );
          break;
        
        case 'certificate':
          response = await documentService.generateCertificate(
            { ...formData.data, language: formData.language, format: formData.format },
            true
          );
          break;
        
        case 'compliance-report':
          response = await documentService.generateComplianceReport(
            { ...formData.data, language: formData.language, format: formData.format },
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
  const handlePreview = useCallback(async () =&gt; {
    if (!validateStep(2)) return;

    try {
      let response: DocumentResponse;

      // Generate preview (without download)
      switch (formData.templateId) {
        case 'business-plan':
          response = await documentService.generateBusinessPlan(
            { ...formData.data, language: formData.language, format: 'html' },
            false
          );
          break;
        
        case 'feasibility-study':
          response = await documentService.generateFeasibilityStudy(
            { ...formData.data, language: formData.language, format: 'html' },
            false
          );
          break;
        
        case 'certificate':
          response = await documentService.generateCertificate(
            { ...formData.data, language: formData.language, format: 'html' },
            false
          );
          break;
        
        case 'compliance-report':
          response = await documentService.generateComplianceReport(
            { ...formData.data, language: formData.language, format: 'html' },
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
  const renderTemplateSelection = () =&gt; (
    &lt;Box sx={{ mt: 2 }}&gt;
      &lt;Typography variant="h6" gutterBottom&gt;
        {t('documents:form.wizard.step_1')}
      &lt;/Typography&gt;
      
      &lt;Grid container spacing={3}&gt;
        {templates.map(template =&gt; (
          &lt;Grid item xs={12} md={6} key={template.id}&gt;
            &lt;Card
              sx={{
                cursor: 'pointer',
                border: formData.templateId === template.id ? 2 : 1,
                borderColor: formData.templateId === template.id ? 'primary.main' : 'divider',
                '&amp;:hover': { borderColor: 'primary.main' },
                height: '100%',
              }}
              onClick={() =&gt; updateFormData({ templateId: template.id })}
            &gt;
              &lt;CardContent&gt;
                &lt;Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}&gt;
                  &lt;template.icon color="primary" sx={{ mr: 2 }} /&gt;
                  &lt;Typography variant="h6"&gt;
                    {template.name[language]}
                  &lt;/Typography&gt;
                  {template.saudiCompliant &amp;&amp; (
                    &lt;Chip 
                      label={language === 'ar' ? 'متوافق سعودياً' : 'Saudi Compliant'}
                      color="success"
                      size="small"
                      sx={{ ml: 1 }}
                    /&gt;
                  )}
                &lt;/Box&gt;
                
                &lt;Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}&gt;
                  {template.description[language]}
                &lt;/Typography&gt;
                
                &lt;Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}&gt;
                  {template.features.map((feature, index) =&gt; (
                    &lt;Chip
                      key={index}
                      label={feature[language]}
                      size="small"
                      variant="outlined"
                    /&gt;
                  ))}
                &lt;/Box&gt;
                
                &lt;Typography variant="caption" color="text.secondary"&gt;
                  {language === 'ar' 
                    ? `الوقت المتوقع: ${template.estimatedTime} دقيقة`
                    : `Estimated time: ${template.estimatedTime} minutes`
                  }
                &lt;/Typography&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/Grid&gt;
        ))}
      &lt;/Grid&gt;
      
      {errors.template &amp;&amp; (
        &lt;Alert severity="error" sx={{ mt: 2 }}&gt;
          {errors.template}
        &lt;/Alert&gt;
      )}
    &lt;/Box&gt;
  );

  /**
   * Render configuration step
   */
  const renderConfiguration = () =&gt; (
    &lt;Box sx={{ mt: 2 }}&gt;
      &lt;Typography variant="h6" gutterBottom&gt;
        {t('documents:form.wizard.step_2')}
      &lt;/Typography&gt;
      
      &lt;Grid container spacing={3}&gt;
        &lt;Grid item xs={12} md={6}&gt;
          &lt;FormControl fullWidth&gt;
            &lt;InputLabel&gt;{t('documents:language_selector.title')}&lt;/InputLabel&gt;
            &lt;Select
              value={formData.language}
              onChange={(e) =&gt; updateFormData({ language: e.target.value as 'ar' | 'en' })}
              startAdornment={&lt;LanguageIcon sx={{ mr: 1 }} /&gt;}
            &gt;
              &lt;MenuItem value="ar"&gt;
                {t('documents:language_selector.arabic')}
              &lt;/MenuItem&gt;
              &lt;MenuItem value="en"&gt;
                {t('documents:language_selector.english')}
              &lt;/MenuItem&gt;
            &lt;/Select&gt;
          &lt;/FormControl&gt;
        &lt;/Grid&gt;
        
        &lt;Grid item xs={12} md={6}&gt;
          &lt;FormControl fullWidth&gt;
            &lt;InputLabel&gt;{language === 'ar' ? 'تنسيق المستند' : 'Document Format'}&lt;/InputLabel&gt;
            &lt;Select
              value={formData.format}
              onChange={(e) =&gt; updateFormData({ format: e.target.value as 'pdf' | 'html' })}
              startAdornment={&lt;DescriptionIcon sx={{ mr: 1 }} /&gt;}
            &gt;
              &lt;MenuItem value="pdf"&gt;PDF&lt;/MenuItem&gt;
              &lt;MenuItem value="html"&gt;HTML&lt;/MenuItem&gt;
            &lt;/Select&gt;
          &lt;/FormControl&gt;
        &lt;/Grid&gt;
      &lt;/Grid&gt;
      
      {errors.language &amp;&amp; (
        &lt;Alert severity="error" sx={{ mt: 2 }}&gt;
          {errors.language}
        &lt;/Alert&gt;
      )}
    &lt;/Box&gt;
  );

  /**
   * Render content step based on selected template
   */
  const renderContent = () =&gt; {
    if (!currentTemplate) return null;

    const commonProps = {
      data: formData.data,
      onChange: (data: Record&lt;string, any&gt;) =&gt; updateFormData({ data }),
      language: formData.language,
      errors,
    };

    switch (formData.templateId) {
      case 'business-plan':
        return &lt;BusinessPlanForm {...commonProps} /&gt;;
      
      case 'feasibility-study':
        return &lt;FeasibilityStudyForm {...commonProps} /&gt;;
      
      case 'compliance-report':
        return &lt;ComplianceReportGenerator {...commonProps} /&gt;;
      
      default:
        return (
          &lt;Alert severity="info"&gt;
            &lt;AlertTitle&gt;{language === 'ar' ? 'قيد التطوير' : 'Under Development'}&lt;/AlertTitle&gt;
            {language === 'ar' 
              ? 'هذا النموذج قيد التطوير حالياً. سيكون متاحاً قريباً.'
              : 'This template is currently under development. It will be available soon.'
            }
          &lt;/Alert&gt;
        );
    }
  };

  /**
   * Render generation step
   */
  const renderGeneration = () =&gt; (
    &lt;Box sx={{ mt: 2 }}&gt;
      &lt;Typography variant="h6" gutterBottom&gt;
        {t('documents:form.wizard.step_5')}
      &lt;/Typography&gt;
      
      {isGenerating ? (
        &lt;Box&gt;
          &lt;Typography variant="body1" gutterBottom&gt;
            {t('documents:generation.generating')}
          &lt;/Typography&gt;
          &lt;LinearProgress 
            variant="determinate" 
            value={generationProgress} 
            sx={{ mb: 2 }}
          /&gt;
          &lt;Typography variant="body2" color="text.secondary"&gt;
            {t('documents:generation.progress', { percentage: generationProgress })}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      ) : (
        &lt;Box sx={{ textAlign: 'center', py: 4 }}&gt;
          &lt;CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} /&gt;
          &lt;Typography variant="h5" gutterBottom&gt;
            {t('documents:generation.success')}
          &lt;/Typography&gt;
          &lt;Button
            variant="contained"
            startIcon={&lt;DownloadIcon /&gt;}
            onClick={handleGenerate}
            size="large"
          &gt;
            {language === 'ar' ? 'تحميل المستند' : 'Download Document'}
          &lt;/Button&gt;
        &lt;/Box&gt;
      )}
      
      {errors.generation &amp;&amp; (
        &lt;Alert severity="error" sx={{ mt: 2 }}&gt;
          &lt;AlertTitle&gt;{t('documents:generation.error')}&lt;/AlertTitle&gt;
          {errors.generation}
        &lt;/Alert&gt;
      )}
    &lt;/Box&gt;
  );

  return (
    &lt;Box sx={{ width: '100%', maxWidth: embedded ? '100%' : '1200px', mx: 'auto', p: 2 }}&gt;
      {!embedded &amp;&amp; (
        &lt;Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}&gt;
          &lt;Typography variant="h4"&gt;
            {t('documents:title')}
          &lt;/Typography&gt;
          
          {onClose &amp;&amp; (
            &lt;IconButton onClick={onClose}&gt;
              &lt;CloseIcon /&gt;
            &lt;/IconButton&gt;
          )}
        &lt;/Box&gt;
      )}
      
      &lt;Paper elevation={2} sx={{ p: 3 }}&gt;
        {/* Progress Stepper */}
        &lt;Stepper 
          activeStep={activeStep} 
          orientation="horizontal"
          dir={direction}
          sx={{ mb: 3 }}
        &gt;
          {steps.map((step, index) =&gt; (
            &lt;Step 
              key={step.id} 
              completed={step.completed}
              sx={{ cursor: index &lt;= activeStep + 1 ? 'pointer' : 'default' }}
              onClick={() =&gt; handleStepClick(index)}
            &gt;
              &lt;StepLabel
                optional={
                  step.optional ? (
                    &lt;Typography variant="caption"&gt;
                      {language === 'ar' ? 'اختياري' : 'Optional'}
                    &lt;/Typography&gt;
                  ) : undefined
                }
              &gt;
                {step.label[language]}
              &lt;/StepLabel&gt;
            &lt;/Step&gt;
          ))}
        &lt;/Stepper&gt;
        
        &lt;Divider sx={{ mb: 3 }} /&gt;
        
        {/* Step Content */}
        &lt;Box sx={{ minHeight: 400 }}&gt;
          {activeStep === 0 &amp;&amp; renderTemplateSelection()}
          {activeStep === 1 &amp;&amp; renderConfiguration()}
          {activeStep === 2 &amp;&amp; renderContent()}
          {activeStep === 3 &amp;&amp; (
            &lt;Box sx={{ textAlign: 'center', py: 4 }}&gt;
              &lt;PreviewIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} /&gt;
              &lt;Typography variant="h6" gutterBottom&gt;
                {t('documents:preview.title')}
              &lt;/Typography&gt;
              &lt;Button
                variant="outlined"
                onClick={handlePreview}
                startIcon={&lt;PreviewIcon /&gt;}
              &gt;
                {language === 'ar' ? 'معاينة المستند' : 'Preview Document'}
              &lt;/Button&gt;
            &lt;/Box&gt;
          )}
          {activeStep === 4 &amp;&amp; renderGeneration()}
        &lt;/Box&gt;
        
        {/* Navigation Buttons */}
        &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}&gt;
          &lt;Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={direction === 'rtl' ? &lt;ArrowForwardIcon /&gt; : &lt;ArrowBackIcon /&gt;}
          &gt;
            {language === 'ar' ? 'السابق' : 'Back'}
          &lt;/Button&gt;
          
          &lt;Box sx={{ display: 'flex', gap: 1 }}&gt;
            {activeStep === 2 &amp;&amp; (
              &lt;Button
                variant="outlined"
                onClick={handlePreview}
                startIcon={&lt;PreviewIcon /&gt;}
                disabled={!validateStep(2)}
              &gt;
                {language === 'ar' ? 'معاينة' : 'Preview'}
              &lt;/Button&gt;
            )}
            
            {activeStep &lt; steps.length - 1 ? (
              &lt;Button
                variant="contained"
                onClick={activeStep === 3 ? handleGenerate : handleNext}
                endIcon={direction === 'rtl' ? &lt;ArrowBackIcon /&gt; : &lt;ArrowForwardIcon /&gt;}
                disabled={!validateStep(activeStep)}
              &gt;
                {activeStep === 3 
                  ? (language === 'ar' ? 'إنتاج المستند' : 'Generate Document')
                  : (language === 'ar' ? 'التالي' : 'Next')
                }
              &lt;/Button&gt;
            ) : (
              &lt;Button
                variant="contained"
                onClick={handleGenerate}
                startIcon={&lt;DownloadIcon /&gt;}
                disabled={isGenerating}
              &gt;
                {language === 'ar' ? 'تحميل' : 'Download'}
              &lt;/Button&gt;
            )}
          &lt;/Box&gt;
        &lt;/Box&gt;
      &lt;/Paper&gt;
      
      {/* Preview Dialog */}
      &lt;Dialog
        open={showPreviewDialog}
        onClose={() =&gt; setShowPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      &gt;
        &lt;DialogTitle&gt;
          &lt;Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}&gt;
            {t('documents:preview.title')}
            &lt;IconButton onClick={() =&gt; setShowPreviewDialog(false)}&gt;
              &lt;CloseIcon /&gt;
            &lt;/IconButton&gt;
          &lt;/Box&gt;
        &lt;/DialogTitle&gt;
        &lt;DialogContent&gt;
          {previewData &amp;&amp; (
            &lt;DocumentPreview
              document={previewData}
              language={formData.language}
              onEdit={() =&gt; {
                setShowPreviewDialog(false);
                setActiveStep(2);
              }}
            /&gt;
          )}
        &lt;/DialogContent&gt;
        &lt;DialogActions&gt;
          &lt;Button onClick={() =&gt; setShowPreviewDialog(false)}&gt;
            {language === 'ar' ? 'إغلاق' : 'Close'}
          &lt;/Button&gt;
          &lt;Button variant="contained" onClick={handleGenerate}&gt;
            {language === 'ar' ? 'إنتاج المستند النهائي' : 'Generate Final Document'}
          &lt;/Button&gt;
        &lt;/DialogActions&gt;
      &lt;/Dialog&gt;
    &lt;/Box&gt;
  );
};

export default DocumentGenerationWizard;