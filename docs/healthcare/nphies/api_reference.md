# NPHIES API Reference

## Overview

This document provides technical specifications for integrating with NPHIES APIs. All endpoints use FHIR R4 format and require proper authentication.

---

## Base Configuration

### Environments

| Environment | Base URL | Purpose |
|-------------|----------|---------|
| Sandbox | `https://sandbox.nphies.sa/fhir` | Testing |
| Production | `https://api.nphies.sa/fhir` | Live |

### Authentication

**Method:** mTLS + OAuth 2.0

1. **Certificate Authentication**
   - Client certificate issued by NPHIES
   - mTLS handshake required
   - Certificate renewal annually

2. **OAuth 2.0 Token**
   ```http
   POST /oauth/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=client_credentials
   &client_id={client_id}
   &client_secret={client_secret}
   &scope=nphies-api
   ```

3. **Response**
   ```json
   {
     "access_token": "eyJ...",
     "token_type": "Bearer",
     "expires_in": 3600
   }
   ```

### Headers

```http
Authorization: Bearer {access_token}
Content-Type: application/fhir+json
Accept: application/fhir+json
X-Request-ID: {uuid}
```

---

## Eligibility API

### Check Eligibility

**Endpoint:** `POST /CoverageEligibilityRequest`

**Request:**
```json
{
  "resourceType": "CoverageEligibilityRequest",
  "identifier": [{
    "system": "http://provider.com/eligibility",
    "value": "ELG-2024-001"
  }],
  "status": "active",
  "purpose": ["benefits", "validation"],
  "patient": {
    "reference": "Patient/123"
  },
  "servicedDate": "2024-01-15",
  "created": "2024-01-14T10:00:00Z",
  "provider": {
    "reference": "Organization/hospital"
  },
  "insurer": {
    "reference": "Organization/bupa"
  },
  "item": [{
    "category": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/ex-benefitcategory",
        "code": "1"
      }]
    }
  }]
}
```

**Response:**
```json
{
  "resourceType": "CoverageEligibilityResponse",
  "identifier": [{
    "value": "ELG-RSP-001"
  }],
  "status": "active",
  "purpose": ["benefits"],
  "patient": {
    "reference": "Patient/123"
  },
  "created": "2024-01-14T10:00:05Z",
  "insurer": {
    "reference": "Organization/bupa"
  },
  "outcome": "complete",
  "insurance": [{
    "coverage": {
      "reference": "Coverage/456"
    },
    "inforce": true,
    "item": [{
      "category": {...},
      "benefit": [{
        "type": {...},
        "allowedMoney": {
          "value": 100000,
          "currency": "SAR"
        },
        "usedMoney": {
          "value": 5000,
          "currency": "SAR"
        }
      }]
    }]
  }]
}
```

**Response Codes:**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 422 | Validation error |

---

## Prior Authorization API

### Submit Authorization Request

**Endpoint:** `POST /Claim` (with use = "preauthorization")

**Request:**
```json
{
  "resourceType": "Claim",
  "identifier": [{
    "value": "AUTH-2024-001"
  }],
  "status": "active",
  "type": {
    "coding": [{
      "code": "institutional"
    }]
  },
  "use": "preauthorization",
  "patient": {
    "reference": "Patient/123"
  },
  "created": "2024-01-14T10:00:00Z",
  "provider": {
    "reference": "Organization/hospital"
  },
  "priority": {
    "coding": [{
      "code": "normal"
    }]
  },
  "insurance": [{
    "sequence": 1,
    "focal": true,
    "coverage": {
      "reference": "Coverage/456"
    }
  }],
  "diagnosis": [{
    "sequence": 1,
    "diagnosisCodeableConcept": {
      "coding": [{
        "system": "http://hl7.org/fhir/sid/icd-10-am",
        "code": "M17.11"
      }]
    }
  }],
  "procedure": [{
    "sequence": 1,
    "procedureCodeableConcept": {
      "coding": [{
        "system": "http://www.ama-assn.org/go/cpt",
        "code": "27447"
      }]
    }
  }],
  "item": [{
    "sequence": 1,
    "productOrService": {
      "coding": [{
        "code": "27447"
      }]
    },
    "servicedDate": "2024-01-20",
    "quantity": {
      "value": 1
    },
    "unitPrice": {
      "value": 50000,
      "currency": "SAR"
    }
  }],
  "supportingInfo": [{
    "sequence": 1,
    "category": {
      "coding": [{
        "code": "attachment"
      }]
    },
    "valueAttachment": {
      "contentType": "application/pdf",
      "data": "base64..."
    }
  }]
}
```

---

## Claims API

### Submit Claim

**Endpoint:** `POST /Claim`

**Request:** (Similar to authorization but `use: "claim"`)

### Get Claim Status

**Endpoint:** `GET /Claim/{id}`

**Response:**
```json
{
  "resourceType": "Claim",
  "id": "123",
  "status": "active",
  ...
}
```

### Search Claims

**Endpoint:** `GET /Claim?patient={patient_id}&created=ge{date}`

---

## Claim Response API

### Get Adjudication Result

**Endpoint:** `GET /ClaimResponse?request={claim_id}`

**Response:**
```json
{
  "resourceType": "ClaimResponse",
  "status": "active",
  "type": {...},
  "use": "claim",
  "patient": {...},
  "created": "2024-01-20T10:00:00Z",
  "insurer": {...},
  "outcome": "complete",
  "disposition": "Claim settled",
  "item": [{
    "itemSequence": 1,
    "adjudication": [{
      "category": {
        "coding": [{
          "code": "submitted"
        }]
      },
      "amount": {
        "value": 50000,
        "currency": "SAR"
      }
    },
    {
      "category": {
        "coding": [{
          "code": "eligible"
        }]
      },
      "amount": {
        "value": 45000,
        "currency": "SAR"
      }
    },
    {
      "category": {
        "coding": [{
          "code": "benefit"
        }]
      },
      "amount": {
        "value": 40500,
        "currency": "SAR"
      }
    }]
  }],
  "payment": {
    "type": {...},
    "date": "2024-01-25",
    "amount": {
      "value": 40500,
      "currency": "SAR"
    }
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "processing",
    "details": {
      "coding": [{
        "system": "http://nphies.sa/error-codes",
        "code": "ERR-001"
      }]
    },
    "diagnostics": "Invalid patient identifier"
  }]
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| ERR-001 | Invalid identifier | Check patient ID |
| ERR-002 | Coverage not found | Verify policy |
| ERR-003 | Invalid code | Use valid code |
| ERR-004 | Missing required field | Complete all fields |
| ERR-005 | Duplicate submission | Check prior claims |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Eligibility | 100/min | Per provider |
| Claims | 500/min | Per provider |
| Status | 1000/min | Per provider |

---

## Webhooks

### Claim Status Webhook

```json
{
  "event": "claim.status.changed",
  "claim_id": "123",
  "status": "complete",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

---

## SDK Support

### Python Example

```python
from brainsait import NphiesClient

client = NphiesClient(
    cert_path="/path/to/cert.pem",
    key_path="/path/to/key.pem",
    client_id="your_client_id",
    client_secret="your_secret"
)

# Check eligibility
response = client.check_eligibility(
    patient_id="123",
    service_date="2024-01-15",
    payer="bupa"
)

# Submit claim
claim_response = client.submit_claim(claim_bundle)
```

---

## Related Documents

- [NPHIES Overview](overview.md)
- [FHIR R4 Profile](fhir_r4_profile.md)
- [Workflows](workflows.md)
- [Automation Pipeline](../claims/automation_pipeline.md)

---

*Last updated: January 2025*
