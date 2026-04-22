# SEO and Metadata Guide

This guide provides best practices for optimizing documentation pages for search engines and social media sharing.

## Meta Descriptions

Add a `description` field in the YAML front-matter of each documentation page:

```yaml
---
title: Claims Lifecycle Management
description: Comprehensive guide to healthcare claims lifecycle, from submission to payment, including NPHIES integration and rejection handling.
---
```

### Best Practices

1. **Length**: Keep descriptions between 150-160 characters
2. **Keywords**: Include important keywords naturally
3. **Actionable**: Focus on what users will learn or accomplish
4. **Unique**: Each page should have a unique description
5. **No Duplication**: Avoid copying the title or first paragraph

### Examples

#### ✅ Good Meta Descriptions

```yaml
# Healthcare Claims Page
description: Learn the complete claims lifecycle in Saudi healthcare, from eligibility checks through NPHIES submission to payment processing and rejection management.

# NPHIES Integration Page
description: Step-by-step guide to integrating with Saudi Arabia's National Platform for Health Information Exchange (NPHIES) using FHIR R4 standards.

# ClaimLinc Agent Page
description: Discover how ClaimLinc AI agent automates claim validation, rejection analysis, and resubmission workflows to reduce processing time by 60%.
```

#### ❌ Poor Meta Descriptions

```yaml
# Too short
description: Claims information

# Too long (over 160 characters)
description: This page provides comprehensive information about the claims lifecycle management system including submission, validation, NPHIES integration, rejection handling, appeals process, and payment tracking workflows.

# Keyword stuffing
description: Claims, healthcare claims, claim submission, claim processing, NPHIES claims, Saudi claims, medical claims, insurance claims
```

## Open Graph and Twitter Cards

Material for MkDocs automatically uses the site-level Open Graph configuration from `mkdocs.yml`. For page-specific overrides, add to front-matter:

```yaml
---
title: NPHIES Integration Guide
description: Complete guide to NPHIES integration with BrainSAIT
social:
  cards: true
  cards_layout_options:
    title: NPHIES Integration
    description: Integrate your healthcare system with Saudi Arabia's national health platform
    image: assets/images/nphies-preview.png
---
```

### Social Preview Images

Create preview images for important pages:

1. **Dimensions**: 1200x630 pixels (Twitter/OG standard)
2. **Format**: PNG or JPG
3. **File Size**: Under 1MB
4. **Content**: Include page title, key visual, and BrainSAIT branding

### Preview Image Guidelines

```
┌─────────────────────────────────────────┐
│  BrainSAIT Logo              [Icon]     │
│                                         │
│  Page Title                             │
│  Short Description                      │
│                                         │
│  [Relevant Diagram or Visual]           │
│                                         │
│  OID: 1.3.6.1.4.1.61026                │
└─────────────────────────────────────────┘
```

## Page Titles

Follow these conventions for page titles:

```yaml
# Format: Specific Topic | Category | BrainSAIT
title: Claims Lifecycle | Healthcare | BrainSAIT

# For main category pages
title: Healthcare Domain | BrainSAIT Knowledge System

# For detailed guides
title: NPHIES FHIR R4 Integration Guide | Technical Documentation
```

## Structured Data

For enhanced search results, consider adding structured data to key pages:

```html
<!-- In page content or custom template override -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "NPHIES Integration Guide",
  "author": {
    "@type": "Organization",
    "name": "BrainSAIT"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-03-20",
  "description": "Complete guide to integrating with Saudi Arabia's NPHIES platform",
  "keywords": "NPHIES, FHIR, healthcare integration, Saudi Arabia"
}
</script>
```

## URL Structure

Maintain clean, descriptive URLs:

```
✅ Good URLs:
/healthcare/claims/lifecycle
/healthcare/nphies/fhir-r4-profile
/tech/agents/claimlinc

❌ Poor URLs:
/page1
/healthcare/claims/page
/docs123
```

## Analytics Integration

### Privacy-Friendly Analytics

Configure analytics in `mkdocs.yml` using privacy-respecting services:

#### Option 1: Plausible Analytics

```yaml
extra:
  analytics:
    provider: custom
    property: plausible
    feedback:
      title: Was this page helpful?
      ratings:
        - icon: material/emoticon-happy-outline
          name: This page was helpful
          data: 1
          note: Thanks for your feedback!
        - icon: material/emoticon-sad-outline
          name: This page could be improved
          data: 0
          note: Thanks! Please create an issue with suggestions.
```

Then add to `overrides/main.html`:

```html
{% extends "base.html" %}

{% block analytics %}
  <script defer data-domain="docs.brainsait.com" src="https://plausible.io/js/script.js"></script>
{% endblock %}
```

