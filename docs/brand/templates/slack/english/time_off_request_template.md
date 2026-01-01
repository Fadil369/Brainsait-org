---
title: "Time-Off Request"
description: "BrainSAIT leave management and approval workflow"
template_id: "time_off_request_template"
category: "hr"
language: "en"
version: "2.0"
last_updated: "2025-12-31"
tags:
  - template
  - hr
  - time-off
  - leave
---

# Time-Off Request

<div class="template-meta" markdown>
**Category:** Human Resources | **Version:** 2.0 | **Status:** Active
</div>

## Overview

Manage leave requests, approvals, and coverage planning at BrainSAIT—ensuring smooth operations while supporting work-life balance for our healthcare AI team.

---

## Channel Structure

### Time-Off Channels

| Channel | Purpose | Visibility |
|---------|---------|------------|
| `#time-off-requests` | Submit leave requests | All employees |
| `#team-calendar` | Company-wide leave visibility | All employees |
| `#coverage-planning` | Handover and coverage | Team leads |
| `#hr-approvals` | HR approval queue | HR + Managers |

---

## Leave Types

### Leave Categories

| Type | Days | Approval | Notice Required |
|------|------|----------|-----------------|
| **Annual Leave** | Per contract (21+ days) | Manager | 2 weeks |
| **Sick Leave** | As per labor law | HR + Medical certificate | Same day |
| **Emergency Leave** | Up to 3 days | Manager (post-facto OK) | ASAP |
| **Hajj Leave** | 10-15 days (once) | HR + Manager | 1 month |
| **Maternity** | 70 days | HR | 4 weeks |
| **Paternity** | 3 days | Manager | 1 week |
| **Marriage** | 5 days | HR | 2 weeks |
| **Bereavement** | 3-5 days | Manager | Same day |
| **Study Leave** | Case by case | Manager + HR | 2 weeks |
| **Unpaid Leave** | Case by case | VP + HR | 1 month |

### Saudi National Holidays

| Holiday | Typical Dates | Days |
|---------|---------------|------|
| Saudi National Day | September 23 | 1 |
| Founding Day | February 22 | 1 |
| Eid Al-Fitr | Varies | 4 |
| Eid Al-Adha | Varies | 4 |

---

## Request Workflow

### Leave Request Process

```
Employee submits request
    ↓
Slack notification to Manager
    ↓
Manager reviews (24-48h SLA)
    ├── Approved → HR notified → Calendar updated
    ├── Needs Discussion → 1:1 scheduled
    └── Declined → Reason provided → Alternative offered
    ↓
Employee notified
    ↓
Coverage plan confirmed
    ↓
Out-of-office setup
```

### Approval Matrix

| Leave Duration | Approver |
|----------------|----------|
| 1-3 days | Direct Manager |
| 4-10 days | Manager + Department Head |
| 10+ days | Manager + HR |
| Unpaid Leave | VP + HR |

---

## Key Messages

### Leave Request Template

```markdown
## Time-Off Request

**Employee:** @[name]
**Department:** [Department]
**Manager:** @[manager-name]

### Leave Details

**Type:** Annual / Sick / Emergency / Hajj / Maternity / Paternity / Marriage / Bereavement / Study / Unpaid

**Dates:**
- From: [Start Date]
- To: [End Date]
- Total Days: [X] working days

**Reason:** [Brief reason - optional for annual leave]

### Coverage Plan

**Critical Tasks:**
| Task | Covering | Notes |
|------|----------|-------|
| [Task 1] | @[name] | [Instructions] |
| [Task 2] | @[name] | [Instructions] |

**Customer Coverage:**
- @[name] will handle [Customer A]
- @[name] will handle [Customer B]

**On-call/Support Rotation:**
- [ ] Removed from rotation for these dates
- [ ] Backup: @[name]

### Contact During Leave

- [ ] Fully offline
- [ ] Available for emergencies only
- [ ] Checking messages daily

**Emergency Contact:** [Phone - optional]

### Pre-Leave Checklist

- [ ] Tasks handed over
- [ ] Out-of-office set in email
- [ ] Slack status updated
- [ ] Calendar blocked
- [ ] Team notified
```

### Manager Approval Message

> ✅ **Leave Approved**
>
> **Employee:** @[name]
> **Dates:** [Start] - [End] ([X] days)
> **Type:** [Leave type]
>
> **Coverage confirmed:**
> - [Task] → @[covering]
>
> **Notes:** [Any conditions or notes]
>
> Enjoy your time off! 🌴

### Leave Declined Message

