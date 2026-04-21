// Common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

// Request/Response interfaces for common operations
export interface CreateResponse {
  id: string;
  createdAt: Date;
}

export interface UpdateResponse {
  id: string;
  updatedAt: Date;
}

export interface DeleteResponse {
  id: string;
  deletedAt: Date;
}

// File upload types
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface MultipleFileUploadResponse {
  files: FileUploadResponse[];
  totalSize: number;
  uploadedAt: Date;
}

// Search and filter types
export interface SearchParams {
  query: string;
  filters?: FilterParams;
  pagination?: PaginationParams;
}

export interface SearchResponse<T = any> extends PaginatedResponse<T> {
  query: string;
  filters: FilterParams;
  executionTime: number;
}

// Validation error types
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface ValidationErrorResponse extends ApiError {
  code: 'VALIDATION_ERROR';
  details: ValidationError[];
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: 'Bearer';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  PROGRAM_UPDATE = 'PROGRAM_UPDATE',
  MENTORSHIP_REQUEST = 'MENTORSHIP_REQUEST',
  SESSION_REMINDER = 'SESSION_REMINDER',
  DOCUMENT_REQUIRED = 'DOCUMENT_REQUIRED',
}

// Analytics types
export interface AnalyticsData {
  metric: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  period: 'day' | 'week' | 'month' | 'year';
  timestamp: Date;
}

export interface DashboardStats {
  totalSMEs: number;
  activeSMEs: number;
  totalMentors: number;
  activePrograms: number;
  completedPrograms: number;
  totalSessions: number;
  averageRating: number;
  recentActivity: AnalyticsData[];
}