# 🤖 BrainSAIT LINC Agents Reference

> **Platform:** BrainSAIT Healthcare OS (BOS) v6.0  
> **Base URL:** https://work.elfadil.com  
> **Total LINC Agents:** 13 specialist agents + 1 orchestrator

---

## 🧠 Architecture Overview

All agents are registered in Open-WebUI and powered by frontier models. The **MASTERLINC** orchestrator routes requests to specialist agents via the `brainsait_a2a_router` tool. Each agent has a focused system prompt, curated tool set, and optimized temperature for its task.

```
User → MASTERLINC → [ClaimLinc | AuthLinc | DRGLinc | ClinicalLinc | ...]
                        ↓
                   brainsait_a2a_router (internal)
                   brainsait_mcp_client (external CF worker)
```

---

## 🧠 MASTERLINC — BrainSAIT Orchestrator

| Property | Value |
|----------|-------|
| **Agent ID** | `masterlinc` |
| **Display Name** | 🧠 MASTERLINC — BrainSAIT Orchestrator |
| **Base Model** | `gpt-4o` |
| **Temperature** | 0.3 (balanced reasoning) |
| **Access** | Admins, Engineering only |

### Purpose
Supreme AI orchestrator for BrainSAIT Healthcare OS. Routes and coordinates all LINC specialist agents, selects the correct agent based on request intent, and synthesizes multi-agent responses.

### Routing Map
- **CLAIMLINC** → insurance claims & NPHIES submissions
- **AUTHLINC** → prior authorization (PA) workflows  
- **DRGLINC** → Saudi AR-DRG case-mix optimization
- **CLINICALLINC** → clinical decision support
- **RADIOLINC** → radiology structured reports
- **CODELINC** → ICD/CPT medical coding
- **BRIDGELINC** → FHIR R4 integrations
- **COMPLIANCELINC** → regulatory compliance
- **TTLINC** → AR↔EN medical translation
- **BASMA** → patient secretary / front desk
- **HEALTHCARELINC** → patient journey management
- **BRAINSAIT-NPHIES-AGENT** → NPHIES technical operations

### Tool Assignments
| Tool | Purpose |
|------|---------|
| `brainsait_a2a_router` | Delegate to specialist LINC agents |
| `brainsait_mcp_client` | Call external MCP worker |
| `denial_analytics` | Analyze claim rejection patterns |
| `nphies_doc_validation` | Validate NPHIES documents |
| `oracle_portal_navigator` | Navigate Oracle NPHIES portals |
| `nphies_preauth` | Prior authorization submissions |
| `nphies_claim_triage` | Triage rejected claims |
| `nphies_approval_limits` | Check approval thresholds |
| `nphies_batch_processor` | Batch claim processing |
| `nphies_endpoint_tester` | Test NPHIES endpoints |
| `brainsait_basma_memory` | Patient context retrieval |
| `nphies_eligibility` | Eligibility verification |
| `nphies_fhir_builder` | Build FHIR R4 bundles |
| `medical_translator` | AR↔EN translation |
| `brainsait_nphies_scanner` | NPHIES claim scanner |
| `cloudflare_worker_metrics` | Infrastructure health |
| `medical_coder` | ICD/CPT code mapping |
| `hipaa_audit_logger` | PHI access logging |
| `web_browser` | Web navigation |
| `doc_transformer` | Document transformation |

---

## 💰 ClaimLinc — Claims AI Engine

| Property | Value |
|----------|-------|
| **Agent ID** | `claimlinc` |
| **Display Name** | 💰 ClaimLinc — Claims AI Engine |
| **Base Model** | `gpt-4o` |
| **Temperature** | 0.1 (precise NPHIES output) |
| **Access** | RCM, Admins, Engineering |

### Purpose
Revenue-critical claims automation for Saudi Arabia. Handles NPHIES structured outputs, claim submission workflows, denial management, and payer-specific protocols for all 6 hospital payers (Tawnia, MOH, Bupa Arabia, Al Rajhi Takaful, AXA Arabia, Medgulf).

### System Prompt Summary
Equipped with deep knowledge of Saudi payers: Tawnia (تأمينية) MOH government insurance, MOH/SCHS direct billing, Bupa Arabia corporate health, Al Rajhi Takaful Sharia-compliant coverage, AXA Arabia international protocols, and Medgulf.

### Tool Assignments
`denial_analytics` · `nphies_doc_validation` · `nphies_preauth` · `web_browser` · `nphies_claim_triage` · `nphies_batch_processor` · `nphies_approval_limits` · `nphies_eligibility` · `nphies_fhir_builder` · `brainsait_nphies_scanner` · `oracle_portal_navigator` · `doc_transformer` · `hipaa_audit_logger` · `brainsait_a2a_router` · `brainsait_mcp_client`

