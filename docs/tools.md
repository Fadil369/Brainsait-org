# 🔧 BrainSAIT Tools Reference

> **Total Tools:** 20 registered tools  
> **Platform:** BrainSAIT Healthcare OS (BOS) v6.0

All tools are Python-based Open-WebUI tool plugins authored by BrainSAIT Assistant (github.com/fadil369).

---

## 🗂️ Tool Categories

| Category | Tools |
|----------|-------|
| **Core Infrastructure** | `brainsait_basma_memory`, `brainsait_a2a_router`, `brainsait_mcp_client` |
| **NPHIES Operations** | `brainsait_nphies_scanner`, `nphies_eligibility`, `nphies_preauth`, `nphies_fhir_builder`, `nphies_claim_triage`, `nphies_batch_processor`, `nphies_approval_limits`, `nphies_doc_validation`, `nphies_endpoint_tester` |
| **Clinical & Coding** | `medical_coder`, `medical_translator`, `denial_analytics`, `doc_transformer` |
| **Infrastructure & Audit** | `cloudflare_worker_metrics`, `hipaa_audit_logger`, `oracle_portal_navigator` |
| **General** | `web_browser` |

---

## 🧩 Core Infrastructure Tools

---

### `brainsait_basma_memory`
**Name:** Basma AI Secretary Memory  
**Author:** BrainSAIT Assistant

**Purpose:**  
Retrieves patient and clinical context from the Basma AI Secretary Memory Worker (Cloudflare KV-backed). Enables persistent patient memory across sessions for the Basma secretary agent. Stores and retrieves appointment history, patient preferences, and previous interaction context.

**Used By:** MASTERLINC · HealthcareLinc · Basma

---

### `brainsait_a2a_router`
**Name:** BrainSAIT A2A Router  
**Version:** 2.0.0  
**Author:** BrainSAIT

**Purpose:**  
Agent-to-Agent (A2A) orchestration tool. Enables MASTERLINC to delegate tasks to specialist LINC agents via internal HTTP calls within the Open-WebUI platform. Routes requests based on intent classification — claims, authorization, coding, translation, etc. Implements round-trip delegation with response synthesis.

**Used By:** MASTERLINC · ClaimLinc · AuthLinc · NPHIES Agent

---

### `brainsait_mcp_client`
**Name:** BrainSAIT MCP Client  
**Author:** BrainSAIT

**Purpose:**  
Calls the BrainSAIT MCP Worker hosted at `brainsait-mcp.elfadil.com`. Provides access to NPHIES eligibility checks, claims processing, FHIR validation, Oracle portal navigation, and medical code lookups via the external Cloudflare Worker infrastructure. Acts as the bridge to all external BrainSAIT microservices.

**Used By:** MASTERLINC · ClaimLinc · AuthLinc · DRGLinc · CodeLinc · BridgeLinc · NPHIES Agent

---

## 🏥 NPHIES Operations Tools

---

### `brainsait_nphies_scanner`
**Name:** BrainSAIT NPHIES Claim Scanner  
**Author:** BrainSAIT Assistant

**Purpose:**  
Queries the local or remote NPHIES claim scanner to retrieve batch submission status and audit logs. Scans submitted claim bundles across all 6 Oracle portals (Riyadh, Madinah, Khamis, Aseer, Najran, Hafr), returns rejection codes, processing status, and batch metadata.

**Used By:** MASTERLINC · ClaimLinc · AuthLinc · NPHIES Agent

---

### `nphies_eligibility`
**Name:** NPHIES Eligibility Check  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Real-time patient coverage verification via NPHIES `/eligibility` endpoint. Accepts patient IQAMA/NPHIES ID and payer details. Returns coverage status, benefit limits, co-pay tiers, and active policy details. Essential prerequisite before claim or PA submission.

**Used By:** MASTERLINC · ClaimLinc · AuthLinc · HealthcareLinc · NPHIES Agent

---

