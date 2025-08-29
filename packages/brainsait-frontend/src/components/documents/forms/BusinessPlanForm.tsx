'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'next-i18next';
import { useAppTheme } from '../../../lib/ThemeProvider';
import BilingualTextField from '../../common/BilingualTextField';
import { convertToHijri, formatSaudiDate } from '../../../utils/hijriCalendar';
import type { BusinessPlanRequest } from '../../../services/documentService';
import type { BilingualText } from '../../../types/component.types';

/**
 * BusinessPlanForm Component Props
 */
interface BusinessPlanFormProps {
  data: Partial&lt;BusinessPlanRequest&gt;;
  onChange: (data: Partial&lt;BusinessPlanRequest&gt;) =&gt; void;
  language: 'ar' | 'en';
  errors: Record&lt;string, string&gt;;
}

/**
 * Service Interface for dynamic service list
 */
interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

/**
 * Competitor Interface
 */
interface CompetitorItem {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
  marketShare: number;
}

/**
 * Management Team Member Interface
 */
interface TeamMember {
  id: string;
  name: string;
  position: string;
  experience: string;
  education: string;
  responsibilities: string;
}

/**
 * Implementation Phase Interface
 */
interface ImplementationPhase {
  id: string;
  date: string;
  phase: string;
  description: string;
  duration: string;
  cost: number;
}

/**
 * Risk Item Interface
 */
interface RiskItem {
  id: string;
  riskType: string;
  riskLevel: 'risk-high' | 'risk-medium' | 'risk-low';
  description: string;
  impact: string;
  probability: string;
  mitigationStrategy: string;
}

/**
 * License Requirement Interface
 */
interface LicenseRequirement {
  id: string;
  name: string;
  description: string;
  issuingAuthority: string;
  duration: string;
}

/**
 * Next Step Interface
 */
interface NextStep {
  id: string;
  timeline: string;
  action: string;
  details: string;
}

/**
 * BusinessPlanForm Component
 * 
 * Comprehensive form for business plan data collection with Saudi-specific
 * compliance requirements and Arabic RTL support
 * 
 * @param props - Component properties
 * @returns JSX.Element
 */
