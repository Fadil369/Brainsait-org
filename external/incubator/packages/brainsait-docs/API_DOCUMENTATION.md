# BrainSAIT Document Service API Documentation

## Overview

The BrainSAIT Document Service provides comprehensive REST API endpoints for generating professional business documents with Saudi regulatory compliance. The service supports both Arabic and English document generation with advanced features like government API integration, Hijri date conversion, and QR code verification.

## Base URL

```
http://localhost:3002/api/documents
```

## Authentication

Currently using placeholder authentication. In production, implement JWT-based authentication by adding a Bearer token to the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- Document Generation: 10 requests per 15 minutes
- Batch Generation: 3 requests per 30 minutes  
- Template Previews: 20 requests per 5 minutes

## Content Types

- Request: `application/json`
- Response: `application/pdf` (for document generation) or `application/json` (for metadata)

## Document Generation Endpoints

### 1. Generate Business Plan

**POST** `/business-plan`

Generate a comprehensive business plan with Saudi regulatory compliance.

**Request Body:**
```json
{
  "companyName": "شركة التقنية المتطورة المحدودة",
  "executiveSummary": "تهدف هذه الشركة إلى تطوير حلول تقنية مبتكرة للسوق السعودي",
  "crNumber": "1234567890",
  "vatNumber": "312345678903",
  "language": "ar",
  "nationalAddress": {
    "buildingNumber": "1234",
    "street": "شارع الملك فهد",
    "district": "حي العليا",
    "city": "الرياض",
    "postalCode": "12345"
  },
  "financials": {
    "year1": {
      "revenue": 1000000,
      "expenses": 750000,
      "netProfit": 250000
    }
  }
}
```

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="business-plan-BS_1234567890_ABC123.pdf"
X-Document-ID: BS_1234567890_ABC123
X-Generation-Time: 2500ms
X-Template-Language: ar
```

### 2. Generate Feasibility Study

**POST** `/feasibility-study`

Create a detailed feasibility study with market analysis and projections.

**Request Body:**
```json
{
  "projectName": "مشروع التقنية الطبية المتقدمة",
  "marketAnalysis": "تحليل شامل للسوق السعودي للتقنيات الطبية",
  "technicalFeasibility": "دراسة الجدوى التقنية للمشروع",
  "financialProjections": {
    "initialInvestment": 2000000,
    "projectedRevenue": 5000000,
    "breakEvenPoint": 18
  },
  "language": "ar",
  "industry": "healthcare"
}
```

### 3. Generate Compliance Certificate

**POST** `/certificate`

Generate an official compliance certificate with QR code verification.

**Request Body:**
```json
{
  "recipientName": "أحمد محمد الأحمد",
  "programName": "برنامج ريادة الأعمال المتقدم",
  "completionDate": "2024-12-15",
  "certificateId": "CERT-2024-001",
  "issuerName": "د. سعد الخالد",
  "issuerTitle": "مدير البرنامج",
  "language": "ar"
}
```

### 4. Generate Compliance Report

**POST** `/compliance-report`

Create a comprehensive compliance report with government data integration.

**Request Body:**
```json
{
  "companyName": "شركة الابتكار الطبي",
  "reportPeriod": "2024 Q1-Q3",
  "complianceItems": [
    {
      "category": "التسجيل التجاري",
      "status": "compliant",
      "score": 100
    }
  ],
  "overallScore": 92,
  "crNumber": "9876543210",
  "language": "ar"
}
```

### 5. Batch Document Generation

**POST** `/batch`

Generate multiple documents simultaneously with optimized processing.

**Request Body:**
```json
{
  "documents": [
    {
      "templateName": "business-plan",
      "data": {
        "companyName": "Test Company",
        "executiveSummary": "Test summary",
        "crNumber": "1234567890"
      },
      "language": "en"
    },
    {
      "templateName": "certificate",
      "data": {
        "recipientName": "John Doe",
        "programName": "Test Program",
        "completionDate": "2024-12-15"
      },
      "language": "en"
    }
  ],
  "concurrent": 3,
  "validateAll": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch generation completed",
  "data": {
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    },
    "generationTime": "5200ms",
    "results": [
      {
        "documentId": "BS_1234567890_ABC123",
        "size": 1048576,
        "metadata": {
          "language": "en",
          "templateName": "business-plan",
          "generatedAt": "2024-12-15T10:30:00.000Z"
        }
      }
    ],
    "errors": []
  }
}
```

## Template Management Endpoints

### 6. List Available Templates

**GET** `/templates`

Returns a list of all available document templates with their metadata.

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "name": "business-plan",
        "displayName": "Business Plan",
        "displayNameAr": "خطة العمل",
        "description": "Comprehensive business plan with Saudi regulatory compliance",
        "descriptionAr": "خطة عمل شاملة مع الامتثال التنظيمي السعودي",
        "languages": ["ar", "en"],
        "requiredFields": ["companyName", "executiveSummary", "crNumber"],
        "optionalFields": ["vatNumber", "nationalAddress", "financials"],
        "format": "A4 Portrait",
        "estimatedPages": "15-25"
      }
    ],
    "totalCount": 4,
    "supportedLanguages": ["ar", "en"],
    "supportedFormats": ["A4 Portrait", "A4 Landscape"]
  }
}
```

