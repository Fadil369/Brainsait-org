'use client';

// @ts-nocheck
import {
    Add as AddIcon,
    Analytics as AnalyticsIcon,
    Assessment as AssessmentIcon,
    Calculate as CalculateIcon,
    Delete as DeleteIcon,
    Engineering as EngineeringIcon,
    ExpandMore as ExpandMoreIcon,
    Info as InfoIcon,
    AttachMoney as MoneyIcon,
    Security as SecurityIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon
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
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { useAppTheme } from '../../../lib/ThemeProvider';
import type { FeasibilityStudyRequest } from '../../../services/documentService';

/**
 * FeasibilityStudyForm Component Props
 */
interface FeasibilityStudyFormProps {
  data: Partial<FeasibilityStudyRequest>;
  onChange: (data: Partial<FeasibilityStudyRequest>) => void;
  language: 'ar' | 'en';
  errors: Record<string, string>;
}

/**
 * Revenue Projection Interface
 */
interface RevenueProjection {
  year: number;
  revenue: number;
  costs: number;
  profit: number;
}

/**
 * Technology Requirement Interface
 */
interface TechnologyRequirement {
  id: string;
  name: string;
  description: string;
  cost: number;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Resource Requirement Interface
 */
interface ResourceRequirement {
  id: string;
  type: 'human' | 'equipment' | 'infrastructure' | 'software' | 'other';
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

/**
 * Risk Item Interface
 */
interface RiskItem {
  id: string;
  category: 'market' | 'technical' | 'financial' | 'operational';
  risk: string;
  impact: 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  mitigation: string;
}

/**
 * FeasibilityStudyForm Component
 * 
 * Comprehensive form for feasibility study data collection with Saudi market
 * analysis, technical requirements, and financial projections
 * 
 * @param props - Component properties
 * @returns JSX.Element
 */
const FeasibilityStudyForm: React.FC<FeasibilityStudyFormProps> = ({
  data,
  onChange,
  language,
  errors,
}) => {
  const { t } = useTranslation(['documents', 'common']);
  const { direction } = useAppTheme();
  
  // State for dynamic lists
  const [techRequirements, setTechRequirements] = useState<TechnologyRequirement[]>(
    data.technicalAnalysis?.technologyRequirements?.map((req, index) => ({
      id: index.toString(),
      name: req,
      description: '',
      cost: 0,
      importance: 'medium' as const,
    })) || []
  );
  
  const [resources, setResources] = useState<ResourceRequirement[]>(
    data.technicalAnalysis?.resourceRequirements?.map((res, index) => ({
      id: index.toString(),
      type: 'equipment' as const,
      name: res,
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
    })) || []
  );
  
  const [risks, setRisks] = useState<RiskItem[]>([]);

  // Dialog states
  const [showTechDialog, setShowTechDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  
  // Current editing items
  const [currentTech, setCurrentTech] = useState<TechnologyRequirement | null>(null);
  const [currentResource, setCurrentResource] = useState<ResourceRequirement | null>(null);
  const [currentRisk, setCurrentRisk] = useState<RiskItem | null>(null);

  // Auto-calculation states
  const [autoCalculateMetrics, setAutoCalculateMetrics] = useState(true);

  /**
   * Update form data
   */
  const updateData = useCallback((updates: Partial<FeasibilityStudyRequest>) => {
    onChange({ ...data, ...updates } as any);
  }, [data, onChange]);

  /**
   * Calculate financial metrics automatically
   */
  const calculateFinancialMetrics = useCallback(() => {
    if (!data.financialAnalysis?.revenueProjections || !autoCalculateMetrics) return;

    const projections = data.financialAnalysis.revenueProjections;
    const initialInvestment = data.financialAnalysis.initialInvestment || 0;
    
    // Calculate Break-Even Point
    const totalFixedCosts = projections.reduce((sum, p) => sum + p.costs, 0) / projections.length;
    const avgRevenue = projections.reduce((sum, p) => sum + p.revenue, 0) / projections.length;
    const avgProfit = projections.reduce((sum, p) => sum + p.profit, 0) / projections.length;
    
    const breakEvenPoint = totalFixedCosts / (avgProfit / avgRevenue) || 0;
    
    // Calculate ROI
    const totalProfit = projections.reduce((sum, p) => sum + p.profit, 0);
    const roi = initialInvestment > 0 ? (totalProfit / initialInvestment) * 100 : 0;
    
    // Calculate NPV (simplified, assuming 10% discount rate)
    const discountRate = 0.10;
    const npv = projections.reduce((sum, p, index) => {
      return sum + (p.profit / Math.pow(1 + discountRate, index + 1));
    }, -initialInvestment);
    
    // Calculate IRR (simplified approximation)
    const avgAnnualReturn = totalProfit / projections.length;
    const irr = initialInvestment > 0 ? (avgAnnualReturn / initialInvestment) * 100 : 0;
    
    // Calculate Payback Period
    let cumulativeProfit = 0;
    let paybackPeriod = 0;
    for (let i = 0; i < projections.length; i++) {
      cumulativeProfit += projections[i].profit;
      if (cumulativeProfit >= initialInvestment) {
        paybackPeriod = i + 1;
        break;
      }
    }
    
    updateData({
      financialAnalysis: {
        ...data.financialAnalysis,
        breakEvenPoint,
        roi,
        npv,
        irr,
        paybackPeriod,
      }
    });
  }, [data.financialAnalysis, autoCalculateMetrics, updateData]);

  // Auto-calculate when projections change
  useEffect(() => {
    if (autoCalculateMetrics && data.financialAnalysis?.revenueProjections) {
      calculateFinancialMetrics();
    }
  }, [data.financialAnalysis?.revenueProjections, data.financialAnalysis?.initialInvestment, calculateFinancialMetrics, autoCalculateMetrics]);

  /**
   * Render project overview section
   */
  const renderProjectOverview = () => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'نظرة عامة على المشروع' : 'Project Overview'}
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
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'اسم المشروع' : 'Project Name'}
              value={data.projectName || ''}
              onChange={(e) => updateData({ projectName: e.target.value })}
              required
              error={!!errors.projectName}
              helperText={errors.projectName}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'رقم السجل التجاري' : 'CR Number'}
              value={data.crNumber || ''}
              onChange={(e) => updateData({ crNumber: e.target.value })}
              placeholder="1010123456"
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الرقم الضريبي' : 'VAT Number'}
              value={data.vatNumber || ''}
              onChange={(e) => updateData({ vatNumber: e.target.value })}
              placeholder="123456789012345"
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
              label={language === 'ar' ? 'أهداف المشروع (منفصلة بفاصلة)' : 'Project Objectives (comma separated)'}
              value={data.projectObjectives?.join(', ') || ''}
              onChange={(e) => updateData({ 
                projectObjectives: e.target.value.split(',').map(obj => obj.trim()).filter(obj => obj) 
              })}
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'حجم السوق' : 'Market Size'}
              value={data.marketAnalysis?.marketSize || ''}
              onChange={(e) => updateData({
                marketAnalysis: {
                  marketSize: parseFloat(e.target.value) || 0,
                  targetSegment: data.marketAnalysis?.targetSegment || '',
                  competitorAnalysis: data.marketAnalysis?.competitorAnalysis || '',
                  marketTrends: data.marketAnalysis?.marketTrends || '',
                  growthProjections: data.marketAnalysis?.growthProjections || 0,
                }
              })}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'توقعات النمو (%)' : 'Growth Projections (%)'}
              value={data.marketAnalysis?.growthProjections || ''}
              onChange={(e) => updateData({
                marketAnalysis: {
                  marketSize: data.marketAnalysis?.marketSize || 0,
                  targetSegment: data.marketAnalysis?.targetSegment || '',
                  competitorAnalysis: data.marketAnalysis?.competitorAnalysis || '',
                  marketTrends: data.marketAnalysis?.marketTrends || '',
                  growthProjections: parseFloat(e.target.value) || 0,
                }
              })}
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
              label={language === 'ar' ? 'القطاع المستهدف' : 'Target Segment'}
              value={data.marketAnalysis?.targetSegment || ''}
              onChange={(e) => updateData({
                marketAnalysis: {
                  marketSize: data.marketAnalysis?.marketSize || 0,
                  competitorAnalysis: data.marketAnalysis?.competitorAnalysis || '',
                  marketTrends: data.marketAnalysis?.marketTrends || '',
                  growthProjections: data.marketAnalysis?.growthProjections || 0,
                  targetSegment: e.target.value,
                }
              })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'تحليل المنافسين' : 'Competitor Analysis'}
              value={data.marketAnalysis?.competitorAnalysis || ''}
              onChange={(e) => updateData({
                marketAnalysis: {
                  ...data.marketAnalysis,
                  competitorAnalysis: e.target.value,
                }
              })}
              multiline
              rows={4}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'اتجاهات السوق' : 'Market Trends'}
              value={data.marketAnalysis?.marketTrends || ''}
              onChange={(e) => updateData({
                marketAnalysis: {
                  ...data.marketAnalysis,
                  marketTrends: e.target.value,
                }
              })}
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
   * Render technical analysis section
   */
  const renderTechnicalAnalysis = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EngineeringIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'التحليل التقني' : 'Technical Analysis'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'خطة التنفيذ' : 'Implementation Plan'}
              value={data.technicalAnalysis?.implementationPlan || ''}
              onChange={(e) => updateData({
                technicalAnalysis: {
                  ...data.technicalAnalysis,
                  implementationPlan: e.target.value,
                }
              })}
              multiline
              rows={4}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'المخاطر التقنية (منفصلة بفاصلة)' : 'Technical Risks (comma separated)'}
              value={data.technicalAnalysis?.technicalRisks?.join(', ') || ''}
              onChange={(e) => updateData({
                technicalAnalysis: {
                  ...data.technicalAnalysis,
                  technicalRisks: e.target.value.split(',').map(risk => risk.trim()).filter(risk => risk),
                }
              })}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
          
          {/* Technology Requirements */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                title={language === 'ar' ? 'المتطلبات التقنية' : 'Technology Requirements'}
                action={
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setCurrentTech({
                        id: Date.now().toString(),
                        name: '',
                        description: '',
                        cost: 0,
                        importance: 'medium',
                      });
                      setShowTechDialog(true);
                    }}
                  >
                    {language === 'ar' ? 'إضافة متطلب' : 'Add Requirement'}
                  </Button>
                }
              />
              <CardContent>
                {techRequirements.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{language === 'ar' ? 'المتطلب' : 'Requirement'}</TableCell>
                          <TableCell>{language === 'ar' ? 'الأهمية' : 'Importance'}</TableCell>
                          <TableCell>{language === 'ar' ? 'التكلفة' : 'Cost'}</TableCell>
                          <TableCell>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {techRequirements.map((tech) => (
                          <TableRow key={tech.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">{tech.name}</Typography>
                              {tech.description && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {tech.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={tech.importance}
                                size="small"
                                color={
                                  tech.importance === 'critical' ? 'error' :
                                  tech.importance === 'high' ? 'warning' :
                                  tech.importance === 'medium' ? 'info' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {tech.cost.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setCurrentTech(tech);
                                  setShowTechDialog(true);
                                }}
                              >
                                <InfoIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setTechRequirements(techRequirements.filter(t => t.id !== tech.id))}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    {language === 'ar' 
                      ? 'لم يتم إضافة متطلبات تقنية بعد'
                      : 'No technical requirements added yet'
                    }
                  </Alert>
                )}
                
                {techRequirements.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {language === 'ar' ? 'إجمالي التكلفة التقنية' : 'Total Technical Cost'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {techRequirements.reduce((sum, tech) => sum + tech.cost, 0).toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  /**
   * Render financial analysis section
   */
  const renderFinancialAnalysis = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MoneyIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'التحليل المالي' : 'Financial Analysis'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">
                {language === 'ar' ? 'الاستثمار والتكاليف' : 'Investment &amp; Costs'}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoCalculateMetrics}
                    onChange={(e) => setAutoCalculateMetrics(e.target.checked)}
                  />
                }
                label={language === 'ar' ? 'حساب تلقائي للمؤشرات' : 'Auto-calculate metrics'}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الاستثمار الأولي' : 'Initial Investment'}
              value={data.financialAnalysis?.initialInvestment || ''}
              onChange={(e) => updateData({
                financialAnalysis: {
                  ...data.financialAnalysis,
                  initialInvestment: parseFloat(e.target.value) || 0,
                }
              })}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'التكاليف التشغيلية السنوية' : 'Annual Operating Costs'}
              value={data.financialAnalysis?.operatingCosts || ''}
              onChange={(e) => updateData({
                financialAnalysis: {
                  ...data.financialAnalysis,
                  operatingCosts: parseFloat(e.target.value) || 0,
                }
              })}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          {/* Revenue Projections Table */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                title={language === 'ar' ? 'توقعات الإيرادات (5 سنوات)' : 'Revenue Projections (5 Years)'}
                action={
                  <Button
                    startIcon={<CalculateIcon />}
                    onClick={() => {
                      // Initialize default projections
                      const defaultProjections: RevenueProjection[] = Array.from({ length: 5 }, (_, i) => ({
                        year: i + 1,
                        revenue: 0,
                        costs: data.financialAnalysis?.operatingCosts || 0,
                        profit: 0,
                      }));
                      
                      updateData({
                        financialAnalysis: {
                          ...data.financialAnalysis,
                          revenueProjections: data.financialAnalysis?.revenueProjections || defaultProjections,
                        }
                      });
                    }}
                  >
                    {language === 'ar' ? 'إنشاء توقعات' : 'Generate Projections'}
                  </Button>
                }
              />
              <CardContent>
                {data.financialAnalysis?.revenueProjections ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{language === 'ar' ? 'السنة' : 'Year'}</TableCell>
                          <TableCell>{language === 'ar' ? 'الإيرادات' : 'Revenue'}</TableCell>
                          <TableCell>{language === 'ar' ? 'التكاليف' : 'Costs'}</TableCell>
                          <TableCell>{language === 'ar' ? 'الربح' : 'Profit'}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.financialAnalysis.revenueProjections.map((projection, index) => (
                          <TableRow key={projection.year}>
                            <TableCell>{projection.year}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={projection.revenue}
                                onChange={(e) => {
                                  const newProjections = [...data.financialAnalysis!.revenueProjections!];
                                  newProjections[index] = {
                                    ...newProjections[index],
                                    revenue: parseFloat(e.target.value) || 0,
                                    profit: (parseFloat(e.target.value) || 0) - newProjections[index].costs,
                                  };
                                  updateData({
                                    financialAnalysis: {
                                      ...data.financialAnalysis,
                                      revenueProjections: newProjections,
                                    }
                                  });
                                }}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                                }}
                                dir="ltr"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={projection.costs}
                                onChange={(e) => {
                                  const newProjections = [...data.financialAnalysis!.revenueProjections!];
                                  newProjections[index] = {
                                    ...newProjections[index],
                                    costs: parseFloat(e.target.value) || 0,
                                    profit: newProjections[index].revenue - (parseFloat(e.target.value) || 0),
                                  };
                                  updateData({
                                    financialAnalysis: {
                                      ...data.financialAnalysis,
                                      revenueProjections: newProjections,
                                    }
                                  });
                                }}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                                }}
                                dir="ltr"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ 
                                color: projection.profit >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 'bold',
                              }}>
                                {projection.profit.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    {language === 'ar' 
                      ? 'انقر على "إنشاء توقعات" لبدء إدخال التوقعات المالية'
                      : 'Click "Generate Projections" to start entering financial projections'
                    }
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Financial Metrics */}
          {data.financialAnalysis?.revenueProjections && (
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
                <CardHeader
                  title={language === 'ar' ? 'المؤشرات المالية' : 'Financial Metrics'}
                  action={
                    autoCalculateMetrics && (
                      <Chip 
                        label={language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'} 
                        size="small" 
                        color="success"
                      />
                    )
                  }
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={3}>
                      <TextField
                        fullWidth
                        label={language === 'ar' ? 'نقطة التعادل (أشهر)' : 'Break-Even Point (months)'}
                        value={data.financialAnalysis?.breakEvenPoint?.toFixed(1) || ''}
                        onChange={(e) => !autoCalculateMetrics && updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            breakEvenPoint: parseFloat(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        dir="ltr"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6} lg={3}>
                      <TextField
                        fullWidth
                        label={language === 'ar' ? 'عائد الاستثمار (%)' : 'ROI (%)'}
                        value={data.financialAnalysis?.roi?.toFixed(1) || ''}
                        onChange={(e) => !autoCalculateMetrics && updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            roi: parseFloat(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        dir="ltr"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6} lg={3}>
                      <TextField
                        fullWidth
                        label={language === 'ar' ? 'صافي القيمة الحالية' : 'NPV'}
                        value={data.financialAnalysis?.npv?.toFixed(0) || ''}
                        onChange={(e) => !autoCalculateMetrics && updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            npv: parseFloat(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                        }}
                        dir="ltr"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6} lg={3}>
                      <TextField
                        fullWidth
                        label={language === 'ar' ? 'معدل العائد الداخلي (%)' : 'IRR (%)'}
                        value={data.financialAnalysis?.irr?.toFixed(1) || ''}
                        onChange={(e) => !autoCalculateMetrics && updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            irr: parseFloat(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        dir="ltr"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={language === 'ar' ? 'فترة الاسترداد (سنوات)' : 'Payback Period (years)'}
                        value={data.financialAnalysis?.paybackPeriod?.toString() || ''}
                        onChange={(e) => !autoCalculateMetrics && updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            paybackPeriod: parseInt(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        dir="ltr"
                      />
                    </Grid>
                  </Grid>
                  
                  {/* Financial Health Indicator */}
                  {data.financialAnalysis?.npv && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {language === 'ar' ? 'مؤشر الجدوى المالية' : 'Financial Viability Indicator'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, (data.financialAnalysis.npv / Math.abs(data.financialAnalysis.npv)) * 50 + 50))}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          color={data.financialAnalysis.npv > 0 ? 'success' : 'error'}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {data.financialAnalysis.npv > 0 
                            ? (language === 'ar' ? 'مجدي مالياً' : 'Financially Viable')
                            : (language === 'ar' ? 'غير مجدي مالياً' : 'Not Financially Viable')
                          }
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  /**
   * Render risk analysis section
   */
  const renderRiskAnalysis = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'تحليل المخاطر' : 'Risk Analysis'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'المخاطر السوقية (منفصلة بفاصلة)' : 'Market Risks (comma separated)'}
              value={data.riskAnalysis?.marketRisks?.join(', ') || ''}
              onChange={(e) => updateData({
                riskAnalysis: {
                  ...data.riskAnalysis,
                  marketRisks: e.target.value.split(',').map(risk => risk.trim()).filter(risk => risk),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'المخاطر المالية (منفصلة بفاصلة)' : 'Financial Risks (comma separated)'}
              value={data.riskAnalysis?.financialRisks?.join(', ') || ''}
              onChange={(e) => updateData({
                riskAnalysis: {
                  ...data.riskAnalysis,
                  financialRisks: e.target.value.split(',').map(risk => risk.trim()).filter(risk => risk),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'استراتيجيات التخفيف (منفصلة بفاصلة)' : 'Mitigation Strategies (comma separated)'}
              value={data.riskAnalysis?.mitigationStrategies?.join(', ') || ''}
              onChange={(e) => updateData({
                riskAnalysis: {
                  ...data.riskAnalysis,
                  mitigationStrategies: e.target.value.split(',').map(strategy => strategy.trim()).filter(strategy => strategy),
                }
              })}
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
   * Render Saudi compliance section
   */
  const renderSaudiCompliance = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'الامتثال السعودي' : 'Saudi Compliance'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'التراخيص المطلوبة (منفصلة بفاصلة)' : 'Required Licenses (comma separated)'}
              value={data.saudiCompliance?.requiredLicenses?.join(', ') || ''}
              onChange={(e) => updateData({
                saudiCompliance: {
                  ...data.saudiCompliance,
                  requiredLicenses: e.target.value.split(',').map(license => license.trim()).filter(license => license),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'المتطلبات التنظيمية (منفصلة بفاصلة)' : 'Regulatory Requirements (comma separated)'}
              value={data.saudiCompliance?.regulatoryRequirements?.join(', ') || ''}
              onChange={(e) => updateData({
                saudiCompliance: {
                  ...data.saudiCompliance,
                  regulatoryRequirements: e.target.value.split(',').map(req => req.trim()).filter(req => req),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الجدول الزمني للامتثال (منفصلة بفاصلة)' : 'Compliance Timeline (comma separated)'}
              value={data.saudiCompliance?.complianceTimeline?.join(', ') || ''}
              onChange={(e) => updateData({
                saudiCompliance: {
                  ...data.saudiCompliance,
                  complianceTimeline: e.target.value.split(',').map(item => item.trim()).filter(item => item),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  /**
   * Render conclusions and recommendations section
   */
  const renderConclusions = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AnalyticsIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'النتائج والتوصيات' : 'Conclusions &amp; Recommendations'}
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
              onChange={(e) => updateData({ 
                recommendations: e.target.value.split(',').map(rec => rec.trim()).filter(rec => rec) 
              })}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الخطوات التالية (منفصلة بفاصلة)' : 'Next Steps (comma separated)'}
              value={data.nextSteps?.join(', ') || ''}
              onChange={(e) => updateData({ 
                nextSteps: e.target.value.split(',').map(step => step.trim()).filter(step => step) 
              })}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  // Technology Dialog Component
  const TechnologyDialog = () => (
    <Dialog open={showTechDialog} onClose={() => setShowTechDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {currentTech?.name 
          ? (language === 'ar' ? 'تعديل المتطلب التقني' : 'Edit Technical Requirement')
          : (language === 'ar' ? 'إضافة متطلب تقني' : 'Add Technical Requirement')
        }
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'اسم المتطلب' : 'Requirement Name'}
              value={currentTech?.name || ''}
              onChange={(e) => setCurrentTech(prev => prev ? { ...prev, name: e.target.value } : null)}
              required
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الوصف' : 'Description'}
              value={currentTech?.description || ''}
              onChange={(e) => setCurrentTech(prev => prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'التكلفة' : 'Cost'}
              value={currentTech?.cost || ''}
              onChange={(e) => setCurrentTech(prev => prev ? { ...prev, cost: parseFloat(e.target.value) || 0 } : null)}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
              }}
              dir="ltr"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{language === 'ar' ? 'الأهمية' : 'Importance'}</InputLabel>
              <Select
                value={currentTech?.importance || 'medium'}
                onChange={(e) => setCurrentTech(prev => prev ? { 
                  ...prev, 
                  importance: e.target.value as 'critical' | 'high' | 'medium' | 'low' 
                } : null)}
              >
                <MenuItem value="critical">{language === 'ar' ? 'حرج' : 'Critical'}</MenuItem>
                <MenuItem value="high">{language === 'ar' ? 'عالي' : 'High'}</MenuItem>
                <MenuItem value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</MenuItem>
                <MenuItem value="low">{language === 'ar' ? 'منخفض' : 'Low'}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowTechDialog(false)}>
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (currentTech) {
              const existingIndex = techRequirements.findIndex(t => t.id === currentTech.id);
              if (existingIndex !== -1) {
                setTechRequirements(techRequirements.map(t => t.id === currentTech.id ? currentTech : t));
              } else {
                setTechRequirements([...techRequirements, currentTech]);
              }
            }
            setShowTechDialog(false);
            setCurrentTech(null);
          }}
          disabled={!currentTech?.name}
        >
          {language === 'ar' ? 'حفظ' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        {language === 'ar' ? 'نموذج دراسة الجدوى' : 'Feasibility Study Form'}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {language === 'ar' 
          ? 'املأ النموذج التالي لإنشاء دراسة جدوى شاملة مع تحليل السوق السعودي والمتطلبات التقنية والمالية'
          : 'Fill out the following form to create a comprehensive feasibility study with Saudi market analysis, technical and financial requirements'
        }
      </Typography>

      <Box sx={{ mb: 3 }}>
        {renderProjectOverview()}
        {renderMarketAnalysis()}
        {renderTechnicalAnalysis()}
        {renderFinancialAnalysis()}
        {renderRiskAnalysis()}
        {renderSaudiCompliance()}
        {renderConclusions()}
      </Box>

      {/* Dialogs */}
      <TechnologyDialog />
      
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

export default FeasibilityStudyForm;