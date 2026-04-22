---
title: التقنية
description: البنية التحتية التقنية والوكلاء والتطبيقات لبرينسايت
tags:
  - tech
  - infrastructure
  - agents
  - devops
---

# التقنية

مركز التوثيق التقني لبرينسايت.

---

## نظرة عامة على الأقسام

<div class="grid cards" markdown>

-   :material-server:{ .lg .middle } **البنية التحتية**

    ---

    Cloudflare و Coolify ومجموعة Raspberry

    [:octicons-arrow-right-24: Cloudflare](infrastructure/cloudflare.md)

-   :material-robot:{ .lg .middle } **الوكلاء**

    ---

    منظومة LINC والوكلاء المتخصصون

    [:octicons-arrow-right-24: منظومة LINC](agents/linc_ecosystem.md)

-   :material-application:{ .lg .middle } **التطبيقات**

    ---

    HealthSync و Efhm RAG و Voice2Care

    [:octicons-arrow-right-24: HealthSync](apps/healthsync.md)

-   :material-infinity:{ .lg .middle } **DevOps**

    ---

    CI/CD وإدارة الأسرار والمراقبة

    [:octicons-arrow-right-24: CI/CD](devops/cicd.md)

-   :material-api:{ .lg .middle } **APIs**

    ---

    واجهات داخلية وتكامل نفيس

    [:octicons-arrow-right-24: واجهات نفيس](apis/nphies.md)

-   :material-sitemap:{ .lg .middle } **الهندسة**

    ---

    نظرة عامة على النظام ونماذج البيانات

    [:octicons-arrow-right-24: نظرة عامة](architecture/overview.md)

</div>

---

## المكدس التقني

### البنية التحتية
- **CDN/WAF**: Cloudflare
- **الاستضافة**: Coolify على Hetzner
- **الحوسبة الطرفية**: مجموعة Raspberry Pi

### التطوير
- **الواجهة الأمامية**: Next.js, React, TypeScript
- **الواجهة الخلفية**: Node.js, Python, FastAPI
- **قواعد البيانات**: PostgreSQL, Redis, MongoDB

### الذكاء الاصطناعي
- **النماذج**: Claude, GPT-4, النماذج المحلية
- **RAG**: Efhm مع embeddings متقدمة
- **الصوت**: Whisper, TTS

---

## منظومة الوكلاء

| الوكيل | الوظيفة | التقنية |
|-------|--------|---------|
| MasterLinc | التنسيق الرئيسي | Multi-agent orchestration |
| DevLinc | مساعد التطوير | Code analysis, generation |
| DataLinc | عمليات البيانات | ETL, analytics |
| SecUnit | الأمان | Security monitoring |

---

## البدء السريع للمطورين

1. راجع [نظرة عامة على الهندسة](architecture/overview.md)
2. فهم [منظومة LINC](agents/linc_ecosystem.md)
3. إعداد [CI/CD](devops/cicd.md)
4. استخدم [واجهات نفيس](apis/nphies.md)

---

## أفضل الممارسات

- اتبع معايير الكود في [DevLinc](agents/devlinc.md)
- طبق [إدارة الأسرار](devops/vault_secrets.md)
- راقب باستخدام [المراقبة](devops/monitoring.md)
