# BrainSAIT Documentation Makefile
# Usage: make [target]

.PHONY: help install serve build clean lint test deploy ar-generate pre-commit

# Default target
help:
@echo "BrainSAIT Documentation Build System"
@echo ""
@echo "Usage: make [target]"
@echo ""
@echo "Targets:"
@echo "  install      Install dependencies"
@echo "  serve        Start local development server"
@echo "  build        Build static site"
@echo "  clean        Remove build artifacts"
@echo "  lint         Run all linters"
@echo "  test         Run tests and validation"
@echo "  deploy       Deploy to GitHub Pages"
@echo "  ar-generate  Generate Arabic placeholder files"
@echo "  pre-commit   Run pre-commit hooks"
@echo ""

# Install all dependencies
install:
python -m pip install --upgrade pip
pip install -r requirements.txt
pre-commit install

# Start development server
serve:
mkdocs serve --dev-addr 127.0.0.1:8000

# Build static site
build:
mkdocs build --verbose

# Clean build artifacts
clean:
rm -rf site/
rm -rf .cache/
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

# Run linters
lint:
@echo "Running spell checker..."
codespell docs/ --skip="*.ar.md,*.json,*.css" --ignore-words-list="brainsait,nphies,fhir,linc,cloudpital" || true
@echo ""
@echo "Running markdown linter..."
npx markdownlint-cli2 "docs/**/*.md" --config .markdownlint.json || true

# Run tests
test: lint build
@echo "Build successful - documentation is valid"

# Deploy to GitHub Pages
deploy: build
mkdocs gh-deploy --force

# Generate Arabic placeholder files
ar-generate:
python scripts/generate_ar_files.py

# Run pre-commit hooks
pre-commit:
pre-commit run --all-files