const BusinessPlanForm: React.FC&lt;BusinessPlanFormProps&gt; = ({
  data,
  onChange,
  language,
  errors,
}) =&gt; {
  const { t } = useTranslation(['documents', 'common']);
  const { direction } = useAppTheme();
  
  // State for dynamic lists
  const [services, setServices] = useState&lt;ServiceItem[]&gt;(data.services?.map((s, i) =&gt; ({
    id: i.toString(),
    name: s.name,
    description: s.description,
    price: s.price,
  })) || []);
  
  const [competitors, setCompetitors] = useState&lt;CompetitorItem[]&gt;(data.competitors?.map((c, i) =&gt; ({
    id: i.toString(),
    name: c.name,
    strengths: c.strengths,
    weaknesses: c.weaknesses,
    marketShare: c.marketShare,
  })) || []);
  
  const [teamMembers, setTeamMembers] = useState&lt;TeamMember[]&gt;(data.managementTeam?.map((m, i) =&gt; ({
    id: i.toString(),
    name: m.name,
    position: m.position,
    experience: m.experience,
    education: m.education,
    responsibilities: m.responsibilities,
  })) || []);
  
  const [phases, setPhases] = useState&lt;ImplementationPhase[]&gt;(data.implementationPhases?.map((p, i) =&gt; ({
    id: i.toString(),
    date: p.date,
    phase: p.phase,
    description: p.description,
    duration: p.duration,
    cost: p.cost,
  })) || []);
  
  const [risks, setRisks] = useState&lt;RiskItem[]&gt;(data.riskAnalysis?.map((r, i) =&gt; ({
    id: i.toString(),
    riskType: r.riskType,
    riskLevel: r.riskLevel,
    description: r.description,
    impact: r.impact,
    probability: r.probability,
    mitigationStrategy: r.mitigationStrategy,
  })) || []);
  
  const [licenses, setLicenses] = useState&lt;LicenseRequirement[]&gt;(data.requiredLicenses?.map((l, i) =&gt; ({
    id: i.toString(),
    name: l.name,
    description: l.description,
    issuingAuthority: l.issuingAuthority,
    duration: l.duration,
  })) || []);
  
  const [nextSteps, setNextSteps] = useState&lt;NextStep[]&gt;(data.nextSteps?.map((n, i) =&gt; ({
    id: i.toString(),
    timeline: n.timeline,
    action: n.action,
    details: n.details,
  })) || []);

  // Dialog states
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showCompetitorDialog, setShowCompetitorDialog] = useState(false);
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [showNextStepDialog, setShowNextStepDialog] = useState(false);

  // Current editing item states
  const [currentService, setCurrentService] = useState&lt;ServiceItem | null&gt;(null);
  const [currentCompetitor, setCurrentCompetitor] = useState&lt;CompetitorItem | null&gt;(null);
  const [currentTeamMember, setCurrentTeamMember] = useState&lt;TeamMember | null&gt;(null);
  const [currentPhase, setCurrentPhase] = useState&lt;ImplementationPhase | null&gt;(null);
  const [currentRisk, setCurrentRisk] = useState&lt;RiskItem | null&gt;(null);
  const [currentLicense, setCurrentLicense] = useState&lt;LicenseRequirement | null&gt;(null);
  const [currentNextStep, setCurrentNextStep] = useState&lt;NextStep | null&gt;(null);

  // Saudi-specific options
  const saudiRegions = [
    { value: 'riyadh', label: { ar: 'الرياض', en: 'Riyadh' } },
    { value: 'makkah', label: { ar: 'مكة المكرمة', en: 'Makkah' } },
    { value: 'madinah', label: { ar: 'المدينة المنورة', en: 'Madinah' } },
    { value: 'eastern', label: { ar: 'المنطقة الشرقية', en: 'Eastern Province' } },
    { value: 'asir', label: { ar: 'عسير', en: 'Asir' } },
    { value: 'tabuk', label: { ar: 'تبوك', en: 'Tabuk' } },
    { value: 'qassim', label: { ar: 'القصيم', en: 'Qassim' } },
    { value: 'hail', label: { ar: 'حائل', en: 'Hail' } },
    { value: 'northern_borders', label: { ar: 'الحدود الشمالية', en: 'Northern Borders' } },
    { value: 'jazan', label: { ar: 'جازان', en: 'Jazan' } },
    { value: 'najran', label: { ar: 'نجران', en: 'Najran' } },
    { value: 'bahah', label: { ar: 'الباحة', en: 'Al Bahah' } },
    { value: 'jouf', label: { ar: 'الجوف', en: 'Al Jouf' } },
  ];

  const businessSectors = [
    { value: 'healthcare', label: { ar: 'الرعاية الصحية', en: 'Healthcare' } },
    { value: 'technology', label: { ar: 'التكنولوجيا', en: 'Technology' } },
    { value: 'manufacturing', label: { ar: 'التصنيع', en: 'Manufacturing' } },
    { value: 'retail', label: { ar: 'التجارة', en: 'Retail' } },
    { value: 'education', label: { ar: 'التعليم', en: 'Education' } },
    { value: 'finance', label: { ar: 'المالية', en: 'Finance' } },
    { value: 'real_estate', label: { ar: 'العقارات', en: 'Real Estate' } },
    { value: 'transportation', label: { ar: 'النقل', en: 'Transportation' } },
    { value: 'tourism', label: { ar: 'السياحة', en: 'Tourism' } },
    { value: 'agriculture', label: { ar: 'الزراعة', en: 'Agriculture' } },
  ];

  const distributionChannels = [
    { value: 'online', label: { ar: 'متجر إلكتروني', en: 'Online Store' } },
    { value: 'retail', label: { ar: 'متاجر التجزئة', en: 'Retail Stores' } },
    { value: 'wholesale', label: { ar: 'الجملة', en: 'Wholesale' } },
    { value: 'direct_sales', label: { ar: 'المبيعات المباشرة', en: 'Direct Sales' } },
    { value: 'distributors', label: { ar: 'الموزعين', en: 'Distributors' } },
    { value: 'franchising', label: { ar: 'الامتياز', en: 'Franchising' } },
  ];

  /**
   * Update form data
   */
  const updateData = useCallback((updates: Partial&lt;BusinessPlanRequest&gt;) =&gt; {
    onChange({ ...data, ...updates });
  }, [data, onChange]);

  /**
   * Calculate financial totals
   */
  const calculateFinancialTotals = useCallback(() =&gt; {
    if (!data.financials) return;
    
    const totalRevenue = Object.values(data.financials).reduce((sum, year) =&gt; sum + (year.revenue || 0), 0);
    const totalExpenses = Object.values(data.financials).reduce((sum, year) =&gt; sum + (year.expenses || 0), 0);
    const totalNetProfit = totalRevenue - totalExpenses;
    
    return { totalRevenue, totalExpenses, totalNetProfit };
  }, [data.financials]);

  // Update parent data when lists change
  useEffect(() =&gt; {
    updateData({
      services: services.map(s =&gt; ({ name: s.name, description: s.description, price: s.price })),
      competitors: competitors.map(c =&gt; ({ 
        name: c.name, 
        strengths: c.strengths, 
        weaknesses: c.weaknesses, 
        marketShare: c.marketShare 
      })),
      managementTeam: teamMembers.map(m =&gt; ({
        name: m.name,
        position: m.position,
        experience: m.experience,
        education: m.education,
        responsibilities: m.responsibilities,
      })),
      implementationPhases: phases.map(p =&gt; ({
        date: p.date,
        phase: p.phase,
        description: p.description,
        duration: p.duration,
        cost: p.cost,
      })),
      riskAnalysis: risks.map(r =&gt; ({
        riskType: r.riskType,
        riskLevel: r.riskLevel,
        description: r.description,
        impact: r.impact,
        probability: r.probability,
        mitigationStrategy: r.mitigationStrategy,
      })),
      requiredLicenses: licenses.map(l =&gt; ({
        name: l.name,
        description: l.description,
        issuingAuthority: l.issuingAuthority,
        duration: l.duration,
      })),
      nextSteps: nextSteps.map(n =&gt; ({
        timeline: n.timeline,
        action: n.action,
        details: n.details,
      })),
    });
  }, [services, competitors, teamMembers, phases, risks, licenses, nextSteps, updateData]);

  /**
   * Render executive summary section
   */
  const renderExecutiveSummary = () =&gt; (
    &lt;Accordion defaultExpanded&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;BusinessIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Grid container spacing={3}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'اسم الشركة' : 'Company Name'}
              value={data.companyName || ''}
              onChange={(e) =&gt; updateData({ companyName: e.target.value })}
              required
              error={!!errors.companyName}
              helperText={errors.companyName}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'رقم السجل التجاري' : 'CR Number'}
              value={data.crNumber || ''}
              onChange={(e) =&gt; updateData({ crNumber: e.target.value })}
              placeholder={language === 'ar' ? '1010123456' : '1010123456'}
              inputProps={{ maxLength: 10 }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الرقم الضريبي' : 'VAT Number'}
              value={data.vatNumber || ''}
              onChange={(e) =&gt; updateData({ vatNumber: e.target.value })}
              placeholder={language === 'ar' ? '123456789012345' : '123456789012345'}
              inputProps={{ maxLength: 15 }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}
              value={data.executiveSummary || ''}
              onChange={(e) =&gt; updateData({ executiveSummary: e.target.value })}
              multiline
              rows={4}
              required
              error={!!errors.executiveSummary}
              helperText={errors.executiveSummary}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الهدف الرئيسي' : 'Main Objective'}
              value={data.mainObjective || ''}
              onChange={(e) =&gt; updateData({ mainObjective: e.target.value })}
              multiline
              rows={2}
              required
              error={!!errors.mainObjective}
              helperText={errors.mainObjective}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={4}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'مبلغ الاستثمار' : 'Investment Amount'}
              value={data.investmentAmount || ''}
              onChange={(e) =&gt; updateData({ investmentAmount: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={4}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'العائد المتوقع (%)' : 'Expected ROI (%)'}
              value={data.expectedROI || ''}
              onChange={(e) =&gt; updateData({ expectedROI: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                endAdornment: &lt;InputAdornment position="end"&gt;%&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={4}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الإطار الزمني (سنوات)' : 'Timeframe (Years)'}
              value={data.timeframe || ''}
              onChange={(e) =&gt; updateData({ timeframe: parseInt(e.target.value) || 0 })}
              type="number"
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  /**
   * Render company information section
   */
  const renderCompanyInfo = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;BusinessIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Grid container spacing={3}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'رؤية الشركة' : 'Company Vision'}
              value={data.companyVision || ''}
              onChange={(e) =&gt; updateData({ companyVision: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'رسالة الشركة' : 'Company Mission'}
              value={data.companyMission || ''}
              onChange={(e) =&gt; updateData({ companyMission: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'القيم الأساسية (منفصلة بفاصلة)' : 'Core Values (comma separated)'}
              value={data.coreValues?.join(', ') || ''}
              onChange={(e) =&gt; updateData({ coreValues: e.target.value.split(',').map(v =&gt; v.trim()) })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'العنوان الوطني' : 'National Address'}
              value={data.nationalAddress || ''}
              onChange={(e) =&gt; updateData({ nationalAddress: e.target.value })}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              value={data.phoneNumber || ''}
              onChange={(e) =&gt; updateData({ phoneNumber: e.target.value })}
              placeholder={language === 'ar' ? '+966501234567' : '+966501234567'}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              value={data.email || ''}
              onChange={(e) =&gt; updateData({ email: e.target.value })}
              type="email"
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  /**
   * Render services section with dynamic list
   */
  const renderServices = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;BusinessIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'المنتجات والخدمات' : 'Products &amp; Services'}
          &lt;/Typography&gt;
          &lt;Chip label={services.length} size="small" sx={{ ml: 1 }} /&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Box&gt;
          &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}&gt;
            &lt;Typography variant="subtitle1"&gt;
              {language === 'ar' ? 'قائمة الخدمات' : 'Services List'}
            &lt;/Typography&gt;
            &lt;Button
              startIcon={&lt;AddIcon /&gt;}
              onClick={() =&gt; {
                setCurrentService({
                  id: Date.now().toString(),
                  name: '',
                  description: '',
                  price: 0,
                });
                setShowServiceDialog(true);
              }}
            &gt;
              {language === 'ar' ? 'إضافة خدمة' : 'Add Service'}
            &lt;/Button&gt;
          &lt;/Box&gt;
          
          &lt;List&gt;
            {services.map((service) =&gt; (
              &lt;ListItem key={service.id} divider&gt;
                &lt;ListItemText
                  primary={service.name}
                  secondary={
                    &lt;Box&gt;
                      &lt;Typography variant="body2" color="text.secondary"&gt;
                        {service.description}
                      &lt;/Typography&gt;
                      &lt;Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}&gt;
                        {service.price.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                      &lt;/Typography&gt;
                    &lt;/Box&gt;
                  }
                /&gt;
                &lt;ListItemSecondaryAction&gt;
                  &lt;IconButton
                    onClick={() =&gt; {
                      setCurrentService(service);
                      setShowServiceDialog(true);
                    }}
                  &gt;
                    &lt;InfoIcon /&gt;
                  &lt;/IconButton&gt;
                  &lt;IconButton
                    onClick={() =&gt; setServices(services.filter(s =&gt; s.id !== service.id))}
                    color="error"
                  &gt;
                    &lt;DeleteIcon /&gt;
                  &lt;/IconButton&gt;
                &lt;/ListItemSecondaryAction&gt;
              &lt;/ListItem&gt;
            ))}
          &lt;/List&gt;
          
          {services.length === 0 &amp;&amp; (
            &lt;Alert severity="info" sx={{ mt: 2 }}&gt;
              {language === 'ar' 
                ? 'لم يتم إضافة أي خدمات بعد. انقر على "إضافة خدمة" لبدء إضافة الخدمات.'
                : 'No services added yet. Click "Add Service" to start adding services.'
              }
            &lt;/Alert&gt;
          )}
        &lt;/Box&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  /**
   * Render market analysis section
   */
  const renderMarketAnalysis = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;TrendingUpIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'تحليل السوق' : 'Market Analysis'}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Grid container spacing={3}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الميزة التنافسية' : 'Competitive Advantage'}
              value={data.competitiveAdvantage || ''}
              onChange={(e) =&gt; updateData({ competitiveAdvantage: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'السوق المستهدف' : 'Target Market'}
              value={data.targetMarket || ''}
              onChange={(e) =&gt; updateData({ targetMarket: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={4}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'حجم السوق' : 'Market Size'}
              value={data.marketSize || ''}
              onChange={(e) =&gt; updateData({ marketSize: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={4}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'معدل نمو السوق (%)' : 'Market Growth Rate (%)'}
              value={data.marketGrowthRate || ''}
              onChange={(e) =&gt; updateData({ marketGrowthRate: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                endAdornment: &lt;InputAdornment position="end"&gt;%&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={4}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الحصة السوقية المستهدفة (%)' : 'Target Market Share (%)'}
              value={data.marketShare || ''}
              onChange={(e) =&gt; updateData({ marketShare: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                endAdornment: &lt;InputAdornment position="end"&gt;%&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'استراتيجية التسعير' : 'Pricing Strategy'}
              value={data.pricingStrategy || ''}
              onChange={(e) =&gt; updateData({ pricingStrategy: e.target.value })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;FormControl fullWidth&gt;
              &lt;InputLabel&gt;{language === 'ar' ? 'قنوات التوزيع' : 'Distribution Channels'}&lt;/InputLabel&gt;
              &lt;Select
                multiple
                value={data.distributionChannels || []}
                onChange={(e) =&gt; updateData({ distributionChannels: e.target.value as string[] })}
                renderValue={(selected) =&gt; (
                  &lt;Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}&gt;
                    {(selected as string[]).map((value) =&gt; (
                      &lt;Chip 
                        key={value} 
                        label={distributionChannels.find(ch =&gt; ch.value === value)?.label[language]} 
                        size="small"
                      /&gt;
                    ))}
                  &lt;/Box&gt;
                )}
              &gt;
                {distributionChannels.map((channel) =&gt; (
                  &lt;MenuItem key={channel.value} value={channel.value}&gt;
                    {channel.label[language]}
                  &lt;/MenuItem&gt;
                ))}
              &lt;/Select&gt;
            &lt;/FormControl&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'استراتيجية الترويج' : 'Promotion Strategy'}
              value={data.promotionStrategy || ''}
              onChange={(e) =&gt; updateData({ promotionStrategy: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  /**
   * Render financial projections section
   */
  const renderFinancials = () =&gt; {
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'] as const;
    const yearLabels = {
      year1: language === 'ar' ? 'السنة الأولى' : 'Year 1',
      year2: language === 'ar' ? 'السنة الثانية' : 'Year 2',
      year3: language === 'ar' ? 'السنة الثالثة' : 'Year 3',
      year4: language === 'ar' ? 'السنة الرابعة' : 'Year 4',
      year5: language === 'ar' ? 'السنة الخامسة' : 'Year 5',
    };

    const totals = calculateFinancialTotals();

    return (
      &lt;Accordion&gt;
        &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
          &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
            &lt;MoneyIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
            &lt;Typography variant="h6"&gt;
              {language === 'ar' ? 'التوقعات المالية' : 'Financial Projections'}
            &lt;/Typography&gt;
          &lt;/Box&gt;
        &lt;/AccordionSummary&gt;
        &lt;AccordionDetails&gt;
          &lt;Box&gt;
            {/* Financial Projections for 5 years */}
            {years.map((year) =&gt; (
              &lt;Card key={year} sx={{ mb: 2 }}&gt;
                &lt;CardHeader
                  title={yearLabels[year]}
                  sx={{ pb: 1 }}
                /&gt;
                &lt;CardContent&gt;
                  &lt;Grid container spacing={2}&gt;
                    &lt;Grid item xs={12} md={4}&gt;
                      &lt;TextField
                        fullWidth
                        label={language === 'ar' ? 'الإيرادات' : 'Revenue'}
                        value={data.financials?.[year]?.revenue || ''}
                        onChange={(e) =&gt; updateData({
                          financials: {
                            ...data.financials,
                            [year]: {
                              ...data.financials?.[year],
                              revenue: parseFloat(e.target.value) || 0,
                            }
                          }
                        })}
                        type="number"
                        InputProps={{
                          startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                        }}
                        dir="ltr"
                      /&gt;
                    &lt;/Grid&gt;
                    
                    &lt;Grid item xs={12} md={4}&gt;
                      &lt;TextField
                        fullWidth
                        label={language === 'ar' ? 'المصروفات' : 'Expenses'}
                        value={data.financials?.[year]?.expenses || ''}
                        onChange={(e) =&gt; updateData({
                          financials: {
                            ...data.financials,
                            [year]: {
                              ...data.financials?.[year],
                              expenses: parseFloat(e.target.value) || 0,
                            }
                          }
                        })}
                        type="number"
                        InputProps={{
                          startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                        }}
                        dir="ltr"
                      /&gt;
                    &lt;/Grid&gt;
                    
                    &lt;Grid item xs={12} md={4}&gt;
                      &lt;TextField
                        fullWidth
                        label={language === 'ar' ? 'صافي الربح' : 'Net Profit'}
                        value={data.financials?.[year]?.netProfit || ''}
                        onChange={(e) =&gt; updateData({
                          financials: {
                            ...data.financials,
                            [year]: {
                              ...data.financials?.[year],
                              netProfit: parseFloat(e.target.value) || 0,
                            }
                          }
                        })}
                        type="number"
                        InputProps={{
                          startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                        }}
                        dir="ltr"
                      /&gt;
                    &lt;/Grid&gt;
                  &lt;/Grid&gt;
                &lt;/CardContent&gt;
              &lt;/Card&gt;
            ))}
            
            {/* Funding Requirements */}
            &lt;Card sx={{ mt: 3 }}&gt;
              &lt;CardHeader
                title={language === 'ar' ? 'متطلبات التمويل' : 'Funding Requirements'}
                sx={{ pb: 1 }}
              /&gt;
              &lt;CardContent&gt;
                &lt;Grid container spacing={3}&gt;
                  &lt;Grid item xs={12} md={4}&gt;
                    &lt;TextField
                      fullWidth
                      label={language === 'ar' ? 'الاستثمار الأولي' : 'Initial Investment'}
                      value={data.fundingRequirements?.initialInvestment || ''}
                      onChange={(e) =&gt; updateData({
                        fundingRequirements: {
                          ...data.fundingRequirements,
                          initialInvestment: parseFloat(e.target.value) || 0,
                        }
                      })}
                      type="number"
                      InputProps={{
                        startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                      }}
                      dir="ltr"
                    /&gt;
                  &lt;/Grid&gt;
                  
                  &lt;Grid item xs={12} md={4}&gt;
                    &lt;TextField
                      fullWidth
                      label={language === 'ar' ? 'رأس المال العامل' : 'Working Capital'}
                      value={data.fundingRequirements?.workingCapital || ''}
                      onChange={(e) =&gt; updateData({
                        fundingRequirements: {
                          ...data.fundingRequirements,
                          workingCapital: parseFloat(e.target.value) || 0,
                        }
                      })}
                      type="number"
                      InputProps={{
                        startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                      }}
                      dir="ltr"
                    /&gt;
                  &lt;/Grid&gt;
                  
                  &lt;Grid item xs={12} md={4}&gt;
                    &lt;TextField
                      fullWidth
                      label={language === 'ar' ? 'إجمالي التمويل المطلوب' : 'Total Funding Required'}
                      value={data.fundingRequirements?.totalFunding || ''}
                      onChange={(e) =&gt; updateData({
                        fundingRequirements: {
                          ...data.fundingRequirements,
                          totalFunding: parseFloat(e.target.value) || 0,
                        }
                      })}
                      type="number"
                      InputProps={{
                        startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                      }}
                      dir="ltr"
                    /&gt;
                  &lt;/Grid&gt;
                &lt;/Grid&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;

            {/* Financial Summary */}
            {totals &amp;&amp; (
              &lt;Alert severity="info" sx={{ mt: 2 }}&gt;
                &lt;Typography variant="subtitle2"&gt;
                  {language === 'ar' ? 'الملخص المالي (5 سنوات)' : 'Financial Summary (5 Years)'}
                &lt;/Typography&gt;
                &lt;Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}&gt;
                  &lt;Chip 
                    label={`${language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}: ${totals.totalRevenue.toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                    color="primary"
                    size="small"
                  /&gt;
                  &lt;Chip 
                    label={`${language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}: ${totals.totalExpenses.toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                    color="secondary"
                    size="small"
                  /&gt;
                  &lt;Chip 
                    label={`${language === 'ar' ? 'صافي الربح' : 'Net Profit'}: ${totals.totalNetProfit.toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                    color={totals.totalNetProfit &gt;= 0 ? "success" : "error"}
                    size="small"
                  /&gt;
                &lt;/Box&gt;
              &lt;/Alert&gt;
            )}
          &lt;/Box&gt;
        &lt;/AccordionDetails&gt;
      &lt;/Accordion&gt;
    );
  };

  /**
   * Render compliance and conclusion sections
   */
  const renderComplianceAndConclusion = () =&gt; (
    &lt;&gt;
      &lt;Accordion&gt;
        &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
          &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
            &lt;SecurityIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
            &lt;Typography variant="h6"&gt;
              {language === 'ar' ? 'الامتثال والتراخيص' : 'Compliance &amp; Licenses'}
            &lt;/Typography&gt;
          &lt;/Box&gt;
        &lt;/AccordionSummary&gt;
        &lt;AccordionDetails&gt;
          &lt;Grid container spacing={3}&gt;
            &lt;Grid item xs={12}&gt;
              &lt;TextField
                fullWidth
                label={language === 'ar' ? 'متطلبات الامتثال (منفصلة بفاصلة)' : 'Compliance Requirements (comma separated)'}
                value={data.complianceRequirements?.join(', ') || ''}
                onChange={(e) =&gt; updateData({ complianceRequirements: e.target.value.split(',').map(r =&gt; r.trim()) })}
                multiline
                rows={2}
                dir={direction}
              /&gt;
            &lt;/Grid&gt;
          &lt;/Grid&gt;
        &lt;/AccordionDetails&gt;
      &lt;/Accordion&gt;
      
      &lt;Accordion&gt;
        &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
          &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
            &lt;AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
            &lt;Typography variant="h6"&gt;
              {language === 'ar' ? 'الخلاصة والتوصيات' : 'Conclusion &amp; Recommendations'}
            &lt;/Typography&gt;
          &lt;/Box&gt;
        &lt;/AccordionSummary&gt;
        &lt;AccordionDetails&gt;
          &lt;Grid container spacing={3}&gt;
            &lt;Grid item xs={12}&gt;
              &lt;TextField
                fullWidth
                label={language === 'ar' ? 'الخلاصة' : 'Conclusion'}
                value={data.conclusion || ''}
                onChange={(e) =&gt; updateData({ conclusion: e.target.value })}
                multiline
                rows={4}
                dir={direction}
              /&gt;
            &lt;/Grid&gt;
            
            &lt;Grid item xs={12}&gt;
              &lt;TextField
                fullWidth
                label={language === 'ar' ? 'التوصيات (منفصلة بفاصلة)' : 'Recommendations (comma separated)'}
                value={data.recommendations?.join(', ') || ''}
                onChange={(e) =&gt; updateData({ recommendations: e.target.value.split(',').map(r =&gt; r.trim()) })}
                multiline
                rows={3}
                dir={direction}
              /&gt;
            &lt;/Grid&gt;
          &lt;/Grid&gt;
        &lt;/AccordionDetails&gt;
      &lt;/Accordion&gt;
    &lt;/&gt;
  );

  // Service Dialog Component
  const ServiceDialog = () =&gt; (
    &lt;Dialog open={showServiceDialog} onClose={() =&gt; setShowServiceDialog(false)} maxWidth="sm" fullWidth&gt;
      &lt;DialogTitle&gt;
        {currentService?.name 
          ? (language === 'ar' ? 'تعديل الخدمة' : 'Edit Service')
          : (language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service')
        }
      &lt;/DialogTitle&gt;
      &lt;DialogContent&gt;
        &lt;Grid container spacing={2} sx={{ mt: 1 }}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'اسم الخدمة' : 'Service Name'}
              value={currentService?.name || ''}
              onChange={(e) =&gt; setCurrentService(prev =&gt; prev ? { ...prev, name: e.target.value } : null)}
              required
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'وصف الخدمة' : 'Service Description'}
              value={currentService?.description || ''}
              onChange={(e) =&gt; setCurrentService(prev =&gt; prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'السعر' : 'Price'}
              value={currentService?.price || ''}
              onChange={(e) =&gt; setCurrentService(prev =&gt; prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
              type="number"
              InputProps={{
                startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/DialogContent&gt;
      &lt;DialogActions&gt;
        &lt;Button onClick={() =&gt; setShowServiceDialog(false)}&gt;
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        &lt;/Button&gt;
        &lt;Button
          variant="contained"
          onClick={() =&gt; {
            if (currentService) {
              const existingIndex = services.findIndex(s =&gt; s.id === currentService.id);
              if (existingIndex !== -1) {
                setServices(services.map(s =&gt; s.id === currentService.id ? currentService : s));
              } else {
                setServices([...services, currentService]);
              }
            }
            setShowServiceDialog(false);
            setCurrentService(null);
          }}
          disabled={!currentService?.name}
        &gt;
          {currentService?.name 
            ? (language === 'ar' ? 'حفظ' : 'Save')
            : (language === 'ar' ? 'إضافة' : 'Add')
          }
        &lt;/Button&gt;
      &lt;/DialogActions&gt;
    &lt;/Dialog&gt;
  );

  return (
    &lt;Box sx={{ width: '100%' }}&gt;
      &lt;Typography variant="h5" gutterBottom&gt;
        {language === 'ar' ? 'نموذج خطة العمل' : 'Business Plan Form'}
      &lt;/Typography&gt;
      
      &lt;Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}&gt;
        {language === 'ar' 
          ? 'املأ النموذج التالي لإنشاء خطة عمل شاملة متوافقة مع الأنظمة السعودية'
          : 'Fill out the following form to create a comprehensive business plan compliant with Saudi regulations'
        }
      &lt;/Typography&gt;

      &lt;Box sx={{ mb: 3 }}&gt;
        {renderExecutiveSummary()}
        {renderCompanyInfo()}
        {renderServices()}
        {renderMarketAnalysis()}
        {renderFinancials()}
        {renderComplianceAndConclusion()}
      &lt;/Box&gt;

      {/* Service Dialog */}
      &lt;ServiceDialog /&gt;
      
      {/* Error display */}
      {Object.keys(errors).length &gt; 0 &amp;&amp; (
        &lt;Alert severity="error" sx={{ mt: 2 }}&gt;
          &lt;Typography variant="subtitle2"&gt;
            {language === 'ar' ? 'يرجى تصحيح الأخطاء التالية:' : 'Please correct the following errors:'}
          &lt;/Typography&gt;
          &lt;ul&gt;
            {Object.entries(errors).map(([field, error]) =&gt; (
              &lt;li key={field}&gt;{error}&lt;/li&gt;
            ))}
          &lt;/ul&gt;
        &lt;/Alert&gt;
      )}
    &lt;/Box&gt;
  );
};

export default BusinessPlanForm;