'use client';

import {
    Add as AddIcon,
    Assessment as AssessmentIcon,
    Business as BusinessIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    Info as InfoIcon,
    AttachMoney as MoneyIcon,
    Security as SecurityIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { useAppTheme } from '../../../lib/ThemeProvider';
import type { BusinessPlanRequest } from '../../../services/documentService';

/**
 * BusinessPlanForm Component Props
 */
interface BusinessPlanFormProps {
  data: Partial<BusinessPlanRequest>;
  onChange: (data: Partial<BusinessPlanRequest>) => void;
  language: 'ar' | 'en';
  errors: Record<string, string>;
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
const BusinessPlanForm: React.FC<BusinessPlanFormProps> = ({
  data,
  onChange,
  language,
  errors,
}) => {
  const { t } = useTranslation(['documents', 'common']);
  const { direction } = useAppTheme();
  
  // State for dynamic lists
  const [services, setServices] = useState<ServiceItem[]>(data.services?.map((s, i) => ({
    id: i.toString(),
    name: s.name,
    description: s.description,
    price: s.price,
  })) || []);
  
  const [competitors, setCompetitors] = useState<CompetitorItem[]>(data.competitors?.map((c, i) => ({
    id: i.toString(),
    name: c.name,
    strengths: c.strengths,
    weaknesses: c.weaknesses,
    marketShare: c.marketShare,
  })) || []);
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(data.managementTeam?.map((m, i) => ({
    id: i.toString(),
    name: m.name,
    position: m.position,
    experience: m.experience,
    education: m.education,
    responsibilities: m.responsibilities,
  })) || []);
  
  const [phases, setPhases] = useState<ImplementationPhase[]>(data.implementationPhases?.map((p, i) => ({
    id: i.toString(),
    date: p.date,
    phase: p.phase,
    description: p.description,
    duration: p.duration,
    cost: p.cost,
  })) || []);
  
  const [risks, setRisks] = useState<RiskItem[]>(data.riskAnalysis?.map((r, i) => ({
    id: i.toString(),
    riskType: r.riskType,
    riskLevel: r.riskLevel,
    description: r.description,
    impact: r.impact,
    probability: r.probability,
    mitigationStrategy: r.mitigationStrategy,
  })) || []);
  
  const [licenses, setLicenses] = useState<LicenseRequirement[]>(data.requiredLicenses?.map((l, i) => ({
    id: i.toString(),
    name: l.name,
    description: l.description,
    issuingAuthority: l.issuingAuthority,
    duration: l.duration,
  })) || []);
  
  const [nextSteps, setNextSteps] = useState<NextStep[]>(data.nextSteps?.map((n, i) => ({
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
  const [currentService, setCurrentService] = useState<ServiceItem | null>(null);
  const [currentCompetitor, setCurrentCompetitor] = useState<CompetitorItem | null>(null);
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember | null>(null);
  const [currentPhase, setCurrentPhase] = useState<ImplementationPhase | null>(null);
  const [currentRisk, setCurrentRisk] = useState<RiskItem | null>(null);
  const [currentLicense, setCurrentLicense] = useState<LicenseRequirement | null>(null);
  const [currentNextStep, setCurrentNextStep] = useState<NextStep | null>(null);

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
  const updateData = useCallback((updates: Partial<BusinessPlanRequest>) => {
    onChange({ ...data, ...updates });
  }, [data, onChange]);

  /**
   * Calculate financial totals
   */
  const calculateFinancialTotals = useCallback(() => {
    if (!data.financials) return;
    
    const totalRevenue = Object.values(data.financials).reduce((sum, year) => sum + (year.revenue || 0), 0);
    const totalExpenses = Object.values(data.financials).reduce((sum, year) => sum + (year.expenses || 0), 0);
    const totalNetProfit = totalRevenue - totalExpenses;
    
    return { totalRevenue, totalExpenses, totalNetProfit };
  }, [data.financials]);

  // Update parent data when lists change
  useEffect(() => {
    updateData({
      services: services.map(s => ({ name: s.name, description: s.description, price: s.price })),
      competitors: competitors.map(c => ({ 
        name: c.name, 
        strengths: c.strengths, 
        weaknesses: c.weaknesses, 
        marketShare: c.marketShare 
      })),
      managementTeam: teamMembers.map(m => ({
        name: m.name,
        position: m.position,
        experience: m.experience,
        education: m.education,
        responsibilities: m.responsibilities,
      })),
      implementationPhases: phases.map(p => ({
        date: p.date,
        phase: p.phase,
        description: p.description,
        duration: p.duration,
        cost: p.cost,
      })),
      riskAnalysis: risks.map(r => ({
        riskType: r.riskType,
        riskLevel: r.riskLevel,
        description: r.description,
        impact: r.impact,
        probability: r.probability,
        mitigationStrategy: r.mitigationStrategy,
      })),
      requiredLicenses: licenses.map(l => ({
        name: l.name,
        description: l.description,
        issuingAuthority: l.issuingAuthority,
        duration: l.duration,
      })),
      nextSteps: nextSteps.map(n => ({
        timeline: n.timeline,
        action: n.action,
        details: n.details,
      })),
    });
  }, [services, competitors, teamMembers, phases, risks, licenses, nextSteps, updateData]);

  /**
   * Render executive summary section
   */
  const renderExecutiveSummary = () => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'اسم الشركة' : 'Company Name'}
              value={data.companyName || ''}
              onChange={(e) => updateData({ companyName: e.target.value })}
              required
              error={!!errors.companyName}
              helperText={errors.companyName}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'رقم السجل التجاري' : 'CR Number'}
              value={data.crNumber || ''}
              onChange={(e) => updateData({ crNumber: e.target.value })}
              placeholder={language === 'ar' ? '1010123456' : '1010123456'}
              inputProps={{ maxLength: 10 }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الرقم الضريبي' : 'VAT Number'}
              value={data.vatNumber || ''}
              onChange={(e) => updateData({ vatNumber: e.target.value })}
              placeholder={language === 'ar' ? '123456789012345' : '123456789012345'}
              inputProps={{ maxLength: 15 }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}
              value={data.executiveSummary || ''}
              onChange={(e) => updateData({ executiveSummary: e.target.value })}
              multiline
              rows={4}
              required
              error={!!errors.executiveSummary}
              helperText={errors.executiveSummary}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الهدف الرئيسي' : 'Main Objective'}
              value={data.mainObjective || ''}
              onChange={(e) => updateData({ mainObjective: e.target.value })}
              multiline
              rows={2}
              required
              error={!!errors.mainObjective}
              helperText={errors.mainObjective}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'مبلغ الاستثمار' : 'Investment Amount'}
              value={data.investmentAmount || ''}
              onChange={(e) => updateData({ investmentAmount: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'العائد المتوقع (%)' : 'Expected ROI (%)'}
              value={data.expectedROI || ''}
              onChange={(e) => updateData({ expectedROI: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الإطار الزمني (سنوات)' : 'Timeframe (Years)'}
              value={data.timeframe || ''}
              onChange={(e) => updateData({ timeframe: parseInt(e.target.value) || 0 })}
              type="number"
              dir="ltr"
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  /**
   * Render company information section
   */
  const renderCompanyInfo = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'رؤية الشركة' : 'Company Vision'}
              value={data.companyVision || ''}
              onChange={(e) => updateData({ companyVision: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'رسالة الشركة' : 'Company Mission'}
              value={data.companyMission || ''}
              onChange={(e) => updateData({ companyMission: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'القيم الأساسية (منفصلة بفاصلة)' : 'Core Values (comma separated)'}
              value={data.coreValues?.join(', ') || ''}
              onChange={(e) => updateData({ coreValues: e.target.value.split(',').map(v => v.trim()) })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'العنوان الوطني' : 'National Address'}
              value={data.nationalAddress || ''}
              onChange={(e) => updateData({ nationalAddress: e.target.value })}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              value={data.phoneNumber || ''}
              onChange={(e) => updateData({ phoneNumber: e.target.value })}
              placeholder={language === 'ar' ? '+966501234567' : '+966501234567'}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              value={data.email || ''}
              onChange={(e) => updateData({ email: e.target.value })}
              type="email"
              dir="ltr"
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  /**
   * Render services section with dynamic list
   */
  const renderServices = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'المنتجات والخدمات' : 'Products &amp; Services'}
          </Typography>
          <Chip label={services.length} size="small" sx={{ ml: 1 }} />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              {language === 'ar' ? 'قائمة الخدمات' : 'Services List'}
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setCurrentService({
                  id: Date.now().toString(),
                  name: '',
                  description: '',
                  price: 0,
                });
                setShowServiceDialog(true);
              }}
            >
              {language === 'ar' ? 'إضافة خدمة' : 'Add Service'}
            </Button>
          </Box>
          
          <List>
            {services.map((service) => (
              <ListItem key={service.id} divider>
                <ListItemText
                  primary={service.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {service.price.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => {
                      setCurrentService(service);
                      setShowServiceDialog(true);
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setServices(services.filter(s => s.id !== service.id))}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          {services.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {language === 'ar' 
                ? 'لم يتم إضافة أي خدمات بعد. انقر على "إضافة خدمة" لبدء إضافة الخدمات.'
                : 'No services added yet. Click "Add Service" to start adding services.'
              }
            </Alert>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  /**
   * Render market analysis section
   */
  const renderMarketAnalysis = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'تحليل السوق' : 'Market Analysis'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الميزة التنافسية' : 'Competitive Advantage'}
              value={data.competitiveAdvantage || ''}
              onChange={(e) => updateData({ competitiveAdvantage: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'السوق المستهدف' : 'Target Market'}
              value={data.targetMarket || ''}
              onChange={(e) => updateData({ targetMarket: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'حجم السوق' : 'Market Size'}
              value={data.marketSize || ''}
              onChange={(e) => updateData({ marketSize: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'معدل نمو السوق (%)' : 'Market Growth Rate (%)'}
              value={data.marketGrowthRate || ''}
              onChange={(e) => updateData({ marketGrowthRate: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الحصة السوقية المستهدفة (%)' : 'Target Market Share (%)'}
              value={data.marketShare || ''}
              onChange={(e) => updateData({ marketShare: parseFloat(e.target.value) || 0 })}
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'استراتيجية التسعير' : 'Pricing Strategy'}
              value={data.pricingStrategy || ''}
              onChange={(e) => updateData({ pricingStrategy: e.target.value })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{language === 'ar' ? 'قنوات التوزيع' : 'Distribution Channels'}</InputLabel>
              <Select
                multiple
                value={data.distributionChannels || []}
                onChange={(e) => updateData({ distributionChannels: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip 
                        key={value} 
                        label={distributionChannels.find(ch => ch.value === value)?.label[language]} 
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {distributionChannels.map((channel) => (
                  <MenuItem key={channel.value} value={channel.value}>
                    {channel.label[language]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'استراتيجية الترويج' : 'Promotion Strategy'}
              value={data.promotionStrategy || ''}
              onChange={(e) => updateData({ promotionStrategy: e.target.value })}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  /**
   * Render financial projections section
   */
  const renderFinancials = () => {
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
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MoneyIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">
              {language === 'ar' ? 'التوقعات المالية' : 'Financial Projections'}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {/* Financial Projections for 5 years */}
            {years.map((year) => (
              <Card key={year} sx={{ mb: 2 }}>
                <CardHeader
                  title={yearLabels[year]}
                  sx={{ pb: 1 }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={language === 'ar' ? 'الإيرادات' : 'Revenue'}
                        value={data.financials?.[year]?.revenue || ''}
                        onChange={(e) => updateData({
                          financials: {
                            year1: data.financials?.year1 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year2: data.financials?.year2 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year3: data.financials?.year3 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year4: data.financials?.year4 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year5: data.financials?.year5 || { revenue: 0, expenses: 0, netProfit: 0 },
                            [year]: {
                              ...data.financials?.[year],
                              revenue: parseFloat(e.target.value) || 0,
                            }
                          }
                        })}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                        }}
                        dir="ltr"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={language === 'ar' ? 'المصروفات' : 'Expenses'}
                        value={data.financials?.[year]?.expenses || ''}
                        onChange={(e) => updateData({
                          financials: {
                            year1: data.financials?.year1 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year2: data.financials?.year2 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year3: data.financials?.year3 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year4: data.financials?.year4 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year5: data.financials?.year5 || { revenue: 0, expenses: 0, netProfit: 0 },
                            [year]: {
                              ...data.financials?.[year],
                              expenses: parseFloat(e.target.value) || 0,
                            }
                          }
                        })}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                        }}
                        dir="ltr"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={language === 'ar' ? 'صافي الربح' : 'Net Profit'}
                        value={data.financials?.[year]?.netProfit || ''}
                        onChange={(e) => updateData({
                          financials: {
                            year1: data.financials?.year1 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year2: data.financials?.year2 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year3: data.financials?.year3 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year4: data.financials?.year4 || { revenue: 0, expenses: 0, netProfit: 0 },
                            year5: data.financials?.year5 || { revenue: 0, expenses: 0, netProfit: 0 },
                            [year]: {
                              ...data.financials?.[year],
                              netProfit: parseFloat(e.target.value) || 0,
                            }
                          }
                        })}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                        }}
                        dir="ltr"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            
            {/* Funding Requirements */}
            <Card sx={{ mt: 3 }}>
              <CardHeader
                title={language === 'ar' ? 'متطلبات التمويل' : 'Funding Requirements'}
                sx={{ pb: 1 }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={language === 'ar' ? 'الاستثمار الأولي' : 'Initial Investment'}
                      value={data.fundingRequirements?.initialInvestment || ''}
                      onChange={(e) => updateData({
                        fundingRequirements: {
                          initialInvestment: parseFloat(e.target.value) || 0,
                          workingCapital: data.fundingRequirements?.workingCapital || 0,
                          totalFunding: data.fundingRequirements?.totalFunding || 0,
                        }
                      })}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                      }}
                      dir="ltr"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={language === 'ar' ? 'رأس المال العامل' : 'Working Capital'}
                      value={data.fundingRequirements?.workingCapital || ''}
                      onChange={(e) => updateData({
                        fundingRequirements: {
                          initialInvestment: data.fundingRequirements?.initialInvestment || 0,
                          workingCapital: parseFloat(e.target.value) || 0,
                          totalFunding: data.fundingRequirements?.totalFunding || 0,
                        }
                      })}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                      }}
                      dir="ltr"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={language === 'ar' ? 'إجمالي التمويل المطلوب' : 'Total Funding Required'}
                      value={data.fundingRequirements?.totalFunding || ''}
                      onChange={(e) => updateData({
                        fundingRequirements: {
                          initialInvestment: data.fundingRequirements?.initialInvestment || 0,
                          workingCapital: data.fundingRequirements?.workingCapital || 0,
                          totalFunding: parseFloat(e.target.value) || 0,
                        }
                      })}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                      }}
                      dir="ltr"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            {totals && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  {language === 'ar' ? 'الملخص المالي (5 سنوات)' : 'Financial Summary (5 Years)'}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}: ${totals.totalRevenue.toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                    color="primary"
                    size="small"
                  />
                  <Chip 
                    label={`${language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}: ${totals.totalExpenses.toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                    color="secondary"
                    size="small"
                  />
                  <Chip 
                    label={`${language === 'ar' ? 'صافي الربح' : 'Net Profit'}: ${totals.totalNetProfit.toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`}
                    color={totals.totalNetProfit >= 0 ? "success" : "error"}
                    size="small"
                  />
                </Box>
              </Alert>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  /**
   * Render compliance and conclusion sections
   */
  const renderComplianceAndConclusion = () => (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">
              {language === 'ar' ? 'الامتثال والتراخيص' : 'Compliance &amp; Licenses'}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={language === 'ar' ? 'متطلبات الامتثال (منفصلة بفاصلة)' : 'Compliance Requirements (comma separated)'}
                value={data.complianceRequirements?.join(', ') || ''}
                onChange={(e) => updateData({ complianceRequirements: e.target.value.split(',').map(r => r.trim()) })}
                multiline
                rows={2}
                dir={direction}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">
              {language === 'ar' ? 'الخلاصة والتوصيات' : 'Conclusion &amp; Recommendations'}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={language === 'ar' ? 'الخلاصة' : 'Conclusion'}
                value={data.conclusion || ''}
                onChange={(e) => updateData({ conclusion: e.target.value })}
                multiline
                rows={4}
                dir={direction}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={language === 'ar' ? 'التوصيات (منفصلة بفاصلة)' : 'Recommendations (comma separated)'}
                value={data.recommendations?.join(', ') || ''}
                onChange={(e) => updateData({ recommendations: e.target.value.split(',').map(r => r.trim()) })}
                multiline
                rows={3}
                dir={direction}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );

  // Service Dialog Component
  const ServiceDialog = () => (
    <Dialog open={showServiceDialog} onClose={() => setShowServiceDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {currentService?.name 
          ? (language === 'ar' ? 'تعديل الخدمة' : 'Edit Service')
          : (language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service')
        }
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'اسم الخدمة' : 'Service Name'}
              value={currentService?.name || ''}
              onChange={(e) => setCurrentService(prev => prev ? { ...prev, name: e.target.value } : null)}
              required
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'وصف الخدمة' : 'Service Description'}
              value={currentService?.description || ''}
              onChange={(e) => setCurrentService(prev => prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'السعر' : 'Price'}
              value={currentService?.price || ''}
              onChange={(e) => setCurrentService(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowServiceDialog(false)}>
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (currentService) {
              const existingIndex = services.findIndex(s => s.id === currentService.id);
              if (existingIndex !== -1) {
                setServices(services.map(s => s.id === currentService.id ? currentService : s));
              } else {
                setServices([...services, currentService]);
              }
            }
            setShowServiceDialog(false);
            setCurrentService(null);
          }}
          disabled={!currentService?.name}
        >
          {currentService?.name 
            ? (language === 'ar' ? 'حفظ' : 'Save')
            : (language === 'ar' ? 'إضافة' : 'Add')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        {language === 'ar' ? 'نموذج خطة العمل' : 'Business Plan Form'}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {language === 'ar' 
          ? 'املأ النموذج التالي لإنشاء خطة عمل شاملة متوافقة مع الأنظمة السعودية'
          : 'Fill out the following form to create a comprehensive business plan compliant with Saudi regulations'
        }
      </Typography>

      <Box sx={{ mb: 3 }}>
        {renderExecutiveSummary()}
        {renderCompanyInfo()}
        {renderServices()}
        {renderMarketAnalysis()}
        {renderFinancials()}
        {renderComplianceAndConclusion()}
      </Box>

      {/* Service Dialog */}
      <ServiceDialog />
      
      {/* Error display */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle2">
            {language === 'ar' ? 'يرجى تصحيح الأخطاء التالية:' : 'Please correct the following errors:'}
          </Typography>
          <ul>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
};

export default BusinessPlanForm;