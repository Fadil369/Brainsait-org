---
title: "Deal Tracking"
description: "BrainSAIT healthcare sales pipeline and opportunity management"
template_id: "deal_tracking_template"
category: "sales"
language: "en"
version: "2.0"
last_updated: "2025-12-31"
tags:
  - template
  - sales
  - pipeline
  - healthcare
---

# Deal Tracking

<div class="template-meta" markdown>
**Category:** Sales | **Version:** 2.0 | **Status:** Active
</div>

## Overview

Track BrainSAIT healthcare sales opportunities from qualification through closed-won, with focus on enterprise hospitals, mid-market health systems, and SME clinics across Saudi Arabia.

---

## Channel Structure

### Deal-Specific Channels

| Channel | Purpose | Example |
|---------|---------|---------|
| `#deal-[customer]-[stage]` | Active deal collaboration | `#deal-kfsh-negotiation` |
| `#rfp-[customer]` | RFP response coordination | `#rfp-moh-claims-2025` |

### Sales Team Channels

| Channel | Purpose |
|---------|---------|
| `#deals-pipeline` | All active opportunities |
| `#customer-wins` | Closed-won celebrations 🎉 |
| `#competitive-intel` | Competitor updates and battlecards |
| `#sales-enablement` | Training and resources |
| `#pricing-approvals` | Deal desk requests |

---

## Pipeline Stages

| Stage | Entry Criteria | Exit Criteria | Probability |
|-------|----------------|---------------|-------------|
| **Qualification** | Initial meeting | BANT qualified | 10% |
| **Discovery** | Pain points identified | Requirements documented | 25% |
| **Demo/POC** | Demo scheduled | POC completion | 40% |
| **Proposal** | Proposal requested | Proposal submitted | 60% |
| **Negotiation** | Verbal intent | Terms agreed | 80% |
| **Closed-Won** | Contract signed | Revenue recognized | 100% |

### Customer Segments

| Segment | Criteria | Deal Size | Sales Cycle |
|---------|----------|-----------|-------------|
| **Enterprise** | 200+ beds | 500K+ SAR | 6-12 months |
| **Mid-Market** | 50-200 beds | 100-500K SAR | 3-6 months |
| **SME** | <50 beds | 20-100K SAR | 1-3 months |

---

## Deal Qualification (BANT+)

```markdown
## Deal Qualification Scorecard

**Opportunity:** [Customer Name]
**AE:** @[name]

### Budget (0-25 points)

- [ ] Budget identified: _____ SAR
- [ ] Budget holder confirmed
- [ ] Fiscal year timing favorable

**Score:** [X]/25

### Authority (0-25 points)

- [ ] Economic buyer identified
- [ ] Technical buyer engaged
- [ ] Champion confirmed

**Score:** [X]/25

### Need (0-25 points)

- [ ] Pain points quantified (rejection rate, manual work)
- [ ] NPHIES compliance gaps identified
- [ ] ROI drivers clear

**Score:** [X]/25

### Timeline (0-25 points)

- [ ] Decision date confirmed
- [ ] Compelling event identified
- [ ] No blocking dependencies

**Score:** [X]/25

### Total: [X]/100

- 80+: High priority
- 60-79: Standard pursuit
- 40-59: Nurture
- <40: Disqualify
```

### Healthcare Discovery Questions

1. **Claims Volume**: Monthly claims through NPHIES?
2. **Rejection Rate**: Current first-pass rejection rate?
3. **Payer Mix**: Largest payers? (Bupa, Tawuniya, Medgulf?)
4. **EMR/HIS**: Current clinical system? (Cloudpital, Epic, Cerner?)
5. **RCM Team**: FTEs handling claims and denials?
6. **Pain Points**: Where do you lose most time/money?

---

## Key Messages

### New Opportunity

