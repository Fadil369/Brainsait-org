---
title: Claim Submission SOP
domain: healthcare
chapter: sop
version: 1.0.0
last_updated: 2025-01-15
---

# Standard Operating Procedure: Claim Submission

## Purpose

This SOP defines the standardized process for submitting healthcare claims through NPHIES using BrainSAIT automation.

## Scope

Applies to all claim submissions for:
- Inpatient services
- Outpatient services
- Emergency services
- Pharmacy claims
- Dental services

## Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| Clinical Staff | Complete accurate clinical documentation |
| Medical Coder | Assign appropriate ICD-10-AM and ACHI codes |
| Billing Specialist | Review and submit claims |
| RCM Manager | Monitor submission metrics and resolve issues |
| IT Support | Maintain system integrations |

## Prerequisites

- [ ] Patient registered in system
- [ ] Insurance eligibility verified
- [ ] Clinical documentation complete
- [ ] Prior authorization obtained (if required)
- [ ] BrainSAIT agents configured

## Step-by-Step Process

### Step 1: Validate Encounter Completeness

**Action**: Ensure all required clinical documentation is present

**Using DocsLinc**:
```python
# Validate documentation completeness
completeness_check = await DocsLinc.validate_documentation(
    encounter_id=encounter.id,
    payer_id=patient.insurance.payer_id
)

if not completeness_check.is_complete:
    # Alert clinical staff
    notify_clinical_staff(
        missing_items=completeness_check.missing_items
    )
    return
```

**Required Elements**:
- Chief complaint
- History of present illness
- Physical examination findings
- Diagnosis
- Treatment plan
- Procedures performed
- Medications prescribed
- Discharge/follow-up instructions

**Quality Check**: Documentation must support medical necessity

---

### Step 2: Generate FHIR Bundle

**Action**: Convert encounter data to FHIR R4 format

```python
# Generate FHIR claim bundle
claim_bundle = await generate_fhir_bundle(
    encounter=encounter,
    patient=patient,
    insurance=insurance_info,
    procedures=procedures,
    diagnoses=diagnoses
)
```

**Bundle Components**:
- Claim resource
- Patient resource
- Coverage resource
- Encounter resource
- Procedure resources
- Diagnosis resources
- Supporting documentation

---

### Step 3: Run ClaimLinc Validation

**Action**: Pre-validate claim before submission

```python
# Validate with ClaimLinc
validation_result = await ClaimLinc.validate_claim(
    claim=claim_bundle,
    payer_id=insurance_info.payer_id
)

if not validation_result.is_valid:
    # Review and fix errors
    for error in validation_result.errors:
        log_validation_error(
            claim_id=claim_bundle.id,
            error=error,
            severity=error.severity
        )
    
    # Generate correction report
    correction_report = ClaimLinc.generate_correction_guide(
        validation_result=validation_result
    )
    
    # Notify billing specialist
    send_notification(
        to=billing_specialist,
        subject="Claim Validation Failed",
        body=correction_report
    )
    
    return
```

**Validation Layers**:
1. FHIR schema compliance
2. NPHIES profile requirements
3. Payer-specific rules
4. Clinical coding accuracy
5. Financial calculations

---

### Step 4: Submit to NPHIES

**Action**: Submit validated claim through NPHIES gateway

```python
# Submit claim
submission_result = await nphies_client.submit_claim(
    claim_bundle=claim_bundle,
    provider_id=provider.nphies_id,
    payer_id=insurance_info.payer_id
)

# Log submission
audit_logger.log_submission(
    claim_id=claim_bundle.id,
    submission_id=submission_result.submission_id,
    timestamp=datetime.now(),
    user=current_user,
    status="submitted"
)
```

**Submission Confirmation**:
- Submission ID received
- Timestamp recorded
- Initial validation passed
- Claim status: "Pending Adjudication"

---

### Step 5: Track Payer Response

**Action**: Monitor claim status and handle responses

```python
# Poll for claim status
async def monitor_claim_status(claim_id: str):
    while True:
        status = await nphies_client.get_claim_status(claim_id)
        
        if status.state == "adjudicated":
            # Process EOB
            eob = await nphies_client.get_eob(claim_id)
            process_eob(eob)
            break
        
        elif status.state == "rejected":
            # Trigger rejection workflow
            await handle_rejection(claim_id, status.rejection_reason)
            break
        
        # Wait before next poll
        await asyncio.sleep(300)  # 5 minutes
```

**Status Types**:
- Submitted
- Under Review
- Pended (additional info requested)
- Adjudicated (approved)
- Rejected
- Partially Approved

---

### Step 6: Handle Rejections

**Action**: Analyze and resubmit rejected claims

```python
# Analyze rejection with ClaimLinc
rejection_analysis = await ClaimLinc.analyze_rejection(
    claim_id=claim_id,
    rejection_reason=rejection_reason,
    rejection_code=rejection_code
)

# Generate resubmission package
resubmission_package = await ClaimLinc.generate_resubmission(
    original_claim=original_claim,
    rejection_analysis=rejection_analysis,
    additional_documentation=additional_docs
)

# Resubmit
resubmission_result = await nphies_client.resubmit_claim(
    resubmission_package=resubmission_package
)
```

**Rejection Categories**:
- Administrative errors
- Clinical documentation issues
- Coding errors
- Eligibility problems
- Policy violations
- Technical errors

---

### Step 7: Generate Performance Report

**Action**: Weekly submission performance analysis

```python
# Generate weekly report
report = await generate_submission_report(
    start_date=week_start,
    end_date=week_end,
    metrics=[
        "total_submissions",
        "acceptance_rate",
        "rejection_rate",
        "avg_processing_time",
        "revenue_impact"
    ]
)

# Distribute to stakeholders
send_report(
    recipients=[rcm_manager, billing_team_lead],
    report=report
)
```

**Key Metrics**:
- Total claims submitted
- First-pass acceptance rate
- Rejection rate by category
- Average time to adjudication
- Revenue collected vs. submitted
- Top rejection reasons

---

## Exceptions

### Emergency Claims
- Expedited submission within 24 hours
- Retroactive authorization allowed
- Clinical justification required

### High-Value Claims (>100,000 SAR)
- Additional management review
- Enhanced documentation requirements
- Direct payer communication

### Disputed Claims
- Escalate to RCM Manager
- Prepare appeal documentation
- Consider external review

---

## Key Performance Indicators

| KPI | Target | Measurement Frequency |
|-----|--------|----------------------|
| Clean claim rate | >95% | Daily |
| First-pass acceptance | >90% | Weekly |
| Average submission time | <2 hours | Daily |
| Rejection rate | <5% | Weekly |
| Resubmission success rate | >85% | Weekly |

---

## Training Requirements

- NPHIES platform overview
- FHIR R4 fundamentals
- BrainSAIT agent usage
- Medical coding basics
- Payer policy awareness

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-01-15 | Initial release | BrainSAIT Team |

---

## Related Documentation

- [Claims Lifecycle](../claims/lifecycle.md)
- [ClaimLinc Agent Guide](../agents/index.md)
- [NPHIES Integration](../nphies/overview.md)
- [Rejection Types](../claims/rejection_types.md)
