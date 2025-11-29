---
title: NPHIES Integration Overview
description: Learn about Saudi Arabia's National Platform for Health Information Exchange (NPHIES) and how to integrate using FHIR R4 standards for claims and eligibility.
---

# NPHIES Overview

NPHIES (National Platform for Health and Insurance Exchange Services) is the national platform enabling:

- Claim exchange
- Eligibility checks
- e-Authorizations
- Payment reconciliation

It uses **FHIR R4** as the base standard.

## Required Profiles

- Claim
- Coverage
- ExplanationOfBenefit
- Encounter
- Observation
- Procedure

## FHIR Validation

A single failed field can reject the entire claim.

## Cloudpital + BrainSAIT NPHIES Solution

**Cloudpital** provides NPHIES-certified EMR and RCM capabilities, while **BrainSAIT** adds AI-powered intelligence for claim optimization and automation.

### Unified Architecture

```mermaid
graph TB
    subgraph "Cloudpital Platform"
        A[EMR Module]
        B[RCM Module]
        C[NPHIES Gateway]
    end

    subgraph "BrainSAIT AI Layer"
        D[ClaimLinc<br/>Validation]
        E[PolicyLinc<br/>Eligibility]
        F[DocsLinc<br/>Documents]
    end

    subgraph "NPHIES Platform"
        G[Eligibility API]
        H[Pre-Auth API]
        I[Claims API]
    end

    A -->|Encounter Data| D
    B -->|Draft Claims| D
    D -->|Validated Claims| C
    C -->|FHIR Bundle| I

    A -->|Patient Insurance| E
    E -->|Coverage Check| C
    C -->|Eligibility Request| G

    A -->|Clinical Docs| F
    F -->|FHIR Documents| C
    C -->|Attachments| H
```

### Integration Benefits

| Feature | Cloudpital Only | + BrainSAIT AI |
|---------|-----------------|----------------|
| **Clean Claim Rate** | 92-94% | 98%+ |
| **Denial Rate** | 6-8% | <3% |
| **Processing Time** | 5-10 min | <2 min |
| **Manual Review** | 25% | <5% |
| **Cost per Claim** | 15 SAR | 8 SAR |

### Key Capabilities

1. **Pre-Submission Validation** - ClaimLinc validates all FHIR resources before submission
2. **Real-Time Eligibility** - PolicyLinc enhances Cloudpital's eligibility with AI predictions
3. **Document Intelligence** - DocsLinc extracts clinical data for NPHIES attachments
4. **Denial Prevention** - Predictive analytics identify issues before submission
5. **Automated Resubmission** - Intelligent correction and auto-retry for denials

### Getting Started

See the comprehensive [Cloudpital NPHIES Integration Guide](../cloudpital/nphies_integration.md) for:
- Detailed API workflows
- FHIR resource examples
- BrainSAIT integration code
- Best practices and troubleshooting
