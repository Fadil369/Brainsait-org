# Contributing to BrainSAIT Documentation

Thank you for your interest in contributing to the BrainSAIT Knowledge System! This document provides guidelines and best practices for contributing.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Design Principles](#design-principles)
4. [Accessibility Requirements](#accessibility-requirements)
5. [File Structure](#file-structure)
6. [Writing Guidelines](#writing-guidelines)
7. [Branch Strategy](#branch-strategy)
8. [Content Enhancement Guidelines](#content-enhancement-guidelines)
9. [Submitting Changes](#submitting-changes)

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

## Branch Strategy

BrainSAIT follows a structured branch strategy to ensure code quality and compliance:

### Main Branches
- **`main`** - Production branch, protected, requires reviews
- **`main-enterprise`** - Enterprise deployment branch
- **`develop`** - Development integration branch

### Feature Branches
Follow this naming convention based on the type of work:

```bash
# Documentation changes
docs/update-nphies-integration
docs/add-accessibility-guide

# New features
feature/add-versioning-support
feature/integrate-analytics

# Bug fixes
fix/broken-links-in-healthcare
fix/rtl-layout-issues

# Emergency fixes
hotfix/critical-security-patch
hotfix/broken-deployment
```

### Branch Workflow
1. Create feature branch from `main` or `develop`
2. Make changes and commit with conventional commit messages
3. Open Pull Request to target branch
4. Require at least one review before merging
5. Delete feature branch after successful merge

### Protected Branch Rules
- `main` and `main-enterprise` require:
  - At least 1 approving review
  - All CI checks must pass
  - Up-to-date with base branch
  - No force pushes allowed

---

## Content Enhancement Guidelines

### Adding Page Depth

When expanding documentation pages, include:

1. **Clear Definitions and Objectives**
   ```markdown
   ## Overview
   
   **Purpose**: [What this page covers]
   
   **Learning Objectives**:
   - Understand [concept A]
   - Learn how to [task B]
   - Apply [skill C]
   ```

2. **Step-by-Step Instructions**
   ```markdown
   ## How to Submit a Claim
   
   1. **Verify Eligibility**
      - Navigate to the eligibility check interface
      - Enter patient ID and insurance details
      - Wait for confirmation response
   
   2. **Prepare Claim Data**
      - Gather diagnosis codes (ICD-10)
      - Collect procedure codes (CPT)
      - Document supporting evidence
   ```

3. **Workflow Diagrams**
   Use Mermaid or PlantUML for process diagrams:
   
   ````markdown
   ```mermaid
   graph TD
       A[Start] --> B{Check Eligibility}
       B -->|Eligible| C[Submit Claim]
       B -->|Not Eligible| D[Notify Patient]
       C --> E[Await Response]
       E --> F{Approved?}
       F -->|Yes| G[Process Payment]
       F -->|No| H[Review & Resubmit]
   ```
   ````

4. **External Standards References**
   Link to relevant regulations and standards:
   ```markdown
   > **PDPL Compliance**: This process follows Saudi Arabia's Personal Data 
   > Protection Law (PDPL) requirements for handling patient data.
   > See [PDPL Article 5](reference-url) for data processing principles.
   ```

5. **Cross-References**
   Link to related documentation:
   ```markdown
   **Related Topics**:
   - [Claims Lifecycle](../claims/lifecycle.md)
   - [NPHIES Integration](../nphies/overview.md)
   - [Data Privacy SOP](../sop/compliance_sop.md)
   ```

### Alt Text Guidelines

Follow W3C guidelines for image accessibility:

#### Informative Images
Provide descriptive alt text that conveys the information or function:

```html
<!-- ✅ Good: Describes the information -->
<img src="claim-workflow.png" 
     alt="Diagram showing claim submission workflow from patient registration to payment processing" />

<!-- ❌ Bad: Not descriptive -->
<img src="claim-workflow.png" alt="workflow" />
```

#### Decorative Images
Use empty alt text for purely decorative images:

```html
<!-- ✅ Good: Empty alt for decorative -->
<img src="decorative-line.png" alt="" role="presentation" />
```

#### Complex Images
For complex diagrams, provide both alt text and a longer description:

```html
<figure>
  <img src="complex-architecture.png" 
       alt="BrainSAIT system architecture diagram" 
       aria-describedby="arch-description" />
  <figcaption id="arch-description">
    The architecture shows three layers: presentation layer with web and mobile 
    clients, application layer with API gateway and microservices, and data layer 
    with PostgreSQL and Redis. All layers communicate through secure REST APIs.
  </figcaption>
</figure>
```

### Bilingual Alignment

Maintain consistency between English and Arabic content:

1. **Identical Structure**
   - Same number of headings and sections
   - Matching bullet point counts
   - Equivalent table rows and columns

2. **Synchronized Updates**
   - Update both language versions simultaneously
   - Use translation memory for consistency
   - Review both versions before committing

3. **Validation Checklist**
   ```markdown
   - [ ] English and Arabic have same section headings
   - [ ] List items match in both languages
   - [ ] Code examples are identical
   - [ ] Links point to equivalent language versions
   - [ ] Diagrams have bilingual labels
   ```

### Glossary Expansion

When adding new terms to the glossary:

1. **Term Entry Format**
   ```markdown
   ### [Term Name]
   
   **English**: Definition in English
   
   **Arabic**: تعريف بالعربية
   
   **Context**: Where and how this term is used
   
   **Related Terms**: [Link to related glossary entries]
   
   **Standards Reference**: [Link to external standard if applicable]
   ```

2. **Translation Consistency**
   - Use the master glossary as the single source of truth
   - Consult glossary when translating technical terms
   - Update glossary when introducing new terminology

### Case Studies and Real Deployments

When contributing case studies:

1. **Structure**
   ```markdown
   ## Case Study: [Hospital/Deployment Name]
   
   ### Background
   - Hospital size and type
   - Previous challenges
   - Goals and objectives
   
   ### Implementation
   - Timeline and phases
   - Technologies deployed
   - Integration points
   
   ### Results
   - **Metrics**: Specific improvements (e.g., "40% reduction in claim rejections")
   - **Qualitative Benefits**: Staff feedback, patient satisfaction
   - **Lessons Learned**: What worked well, what could be improved
   
   ### Impact
   - Financial impact
   - Operational improvements
   - Compliance achievements
   ```

2. **Privacy Considerations**
   - Anonymize sensitive data
   - Get written permission before publishing
   - Comply with PDPL and healthcare privacy laws

3. **Supporting Evidence**
   - Include before/after comparisons
   - Provide charts and graphs
   - Add testimonials (with permission)

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
