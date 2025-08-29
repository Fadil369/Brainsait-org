'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip,
  Divider,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAppTheme } from '../../lib/ThemeProvider';
import type { ComplianceReportRequest } from '../../services/documentService';

/**
 * ComplianceReportGenerator Component Props
 */
interface ComplianceReportGeneratorProps {
  data: Partial&lt;ComplianceReportRequest&gt;;
  onChange: (data: Partial&lt;ComplianceReportRequest&gt;) =&gt; void;
  language: 'ar' | 'en';
  errors: Record&lt;string, string&gt;;
}

/**
 * Compliance Category Interface
 */
interface ComplianceCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  issues: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}

/**
 * Issue Interface
 */
interface ComplianceIssue {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  requiredAction: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'resolved';
  assignee?: string;
}

/**
 * Government API Interface
 */
interface GovernmentAPI {
  id: string;
  name: string;
  status: 'connected' | 'error' | 'pending';
  lastSync: string;
  description: string;
  endpoint: string;
}

/**
 * Recommendation Interface
 */
interface Recommendation {
  id: string;
  title: string;
  description: string;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

/**
 * Action Plan Item Interface
 */
interface ActionPlanItem {
  id: string;
  phase: string;
  description: string;
  timeline: string;
  responsible: string;
  status: 'pending' | 'in_progress' | 'completed';
}

/**
 * ComplianceReportGenerator Component
 * 
 * Advanced compliance report generator with real-time scoring, government API
 * integration, and comprehensive Saudi regulatory compliance tracking
 * 
 * @param props - Component properties
 * @returns JSX.Element
 */
const ComplianceReportGenerator: React.FC&lt;ComplianceReportGeneratorProps&gt; = ({
  data,
  onChange,
  language,
  errors,
}) =&gt; {
  const { t } = useTranslation(['documents', 'common']);
  const { direction } = useAppTheme();
  
  // State management
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAddIssueDialog, setShowAddIssueDialog] = useState(false);
  const [showAddRecommendationDialog, setShowAddRecommendationDialog] = useState(false);
  const [showAddActionDialog, setShowAddActionDialog] = useState(false);
  const [showAPIConnectionDialog, setShowAPIConnectionDialog] = useState(false);
  
  // Current editing items
  const [currentIssue, setCurrentIssue] = useState&lt;ComplianceIssue | null&gt;(null);
  const [currentRecommendation, setCurrentRecommendation] = useState&lt;Recommendation | null&gt;(null);
  const [currentAction, setCurrentAction] = useState&lt;ActionPlanItem | null&gt;(null);

  // Mock data for demonstration
  const [complianceCategories, setComplianceCategories] = useState&lt;ComplianceCategory[]&gt;([
    {
      id: 'legal',
      name: language === 'ar' ? 'الامتثال القانوني' : 'Legal Compliance',
      score: 85,
      maxScore: 100,
      issues: 2,
      status: 'good',
    },
    {
      id: 'financial',
      name: language === 'ar' ? 'الامتثال المالي' : 'Financial Compliance',
      score: 92,
      maxScore: 100,
      issues: 1,
      status: 'excellent',
    },
    {
      id: 'operational',
      name: language === 'ar' ? 'الامتثال التشغيلي' : 'Operational Compliance',
      score: 78,
      maxScore: 100,
      issues: 4,
      status: 'needs_improvement',
    },
    {
      id: 'data_protection',
      name: language === 'ar' ? 'حماية البيانات' : 'Data Protection',
      score: 90,
      maxScore: 100,
      issues: 1,
      status: 'excellent',
    },
    {
      id: 'health_safety',
      name: language === 'ar' ? 'الصحة والسلامة' : 'Health &amp; Safety',
      score: 65,
      maxScore: 100,
      issues: 6,
      status: 'critical',
    },
  ]);

