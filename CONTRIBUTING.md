# Contributing to BrainSAIT Documentation

Thank you for your interest in contributing to the BrainSAIT Knowledge System! This document provides guidelines and best practices for contributing.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Design Principles](#design-principles)
4. [Accessibility Requirements](#accessibility-requirements)
5. [File Structure](#file-structure)
6. [Writing Guidelines](#writing-guidelines)
7. [Submitting Changes](#submitting-changes)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors must:
- Be respectful and professional
- Focus on constructive feedback
- Prioritize patient safety and data privacy
- Follow healthcare compliance standards (PDPL, HIPAA)

---

## Getting Started

### Prerequisites
```bash
# Required
- Python 3.8+
- Git

# Recommended
- VS Code with Markdown extensions
- Arabic language support
```

### Local Setup
```bash
# Clone the repository
git clone https://github.com/Fadil369/brainsait-docs.git
cd brainsait-docs

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start local server
mkdocs serve
```

Navigate to `http://127.0.0.1:8000` to preview changes.

---

## Design Principles

All contributions must align with BrainSAIT design principles:

### 1. Spacing Scale
Use consistent spacing values:
```css
--spacing-xs: 4px    /* Micro spacing */
--spacing-sm: 8px    /* Small gaps */
--spacing-md: 12px   /* Medium spacing */
--spacing-base: 16px /* Base unit */
--spacing-lg: 24px   /* Large spacing */
--spacing-xl: 32px   /* Extra large */
--spacing-2xl: 48px  /* Section spacing */
--spacing-3xl: 64px  /* Page spacing */
```

### 2. White Space Philosophy
- White space is a feature, not wasted space
- Every element must have clear purpose
- Avoid visual clutter

### 3. Color Palette
```css
--color-navy-black: #0F172A    /* Primary background */
--color-deep-slate: #0C1222    /* Secondary background */
--color-blue-accent: #60A5FA   /* Accent (WCAG AA compliant) */
--color-text-primary: #F8FAFC  /* High contrast white */
```

### 4. Typography
- **Font**: Inter (primary), Fira Code (monospace)
- Use weight hierarchy: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- Never use font sizes smaller than 14px

---

## Accessibility Requirements

All content must meet **WCAG 2.2 Level AA** standards:

### Contrast Ratios
- **Normal text**: Minimum 4.5:1
- **Large text** (18pt+): Minimum 3:1
- Test with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Semantic HTML
```html
<!-- ✅ Good -->
<section lang="en" aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
  <p>Content here...</p>
</section>

<!-- ❌ Bad -->
<div>
  <span class="title">Section Title</span>
  <div>Content here...</div>
</div>
```

### ARIA Labels
```html
<!-- ✅ Proper ARIA usage -->
<a href="/about" aria-label="Visit About page">About</a>

<table role="table" aria-label="Healthcare agents">
  <thead>
    <tr>
      <th scope="col">Agent Name</th>
    </tr>
  </thead>
</table>
```

### Keyboard Navigation
- All interactive elements must be keyboard-accessible
- Provide visible `:focus` states
- Maintain logical tab order

### Language Attributes
```html
<!-- ✅ Proper bilingual markup -->
<div lang="en">English content</div>
<div lang="ar" dir="rtl">محتوى عربي</div>
```

---

## File Structure

### Markdown Files
All documentation follows this frontmatter structure:

```yaml
---
title: Page Title
description: Brief description for SEO
---
```

### Creating New Pages

1. **English version** - `docs/section/page.md`
2. **Arabic version** - Auto-generated via:
   ```bash
   python3 scripts/generate_ar_files.py
   ```

### Directory Organization
```
docs/
├── healthcare/     # Healthcare domain
├── business/       # Business domain
├── tech/           # Technical domain
├── personal/       # Personal development
├── brand/          # Brand identity
├── appendices/     # Reference materials
└── assets/         # Images, icons, etc.
  └── images/
```

---

## Writing Guidelines

### Content Structure
1. **Start with purpose** - Why does this page exist?
2. **Use actionable headings** - "How to..." instead of "About..."
3. **Provide examples** - Code snippets, screenshots, diagrams
4. **Link related content** - Cross-reference relevant pages

### Bilingual Content
- Provide both English and Arabic for all core content
- Use `lang` and `dir` attributes appropriately
- Maintain content parity between languages

### Code Blocks
````markdown
```python
# Provide context comments
def process_claim(claim_id: str) -> Dict:
    """Process healthcare claim with validation."""
    # Implementation
    pass
```
````

### Tables
```html
<table role="table" aria-label="Descriptive label">
  <thead>
    <tr>
      <th scope="col">Column 1</th>
      <th scope="col">Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

### Links
```markdown
<!-- ✅ Descriptive link text -->
[View Claims Lifecycle](healthcare/claims/lifecycle.md)

<!-- ❌ Generic link text -->
[Click here](healthcare/claims/lifecycle.md)
```

---

## Submitting Changes

### Branch Naming
```bash
# Feature
git checkout -b feature/add-nphies-guide

# Fix
git checkout -b fix/broken-link-healthcare

# Documentation
git checkout -b docs/update-api-reference
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

feat(healthcare): Add NPHIES integration guide
fix(css): Correct contrast ratio for blue accent
docs(readme): Update installation instructions
refactor(nav): Restructure navigation hierarchy
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main-enterprise
   ```

2. **Run checks**
   ```bash
   # Build documentation
   mkdocs build
   
   # Check for broken links
   # (Add link checker if available)
   ```

3. **Create Pull Request**
   - Use descriptive PR title
   - Reference related issues
   - Include screenshots for UI changes
   - Add checklist for review

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Documentation update
- [ ] New feature
- [ ] Bug fix
- [ ] Design enhancement

## Checklist
- [ ] Follows design principles
- [ ] Meets WCAG 2.2 AA standards
- [ ] Includes Arabic translation (if applicable)
- [ ] Tested locally with `mkdocs serve`
- [ ] No broken links
- [ ] Updated CHANGELOG.md

## Screenshots
(If applicable)
```

---

## Testing

### Manual Testing
1. **Visual Review**
   - Check spacing consistency
   - Verify color contrast
   - Test on mobile/tablet/desktop

2. **Accessibility**
   - Tab through all interactive elements
   - Test with screen reader (NVDA/JAWS/VoiceOver)
   - Verify ARIA labels

3. **RTL Testing**
   - Switch to Arabic language
   - Verify proper text alignment
   - Check navigation flow

### Automated Tests
```bash
# Build test
mkdocs build

# Link validation (if configured)
# pytest tests/test_links.py
```

---

## Style Guide Quick Reference

### DO ✅
- Use semantic HTML
- Include ARIA labels
- Provide bilingual content
- Follow spacing scale
- Use design tokens
- Write descriptive link text

### DON'T ❌
- Use inline styles
- Use `!important` in CSS
- Skip alt text on images
- Use generic link text ("click here")
- Hardcode spacing values
- Ignore contrast ratios

---

## Questions?

- **Email**: docs@brainsait.com
- **GitHub Discussions**: [brainsait-docs/discussions](https://github.com/Fadil369/brainsait-docs/discussions)
- **Documentation Issues**: [File an issue](https://github.com/Fadil369/brainsait-docs/issues)

---

**Thank you for contributing to BrainSAIT!** 🧠

OID: 1.3.6.1.4.1.61026
