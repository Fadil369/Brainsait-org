---
title: "CRM & Sales Pipeline"
description: "BrainSAIT customer relationship management and healthcare sales tracking"
template_id: "slack_crm_template"
category: "sales"
language: "en"
version: "2.0"
last_updated: "2025-12-31"
tags:
  - template
  - sales
  - crm
  - healthcare
---

# CRM & Sales Pipeline

<div class="template-meta" markdown>
**Category:** Sales | **Version:** 2.0 | **Status:** Active
</div>

## Overview

Centralize BrainSAIT customer relationship management—track accounts, contacts, interactions, and customer health across hospitals, clinics, and insurance organizations in Saudi Arabia.

---

## Channel Structure

### CRM Channels

| Channel | Purpose | Members |
|---------|---------|---------|
| `#accounts-enterprise` | Tier 1 hospital accounts (200+ beds) | AEs + CSMs |
| `#accounts-midmarket` | Tier 2 accounts (50-200 beds) | AEs + CSMs |
| `#accounts-sme` | Tier 3 clinics and small practices | AEs + Partners |
| `#customer-intel` | Account research and insights | Sales + Marketing |
| `#renewals` | Upcoming renewals and expansion | CSMs + Sales |

### Customer-Specific Channels

| Pattern | Purpose |
|---------|---------|
| `#acct-[customer]` | Dedicated account channel |
| `#acct-[customer]-executive` | Executive relationship channel |

---

## Account Tiers

| Tier | Criteria | Value | Team |
|------|----------|-------|------|
| **Enterprise** | 200+ beds, 10K+ monthly claims | 500K+ SAR | Named AE + CSM |
| **Mid-Market** | 50-200 beds, 2-10K claims | 100-500K SAR | Named AE |
| **SME** | <50 beds, <2K claims | 20-100K SAR | Partner/pooled |

### Account Health Scoring

| Score | Status | Criteria | Action |
|-------|--------|----------|--------|
| 🟢 90-100 | Healthy | High adoption, expanding, advocate | Upsell, reference |
| 🟡 70-89 | Stable | Steady usage, neutral sentiment | Engage, prevent churn |
| 🟠 50-69 | At Risk | Low adoption, issues reported | Intervention plan |
| 🔴 <50 | Critical | Churn signals, escalations | Executive engagement |

---

## Account Templates

### New Account Setup

```markdown
## New Account: [Customer Name]

**Account ID:** ACCT-[XXXX]
**Tier:** Enterprise / Mid-Market / SME
**Created:** [Date]

### Account Profile

- **Type:** Hospital / Clinic / Insurance / TPA
- **Size:** [X] beds / [X] monthly claims
- **Location:** [City], Saudi Arabia
- **Industry Segment:** [Government / Private / Academic]

### Products Deployed

| Agent | Status | Go-Live | Monthly Usage |
|-------|--------|---------|---------------|
| ClaimLinc | Active | [Date] | [X] claims |
| PolicyLinc | Active | [Date] | [X] verifications |
| DocsLinc | Pending | [Date] | - |

### Key Stakeholders

| Name | Title | Role | Contact |
|------|-------|------|---------|
| [Name] | CIO | Executive Sponsor | [Email] |
| [Name] | RCM Director | Champion | [Email] |
| [Name] | IT Manager | Technical | [Email] |

### Contract Details

- **Start Date:** [Date]
- **End Date:** [Date]
- **ACV:** [X] SAR
- **Payment Terms:** [Terms]

### Success Metrics

| Metric | Baseline | Current | Target |
|--------|----------|---------|--------|
| Clean Claim Rate | [X]% | [X]% | 98% |
| Rejection Rate | [X]% | [X]% | <3% |
| Processing Time | [X] min | [X] min | <2 min |
```

### Account Health Check

```markdown
## Account Health Check - [Customer Name]

**Date:** [Date]
**Health Score:** [X]/100 🟢/🟡/🟠/🔴

### Usage Metrics (Last 30 Days)

| Metric | Value | Trend |
|--------|-------|-------|
| Claims Processed | [X] | ↑/↓/→ |
| Active Users | [X] | ↑/↓/→ |
| API Calls | [X] | ↑/↓/→ |
| Support Tickets | [X] | ↑/↓/→ |

### Product Adoption

| Agent | Adoption | Notes |
|-------|----------|-------|
| ClaimLinc | [X]% | [Notes] |
| PolicyLinc | [X]% | [Notes] |
| DocsLinc | [X]% | [Notes] |

### Sentiment Indicators

- [ ] NPS Score: [X]
- [ ] CSAT: [X]/5
- [ ] Executive engagement: Active / Declining
- [ ] Reference willingness: Yes / No / Maybe

### Risk Factors

- [ ] [Risk 1]
- [ ] [Risk 2]

### Recommended Actions

1. [Action] - Owner: @[name] - Due: [Date]
```