---

## 🔐 AuthLinc — Prior Authorization AI

| Property | Value |
|----------|-------|
| **Agent ID** | `authlinc` |
| **Display Name** | 🔐 AuthLinc — Prior Authorization AI |
| **Base Model** | `gpt-4o` |
| **Temperature** | 0.2 (accuracy-critical) |
| **Access** | RCM, Admins, Engineering |

### Purpose
Automates prior authorization (PA) workflows for Saudi NPHIES. Implements the PA decision tree, verifies patient eligibility, submits FHIR ClaimResponse bundles, and handles appeals.

### PA Workflow
1. Eligibility verify via NPHIES `/Eligibility` endpoint (IQAMA/NPHIES ID)
2. PA decision tree: check payer thresholds before submission
3. FHIR ClaimResponse: parse approval/denial/pend status
4. Appeal management for denied PAs

### Tool Assignments
`nphies_preauth` · `nphies_eligibility` · `nphies_approval_limits` · `nphies_fhir_builder` · `nphies_doc_validation` · `brainsait_nphies_scanner` · `oracle_portal_navigator` · `hipaa_audit_logger` · `web_browser` · `brainsait_a2a_router` · `brainsait_mcp_client`

---

## 📊 DRGLinc — Saudi DRG Optimizer

| Property | Value |
|----------|-------|
| **Agent ID** | `drglinc` |
| **Display Name** | 📊 DRGLinc — Saudi DRG Optimizer |
| **Base Model** | `DeepSeek-R1` (deep analytical reasoning) |
| **Temperature** | 0.2 |
| **Access** | RCM, Admins, Engineering |

### Purpose
AR-DRG optimization for Saudi hospitals. Performs deep analytical case-mix grouping, CC/MCC comorbidity capture, and revenue optimization aligned with Saudi National Health Insurance Company (NHIC) 2025 relative weights.

### Technical Scope
- AR-DRG v11.0 grouping (Australian Refined DRGs — Saudi standard)
- Saudi Relative Weights (RW) from NHIC 2025
- MDC classification: 25 MDCs → 799 DRGs
- CC/MCC capture — comorbidity & complication optimization

### Tool Assignments
`medical_coder` · `nphies_fhir_builder` · `denial_analytics` · `nphies_doc_validation` · `hipaa_audit_logger` · `web_browser` · `brainsait_mcp_client`

---

## 🩺 ClinicalLinc — Clinical Decision Support

| Property | Value |
|----------|-------|
| **Agent ID** | `clinicallinc` |
| **Display Name** | 🩺 ClinicalLinc — Clinical Decision Support |
| **Base Model** | `gpt-4o` |
| **Temperature** | 0.3 |
| **Access** | Clinical, Admins, Engineering |

### Purpose
Medical reasoning and differential diagnosis engine for Saudi healthcare. Applies ICD-10-AM (11th edition), MOH Clinical Pathways, Saudi Commission Guidelines (SCFHS), and Saudi drug formulary knowledge.

### Clinical Knowledge Base
- ICD-10-AM v11: primary diagnosis, complications, CCs, MCCs
- MOH Clinical Pathways: diabetes, hypertension, cardiac, oncology
- Saudi Commission Guidelines (SCFHS) for specialty standards
- Drug formulary (Saudi Essential Medicines List)

### Tool Assignments
`medical_coder` · `hipaa_audit_logger` · `nphies_fhir_builder` · `nphies_doc_validation` · `web_browser` · `denial_analytics`

---

## 🏥 HealthcareLinc — Patient Journey AI

| Property | Value |
|----------|-------|
| **Agent ID** | `healthcarelinc` |
| **Display Name** | 🏥 HealthcareLinc — Patient Journey AI |
| **Base Model** | `gpt-4o` |
| **Temperature** | 0.7 (conversational) |
| **Access** | Clinical, Nursing, Admins, Engineering |

### Purpose
Patient journey management — fast, conversational, bilingual. Handles registration, scheduling, care coordination, and patient communication without heavy clinical logic. Auto-detects Arabic/English and responds in kind.

### Language Detection
- Latin/English characters → responds in ENGLISH
- Arabic script → responds in ARABIC

### Tool Assignments
`nphies_eligibility` · `nphies_doc_validation` · `oracle_portal_navigator` · `medical_coder` · `hipaa_audit_logger` · `medical_translator` · `web_browser` · `brainsait_basma_memory`

---

## 🩻 RadioLinc — Radiology AI

| Property | Value |
|----------|-------|
| **Agent ID** | `radiolinc` |
| **Display Name** | 🩻 RadioLinc — Radiology AI |
| **Base Model** | `gpt-4o` |
| **Temperature** | 0.2 (structured reports) |
| **Access** | Clinical, Admins, Engineering |

