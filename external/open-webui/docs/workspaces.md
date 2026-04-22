# 📺 BrainSAIT Workspaces & Channels Reference

> **Total Channels:** 20  
> **Platform:** BrainSAIT Healthcare OS (BOS) v6.0  
> **Base URL:** https://work.elfadil.com

Channels (workspaces) are topic-focused chat spaces where specific groups collaborate with designated LINC agents. Each channel has a primary agent, an owning group, and a focused operational purpose.

---

## 💵 RCM / Insurance Payer Channels

> **Primary Group:** RCM  
> **Primary Agents:** ClaimLinc, AuthLinc, NPHIES Agent, BridgeLinc

---

### 💰 Tawnia Claims
| Property | Value |
|----------|-------|
| **Channel ID** | `582dc258-0fcf-4702-a6fd-f1364300cabc` |
| **Primary Agent** | ClaimLinc |
| **Access Group** | RCM |
| **Payer** | Tawnia (تأمينية) — MOH-backed insurer |

**Purpose:**  
Handles all claim submissions, denials management, and prior authorization workflows for Tawnia (تأمينية), the MOH-backed national insurer. Tawnia operates under CCHI regulation with 90-day filing deadlines. Supports institutional and professional claims under the government health insurance program.

**Key Workflows:**
- NPHIES claim submission (institutional + professional)
- Tawnia-specific denial code resolution
- PA submissions for high-cost procedures
- 90-day deadline tracking and batch processing

---

### 🏥 MOH Claims
| Property | Value |
|----------|-------|
| **Channel ID** | `5f1fe9bc-03d8-4fca-a6b6-b52099954aa2` |
| **Primary Agent** | ClaimLinc |
| **Access Group** | RCM |
| **Payer** | Ministry of Health (MOH) / SCHS |

**Purpose:**  
Direct government billing channel for Ministry of Health and Saudi Commission for Health Specialties (SCHS) facilities. Handles NPHIES-mandated direct billing submissions, MOH fee schedule applications, and government fund reimbursements.

**Key Workflows:**
- MOH fee schedule claim building
- SCHS direct billing submissions
- Government fund reconciliation
- MOH portal navigation and status tracking

---

### 🔵 Bupa Arabia
| Property | Value |
|----------|-------|
| **Channel ID** | `7de79e2c-ac8d-4bd5-a5ad-4f54e6393a64` |
| **Primary Agent** | ClaimLinc |
| **Access Group** | RCM |
| **Payer** | Bupa Arabia — Corporate health insurance |

**Purpose:**  
Corporate health insurance claims channel for Bupa Arabia. Bupa requires detailed clinical justification for procedures, strict coding documentation, and international protocols. Handles corporate employee health benefits claims.

**Key Workflows:**
- Clinical justification letter generation
- Bupa coding documentation standards
- Corporate policy eligibility verification
- International procedure protocol compliance

---

### 🏦 Al Rajhi Takaful
| Property | Value |
|----------|-------|
| **Channel ID** | `330cb67d-da27-46f2-9c12-822089e05ba8` |
| **Primary Agent** | ClaimLinc |
| **Access Group** | RCM |
| **Payer** | Al Rajhi Takaful — Sharia-compliant insurance |

**Purpose:**  
Sharia-compliant Takaful insurance claims processing for Al Rajhi. Applies Takaful-specific contribution and benefit rules, Islamic finance compliance, and Al Rajhi's NPHIES integration requirements.

**Key Workflows:**
- Takaful-compliant claim construction
- Sharia board documentation requirements
- Al Rajhi portal submissions
- Takaful benefit calculation and limits

---

### 🌐 AXA Arabia
| Property | Value |
|----------|-------|
| **Channel ID** | `66c5aa7e-fb95-4318-94c1-4c854ce422c4` |
| **Primary Agent** | ClaimLinc |
| **Access Group** | RCM |
| **Payer** | AXA Arabia — International health protocols |

**Purpose:**  
International insurance protocols for AXA Arabia. Handles multi-currency claims, international coding standards (ICD-10-CM alongside ICD-10-AM), and AXA's global network coordination requirements.

**Key Workflows:**
- International protocol claim building
- Multi-currency billing
- AXA network authorization
- Global coverage verification

---

### 💊 Medgulf
| Property | Value |
|----------|-------|
| **Channel ID** | `dd45269a-4fef-474f-895c-ef3c03f6f445` |
| **Primary Agent** | ClaimLinc |
| **Access Group** | RCM |
| **Payer** | Medgulf Insurance Company |

**Purpose:**  
Medgulf insurer claims and authorization channel. Handles Medgulf-specific claim formats, benefit schedules, and portal submissions.

**Key Workflows:**
- Medgulf claim submission and tracking
- Medgulf-specific denial resolution
- Benefit verification and pre-approvals

---

## 🏥 Clinical Workflow Channels

> **Primary Group:** Clinical (+ Nursing for ward/patient)  
> **Primary Agents:** ClinicalLinc, HealthcareLinc, RadioLinc, CodeLinc, Basma

---

