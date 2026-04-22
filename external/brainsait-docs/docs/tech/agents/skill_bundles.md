# Skill Bundles

## Overview

Skill Bundles are modular capability packages that extend BrainSAIT agents with specific functionalities. This document describes the skill bundle architecture, available bundles, and how to create custom skills.

---

## Architecture

### Bundle Structure

```
skill-bundle/
├── manifest.yaml
├── skills/
│   ├── skill1.py
│   └── skill2.py
├── prompts/
│   ├── system.md
│   └── examples/
├── models/
│   └── config.yaml
├── tests/
│   └── test_skills.py
└── README.md
```

### Manifest Schema

```yaml
name: claims-analysis
version: 1.2.0
description: Advanced claims analysis capabilities
author: BrainSAIT
license: proprietary

dependencies:
  - core >= 1.0
  - nlp >= 2.0

skills:
  - name: rejection-analyzer
    entry: skills/rejection_analyzer.py
    class: RejectionAnalyzer

  - name: code-suggester
    entry: skills/code_suggester.py
    class: CodeSuggester

config:
  model: claude-sonnet-4-5-20250929
  temperature: 0.1
  max_tokens: 4096
```

---

## Core Skill Bundles

### Healthcare Bundle

**Name:** `healthcare-core`

**Skills:**
- `claim-validator` - FHIR claim validation
- `code-mapper` - ICD-10/CPT mapping
- `policy-checker` - Coverage verification
- `document-extractor` - Medical document processing

**Dependencies:**
- Medical terminology models
- FHIR validator
- Coding databases

### Document Processing Bundle

**Name:** `document-processing`

**Skills:**
- `ocr-engine` - Text extraction
- `table-extractor` - Table recognition
- `form-parser` - Form field extraction
- `layout-analyzer` - Document structure

**Dependencies:**
- Tesseract OCR
- Computer vision models
- Layout models

### Analytics Bundle

**Name:** `analytics-core`

**Skills:**
- `trend-analyzer` - Pattern detection
- `anomaly-detector` - Outlier identification
- `forecaster` - Predictions
- `report-generator` - Auto reporting

**Dependencies:**
- Statistical models
- Time series models
- Visualization libraries

---

## Installing Bundles

### From Registry

```bash
# Install from BrainSAIT registry
brainsait bundle install healthcare-core

# Install specific version
brainsait bundle install healthcare-core@1.2.0

# List installed bundles
brainsait bundle list
```

### From Source

```bash
# Install from local path
brainsait bundle install ./my-bundle

# Install from Git
brainsait bundle install git://github.com/brainsait/bundle.git
```

---

## Using Skills

### In Agent Configuration

```yaml
# agent.yaml
name: ClaimLinc
version: 1.0

bundles:
  - healthcare-core
  - document-processing

skills:
  - rejection-analyzer
  - code-mapper
  - document-extractor

config:
  rejection-analyzer:
    confidence_threshold: 0.85
```

### In Code

```python
from brainsait.agents import Agent
from brainsait.skills import SkillRegistry

# Load agent with skills
agent = Agent.load("ClaimLinc")

# Use skill directly
result = agent.skills.rejection_analyzer.analyze(claim_data)

# Or through agent execution
response = agent.execute(
    task="analyze_rejection",
    data=claim_data
)
```

---

## Creating Custom Skills

### Basic Skill

```python
from brainsait.skills import Skill, skill_method

class CustomAnalyzer(Skill):
    """Custom analysis skill."""

    name = "custom-analyzer"
    version = "1.0.0"

    def __init__(self, config):
        super().__init__(config)
        self.threshold = config.get('threshold', 0.8)

    @skill_method
    async def analyze(self, data: dict) -> dict:
        """Analyze input data.

        Args:
            data: Input data to analyze

        Returns:
            Analysis results
        """
        # Implementation
        result = self._process(data)
        return {
            'status': 'success',
            'confidence': result.confidence,
            'findings': result.findings
        }

    def _process(self, data):
        # Internal processing logic
        pass
```

### Skill with AI

```python
from brainsait.skills import AISkill, skill_method

class IntelligentAnalyzer(AISkill):
    """AI-powered analysis skill."""

    system_prompt = """
    You are an expert medical claims analyzer.
    Analyze the provided claim data and identify issues.
    """

    @skill_method
    async def analyze(self, claim: dict) -> dict:
        response = await self.llm.complete(
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": json.dumps(claim)}
            ],
            temperature=0.1
        )

        return self._parse_response(response)
```

---

## Testing Skills

### Unit Tests

```python
import pytest
from my_bundle.skills import CustomAnalyzer

@pytest.fixture
def analyzer():
    config = {'threshold': 0.8}
    return CustomAnalyzer(config)

async def test_analyze_valid_data(analyzer):
    data = {'field': 'value'}
    result = await analyzer.analyze(data)

    assert result['status'] == 'success'
    assert result['confidence'] >= 0.8

async def test_analyze_invalid_data(analyzer):
    with pytest.raises(ValidationError):
        await analyzer.analyze({})
```

### Integration Tests

```python
async def test_skill_integration():
    agent = Agent.load("TestAgent")

    result = await agent.execute(
        task="analyze",
        data=test_data
    )

    assert result.success
    assert len(result.findings) > 0
```

---

## Bundle Versioning

### Semantic Versioning

- **Major:** Breaking changes
- **Minor:** New features (backward compatible)
- **Patch:** Bug fixes

### Compatibility

```yaml
# Specify compatibility in manifest
compatibility:
  min_core: 1.0.0
  max_core: 2.0.0

dependencies:
  - nlp ^2.0  # Compatible with 2.x
  - utils ~1.2  # Compatible with 1.2.x
```

---

## Distribution

### Publishing

```bash
# Build bundle
brainsait bundle build

# Publish to registry
brainsait bundle publish

# Private registry
brainsait bundle publish --registry private.registry.com
```

### Registry Management

```bash
# Add registry
brainsait registry add private https://private.registry.com

# Set credentials
brainsait registry login private

# List registries
brainsait registry list
```

---

## Best Practices

### Design

1. Single responsibility per skill
2. Clear interfaces
3. Comprehensive documentation
4. Thorough testing

### Performance

1. Async operations
2. Efficient caching
3. Resource management
4. Error handling

### Security

1. Input validation
2. Output sanitization
3. Secure dependencies
4. Audit logging

---

## Related Documents

- [MasterLinc](masterlinc.md)
- [DevLinc](devlinc.md)
- [Architecture Overview](../architecture/overview.md)
- [API Reference](../apis/overview.md)

---

*Last updated: January 2025*