> 🎯 **New Opportunity: [Customer Name]**
>
> **Segment:** [Enterprise/Mid-Market/SME]
> **Value:** [X] SAR
> **Products:** ClaimLinc, PolicyLinc, DocsLinc
>
> **Details:**
>
> - 🏥 [X]-bed hospital / [X] monthly claims
> - 📊 Current rejection rate: [X]%
> - 🎯 Decision timeline: [Date]
> - 👤 Champion: [Name, Title]
>
> **Compelling Event:** [Why now?]
>
> cc: @sales-team @[manager]

### Stage Change

```markdown
## 🔄 Stage Change: [Customer Name]

**Stage:** [Previous] → [New]
**Probability:** [X]% → [Y]%
**Expected Close:** [Date]
**Value:** [X] SAR

### What Changed

[Key developments]

### Stakeholders

| Role | Name | Sentiment |
|------|------|-----------|
| Economic Buyer | [Name] | 🟢/🟡/🔴 |
| Champion | [Name] | 🟢/🟡/🔴 |

### Risks

- [Risk and mitigation]

### Support Needed

- [ ] [Request] from @[person]
```

### Closed Won

> 🎉 **CLOSED WON: [Customer Name]!**
>
> **Value:** [X] SAR ([X]-year contract)
> **Products:** ClaimLinc, PolicyLinc, DocsLinc
>
> **Why BrainSAIT:**
>
> - ✅ [Differentiator 1]
> - ✅ [Differentiator 2]
>
> **Expected Impact:**
>
> - 🎯 50% rejection reduction
> - ⏱️ <2 min processing time
> - 💰 ROI in 90 days
>
> **Team:** @[AE] @[SE] @[Exec Sponsor]
>
> Implementation kickoff: [Date] 🙌

---

## Competitive Intelligence

### Key Competitors

| Competitor | Strengths | Weaknesses | Win Strategy |
|------------|-----------|------------|--------------|
| Legacy RCM | Relationships | No AI, slow | Speed + innovation |
| Local Vendors | Price | Limited tech | AI + scale |
| International | Brand | No local expertise | NPHIES + Arabic |

### Win Themes

```
vs. Traditional RCM:
→ "AI-powered, not just automation"
→ "4-8 week implementation vs. 6+ months"

vs. Local Vendors:
→ "Enterprise-grade AI platform"
→ "Proven 98% clean claim rate"

vs. International:
→ "Built for Saudi healthcare"
→ "Native NPHIES integration"
→ "Arabic-first"
```

---

## Pricing

| Product | Monthly Price |
|---------|---------------|
| ClaimLinc | 1,500 SAR |
| PolicyLinc | 800 SAR |
| DocsLinc | 600 SAR |
| RadioLinc | 2,000 SAR |
| Voice2Care | 500 SAR |
| DataLinc | 600 SAR |
| SecUnit | 800 SAR |

### Discount Approval

| Discount | Approver | Turnaround |
|----------|----------|------------|
| 0-10% | AE | Immediate |
| 11-20% | Sales Manager | 24 hours |
| 21-30% | VP Sales | 48 hours |
| 31%+ | CEO | Case by case |

---

## Weekly Forecast

```markdown
## Weekly Forecast - [Date]

### Pipeline Summary

| Stage | Count | Value (SAR) | Weighted |
|-------|-------|-------------|----------|
| Qualification | [X] | [X] | [X] |
| Discovery | [X] | [X] | [X] |
| Demo/POC | [X] | [X] | [X] |
| Proposal | [X] | [X] | [X] |
| Negotiation | [X] | [X] | [X] |
| **Total** | **[X]** | **[X]** | **[X]** |

### Commit (This Month)

| Customer | Value | Close Date | Confidence |
|----------|-------|------------|------------|
| [Name] | [X] | [Date] | High/Med/Low |

### At Risk

| Customer | Value | Issue | Recovery Plan |
|----------|-------|-------|---------------|
| [Name] | [X] | [Why] | [Action] |
```

---

## Integration Points

- **CRM**: Opportunity tracking
- **Notion**: Account plans
- **DataLinc**: Customer analytics
- **Calendar**: Meeting scheduling

---

<div class="template-footer" markdown>
*BrainSAIT Deal Tracking v2.0 | Healthcare Intelligence, Delivered*
</div>