### `nphies_preauth`
**Name:** NPHIES Prior Authorization  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Automates prior authorization submissions via NPHIES `/preauth` API endpoint. Constructs FHIR ClaimResponse bundles, handles PA status polling (approved/denied/pending), and generates appeal documentation for denied PAs. Supports all procedure categories requiring PA.

**Used By:** MASTERLINC · ClaimLinc · AuthLinc · NPHIES Agent

---

### `nphies_fhir_builder`
**Name:** FHIR Bundle Builder  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Constructs FHIR R4 bundles (Transaction, Collection, Message) from Oracle portal data. Produces Saudi-specific FHIR profiles v2.0.0 compliant bundles. Handles Patient, Coverage, Claim, ClaimResponse, Encounter, Condition, and Observation resources for NPHIES submission.

**Used By:** MASTERLINC · ClaimLinc · AuthLinc · DRGLinc · ClinicalLinc · RadioLinc · CodeLinc · BridgeLinc · ComplianceLinc · NPHIES Agent

---

### `nphies_claim_triage`
**Name:** NPHIES Claim Triage  
**Author:** BrainSAIT Assistant

**Purpose:**  
Analyzes NPHIES rejection codes, prioritizes denied claims by financial impact and recoverability, and recommends required corrective actions and appeal documents. Maps rejection codes to resolution workflows. Generates triage reports for RCM teams.

**Used By:** MASTERLINC · ClaimLinc · NPHIES Agent

---

### `nphies_batch_processor`
**Name:** NPHIES Batch Processor  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Executes controlled batch claim submissions to NPHIES with progress tracking. Manages rate limiting, error handling, and retry logic for large claim volumes. Provides real-time progress updates and generates batch submission reports with per-claim status.

**Used By:** MASTERLINC · ClaimLinc · NPHIES Agent

---

### `nphies_approval_limits`
**Name:** NPHIES Approval Limits Checker  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Checks patient/provider approval limits from the Oasis system. Verifies yearly benefit exhaustion, monthly claim caps, per-procedure limits, and network tier restrictions. Prevents claim submission beyond authorized limits to reduce denials.

**Used By:** MASTERLINC · ClaimLinc · AuthLinc · NPHIES Agent

---

### `nphies_doc_validation`
**Name:** NPHIES Document Validation  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Validates supporting documents for NPHIES claim submission. Checks completeness of clinical justification letters, referral documents, lab results, imaging reports, and operative notes against payer-specific requirements. Returns a validation score with missing item checklist.

**Used By:** All 13 LINC agents

---

### `nphies_endpoint_tester`
**Name:** NPHIES Endpoint Discovery  
**Author:** BrainSAIT Assistant

**Purpose:**  
Tests connectivity and determines the correct REST/SOAP endpoint for FHIR NPHIES submissions. Handles endpoint discovery for production (`HSB.nphies.sa:8888`) vs staging environments, verifies SSL certificates, OAuth2 token endpoints, and FHIR capability statements.

**Used By:** MASTERLINC · BridgeLinc · ComplianceLinc · NPHIES Agent

---

## 🩺 Clinical & Coding Tools

---

### `medical_coder`
**Name:** Medical Coder (ICD/CPT)  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Maps clinical descriptions to ICD-10-CM/AM, CPT, and LOINC codes with high precision. Supports ICD-10-AM v11 (Saudi standard), CPT 2025, ACHI procedure codes, and LOINC laboratory codes. Returns code + descriptor + Saudi-specific coding guidelines. Used by DRGLinc for comorbidity capture and CodeLinc for primary assignments.

**Used By:** MASTERLINC · DRGLinc · ClinicalLinc · HealthcareLinc · RadioLinc · CodeLinc

---

### `medical_translator`
**Name:** Medical Bilingual Translator  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Specialized clinical translation tool for English↔Arabic healthcare content. Handles Saudi Arabic dialects (Najdi, Hijazi, Gulf), medical terminology preservation, NPHIES document translation, and bilingual clinical note generation. Maintains clinical accuracy over colloquial translation.

