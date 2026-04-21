# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BrainSAIT is a comprehensive healthcare SME digital transformation platform designed to support healthcare startups in the Arab world. It provides incubation programs, mentorship opportunities, and digital tools through a modern microservices architecture.

## Architecture & Structure

The project follows a monorepo structure with npm workspaces:

```
packages/
├── brainsait-frontend/    # Next.js 14 with TypeScript & Material-UI
├── brainsait-backend/     # Node.js/Express API with PostgreSQL  
├── brainsait-shared/      # Shared types and utilities
└── brainsait-docs/        # PDF generation service with Puppeteer
```

### Key Technologies
- **Frontend**: Next.js 14, Material-UI, React i18next (Arabic/English RTL support)
- **Backend**: Express.js, TypeScript, Prisma ORM, PostgreSQL, Redis
- **Document Service**: Puppeteer for PDF generation with multilingual templates
- **Shared**: Zod schemas for validation, common types and utilities

## Essential Commands

### Development
```bash
npm run dev                # Start all services
npm run dev:frontend       # Frontend only (port 3000)
npm run dev:backend        # Backend only (port 5000) 
npm run dev:docs          # Document service only (port 5002)
```

### Building & Testing
```bash
npm run build             # Build all packages
npm run test              # Run tests for all packages
npm run lint              # Lint all packages
npm run format            # Format with Prettier
```

### Docker Operations
```bash
npm run docker:build      # Build Docker images
npm run docker:up         # Start all services with Docker
npm run docker:down       # Stop Docker services
```

### Database Operations (from backend package)
```bash
cd packages/brainsait-backend
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Run migrations
npm run db:seed           # Seed database
```

## Development Setup

1. **Environment Files**: Copy `.env.example` files in root and each package
2. **Database**: PostgreSQL and Redis required (use Docker or local installation)
3. **Dependencies**: Run `npm install` from root (handles all workspaces)

### Docker Setup (Recommended)
- All services configured in `docker-compose.yml`
- Includes PostgreSQL, Redis, and all application services
- Health checks and service dependencies configured

## Database Schema

The platform uses Prisma with PostgreSQL featuring comprehensive healthcare SME management:

### Core Entities
- **Users**: Multi-role system (SME_OWNER, MENTOR, ADMIN, SUPER_ADMIN)
- **SMEProfile**: Company information with healthcare-specific extensions
- **Programs**: Incubation/acceleration programs with phases
- **Mentorships**: Mentor-SME relationships with session tracking
- **Assessments**: Multi-type assessments (diagnostic, formative, etc.)
- **Documents**: Template-based document generation system
- **KPIs**: Performance tracking with industry-specific metrics

### Healthcare Extensions
- **SMEHealthcareProfile**: Healthcare-specific compliance and licensing
- **BusinessHealthcareType**: Healthcare business categorization
- Regulatory compliance tracking and certification management

## API Structure

### Authentication Endpoints
- `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`
- JWT-based authentication with session management

### Core Resources
- `/api/users` - User management
- `/api/sme` - SME profile management  
- `/api/programs` - Program management
- `/api/mentors` - Mentor operations
- `/api/documents` - Document generation via PDF service

### Document Generation Service
- `/api/pdf/generate` - Custom PDF generation
- `/api/pdf/certificate`, `/api/pdf/report` - Specific document types
- Supports Arabic/English templates with RTL layout

## Multilingual Support

Full Arabic and English support implemented:
- **Frontend**: React i18next with RTL layout support
- **Database**: Dual language fields (title/titleAr, description/descriptionAr)
- **Document Service**: Separate template directories for Arabic (ar/) and English (en/)
- **Material-UI**: Custom theming with RTL support

## Security & Validation

- **Input Validation**: Express-validator for API requests
- **Authentication**: JWT with secure session management
- **Database**: Prisma prevents SQL injection
- **Security Headers**: Helmet.js configuration
- **Rate Limiting**: API rate limiting per IP
- **Validation**: Zod schemas in shared package for runtime type checking

## Important Integration Notes

- **OID System Integration**: The platform integrates with BrainSAIT OID system located at `/Users/fadil369/02_BRAINSAIT_ECOSYSTEM/Unified_Platform/UNIFICATION_SYSTEM/brainSAIT-oid-system/oid-portal/src/pages/OidTree.jsx`
- When working on features, consider integration points with the broader BrainSAIT ecosystem
- Document generation service supports QR codes and custom styling for certificates

## Development Guidelines

- **Type Safety**: Full TypeScript implementation across all packages
- **Code Quality**: ESLint, Prettier, and pre-commit hooks configured
- **Testing**: Jest for backend, React Testing Library for frontend
- **Monorepo**: Use workspace commands (`--workspace=package-name`) for package-specific operations
- **Database**: Always generate Prisma client after schema changes
- **Internationalization**: Add both English and Arabic content for user-facing features