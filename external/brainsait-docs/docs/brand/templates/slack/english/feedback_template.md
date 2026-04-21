---
title: "Feedback Collection"
description: "BrainSAIT customer and product feedback management"
template_id: "feedback_template"
category: "product"
language: "en"
version: "2.0"
last_updated: "2025-12-31"
tags:
  - template
  - feedback
  - product
  - customer-voice
---

# Feedback Collection

<div class="template-meta" markdown>
**Category:** Product | **Version:** 2.0 | **Status:** Active
</div>

## Overview

Collect, analyze, and act on feedback from BrainSAIT customers, partners, and internal teams to improve our healthcare AI agents and platform experience.

---

## Channel Structure

### Feedback Channels

| Channel | Purpose | Sources |
|---------|---------|---------|
| `#customer-feedback` | All customer feedback | CSMs, Support, Sales |
| `#product-feedback` | Feature requests and improvements | All teams |
| `#nps-responses` | NPS survey responses | Automated |
| `#feature-requests` | Validated feature requests | Product team |
| `#voice-of-customer` | Customer quotes and insights | All customer-facing |

### Analysis Channels

| Channel | Purpose |
|---------|---------|
| `#feedback-weekly` | Weekly feedback digest |
| `#feedback-action` | Items requiring action |

---

## Feedback Types

### Customer Feedback Categories

| Category | Description | Owner | SLA |
|----------|-------------|-------|-----|
| **Bug Report** | Product defect | Engineering | P1: 24h, P2: 48h |
| **Feature Request** | New capability | Product | Monthly review |
| **UX Issue** | Usability problem | Design + Product | Quarterly |
| **Performance** | Speed, reliability | Engineering | P1: 24h |
| **Support Experience** | Service quality | CS Leadership | Weekly |
| **Praise** | Positive feedback | Marketing | Share monthly |

### Agent-Specific Feedback

| Agent | Common Feedback Areas |
|-------|----------------------|
| **ClaimLinc** | Validation accuracy, rule coverage, NPHIES handling |
| **PolicyLinc** | Payer coverage, response time, eligibility accuracy |
| **DocsLinc** | OCR quality, extraction accuracy, Arabic support |
| **Voice2Care** | Intent recognition, Arabic dialect, call quality |
| **Platform** | Performance, UI/UX, integrations |

---

## Feedback Submission

### Customer Feedback Template

```markdown
## Customer Feedback

**Submitted By:** @[csm/support/sales name]
**Date:** [Date]
**Customer:** [Customer Name]
**Customer Tier:** Enterprise / Mid-Market / SME

### Feedback Details

**Type:** Bug / Feature Request / UX / Performance / Praise
**Agent:** ClaimLinc / PolicyLinc / DocsLinc / Platform
**Severity:** Critical / High / Medium / Low

### Verbatim Quote

> "[Exact customer words]"
>
> — [Name], [Title]

### Context

- What were they trying to do?
- What happened?
- What was the impact?

### Customer Sentiment

- Overall satisfaction: 😡 😕 😐 🙂 😀
- Likely to recommend: [1-10]
- Account health impact: None / Minor / Significant

### Suggested Solution (if any)

[Customer's suggested fix or workaround]

### Internal Notes

[Any additional context not to share with customer]
```

### Feature Request Template

```markdown
## Feature Request

**Request ID:** FR-[XXXX]
**Submitted:** [Date]
**Source:** Customer / Internal / Partner

### Request Summary

[One-line description]

### Detailed Description

[Full description of the requested feature]

### Use Case

**As a** [user type]
**I want to** [action]
**So that** [benefit]

### Customer Impact

| Factor | Score (1-5) |
|--------|-------------|
| Revenue impact | [X] |
| Customer breadth | [X] |
| Competitive need | [X] |
| Churn prevention | [X] |
| **Total Score** | **[X]** |

### Customers Requesting

| Customer | Tier | Notes |
|----------|------|-------|
| [Name] | [Tier] | [Context] |

### Alternatives Considered

- [Alternative 1]: Why not suitable
- [Alternative 2]: Why not suitable

### Priority Recommendation

[ ] P1 - Critical: Address immediately
[ ] P2 - High: Next quarter
[ ] P3 - Medium: Roadmap consideration
[ ] P4 - Low: Backlog
```

---

## Key Messages

### Feedback Acknowledgment

> 📝 **Feedback Received**
>
> **From:** [Customer Name]
> **Type:** [Category]
> **Agent:** [Agent name]
>
> **Summary:** [Brief description]
>
> **Next Steps:**
>
> - [ ] Logged in feedback system
> - [ ] Assigned to: @[product/engineering]
> - [ ] Customer notified: Yes/Pending
>
> cc: @[csm] @[product-team]

