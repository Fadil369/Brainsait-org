---
title: "Help Desk & Support"
description: "BrainSAIT customer and internal technical support workflow"
template_id: "help_template"
category: "support"
language: "en"
version: "2.0"
last_updated: "2025-12-31"
tags:
  - template
  - support
  - helpdesk
  - healthcare
---

# Help Desk & Support

<div class="template-meta" markdown>
**Category:** Support | **Version:** 2.0 | **Status:** Active
</div>

## Overview

Manage BrainSAIT customer support requests, technical issues, and escalations with structured triage, SLA tracking, and agent-specific troubleshooting for ClaimLinc, PolicyLinc, DocsLinc, and platform issues.

---

## Channel Structure

### Support Channels

| Channel | Purpose | Access |
|---------|---------|--------|
| `#support-triage` | Incoming tickets and initial assessment | Support team |
| `#support-claimlinc` | ClaimLinc-specific issues | Support + Engineering |
| `#support-policylinc` | PolicyLinc and payer issues | Support + Engineering |
| `#support-docslinc` | Document processing issues | Support + Engineering |
| `#support-escalations` | P1/P2 critical escalations | All teams |
| `#support-resolved` | Completed tickets for reference | Support team |

### Customer Channels

| Channel | Purpose |
|---------|---------|
| `#customer-[name]-support` | Dedicated support for enterprise customers |
| `#support-general` | General product questions |

---

## Ticket Priorities

| Priority | Description | Response SLA | Resolution SLA |
|----------|-------------|--------------|----------------|
| **P1 - Critical** | Production down, all claims blocked | 15 min | 4 hours |
| **P2 - High** | Major feature broken, workaround exists | 1 hour | 8 hours |
| **P3 - Medium** | Feature issue, limited impact | 4 hours | 24 hours |
| **P4 - Low** | Question, enhancement request | 24 hours | 72 hours |

### Priority Examples

```
P1 - Critical:
- NPHIES submission completely failing
- All claims returning errors
- Customer unable to access platform
- Data integrity issue

P2 - High:
- ClaimLinc validation not catching known errors
- PolicyLinc returning incorrect eligibility
- Slow performance (<5x normal)
- Single payer connection down

P3 - Medium:
- Specific claim type failing validation
- Report generation issues
- UI/UX bugs affecting workflow
- Integration sync delays

P4 - Low:
- Feature requests
- Documentation questions
- Training requests
- Minor UI issues
```

---

## Ticket Workflow

### 1. Intake

```markdown
## New Support Ticket

**Ticket ID:** SUPPORT-[XXXX]
**Customer:** [Name]
**Priority:** P1/P2/P3/P4
**Agent:** ClaimLinc / PolicyLinc / DocsLinc / Platform

### Issue Summary

[One-line description]

### Details

- **Error Message:** [Exact error]
- **Claim ID(s):** [If applicable]
- **Payer:** [Bupa/Tawuniya/Medgulf/etc.]
- **Steps to Reproduce:** [Numbered steps]
- **Expected Behavior:** [What should happen]
- **Actual Behavior:** [What is happening]

### Customer Impact

- Claims affected: [X]
- Users impacted: [X]
- Revenue at risk: [X] SAR

### Attachments

- [ ] Screenshot/video
- [ ] Error logs
- [ ] Claim sample
```

### 2. Triage

- [ ] Assign priority based on impact
- [ ] Identify affected agent (ClaimLinc, PolicyLinc, DocsLinc)
- [ ] Route to appropriate channel
- [ ] Acknowledge to customer within SLA

### 3. Investigation

- [ ] Reproduce issue in staging
- [ ] Check recent deployments
- [ ] Review agent logs in DataLinc
- [ ] Identify root cause

### 4. Resolution

- [ ] Implement fix or workaround
- [ ] Verify with customer
- [ ] Document solution
- [ ] Update knowledge base

---

## Key Messages

### Acknowledgment

