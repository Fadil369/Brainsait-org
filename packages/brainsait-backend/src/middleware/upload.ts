import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

// Ensure upload directories exist
const uploadDirs = {
  documents: path.join(process.cwd(), 'uploads', 'documents'),
  avatars: path.join(process.cwd(), 'uploads', 'avatars'),
  certificates: path.join(process.cwd(), 'uploads', 'certificates'),
  temp: path.join(process.cwd(), 'uploads', 'temp'),
};

// Create upload directories if they don't exist
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File type validators
const isImage = (mimetype: string): boolean => {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(mimetype);
};

const isDocument = (mimetype: string): boolean => {
  return [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].includes(mimetype);
};

const isAllowedFile = (mimetype: string): boolean => {
  return config.uploads.allowedMimeTypes.includes(mimetype);
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = uploadDirs.temp;

    // Determine upload path based on field name or custom path
    if (req.body.uploadType) {
      switch (req.body.uploadType) {
        case 'avatar':
          uploadPath = uploadDirs.avatars;
          break;
        case 'document':
          uploadPath = uploadDirs.documents;
          break;
        case 'certificate':
          uploadPath = uploadDirs.certificates;
          break;
        default:
          uploadPath = uploadDirs.temp;
      }
    } else {
      // Fallback based on field name
      if (file.fieldname.includes('avatar')) {
        uploadPath = uploadDirs.avatars;
      } else if (file.fieldname.includes('document') || file.fieldname.includes('file')) {
        uploadPath = uploadDirs.documents;
      } else if (file.fieldname.includes('certificate')) {
        uploadPath = uploadDirs.certificates;
      }
    }

    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${extension}`;
    
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (!isAllowedFile(file.mimetype)) {
    const error = new Error(`File type ${file.mimetype} is not allowed`);
    (error as any).code = 'INVALID_FILE_TYPE';
    return cb(error as any, false);
  }

  // Additional validation based on upload type
  if (req.body.uploadType === 'avatar' && !isImage(file.mimetype)) {
    const error = new Error('Avatar must be an image file');
    (error as any).code = 'INVALID_AVATAR_TYPE';
    return cb(error as any, false);
  }

  if (req.body.uploadType === 'document' && !isDocument(file.mimetype) && !isImage(file.mimetype)) {
    const error = new Error('Document must be a PDF, Word document, Excel file, or image');
    (error as any).code = 'INVALID_DOCUMENT_TYPE';
    return cb(error as any, false);
  }

  cb(null, true);
};

// Base multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.uploads.maxFileSize,
    files: 10, // Maximum 10 files per request
  },
});

/**
 * Middleware for handling single file upload
 */
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err: any) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  };
};

/**
 * Middleware for handling multiple file upload
 */
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = upload.array(fieldName, maxCount);
    
    uploadHandler(req, res, (err: any) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  };
};

/**
 * Middleware for handling multiple fields with file uploads
 */
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = upload.fields(fields);
    
    uploadHandler(req, res, (err: any) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  };
};

/**
 * Handle upload errors
 */
const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('File upload error:', err);

  if (err instanceof MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: {
            message: 'File size too large',
            details: `Maximum file size is ${config.uploads.maxFileSize / (1024 * 1024)}MB`,
          },
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: {
            message: 'Too many files',
            details: 'Maximum number of files exceeded',
          },
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: {
            message: 'Unexpected file field',
            details: 'File field name is not allowed',
          },
        });
      default:
        return res.status(400).json({
          success: false,
          error: {
            message: 'File upload error',
            details: err.message,
          },
        });
    }
  }

  // Custom errors
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid file type',
        details: err.message,
      },
    });
  }

  if (err.code === 'INVALID_AVATAR_TYPE') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid avatar file type',
        details: err.message,
      },
    });
  }

  if (err.code === 'INVALID_DOCUMENT_TYPE') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid document file type',
        details: err.message,
      },
    });
  }

  // Generic error
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error during file upload',
    },
  });
};

/**
 * Utility function to get file URL
 */
export const getFileUrl = (filename: string, type: 'documents' | 'avatars' | 'certificates' = 'documents'): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${type}/${filename}`;
};

/**
 * Utility function to delete file
 */
export const deleteFile = async (filepath: string): Promise<void> => {
  try {
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
      logger.info(`File deleted: ${filepath}`);
    }
  } catch (error) {
    logger.error(`Error deleting file: ${filepath}`, error);
  }
};

/**
 * Utility function to move file from temp to permanent location
 */
export const moveFile = async (sourcePath: string, destinationPath: string): Promise<void> => {
  try {
    // Ensure destination directory exists
    const destinationDir = path.dirname(destinationPath);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    await fs.promises.rename(sourcePath, destinationPath);
    logger.info(`File moved from ${sourcePath} to ${destinationPath}`);
  } catch (error) {
    logger.error(`Error moving file from ${sourcePath} to ${destinationPath}`, error);
    throw error;
  }
};

/**
 * Cleanup old temporary files (should be run periodically)
 */
export const cleanupTempFiles = async (): Promise<void> => {
  try {
    const tempDir = uploadDirs.temp;
    const files = await fs.promises.readdir(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.promises.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await deleteFile(filePath);
      }
    }

    logger.info(`Cleaned up temporary files older than 24 hours`);
  } catch (error) {
    logger.error('Error cleaning up temporary files:', error);
  }
};

/**
 * Validate file requirements for SME documents
 */
export const validateSMEDocuments = (files: Express.Multer.File[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredTypes = ['business_license', 'tax_certificate', 'company_profile'];
  const uploadedTypes = files.map(file => file.fieldname);

  // Check if all required document types are present
  for (const type of requiredTypes) {
    if (!uploadedTypes.includes(type)) {
      errors.push(`Missing required document: ${type.replace('_', ' ')}`);
    }
  }

  // Check file sizes and types
  for (const file of files) {
    if (file.size > config.uploads.maxFileSize) {
      errors.push(`File ${file.originalname} is too large`);
    }
    
    if (!isAllowedFile(file.mimetype)) {
      errors.push(`File ${file.originalname} has invalid type`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Export upload directories for reference
export { uploadDirs };