# BrainSAIT Groups & Access Control

## Overview

Six groups organize BrainSAIT platform users. Each group grants access to specific
agents, workspaces, and tools aligned with clinical or operational roles.

---

## Group Definitions

### 🔑 Admins
**Role:** Platform administrators with full access.

Agents: All 13 LINC agents  
Workspaces: All 20 channels  
Tools: All 20 tools  
Admin panel: Yes

### 💰 RCM — Revenue Cycle Management
**Role:** Insurance billing, claims, and authorization teams.

Agents: ClaimLinc, AuthLinc, DRGLinc, BrainSAIT NPHIES Agent, MASTERLINC  
Workspaces: Tawnia, MOH, Bupa, Al Rajhi, AXA, Medgulf, NPHIES Operations, DRG & Case-Mix, Coding Desk  
Tools: nphies_eligibility, claims_processor, auth_workflow, drg_optimizer

### 🩺 Clinical
**Role:** Physicians, radiologists, coders, clinical staff.

Agents: ClinicalLinc, HealthcareLinc, RadioLinc, CodeLinc, MASTERLINC  
Workspaces: OPD Workflow, Ward Management, Pharmacy CDS, Emergency, Discharge Planning, Radiology Desk, Coding Desk  
Tools: clinical_decision_support, radiology_report, drug_interaction, icd10_lookup

### 👩‍⚕️ Nursing
**Role:** Ward nurses and allied health professionals.

Agents: HealthcareLinc, Basma, MASTERLINC  
Workspaces: Ward Management, OPD Workflow, Patient Care  
Tools: patient_vitals, medication_checker, appointment_scheduler

### 🔗 Operations
**Role:** IT, infrastructure, compliance, and integration teams.

Agents: BridgeLinc, ComplianceLinc, TTLinc, MASTERLINC  
Workspaces: Infrastructure, FHIR Bridge, Compliance Monitor, Translation Hub  
Tools: fhir_validator, compliance_checker, translation_service, oracle_rad_connector

### ⚙️ Engineering
**Role:** BrainSAIT software engineers — full platform access.

Agents: All 13 LINC agents  
Workspaces: All 20 channels + direct model access  
Tools: All 20 tools  
Extras: API key access, wrangler deployment, GitHub Actions

---

## Permission Matrix

| Feature | Admins | RCM | Clinical | Nursing | Operations | Engineering |
|---------|--------|-----|----------|---------|------------|-------------|
| Admin Panel | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| All Agents | ✅ | Subset | Subset | Subset | Subset | ✅ |
| All Channels | ✅ | Subset | Subset | Subset | Subset | ✅ |
| Tool Creation | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| API Keys | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Managing Groups

### Add a user to a group
Admin Panel → **Users** → select user → **Groups** tab → assign group.

### Create a new group
Admin Panel → **Groups** → **+** → set name, description, permissions.

### Group-scoped model access
When a model is shared with a group:
1. Go to **Models** → edit agent
2. **Access** → set to **Group** → select group