  const [governmentAPIs, setGovernmentAPIs] = useState&lt;GovernmentAPI[]&gt;([
    {
      id: 'moj',
      name: language === 'ar' ? 'وزارة العدل' : 'Ministry of Justice',
      status: 'connected',
      lastSync: new Date().toISOString(),
      description: language === 'ar' ? 'التحقق من السجل التجاري' : 'Commercial Registration Verification',
      endpoint: 'https://api.moj.gov.sa',
    },
    {
      id: 'zatca',
      name: language === 'ar' ? 'هيئة الزكاة والضريبة والجمارك' : 'ZATCA',
      status: 'connected',
      lastSync: new Date().toISOString(),
      description: language === 'ar' ? 'التحقق من الامتثال الضريبي' : 'Tax Compliance Verification',
      endpoint: 'https://api.zatca.gov.sa',
    },
    {
      id: 'gosi',
      name: language === 'ar' ? 'المؤسسة العامة للتأمينات الاجتماعية' : 'GOSI',
      status: 'error',
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      description: language === 'ar' ? 'التأمينات الاجتماعية للموظفين' : 'Employee Social Insurance',
      endpoint: 'https://api.gosi.gov.sa',
    },
    {
      id: 'mol',
      name: language === 'ar' ? 'وزارة الموارد البشرية' : 'Ministry of Human Resources',
      status: 'pending',
      lastSync: '',
      description: language === 'ar' ? 'تراخيص العمل ونطاقات النقل' : 'Work Permits and Nitaqat',
      endpoint: 'https://api.mol.gov.sa',
    },
  ]);

  const [issues, setIssues] = useState&lt;ComplianceIssue[]&gt;(data.issues?.map((issue, index) =&gt; ({
    id: index.toString(),
    title: issue.title,
    priority: issue.priority,
    category: 'general',
    description: issue.description,
    requiredAction: issue.requiredAction,
    deadline: issue.deadline,
    status: 'open' as const,
  })) || []);

  const [recommendations, setRecommendations] = useState&lt;Recommendation[]&gt;(data.recommendations?.map((rec, index) =&gt; ({
    id: index.toString(),
    title: rec.title,
    description: rec.description,
    timeline: rec.timeline,
    priority: 'medium' as const,
    category: 'general',
  })) || []);

  const [actionPlan, setActionPlan] = useState&lt;ActionPlanItem[]&gt;(data.actionPlan?.map((action, index) =&gt; ({
    id: index.toString(),
    phase: action.phase,
    description: action.description,
    timeline: action.timeline,
    responsible: action.responsible,
    status: 'pending' as const,
  })) || []);

  /**
   * Update form data
   */
  const updateData = useCallback((updates: Partial&lt;ComplianceReportRequest&gt;) =&gt; {
    onChange({ ...data, ...updates });
  }, [data, onChange]);

  /**
   * Calculate overall compliance score
   */
  const calculateOverallScore = useCallback(() =&gt; {
    const totalScore = complianceCategories.reduce((sum, cat) =&gt; sum + cat.score, 0);
    const maxTotalScore = complianceCategories.reduce((sum, cat) =&gt; sum + cat.maxScore, 0);
    return Math.round((totalScore / maxTotalScore) * 100);
  }, [complianceCategories]);

  /**
   * Calculate total issues
   */
  const calculateTotalIssues = useCallback(() =&gt; {
    return issues.filter(issue =&gt; issue.status !== 'resolved').length;
  }, [issues]);

  /**
   * Calculate critical issues
   */
  const calculateCriticalIssues = useCallback(() =&gt; {
    return issues.filter(issue =&gt; issue.priority === 'critical' &amp;&amp; issue.status !== 'resolved').length;
  }, [issues]);

  /**
   * Calculate completion rate
   */
  const calculateCompletionRate = useCallback(() =&gt; {
    const completedActions = actionPlan.filter(action =&gt; action.status === 'completed').length;
    return actionPlan.length &gt; 0 ? Math.round((completedActions / actionPlan.length) * 100) : 0;
  }, [actionPlan]);