### Weekly Feedback Digest

```markdown
## Weekly Feedback Digest - Week [X]

### Summary

| Category | Count | Trend |
|----------|-------|-------|
| Bug Reports | [X] | ↑/↓/→ |
| Feature Requests | [X] | ↑/↓/→ |
| UX Issues | [X] | ↑/↓/→ |
| Praise | [X] | ↑/↓/→ |
| **Total** | **[X]** | |

### By Agent

| Agent | Feedback Count | Top Issue |
|-------|----------------|-----------|
| ClaimLinc | [X] | [Issue] |
| PolicyLinc | [X] | [Issue] |
| DocsLinc | [X] | [Issue] |
| Platform | [X] | [Issue] |

### NPS This Week

- Responses: [X]
- Score: [X]
- Promoters: [X]% | Passives: [X]% | Detractors: [X]%

### Top Customer Quotes

> "[Quote 1]" — [Customer]

> "[Quote 2]" — [Customer]

### Action Items

- [ ] [Action] - Owner: @[name] - Priority: High
- [ ] [Action] - Owner: @[name] - Priority: Medium

### Closed This Week

- ✅ [Resolved feedback item 1]
- ✅ [Resolved feedback item 2]
```

### Feature Shipped Notification

> 🚀 **Feature Shipped: [Feature Name]**
>
> Based on your feedback, we've shipped: [Feature description]
>
> **Originally Requested By:**
>
> - [Customer 1]
> - [Customer 2]
>
> **What Changed:**
>
> - [Change 1]
> - [Change 2]
>
> **How to Use:**
> [Brief instructions or link to docs]
>
> **Please Notify Customers:**
>
> - [ ] @[csm1] → [Customer 1]
> - [ ] @[csm2] → [Customer 2]
>
> Thank you for your feedback! 🙏

---

## NPS Survey Process

### Survey Schedule

| Survey Type | Frequency | Audience |
|-------------|-----------|----------|
| Relationship NPS | Quarterly | All active customers |
| Transactional NPS | Post-implementation | New customers |
| Support NPS | Post-ticket | Support interactions |

### Response Handling

```
NPS Response Received
    ↓
Automated to #nps-responses
    ↓
├── Promoter (9-10): Thank, request reference
├── Passive (7-8): Gather more feedback
└── Detractor (0-6): Immediate CSM follow-up
    ↓
Log insights to #customer-feedback
    ↓
Monthly NPS Review Meeting
```

### Detractor Response Template

> 🔴 **NPS Detractor Alert**
>
> **Customer:** [Name]
> **Score:** [X]
> **CSM:** @[name]
>
> **Feedback:**
> > "[Verbatim response]"
>
> **Required Action:**
>
> - [ ] CSM call within 24 hours
> - [ ] Root cause analysis
> - [ ] Recovery plan created
> - [ ] Executive escalation (if needed)
>
> Update thread with call outcome.

---

## Feedback Analytics

### Monthly Feedback Report

```markdown
## Monthly Feedback Report - [Month Year]

### Overview

- Total feedback items: [X]
- Unique customers providing feedback: [X]
- Resolution rate: [X]%
- Avg time to acknowledge: [X] hours
- Avg time to resolve: [X] days

### Sentiment Trend

[Month 1] → [Month 2] → [Month 3]
[X]% positive → [X]% positive → [X]% positive

### Top 5 Feature Requests

| Rank | Feature | Votes | Status |
|------|---------|-------|--------|
| 1 | [Feature] | [X] | [Status] |
| 2 | [Feature] | [X] | [Status] |
| 3 | [Feature] | [X] | [Status] |
| 4 | [Feature] | [X] | [Status] |
| 5 | [Feature] | [X] | [Status] |

### Agent Health (by feedback)

| Agent | Positive | Negative | Net |
|-------|----------|----------|-----|
| ClaimLinc | [X]% | [X]% | +[X]% |
| PolicyLinc | [X]% | [X]% | +[X]% |
| DocsLinc | [X]% | [X]% | +[X]% |

### Wins

- ✅ [Shipped feature based on feedback]
- ✅ [Resolved major issue]

### Focus Areas for Next Month

1. [Area 1]
2. [Area 2]
```

---

## Integration Points

- **Productboard/Jira**: Feature request tracking
- **Intercom/Zendesk**: Support feedback
- **Delighted/Wootric**: NPS surveys
- **Notion**: Feedback analysis and reports
- **DataLinc**: Feedback correlation with usage

---

<div class="template-footer" markdown>
*BrainSAIT Feedback Collection v2.0 | Healthcare Intelligence, Delivered*
</div>
