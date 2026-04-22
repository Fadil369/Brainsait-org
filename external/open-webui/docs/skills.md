# 🎯 BrainSAIT Skills Reference

> **Total Skills:** 10 registered skills (all active)
> **Platform:** BrainSAIT Healthcare OS (BOS) v6.0

Skills are structured, reusable prompt-and-context packages that augment LINC agents with specialized workflows. They provide step-by-step guidance, standardized templates, and domain-specific knowledge that agents invoke during task execution.

---

## 🏥 Healthcare / Saudi Standards Skills

---

### 1. NPHIES Claims Submission

| Property | Value |
|----------|-------|
| **Skill ID** | `nphies_claims_skill` |
| **Tags** | `brainsait`, `healthcare`, `saudi` |
| **Status** | Active |

**Purpose:**
Provides the complete end-to-end workflow for submitting claims to the National Platform for Health Insurance Exchange (NPHIES). Covers FHIR R4 bundle construction, Saudi-specific profile compliance (v2.0.0), OAuth2 authentication, and submission status tracking.

**Augments Agents:** ClaimLinc, NPHIES Agent, MASTERLINC

**Usage Examples:**
- "Submit a hospital claim for patient encounter #E2024-001 to Tawnia insurance"
- "Build a NPHIES FHIR R4 claim bundle for an inpatient surgical case"
- "What are the required fields for a NPHIES institutional claim?"
- "Resubmit claim #CLM-2024-555 after correcting the diagnosis code"

**Workflow Steps:**
1. Patient eligibility verification via NPHIES `/Eligibility`
2. FHIR Claim bundle construction (Patient + Coverage + Claim resources)
3. Document validation (ICD codes, CPT codes, supporting docs)
4. Bundle submission to `https://HSB.nphies.sa:8888/fhir`
5. ClaimResponse polling and status tracking

---

### 2. Prior Authorization Workflow

| Property | Value |
|----------|-------|
| **Skill ID** | `prior_auth_skill` |
| **Tags** | `brainsait`, `healthcare`, `saudi` |
| **Status** | Active |

**Purpose:**
Full prior authorization (PA) workflow for Saudi NPHIES. Includes PA decision trees, payer-specific approval thresholds, FHIR ClaimRequest construction, and appeal documentation generation for denied PAs.

**Augments Agents:** AuthLinc, ClaimLinc, NPHIES Agent

**Usage Examples:**
- "Submit a prior authorization for MRI knee for patient covered by Bupa Arabia"
- "Check PA status for request #PA-2024-789"
- "Generate an appeal letter for denied PA #PA-2024-444"
- "What procedures require prior authorization for Al Rajhi Takaful?"

**Workflow Steps:**
1. Identify procedure PA requirement from payer schedule
2. Verify patient eligibility and benefit limits
3. Build FHIR ClaimRequest (preauth) bundle
4. Submit to NPHIES `/preauth` endpoint
5. Parse ClaimResponse: approved / pending / denied
6. If denied: generate appeal with clinical evidence

---

### 3. Saudi Medical Coding Assistant

| Property | Value |
|----------|-------|
| **Skill ID** | `medical_coding_skill` |
| **Tags** | `brainsait`, `healthcare`, `saudi` |
| **Status** | Active |

**Purpose:**
Expert ICD-10-AM, CPT, ACHI, and LOINC coding assistant trained on Saudi coding standards. Provides accurate code assignments, coding query responses, DRG-optimized sequencing, and compliance with MOH coding guidelines.

**Augments Agents:** CodeLinc, DRGLinc, ClinicalLinc

**Usage Examples:**
- "Code a patient with Type 2 diabetes with peripheral neuropathy and CKD stage 3"
- "What is the correct ICD-10-AM code for postoperative wound infection?"
- "Assign CPT codes for a laparoscopic cholecystectomy with intraoperative cholangiogram"
- "Review this coding for maximum DRG weight: [diagnosis list]"

**Coding Standards Applied:**
- ICD-10-AM v11 (Australian Modified — Saudi national standard)
- ACHI: Australian Classification of Health Interventions
- CPT 2025: E&M, surgery, radiology, pathology
- LOINC: laboratory and clinical measurements

---

### 4. Clinical Summary Generator (AR/EN)

| Property | Value |
|----------|-------|
| **Skill ID** | `bilingual_summary_skill` |
| **Tags** | `brainsait`, `healthcare`, `saudi` |
| **Status** | Active |

**Purpose:**
Generates structured bilingual clinical summaries in both English and Arabic. Produces SOAP-format clinical notes, discharge summaries, referral letters, and operative reports simultaneously in both languages.

**Augments Agents:** ClinicalLinc, HealthcareLinc, TTLinc

**Usage Examples:**
- "Generate a discharge summary in Arabic and English for a patient with acute MI"
- "Write a referral letter in both Arabic and English for cardiology consultation"
- "Create a bilingual SOAP note for an OPD encounter: chest pain, HTN, DM"
- "Translate and format this English operative report into Arabic"

**Output Format:**
```
## English Clinical Summary
[SOAP / Discharge format in English]

---

## الملخص السريري (العربية)
[SOAP / Discharge format in Arabic]
```

---

### 5. FHIR R4 Bundle Constructor

| Property | Value |
|----------|-------|
| **Skill ID** | `fhir_builder_skill` |
| **Tags** | `brainsait`, `healthcare`, `saudi` |
| **Status** | Active |

**Purpose:**
Constructs complete, validated FHIR R4 bundles following Saudi NPHIES profiles v2.0.0. Handles all bundle types: Transaction (claim submission), Message (preauth), Collection (batch). Produces production-ready JSON output.

