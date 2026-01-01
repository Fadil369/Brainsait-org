# BrainSAIT Documentation

[![Build Status](https://github.com/Fadil369/brainsait-docs/actions/workflows/docs.yml/badge.svg)](https://github.com/Fadil369/brainsait-docs/actions)
[![Documentation](https://img.shields.io/badge/docs-online-blue)](https://fadil369.github.io/brainsait-docs/)

Welcome to the BrainSAIT Knowledge System - a comprehensive documentation platform covering Healthcare, Business, Tech & Development, and Personal Development domains.

## Quick Start

### Prerequisites

- Python 3.8+
- pip
- Node.js 18+ (for linting tools)

### Installation

1. **Clone the repository**:

```bash
git clone https://github.com/fadil369/brainsait-docs.git
cd brainsait-docs
```

2. **Create virtual environment**:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:

```bash
make install
# Or manually: pip install -r requirements.txt
```

4. **Serve locally**:

```bash
make serve
# Or manually: mkdocs serve
```

5. **Open in browser**:
   Navigate to http://127.0.0.1:8000

## Development Commands

| Command | Description |
|---------|-------------|
| make install | Install all dependencies |
| make serve | Start local development server |
| make build | Build static site |
| make lint | Run all linters |
| make test | Run tests and validation |
| make clean | Remove build artifacts |
| make ar-generate | Generate Arabic placeholder files |
| make pre-commit | Run pre-commit hooks |

## Documentation Structure

```
docs/
├── healthcare/          # Healthcare domain
│   ├── overview/        # Saudi healthcare landscape
│   ├── claims/          # Claims & reimbursement
│   ├── nphies/          # NPHIES integration
│   ├── agents/          # Healthcare agents
│   ├── cloudpital/      # Cloudpital EMR/RCM integration
│   └── sop/             # Standard operating procedures
├── business/            # Business domain
│   ├── strategy/        # Mission, vision, strategy
│   ├── products/        # Product catalog
│   ├── partners/        # Partner programs
│   └── pricing/         # Pricing models
├── tech/                # Tech & development
│   ├── infrastructure/  # Cloud & edge infrastructure
│   ├── agents/          # Agent ecosystem
│   ├── apps/            # Application documentation
│   └── devops/          # CI/CD & deployment
├── personal/            # Personal development
├── brand/               # Brand identity & templates
└── appendices/          # Reference materials
```

## Key Features

- **Bilingual Support**: English and Arabic content with RTL support
- **Code Examples**: Practical implementation guides
- **Agent Documentation**: Comprehensive LINC agent ecosystem docs
- **SOPs**: Standard operating procedures
- **API References**: Technical specifications
- **Compliance Guides**: PDPL, HIPAA, and regulatory compliance

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-docs)
3. Install pre-commit hooks (pre-commit install)
4. Make your changes
5. Run linters (make lint)
6. Commit your changes (git commit -m 'Add amazing documentation')
7. Push to the branch (git push origin feature/amazing-docs)
8. Open a Pull Request

### Documentation Standards

- Use clear, concise language
- Include code examples where applicable
- Add bilingual content (EN/AR) for key sections
- Follow the existing structure
- Include YAML frontmatter in markdown files

## Building for Production

```bash
# Build static site
make build

# Output will be in ./site directory
```

## Deployment

### GitHub Pages (Automated)

Pushing to main-enterprise branch automatically deploys via GitHub Actions.

### Manual Deployment

```bash
# Deploy to GitHub Pages
make deploy

# Or with MkDocs directly
mkdocs gh-deploy --force
```

## Security

Please see [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

## Configuration

The documentation is configured through:

- mkdocs.yml - Main MkDocs configuration
- .markdownlint.json - Markdown linting rules
- .pre-commit-config.yaml - Pre-commit hooks
- .editorconfig - Editor configuration

## License

Copyright © 2026 BrainSAIT. All rights reserved.

## Support

- **Email**: docs@brainsait.com
- **Website**: https://brainsait.com
- **GitHub Issues**: https://github.com/fadil369/brainsait-docs/issues

---

**BrainSAIT** | Healthcare Intelligence Platform
OID: 1.3.6.1.4.1.61026