### 🏥 OPD Workflow
| Property | Value |
|----------|-------|
| **Channel ID** | `df23e499-0422-4df2-a1d8-24bfa94735bf` |
| **Primary Agent** | ClinicalLinc · HealthcareLinc |
| **Access Group** | Clinical |

**Purpose:**  
Outpatient department workflow hub. Supports clinical decision support, patient intake, prescription orders, and NPHIES eligibility checks for OPD encounters. Integrates with Oracle OPD module.

**Key Workflows:**
- OPD encounter documentation (SOAP)
- Differential diagnosis support
- Prescription clinical decision support
- Eligibility check at point-of-care

---

### 👩‍⚕️ Ward Management
| Property | Value |
|----------|-------|
| **Channel ID** | `f4cf8177-dc03-4868-8ac8-e4757a4752f2` |
| **Primary Agent** | HealthcareLinc · Basma |
| **Access Group** | Nursing |

**Purpose:**  
Inpatient ward management hub for nursing staff. Handles bed management, nursing assessments, medication reconciliation, and patient status updates. Bilingual support for nursing documentation.

**Key Workflows:**
- Nursing assessment documentation
- Bed status and patient tracking
- Medication reconciliation support
- Shift handover summaries

---

### 💊 Pharmacy CDS
| Property | Value |
|----------|-------|
| **Channel ID** | `c8407886-8bbe-4b80-bef6-de6006b12024` |
| **Primary Agent** | ClinicalLinc |
| **Access Group** | Clinical |

**Purpose:**  
Pharmacy clinical decision support. Drug interaction checking, Saudi Essential Medicines List verification, formulary management, and pharmacist clinical consultation.

**Key Workflows:**
- Drug-drug interaction alerts
- Saudi formulary compliance
- Pharmacokinetic dosing support
- Therapeutic substitution guidance

---

### 🚑 Emergency & Triage
| Property | Value |
|----------|-------|
| **Channel ID** | `b39a7712-780b-49e2-ae75-baa572401bf7` |
| **Primary Agent** | ClinicalLinc · HealthcareLinc |
| **Access Group** | Clinical |

**Purpose:**  
Emergency department and triage workflows. Rapid clinical decision support, NPHIES emergency claim rules (bypass PA requirements), triage prioritization, and critical value management.

**Key Workflows:**
- ESI triage level assignment
- Emergency procedure authorization
- Critical lab/imaging value alerts
- Emergency NPHIES claim bypass rules

---

### 🚪 Discharge Planning
| Property | Value |
|----------|-------|
| **Channel ID** | `db5248e2-dc74-4507-b61d-b3cd41148e15` |
| **Primary Agent** | HealthcareLinc · CodeLinc |
| **Access Group** | Clinical · Nursing |

**Purpose:**  
Inpatient discharge coordination. Discharge summary generation, post-discharge care plan, ICD coding for final diagnoses, and NPHIES claim closure workflows.

**Key Workflows:**
- Discharge summary generation (AR/EN)
- Final diagnosis ICD coding
- Post-discharge medication lists
- Insurance claim closure triggers

---

### 🤒 Patient Care
| Property | Value |
|----------|-------|
| **Channel ID** | `c10cd9a7-ada4-45b4-b740-953a442d8909` |
| **Primary Agent** | Basma · HealthcareLinc |
| **Access Group** | Clinical · Nursing |

**Purpose:**  
General patient management channel. Patient communication, appointment management, care plan updates, and patient education content in bilingual format.

**Key Workflows:**
- Patient appointment scheduling
- Care plan communication
- Patient education (AR/EN)
- Follow-up coordination

---

## 🎯 Specialty Desk Channels

> **Primary Groups:** RCM (Coding, DRG), Clinical (Radiology)

---

### 📋 Coding Desk
| Property | Value |
|----------|-------|
| **Channel ID** | `a90b292c-5d1f-4c8e-9576-a51474d0f5c7` |
| **Primary Agent** | CodeLinc |
| **Access Group** | RCM · Clinical |

**Purpose:**  
Medical coding operations center. ICD-10-AM, CPT, ACHI, and LOINC code assignment, coding query resolution, and DRG-optimized code sequencing.

**Key Workflows:**
- Primary and secondary ICD-10-AM coding
- CPT procedure code assignment
- Coding query response letters
- DRG-optimized code sequencing

---

### 🩻 Radiology Desk
| Property | Value |
|----------|-------|
| **Channel ID** | `728a236a-8883-4031-bff3-8650920f49db` |
| **Primary Agent** | RadioLinc |
| **Access Group** | Clinical |

**Purpose:**  
Radiology AI reporting desk. DICOM worklist management, structured report generation (RSNA templates), critical value alerts, and FHIR DiagnosticReport construction.

**Key Workflows:**
- Structured radiology report generation
- DICOM worklist prioritization
- Critical finding alerts
- FHIR DiagnosticReport for NPHIES

---

### 📈 DRG & Case-Mix
| Property | Value |
|----------|-------|
| **Channel ID** | `1b07bc83-4211-4dcb-953d-0e8bef21b60c` |
| **Primary Agent** | DRGLinc |
| **Access Group** | RCM |

