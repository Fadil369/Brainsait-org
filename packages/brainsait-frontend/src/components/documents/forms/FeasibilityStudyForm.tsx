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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Engineering as EngineeringIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Calculate as CalculateIcon,
  Analytics as AnalyticsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAppTheme } from '../../../lib/ThemeProvider';
import type { FeasibilityStudyRequest } from '../../../services/documentService';

/**
 * FeasibilityStudyForm Component Props
 */
interface FeasibilityStudyFormProps {
  data: Partial&lt;FeasibilityStudyRequest&gt;;
  onChange: (data: Partial&lt;FeasibilityStudyRequest&gt;) =&gt; void;
  language: 'ar' | 'en';
  errors: Record&lt;string, string&gt;;
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
const FeasibilityStudyForm: React.FC&lt;FeasibilityStudyFormProps&gt; = ({
  data,
  onChange,
  language,
  errors,
}) =&gt; {
  const { t } = useTranslation(['documents', 'common']);
  const { direction } = useAppTheme();
  
  // State for dynamic lists
  const [techRequirements, setTechRequirements] = useState&lt;TechnologyRequirement[]&gt;(
    data.technicalAnalysis?.technologyRequirements?.map((req, index) =&gt; ({
      id: index.toString(),
      name: req,
      description: '',
      cost: 0,
      importance: 'medium' as const,
    })) || []
  );
  
  const [resources, setResources] = useState&lt;ResourceRequirement[]&gt;(
    data.technicalAnalysis?.resourceRequirements?.map((res, index) =&gt; ({
      id: index.toString(),
      type: 'equipment' as const,
      name: res,
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
    })) || []
  );
  
  const [risks, setRisks] = useState&lt;RiskItem[]&gt;([]);

  // Dialog states
  const [showTechDialog, setShowTechDialog] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  
  // Current editing items
  const [currentTech, setCurrentTech] = useState&lt;TechnologyRequirement | null&gt;(null);
  const [currentResource, setCurrentResource] = useState&lt;ResourceRequirement | null&gt;(null);
  const [currentRisk, setCurrentRisk] = useState&lt;RiskItem | null&gt;(null);

  // Auto-calculation states
  const [autoCalculateMetrics, setAutoCalculateMetrics] = useState(true);

  /**
   * Update form data
   */
  const updateData = useCallback((updates: Partial&lt;FeasibilityStudyRequest&gt;) =&gt; {
    onChange({ ...data, ...updates });
  }, [data, onChange]);

  /**
   * Calculate financial metrics automatically
   */
  const calculateFinancialMetrics = useCallback(() =&gt; {
    if (!data.financialAnalysis?.revenueProjections || !autoCalculateMetrics) return;

    const projections = data.financialAnalysis.revenueProjections;
    const initialInvestment = data.financialAnalysis.initialInvestment || 0;
    
    // Calculate Break-Even Point
    const totalFixedCosts = projections.reduce((sum, p) =&gt; sum + p.costs, 0) / projections.length;
    const avgRevenue = projections.reduce((sum, p) =&gt; sum + p.revenue, 0) / projections.length;
    const avgProfit = projections.reduce((sum, p) =&gt; sum + p.profit, 0) / projections.length;
    
    const breakEvenPoint = totalFixedCosts / (avgProfit / avgRevenue) || 0;
    
    // Calculate ROI
    const totalProfit = projections.reduce((sum, p) =&gt; sum + p.profit, 0);
    const roi = initialInvestment &gt; 0 ? (totalProfit / initialInvestment) * 100 : 0;
    
    // Calculate NPV (simplified, assuming 10% discount rate)
    const discountRate = 0.10;
    const npv = projections.reduce((sum, p, index) =&gt; {
      return sum + (p.profit / Math.pow(1 + discountRate, index + 1));
    }, -initialInvestment);
    
    // Calculate IRR (simplified approximation)
    const avgAnnualReturn = totalProfit / projections.length;
    const irr = initialInvestment &gt; 0 ? (avgAnnualReturn / initialInvestment) * 100 : 0;
    
    // Calculate Payback Period
    let cumulativeProfit = 0;
    let paybackPeriod = 0;
    for (let i = 0; i &lt; projections.length; i++) {
      cumulativeProfit += projections[i].profit;
      if (cumulativeProfit &gt;= initialInvestment) {
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
  useEffect(() =&gt; {
    if (autoCalculateMetrics &amp;&amp; data.financialAnalysis?.revenueProjections) {
      calculateFinancialMetrics();
    }
  }, [data.financialAnalysis?.revenueProjections, data.financialAnalysis?.initialInvestment, calculateFinancialMetrics, autoCalculateMetrics]);

  /**
   * Render project overview section
   */
  const renderProjectOverview = () =&gt; (
    &lt;Accordion defaultExpanded&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'نظرة عامة على المشروع' : 'Project Overview'}
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
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'اسم المشروع' : 'Project Name'}
              value={data.projectName || ''}
              onChange={(e) =&gt; updateData({ projectName: e.target.value })}
              required
              error={!!errors.projectName}
              helperText={errors.projectName}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'رقم السجل التجاري' : 'CR Number'}
              value={data.crNumber || ''}
              onChange={(e) =&gt; updateData({ crNumber: e.target.value })}
              placeholder="1010123456"
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الرقم الضريبي' : 'VAT Number'}
              value={data.vatNumber || ''}
              onChange={(e) =&gt; updateData({ vatNumber: e.target.value })}
              placeholder="123456789012345"
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
              label={language === 'ar' ? 'أهداف المشروع (منفصلة بفاصلة)' : 'Project Objectives (comma separated)'}
              value={data.projectObjectives?.join(', ') || ''}
              onChange={(e) =&gt; updateData({ 
                projectObjectives: e.target.value.split(',').map(obj =&gt; obj.trim()).filter(obj =&gt; obj) 
              })}
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
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'حجم السوق' : 'Market Size'}
              value={data.marketAnalysis?.marketSize || ''}
              onChange={(e) =&gt; updateData({
                marketAnalysis: {
                  ...data.marketAnalysis,
                  marketSize: parseFloat(e.target.value) || 0,
                }
              })}
              type="number"
              InputProps={{
                startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'توقعات النمو (%)' : 'Growth Projections (%)'}
              value={data.marketAnalysis?.growthProjections || ''}
              onChange={(e) =&gt; updateData({
                marketAnalysis: {
                  ...data.marketAnalysis,
                  growthProjections: parseFloat(e.target.value) || 0,
                }
              })}
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
              label={language === 'ar' ? 'القطاع المستهدف' : 'Target Segment'}
              value={data.marketAnalysis?.targetSegment || ''}
              onChange={(e) =&gt; updateData({
                marketAnalysis: {
                  ...data.marketAnalysis,
                  targetSegment: e.target.value,
                }
              })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'تحليل المنافسين' : 'Competitor Analysis'}
              value={data.marketAnalysis?.competitorAnalysis || ''}
              onChange={(e) =&gt; updateData({
                marketAnalysis: {
                  ...data.marketAnalysis,
                  competitorAnalysis: e.target.value,
                }
              })}
              multiline
              rows={4}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'اتجاهات السوق' : 'Market Trends'}
              value={data.marketAnalysis?.marketTrends || ''}
              onChange={(e) =&gt; updateData({
                marketAnalysis: {
                  ...data.marketAnalysis,
                  marketTrends: e.target.value,
                }
              })}
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
   * Render technical analysis section
   */
  const renderTechnicalAnalysis = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;EngineeringIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'التحليل التقني' : 'Technical Analysis'}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Grid container spacing={3}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'خطة التنفيذ' : 'Implementation Plan'}
              value={data.technicalAnalysis?.implementationPlan || ''}
              onChange={(e) =&gt; updateData({
                technicalAnalysis: {
                  ...data.technicalAnalysis,
                  implementationPlan: e.target.value,
                }
              })}
              multiline
              rows={4}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'المخاطر التقنية (منفصلة بفاصلة)' : 'Technical Risks (comma separated)'}
              value={data.technicalAnalysis?.technicalRisks?.join(', ') || ''}
              onChange={(e) =&gt; updateData({
                technicalAnalysis: {
                  ...data.technicalAnalysis,
                  technicalRisks: e.target.value.split(',').map(risk =&gt; risk.trim()).filter(risk =&gt; risk),
                }
              })}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          {/* Technology Requirements */}
          &lt;Grid item xs={12}&gt;
            &lt;Card variant="outlined"&gt;
              &lt;CardHeader
                title={language === 'ar' ? 'المتطلبات التقنية' : 'Technology Requirements'}
                action={
                  &lt;Button
                    startIcon={&lt;AddIcon /&gt;}
                    onClick={() =&gt; {
                      setCurrentTech({
                        id: Date.now().toString(),
                        name: '',
                        description: '',
                        cost: 0,
                        importance: 'medium',
                      });
                      setShowTechDialog(true);
                    }}
                  &gt;
                    {language === 'ar' ? 'إضافة متطلب' : 'Add Requirement'}
                  &lt;/Button&gt;
                }
              /&gt;
              &lt;CardContent&gt;
                {techRequirements.length &gt; 0 ? (
                  &lt;TableContainer component={Paper} variant="outlined"&gt;
                    &lt;Table size="small"&gt;
                      &lt;TableHead&gt;
                        &lt;TableRow&gt;
                          &lt;TableCell&gt;{language === 'ar' ? 'المتطلب' : 'Requirement'}&lt;/TableCell&gt;
                          &lt;TableCell&gt;{language === 'ar' ? 'الأهمية' : 'Importance'}&lt;/TableCell&gt;
                          &lt;TableCell&gt;{language === 'ar' ? 'التكلفة' : 'Cost'}&lt;/TableCell&gt;
                          &lt;TableCell&gt;{language === 'ar' ? 'الإجراءات' : 'Actions'}&lt;/TableCell&gt;
                        &lt;/TableRow&gt;
                      &lt;/TableHead&gt;
                      &lt;TableBody&gt;
                        {techRequirements.map((tech) =&gt; (
                          &lt;TableRow key={tech.id}&gt;
                            &lt;TableCell&gt;
                              &lt;Typography variant="body2" fontWeight="bold"&gt;{tech.name}&lt;/Typography&gt;
                              {tech.description &amp;&amp; (
                                &lt;Typography variant="caption" color="text.secondary" display="block"&gt;
                                  {tech.description}
                                &lt;/Typography&gt;
                              )}
                            &lt;/TableCell&gt;
                            &lt;TableCell&gt;
                              &lt;Chip
                                label={tech.importance}
                                size="small"
                                color={
                                  tech.importance === 'critical' ? 'error' :
                                  tech.importance === 'high' ? 'warning' :
                                  tech.importance === 'medium' ? 'info' : 'default'
                                }
                              /&gt;
                            &lt;/TableCell&gt;
                            &lt;TableCell&gt;
                              {tech.cost.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                            &lt;/TableCell&gt;
                            &lt;TableCell&gt;
                              &lt;IconButton
                                size="small"
                                onClick={() =&gt; {
                                  setCurrentTech(tech);
                                  setShowTechDialog(true);
                                }}
                              &gt;
                                &lt;InfoIcon /&gt;
                              &lt;/IconButton&gt;
                              &lt;IconButton
                                size="small"
                                color="error"
                                onClick={() =&gt; setTechRequirements(techRequirements.filter(t =&gt; t.id !== tech.id))}
                              &gt;
                                &lt;DeleteIcon /&gt;
                              &lt;/IconButton&gt;
                            &lt;/TableCell&gt;
                          &lt;/TableRow&gt;
                        ))}
                      &lt;/TableBody&gt;
                    &lt;/Table&gt;
                  &lt;/TableContainer&gt;
                ) : (
                  &lt;Alert severity="info"&gt;
                    {language === 'ar' 
                      ? 'لم يتم إضافة متطلبات تقنية بعد'
                      : 'No technical requirements added yet'
                    }
                  &lt;/Alert&gt;
                )}
                
                {techRequirements.length &gt; 0 &amp;&amp; (
                  &lt;Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}&gt;
                    &lt;Typography variant="subtitle2" gutterBottom&gt;
                      {language === 'ar' ? 'إجمالي التكلفة التقنية' : 'Total Technical Cost'}
                    &lt;/Typography&gt;
                    &lt;Typography variant="h6" color="primary"&gt;
                      {techRequirements.reduce((sum, tech) =&gt; sum + tech.cost, 0).toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                    &lt;/Typography&gt;
                  &lt;/Box&gt;
                )}
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  /**
   * Render financial analysis section
   */
  const renderFinancialAnalysis = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;MoneyIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'التحليل المالي' : 'Financial Analysis'}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Grid container spacing={3}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}&gt;
              &lt;Typography variant="subtitle1"&gt;
                {language === 'ar' ? 'الاستثمار والتكاليف' : 'Investment &amp; Costs'}
              &lt;/Typography&gt;
              &lt;FormControlLabel
                control={
                  &lt;Switch
                    checked={autoCalculateMetrics}
                    onChange={(e) =&gt; setAutoCalculateMetrics(e.target.checked)}
                  /&gt;
                }
                label={language === 'ar' ? 'حساب تلقائي للمؤشرات' : 'Auto-calculate metrics'}
              /&gt;
            &lt;/Box&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الاستثمار الأولي' : 'Initial Investment'}
              value={data.financialAnalysis?.initialInvestment || ''}
              onChange={(e) =&gt; updateData({
                financialAnalysis: {
                  ...data.financialAnalysis,
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
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'التكاليف التشغيلية السنوية' : 'Annual Operating Costs'}
              value={data.financialAnalysis?.operatingCosts || ''}
              onChange={(e) =&gt; updateData({
                financialAnalysis: {
                  ...data.financialAnalysis,
                  operatingCosts: parseFloat(e.target.value) || 0,
                }
              })}
              type="number"
              InputProps={{
                startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          {/* Revenue Projections Table */}
          &lt;Grid item xs={12}&gt;
            &lt;Card variant="outlined"&gt;
              &lt;CardHeader
                title={language === 'ar' ? 'توقعات الإيرادات (5 سنوات)' : 'Revenue Projections (5 Years)'}
                action={
                  &lt;Button
                    startIcon={&lt;CalculateIcon /&gt;}
                    onClick={() =&gt; {
                      // Initialize default projections
                      const defaultProjections: RevenueProjection[] = Array.from({ length: 5 }, (_, i) =&gt; ({
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
                  &gt;
                    {language === 'ar' ? 'إنشاء توقعات' : 'Generate Projections'}
                  &lt;/Button&gt;
                }
              /&gt;
              &lt;CardContent&gt;
                {data.financialAnalysis?.revenueProjections ? (
                  &lt;TableContainer component={Paper} variant="outlined"&gt;
                    &lt;Table&gt;
                      &lt;TableHead&gt;
                        &lt;TableRow&gt;
                          &lt;TableCell&gt;{language === 'ar' ? 'السنة' : 'Year'}&lt;/TableCell&gt;
                          &lt;TableCell&gt;{language === 'ar' ? 'الإيرادات' : 'Revenue'}&lt;/TableCell&gt;
                          &lt;TableCell&gt;{language === 'ar' ? 'التكاليف' : 'Costs'}&lt;/TableCell&gt;
                          &lt;TableCell&gt;{language === 'ar' ? 'الربح' : 'Profit'}&lt;/TableCell&gt;
                        &lt;/TableRow&gt;
                      &lt;/TableHead&gt;
                      &lt;TableBody&gt;
                        {data.financialAnalysis.revenueProjections.map((projection, index) =&gt; (
                          &lt;TableRow key={projection.year}&gt;
                            &lt;TableCell&gt;{projection.year}&lt;/TableCell&gt;
                            &lt;TableCell&gt;
                              &lt;TextField
                                size="small"
                                type="number"
                                value={projection.revenue}
                                onChange={(e) =&gt; {
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
                                  startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                                }}
                                dir="ltr"
                              /&gt;
                            &lt;/TableCell&gt;
                            &lt;TableCell&gt;
                              &lt;TextField
                                size="small"
                                type="number"
                                value={projection.costs}
                                onChange={(e) =&gt; {
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
                                  startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                                }}
                                dir="ltr"
                              /&gt;
                            &lt;/TableCell&gt;
                            &lt;TableCell&gt;
                              &lt;Box sx={{ 
                                color: projection.profit &gt;= 0 ? 'success.main' : 'error.main',
                                fontWeight: 'bold',
                              }}&gt;
                                {projection.profit.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                              &lt;/Box&gt;
                            &lt;/TableCell&gt;
                          &lt;/TableRow&gt;
                        ))}
                      &lt;/TableBody&gt;
                    &lt;/Table&gt;
                  &lt;/TableContainer&gt;
                ) : (
                  &lt;Alert severity="info"&gt;
                    {language === 'ar' 
                      ? 'انقر على "إنشاء توقعات" لبدء إدخال التوقعات المالية'
                      : 'Click "Generate Projections" to start entering financial projections'
                    }
                  &lt;/Alert&gt;
                )}
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/Grid&gt;
          
          {/* Financial Metrics */}
          {data.financialAnalysis?.revenueProjections &amp;&amp; (
            &lt;Grid item xs={12}&gt;
              &lt;Card variant="outlined" sx={{ bgcolor: 'action.hover' }}&gt;
                &lt;CardHeader
                  title={language === 'ar' ? 'المؤشرات المالية' : 'Financial Metrics'}
                  action={
                    autoCalculateMetrics &amp;&amp; (
                      &lt;Chip 
                        label={language === 'ar' ? 'محسوب تلقائياً' : 'Auto-calculated'} 
                        size="small" 
                        color="success"
                      /&gt;
                    )
                  }
                /&gt;
                &lt;CardContent&gt;
                  &lt;Grid container spacing={2}&gt;
                    &lt;Grid item xs={12} md={6} lg={3}&gt;
                      &lt;TextField
                        fullWidth
                        label={language === 'ar' ? 'نقطة التعادل (أشهر)' : 'Break-Even Point (months)'}
                        value={data.financialAnalysis?.breakEvenPoint?.toFixed(1) || ''}
                        onChange={(e) =&gt; !autoCalculateMetrics &amp;&amp; updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            breakEvenPoint: parseFloat(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        dir="ltr"
                      /&gt;
                    &lt;/Grid&gt;
                    
                    &lt;Grid item xs={12} md={6} lg={3}&gt;
                      &lt;TextField
                        fullWidth
                        label={language === 'ar' ? 'عائد الاستثمار (%)' : 'ROI (%)'}
                        value={data.financialAnalysis?.roi?.toFixed(1) || ''}
                        onChange={(e) =&gt; !autoCalculateMetrics &amp;&amp; updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            roi: parseFloat(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        InputProps={{
                          endAdornment: &lt;InputAdornment position="end"&gt;%&lt;/InputAdornment&gt;,
                        }}
                        dir="ltr"
                      /&gt;
                    &lt;/Grid&gt;
                    
                    &lt;Grid item xs={12} md={6} lg={3}&gt;
                      &lt;TextField
                        fullWidth
                        label={language === 'ar' ? 'صافي القيمة الحالية' : 'NPV'}
                        value={data.financialAnalysis?.npv?.toFixed(0) || ''}
                        onChange={(e) =&gt; !autoCalculateMetrics &amp;&amp; updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            npv: parseFloat(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        InputProps={{
                          startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
                        }}
                        dir="ltr"
                      /&gt;
                    &lt;/Grid&gt;
                    
                    &lt;Grid item xs={12} md={6} lg={3}&gt;
                      &lt;TextField
                        fullWidth
                        label={language === 'ar' ? 'معدل العائد الداخلي (%)' : 'IRR (%)'}
                        value={data.financialAnalysis?.irr?.toFixed(1) || ''}
                        onChange={(e) =&gt; !autoCalculateMetrics &amp;&amp; updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            irr: parseFloat(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        InputProps={{
                          endAdornment: &lt;InputAdornment position="end"&gt;%&lt;/InputAdornment&gt;,
                        }}
                        dir="ltr"
                      /&gt;
                    &lt;/Grid&gt;
                    
                    &lt;Grid item xs={12} md={6}&gt;
                      &lt;TextField
                        fullWidth
                        label={language === 'ar' ? 'فترة الاسترداد (سنوات)' : 'Payback Period (years)'}
                        value={data.financialAnalysis?.paybackPeriod?.toString() || ''}
                        onChange={(e) =&gt; !autoCalculateMetrics &amp;&amp; updateData({
                          financialAnalysis: {
                            ...data.financialAnalysis,
                            paybackPeriod: parseInt(e.target.value) || 0,
                          }
                        })}
                        type="number"
                        disabled={autoCalculateMetrics}
                        dir="ltr"
                      /&gt;
                    &lt;/Grid&gt;
                  &lt;/Grid&gt;
                  
                  {/* Financial Health Indicator */}
                  {data.financialAnalysis?.npv &amp;&amp; (
                    &lt;Box sx={{ mt: 2 }}&gt;
                      &lt;Typography variant="subtitle2" gutterBottom&gt;
                        {language === 'ar' ? 'مؤشر الجدوى المالية' : 'Financial Viability Indicator'}
                      &lt;/Typography&gt;
                      &lt;Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}&gt;
                        &lt;LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, (data.financialAnalysis.npv / Math.abs(data.financialAnalysis.npv)) * 50 + 50))}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          color={data.financialAnalysis.npv &gt; 0 ? 'success' : 'error'}
                        /&gt;
                        &lt;Typography variant="body2" fontWeight="bold"&gt;
                          {data.financialAnalysis.npv &gt; 0 
                            ? (language === 'ar' ? 'مجدي مالياً' : 'Financially Viable')
                            : (language === 'ar' ? 'غير مجدي مالياً' : 'Not Financially Viable')
                          }
                        &lt;/Typography&gt;
                      &lt;/Box&gt;
                    &lt;/Box&gt;
                  )}
                &lt;/CardContent&gt;
              &lt;/Card&gt;
            &lt;/Grid&gt;
          )}
        &lt;/Grid&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  /**
   * Render risk analysis section
   */
  const renderRiskAnalysis = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;WarningIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'تحليل المخاطر' : 'Risk Analysis'}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Grid container spacing={3}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'المخاطر السوقية (منفصلة بفاصلة)' : 'Market Risks (comma separated)'}
              value={data.riskAnalysis?.marketRisks?.join(', ') || ''}
              onChange={(e) =&gt; updateData({
                riskAnalysis: {
                  ...data.riskAnalysis,
                  marketRisks: e.target.value.split(',').map(risk =&gt; risk.trim()).filter(risk =&gt; risk),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'المخاطر المالية (منفصلة بفاصلة)' : 'Financial Risks (comma separated)'}
              value={data.riskAnalysis?.financialRisks?.join(', ') || ''}
              onChange={(e) =&gt; updateData({
                riskAnalysis: {
                  ...data.riskAnalysis,
                  financialRisks: e.target.value.split(',').map(risk =&gt; risk.trim()).filter(risk =&gt; risk),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'استراتيجيات التخفيف (منفصلة بفاصلة)' : 'Mitigation Strategies (comma separated)'}
              value={data.riskAnalysis?.mitigationStrategies?.join(', ') || ''}
              onChange={(e) =&gt; updateData({
                riskAnalysis: {
                  ...data.riskAnalysis,
                  mitigationStrategies: e.target.value.split(',').map(strategy =&gt; strategy.trim()).filter(strategy =&gt; strategy),
                }
              })}
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
   * Render Saudi compliance section
   */
  const renderSaudiCompliance = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;SecurityIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'الامتثال السعودي' : 'Saudi Compliance'}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Grid container spacing={3}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'التراخيص المطلوبة (منفصلة بفاصلة)' : 'Required Licenses (comma separated)'}
              value={data.saudiCompliance?.requiredLicenses?.join(', ') || ''}
              onChange={(e) =&gt; updateData({
                saudiCompliance: {
                  ...data.saudiCompliance,
                  requiredLicenses: e.target.value.split(',').map(license =&gt; license.trim()).filter(license =&gt; license),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'المتطلبات التنظيمية (منفصلة بفاصلة)' : 'Regulatory Requirements (comma separated)'}
              value={data.saudiCompliance?.regulatoryRequirements?.join(', ') || ''}
              onChange={(e) =&gt; updateData({
                saudiCompliance: {
                  ...data.saudiCompliance,
                  regulatoryRequirements: e.target.value.split(',').map(req =&gt; req.trim()).filter(req =&gt; req),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الجدول الزمني للامتثال (منفصلة بفاصلة)' : 'Compliance Timeline (comma separated)'}
              value={data.saudiCompliance?.complianceTimeline?.join(', ') || ''}
              onChange={(e) =&gt; updateData({
                saudiCompliance: {
                  ...data.saudiCompliance,
                  complianceTimeline: e.target.value.split(',').map(item =&gt; item.trim()).filter(item =&gt; item),
                }
              })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  /**
   * Render conclusions and recommendations section
   */
  const renderConclusions = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;AnalyticsIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'النتائج والتوصيات' : 'Conclusions &amp; Recommendations'}
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
              onChange={(e) =&gt; updateData({ 
                recommendations: e.target.value.split(',').map(rec =&gt; rec.trim()).filter(rec =&gt; rec) 
              })}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الخطوات التالية (منفصلة بفاصلة)' : 'Next Steps (comma separated)'}
              value={data.nextSteps?.join(', ') || ''}
              onChange={(e) =&gt; updateData({ 
                nextSteps: e.target.value.split(',').map(step =&gt; step.trim()).filter(step =&gt; step) 
              })}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  // Technology Dialog Component
  const TechnologyDialog = () =&gt; (
    &lt;Dialog open={showTechDialog} onClose={() =&gt; setShowTechDialog(false)} maxWidth="sm" fullWidth&gt;
      &lt;DialogTitle&gt;
        {currentTech?.name 
          ? (language === 'ar' ? 'تعديل المتطلب التقني' : 'Edit Technical Requirement')
          : (language === 'ar' ? 'إضافة متطلب تقني' : 'Add Technical Requirement')
        }
      &lt;/DialogTitle&gt;
      &lt;DialogContent&gt;
        &lt;Grid container spacing={2} sx={{ mt: 1 }}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'اسم المتطلب' : 'Requirement Name'}
              value={currentTech?.name || ''}
              onChange={(e) =&gt; setCurrentTech(prev =&gt; prev ? { ...prev, name: e.target.value } : null)}
              required
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الوصف' : 'Description'}
              value={currentTech?.description || ''}
              onChange={(e) =&gt; setCurrentTech(prev =&gt; prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'التكلفة' : 'Cost'}
              value={currentTech?.cost || ''}
              onChange={(e) =&gt; setCurrentTech(prev =&gt; prev ? { ...prev, cost: parseFloat(e.target.value) || 0 } : null)}
              type="number"
              InputProps={{
                startAdornment: &lt;InputAdornment position="start"&gt;SAR&lt;/InputAdornment&gt;,
              }}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;FormControl fullWidth&gt;
              &lt;InputLabel&gt;{language === 'ar' ? 'الأهمية' : 'Importance'}&lt;/InputLabel&gt;
              &lt;Select
                value={currentTech?.importance || 'medium'}
                onChange={(e) =&gt; setCurrentTech(prev =&gt; prev ? { 
                  ...prev, 
                  importance: e.target.value as 'critical' | 'high' | 'medium' | 'low' 
                } : null)}
              &gt;
                &lt;MenuItem value="critical"&gt;{language === 'ar' ? 'حرج' : 'Critical'}&lt;/MenuItem&gt;
                &lt;MenuItem value="high"&gt;{language === 'ar' ? 'عالي' : 'High'}&lt;/MenuItem&gt;
                &lt;MenuItem value="medium"&gt;{language === 'ar' ? 'متوسط' : 'Medium'}&lt;/MenuItem&gt;
                &lt;MenuItem value="low"&gt;{language === 'ar' ? 'منخفض' : 'Low'}&lt;/MenuItem&gt;
              &lt;/Select&gt;
            &lt;/FormControl&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/DialogContent&gt;
      &lt;DialogActions&gt;
        &lt;Button onClick={() =&gt; setShowTechDialog(false)}&gt;
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        &lt;/Button&gt;
        &lt;Button
          variant="contained"
          onClick={() =&gt; {
            if (currentTech) {
              const existingIndex = techRequirements.findIndex(t =&gt; t.id === currentTech.id);
              if (existingIndex !== -1) {
                setTechRequirements(techRequirements.map(t =&gt; t.id === currentTech.id ? currentTech : t));
              } else {
                setTechRequirements([...techRequirements, currentTech]);
              }
            }
            setShowTechDialog(false);
            setCurrentTech(null);
          }}
          disabled={!currentTech?.name}
        &gt;
          {language === 'ar' ? 'حفظ' : 'Save'}
        &lt;/Button&gt;
      &lt;/DialogActions&gt;
    &lt;/Dialog&gt;
  );

  return (
    &lt;Box sx={{ width: '100%' }}&gt;
      &lt;Typography variant="h5" gutterBottom&gt;
        {language === 'ar' ? 'نموذج دراسة الجدوى' : 'Feasibility Study Form'}
      &lt;/Typography&gt;
      
      &lt;Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}&gt;
        {language === 'ar' 
          ? 'املأ النموذج التالي لإنشاء دراسة جدوى شاملة مع تحليل السوق السعودي والمتطلبات التقنية والمالية'
          : 'Fill out the following form to create a comprehensive feasibility study with Saudi market analysis, technical and financial requirements'
        }
      &lt;/Typography&gt;

      &lt;Box sx={{ mb: 3 }}&gt;
        {renderProjectOverview()}
        {renderMarketAnalysis()}
        {renderTechnicalAnalysis()}
        {renderFinancialAnalysis()}
        {renderRiskAnalysis()}
        {renderSaudiCompliance()}
        {renderConclusions()}
      &lt;/Box&gt;

      {/* Dialogs */}
      &lt;TechnologyDialog /&gt;
      
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

export default FeasibilityStudyForm;