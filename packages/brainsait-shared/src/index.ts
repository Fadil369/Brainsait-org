// Export all types
export * from './types/user.types';
export * from './types/program.types';
export * from './types/api.types';

// Export all utilities
export * from './utils/formatting';
export * from './utils/validation';

// Export all constants
export * from './constants';

// Re-export commonly used types for convenience
export type {
  User,
  SMEProfile,
  MentorProfile,
  Program,
  ProgramEnrollment,
  Mentorship,
  MentorSession,
  ApiResponse,
  PaginatedResponse,
  ValidationError,
} from './types/user.types';

export type {
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
} from './types/user.types';

export type {
  CreateProgramRequest,
  UpdateProgramRequest,
  EnrollProgramRequest,
} from './types/program.types';

// Version
export const VERSION = '1.0.0';