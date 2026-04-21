# BrainSAIT Bilingual Style Guide | دليل الأسلوب ثنائي اللغة

**Version**: 2.0
**Date**: November 29, 2025
**Scope**: English & Arabic Documentation

---

## 📚 Overview | نظرة عامة

This guide ensures consistent, high-quality bilingual documentation across the BrainSAIT Knowledge System. Follow these guidelines for all English and Arabic content.

يضمن هذا الدليل توثيقاً ثنائي اللغة متسقاً وعالي الجودة عبر نظام معرفة برينسايت. اتبع هذه الإرشادات لجميع المحتويات بالإنجليزية والعربية.

---

## 🌐 Language Separation | الفصل اللغوي

### File Naming Convention | اصطلاح تسمية الملفات

**English Files:**
```
docs/healthcare/index.md
docs/business/strategy/mission_vision.md
```

**Arabic Files:**
```
docs/healthcare/index.ar.md
docs/business/strategy/mission_vision.ar.md
```

**Rule**: Always use `.ar.md` suffix for Arabic files.

**القاعدة**: استخدم دائماً لاحقة `.ar.md` للملفات العربية.

### Content Separation | فصل المحتوى

✅ **DO** | افعل:
- Maintain separate files for each language
- Use `lang` attributes in HTML (`<article lang="ar">`)
- Keep one language per file

❌ **DON'T** | لا تفعل:
- Mix English and Arabic in the same file
- Use bilingual content inline
- Translate only parts of a document

---

## ✍️ Typography | الطباعة

### English Typography | طباعة اللغة الإنجليزية

#### Fonts
- **Body**: Inter (400, 500, 600, 700)
- **Code**: Fira Code
- **Size**: 17px base

#### Spacing
- **Line height**: 1.8 for body text
- **Paragraph spacing**: 16px
- **Letter spacing**: -0.025em for headings

### Arabic Typography | طباعة اللغة العربية

#### Fonts | الخطوط
- **Body**: IBM Plex Sans Arabic (400, 500, 600, 700)
- **Code**: Fira Code (always LTR)
- **Size**: 18px base (1px larger than English)

#### Spacing | المسافات
- **Line height**: 2.0 for body text (more generous)
- **Paragraph spacing**: 16px
- **Letter spacing**: 0 (no letter spacing for Arabic)

### Headings | العناوين

**English Headings:**
```markdown
# H1 - 60px, Bold, Gradient
## H2 - 48px, Bold, Border Bottom
### H3 - 36px, Bold
#### H4 - 28px, Bold
##### H5 - 22px, Medium
###### H6 - 19px, Semibold, Uppercase
```

**Arabic Headings | العناوين العربية:**
```markdown
# H1 - 60px, Bold (no gradient for compatibility)
## H2 - 48px, Bold, Border Bottom
### H3 - 36px, Bold
#### H4 - 28px, Bold
##### H5 - 22px, Medium
###### H6 - 19px, Semibold (no uppercase)
```

---

## 🎨 Colors | الألوان

### Brand Colors | ألوان العلامة التجارية

**BrainSAIT Colors:**
```css
--color-midnight-blue: #1a365d;      /* Primary */
--color-medical-blue: #2b6cb8;       /* Healthcare */
--color-signal-teal: #0ea5e9;        /* AI/Tech */
--color-deep-orange: #ea580c;        /* Warning */
--color-forest-green: #059669;       /* Success */
```

**Cloudpital Colors:**
```css
--color-cloudpital-primary: #2563EB;   /* Blue */
--color-cloudpital-secondary: #10B981; /* Green */
--color-cloudpital-accent: #F59E0B;    /* Amber */
```

### Text Colors | ألوان النص

**Light on Dark (Default):**
```css
--color-text-primary: #F8FAFC;       /* White - 14:1 contrast */
--color-text-secondary: #E2E8F0;     /* Light Gray - 7.5:1 */
--color-text-muted: #94A3B8;         /* Muted - 4.5:1 */
--color-heading: #FFFFFF;            /* Pure White */
```

### Link Colors | ألوان الروابط

