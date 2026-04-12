# BrainSAIT Routing Architecture

## Overview

Request routing in BrainSAIT follows a layered dispatch model:

```
User Message
     │
     ▼
Pipeline Functions (PHI Guardian → Compliance Auditor → Bilingual Formatter)
     │
     ▼
MASTERLINC (intent classification + agent selection)
     │
     ├─► ClaimLinc      (claims, billing, denials)
     ├─► AuthLinc       (prior authorization)
     ├─► DRGLinc        (DRG optimization)
     ├─► ClinicalLinc   (clinical decision support)
     ├─► HealthcareLinc (patient journey)
     ├─► RadioLinc      (radiology reports)
     ├─► CodeLinc       (medical coding)
     ├─► BridgeLinc     (FHIR/HL7 integration)
     ├─► ComplianceLinc (audit, compliance)
     ├─► TTLinc         (medical translation)
     ├─► Basma          (patient communication)
     └─► NPHIES Agent   (NPHIES operations)
     │
     ▼
Response → Bilingual Formatter → User
```

---

## MASTERLINC Routing Rules

MASTERLINC classifies intent using keywords and context:

| Keywords / Context | Routes To |
|-------------------|-----------|
| claim, denial, billing, payer, reimbursement | ClaimLinc |
| prior auth, authorization, PA, approval request | AuthLinc |
| DRG, case-mix, grouper, weight | DRGLinc |
| diagnosis, symptoms, differential, drug, dose | ClinicalLinc |
| patient, appointment, admission, discharge | HealthcareLinc |
| radiology, CT, MRI, X-ray, imaging, report | RadioLinc |
| ICD, CPT, code, coding, DRG assign | CodeLinc |
| FHIR, bundle, HL7, interoperability | BridgeLinc |
| compliance, HIPAA, PDPO, audit, breach | ComplianceLinc |
| translate, Arabic, English, ترجم | TTLinc |
| patient message, SMS, WhatsApp, appointment reminder | Basma |
| NPHIES, eligibility, batch submit, remittance | NPHIES Agent |

---

## Channel-Level Routing

Each workspace channel can override MASTERLINC with a pinned agent:

```
Admin Panel → Channels → [channel] → Default Model → [AgentID]
```

Example overrides:
- **💰 Tawnia Claims** → ClaimLinc (no routing needed, always claims)
- **🩻 Radiology Desk** → RadioLinc
- **🌍 Translation Hub** → TTLinc

---

## Tool-Level Routing

Agents have tools registered. When an agent needs external data:

```
Agent generates tool_call JSON
     │
     ▼
Open-WebUI tool executor
     │
     ├─► Python tool function
     ├─► External API (NPHIES, Oracle RAD, FHIR server)
     └─► Returns result to agent context
```

Tool-to-agent assignment (key mappings):

| Tool | Assigned Agents |
|------|----------------|
| nphies_eligibility | ClaimLinc, AuthLinc, NPHIES Agent |
| claims_processor | ClaimLinc, NPHIES Agent |
| fhir_validator | BridgeLinc, NPHIES Agent |
| drg_optimizer | DRGLinc, CodeLinc |
| clinical_decision_support | ClinicalLinc, HealthcareLinc |
| radiology_report | RadioLinc |
| icd10_lookup | CodeLinc, ClinicalLinc |
| compliance_checker | ComplianceLinc |
| translation_service | TTLinc |
| appointment_scheduler | Basma, HealthcareLinc |

---

## External Routing

### GitHub Models Proxy
```
open-webui → http://localhost:8888 → models.github.ai
```
Models: gpt-4o, gpt-4.1, DeepSeek-R1, DeepSeek-V3-0324

### Ollama (local models)
```
open-webui → http://host.docker.internal:11434 → ollama
```
Models: deepseek-r1:7b, qwen2.5:3b, nemotron-3-nano:30b

### Cloudflare MCP (tools via Workers)
```
Agents → mcp.elfadil.com → brainsait-mcp-worker (Cloudflare) → external APIs
```
> Do NOT modify `mcp.elfadil.com` / `hayath-tunnel` configuration.

---

## Failover

If MASTERLINC cannot determine the agent:
1. Returns a clarifying question to the user
2. Offers a menu of available agents
3. Never silently fails — always responds

Agent-level failover:
- Primary model unavailable → falls back to `gpt-4.1` via GitHub proxy
- GitHub proxy down → falls back to `ollama/deepseek-r1:7b` local
