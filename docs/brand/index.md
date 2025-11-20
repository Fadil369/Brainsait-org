---
title: Brand & Templates | العلامة التجارية والقوالب
description: BrainSAIT brand guidelines, templates, and documentation standards
tags:
  - brand
  - templates
  - guidelines
---

# Brand & Templates
# العلامة التجارية والقوالب

**BrainSAIT Documentation Standards & Resources**

**معايير وموارد توثيق برينسايت**

---

## Overview | نظرة عامة

This section contains brand guidelines, documentation templates, and standards for creating consistent BrainSAIT documentation.

يحتوي هذا القسم على إرشادات العلامة التجارية وقوالب التوثيق والمعايير لإنشاء توثيق برينسايت متسق.

---

## Document Templates | قوالب الوثائق

### Product Documentation | توثيق المنتجات

| Template | القالب | Purpose | الغرض | Link | الرابط |
|----------|--------|---------|-------|------|--------|
| **PRD Template** | قالب متطلبات المنتج | Product Requirements Document | وثيقة متطلبات المنتج | [View | عرض](templates/prd_template.md) |
| **API Template** | قالب واجهة البرمجة | API endpoint documentation | توثيق نقاط نهاية الواجهة | [View | عرض](templates/api_template.md) |

### Process Documentation | توثيق العمليات

| Template | القالب | Purpose | الغرض | Link | الرابط |
|----------|--------|---------|-------|------|--------|
| **SOP Template** | قالب إجراءات التشغيل | Standard Operating Procedures | إجراءات التشغيل القياسية | [View | عرض](templates/sop_template.md) |
| **Report Template** | قالب التقرير | Analysis and status reports | تقارير التحليل والحالة | [View | عرض](templates/report_template.md) |

---

## Brand Identity | الهوية التجارية

### Company Information | معلومات الشركة

| Field | الحقل | English | العربية |
|-------|-------|---------|---------|
| **Name** | الاسم | BrainSAIT | برينسايت |
| **Tagline** | الشعار | Healthcare AI Automation | أتمتة الرعاية الصحية بالذكاء الاصطناعي |
| **OID** | معرف الكيان | `1.3.6.1.4.1.61026` | `1.3.6.1.4.1.61026` |
| **Domain** | النطاق | brainsait.com | brainsait.com |

### Brand Colors | ألوان العلامة

| Color | اللون | Hex | Purpose | الغرض |
|-------|-------|-----|---------|-------|
| **Midnight Blue** | الأزرق الداكن | `#1a365d` | Primary brand | اللون الرئيسي |
| **Medical Blue** | الأزرق الطبي | `#2b6cb8` | Healthcare context | السياق الصحي |
| **Signal Teal** | التركوازي | `#0ea5e9` | Accent and links | التمييز والروابط |
| **Deep Orange** | البرتقالي العميق | `#ea580c` | Alerts and CTAs | التنبيهات والإجراءات |
| **Success Green** | الأخضر الناجح | `#4CAF50` | Success states | حالات النجاح |
| **Warning Amber** | الكهرماني التحذيري | `#FFA000` | Warnings | التحذيرات |
| **Error Red** | الأحمر الخطأ | `#D32F2F` | Errors | الأخطاء |

### Typography | الخطوط

| Context | السياق | Font | الخط | Weight | الوزن |
|---------|--------|------|------|--------|-------|
| **Arabic Body** | النص العربي | IBM Plex Sans Arabic | IBM Plex Sans Arabic | 400 | 400 |
| **English Body** | النص الإنجليزي | Inter | Inter | 400 | 400 |
| **Code** | الكود | Fira Code | Fira Code | 400 | 400 |

---

## Documentation Standards | معايير التوثيق

### Bilingual Format | التنسيق ثنائي اللغة

All BrainSAIT documentation must be bilingual. Use this format:

يجب أن يكون كل توثيق برينسايت ثنائي اللغة. استخدم هذا التنسيق:

```markdown
## Section Title | عنوان القسم

**English:**
[English content here]

**العربية:**
[Arabic content here]
```