```css
--color-link: #93C5FD;               /* Blue-300 - 8.5:1 */
--color-link-hover: #BFDBFE;         /* Blue-200 */
--color-link-visited: #C4B5FD;       /* Violet-300 */
```

### Status Colors | ألوان الحالة

```css
--color-success: #10B981;            /* Green */
--color-warning: #F59E0B;            /* Amber */
--color-error: #EF4444;              /* Red */
--color-info: #3B82F6;               /* Blue */
```

---

## 📝 Writing Style | أسلوب الكتابة

### English Style | الأسلوب الإنجليزي

#### Tone
- **Professional** but approachable
- **Technical** but clear
- **Concise** but complete

#### Voice
- Use **active voice**: "The system processes claims" (not "Claims are processed")
- Use **second person**: "You can configure" (not "Users can configure")
- Use **present tense**: "The agent validates" (not "The agent will validate")

#### Formatting
- **Bold** for emphasis: `**important**`
- *Italic* for terminology: `*healthcare provider*`
- `Code` for technical terms: `` `API` ``

### Arabic Style | الأسلوب العربي

#### Tone | النبرة
- **احترافي** ولكن ودود
- **تقني** ولكن واضح
- **موجز** ولكن كامل

#### Voice | الصوت
- استخدم **الصيغة المباشرة**: "يعالج النظام المطالبات"
- استخدم **ضمير المخاطب**: "يمكنك تكوين" (وليس "يمكن للمستخدمين تكوين")
- استخدم **المضارع**: "يتحقق الوكيل" (وليس "سيتحقق الوكيل")

#### Formatting | التنسيق
- **غامق** للتأكيد: `**مهم**`
- *مائل* للمصطلحات: `*مقدم الرعاية الصحية*`
- `كود` للمصطلحات التقنية: `` `API` ``

---

## 🔢 Numbers & Dates | الأرقام والتواريخ

### Numbers | الأرقام

**English:**
- Use Western Arabic numerals: 1, 2, 3, 4, 5
- Thousands separator: 1,000,000
- Decimal: 3.14

**Arabic | العربية:**
- Use Western Arabic numerals: 1, 2, 3, 4, 5 (not Eastern: ١٢٣)
- Thousands separator: 1,000,000
- Decimal: 3.14

**Rationale**: For technical documentation, Western numerals are clearer and more compatible.

### Dates | التواريخ

**English:**
- Format: `November 29, 2025`
- Short: `2025-11-29` (ISO 8601)

**Arabic | العربية:**
- Format: `٢٩ نوفمبر ٢٠٢٥`
- Short: `2025-11-29` (ISO 8601)

---

## 💻 Code Examples | أمثلة الكود

### Code Blocks | كتل الكود

**Always use English for code**, even in Arabic documents:

```python
# English comments preferred
from brainsait.agents import ClaimLinc

claim_linc = ClaimLinc()
result = claim_linc.validate_claim(claim_data)
```

**في المستندات العربية، استخدم الإنجليزية للكود:**

```python
# تعليقات إنجليزية مفضلة
from brainsait.agents import ClaimLinc

claim_linc = ClaimLinc()
result = claim_linc.validate_claim(claim_data)
```

### API Endpoints | نقاط النهاية

```http
POST /api/v1/claims/validate
GET /api/v1/patients/{id}
```

**Always LTR**, even in Arabic docs.

---

## 📊 Tables | الجداول

### English Tables | جداول إنجليزية

```markdown
| Metric | Before | After |
|--------|--------|-------|
| Clean Claim Rate | 85% | 98% |
| Denial Rate | 12% | 3% |
```

### Arabic Tables | جداول عربية

```markdown
| المقياس | قبل | بعد |
|---------|-----|------|
| معدل المطالبات النظيفة | 85٪ | 98٪ |
| معدل الرفض | 12٪ | 3٪ |
```

**Note**: Table text direction follows document language.

---

## 🔗 Links | الروابط

### Internal Links | الروابط الداخلية

**English:**
```markdown
See [Claims Lifecycle](../claims/lifecycle.md) for details.
```

**Arabic | العربية:**
```markdown
راجع [دورة حياة المطالبات](../claims/lifecycle.ar.md) للتفاصيل.
```

