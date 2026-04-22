# BrainSAIT Backend API Documentation

## Overview

The BrainSAIT Backend API is a comprehensive healthcare SME incubation platform built with Express.js, TypeScript, Prisma ORM, and Redis. It provides secure, scalable endpoints for managing users, SMEs, programs, documents, and analytics.

## Architecture

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Sessions**: Redis
- **Authentication**: JWT with refresh tokens
- **File Storage**: Local filesystem (configurable for cloud storage)
- **Document Generation**: HTML templates (extensible to PDF generation)

## Key Features

### 1. Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, SME_OWNER, Mentor)
- Email verification system
- Password reset functionality
- Session management with Redis
- Rate limiting and security middleware

### 2. SME Management
- Complete SME profile CRUD operations
- Document upload and verification system
- Industry focus categorization
- Verification status management
- Business information tracking

### 3. Incubation Programs
- Program management with status tracking
- Enrollment system with capacity management
- Progress tracking and completion certificates
- Phase-based program structure
- Assessment and milestone tracking

### 4. Document Generation
- Automated feasibility study generation
- Business plan creation with templates
- Certificate generation for completions
- Downloadable HTML/PDF documents
- Template management system

### 5. Analytics & Reporting
- Comprehensive dashboard analytics
- SME performance metrics
- Program enrollment statistics
- Export functionality (CSV, Excel)
- Personal analytics for users

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /logout-all` - Logout from all devices
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `POST /change-password` - Change password (authenticated)
- `POST /refresh` - Refresh access token
- `GET /profile` - Get user profile

### SME Management (`/api/sme`)
- `GET /` - List SMEs with filtering and pagination
- `GET /:id` - Get SME by ID
- `POST /` - Create SME profile (authenticated)
- `PUT /:id` - Update SME profile
- `DELETE /:id` - Delete SME profile
- `GET /my/profile` - Get current user's SME profile
- `PUT /:id/verification` - Update verification status (admin)
- `PUT /:id/documents` - Upload SME documents
- `GET /admin/statistics` - SME statistics (admin)

### Program Management (`/api/programs`)
- `GET /` - List programs with filtering
- `GET /:id` - Get program details
- `POST /` - Create program (admin)
- `PUT /:id` - Update program (admin)
- `DELETE /:id` - Delete program (admin)
- `POST /:id/enroll` - Enroll in program
- `GET /my/enrollments` - Get user's enrollments
- `PUT /enrollments/:enrollmentId/status` - Update enrollment status (admin)
- `PUT /enrollments/:enrollmentId/progress` - Update progress
- `GET /admin/statistics` - Program statistics (admin)

### Document Generation (`/api/documents`)
- `POST /feasibility-study` - Generate feasibility study
- `POST /business-plan` - Generate business plan
- `POST /certificate` - Generate certificate
- `GET /my-documents` - Get user's documents
- `GET /download/:fileName` - Download document
- `DELETE /:fileName` - Delete document
- `GET /templates` - Get document templates (admin)

### Analytics (`/api/analytics`)
- `GET /dashboard` - Dashboard analytics (admin)
- `GET /smes` - SME analytics (admin)
- `GET /programs` - Program analytics (admin)
- `GET /export` - Export analytics data (admin)
- `GET /my-analytics` - Personal analytics

## Security Features

### Authentication
- JWT tokens with configurable expiration
- Refresh token rotation
- Session management with Redis
- Password hashing with bcrypt (configurable rounds)

### Authorization
- Role-based access control
- Resource-level permissions
- Admin-only endpoints protection
- User ownership validation

### Security Middleware
- Helmet for security headers
- CORS configuration
- Rate limiting
- Request size limits
- File upload validation
- Input sanitization and validation

### Data Validation
- Comprehensive validation schemas
- Type-safe request/response handling
- Error handling with detailed messages
- Sanitization of user inputs

## Error Handling

### Structured Error Responses
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Additional details",
    "code": "ERROR_CODE"
  }
}
```

### Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication required
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_RESOURCE` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Database Schema

The application uses Prisma ORM with the following main entities:
- **User** - Platform users with roles
- **SMEProfile** - SME business information
- **Program** - Incubation programs
- **ProgramEnrollment** - SME-Program relationships
- **MentorProfile** - Mentor information
- **Mentorship** - SME-Mentor relationships
- **Session** - User authentication sessions
- **PasswordReset** - Password reset tokens

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `FRONTEND_URL` - Frontend application URL
- `PORT` - Server port (default: 5000)

## File Upload Support

- Maximum file size: 10MB (configurable)
- Supported formats: Images (JPEG, PNG, GIF), Documents (PDF, DOC, DOCX)
- Upload categories: Avatars, Documents, Certificates
- Automatic file validation and security checks
- Organized storage structure

## Document Generation

### Templates Available
1. **Feasibility Study** - Comprehensive business viability analysis
2. **Business Plan** - Professional business plan with financial projections
3. **Certificates** - Program completion certificates

### Generation Process
1. User provides business information
2. System merges data with templates
3. HTML document generated
4. Available for download
5. Optional PDF conversion (extensible)

## Analytics Features

### Dashboard Metrics
- User registration trends
- SME verification rates
- Program enrollment statistics
- Completion rates and success metrics

### SME Analytics
- Industry distribution
- Company size analysis
- Geographic distribution
- Verification status tracking

### Program Analytics
- Enrollment trends over time
- Completion rates by program
- Popular program identification
- Capacity utilization tracking

## Development Features

### Code Quality
- TypeScript for type safety
- Comprehensive error handling
- Input validation and sanitization
- Structured logging with Winston
- Clean architecture with separation of concerns

### Testing Support
- Jest configuration ready
- Supertest for API testing
- Test database configuration
- Mock data factories

### Development Tools
- Nodemon for hot reloading
- ESLint for code quality
- Prettier for code formatting
- TypeScript path mapping

## Deployment Considerations

### Production Requirements
- PostgreSQL database
- Redis server
- SMTP email service
- File storage solution
- SSL certificates

### Scalability Features
- Stateless authentication
- Redis-based session management
- Efficient database queries
- Configurable rate limiting
- Horizontal scaling ready

### Monitoring
- Structured logging
- Health check endpoints
- Error tracking integration ready
- Performance metrics collection

## Security Best Practices Implemented

1. **Authentication Security**
   - Strong password requirements
   - Account lockout protection
   - Session timeout management
   - Secure token storage

2. **Data Protection**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF protection

3. **API Security**
   - Rate limiting
   - Request size limits
   - Secure headers
   - CORS configuration

4. **File Security**
   - File type validation
   - Size limitations
   - Secure file naming
   - Path traversal prevention

This comprehensive backend system provides a solid foundation for the BrainSAIT healthcare SME incubation platform, with room for future enhancements and integrations.