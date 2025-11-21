# FHIR R4 Profile Reference

## Overview

This document provides a comprehensive reference for FHIR R4 profiles used in NPHIES integration. Understanding these profiles is essential for successful claims processing and healthcare data exchange.

---

## FHIR Fundamentals

### What is FHIR?

Fast Healthcare Interoperability Resources (FHIR) is a standard for exchanging healthcare information electronically. NPHIES uses FHIR R4 as its foundation.

### Key Concepts

- **Resources** - Basic units of data (Patient, Claim, etc.)
- **Profiles** - Constraints on resources for specific use cases
- **Extensions** - Custom data elements
- **Bundles** - Collections of resources

---

## Core Resources

### Patient

**Purpose:** Represents the patient receiving care.

**Key Elements:**
```json
{
  "resourceType": "Patient",
  "identifier": [{
    "system": "http://nphies.sa/identifier/iqama",
    "value": "1234567890"
  }],
  "name": [{
    "family": "Al-Ahmad",
    "given": ["Mohammed"]
  }],
  "gender": "male",
  "birthDate": "1985-03-15"
}
```

**Required Fields:**
- `identifier` - National ID/Iqama
- `name` - Patient name (Arabic)
- `gender` - male/female
- `birthDate` - YYYY-MM-DD

---

### Coverage

**Purpose:** Insurance policy information.

**Key Elements:**
```json
{
  "resourceType": "Coverage",
  "identifier": [{
    "system": "http://payer.com/policy",
    "value": "POL-12345"
  }],
  "status": "active",
  "beneficiary": {
    "reference": "Patient/123"
  },
  "payor": [{
    "reference": "Organization/bupa"
  }],
  "class": [{
    "type": {
      "coding": [{
        "code": "group"
      }]
    },
    "value": "GROUP-A"
  }]
}
```

**Required Fields:**
- `identifier` - Policy number
- `status` - active/cancelled
- `beneficiary` - Patient reference
- `payor` - Insurance organization

---

### Claim

**Purpose:** Billing claim for services rendered.

**Key Elements:**
```json
{
  "resourceType": "Claim",
  "identifier": [{
    "system": "http://provider.com/claim",
    "value": "CLM-2024-001"
  }],
  "status": "active",
  "type": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/claim-type",
      "code": "institutional"
    }]
  },
  "use": "claim",
  "patient": {
    "reference": "Patient/123"
  },
  "created": "2024-01-15",
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
  "diagnosis": [...],
  "procedure": [...],
  "item": [...]
}
```

**Required Fields:**
- `identifier` - Claim number
- `status` - active
- `type` - institutional/professional
- `patient` - Patient reference
- `provider` - Provider organization
- `insurance` - Coverage reference
- `diagnosis` - ICD-10 codes
- `item` - Service line items

---

### ClaimResponse

**Purpose:** Payer response to a claim.

**Key Elements:**
```json
{
  "resourceType": "ClaimResponse",
  "identifier": [{
    "value": "RSP-2024-001"
  }],
  "status": "active",
  "type": {
    "coding": [{
      "code": "institutional"
    }]
  },
  "use": "claim",
  "patient": {
    "reference": "Patient/123"
  },
  "created": "2024-01-16",
  "insurer": {
    "reference": "Organization/payer"
  },
  "outcome": "complete",
  "adjudication": [...],
  "item": [...]
}
```

**Outcome Values:**
- `queued` - Pending processing
- `complete` - Adjudication complete
- `error` - Processing error
- `partial` - Partial processing

---

### Encounter

**Purpose:** Patient visit/admission record.

**Key Elements:**
```json
{
  "resourceType": "Encounter",
  "identifier": [{
    "value": "ENC-2024-001"
  }],
  "status": "finished",
  "class": {
    "code": "IMP",
    "display": "inpatient"
  },
  "type": [{
    "coding": [{
      "code": "185349003",
      "display": "Encounter for check up"
    }]
  }],
  "subject": {
    "reference": "Patient/123"
  },
  "period": {
    "start": "2024-01-10",
    "end": "2024-01-15"
  },
  "diagnosis": [...]
}
```

---

### Observation

**Purpose:** Clinical observations and results.

**Key Elements:**
```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "laboratory"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "2339-0",
      "display": "Glucose"
    }]
  },
  "subject": {
    "reference": "Patient/123"
  },
  "valueQuantity": {
    "value": 95,
    "unit": "mg/dL"
  }
}
```

---

### Procedure

**Purpose:** Clinical procedure performed.

**Key Elements:**
```json
{
  "resourceType": "Procedure",
  "status": "completed",
  "code": {
    "coding": [{
      "system": "http://www.ama-assn.org/go/cpt",
      "code": "27447",
      "display": "Total knee replacement"
    }]
  },
  "subject": {
    "reference": "Patient/123"
  },
  "performedDateTime": "2024-01-12"
}
```

---

## NPHIES-Specific Profiles

### Saudi Extensions

**Patient Extensions:**
- `nationality` - Country code
- `occupation` - Employment code
- `educationLevel` - Education code

**Coverage Extensions:**
- `policyHolder` - Employer info
- `classOfBusiness` - Insurance class

**Claim Extensions:**
- `episodeSequence` - Episode number
- `careType` - Type of care

---

## Code Systems

### Diagnosis Codes

**System:** `http://hl7.org/fhir/sid/icd-10-am`

```json
{
  "coding": [{
    "system": "http://hl7.org/fhir/sid/icd-10-am",
    "code": "J06.9",
    "display": "Acute upper respiratory infection"
  }]
}
```

### Procedure Codes

**ACHI System:** `http://terminology.hl7.org/CodeSystem/achi`

**CPT System:** `http://www.ama-assn.org/go/cpt`

### Service Codes

**HCPCS System:** `http://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets`

---

## Bundle Structure

### Claim Submission Bundle

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Claim",
        ...
      }
    },
    {
      "resource": {
        "resourceType": "Patient",
        ...
      }
    },
    {
      "resource": {
        "resourceType": "Coverage",
        ...
      }
    },
    {
      "resource": {
        "resourceType": "Encounter",
        ...
      }
    }
  ]
}
```

---

## Validation Rules

### Common Errors

| Error | Description | Resolution |
|-------|-------------|------------|
| INVALID_CODE | Code not in system | Use valid code |
| MISSING_FIELD | Required field missing | Add field |
| INVALID_REFERENCE | Reference not found | Fix reference |
| DATE_FORMAT | Invalid date format | Use YYYY-MM-DD |
| CARDINALITY | Wrong number of elements | Check min/max |

### Validation Tools

- HAPI FHIR Validator
- NPHIES Sandbox
- BrainSAIT Validator (ClaimLinc)

---

## Best Practices

### Resource Creation

1. Use correct identifiers
2. Include all required fields
3. Use proper code systems
4. Validate before submission

### Coding Accuracy

1. Use most specific code
2. Include all relevant diagnoses
3. Sequence appropriately
4. Add supporting codes

### Bundle Assembly

1. Include all referenced resources
2. Use proper bundle type
3. Validate complete bundle
4. Check resource ordering

---

## Related Documents

- [NPHIES Overview](overview.md)
- [API Reference](api_reference.md)
- [Workflows](workflows.md)
- [Automation Pipeline](../claims/automation_pipeline.md)

---

*Last updated: January 2025*