  /**
   * Simulate real-time score calculation
   */
  const refreshCompliance = useCallback(async () =&gt; {
    setIsCalculatingScore(true);
    
    // Simulate API calls and calculations
    await new Promise(resolve =&gt; setTimeout(resolve, 2000));
    
    // Update scores with slight variations
    setComplianceCategories(prev =&gt; prev.map(cat =&gt; ({
      ...cat,
      score: Math.max(0, Math.min(100, cat.score + (Math.random() - 0.5) * 10)),
    })));
    
    setIsCalculatingScore(false);
  }, []);

  // Auto-refresh effect
  useEffect(() =&gt; {
    if (autoRefresh) {
      const interval = setInterval(refreshCompliance, 300000); // 5 minutes
      return () =&gt; clearInterval(interval);
    }
  }, [autoRefresh, refreshCompliance]);

  // Update parent data when local state changes
  useEffect(() =&gt; {
    const overallScore = calculateOverallScore();
    const totalIssues = calculateTotalIssues();
    const criticalIssues = calculateCriticalIssues();
    const completionRate = calculateCompletionRate();

    updateData({
      overallScore,
      totalIssues,
      criticalIssues,
      completionRate,
      complianceBreakdown: complianceCategories.map(cat =&gt; ({
        category: cat.name,
        score: cat.score,
        scoreClass: cat.status,
      })),
      progressCharts: complianceCategories.map(cat =&gt; ({
        category: cat.name,
        percentage: Math.round((cat.score / cat.maxScore) * 100),
      })),
      issues: issues.map(issue =&gt; ({
        title: issue.title,
        priority: issue.priority,
        description: issue.description,
        requiredAction: issue.requiredAction,
        deadline: issue.deadline,
      })),
      governmentAPIs: governmentAPIs.map(api =&gt; ({
        name: api.name,
        status: api.status,
      })),
      recommendations: recommendations.map(rec =&gt; ({
        title: rec.title,
        description: rec.description,
        timeline: rec.timeline,
      })),
      actionPlan: actionPlan.map(action =&gt; ({
        phase: action.phase,
        description: action.description,
        timeline: action.timeline,
        responsible: action.responsible,
      })),
    });
  }, [complianceCategories, issues, recommendations, actionPlan, governmentAPIs, updateData, calculateOverallScore, calculateTotalIssues, calculateCriticalIssues, calculateCompletionRate]);

  /**
   * Get status color based on score
   */
  const getStatusColor = (status: string) =&gt; {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'needs_improvement': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) =&gt; {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  /**
   * Render basic information section
   */
  const renderBasicInfo = () =&gt; (
    &lt;Card&gt;
      &lt;CardHeader
        title={language === 'ar' ? 'معلومات أساسية' : 'Basic Information'}
        avatar={&lt;BusinessIcon /&gt;}
      /&gt;
      &lt;CardContent&gt;
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
              label={language === 'ar' ? 'فترة التقرير' : 'Report Period'}
              value={data.reportPeriod || ''}
              onChange={(e) =&gt; updateData({ reportPeriod: e.target.value })}
              placeholder={language === 'ar' ? 'Q1 2024' : 'Q1 2024'}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'رقم التقرير' : 'Report Number'}
              value={data.reportNumber || ''}
              onChange={(e) =&gt; updateData({ reportNumber: e.target.value })}
              placeholder={language === 'ar' ? 'CR-2024-001' : 'CR-2024-001'}
              dir="ltr"
            /&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/CardContent&gt;
    &lt;/Card&gt;
  );