> 🎫 **Ticket Received: SUPPORT-[XXXX]**
>
> Hi [Customer Name],
>
> We've received your support request regarding [brief issue].
>
> **Priority:** P[X]
> **Response SLA:** [Time]
> **Assigned To:** @[agent-name]
>
> We're investigating and will update you shortly.

### Status Update

> 📋 **Update: SUPPORT-[XXXX]**
>
> **Status:** Investigating / In Progress / Pending Customer / Resolved
>
> **Findings:**
> [What we've discovered]
>
> **Next Steps:**
> [What we're doing next]
>
> **ETA:** [Expected resolution time]

### Resolution

> ✅ **Resolved: SUPPORT-[XXXX]**
>
> **Issue:** [Brief description]
> **Root Cause:** [What caused it]
> **Resolution:** [How we fixed it]
>
> **Prevention:** [Steps to prevent recurrence]
>
> Please confirm this resolves your issue. We'll close this ticket in 48 hours if no response.

---

## Agent-Specific Troubleshooting

### ClaimLinc Issues

| Symptom | Common Cause | Quick Fix |
|---------|--------------|-----------|
| Validation timeout | Large claim batch | Process in smaller batches |
| False positive rejection | Outdated rules | Check rule version, refresh |
| NPHIES submission fail | Payer API issue | Verify payer status, retry |
| Missing validation | New claim type | Request rule update |

### PolicyLinc Issues

| Symptom | Common Cause | Quick Fix |
|---------|--------------|-----------|
| Eligibility timeout | Payer API slow | Retry, check payer status |
| Wrong coverage info | Stale policy data | Force policy refresh |
| Authorization denied | Missing prior auth | Check auth requirements |
| Payer not found | Config issue | Verify payer mapping |

### DocsLinc Issues

| Symptom | Common Cause | Quick Fix |
|---------|--------------|-----------|
| OCR failure | Poor image quality | Request higher resolution |
| Wrong extraction | New document format | Submit for training |
| Slow processing | Large file size | Compress or split document |
| Missing fields | Handwritten text | Manual review required |

---

## Escalation Path

```
Level 1: Support Engineer → 15 min
    ↓
Level 2: Senior Support → 30 min
    ↓
Level 3: Engineering On-Call → 1 hour
    ↓
Level 4: VP Engineering → 2 hours
    ↓
Level 5: Executive (P1 only) → 4 hours
```

### P1 Escalation Template

> 🚨 **P1 ESCALATION: SUPPORT-[XXXX]**
>
> **Customer:** [Name] - [Tier]
> **Impact:** [X] claims blocked, [X] SAR at risk
> **Duration:** [Time since reported]
>
> **Issue:** [Description]
>
> **Actions Taken:**
>
> 1. [Action 1]
> 2. [Action 2]
>
> **Blockers:** [What's preventing resolution]
>
> **Needs:** [Specific help needed]
>
> cc: @on-call @[manager] @[vp-engineering]

---

## Metrics & Reporting

### Daily Support Metrics

```markdown
## Daily Support Report - [Date]

### Volume

| Priority | Opened | Closed | Open |
|----------|--------|--------|------|
| P1 | [X] | [X] | [X] |
| P2 | [X] | [X] | [X] |
| P3 | [X] | [X] | [X] |
| P4 | [X] | [X] | [X] |

### SLA Performance

| Metric | Target | Actual |
|--------|--------|--------|
| P1 Response | 15 min | [X] min |
| P1 Resolution | 4 hours | [X] hours |
| P2 Response | 1 hour | [X] min |
| Overall CSAT | 4.5/5 | [X]/5 |

### Top Issues

1. [Issue type] - [X] tickets
2. [Issue type] - [X] tickets

### Escalations

- [X] P1 escalations
- [X] required engineering
```

---

## Integration Points

- **Jira**: Ticket tracking and engineering handoff
- **DataLinc**: Log analysis and monitoring
- **Notion**: Knowledge base and runbooks
- **PagerDuty**: On-call alerting for P1

---

<div class="template-footer" markdown>
*BrainSAIT Help Desk v2.0 | Healthcare Intelligence, Delivered*
</div>
