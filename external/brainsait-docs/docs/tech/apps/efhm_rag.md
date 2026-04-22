# EFHM RAG Application

## Overview

EFHM RAG (Retrieval-Augmented Generation) is BrainSAIT's knowledge retrieval system that enables intelligent querying of healthcare documentation and policies.

---

## Core Features

### Knowledge Retrieval
- Semantic search
- Context-aware responses
- Multi-document synthesis

### Healthcare Focus
- NPHIES documentation
- Payer policies
- Clinical guidelines
- SOPs

### RAG Architecture
- Vector embeddings
- Chunk optimization
- Re-ranking
- Source citation

---

## Architecture

```mermaid
graph LR
    Q[Query] --> E[Embeddings]
    E --> R[Retrieval]
    R --> C[Context]
    C --> G[Generation]
    G --> A[Answer]
```

---

## Use Cases

- Policy queries
- Procedure lookups
- Compliance questions
- Training support

---

## Related Documents

- [DataLinc](../agents/datalinc.md)
- [DocsLinc](../../healthcare/agents/DocsLinc.md)
- [Architecture Overview](../architecture/overview.md)

---

*Last updated: January 2025*
