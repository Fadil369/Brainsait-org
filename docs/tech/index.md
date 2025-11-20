---
title: Tech Documentation | التوثيق التقني
description: Technical infrastructure, agents, apps, and DevOps for BrainSAIT
tags:
  - tech
  - infrastructure
  - agents
  - devops
---

# Tech Documentation
# التوثيق التقني

**Volume 3: BrainSAIT Technical Infrastructure & Development**

**المجلد الثالث: البنية التحتية التقنية والتطوير لبرينسايت**

---

## Overview | نظرة عامة

This volume covers all technical aspects of BrainSAIT including infrastructure, agentic AI systems, applications, DevOps practices, and security.

يغطي هذا المجلد جميع الجوانب التقنية لبرينسايت بما في ذلك البنية التحتية وأنظمة الذكاء الاصطناعي الوكيل والتطبيقات وممارسات ديف أوبس والأمان.

---

## Table of Contents | جدول المحتويات

### Infrastructure | البنية التحتية

1. [Cloudflare | كلاود فلير](infrastructure/cloudflare.md)
2. [Coolify | كوليفاي](infrastructure/coolify.md)
3. [Raspberry Cluster | مجموعة راسبيري](infrastructure/raspberry_cluster.md)
4. [Security | الأمان](infrastructure/security.md)

### Agents | الوكلاء

5. [MasterLinc | ماستر لينك](agents/masterlinc.md)
6. [DevLinc | ديف لينك](agents/devlinc.md)
7. [DataLinc | داتا لينك](agents/datalinc.md)
8. [SecUnit | وحدة الأمان](agents/secunit.md)
9. [Skill Bundles | حزم المهارات](agents/skill_bundles.md)

### Apps | التطبيقات

10. [HealthSync | هيلث سينك](apps/healthsync.md)
11. [Efhm RAG | إفهم](apps/efhm_rag.md)
12. [Voice2Care | فويس تو كير](apps/voice2care.md)
13. [Spark Solo Suite | سبارك سولو](apps/spark_solo_suite.md)

### DevOps | ديف أوبس

14. [CI/CD](devops/cicd.md)
15. [Secrets Management | إدارة الأسرار](devops/vault_secrets.md)
16. [Monitoring | المراقبة](devops/monitoring.md)

### APIs

17. [Internal APIs | واجهات داخلية](apis/internal.md)
18. [NPHIES Integration | تكامل نفيس](apis/nphies.md)

### Architecture | الهندسة

19. [System Overview | نظرة عامة](architecture/overview.md)
20. [Data Models | نماذج البيانات](architecture/data_models.md)

---

## Technology Stack | المكدس التقني

### Cloud Infrastructure | البنية السحابية

| Technology | التقنية | Purpose | الغرض |
|------------|---------|---------|-------|
| Cloudflare | كلاود فلير | Edge computing, DNS, security | الحوسبة الطرفية، DNS، الأمان |
| Coolify | كوليفاي | Container orchestration | تنسيق الحاويات |
| D1 | D1 | Edge database | قاعدة بيانات طرفية |
| R2 | R2 | Object storage | تخزين الكائنات |
| Workers | Workers | Serverless functions | دوال بدون خادم |

### Development | التطوير

| Technology | التقنية | Purpose | الغرض |
|------------|---------|---------|-------|
| Python | بايثون | Backend, AI/ML | الخلفية، الذكاء الاصطناعي |
| Swift | سويفت | iOS apps | تطبيقات iOS |
| TypeScript | تايب سكريبت | Web frontend | واجهة الويب |
| n8n | n8n | Workflow automation | أتمتة سير العمل |
| Docker | دوكر | Containerization | الحاويات |

### AI/ML | الذكاء الاصطناعي

| Technology | التقنية | Purpose | الغرض |
|------------|---------|---------|-------|
| Claude API | واجهة كلود | LLM processing | معالجة النماذج اللغوية |
| ChromaDB | كروما DB | Vector database | قاعدة بيانات متجهية |
| Anthropic SDK | SDK أنثروبيك | Agent framework | إطار الوكلاء |

---

## Agent Architecture | هندسة الوكلاء

### MasterLinc Orchestration | تنسيق ماستر لينك

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

### Agent Capabilities | قدرات الوكلاء

| Agent | القدرات |
|-------|---------|
| **MasterLinc** | Orchestration, task routing, coordination | التنسيق، توجيه المهام |
| **DevLinc** | Code generation, review, deployment | توليد الكود، المراجعة، النشر |
| **DataLinc** | ETL, analytics, reporting | ETL، التحليلات، التقارير |
| **SecUnit** | Security monitoring, threat response | مراقبة الأمان، الاستجابة |

---

## Security Framework | إطار الأمان

### Compliance | الامتثال

- [x] PDPL aligned | متوافق مع نظام حماية البيانات
- [x] HIPAA controls | ضوابط HIPAA
- [x] SOC 2 practices | ممارسات SOC 2

### Security Layers | طبقات الأمان

1. **Edge Security** - Cloudflare WAF, DDoS protection
2. **Transport** - TLS 1.3 everywhere
3. **Application** - OAuth 2.0, RBAC
4. **Data** - AES-256 encryption
5. **Audit** - Complete logging

---

## Development Workflow | سير عمل التطوير

### CI/CD Pipeline | خط CI/CD

```
Code → Lint → Test → Build → Stage → Deploy
الكود ← التدقيق ← الاختبار ← البناء ← التجربة ← النشر
```

### Branch Strategy | استراتيجية الفروع

- `main` - Production ready | جاهز للإنتاج
- `develop` - Integration branch | فرع التكامل
- `feature/*` - New features | ميزات جديدة
- `hotfix/*` - Emergency fixes | إصلاحات طارئة

---

## Quick Links | روابط سريعة

- [Healthcare Agents | وكلاء الصحة](../healthcare/agents/ClaimLinc.md)
- [Business Overview | نظرة الأعمال](../business/index.md)
- [Master Glossary | المصطلحات](../appendices/glossary_master.md)

---

**BrainSAIT Tech** | تقنية برينسايت

OID: `1.3.6.1.4.1.61026`
