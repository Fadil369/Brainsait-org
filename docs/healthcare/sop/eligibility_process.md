# Eligibility Verification Process SOP

## Purpose

To establish a standardized process for verifying patient insurance eligibility and benefits before service delivery, ensuring accurate patient responsibility communication and minimizing claim denials.

---

## Scope

This SOP applies to all patient access staff, registration personnel, and revenue cycle team members involved in patient eligibility verification.

---

## Roles and Responsibilities

| Role | Responsibilities |
|------|------------------|
| Registration Staff | Initial eligibility verification |
| Patient Access Manager | Process oversight, exception handling |
| Revenue Cycle Analyst | Eligibility reporting, denial analysis |
| IT Support | System maintenance, integration support |

---

## Definitions

- **Eligibility** - Patient's insurance coverage status on the date of service
- **Benefits** - Specific services covered under the patient's plan
- **Copay** - Fixed amount patient pays at service
- **Coinsurance** - Percentage patient pays after deductible
- **Deductible** - Amount patient pays before insurance coverage begins

---

## Step-by-Step Process

### Step 1: Collect Insurance Information

**When:** At scheduling or registration

**Actions:**
1. Obtain insurance card (front and back)
2. Record all identifiers:
   - Member ID
   - Group number
   - Payer name
   - Plan type
3. Verify patient name matches card
4. Note effective dates

**System Entry:**
- Enter in HIS/PMS registration
- Scan card images
- Flag incomplete information

---

### Step 2: Verify Eligibility via NPHIES

**When:** Minimum 24 hours before service (scheduled) or at time of service (walk-in)

**Actions:**
1. Access NPHIES portal or integrated system
2. Submit eligibility inquiry:
   - Patient identifier
   - Date of service
   - Service category (optional)
3. Review response:
   - Coverage status
   - Effective dates
   - Network status

**Decision Points:**

| Response | Action |
|----------|--------|
| Active, In-network | Proceed to benefits |
| Active, Out-of-network | Verify OON benefits, inform patient |
| Inactive | Verify with patient, check alternate coverage |
| Not found | Call payer, manual verification |

---

### Step 3: Verify Benefits

**When:** After confirming eligibility

**Actions:**
1. Query specific benefits for planned services
2. Check:
   - Service category coverage
   - Prior authorization requirements
   - Benefit limits (annual, lifetime)
   - Exclusions
3. Record benefit details in system

**Key Benefits to Verify:**

- [ ] Inpatient coverage
- [ ] Outpatient surgery
- [ ] Diagnostic imaging
- [ ] Laboratory services
- [ ] Physical therapy
- [ ] Prescription coverage

---

### Step 4: Calculate Patient Responsibility

**When:** After benefits verification

**Actions:**
1. Determine applicable:
   - Deductible remaining
   - Copay amounts
   - Coinsurance percentage
   - Out-of-pocket maximum status
2. Estimate patient responsibility
3. Document calculation

**Formula:**
```
Patient Responsibility =
  Deductible (if not met) +
  Copay +
  (Allowed Amount - Deductible) × Coinsurance Rate
```

---

### Step 5: Communicate with Patient

**When:** Before or at service

**Actions:**
1. Explain coverage status
2. Provide cost estimate
3. Discuss payment options:
   - Payment at service
   - Payment plan
   - Financial assistance
4. Obtain patient acknowledgment
5. Document communication

**Required Disclosures:**
- Services not covered
- Out-of-network implications
- Prior authorization requirements
- Estimated patient responsibility

---

### Step 6: Document and Flag

**When:** After verification complete

**Actions:**
1. Update patient account:
   - Eligibility status
   - Benefits summary
   - Patient responsibility estimate
   - Verification date/time
2. Flag accounts for:
   - Prior authorization needed
   - Benefits limitations
   - Payment collection
   - Special handling

---

### Step 7: Handle Exceptions

**Scenarios and Actions:**

**Scenario A: No Coverage Found**
1. Verify information accuracy
2. Check for alternate payers
3. Discuss self-pay options
4. Offer financial counseling

**Scenario B: Prior Auth Required**
1. Initiate auth request process
2. Inform patient of timeline
3. Document auth requirement
4. Follow up on approval

**Scenario C: Benefit Limit Reached**
1. Calculate remaining benefit
2. Estimate patient portion
3. Discuss options with patient
4. Document for claim notation

---

## Quality Assurance

### Daily Checks

- [ ] All scheduled patients verified
- [ ] Exceptions documented
- [ ] Prior auths initiated

### Weekly Metrics

| Metric | Target |
|--------|--------|
| Verification rate | 100% scheduled |
| Pre-service completion | > 95% |
| Eligibility-related denials | < 2% |

### Monthly Review

- Denial analysis for eligibility issues
- Process improvement identification
- Staff training needs
- System enhancement requests

---

## System Integration

### NPHIES Connection

- Real-time eligibility queries
- Automated response processing
- Alert generation

### HIS/PMS Integration

- Patient demographic sync
- Coverage data storage
- Benefit documentation

### BrainSAIT ClaimLinc

- Eligibility validation in claim workflow
- Denial prevention alerts
- Automated re-verification

---

## KPIs

| Indicator | Target | Measurement |
|-----------|--------|-------------|
| Pre-service verification rate | 100% | Scheduled patients verified before DOS |
| Eligibility denial rate | < 2% | Eligibility denials / Total claims |
| Patient estimate accuracy | > 90% | Actual vs. estimated within 10% |
| Re-verification turnaround | < 24 hrs | Time from request to completion |

---

## Exceptions and Escalation

### Exception Handling

| Exception | Handler | Resolution Time |
|-----------|---------|-----------------|
| System downtime | IT Support | Immediate |
| Complex benefits | Supervisor | Same day |
| Patient disputes | Manager | 24 hours |

### Escalation Path

1. Staff → Supervisor
2. Supervisor → Manager
3. Manager → Director (if regulatory/legal)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-01 | RCM Team | Initial version |
| 1.1 | 2024-06-01 | RCM Team | NPHIES integration updates |

---

## Related Documents

- [Claim Submission SOP](claim_submission.md)
- [Compliance SOP](compliance_sop.md)
- [Claim Lifecycle](../claims/lifecycle.md)
- [NPHIES Workflows](../nphies/workflows.md)

---

*Last updated: January 2025*
