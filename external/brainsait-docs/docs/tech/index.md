---
title: Tech Documentation
description: Technical infrastructure, agents, apps, and DevOps for BrainSAIT
tags:
  - tech
  - infrastructure
  - agents
  - devops
---

# Tech Documentation

**Volume 3: BrainSAIT Technical Infrastructure & Development**

---

## Overview

This volume covers all technical aspects of BrainSAIT including infrastructure, agentic AI systems, applications, DevOps practices, and security.

---

## Table of Contents

### Infrastructure

1. [Cloudflare](infrastructure/cloudflare.md)
2. [Coolify](infrastructure/coolify.md)
3. [Raspberry Cluster](infrastructure/raspberry_cluster.md)
4. [Security](infrastructure/security.md)

### Agents

5. [MasterLinc](agents/masterlinc.md)
6. [DevLinc](agents/devlinc.md)
7. [DataLinc](agents/datalinc.md)
8. [SecUnit](agents/secunit.md)
9. [Skill Bundles](agents/skill_bundles.md)

### Apps

10. [HealthSync](apps/healthsync.md)
11. [Efhm RAG](apps/efhm_rag.md)
12. [Voice2Care](apps/voice2care.md)
13. [Spark Solo Suite](apps/spark_solo_suite.md)

### DevOps

14. [CI/CD](devops/cicd.md)
15. [Secrets Management](devops/vault_secrets.md)
16. [Monitoring](devops/monitoring.md)

### APIs

17. [API Overview](apis/overview.md)
18. [Authentication](apis/authentication.md)
19. [NPHIES Integration](apis/nphies.md)

### Architecture

20. [System Overview](architecture/overview.md)
21. [Data Models](architecture/data_models.md)

---

## Technology Stack

### Cloud Infrastructure

| Technology | Purpose |
|------------|---------|
| Cloudflare | Edge computing, DNS, security |
| Coolify | Container orchestration |
| D1 | Edge database |
| R2 | Object storage |
| Workers | Serverless functions |

### Development

| Technology | Purpose |
|------------|---------|
| Python | Backend, AI/ML |
| Swift | iOS apps |
| TypeScript | Web frontend |
| n8n | Workflow automation |
| Docker | Containerization |

### AI/ML

| Technology | Purpose |
|------------|---------|
| Claude API | LLM processing |
| ChromaDB | Vector database |
| Anthropic SDK | Agent framework |

---

## Agent Architecture

### MasterLinc Orchestration

```
┌─────────────────────────────────────┐
│           MasterLinc                 │
│     (Orchestration Layer)            │
└───────────────┬─────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│ClaimLinc│ │DocsLinc│ │PolicyLinc│
└───────┘  └───────┘  └─────────┘
```

### Agent Capabilities

| Agent | Capabilities |
|-------|-------------|
| **MasterLinc** | Orchestration, task routing, coordination |
| **DevLinc** | Code generation, review, deployment |
| **DataLinc** | ETL, analytics, reporting |
| **SecUnit** | Security monitoring, threat response |

---

## Security Framework

### Compliance

- [x] PDPL aligned
- [x] HIPAA controls
- [x] SOC 2 practices

### Security Layers

1. **Edge Security** - Cloudflare WAF, DDoS protection
2. **Transport** - TLS 1.3 everywhere
3. **Application** - OAuth 2.0, RBAC
4. **Data** - AES-256 encryption
5. **Audit** - Complete logging

---

## Development Workflow

### CI/CD Pipeline

```
Code → Lint → Test → Build → Stage → Deploy
```

### Branch Strategy

- `main` - Production ready
- `develop` - Integration branch
- `feature/*` - New features
- `hotfix/*` - Emergency fixes

---

## Quick Links

- [Healthcare Agents](../healthcare/agents/ClaimLinc.md)
- [Business Overview](../business/index.md)
- [Master Glossary](../appendices/glossary_master.md)

---

**BrainSAIT Tech**

OID: `1.3.6.1.4.1.61026`