### 7. Preview Template Structure

**GET** `/preview/:templateName?language=ar`

Returns the structure and sample data for a specific template.

**Parameters:**
- `templateName`: business-plan | feasibility-study | certificate | compliance-report
- `language` (query): ar | en

**Response:**
```json
{
  "success": true,
  "data": {
    "templateName": "business-plan",
    "language": "ar",
    "sampleData": {
      "companyName": "شركة التقنية المتطورة المحدودة",
      "executiveSummary": "تهدف هذه الشركة إلى تطوير حلول تقنية مبتكرة"
    },
    "validation": {
      "isValid": true,
      "score": 100,
      "missingFields": []
    },
    "structure": {
      "requiredFields": ["companyName", "executiveSummary", "crNumber"],
      "dataTypes": "object",
      "estimatedSize": 1024
    }
  }
}
```

## Government Integration Endpoints

### 8. Verify Company Data

**POST** `/government/verify`

Integrate with Saudi government APIs to verify company information.

**Request Body:**
```json
{
  "crNumber": "1234567890",
  "verificationTypes": ["commercial", "taxation", "zakat"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "crNumber": "1234567890",
    "verificationResults": {
      "commercial": {
        "commercialRecord": {
          "number": "1234567890",
          "companyNameAr": "شركة التقنية المتطورة المحدودة",
          "status": "active"
        }
      }
    },
    "verifiedAt": "2024-12-15T10:30:00.000Z",
    "cacheExpiry": "2024-12-15T12:30:00.000Z"
  }
}
```

## Utility Endpoints

### 9. Convert Hijri Dates

**POST** `/utils/hijri-convert`

Utility endpoint for converting Gregorian dates to Hijri dates.

**Request Body:**
```json
{
  "gregorianDate": "2024-12-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gregorianDate": "2024-12-15T00:00:00.000Z",
    "hijriDate": "١٥ ربيع الآخر ١٤٤٦هـ",
    "convertedAt": "2024-12-15T10:30:00.000Z"
  }
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "companyName",
      "message": "Company name is required",
      "value": null
    }
  ]
}
```

### Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTH_REQUIRED`: Authentication token required
- `AUTH_FAILED`: Authentication token invalid
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `GENERATION_ERROR`: Document generation failed
- `TEMPLATE_NOT_FOUND`: Requested template does not exist
- `BATCH_SIZE_EXCEEDED`: Batch request exceeds maximum size
- `PAYLOAD_TOO_LARGE`: Request payload exceeds size limits
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Saudi-Specific Features

### Language Support
- **Arabic (ar)**: Full RTL support with Arabic numerals, Hijri dates
- **English (en)**: LTR layout with Gregorian dates

### Saudi Regulatory Compliance
- Commercial Registration (CR) validation
- VAT number format validation
- Saudi phone number validation
- National address formatting
- Zakat and tax calculations

### Date Handling
- Automatic Hijri date conversion
- Arabic numeral formatting
- Saudi calendar integration

### Government API Integration
- Commercial registry verification
- Tax authority validation
- Social insurance data
- Municipal licensing verification

## Response Headers

### Document Generation Responses
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document-name.pdf"
X-Document-ID: BS_1234567890_ABC123
X-Generation-Time: 2500ms
X-Template-Language: ar
X-Certificate-ID: CERT-2024-001 (for certificates)
X-Compliance-Score: 92 (for compliance reports)
```

### JSON Responses
```
Content-Type: application/json
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1634567890
```

## Rate Limiting Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1634567890
```

## Development Notes

### Dependencies
- Express.js with TypeScript
- express-validator for input validation
- express-rate-limit for API protection
- puppeteer for PDF generation
- handlebars for template rendering
- multer for file uploads (ready for future features)

### Security Features
- Rate limiting per endpoint type
- Input validation and sanitization
- Arabic text encoding validation
- CORS configuration
- Helmet security headers
- Request logging and monitoring

### Performance Optimizations
- Template caching
- Government data caching
- Batch processing with concurrency limits
- Resource cleanup and memory management
- Browser instance reuse for PDF generation

This API provides a comprehensive solution for generating professional documents with Saudi regulatory compliance, supporting both Arabic and English languages with advanced features for government integration and data verification.