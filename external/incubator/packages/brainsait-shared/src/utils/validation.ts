/**
 * Common validation utilities for BrainSAIT platform
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (international format)
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digits and check if it's between 10-15 digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} => {
  const errors: string[] = [];
  let score = 0;

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Contains lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Contains uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Contains number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Contains special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Business name validation (supports Arabic and English)
export const isValidBusinessName = (name: string): boolean => {
  // Allow letters, numbers, spaces, and common business symbols
  const businessNameRegex = /^[\w\s\u0600-\u06FF\u0750-\u077F&.,'-]+$/;
  return name.length >= 2 && name.length <= 100 && businessNameRegex.test(name);
};

// File validation
export const validateFile = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxNameLength?: number;
  } = {}
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxNameLength = 255,
  } = options;

  // File size check
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }

  // File type check
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // File name length check
  if (file.name.length > maxNameLength) {
    errors.push(`File name must be less than ${maxNameLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Arabic text validation
export const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
};

// Numeric validation
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value > 0 && !isNaN(value) && isFinite(value);
};

export const isValidPercentage = (value: number): boolean => {
  return typeof value === 'number' && value >= 0 && value <= 100 && !isNaN(value);
};

// Date validation
export const isValidDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isDateInFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValidDate(dateObj) && dateObj.getTime() > Date.now();
};

export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValidDate(dateObj) && dateObj.getTime() < Date.now();
};

// Age validation
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const isValidAge = (birthDate: Date, minAge: number = 18, maxAge: number = 100): boolean => {
  const age = calculateAge(birthDate);
  return age >= minAge && age <= maxAge;
};

// Company validation
export const isValidFoundedYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1800 && year <= currentYear;
};

export const isValidEmployeeCount = (count: number): boolean => {
  return Number.isInteger(count) && count >= 1 && count <= 1000000;
};

// Text length validation
export const isValidTextLength = (
  text: string,
  minLength: number = 0,
  maxLength: number = 1000
): boolean => {
  return text.length >= minLength && text.length <= maxLength;
};

// LinkedIn URL validation
export const isValidLinkedInUrl = (url: string): boolean => {
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
  return linkedinRegex.test(url);
};

// Rating validation
export const isValidRating = (rating: number, min: number = 1, max: number = 5): boolean => {
  return Number.isInteger(rating) && rating >= min && rating <= max;
};

// Sanitization utilities
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Form validation helper
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => boolean | { isValid: boolean; message: string }>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    const result = rule(value);

    if (typeof result === 'boolean') {
      if (!result) {
        errors[field] = `Invalid ${field}`;
      }
    } else {
      if (!result.isValid) {
        errors[field] = result.message;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};