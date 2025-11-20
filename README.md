# BrainSAIT Documentation

Welcome to the BrainSAIT Knowledge System - a comprehensive documentation platform covering Healthcare, Business, Tech & Development, and Personal Development domains.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/brainsait/docs.git
cd brainsait-docs
```

2. **Create virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Serve locally**:
```bash
mkdocs serve
```

5. **Open in browser**:
Navigate to `http://127.0.0.1:8000`

## 📚 Documentation Structure

```
docs/
├── healthcare/          # Healthcare domain
│   ├── overview/       # Saudi healthcare landscape
│   ├── claims/         # Claims & reimbursement
│   ├── nphies/         # NPHIES integration
│   ├── agents/         # Healthcare agents
│   └── sop/            # Standard operating procedures
├── business/           # Business domain
│   ├── strategy/       # Mission, vision, strategy
│   ├── products/       # Product catalog
│   ├── partners/       # Partner programs
│   └── pricing/        # Pricing models
├── tech/               # Tech & development
│   ├── infrastructure/ # Cloud & edge infrastructure
│   ├── agents/         # Agent ecosystem
│   ├── apps/           # Application documentation
│   └── devops/         # CI/CD & deployment
├── personal/           # Personal development
│   ├── mindset.md
│   ├── productivity.md
│   └── leadership.md
├── brand/              # Brand identity
│   └── index.md
└── appendices/         # Reference materials
    └── glossary_master.md
```

## 🎯 Key Features

- **Bilingual Support**: English and Arabic content
- **Code Examples**: Practical implementation guides
- **Agent Documentation**: Comprehensive agent ecosystem docs
- **SOPs**: Standard operating procedures
- **API References**: Technical specifications
- **Compliance Guides**: PDPL, HIPAA, and regulatory compliance

## 🏥 Healthcare Documentation

- NPHIES integration guides
- Claims lifecycle management
- FHIR R4 implementation
- BrainSAIT Health Linc agents
- RCM optimization playbooks

## 💼 Business Documentation

- Strategic vision and mission
- Product catalog
- Market analysis
- Partner programs
- Pricing strategies

## 🛠️ Tech Documentation

- Infrastructure architecture
- Cloudflare integration
- Coolify deployment
- Agent development guides
- API specifications

## 🌟 Personal Development

- Leadership frameworks
- Productivity systems
- Learning methodologies
- Ethics and AI

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-docs`)
3. Commit your changes (`git commit -m 'Add amazing documentation'`)
4. Push to the branch (`git push origin feature/amazing-docs`)
5. Open a Pull Request

### Documentation Standards

- Use clear, concise language
- Include code examples where applicable
- Add bilingual content (EN/AR) for key sections
- Follow the existing structure
- Include YAML frontmatter in markdown files

## 📝 Building for Production

```bash
# Build static site
mkdocs build

# Output will be in ./site directory
```

## 🚢 Deployment

### Cloudflare Pages

```bash
# Deploy to Cloudflare Pages
wrangler pages publish site
```

### GitHub Pages

```bash
# Deploy to GitHub Pages
mkdocs gh-deploy
```

## 🔧 Configuration

The documentation is configured through `mkdocs.yml`:

- **Theme**: Material for MkDocs
- **Plugins**: Search, i18n
- **Extensions**: Admonitions, code highlighting, tabs
- **Navigation**: Structured by domain

## 📖 Documentation Conventions

### YAML Frontmatter

```yaml
---
title: Document Title
domain: healthcare|business|tech|personal
chapter: chapter_name
version: 1.0.0
last_updated: 2025-01-15
---
```

### Code Comments

```python
# BRAINSAIT: System-level annotation
# AGENT: Agent-specific functionality
# MEDICAL: Healthcare/clinical context
# NEURAL: AI/ML components
```

## 🔐 Security & Compliance

All documentation follows:
- PDPL (Personal Data Protection Law) guidelines
- HIPAA alignment for healthcare content
- Secure coding practices
- Audit logging standards

## 📞 Support

- **Email**: docs@brainsait.com
- **Website**: https://brainsait.com
- **GitHub Issues**: https://github.com/brainsait/docs/issues

## 📄 License

Copyright © 2025 BrainSAIT. All rights reserved.

## 🙏 Acknowledgments

Built with:
- [MkDocs](https://www.mkdocs.org/)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

---

**BrainSAIT** | Healthcare Intelligence Platform  
OID: 1.3.6.1.4.1.61026
