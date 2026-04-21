'use client';

import {
    Add as AddIcon,
    Assessment as AssessmentIcon,
    Business as BusinessIcon,
    CloudDone as CloudDoneIcon,
    CloudOff as CloudOffIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    ExpandMore as ExpandMoreIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon,
    Security as SecurityIcon,
    Support as SupportIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    AlertTitle,
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
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
    Tooltip,
    Typography
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { useAppTheme } from '../../lib/ThemeProvider';
import type { ComplianceReportRequest } from '../../services/documentService';

/**
 * ComplianceReportGenerator Component Props
 */
interface ComplianceReportGeneratorProps {
  data: Partial<ComplianceReportRequest>;
  onChange: (data: Partial<ComplianceReportRequest>) => void;
  language: 'ar' | 'en';
  errors: Record<string, string>;
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
const ComplianceReportGenerator: React.FC<ComplianceReportGeneratorProps> = ({
  data,
  onChange,
  language,
  errors,
}) => {
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
  const [currentIssue, setCurrentIssue] = useState<ComplianceIssue | null>(null);
  const [currentRecommendation, setCurrentRecommendation] = useState<Recommendation | null>(null);
  const [currentAction, setCurrentAction] = useState<ActionPlanItem | null>(null);

  // Mock data for demonstration
  const [complianceCategories, setComplianceCategories] = useState<ComplianceCategory[]>([
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

  const [governmentAPIs, setGovernmentAPIs] = useState<GovernmentAPI[]>([
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

  const [issues, setIssues] = useState<ComplianceIssue[]>(data.issues?.map((issue, index) => ({
    id: index.toString(),
    title: issue.title,
    priority: issue.priority,
    category: 'general',
    description: issue.description,
    requiredAction: issue.requiredAction,
    deadline: issue.deadline,
    status: 'open' as const,
  })) || []);

  const [recommendations, setRecommendations] = useState<Recommendation[]>(data.recommendations?.map((rec, index) => ({
    id: index.toString(),
    title: rec.title,
    description: rec.description,
    timeline: rec.timeline,
    priority: 'medium' as const,
    category: 'general',
  })) || []);

  const [actionPlan, setActionPlan] = useState<ActionPlanItem[]>(data.actionPlan?.map((action, index) => ({
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
  const updateData = useCallback((updates: Partial<ComplianceReportRequest>) => {
    onChange({ ...data, ...updates });
  }, [data, onChange]);

  /**
   * Calculate overall compliance score
   */
  const calculateOverallScore = useCallback(() => {
    const totalScore = complianceCategories.reduce((sum, cat) => sum + cat.score, 0);
    const maxTotalScore = complianceCategories.reduce((sum, cat) => sum + cat.maxScore, 0);
    return Math.round((totalScore / maxTotalScore) * 100);
  }, [complianceCategories]);

  /**
   * Calculate total issues
   */
  const calculateTotalIssues = useCallback(() => {
    return issues.filter(issue => issue.status !== 'resolved').length;
  }, [issues]);

  /**
   * Calculate critical issues
   */
  const calculateCriticalIssues = useCallback(() => {
    return issues.filter(issue => issue.priority === 'critical' && issue.status !== 'resolved').length;
  }, [issues]);

  /**
   * Calculate completion rate
   */
  const calculateCompletionRate = useCallback(() => {
    const completedActions = actionPlan.filter(action => action.status === 'completed').length;
    return actionPlan.length > 0 ? Math.round((completedActions / actionPlan.length) * 100) : 0;
  }, [actionPlan]);

  /**
   * Simulate real-time score calculation
   */
  const refreshCompliance = useCallback(async () => {
    setIsCalculatingScore(true);
    
    // Simulate API calls and calculations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update scores with slight variations
    setComplianceCategories(prev => prev.map(cat => ({
      ...cat,
      score: Math.max(0, Math.min(100, cat.score + (Math.random() - 0.5) * 10)),
    })));
    
    setIsCalculatingScore(false);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshCompliance, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshCompliance]);

  // Update parent data when local state changes
  useEffect(() => {
    const overallScore = calculateOverallScore();
    const totalIssues = calculateTotalIssues();
    const criticalIssues = calculateCriticalIssues();
    const completionRate = calculateCompletionRate();

    updateData({
      overallScore,
      totalIssues,
      criticalIssues,
      completionRate,
      complianceBreakdown: complianceCategories.map(cat => ({
        category: cat.name,
        score: cat.score,
        scoreClass: cat.status,
      })),
      progressCharts: complianceCategories.map(cat => ({
        category: cat.name,
        percentage: Math.round((cat.score / cat.maxScore) * 100),
      })),
      issues: issues.map(issue => ({
        title: issue.title,
        priority: issue.priority,
        description: issue.description,
        requiredAction: issue.requiredAction,
        deadline: issue.deadline,
      })),
      governmentAPIs: governmentAPIs.map(api => ({
        name: api.name,
        status: api.status,
      })),
      recommendations: recommendations.map(rec => ({
        title: rec.title,
        description: rec.description,
        timeline: rec.timeline,
      })),
      actionPlan: actionPlan.map(action => ({
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
  const getStatusColor = (status: string) => {
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
  const getPriorityColor = (priority: string) => {
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
  const renderBasicInfo = () => (
    <Card>
      <CardHeader
        title={language === 'ar' ? 'معلومات أساسية' : 'Basic Information'}
        avatar={<BusinessIcon />}
      />
      <CardContent>
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
              label={language === 'ar' ? 'فترة التقرير' : 'Report Period'}
              value={data.reportPeriod || ''}
              onChange={(e) => updateData({ reportPeriod: e.target.value })}
              placeholder={language === 'ar' ? 'Q1 2024' : 'Q1 2024'}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'رقم التقرير' : 'Report Number'}
              value={data.reportNumber || ''}
              onChange={(e) => updateData({ reportNumber: e.target.value })}
              placeholder={language === 'ar' ? 'CR-2024-001' : 'CR-2024-001'}
              dir="ltr"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  /**
   * Render compliance score dashboard
   */
  const renderComplianceScore = () => {
    const overallScore = calculateOverallScore();
    const totalIssues = calculateTotalIssues();
    const criticalIssues = calculateCriticalIssues();

    return (
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                {language === 'ar' ? 'لوحة الامتثال' : 'Compliance Dashboard'}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      size="small"
                    />
                  }
                  label={language === 'ar' ? 'تحديث تلقائي' : 'Auto Refresh'}
                />
                <Tooltip title={language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}>
                  <IconButton onClick={refreshCompliance} disabled={isCalculatingScore}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          }
        />
        <CardContent>
          {/* Overall Score */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="h3" fontWeight="bold">
                  {isCalculatingScore ? <CircularProgress size={40} color="inherit" /> : `${overallScore}%`}
                </Typography>
                <Typography variant="body2">
                  {language === 'ar' ? 'نقاط الامتثال العامة' : 'Overall Compliance Score'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: totalIssues > 0 ? 'warning.light' : 'success.light', color: 'white' }}>
                <Typography variant="h3" fontWeight="bold">
                  {totalIssues}
                </Typography>
                <Typography variant="body2">
                  {language === 'ar' ? 'إجمالي القضايا' : 'Total Issues'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: criticalIssues > 0 ? 'error.light' : 'success.light', color: 'white' }}>
                <Typography variant="h3" fontWeight="bold">
                  {criticalIssues}
                </Typography>
                <Typography variant="body2">
                  {language === 'ar' ? 'القضايا الحرجة' : 'Critical Issues'}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                <Typography variant="h3" fontWeight="bold">
                  {calculateCompletionRate()}%
                </Typography>
                <Typography variant="body2">
                  {language === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Category Breakdown */}
          <Typography variant="h6" gutterBottom>
            {language === 'ar' ? 'تفصيل الامتثال حسب الفئة' : 'Compliance Breakdown by Category'}
          </Typography>
          
          {complianceCategories.map((category) => (
            <Box key={category.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">{category.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {category.score}/{category.maxScore}
                  </Typography>
                  <Chip
                    label={category.status}
                    size="small"
                    color={getStatusColor(category.status) as any}
                  />
                  {category.issues > 0 && (
                    <Badge badgeContent={category.issues} color="error">
                      <WarningIcon color="warning" />
                    </Badge>
                  )}
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(category.score / category.maxScore) * 100}
                color={getStatusColor(category.status) as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  /**
   * Render government APIs section
   */
  const renderGovernmentAPIs = () => (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 1 }} />
            {language === 'ar' ? 'الربط مع الأنظمة الحكومية' : 'Government API Integration'}
          </Box>
        }
        action={
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowAPIConnectionDialog(true)}
          >
            {language === 'ar' ? 'إضافة ربط' : 'Add Connection'}
          </Button>
        }
      />
      <CardContent>
        <List>
          {governmentAPIs.map((api) => (
            <ListItem key={api.id} divider>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: api.status === 'connected' ? 'success.main' : api.status === 'error' ? 'error.main' : 'warning.main' }}>
                  {api.status === 'connected' ? <CloudDoneIcon /> : 
                   api.status === 'error' ? <CloudOffIcon /> : <ScheduleIcon />}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={api.name}
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">{api.description}</Typography>
                    {api.lastSync && (
                      <Typography variant="caption" color="text.secondary">
                        {language === 'ar' ? 'آخر مزامنة:' : 'Last sync:'} {new Date(api.lastSync).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Chip
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
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  /**
   * Render issues management section
   */
  const renderIssuesManagement = () => (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1 }} />
            {language === 'ar' ? 'إدارة القضايا' : 'Issues Management'}
            <Badge badgeContent={issues.filter(i => i.status !== 'resolved').length} color="error" sx={{ ml: 1 }}>
              <Box />
            </Badge>
          </Box>
        }
        action={
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
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
          >
            {language === 'ar' ? 'إضافة قضية' : 'Add Issue'}
          </Button>
        }
      />
      <CardContent>
        {issues.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{language === 'ar' ? 'العنوان' : 'Title'}</TableCell>
                  <TableCell>{language === 'ar' ? 'الأولوية' : 'Priority'}</TableCell>
                  <TableCell>{language === 'ar' ? 'الموعد النهائي' : 'Deadline'}</TableCell>
                  <TableCell>{language === 'ar' ? 'الحالة' : 'Status'}</TableCell>
                  <TableCell>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{issue.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {issue.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.priority}
                        size="small"
                        color={getPriorityColor(issue.priority) as any}
                      />
                    </TableCell>
                    <TableCell>{issue.deadline}</TableCell>
                    <TableCell>
                      <Chip
                        label={issue.status}
                        size="small"
                        color={
                          issue.status === 'resolved' ? 'success' :
                          issue.status === 'in_progress' ? 'info' : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCurrentIssue(issue);
                          setShowAddIssueDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setIssues(issues.filter(i => i.id !== issue.id))}
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
          <Alert severity="success">
            <AlertTitle>{language === 'ar' ? 'لا توجد قضايا مفتوحة' : 'No Open Issues'}</AlertTitle>
            {language === 'ar' 
              ? 'جميع قضايا الامتثال تم حلها أو لا توجد قضايا حالياً.'
              : 'All compliance issues are resolved or there are no current issues.'
            }
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  /**
   * Render contact information section
   */
  const renderContactInfo = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title={language === 'ar' ? 'مسؤول الامتثال' : 'Compliance Officer'}
                avatar={<PersonIcon />}
              />
              <CardContent>
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'الاسم' : 'Name'}
                  value={data.complianceOfficer?.name || ''}
                  onChange={(e) => updateData({
                    complianceOfficer: {
                      name: e.target.value,
                      phone: data.complianceOfficer?.phone || '',
                      email: data.complianceOfficer?.email || '',
                    }
                  })}
                  sx={{ mb: 2 }}
                  dir={direction}
                />
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'الهاتف' : 'Phone'}
                  value={data.complianceOfficer?.phone || ''}
                  onChange={(e) => updateData({
                    complianceOfficer: {
                      name: data.complianceOfficer?.name || '',
                      phone: e.target.value,
                      email: data.complianceOfficer?.email || '',
                    }
                  })}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  dir="ltr"
                />
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  value={data.complianceOfficer?.email || ''}
                  onChange={(e) => updateData({
                    complianceOfficer: {
                      name: data.complianceOfficer?.name || '',
                      phone: data.complianceOfficer?.phone || '',
                      email: e.target.value,
                    }
                  })}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  dir="ltr"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title={language === 'ar' ? 'الدعم الفني' : 'Technical Support'}
                avatar={<SupportIcon />}
              />
              <CardContent>
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  value={data.technicalSupport?.email || ''}
                  onChange={(e) => updateData({
                    technicalSupport: {
                      email: e.target.value,
                      phone: data.technicalSupport?.phone || '',
                      hours: data.technicalSupport?.hours || '',
                    }
                  })}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  dir="ltr"
                />
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'الهاتف' : 'Phone'}
                  value={data.technicalSupport?.phone || ''}
                  onChange={(e) => updateData({
                    technicalSupport: {
                      email: data.technicalSupport?.email || '',
                      phone: e.target.value,
                      hours: data.technicalSupport?.hours || '',
                    }
                  })}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  dir="ltr"
                />
                <TextField
                  fullWidth
                  label={language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                  value={data.technicalSupport?.hours || ''}
                  onChange={(e) => updateData({
                    technicalSupport: {
                      email: data.technicalSupport?.email || '',
                      phone: data.technicalSupport?.phone || '',
                      hours: e.target.value,
                    }
                  })}
                  placeholder={language === 'ar' ? '8:00 ص - 6:00 م' : '8:00 AM - 6:00 PM'}
                  dir={direction}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  // Issue Dialog Component
  const IssueDialog = () => (
    <Dialog open={showAddIssueDialog} onClose={() => setShowAddIssueDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {currentIssue?.title 
          ? (language === 'ar' ? 'تعديل القضية' : 'Edit Issue')
          : (language === 'ar' ? 'إضافة قضية جديدة' : 'Add New Issue')
        }
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'عنوان القضية' : 'Issue Title'}
              value={currentIssue?.title || ''}
              onChange={(e) => setCurrentIssue(prev => prev ? { ...prev, title: e.target.value } : null)}
              required
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{language === 'ar' ? 'الأولوية' : 'Priority'}</InputLabel>
              <Select
                value={currentIssue?.priority || 'medium'}
                onChange={(e) => setCurrentIssue(prev => prev ? { 
                  ...prev, 
                  priority: e.target.value as 'critical' | 'high' | 'medium' | 'low'
                } : null)}
              >
                <MenuItem value="critical">{language === 'ar' ? 'حرج' : 'Critical'}</MenuItem>
                <MenuItem value="high">{language === 'ar' ? 'عالي' : 'High'}</MenuItem>
                <MenuItem value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</MenuItem>
                <MenuItem value="low">{language === 'ar' ? 'منخفض' : 'Low'}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الموعد النهائي' : 'Deadline'}
              value={currentIssue?.deadline || ''}
              onChange={(e) => setCurrentIssue(prev => prev ? { ...prev, deadline: e.target.value } : null)}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'وصف القضية' : 'Issue Description'}
              value={currentIssue?.description || ''}
              onChange={(e) => setCurrentIssue(prev => prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={3}
              dir={direction}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={language === 'ar' ? 'الإجراء المطلوب' : 'Required Action'}
              value={currentIssue?.requiredAction || ''}
              onChange={(e) => setCurrentIssue(prev => prev ? { ...prev, requiredAction: e.target.value } : null)}
              multiline
              rows={2}
              dir={direction}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAddIssueDialog(false)}>
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (currentIssue) {
              const existingIndex = issues.findIndex(i => i.id === currentIssue.id);
              if (existingIndex !== -1) {
                setIssues(issues.map(i => i.id === currentIssue.id ? currentIssue : i));
              } else {
                setIssues([...issues, currentIssue]);
              }
            }
            setShowAddIssueDialog(false);
            setCurrentIssue(null);
          }}
          disabled={!currentIssue?.title}
        >
          {language === 'ar' ? 'حفظ' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        {language === 'ar' ? 'مولد تقرير الامتثال' : 'Compliance Report Generator'}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {language === 'ar' 
          ? 'إنشاء تقرير امتثال شامل مع ربط الأنظمة الحكومية ونقاط الامتثال في الوقت الفعلي'
          : 'Generate comprehensive compliance report with government system integration and real-time compliance scoring'
        }
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {renderBasicInfo()}
        {renderComplianceScore()}
        {renderGovernmentAPIs()}
        {renderIssuesManagement()}
        {renderContactInfo()}
      </Box>

      {/* Dialogs */}
      <IssueDialog />
      
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

export default ComplianceReportGenerator;