**Used By:** MASTERLINC · HealthcareLinc · TTLinc · Basma

---

### `denial_analytics`
**Name:** Denial Analytics  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Analyzes claim rejection patterns across the 6 hospitals and suggests recovery strategies. Groups denials by rejection code, payer, department, and time period. Identifies systemic documentation gaps, coding errors, and eligibility failures. Generates actionable RCM reports.

**Used By:** MASTERLINC · ClaimLinc · DRGLinc · ClinicalLinc · CodeLinc

---

### `doc_transformer`
**Name:** Claims Document Transformer  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Transforms PDF collective claims (Riyadh, Khamis, etc.) into structured FHIR-ready or NPHIES-compatible JSON format. Handles OCR extraction from scanned claim forms, normalizes data into standard fields, and validates extracted data against NPHIES schemas.

**Used By:** MASTERLINC · ClaimLinc

---

## ⚙️ Infrastructure & Audit Tools

---

### `cloudflare_worker_metrics`
**Name:** Cloudflare Worker Infrastructure Metrics  
**Author:** BrainSAIT Assistant

**Purpose:**  
Queries `/health` and `/metrics` endpoints of BrainSAIT infrastructure (Portals Worker, Claim Scanner, MCP Worker). Returns CPU usage, memory consumption, request latency, error rates, and Cloudflare Worker invocation counts. Used by ComplianceLinc for SLA monitoring.

**Used By:** MASTERLINC · ComplianceLinc

---

### `hipaa_audit_logger`
**Name:** HIPAA Audit Logger  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Logs all PHI access events with user, timestamp, action, and resource for HIPAA compliance audit trails. Records every patient data access, modification, or export event. Writes to the BrainSAIT audit log store (R2/D1). Required on all agents that handle patient data.

**Used By:** All 13 LINC agents (universal)

---

### `oracle_portal_navigator`
**Name:** Oracle Portal Navigator  
**Version:** 2.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Navigates Oracle NPHIES portals across 6 hospitals: Riyadh, Madinah, Khamis Mushait, Aseer, Najran, Hafr Al-Batin. Handles session management, form submission, claim status lookup, and document retrieval from the Oracle portal interface. Supports both REST API and web-scraping modes.

**Used By:** MASTERLINC · ClaimLinc · AuthLinc · HealthcareLinc · RadioLinc · BridgeLinc · NPHIES Agent

---

## 🌐 General Tools

---

### `web_browser`
**Name:** Web Browser & Search  
**Version:** 1.0.0  
**Author:** BrainSAIT Assistant

**Purpose:**  
Fetches and parses web pages, useful for navigating portals like Oracle NPHIES, CCHI regulations, payer guidelines, and medical literature. Supports URL fetching, content extraction, and structured data parsing. Used as a fallback for any web-accessible resource.

**Used By:** All 13 LINC agents (universal)

---

## 📊 Tool Usage Summary

| Tool | # Agents Using |
|------|:--------------:|
| `hipaa_audit_logger` | 13 (all) |
| `web_browser` | 13 (all) |
| `nphies_doc_validation` | 13 (all) |
| `nphies_fhir_builder` | 10 |
| `oracle_portal_navigator` | 7 |
| `nphies_eligibility` | 5 |
| `medical_coder` | 6 |
| `brainsait_mcp_client` | 7 |
| `brainsait_a2a_router` | 4 |
| `nphies_preauth` | 4 |
| `denial_analytics` | 5 |
| `medical_translator` | 4 |
| `brainsait_nphies_scanner` | 4 |
| `nphies_claim_triage` | 3 |
| `nphies_batch_processor` | 3 |
| `nphies_approval_limits` | 4 |
| `nphies_endpoint_tester` | 4 |
| `brainsait_basma_memory` | 3 |
| `cloudflare_worker_metrics` | 2 |
| `doc_transformer` | 2 |
