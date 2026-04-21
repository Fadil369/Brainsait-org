# Accessibility Testing Guide

This guide provides comprehensive instructions for testing the accessibility of BrainSAIT documentation to ensure WCAG 2.2 Level AA compliance.

## Overview

All BrainSAIT documentation must meet **WCAG 2.2 Level AA** standards to ensure accessibility for all users, including those with disabilities.

## Table of Contents

1. [Automated Testing](#automated-testing)
2. [Keyboard Navigation Testing](#keyboard-navigation-testing)
3. [Screen Reader Testing](#screen-reader-testing)
4. [Color Contrast Testing](#color-contrast-testing)
5. [Language Attributes](#language-attributes)
6. [Testing Checklist](#testing-checklist)

---

## Automated Testing

### Tools

1. **axe DevTools** (Browser Extension)
   - Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd) or Firefox Add-ons
   - Run on each page after local build
   - Fix all critical and serious issues

2. **WAVE** (Web Accessibility Evaluation Tool)
   - Visit [wave.webaim.org](https://wave.webaim.org/)
   - Enter page URL or use browser extension
   - Review errors and warnings

3. **Lighthouse** (Built into Chrome DevTools)
   ```bash
   # In Chrome DevTools
   1. Open DevTools (F12)
   2. Go to "Lighthouse" tab
   3. Select "Accessibility" category
   4. Click "Generate report"
   5. Aim for score of 95+
   ```

### Running Automated Tests

```bash
# Install dependencies
npm install -g pa11y-ci

# Create pa11y configuration
cat > .pa11y-ci.json << 'EOF'
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 30000,
    "wait": 1000
  },
  "urls": [
    "http://localhost:8000/",
    "http://localhost:8000/healthcare/",
    "http://localhost:8000/business/",
    "http://localhost:8000/tech/"
  ]
}
EOF

# Start local server
mkdocs serve &

# Run tests
pa11y-ci
```

---

## Keyboard Navigation Testing

All interactive elements must be accessible via keyboard alone.

### Testing Procedure

1. **Tab Navigation**
   - Press `Tab` to move forward through interactive elements
   - Press `Shift+Tab` to move backward
   - Verify all links, buttons, and form controls are reachable

2. **Focus Indicators**
   - Ensure visible focus outline on all focused elements
   - Focus should be clearly visible against all backgrounds
   - Default browser focus outline or custom focus styles are acceptable

3. **Keyboard Shortcuts**
   | Key | Expected Action |
   |-----|----------------|
   | `Tab` | Move to next focusable element |
   | `Shift+Tab` | Move to previous focusable element |
   | `Enter` | Activate links and buttons |
   | `Space` | Activate buttons, toggle checkboxes |
   | `Esc` | Close modals and menus |
   | `Arrow keys` | Navigate within menus and lists |

4. **Skip Links**
   - Press `Tab` on page load
   - Verify "Skip to content" link appears
   - Press `Enter` to skip to main content

### Keyboard Testing Checklist

Test each page:

- [ ] Can reach all navigation links with Tab key
- [ ] Focus indicator is visible on all elements
- [ ] Can activate all links with Enter key
- [ ] Can activate all buttons with Enter or Space
- [ ] Dropdown menus are keyboard accessible
- [ ] Modal dialogs can be closed with Esc key
- [ ] No keyboard trap (can Tab away from all elements)
- [ ] Tab order follows logical reading order

### Common Issues

❌ **Problem**: Elements receive focus but have no visible outline
```css
/* Bad - removes focus outline */
button:focus {
  outline: none;
}
```

✅ **Solution**: Provide clear focus indicator
```css
/* Good - custom focus style */
button:focus {
  outline: 2px solid var(--color-blue-accent);
  outline-offset: 2px;
}
```

---

## Screen Reader Testing

Test with at least one screen reader to ensure content is properly announced.

### Recommended Screen Readers

1. **NVDA** (Windows, Free)
   - Download: [nvaccess.org](https://www.nvaccess.org/)
   - Best for: Firefox testing

2. **JAWS** (Windows, Commercial)
   - Trial: [freedomscientific.com](https://www.freedomscientific.com/products/software/jaws/)
   - Industry standard

3. **VoiceOver** (macOS/iOS, Built-in)
   - Activate: `Cmd+F5` on Mac
   - Best for: Safari testing

4. **TalkBack** (Android, Built-in)
   - Activate: Settings > Accessibility > TalkBack

### Basic Screen Reader Commands

#### NVDA (Windows)
| Action | Command |
|--------|---------|
| Start/Stop NVDA | `Ctrl+Alt+N` |
| Read next item | `Down Arrow` |
| Read previous item | `Up Arrow` |
| Read entire page | `Insert+Down Arrow` |
| List headings | `Insert+F7` |
| Next heading | `H` |
| Next link | `K` |
| Next landmark | `D` |

#### VoiceOver (macOS)
| Action | Command |
|--------|---------|
| Start/Stop VoiceOver | `Cmd+F5` |
| Read next item | `VO+Right Arrow` |
| Read previous item | `VO+Left Arrow` |
| Read entire page | `VO+A` |
| Open rotor | `VO+U` |
| Next heading | `VO+Cmd+H` |

### Screen Reader Testing Checklist

For each page:

- [ ] Page title is announced on load
- [ ] Main heading (H1) is clear and descriptive
- [ ] Navigation landmarks are properly identified
- [ ] All images have appropriate alt text
- [ ] Links have descriptive text (not "click here")
- [ ] Forms have proper labels
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced
- [ ] Language changes are announced (English/Arabic)
- [ ] Tables have proper headers

### Testing Language Switching

Test bilingual content:

```html
<!-- English section -->
<div lang="en">
  This content should be read with English pronunciation
</div>

<!-- Arabic section -->
<div lang="ar" dir="rtl">
  يجب قراءة هذا المحتوى بالنطق العربي
</div>
```

Verify:
- [ ] Screen reader switches to appropriate language
- [ ] Text direction is correct (LTR/RTL)
- [ ] Pronunciation is appropriate for language

---

## Color Contrast Testing

Ensure sufficient contrast between text and background colors.

### WCAG Requirements

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Testing Tools

1. **WebAIM Contrast Checker**
   - Visit: [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/)
   - Enter foreground and background colors
   - Verify WCAG AA compliance

2. **Browser DevTools**
   ```bash
   # Chrome DevTools
   1. Inspect element
   2. Click color swatch in Styles panel
   3. View contrast ratio in color picker
   4. Adjust until AA or AAA compliance
   ```

3. **Accessible Colors Tool**
   - Visit: [accessible-colors.com](https://accessible-colors.com/)
   - Automatically suggests compliant alternatives

### BrainSAIT Color Palette Contrast

Test these color combinations:

| Foreground | Background | Ratio | Status |
|-----------|------------|-------|--------|
| `#F8FAFC` (text) | `#0F172A` (navy) | 15.3:1 | ✅ AAA |
| `#60A5FA` (blue) | `#0F172A` (navy) | 4.8:1 | ✅ AA |
| `#ea580c` (orange) | `#0F172A` (navy) | 4.2:1 | ✅ AA |

### Contrast Testing Checklist

- [ ] Body text meets 4.5:1 minimum
- [ ] Heading text meets appropriate ratio
- [ ] Link text is distinguishable from body text
- [ ] Button text has sufficient contrast
- [ ] Focus indicators are clearly visible
- [ ] Hover states maintain contrast
- [ ] Error messages are readable
- [ ] Success messages are readable

### High Contrast Mode

Test with high contrast palette (configured in mkdocs.yml):

```yaml
palette:
  - scheme: default
    primary: black
    accent: deep-orange
```

Verify:
- [ ] All text remains readable
- [ ] Interactive elements are visible
- [ ] Images with text are still clear
- [ ] Borders and dividers are visible

---

## Language Attributes

Proper language attributes ensure correct pronunciation and translation.

### HTML Lang Attributes

All pages should have:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Page Title</title>
  </head>
  <body>
    <main>
      <h1>English Content</h1>
      <p>This is in English.</p>
    </main>
  </body>
</html>
```

For Arabic pages:

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>عنوان الصفحة</title>
  </head>
  <body>
    <main>
      <h1>المحتوى العربي</h1>
      <p>هذا المحتوى بالعربية.</p>
    </main>
  </body>
</html>
```

### Bilingual Content

For pages with both languages:

```html
<section>
  <h2>Healthcare Claims | المطالبات الصحية</h2>
  
  <div lang="en">
    <h3>Overview</h3>
    <p>Healthcare claims processing...</p>
  </div>
  
  <div lang="ar" dir="rtl">
    <h3>نظرة عامة</h3>
    <p>معالجة المطالبات الصحية...</p>
  </div>
</section>
```

### Language Attribute Checklist

- [ ] Root `<html>` element has `lang` attribute
- [ ] Arabic pages have `dir="rtl"`
- [ ] Language changes within page are marked
- [ ] `lang` attribute on all sections in different language
- [ ] Inline foreign words/phrases marked with `lang`

---

## Testing Checklist

### Complete Accessibility Test

For each documentation page:

#### Structure
- [ ] Valid HTML5
- [ ] Single H1 per page
- [ ] Logical heading hierarchy (no skipped levels)
- [ ] Semantic HTML elements used correctly
- [ ] ARIA landmarks properly used

#### Images and Media
- [ ] All images have alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have long descriptions
- [ ] SVGs have title and desc elements
- [ ] Videos have captions (if applicable)

#### Links and Navigation
- [ ] All links have descriptive text
- [ ] Link purpose clear from text alone
- [ ] Skip to main content link present
- [ ] Breadcrumbs navigation provided
- [ ] Current page indicated in navigation

#### Forms and Interactions
- [ ] All form inputs have labels
- [ ] Error messages are clear
- [ ] Required fields indicated
- [ ] Help text associated with inputs
- [ ] Success/error feedback announced

#### Color and Contrast
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Large text contrast meets WCAG AA (3:1)
- [ ] UI component contrast meets WCAG AA (3:1)
- [ ] Color not sole means of conveying information

#### Keyboard
- [ ] All functionality available via keyboard
- [ ] Focus indicators visible
- [ ] Logical tab order
- [ ] No keyboard traps

#### Screen Reader
- [ ] Page title descriptive
- [ ] Headings describe content
- [ ] Landmarks properly labeled
- [ ] Dynamic content announced
- [ ] Language changes announced

#### Mobile
- [ ] Touch targets at least 44x44 pixels
- [ ] Pinch zoom not disabled
- [ ] Orientation not locked
- [ ] Content readable without zoom

---

## Reporting Issues

When you find accessibility issues:

1. **Document the Issue**
   ```markdown
   ## Issue: Missing alt text on diagram
   
   **Page**: healthcare/nphies/workflows.md
   **Element**: Line 45, workflow diagram
   **WCAG Criterion**: 1.1.1 Non-text Content
   **Severity**: High
   **Fix**: Add descriptive alt text explaining the workflow steps
   ```

2. **Create GitHub Issue**
   - Use "accessibility" label
   - Include screenshots
   - Specify WCAG criterion
   - Suggest fix if possible

3. **Priority Levels**
   - **Critical**: Prevents page use for some users
   - **High**: Major barrier to accessibility
   - **Medium**: Noticeable issue but workaround exists
   - **Low**: Minor issue, minimal impact

---

## Resources

### WCAG Guidelines
- [WCAG 2.2 Overview](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [pa11y](https://pa11y.org/)

### Screen Readers
- [NVDA](https://www.nvaccess.org/)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)

### Learning
- [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)
- [A11ycasts Video Series](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g)

---

**OID**: 1.3.6.1.4.1.61026