**Rule**: Arabic links point to `.ar.md` files.

### External Links | الروابط الخارجية

**English:**
```markdown
Visit [NPHIES Portal](https://nphies.sa) for more information.
```

**Arabic | العربية:**
```markdown
قم بزيارة [بوابة نفيس](https://nphies.sa) لمزيد من المعلومات.
```

---

## 📐 Layout & Structure | التخطيط والهيكل

### Page Structure | هيكل الصفحة

**English:**
```markdown
# Page Title

## Overview

Brief introduction...

## Core Content

### Section 1
### Section 2

## Related Documents

- [Link 1](...)
- [Link 2](...)

---

**Document Control**
- Version: 1.0.0
- Last Updated: 2025-11-29
```

**Arabic | العربية:**
```markdown
# عنوان الصفحة

## نظرة عامة

مقدمة موجزة...

## المحتوى الأساسي

### القسم 1
### القسم 2

## المستندات ذات الصلة

- [الرابط 1](...)
- [الرابط 2](...)

---

**التحكم في المستند**
- الإصدار: 1.0.0
- آخر تحديث: 2025-11-29
```

### RTL (Right-to-Left) | من اليمين إلى اليسار

**Arabic Content:**
- Text flows from right to left
- Lists align to the right
- Navigation is mirrored
- Code blocks remain LTR

**المحتوى العربي:**
- النص يتدفق من اليمين إلى اليسار
- القوائم تتماشى مع اليمين
- التنقل معكوس
- كتل الكود تبقى LTR

---

## ✅ Quality Checklist | قائمة التحقق من الجودة

### Before Publishing | قبل النشر

**English Documents:**
- [ ] Spell check completed
- [ ] Grammar reviewed
- [ ] Links tested
- [ ] Code examples validated
- [ ] Arabic version exists
- [ ] Cross-references updated

**Arabic Documents | المستندات العربية:**
- [ ] التدقيق الإملائي مكتمل
- [ ] مراجعة القواعد
- [ ] اختبار الروابط
- [ ] التحقق من أمثلة الكود
- [ ] النسخة الإنجليزية موجودة
- [ ] تحديث المراجع المتقاطعة

---

## 🌟 Best Practices | أفضل الممارسات

### Consistency | الاتساق

1. **Use templates** | استخدم القوالب
2. **Follow naming conventions** | اتبع اصطلاحات التسمية
3. **Maintain parallel structure** | حافظ على البنية الموازية
4. **Update both languages** | حدّث كلا اللغتين

### Accessibility | إمكانية الوصول

1. **Alt text for images** | نص بديل للصور
2. **Descriptive link text** | نص وصفي للروابط
3. **Proper heading hierarchy** | تسلسل عناوين صحيح
4. **High contrast ratios** | نسب تباين عالية

### Performance | الأداء

1. **Optimize images** | حسّن الصور
2. **Use web fonts** | استخدم خطوط الويب
3. **Minimize CSS** | قلل CSS
4. **Lazy load content** | حمّل المحتوى بشكل كسول

---

## 🔧 Tools & Resources | الأدوات والموارد

### Validation Tools | أدوات التحقق

- **Markdown**: markdownlint
- **Arabic**: Microsoft Word Arabic checker
- **Links**: linkchecker
- **Contrast**: WebAIM Color Contrast Checker

### Reference | المرجع

- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- [IBM Plex Sans Arabic](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

---

## 📞 Support | الدعم

**Questions?** Contact the documentation team:
- **Email**: docs@brainsait.com
- **Slack**: #documentation
- **GitHub**: [brainsait/docs](https://github.com/brainsait/docs)

**أسئلة؟** اتصل بفريق التوثيق:
- **البريد الإلكتروني**: docs@brainsait.com
- **Slack**: #documentation
- **GitHub**: [brainsait/docs](https://github.com/brainsait/docs)

---

**Document Control | التحكم في المستند**
- Version | الإصدار: 2.0.0
- Last Updated | آخر تحديث: 2025-11-29
- OID: 1.3.6.1.4.1.61026.docs.style-guide