**Purpose:**  
AR-DRG case-mix optimization desk. DRG grouping analysis, CC/MCC comorbidity capture, relative weight optimization, and hospital revenue analysis aligned with NHIC 2025 rates.

**Key Workflows:**
- AR-DRG v11.0 grouping
- CC/MCC comorbidity documentation
- Revenue weight optimization
- Case-mix index reporting

---

### 📊 NPHIES Operations
| Property | Value |
|----------|-------|
| **Channel ID** | `2b7fd94c-5a54-417f-86c7-654eb18497a4` |
| **Primary Agent** | NPHIES Agent · ClaimLinc |
| **Access Group** | RCM · Operations |

**Purpose:**  
NPHIES technical operations command center. Batch submission management, endpoint testing, real-time claim status monitoring, and NPHIES production environment management.

**Key Workflows:**
- NPHIES endpoint health monitoring
- Batch claim submission management
- Production claim status tracking
- NPHIES error log analysis

---

## 🔧 Infrastructure & Compliance Channels

> **Primary Group:** Operations

---

### ⚙️ Infrastructure
| Property | Value |
|----------|-------|
| **Channel ID** | `e00889db-07b4-4ea3-a44c-ed800e6da56b` |
| **Primary Agent** | BridgeLinc · ComplianceLinc |
| **Access Group** | Operations |

**Purpose:**  
Platform infrastructure management. Cloudflare Worker monitoring, Oracle portal health, system integration status, and infrastructure incident management.

**Key Workflows:**
- Cloudflare Worker metrics monitoring
- Oracle portal connectivity checks
- System health dashboards
- Infrastructure incident response

---

### 🔗 FHIR Bridge
| Property | Value |
|----------|-------|
| **Channel ID** | `abf64837-bb94-4b96-a8a3-3f7ddeafe824` |
| **Primary Agent** | BridgeLinc |
| **Access Group** | Operations · RCM |

**Purpose:**  
FHIR R4 integration engineering desk. Bundle construction, HL7 v2→FHIR conversion, Oracle Health FHIR API integration, and NPHIES FHIR profile validation.

**Key Workflows:**
- FHIR R4 bundle construction and validation
- HL7 v2.x to FHIR conversion
- Oracle Health API integration testing
- Saudi FHIR profile compliance

---

### 🛡️ Compliance Monitor
| Property | Value |
|----------|-------|
| **Channel ID** | `001fa4b0-f3ee-46d9-b2bf-d5f115fabfab` |
| **Primary Agent** | ComplianceLinc |
| **Access Group** | Operations |

**Purpose:**  
HIPAA, PDPL, and NPHIES compliance monitoring. Audit trail review, PHI access logging analysis, regulatory gap assessment, and compliance report generation.

**Key Workflows:**
- HIPAA audit trail review
- PDPL compliance monitoring
- NPHIES governance reporting
- PHI access anomaly detection

---

### 🌍 Translation Hub
| Property | Value |
|----------|-------|
| **Channel ID** | `2c10fe83-6911-454c-b54e-6d120ec0a63f` |
| **Primary Agent** | TTLinc |
| **Access Group** | Operations · Nursing · RCM |

**Purpose:**  
Bilingual medical translation hub. Clinical document translation (AR↔EN), NPHIES form translation, patient communication materials, and medical terminology standardization.

**Key Workflows:**
- Clinical note translation (SOAP format)
- NPHIES document translation
- Patient education material localization
- Medical terminology validation

---

## 📊 Channel-Group-Agent Summary

| Channel | Group | Primary Agent |
|---------|-------|---------------|
| 💰 Tawnia Claims | RCM | ClaimLinc |
| 🏥 MOH Claims | RCM | ClaimLinc |
| 🔵 Bupa Arabia | RCM | ClaimLinc |
| 🏦 Al Rajhi Takaful | RCM | ClaimLinc |
| 🌐 AXA Arabia | RCM | ClaimLinc |
| 💊 Medgulf | RCM | ClaimLinc |
| 🏥 OPD Workflow | Clinical | ClinicalLinc + HealthcareLinc |
| 👩‍⚕️ Ward Management | Nursing | HealthcareLinc + Basma |
| 💊 Pharmacy CDS | Clinical | ClinicalLinc |
| 🚑 Emergency & Triage | Clinical | ClinicalLinc + HealthcareLinc |
| 🚪 Discharge Planning | Clinical + Nursing | HealthcareLinc + CodeLinc |
| 🤒 Patient Care | Clinical + Nursing | Basma + HealthcareLinc |
| 📋 Coding Desk | RCM + Clinical | CodeLinc |
| 🩻 Radiology Desk | Clinical | RadioLinc |
| 📈 DRG & Case-Mix | RCM | DRGLinc |
| 📊 NPHIES Operations | RCM + Operations | NPHIES Agent |
| ⚙️ Infrastructure | Operations | BridgeLinc + ComplianceLinc |
| 🔗 FHIR Bridge | Operations + RCM | BridgeLinc |
| 🛡️ Compliance Monitor | Operations | ComplianceLinc |
| 🌍 Translation Hub | Operations + Nursing + RCM | TTLinc |
