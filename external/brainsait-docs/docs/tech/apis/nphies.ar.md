---
title: NPHIES Integration API
---

!!! info "Translation in Progress / الترجمة قيد الإجراء"
    This content is currently being translated. / هذا المحتوى قيد الترجمة حالياً.

<div dir="rtl">


# NPHIES Integration API

## Overview

This section details the API integration with the National Platform for Health and Insurance Exchange Services (NPHIES).

## Core Resources

### Eligibility
- **Check Eligibility**: `POST /api/nphies/eligibility/check`
- **Verify Coverage**: `GET /api/nphies/coverage/{id}`

### Claims
- **Submit Claim**: `POST /api/nphies/claims/submit`
- **Check Status**: `GET /api/nphies/claims/{id}/status`

## Authentication

All NPHIES endpoints require a valid JWT token signed with your organization's private key.

```json
{
  "Authorization": "Bearer <your_token>"
}
```

## FHIR R4 Compliance

Our API is fully compliant with FHIR R4 standards as mandated by CHI (Council of Health Insurance).

*Documentation in progress. Please refer to the [NPHIES Official Guide](https://nphies.sa) for standard specifications.*


</div>