  /**
   * Render compliance score dashboard
   */
  const renderComplianceScore = () =&gt; {
    const overallScore = calculateOverallScore();
    const totalIssues = calculateTotalIssues();
    const criticalIssues = calculateCriticalIssues();

    return (
      &lt;Card&gt;
        &lt;CardHeader
          title={
            &lt;Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}&gt;
              &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
                &lt;AssessmentIcon sx={{ mr: 1 }} /&gt;
                {language === 'ar' ? 'لوحة الامتثال' : 'Compliance Dashboard'}
              &lt;/Box&gt;
              &lt;Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}&gt;
                &lt;FormControlLabel
                  control={
                    &lt;Switch
                      checked={autoRefresh}
                      onChange={(e) =&gt; setAutoRefresh(e.target.checked)}
                      size="small"
                    /&gt;
                  }
                  label={language === 'ar' ? 'تحديث تلقائي' : 'Auto Refresh'}
                /&gt;
                &lt;Tooltip title={language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}&gt;
                  &lt;IconButton onClick={refreshCompliance} disabled={isCalculatingScore}&gt;
                    &lt;RefreshIcon /&gt;
                  &lt;/IconButton&gt;
                &lt;/Tooltip&gt;
              &lt;/Box&gt;
            &lt;/Box&gt;
          }
        /&gt;
        &lt;CardContent&gt;
          {/* Overall Score */}
          &lt;Grid container spacing={3} sx={{ mb: 3 }}&gt;
            &lt;Grid item xs={12} md={3}&gt;
              &lt;Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}&gt;
                &lt;Typography variant="h3" fontWeight="bold"&gt;
                  {isCalculatingScore ? &lt;CircularProgress size={40} color="inherit" /&gt; : `${overallScore}%`}
                &lt;/Typography&gt;
                &lt;Typography variant="body2"&gt;
                  {language === 'ar' ? 'نقاط الامتثال العامة' : 'Overall Compliance Score'}
                &lt;/Typography&gt;
              &lt;/Paper&gt;
            &lt;/Grid&gt;
            
            &lt;Grid item xs={12} md={3}&gt;
              &lt;Paper sx={{ p: 2, textAlign: 'center', bgcolor: totalIssues &gt; 0 ? 'warning.light' : 'success.light', color: 'white' }}&gt;
                &lt;Typography variant="h3" fontWeight="bold"&gt;
                  {totalIssues}
                &lt;/Typography&gt;
                &lt;Typography variant="body2"&gt;
                  {language === 'ar' ? 'إجمالي القضايا' : 'Total Issues'}
                &lt;/Typography&gt;
              &lt;/Paper&gt;
            &lt;/Grid&gt;
            
            &lt;Grid item xs={12} md={3}&gt;
              &lt;Paper sx={{ p: 2, textAlign: 'center', bgcolor: criticalIssues &gt; 0 ? 'error.light' : 'success.light', color: 'white' }}&gt;
                &lt;Typography variant="h3" fontWeight="bold"&gt;
                  {criticalIssues}
                &lt;/Typography&gt;
                &lt;Typography variant="body2"&gt;
                  {language === 'ar' ? 'القضايا الحرجة' : 'Critical Issues'}
                &lt;/Typography&gt;
              &lt;/Paper&gt;
            &lt;/Grid&gt;
            
            &lt;Grid item xs={12} md={3}&gt;
              &lt;Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}&gt;
                &lt;Typography variant="h3" fontWeight="bold"&gt;
                  {calculateCompletionRate()}%
                &lt;/Typography&gt;
                &lt;Typography variant="body2"&gt;
                  {language === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}
                &lt;/Typography&gt;
              &lt;/Paper&gt;
            &lt;/Grid&gt;
          &lt;/Grid&gt;

          {/* Category Breakdown */}
          &lt;Typography variant="h6" gutterBottom&gt;
            {language === 'ar' ? 'تفصيل الامتثال حسب الفئة' : 'Compliance Breakdown by Category'}
          &lt;/Typography&gt;
          
          {complianceCategories.map((category) =&gt; (
            &lt;Box key={category.id} sx={{ mb: 2 }}&gt;
              &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}&gt;
                &lt;Typography variant="body2"&gt;{category.name}&lt;/Typography&gt;
                &lt;Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}&gt;
                  &lt;Typography variant="body2" fontWeight="bold"&gt;
                    {category.score}/{category.maxScore}
                  &lt;/Typography&gt;
                  &lt;Chip
                    label={category.status}
                    size="small"
                    color={getStatusColor(category.status) as any}
                  /&gt;
                  {category.issues &gt; 0 &amp;&amp; (
                    &lt;Badge badgeContent={category.issues} color="error"&gt;
                      &lt;WarningIcon color="warning" /&gt;
                    &lt;/Badge&gt;
                  )}
                &lt;/Box&gt;
              &lt;/Box&gt;
              &lt;LinearProgress
                variant="determinate"
                value={(category.score / category.maxScore) * 100}
                color={getStatusColor(category.status) as any}
                sx={{ height: 8, borderRadius: 4 }}
              /&gt;
            &lt;/Box&gt;
          ))}
        &lt;/CardContent&gt;
      &lt;/Card&gt;
    );
  };

  /**
   * Render government APIs section
   */
  const renderGovernmentAPIs = () =&gt; (
    &lt;Card&gt;
      &lt;CardHeader
        title={
          &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
            &lt;SecurityIcon sx={{ mr: 1 }} /&gt;
            {language === 'ar' ? 'الربط مع الأنظمة الحكومية' : 'Government API Integration'}
          &lt;/Box&gt;
        }
        action={
          &lt;Button
            startIcon={&lt;AddIcon /&gt;}
            onClick={() =&gt; setShowAPIConnectionDialog(true)}
          &gt;
            {language === 'ar' ? 'إضافة ربط' : 'Add Connection'}
          &lt;/Button&gt;
        }
      /&gt;
      &lt;CardContent&gt;
        &lt;List&gt;
          {governmentAPIs.map((api) =&gt; (
            &lt;ListItem key={api.id} divider&gt;
              &lt;ListItemIcon&gt;
                &lt;Avatar sx={{ bgcolor: api.status === 'connected' ? 'success.main' : api.status === 'error' ? 'error.main' : 'warning.main' }}&gt;
                  {api.status === 'connected' ? &lt;CloudDoneIcon /&gt; : 
                   api.status === 'error' ? &lt;CloudOffIcon /&gt; : &lt;ScheduleIcon /&gt;}
                &lt;/Avatar&gt;
              &lt;/ListItemIcon&gt;
              &lt;ListItemText
                primary={api.name}
                secondary={
                  &lt;Box&gt;
                    &lt;Typography variant="caption" display="block"&gt;{api.description}&lt;/Typography&gt;
                    {api.lastSync &amp;&amp; (
                      &lt;Typography variant="caption" color="text.secondary"&gt;
                        {language === 'ar' ? 'آخر مزامنة:' : 'Last sync:'} {new Date(api.lastSync).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      &lt;/Typography&gt;
                    )}
                  &lt;/Box&gt;
                }
              /&gt;
              &lt;ListItemSecondaryAction&gt;
                &lt;Chip
                  label={
                    api.status === 'connected' ? (language === 'ar' ? 'متصل' : 'Connected') :
                    api.status === 'error' ? (language === 'ar' ? 'خطأ' : 'Error') :
                    (language === 'ar' ? 'قيد الانتظار' : 'Pending')
                  }
                  size="small"
                  color={
                    api.status === 'connected' ? 'success' :
                    api.status === 'error' ? 'error' : 'warning'
                  }
                /&gt;
              &lt;/ListItemSecondaryAction&gt;
            &lt;/ListItem&gt;
          ))}
        &lt;/List&gt;
      &lt;/CardContent&gt;
    &lt;/Card&gt;
  );

  /**
   * Render issues management section
   */
  const renderIssuesManagement = () =&gt; (
    &lt;Card&gt;
      &lt;CardHeader
        title={
          &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
            &lt;WarningIcon sx={{ mr: 1 }} /&gt;
            {language === 'ar' ? 'إدارة القضايا' : 'Issues Management'}
            &lt;Badge badgeContent={issues.filter(i =&gt; i.status !== 'resolved').length} color="error" sx={{ ml: 1 }}&gt;
              &lt;Box /&gt;
            &lt;/Badge&gt;
          &lt;/Box&gt;
        }
        action={
          &lt;Button
            startIcon={&lt;AddIcon /&gt;}
            onClick={() =&gt; {
              setCurrentIssue({
                id: Date.now().toString(),
                title: '',
                priority: 'medium',
                category: 'general',
                description: '',
                requiredAction: '',
                deadline: '',
                status: 'open',
              });
              setShowAddIssueDialog(true);
            }}
          &gt;
            {language === 'ar' ? 'إضافة قضية' : 'Add Issue'}
          &lt;/Button&gt;
        }
      /&gt;
      &lt;CardContent&gt;
        {issues.length &gt; 0 ? (
          &lt;TableContainer component={Paper} variant="outlined"&gt;
            &lt;Table&gt;
              &lt;TableHead&gt;
                &lt;TableRow&gt;
                  &lt;TableCell&gt;{language === 'ar' ? 'العنوان' : 'Title'}&lt;/TableCell&gt;
                  &lt;TableCell&gt;{language === 'ar' ? 'الأولوية' : 'Priority'}&lt;/TableCell&gt;
                  &lt;TableCell&gt;{language === 'ar' ? 'الموعد النهائي' : 'Deadline'}&lt;/TableCell&gt;
                  &lt;TableCell&gt;{language === 'ar' ? 'الحالة' : 'Status'}&lt;/TableCell&gt;
                  &lt;TableCell&gt;{language === 'ar' ? 'الإجراءات' : 'Actions'}&lt;/TableCell&gt;
                &lt;/TableRow&gt;
              &lt;/TableHead&gt;
              &lt;TableBody&gt;
                {issues.map((issue) =&gt; (
                  &lt;TableRow key={issue.id}&gt;
                    &lt;TableCell&gt;
                      &lt;Typography variant="body2" fontWeight="bold"&gt;{issue.title}&lt;/Typography&gt;
                      &lt;Typography variant="caption" color="text.secondary"&gt;
                        {issue.description}
                      &lt;/Typography&gt;
                    &lt;/TableCell&gt;
                    &lt;TableCell&gt;
                      &lt;Chip
                        label={issue.priority}
                        size="small"
                        color={getPriorityColor(issue.priority) as any}
                      /&gt;
                    &lt;/TableCell&gt;
                    &lt;TableCell&gt;{issue.deadline}&lt;/TableCell&gt;
                    &lt;TableCell&gt;
                      &lt;Chip
                        label={issue.status}
                        size="small"
                        color={
                          issue.status === 'resolved' ? 'success' :
                          issue.status === 'in_progress' ? 'info' : 'warning'
                        }
                      /&gt;
                    &lt;/TableCell&gt;
                    &lt;TableCell&gt;
                      &lt;IconButton
                        size="small"
                        onClick={() =&gt; {
                          setCurrentIssue(issue);
                          setShowAddIssueDialog(true);
                        }}
                      &gt;
                        &lt;EditIcon /&gt;
                      &lt;/IconButton&gt;
                      &lt;IconButton
                        size="small"
                        color="error"
                        onClick={() =&gt; setIssues(issues.filter(i =&gt; i.id !== issue.id))}
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
          &lt;Alert severity="success"&gt;
            &lt;AlertTitle&gt;{language === 'ar' ? 'لا توجد قضايا مفتوحة' : 'No Open Issues'}&lt;/AlertTitle&gt;
            {language === 'ar' 
              ? 'جميع قضايا الامتثال تم حلها أو لا توجد قضايا حالياً.'
              : 'All compliance issues are resolved or there are no current issues.'
            }
          &lt;/Alert&gt;
        )}
      &lt;/CardContent&gt;
    &lt;/Card&gt;
  );

  /**
   * Render contact information section
   */
  const renderContactInfo = () =&gt; (
    &lt;Accordion&gt;
      &lt;AccordionSummary expandIcon={&lt;ExpandMoreIcon /&gt;}&gt;
        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
          &lt;PersonIcon sx={{ mr: 2, color: 'primary.main' }} /&gt;
          &lt;Typography variant="h6"&gt;
            {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
          &lt;/Typography&gt;
        &lt;/Box&gt;
      &lt;/AccordionSummary&gt;
      &lt;AccordionDetails&gt;
        &lt;Grid container spacing={3}&gt;
          &lt;Grid item xs={12} md={6}&gt;
            &lt;Card variant="outlined"&gt;
              &lt;CardHeader
                title={language === 'ar' ? 'مسؤول الامتثال' : 'Compliance Officer'}
                avatar={&lt;PersonIcon /&gt;}
              /&gt;
              &lt;CardContent&gt;
                &lt;TextField
                  fullWidth
                  label={language === 'ar' ? 'الاسم' : 'Name'}
                  value={data.complianceOfficer?.name || ''}
                  onChange={(e) =&gt; updateData({
                    complianceOfficer: {
                      ...data.complianceOfficer,
                      name: e.target.value,
                    }
                  })}
                  sx={{ mb: 2 }}
                  dir={direction}
                /&gt;
                &lt;TextField
                  fullWidth
                  label={language === 'ar' ? 'الهاتف' : 'Phone'}
                  value={data.complianceOfficer?.phone || ''}
                  onChange={(e) =&gt; updateData({
                    complianceOfficer: {
                      ...data.complianceOfficer,
                      phone: e.target.value,
                    }
                  })}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: &lt;PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} /&gt;,
                  }}
                  dir="ltr"
                /&gt;
                &lt;TextField
                  fullWidth
                  label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  value={data.complianceOfficer?.email || ''}
                  onChange={(e) =&gt; updateData({
                    complianceOfficer: {
                      ...data.complianceOfficer,
                      email: e.target.value,
                    }
                  })}
                  InputProps={{
                    startAdornment: &lt;EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /&gt;,
                  }}
                  dir="ltr"
                /&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;Card variant="outlined"&gt;
              &lt;CardHeader
                title={language === 'ar' ? 'الدعم الفني' : 'Technical Support'}
                avatar={&lt;SupportIcon /&gt;}
              /&gt;
              &lt;CardContent&gt;
                &lt;TextField
                  fullWidth
                  label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  value={data.technicalSupport?.email || ''}
                  onChange={(e) =&gt; updateData({
                    technicalSupport: {
                      ...data.technicalSupport,
                      email: e.target.value,
                    }
                  })}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: &lt;EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /&gt;,
                  }}
                  dir="ltr"
                /&gt;
                &lt;TextField
                  fullWidth
                  label={language === 'ar' ? 'الهاتف' : 'Phone'}
                  value={data.technicalSupport?.phone || ''}
                  onChange={(e) =&gt; updateData({
                    technicalSupport: {
                      ...data.technicalSupport,
                      phone: e.target.value,
                    }
                  })}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: &lt;PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} /&gt;,
                  }}
                  dir="ltr"
                /&gt;
                &lt;TextField
                  fullWidth
                  label={language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                  value={data.technicalSupport?.hours || ''}
                  onChange={(e) =&gt; updateData({
                    technicalSupport: {
                      ...data.technicalSupport,
                      hours: e.target.value,
                    }
                  })}
                  placeholder={language === 'ar' ? '8:00 ص - 6:00 م' : '8:00 AM - 6:00 PM'}
                  dir={direction}
                /&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/AccordionDetails&gt;
    &lt;/Accordion&gt;
  );

  // Issue Dialog Component
  const IssueDialog = () =&gt; (
    &lt;Dialog open={showAddIssueDialog} onClose={() =&gt; setShowAddIssueDialog(false)} maxWidth="md" fullWidth&gt;
      &lt;DialogTitle&gt;
        {currentIssue?.title 
          ? (language === 'ar' ? 'تعديل القضية' : 'Edit Issue')
          : (language === 'ar' ? 'إضافة قضية جديدة' : 'Add New Issue')
        }
      &lt;/DialogTitle&gt;
      &lt;DialogContent&gt;
        &lt;Grid container spacing={2} sx={{ mt: 1 }}&gt;
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'عنوان القضية' : 'Issue Title'}
              value={currentIssue?.title || ''}
              onChange={(e) =&gt; setCurrentIssue(prev =&gt; prev ? { ...prev, title: e.target.value } : null)}
              required
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;FormControl fullWidth&gt;
              &lt;InputLabel&gt;{language === 'ar' ? 'الأولوية' : 'Priority'}&lt;/InputLabel&gt;
              &lt;Select
                value={currentIssue?.priority || 'medium'}
                onChange={(e) =&gt; setCurrentIssue(prev =&gt; prev ? { 
                  ...prev, 
                  priority: e.target.value as 'critical' | 'high' | 'medium' | 'low'
                } : null)}
              &gt;
                &lt;MenuItem value="critical"&gt;{language === 'ar' ? 'حرج' : 'Critical'}&lt;/MenuItem&gt;
                &lt;MenuItem value="high"&gt;{language === 'ar' ? 'عالي' : 'High'}&lt;/MenuItem&gt;
                &lt;MenuItem value="medium"&gt;{language === 'ar' ? 'متوسط' : 'Medium'}&lt;/MenuItem&gt;
                &lt;MenuItem value="low"&gt;{language === 'ar' ? 'منخفض' : 'Low'}&lt;/MenuItem&gt;
              &lt;/Select&gt;
            &lt;/FormControl&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الموعد النهائي' : 'Deadline'}
              value={currentIssue?.deadline || ''}
              onChange={(e) =&gt; setCurrentIssue(prev =&gt; prev ? { ...prev, deadline: e.target.value } : null)}
              type="date"
              InputLabelProps={{ shrink: true }}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'وصف القضية' : 'Issue Description'}
              value={currentIssue?.description || ''}
              onChange={(e) =&gt; setCurrentIssue(prev =&gt; prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={3}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12}&gt;
            &lt;TextField
              fullWidth
              label={language === 'ar' ? 'الإجراء المطلوب' : 'Required Action'}
              value={currentIssue?.requiredAction || ''}
              onChange={(e) =&gt; setCurrentIssue(prev =&gt; prev ? { ...prev, requiredAction: e.target.value } : null)}
              multiline
              rows={2}
              dir={direction}
            /&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/DialogContent&gt;
      &lt;DialogActions&gt;
        &lt;Button onClick={() =&gt; setShowAddIssueDialog(false)}&gt;
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        &lt;/Button&gt;
        &lt;Button
          variant="contained"
          onClick={() =&gt; {
            if (currentIssue) {
              const existingIndex = issues.findIndex(i =&gt; i.id === currentIssue.id);
              if (existingIndex !== -1) {
                setIssues(issues.map(i =&gt; i.id === currentIssue.id ? currentIssue : i));
              } else {
                setIssues([...issues, currentIssue]);
              }
            }
            setShowAddIssueDialog(false);
            setCurrentIssue(null);
          }}
          disabled={!currentIssue?.title}
        &gt;
          {language === 'ar' ? 'حفظ' : 'Save'}
        &lt;/Button&gt;
      &lt;/DialogActions&gt;
    &lt;/Dialog&gt;
  );

  return (
    &lt;Box sx={{ width: '100%' }}&gt;
      &lt;Typography variant="h5" gutterBottom&gt;
        {language === 'ar' ? 'مولد تقرير الامتثال' : 'Compliance Report Generator'}
      &lt;/Typography&gt;
      
      &lt;Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}&gt;
        {language === 'ar' 
          ? 'إنشاء تقرير امتثال شامل مع ربط الأنظمة الحكومية ونقاط الامتثال في الوقت الفعلي'
          : 'Generate comprehensive compliance report with government system integration and real-time compliance scoring'
        }
      &lt;/Typography&gt;

      &lt;Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}&gt;
        {renderBasicInfo()}
        {renderComplianceScore()}
        {renderGovernmentAPIs()}
        {renderIssuesManagement()}
        {renderContactInfo()}
      &lt;/Box&gt;

      {/* Dialogs */}
      &lt;IssueDialog /&gt;
      
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

export default ComplianceReportGenerator;