---

## Key Messages

### Account Update

> 📊 **Account Update: [Customer Name]**
>
> **Health Score:** [X]/100 🟢/🟡/🟠/🔴
>
> **Recent Activity:**
>
> - [Activity 1]
> - [Activity 2]
>
> **Key Metrics:**
>
> - Claims this month: [X] (+/-[X]%)
> - Clean claim rate: [X]%
> - Active users: [X]
>
> **Next Steps:**
>
> - [ ] [Action] - @[owner]

### Renewal Alert

> 🔔 **Renewal Alert: [Customer Name]**
>
> **Renewal Date:** [Date] ([X] days away)
> **Current ACV:** [X] SAR
> **Proposed ACV:** [X] SAR
>
> **Account Health:** 🟢/🟡/🟠/🔴
>
> **Expansion Opportunities:**
>
> - [ ] Add DocsLinc: +[X] SAR
> - [ ] Add RadioLinc: +[X] SAR
> - [ ] Volume increase: +[X] SAR
>
> **Risks:**
>
> - [Any concerns]
>
> **Next Steps:**
>
> - [ ] QBR scheduled: [Date]
> - [ ] Renewal proposal sent: [Date]

### Customer Win Story

```markdown
## Customer Success Story: [Customer Name]

**Industry:** [Hospital / Clinic / Insurance]
**Size:** [X] beds / [X] monthly claims
**Region:** [City], Saudi Arabia

### Challenge

[Describe the customer's initial challenges - high rejection rates,
manual processing, NPHIES compliance issues, etc.]

### Solution

**Products Deployed:** ClaimLinc, PolicyLinc, DocsLinc

**Implementation Highlights:**

- Timeline: [X] weeks
- Integration: [EMR/HIS system]
- Training: [X] users

### Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Clean Claim Rate | [X]% | [X]% | +[X]% |
| Rejection Rate | [X]% | [X]% | -[X]% |
| Processing Time | [X] min | [X] sec | -[X]% |
| Manual Review | [X]% | [X]% | -[X]% |

### Customer Quote

> "[Quote from customer about BrainSAIT impact]"
>
> — [Name], [Title], [Customer Name]

### Referenceable?

- [ ] Case study approved
- [ ] Reference call available
- [ ] Logo usage approved
```

---

## Sales Process Integration

### Lead to Customer Lifecycle

```
1. Lead Generated (Marketing)
    ↓
2. Qualified (Sales)
    ↓
3. Opportunity Created → Deal Tracking
    ↓
4. Closed Won → Account Created
    ↓
5. Implementation → Customer Onboarding
    ↓
6. Go-Live → CRM Active Management
    ↓
7. Renewal/Expansion → Sales Cycle
```

### Account Planning

```markdown
## Account Plan: [Customer Name]

**FY Target:** [X] SAR
**Current ACV:** [X] SAR
**Whitespace:** [X] SAR

### Growth Opportunities

| Opportunity | Value | Timeline | Probability |
|-------------|-------|----------|-------------|
| Add DocsLinc | [X] SAR | Q[X] | [X]% |
| Volume increase | [X] SAR | Q[X] | [X]% |
| New department | [X] SAR | Q[X] | [X]% |

### Relationship Map

| Stakeholder | Relationship | Strategy |
|-------------|--------------|----------|
| [Name] - CIO | Strong | Maintain as champion |
| [Name] - CFO | Neutral | Build ROI case |
| [Name] - CMO | Unknown | Introduce RadioLinc |

### Competitive Threats

- [Threat 1 and mitigation]

### Action Plan

1. [Action] - Owner - Due
```

---

## Integration Points

- **CRM System**: Account records, opportunity sync
- **DataLinc**: Usage analytics, health scores
- **Notion**: Account plans, success stories
- **Calendar**: QBR and check-in scheduling

---

<div class="template-footer" markdown>
*BrainSAIT CRM & Sales Pipeline v2.0 | Healthcare Intelligence, Delivered*
</div>