### Purpose
Radiology workflow automation and structured report generation. Supports DICOM worklist management, RSNA RadReport templates, critical value alerting, and FHIR ImagingStudy integration.

### Workflow Automation
1. Worklist Management: DICOM MWL query, priority sorting (STAT/Urgent/Routine)
2. Structured Reporting: RSNA RadReport templates (Chest/Abd/MSK/Neuro/Mammo)
3. Critical Values: auto-alert pneumothorax, PE, stroke findings
4. FHIR DiagnosticReport: structured output for NPHIES/EMR integration

### Tool Assignments
`oracle_portal_navigator` · `medical_coder` · `hipaa_audit_logger` · `nphies_doc_validation` · `web_browser` · `nphies_fhir_builder`

---

## 📋 CodeLinc — Medical Coding AI

| Property | Value |
|----------|-------|
| **Agent ID** | `codelinc` |
| **Display Name** | 📋 CodeLinc — Medical Coding AI |
| **Base Model** | `DeepSeek-R1` (deterministic reasoning) |
| **Temperature** | 0.05 (ultra-low for deterministic output) |
| **Access** | Clinical, RCM, Admins, Engineering |

### Purpose
Expert medical coding AI for Saudi Arabia. Produces deterministic ICD/CPT code assignments with step-by-step reasoning chains. Supports ICD-10-AM v11, ACHI, CPT 2025, and LOINC.

### Coding Standards
- ICD-10-AM v11: primary diagnosis, complications, CCs, MCCs
- ACHI: Australian Classification of Health Interventions
- CPT 2025: professional fee coding (E&M, surgery, radiology)
- LOINC: laboratory and clinical measurements

### Tool Assignments
`medical_coder` · `nphies_fhir_builder` · `nphies_doc_validation` · `hipaa_audit_logger` · `denial_analytics` · `web_browser` · `brainsait_mcp_client`

---

## 🔗 BridgeLinc — FHIR Integration Engine

| Property | Value |
|----------|-------|
| **Agent ID** | `bridgelinc` |
| **Display Name** | 🔗 BridgeLinc — FHIR Integration Engine |
| **Base Model** | `gpt-4.1` (technical coding, API precision) |
| **Temperature** | 0.1 |
| **Access** | Operations, RCM, Admins, Engineering |

### Purpose
HL7 FHIR R4 integration engine. Converts between Oracle Health (Cerner) FHIR R4, NPHIES Saudi FHIR profiles, SEHA/MOH HL7 v2.x, and external systems. Outputs clean JSON for API transformations.

### Integration Scope
- Oracle Health (Cerner): FHIR R4 Patient, Encounter, Observation, Condition
- NPHIES Saudi: FHIR R4 Claim, ClaimResponse, Coverage, Eligibility
- SEHA/MOH EMR: HL7 v2.x ADT/ORM/ORU → FHIR conversion
- Malaffi (Abu Dhabi HIE): cross-border patient records

### Tool Assignments
`nphies_fhir_builder` · `oracle_portal_navigator` · `nphies_endpoint_tester` · `nphies_doc_validation` · `hipaa_audit_logger` · `web_browser` · `brainsait_mcp_client`

---

## 🛡️ ComplianceLinc — Healthcare Compliance AI

| Property | Value |
|----------|-------|
| **Agent ID** | `compliancelinc` |
| **Display Name** | 🛡️ ComplianceLinc — Healthcare Compliance AI |
| **Base Model** | `gpt-4o` |
| **Temperature** | 0.2 |
| **Access** | Operations, Admins, Engineering |

### Purpose
Regulatory compliance analysis and audit for Saudi healthcare. Covers HIPAA, PDPL (Saudi Personal Data Protection Law), NPHIES governance, CCHI, and Vision 2030 digital health requirements.

### Regulatory Framework
- HIPAA: US standard for international data sharing
- PDPL: Saudi Personal Data Protection Law (effective 2023)
- NPHIES Governance: MOH data sharing requirements
- CCHI: Council of Cooperative Health Insurance regulations

### Tool Assignments
`hipaa_audit_logger` · `nphies_doc_validation` · `nphies_fhir_builder` · `cloudflare_worker_metrics` · `nphies_endpoint_tester` · `web_browser`

---

## 🌍 TTLinc — Medical Translation AI

| Property | Value |
|----------|-------|
| **Agent ID** | `ttlinc` |
| **Display Name** | 🌍 TTLinc — Medical Translation AI |
| **Base Model** | `DeepSeek-V3-0324` (best multilingual model) |
| **Temperature** | 0.3 |
| **Access** | Operations, Clinical, Nursing, RCM, Admins, Engineering |