**Augments Agents:** BridgeLinc, ClaimLinc, NPHIES Agent, ClinicalLinc

**Usage Examples:**
- "Build a FHIR R4 claim bundle for a diabetic inpatient encounter"
- "Create a Coverage resource for a Tawnia-insured patient"
- "Construct a FHIR Patient resource from this demographic data"
- "Generate a complete preauth bundle for cardiac catheterization"

**Supported FHIR Resources:** Patient, Coverage, Organization, Practitioner, Claim, ClaimResponse, Encounter, Condition, Observation, Procedure, DiagnosticReport, ImagingStudy, MedicationRequest

---

## 💼 Payer-Specific Skills

---

### 6. Bupa Arabia Claims Processor

| Property | Value |
|----------|-------|
| **Skill ID** | `bupa_claims_skill` |
| **Tags** | `payer` |
| **Status** | Active |

**Purpose:**
Specialized claims processing workflow for Bupa Arabia. Applies Bupa-specific clinical justification requirements, corporate coding standards, international procedure documentation, and Bupa portal submission protocols.

**Augments Agents:** ClaimLinc, AuthLinc

**Usage Examples:**
- "Process a Bupa Arabia claim for knee replacement surgery"
- "What clinical justification does Bupa require for MRI approval?"
- "Generate a Bupa-compliant clinical justification letter for spinal surgery"
- "Check Bupa Arabia eligibility for patient IQAMA"

---

### 7. Tawnia Claims Processor

| Property | Value |
|----------|-------|
| **Skill ID** | `tawnia_claims_skill` |
| **Tags** | `payer` |
| **Status** | Active |

**Purpose:**
Tawnia (تأمينية) claims processing skill. Applies MOH-backed insurance rules, CCHI regulatory compliance, 90-day filing deadline management, and Tawnia-specific NPHIES submission formats.

**Augments Agents:** ClaimLinc, AuthLinc

**Usage Examples:**
- "Submit a Tawnia claim for outpatient consultation"
- "What is the Tawnia rejection code BE-4-2 resolution?"
- "Check filing deadline for Tawnia claims from January 2025"
- "Batch process 50 pending Tawnia claims"

---

### 8. Al Rajhi Takaful Claims Processor

| Property | Value |
|----------|-------|
| **Skill ID** | `rajhi_claims_skill` |
| **Tags** | `payer` |
| **Status** | Active |

**Purpose:**
Al Rajhi Takaful claims processing with Sharia-compliant insurance rules. Applies Takaful contribution models, Islamic finance benefit calculations, and Al Rajhi's specific NPHIES integration requirements.

**Augments Agents:** ClaimLinc

**Usage Examples:**
- "Process a Takaful claim for Al Rajhi Takaful subscriber"
- "What are Al Rajhi's Takaful benefit limits for hospitalization?"
- "Generate an Al Rajhi-compliant claim with Takaful contribution breakdown"

---

### 9. MOH Direct Billing Protocol

| Property | Value |
|----------|-------|
| **Skill ID** | `moh_billing_skill` |
| **Tags** | `payer` |
| **Status** | Active |

**Purpose:**
Ministry of Health direct billing protocols for government facilities. Applies MOH fee schedules, SCHS billing standards, government fund reimbursement workflows, and MOH portal direct submission procedures.

**Augments Agents:** ClaimLinc, BridgeLinc

**Usage Examples:**
- "Submit a MOH direct billing claim for government employee"
- "Apply the 2025 MOH fee schedule to this encounter"
- "Generate a SCHS-compliant billing statement"
- "Reconcile government fund payments for Q1 2025"

---

### 10. Saudi Radiology Protocol Guide

| Property | Value |
|----------|-------|
| **Skill ID** | `radiology_protocol_skill` |
| **Tags** | `payer` |
| **Status** | Active |

**Purpose:**
Saudi radiology imaging protocols and structured reporting guide. Applies ACR/RSNA reporting standards adapted for Saudi practice, NPHIES radiology claim requirements, and MOH imaging guidelines.

**Augments Agents:** RadioLinc, ClinicalLinc

**Usage Examples:**
- "Generate a structured chest CT report using RSNA template"
- "What are the NPHIES requirements for radiology claims?"
- "Create a FHIR DiagnosticReport for brain MRI findings"
- "Apply Saudi MOH imaging protocol for lumbar spine MRI"

---

## 📊 Skills Summary Matrix

| Skill | ID | Category | Primary Agent |
|-------|----|----------|---------------|
| NPHIES Claims Submission | `nphies_claims_skill` | NPHIES | ClaimLinc |
| Prior Authorization Workflow | `prior_auth_skill` | NPHIES | AuthLinc |
| Saudi Medical Coding | `medical_coding_skill` | Clinical | CodeLinc |
| Clinical Summary (AR/EN) | `bilingual_summary_skill` | Clinical | ClinicalLinc |
| FHIR R4 Bundle Constructor | `fhir_builder_skill` | Integration | BridgeLinc |
| Bupa Arabia Claims | `bupa_claims_skill` | Payer | ClaimLinc |
| Tawnia Claims | `tawnia_claims_skill` | Payer | ClaimLinc |
| Al Rajhi Takaful Claims | `rajhi_claims_skill` | Payer | ClaimLinc |
| MOH Direct Billing | `moh_billing_skill` | Payer | ClaimLinc |
| Saudi Radiology Protocol | `radiology_protocol_skill` | Clinical | RadioLinc |