> ❌ **Leave Request - Discussion Needed**
>
> **Employee:** @[name]
> **Requested Dates:** [Start] - [End]
>
> **Reason:**
> [Explanation - e.g., critical deadline, coverage gap, etc.]
>
> **Suggested Alternatives:**
> - [Alternative dates]
> - [Partial leave option]
>
> Let's discuss: @[name] please book time with me this week.

### Out-of-Office Notification

> 🏖️ **Out of Office: @[name]**
>
> **Away:** [Start Date] - [End Date]
> **Returns:** [Return Date]
>
> **Coverage:**
> - For [Topic A]: Contact @[name]
> - For [Topic B]: Contact @[name]
> - Urgent customer issues: #support-escalation
>
> **Agent-specific coverage:**
> - ClaimLinc matters: @[name]
> - PolicyLinc matters: @[name]
>
> For emergencies only: [Emergency contact if provided]

---

## Team Calendar

### Monthly Leave Overview Template

```markdown
## Team Leave Calendar - [Month Year]

### Department: [Department]

| Employee | Dates | Type | Coverage |
|----------|-------|------|----------|
| @[name] | [Dates] | Annual | @[cover] |
| @[name] | [Dates] | Training | @[cover] |

### Coverage Summary

**Week 1 ([Dates]):**
- [X] team members out
- Critical coverage: ✅ Covered

**Week 2 ([Dates]):**
- [X] team members out
- Critical coverage: ✅ Covered

### Holidays This Month

- [Holiday Name] - [Date] - Company closed

### Notes

- [Any blackout periods]
- [Critical deadlines requiring coverage]
```

### Leave Balance Reminder

> 📊 **Leave Balance Reminder - Q[X]**
>
> Hi team! Here's a quick reminder of typical leave balances:
>
> **Check Your Balance:**
> Use `/timeoff balance` or visit [HR Portal] to see your current balance.
>
> **Reminders:**
>
> - Use your annual leave - it's important for wellbeing!
> - [X] days max carry-over to next year
> - Book popular times early (Eid, summer, year-end)
>
> **Upcoming Blackout Periods:**
>
> - [Date Range]: [Reason - e.g., product launch, audit]
>
> **Planning Help:**
> Talk to your manager about leave planning for the quarter.

---

## Customer-Facing Coverage

### Implementation Team Coverage

When implementation team members are out:

```markdown
## Implementation Coverage Plan

**Team Member Out:** @[name]
**Dates:** [Start] - [End]
**Active Customers:** [Customer A], [Customer B]

### Customer-Specific Coverage

**[Customer A]:**
- Primary cover: @[name]
- Status: [Phase of implementation]
- Next milestone: [Date] - [Milestone]
- Risk level: Low/Medium/High
- Actions before leave:
  - [ ] Status call scheduled
  - [ ] Customer notified of coverage
  - [ ] Handover document shared

**[Customer B]:**
- Primary cover: @[name]
- [Same structure]

### Escalation Path

1. @[cover-name] (primary)
2. @[backup-name] (if primary unavailable)
3. @[manager] (escalations)
```

### Support Team Coverage

```markdown
## Support Coverage Plan

**Team Member Out:** @[name]
**Dates:** [Start] - [End]

### Ticket Reassignment

| Ticket Type | Reassign To |
|-------------|-------------|
| ClaimLinc | @[name] |
| PolicyLinc | @[name] |
| DocsLinc | @[name] |
| General | @[name] |

### Open Tickets Handover

| Ticket | Customer | Status | Owner |
|--------|----------|--------|-------|
| [#XXX] | [Customer] | [Status] | @[new-owner] |

### On-call Rotation

- [ ] Removed from on-call: [Dates]
- [ ] Backup assigned: @[name]
```

---

## Best Practices

!!! tip "Time-Off at BrainSAIT"
    - **Plan Ahead**: Book leave 2+ weeks in advance when possible
    - **Coverage First**: Ensure clear handover before leaving
    - **Disconnect**: Actually rest - we'll handle it!
    - **Customer Care**: Never leave customers uncovered
    - **Fair Distribution**: Be mindful of peak times and team balance
    - **Return Prep**: Block 2 hours post-return for catch-up

---

## Integration Points

- **HR System**: Leave balance and history
- **Google Calendar**: Team leave calendar
- **Slack**: TimeOff bot for requests
- **PagerDuty/Opsgenie**: On-call rotation updates
- **Notion**: Coverage documentation

---

<div class="template-footer" markdown>
*BrainSAIT Time-Off Request v2.0 | Healthcare Intelligence, Delivered*
</div>
