import { ReactNode } from 'react';

// Common Component Types
export interface BilingualText {
  en: string;
  ar: string;
}

export interface ComponentProps {
  children?: ReactNode;
  className?: string;
}

export interface FormFieldProps {
  name: string;
  label: BilingualText;
  placeholder?: BilingualText;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: BilingualText;
}

// Dashboard Types
export interface DashboardMetric {
  id: string;
  title: BilingualText;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

export interface AnalyticsWidget {
  id: string;
  title: BilingualText;
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  data: ChartData[];
  period?: string;
  height?: number;
}

// Incubation Phase Types
export enum IncubationPhase {
  DIAGNOSIS = 'DIAGNOSIS',
  PLANNING = 'PLANNING',
  IMPLEMENTATION = 'IMPLEMENTATION',
  MONITORING = 'MONITORING'
}

export interface AssessmentQuestion {
  id: string;
  question: BilingualText;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'scale';
  options?: { value: string; label: BilingualText }[];
  required: boolean;
  weight?: number;
}

export interface AssessmentSection {
  id: string;
  title: BilingualText;
  description?: BilingualText;
  questions: AssessmentQuestion[];
}

export interface DiagnosisAssessment {
  id: string;
  title: BilingualText;
  description: BilingualText;
  sections: AssessmentSection[];
  totalQuestions: number;
  estimatedTime: number; // in minutes
}

export interface RoadmapMilestone {
  id: string;
  title: BilingualText;
  description: BilingualText;
  phase: IncubationPhase;
  targetDate: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  prerequisites?: string[];
  deliverables: string[];
  assignee?: string;
}

export interface TaskItem {
  id: string;
  title: BilingualText;
  description?: BilingualText;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
  milestoneId: string;
}

export interface KPIMetric {
  id: string;
  name: BilingualText;
  description?: BilingualText;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: 'financial' | 'operational' | 'customer' | 'growth' | 'quality';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

// Document Generation Types
export interface DocumentTemplate {
  id: string;
  name: BilingualText;
  description: BilingualText;
  type: 'feasibility_study' | 'business_plan' | 'market_analysis' | 'financial_projection';
  language: 'en' | 'ar' | 'both';
  sections: DocumentSection[];
  requiredFields: string[];
}

export interface DocumentSection {
  id: string;
  title: BilingualText;
  description?: BilingualText;
  fields: DocumentField[];
  order: number;
  required: boolean;
}

export interface DocumentField {
  id: string;
  name: string;
  label: BilingualText;
  type: 'text' | 'textarea' | 'number' | 'date' | 'file' | 'select' | 'multiselect';
  placeholder?: BilingualText;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: { value: string; label: BilingualText }[];
  defaultValue?: any;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  title: BilingualText;
  content: { [fieldName: string]: any };
  language: 'en' | 'ar';
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'review' | 'approved' | 'final';
  downloadUrl?: string;
}

// File Upload Types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  thumbnail?: string;
}

export interface FileUploadOptions {
  accept: string;
  maxSize: number; // in bytes
  maxFiles: number;
  multiple: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  title: BilingualText;
  message: BilingualText;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: BilingualText;
}

// Progress Stepper Types
export interface StepperStep {
  id: string;
  label: BilingualText;
  description?: BilingualText;
  status: 'completed' | 'active' | 'pending' | 'disabled';
  icon?: string;
  optional?: boolean;
}

// Theme and Styling Types
export interface ThemeDirection {
  direction: 'ltr' | 'rtl';
  language: 'en' | 'ar';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormState {
  values: { [key: string]: any };
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  rules?: ValidationRule[];
  transform?: (value: any) => any;
}