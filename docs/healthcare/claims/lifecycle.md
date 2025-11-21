---
title: Claims Lifecycle Management
description: Complete guide to healthcare claims lifecycle in Saudi Arabia, from patient registration through NPHIES submission to payment settlement and rejection handling.
---

# Claims & Reimbursement

## 2.1. Claim Lifecycle

1. **Registration**: Patient registration and eligibility check.
2. **Encounter documentation**: Clinical documentation of the visit.
3. **Coding**: Assigning ICD-10-AM and ACHI codes.
4. **Submission**: Sending the claim via NPHIES.
5. **Adjudication**: Payer review process.
6. **Rejection**: Handling denied claims.
7. **Resubmission**: Correcting and resending claims.
8. **Settlement**: Final payment and reconciliation.

## 2.2. Rejection Classification

- **Administrative**: Missing info, invalid ID.
- **Clinical**: Medical necessity, inconsistent diagnosis.
- **Eligibility**: Expired coverage, uncovered service.
- **Technical**: FHIR validation errors.
- **Coding-related**: Incorrect codes or modifiers.
- **Duplicate**: Claim already submitted.

## 2.3. Resubmission Best Practices

- Validate FHIR bundle
- Correct coding
- Add missing attachments
- Include clinical justification
- Follow payer-specific rules (Bupa/Tawuniya/GlobeMed)