#### Option 2: Matomo Analytics

```html
{% block analytics %}
  <script>
    var _paq = window._paq = window._paq || [];
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="//analytics.brainsait.com/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '1']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
  </script>
{% endblock %}
```

### Privacy Compliance

When implementing analytics:

1. **No Personal Data**: Don't track personal information without consent
2. **Cookie Notice**: If using cookies, provide clear notice
3. **Opt-Out**: Provide mechanism to opt out of tracking
4. **Data Retention**: Set appropriate data retention periods
5. **PDPL Compliance**: Follow Saudi Arabia's Personal Data Protection Law

### Tracking Events

Track important user interactions:

```javascript
// Track downloads
document.querySelectorAll('a[download]').forEach(link => {
  link.addEventListener('click', () => {
    plausible('Download', {props: {file: link.href}})
  })
})

// Track external links
document.querySelectorAll('a[href^="http"]').forEach(link => {
  if (!link.href.includes('brainsait.com')) {
    link.addEventListener('click', () => {
      plausible('Outbound Link', {props: {url: link.href}})
    })
  }
})
```

## Search Engine Optimization

### On-Page SEO Checklist

For each documentation page:

- [ ] Unique, descriptive title (50-60 characters)
- [ ] Meta description (150-160 characters)
- [ ] At least one H1 heading
- [ ] Logical heading hierarchy (H1 → H2 → H3)
- [ ] Descriptive link text (no "click here")
- [ ] Alt text for all images
- [ ] Internal links to related content
- [ ] External links to authoritative sources
- [ ] Mobile-friendly formatting
- [ ] Fast page load time

### Keywords Strategy

Target relevant keywords naturally:

**Primary Keywords**:
- BrainSAIT
- Healthcare AI
- NPHIES integration
- Saudi healthcare
- Claims management
- FHIR R4

**Secondary Keywords**:
- Medical billing automation
- Healthcare compliance
- Digital health transformation
- AI healthcare agents
- Revenue cycle management

### Content Quality

Search engines favor:

1. **Comprehensive Content**: In-depth guides over shallow pages
2. **Regular Updates**: Keep content current
3. **Original Content**: Unique insights and examples
4. **User Intent**: Match what users are searching for
5. **Readability**: Clear, well-structured content

## Sitemap

The `sitemap` plugin is configured in `mkdocs.yml` and automatically generates `sitemap.xml`:

```yaml
plugins:
  - search
  - i18n
  - sitemap:
      change_freq: weekly
      priority: 0.8
```

### Priority Guidelines

Set page priorities based on importance:

```
1.0 - Homepage
0.9 - Main category pages (Healthcare, Business, Tech)
0.8 - Important guides (NPHIES, Claims)
0.7 - Sub-category pages
0.6 - Supporting documentation
0.5 - Appendices and references
```

## Canonical URLs

Set in `mkdocs.yml` to avoid duplicate content issues:

```yaml
site_url: https://fadil369.github.io/brainsait-docs/
canonical_url: https://docs.brainsait.com/
```

Canonical URLs help search engines understand the preferred URL for your content.

## Monitoring and Improvement

### Regular SEO Audits

Quarterly checklist:

1. **Technical SEO**
   - [ ] Check for broken links
   - [ ] Verify sitemap.xml is accessible
   - [ ] Test page load speed
   - [ ] Ensure mobile responsiveness

2. **Content SEO**
   - [ ] Review and update meta descriptions
   - [ ] Add missing alt text
   - [ ] Improve internal linking
   - [ ] Update outdated content

3. **Performance**
   - [ ] Review search console data
   - [ ] Analyze user behavior
   - [ ] Identify improvement opportunities
   - [ ] Track ranking for key terms

### Tools

- **Google Search Console**: Monitor search performance
- **Lighthouse**: Test page quality and SEO
- **WebPageTest**: Measure load times
- **WAVE**: Check accessibility (impacts SEO)

---

## Quick Reference

### Ideal Page Structure

```markdown
---
title: Specific Page Title | Category | BrainSAIT
description: Clear, concise description with keywords (150-160 chars)
---

# Main Heading (H1)

Brief introduction with primary keywords.

## Section Heading (H2)

Content with internal and external links.

### Subsection (H3)

Detailed information with examples.

**Related Topics**:
- [Link to related page](../path/to/page.md)
- [Another related topic](../path/to/another.md)
```

### Front-Matter Template

```yaml
---
# Required
title: Page Title
description: Meta description for SEO (150-160 characters)

# Optional
tags:
  - healthcare
  - claims
  - nphies

# For social sharing
social:
  cards: true
---
```

---

**OID**: 1.3.6.1.4.1.61026
