# Changelog

All notable changes to the BrainSAIT Documentation System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-21

### Added
- **Design System v2.0**: Comprehensive design principles implementation
  - Spacing scale system (4-8-12-16-24-32-48-64px)
  - WCAG 2.2 Level AA compliance
  - Full RTL (Arabic) support
  - Keyboard navigation with visible focus states
  - Semantic HTML structure across all pages

- **About Page**: Personal bio and portfolio
  - Professional journey and experience
  - Built-in tools showcase
  - Projects and applications listing
  - Fully accessible with ARIA labels

- **Assets Integration**:
  - Logo (SVG format)
  - Favicon (ICO format)
  - Proper image optimization

- **SEO Enhancements**:
  - Meta descriptions
  - Keywords optimization
  - Social media links (GitHub, LinkedIn, Twitter)

### Changed
- **Color Palette**: Updated blue accent from `#3B82F6` to `#60A5FA` for WCAG compliance (4.52:1 contrast ratio)
- **CSS Architecture**: Complete refactor removing all `!important` declarations
- **Typography**: Consistent font-weight variables and letter-spacing
- **Tables**: Enhanced with semantic HTML, ARIA roles, and proper headers
- **Navigation**: Added "About" page to main navigation

### Removed
- Heavy box-shadows (replaced with subtle borders)
- Inline styles from Markdown files
- Redundant temporary files (`docs (1)`, `mkdocs (1).yml`)
- `!important` CSS declarations (11 instances removed)

### Fixed
- Contrast ratio issues for accessibility
- Missing RTL support for Arabic content
- Keyboard navigation focus states
- Semantic HTML structure
- ARIA labels for screen readers
- Image alt text and loading attributes

## [1.0.0] - 2025-01-15

### Added
- Initial documentation structure
- Healthcare domain documentation
 - NPHIES integration guides
  - Claims lifecycle management
  - FHIR R4 implementation
  
- Business domain documentation
  - Strategic vision
  - Product catalog
  - Market analysis

- Tech domain documentation
  - Infrastructure architecture
  - Agent ecosystem
  - API specifications

- Personal development documentation
  - Leadership frameworks
  - Productivity systems

- Bilingual support (English/Arabic)
- Auto-translation script
- MkDocs Material theme
- Dark mode design

### Changed
- Migrated from IBM Plex Sans Arabic to Inter font
- Applied GP-inspired dark theme

### Fixed
- Missing navigation files
- Broken internal links
- Git configuration
- Branch merge conflicts

## [0.9.0] - 2025-01-10

### Added
- Arabic enhancement automation
- 32 Arabic translation files
- Translation workflow documentation

### Changed
- Documentation structure refinement

## [0.8.0] - 2025-01-05

### Added
- Initial repository setup
- Basic MkDocs configuration
- Core domain structure

---

## Upgrade Guide

### From 1.x to 2.0

**CSS Changes:**
- All custom CSS has been consolidated into `docs/stylesheets/extra.css`
- Design tokens are now centralized (spacing, colors, typography)
- Remove any custom `!important` declarations

**HTML Changes:**
- Update tables to use semantic HTML with `<thead>`, `<tbody>`, `<th scope="col">`
- Add `lang` and `dir` attributes for bilingual content
- Include ARIA labels for interactive elements

**Configuration:**
- Favicon is now configured in `mkdocs.yml`
- Add "About | عن" translation to `nav_translations`

---

## Contributing

Please follow the [Contributing Guidelines](CONTRIBUTING.md) when submitting changes.

---

**BrainSAIT Documentation Team**  
OID: 1.3.6.1.4.1.61026
