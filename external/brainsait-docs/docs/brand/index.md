---
title: Brand & Templates
description: BrainSAIT brand guidelines, templates, and documentation standards
tags:
  - brand
  - templates
  - guidelines
---

# Brand & Templates

**BrainSAIT Documentation Standards & Resources**

---

## Overview

This section contains brand guidelines, documentation templates, and standards for creating consistent BrainSAIT documentation.

---

## Document Templates

### Product Documentation

| Template | Purpose | Link |
|----------|---------|------|
| **PRD Template** | Product Requirements Document | [View](templates/prd_template.md) |
| **API Template** | API endpoint documentation | [View](templates/api_template.md) |

### Process Documentation

| Template | Purpose | Link |
|----------|---------|------|
| **SOP Template** | Standard Operating Procedures | [View](templates/sop_template.md) |
| **Report Template** | Analysis and status reports | [View](templates/report_template.md) |

---

## Brand Identity

### Company Information

| Field | Value |
|-------|-------|
| **Name** | BrainSAIT |
| **Tagline** | Healthcare AI Automation |
| **OID** | `1.3.6.1.4.1.61026` |
| **Domain** | brainsait.com |

### Brand Colors

| Color | Hex | Purpose |
|-------|-----|---------|
| **Midnight Blue** | `#1a365d` | Primary brand |
| **Medical Blue** | `#2b6cb8` | Healthcare context |
| **Signal Teal** | `#0ea5e9` | Accent and links |
| **Deep Orange** | `#ea580c` | Alerts and CTAs |
| **Success Green** | `#4CAF50` | Success states |
| **Warning Amber** | `#FFA000` | Warnings |
| **Error Red** | `#D32F2F` | Errors |

### Typography

| Context | Font | Weight |
|---------|------|--------|
| **Arabic Body** | IBM Plex Sans Arabic | 400 |
| **English Body** | Inter | 400 |
| **Code** | Fira Code | 400 |

---

## Documentation Standards

### YAML Frontmatter

Every document must include:

```yaml
---
title: Document Title
description: Brief description of the document content
tags:
  - relevant-tag
  - category
---
```

### Code Documentation

Use special comments for code visibility:

```python
# BRAINSAIT: Feature description
# MEDICAL: Healthcare compliance note
# NEURAL: AI/ML implementation detail
# AGENT: Agent-specific behavior
```

---

## Writing Guidelines

### Tone & Voice

- Professional but accessible
- Technical accuracy prioritized
- Active voice preferred
- Clear and concise

### Common Terms

Use consistent terminology across all documentation:

| English | Arabic | Notes |
|---------|--------|-------|
| claim | مطالبة | Insurance claim |
| rejection | رفض | Insurance context |
| agent | وكيل | AI agent |
| payer | شركة التأمين | Insurance company |

---

## File Organization

### Directory Structure

```
docs/
├── index.md              # Main landing page
├── healthcare/           # Volume 1: Healthcare
│   ├── index.md
│   ├── overview/
│   ├── agents/
│   └── sop/
├── business/             # Volume 2: Business
│   ├── index.md
│   ├── strategy/
│   └── marketing/
├── tech/                 # Volume 3: Tech
│   ├── index.md
│   ├── infrastructure/
│   └── apps/
├── personal/             # Volume 4: Personal Dev
│   └── index.md
├── brand/                # Brand & Templates
│   ├── index.md
│   └── templates/
└── appendices/           # Reference materials
    └── glossary_master.md
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | snake_case.md | `claim_lifecycle.md` |
| Folders | lowercase | `healthcare/` |
| Images | descriptive-name.png | `workflow-diagram.png` |

---

## Version Control

### Commit Messages

Use this format for documentation commits:

```
docs: [action] [component] - [brief description]

Examples:
docs: add ClaimLinc agent documentation
docs: update healthcare glossary terms
docs: fix translation in SOP template
```

### Branch Strategy

- `main` - Production documentation
- `docs/*` - Documentation updates
- `feature/*` - New features requiring docs

---

## Quality Checklist

Before submitting documentation, verify:

- [ ] YAML frontmatter is complete
- [ ] Content is available in both languages
- [ ] Code examples are tested
- [ ] Links are valid
- [ ] Images have alt text
- [ ] Spell check passed
- [ ] Technical review completed

---

## Quick Links

- [Healthcare Documentation](../healthcare/index.md)
- [Tech Documentation](../tech/index.md)
- [Master Glossary](../appendices/glossary_master.md)

---

**BrainSAIT Brand & Templates**

OID: `1.3.6.1.4.1.61026`