### YAML Frontmatter | ترويسة YAML

Every document must include:

يجب أن تتضمن كل وثيقة:

```yaml
---
title: Document Title | عنوان الوثيقة
description: Brief description of the document content
tags:
  - relevant-tag
  - category
---
```

### Code Documentation | توثيق الكود

Use special comments for code visibility:

استخدم التعليقات الخاصة لرؤية الكود:

```python
# BRAINSAIT: Feature description
# MEDICAL: Healthcare compliance note
# NEURAL: AI/ML implementation detail
# AGENT: Agent-specific behavior
```

### Tables | الجداول

Always include bilingual headers in tables:

دائماً ضمّن عناوين ثنائية اللغة في الجداول:

```markdown
| English Header | العنوان العربي | Description | الوصف |
|----------------|----------------|-------------|-------|
| Value | القيمة | Details | التفاصيل |
```

---

## Writing Guidelines | إرشادات الكتابة

### Tone & Voice | النبرة والصوت

**English:**
- Professional but accessible
- Technical accuracy prioritized
- Active voice preferred
- Clear and concise

**العربية:**
- مهني لكن سهل الوصول
- الدقة التقنية أولوية
- يفضل الصوت المبني للمعلوم
- واضح وموجز

### Common Terms | المصطلحات الشائعة

Use consistent terminology across all documentation:

استخدم مصطلحات متسقة عبر كل التوثيق:

| English | العربية | Notes | ملاحظات |
|---------|---------|-------|---------|
| claim | مطالبة | Not "demand" | ليس "طلب" |
| rejection | رفض | Insurance context | سياق التأمين |
| agent | وكيل | AI agent | وكيل ذكاء اصطناعي |
| payer | شركة التأمين | Insurance company | ليس "الدافع" |

---

## File Organization | تنظيم الملفات

### Directory Structure | هيكل الدليل

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

### Naming Conventions | اصطلاحات التسمية

| Type | النوع | Convention | الاصطلاح | Example | مثال |
|------|-------|------------|----------|---------|------|
| Files | الملفات | snake_case.md | snake_case.md | `claim_lifecycle.md` |
| Folders | المجلدات | lowercase | lowercase | `healthcare/` |
| Images | الصور | descriptive-name.png | descriptive-name.png | `workflow-diagram.png` |

---

## Version Control | التحكم في الإصدارات

### Commit Messages | رسائل الالتزام

Use this format for documentation commits:

استخدم هذا التنسيق لالتزامات التوثيق:

```
docs: [action] [component] - [brief description]

Examples:
docs: add ClaimLinc agent documentation
docs: update healthcare glossary terms
docs: fix Arabic translation in SOP template
```

### Branch Strategy | استراتيجية الفروع

- `main` - Production documentation
- `docs/*` - Documentation updates
- `feature/*` - New features requiring docs

---

## Quality Checklist | قائمة فحص الجودة

Before submitting documentation, verify:

قبل تقديم التوثيق، تحقق من:

- [ ] YAML frontmatter is complete | ترويسة YAML مكتملة
- [ ] Content is bilingual (EN/AR) | المحتوى ثنائي اللغة
- [ ] Tables have bilingual headers | الجداول لها عناوين ثنائية اللغة
- [ ] Code examples are tested | أمثلة الكود مختبرة
- [ ] Links are valid | الروابط صالحة
- [ ] Images have alt text | الصور لها نص بديل
- [ ] Spell check passed | اجتاز التدقيق الإملائي
- [ ] Technical review completed | اكتملت المراجعة التقنية

---

## Quick Links | روابط سريعة

- [Healthcare Documentation | توثيق الصحة](../healthcare/index.md)
- [Tech Documentation | التوثيق التقني](../tech/index.md)
- [Master Glossary | المصطلحات الشاملة](../appendices/glossary_master.md)

---

**BrainSAIT Brand & Templates** | العلامة التجارية والقوالب برينسايت

OID: `1.3.6.1.4.1.61026`