### Purpose
Specialized medical bilingual translation for Arabic↔English healthcare content. Handles Saudi dialects (Najdi, Hijazi, Gulf), MSA medical terminology, and NPHIES document translation.

### Translation Expertise
- Saudi Arabic Dialects: Najdi (Riyadh), Hijazi (Jeddah), Gulf (Eastern Province)
- Medical Arabic: MSA medical terminology (WHO Arabic ICD)
- NPHIES Documents: claim forms, PA letters, discharge summaries
- Clinical notes: SOAP format, operative reports, radiology

### Tool Assignments
`medical_translator` · `web_browser` · `hipaa_audit_logger` · `nphies_doc_validation`

---

## 🤝 Basma — AI Patient Secretary

| Property | Value |
|----------|-------|
| **Agent ID** | `basma` |
| **Display Name** | 🤝 Basma — AI Patient Secretary |
| **Base Model** | `gpt-4o` |
| **Temperature** | 0.7 (friendly, conversational) |
| **Access** | Nursing, Clinical, Admins, Engineering |

### Purpose
Bilingual AI patient secretary for Saudi healthcare front desk operations. Handles appointment scheduling, patient intake, insurance eligibility, and general patient communication in Arabic and English.

### Language Handling
- Detects script of current message
- Latin/English → responds entirely in English
- Arabic script → responds entirely in Arabic
- Name: Basma (بسمة) — "smile" in Arabic

### Tool Assignments
`brainsait_basma_memory` · `medical_translator` · `web_browser` · `hipaa_audit_logger`

---

## ⚡ NPHIES Agent — Technical Operations

| Property | Value |
|----------|-------|
| **Agent ID** | `brainsait-nphies-agent` |
| **Display Name** | ⚡ NPHIES Agent — Technical Operations |
| **Base Model** | `gpt-4.1` (structured JSON, technical precision) |
| **Temperature** | 0.1 |
| **Access** | RCM, Operations, Admins, Engineering |

### Purpose
NPHIES API technical operations agent. Handles all FHIR R4 operations against the Saudi NPHIES production environment, structured JSON response generation, and OAuth2 token management.

### NPHIES Technical Knowledge
- Production: `https://HSB.nphies.sa:8888` (all FHIR operations)
- FHIR Version: R4 (4.0.1) with Saudi-specific profiles v2.0.0
- Auth: OAuth2 Bearer token (refresh every 3600s)
- Claim Types: institutional, professional, pharmacy, vision, dental

### Tool Assignments
`brainsait_nphies_scanner` · `nphies_claim_triage` · `nphies_endpoint_tester` · `nphies_doc_validation` · `nphies_approval_limits` · `nphies_batch_processor` · `nphies_eligibility` · `nphies_preauth` · `nphies_fhir_builder` · `oracle_portal_navigator` · `web_browser` · `hipaa_audit_logger` · `brainsait_a2a_router` · `brainsait_mcp_client`

---

## 📊 Agent-to-Tool Matrix

| Tool | MASTER | CLAIM | AUTH | DRG | CLIN | HLTH | RADIO | CODE | BRIDGE | COMP | TT | BASMA | NPHIES |
|------|:------:|:-----:|:----:|:---:|:----:|:----:|:-----:|:----:|:------:|:----:|:--:|:-----:|:------:|
| `brainsait_a2a_router` | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| `brainsait_mcp_client` | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | — | — | — | ✅ |
| `brainsait_basma_memory` | ✅ | — | — | — | — | ✅ | — | — | — | — | — | ✅ | — |
| `brainsait_nphies_scanner` | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| `nphies_eligibility` | ✅ | ✅ | ✅ | — | — | ✅ | — | — | — | — | — | — | ✅ |
| `nphies_fhir_builder` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | — | ✅ |
| `nphies_preauth` | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| `nphies_claim_triage` | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — | ✅ |
| `nphies_batch_processor` | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — | ✅ |
| `nphies_approval_limits` | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| `nphies_doc_validation` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| `nphies_endpoint_tester` | ✅ | — | — | — | — | — | — | — | ✅ | ✅ | — | — | ✅ |
| `medical_coder` | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — |
| `medical_translator` | ✅ | — | — | — | — | ✅ | — | — | — | — | ✅ | ✅ | — |
| `denial_analytics` | ✅ | ✅ | — | ✅ | ✅ | — | — | ✅ | — | — | — | — | — |
| `oracle_portal_navigator` | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | — | ✅ | — | — | — | ✅ |
| `doc_transformer` | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — | — |
| `cloudflare_worker_metrics` | ✅ | — | — | — | — | — | — | — | — | ✅ | — | — | — |
| `hipaa_audit_logger` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `web_browser` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
