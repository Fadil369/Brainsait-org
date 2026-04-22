# BrainSAIT Groups & Access Control

> **Source of truth:** All UUIDs and permission values are sourced directly from
> `config/brainsait-platform-export.json` (field: `groups`, `access_grants`).  
> Last export: BrainSAIT Open-WebUI Platform v1.0.

## Overview

Six groups govern access to all 13 LINC agents, 20 workspaces, 20 tools, and 10
skills in the BrainSAIT platform. The model is **role-based + group-scoped**: no
agent is visible to a group unless explicitly granted via `access-control/grants`.

Signup is **disabled** — all users are admin-provisioned and manually assigned to
groups.

---

## Group Reference

### 🔑 Admins

| Field | Value |
|-------|-------|
| **UUID** | `f8a1c2d3-e4f5-6789-abcd-ef0123456789` |
| **Scope** | Full platform administration |
| **Users** | fadil369 (brainsait@icloud.com) |

#### Permissions
| Category | Permission | Value |
|----------|-----------|-------|
| Workspace | models | ✅ |
| Workspace | knowledge | ✅ |
| Workspace | prompts | ✅ |
| Workspace | tools | ✅ |
| Workspace | skills | ✅ |
| Workspace | models_import | ❌ |
| Workspace | models_export | ❌ |
| Workspace | prompts_update | ✅ |
| Workspace | prompts_delete | ❌ |
| Chat | file_upload | ✅ |
| Chat | delete | ✅ |
| Chat | edit | ✅ |
| Chat | temporary | ✅ |
| Features | web_search | ✅ |
| Features | image_generation | ✅ |
| Features | code_interpreter | ✅ |
| Features | memories | ✅ |
| Features | direct_tool_servers | ✅ |

#### Assigned Agents (13/13)
All agents: MASTERLINC, ClaimLinc, AuthLinc, DRGLinc, ClinicalLinc, HealthcareLinc,
RadioLinc, CodeLinc, BridgeLinc, ComplianceLinc, TTLinc, Basma, BrainSAIT NPHIES Agent

#### Channel Access
All 20 channels.

---

### ⚙️ Engineering

| Field | Value |
|-------|-------|
| **UUID** | `b2c3d4e5-f6a7-8901-bcde-f01234567890` |
| **Scope** | BrainSAIT software engineers — full platform + API keys |
| **Users** | Engineering team members |

#### Permissions
Identical to Admins (models=✅, tools=✅, image_generation=✅, code_interpreter=✅,
direct_tool_servers=✅). The key distinction is Engineering users do **not** have
the open-webui admin panel role unless explicitly promoted.

#### Assigned Agents (13/13)
All agents (same as Admins).

#### Channel Access
All 20 channels.

---

### 💰 RCM — Revenue Cycle Management

| Field | Value |
|-------|-------|
| **UUID** | `16f46a1c-a8d5-4ad8-93d8-4d8508b77810` |
| **Scope** | Insurance billing, claims, authorization, NPHIES operations |
| **Users** | Claims coders, billing specialists, authorization officers |

#### Permissions
| Category | Permission | Value |
|----------|-----------|-------|
| Workspace | models | ✅ |
| Workspace | knowledge | ✅ |
| Workspace | prompts | ✅ |
| Workspace | tools | ✅ |
| Workspace | skills | ✅ |
| Workspace | models_import/export | ❌ / ❌ |
| Workspace | prompts_update | ✅ |
| Workspace | prompts_delete | ❌ |
| Chat | file_upload / delete / edit / temporary | ✅ / ✅ / ✅ / ✅ |
| Features | web_search | ✅ |
| Features | image_generation | ❌ |
| Features | code_interpreter | ✅ |
| Features | memories | ✅ |
| Features | direct_tool_servers | ❌ |

#### Assigned Agents (7/13)
ClaimLinc, AuthLinc, DRGLinc, BridgeLinc, CodeLinc, TTLinc, BrainSAIT NPHIES Agent

> MASTERLINC is **not** granted to RCM — direct specialized agent access only.

#### Primary Workspaces
Tawnia Claims, MOH Claims, Bupa Arabia, Al Rajhi Takaful, AXA Arabia, Medgulf,
NPHIES Operations, DRG & Case-Mix, Coding Desk

---

### 🩺 Clinical

| Field | Value |
|-------|-------|
| **UUID** | `6c4d469b-00ee-4f73-970c-a935ae82a095` |
| **Scope** | Physicians, radiologists, medical coders, clinical decision support |
| **Users** | Attending physicians, consultants, radiologists, clinical pharmacists |

#### Permissions
| Category | Permission | Value |
|----------|-----------|-------|
| Workspace | models | ✅ |
| Workspace | knowledge | ✅ |
| Workspace | prompts | ✅ |
| Workspace | tools | ❌ |
| Workspace | skills | ✅ |
| Workspace | models_import/export | ❌ / ❌ |
| Workspace | prompts_update | ✅ |
| Workspace | prompts_delete | ❌ |
| Chat | file_upload / delete / edit / temporary | ✅ / ✅ / ✅ / ✅ |
| Features | web_search | ✅ |
| Features | image_generation | ✅ |
| Features | code_interpreter | ❌ |
| Features | memories | ✅ |
| Features | direct_tool_servers | ❌ |

> Clinical cannot create or manage tools directly (`tools: false`).

#### Assigned Agents (8/13)
ClinicalLinc, HealthcareLinc, RadioLinc, CodeLinc, BridgeLinc, ComplianceLinc,
TTLinc, Basma

#### Primary Workspaces
OPD Workflow, Ward Management, Pharmacy CDS, Emergency & Triage, Discharge Planning,
Patient Care, Radiology Desk, Coding Desk, Translation Hub

---

### 👩‍⚕️ Nursing

| Field | Value |
|-------|-------|
| **UUID** | `71b69b61-80f3-4fb4-83c0-a7552eba52ee` |
| **Scope** | Ward nurses, allied health, patient-facing care coordination |
| **Users** | Registered nurses, CNAs, allied health practitioners |

#### Permissions
| Category | Permission | Value |
|----------|-----------|-------|
| Workspace | models | ❌ |
| Workspace | knowledge | ✅ |
| Workspace | prompts | ✅ |
| Workspace | tools | ❌ |
| Workspace | skills | ✅ |
| Workspace | models_import/export | ❌ / ❌ |
| Workspace | prompts_update | ✅ |
| Workspace | prompts_delete | ❌ |
| Chat | file_upload / delete / edit / temporary | ✅ / ✅ / ✅ / ✅ |
| Features | web_search | ✅ |
| Features | image_generation | ❌ |
| Features | code_interpreter | ❌ |
| Features | memories | ✅ |
| Features | direct_tool_servers | ❌ |

> Most restricted group. Cannot browse or add models (`models: false`), no image
> generation, no code interpreter.

#### Assigned Agents (3/13)
HealthcareLinc, TTLinc, Basma

#### Primary Workspaces
Ward Management, OPD Workflow, Patient Care, Translation Hub

---

### 🔗 Operations

| Field | Value |
|-------|-------|
| **UUID** | `8f696cff-def9-4b9f-9e3d-6609d8dd8161` |
| **Scope** | IT operations, system integration, compliance, infrastructure |
| **Users** | System administrators, DevOps, integration engineers, compliance officers |

#### Permissions
| Category | Permission | Value |
|----------|-----------|-------|
| Workspace | models | ✅ |
| Workspace | knowledge | ✅ |
| Workspace | prompts | ✅ |
| Workspace | tools | ✅ |
| Workspace | skills | ✅ |
| Workspace | models_import/export | ❌ / ❌ |
| Workspace | prompts_update | ✅ |
| Workspace | prompts_delete | ❌ |
| Chat | file_upload / delete / edit / temporary | ✅ / ✅ / ✅ / ✅ |
| Features | web_search | ✅ |
| Features | image_generation | ❌ |
| Features | code_interpreter | ✅ |
| Features | memories | ✅ |
| Features | direct_tool_servers | ❌ |

#### Assigned Agents (5/13)
BridgeLinc, ComplianceLinc, TTLinc, Basma, BrainSAIT NPHIES Agent

#### Primary Workspaces
Infrastructure, FHIR Bridge, Compliance Monitor, Translation Hub, NPHIES Operations

---

## Global Permission Matrix

| Permission | Admins | Engineering | RCM | Clinical | Nursing | Operations |
|-----------|--------|-------------|-----|----------|---------|------------|
| **workspace.models** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **workspace.knowledge** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **workspace.tools** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **workspace.skills** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **features.web_search** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **features.image_generation** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **features.code_interpreter** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **features.direct_tool_servers** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **features.memories** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Agent Access Matrix

| Agent | Admins | Engineering | RCM | Clinical | Nursing | Operations |
|-------|--------|-------------|-----|----------|---------|------------|
| MASTERLINC | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ClaimLinc | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| AuthLinc | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| DRGLinc | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| ClinicalLinc | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| HealthcareLinc | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| RadioLinc | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| CodeLinc | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| BridgeLinc | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| ComplianceLinc | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| TTLinc | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Basma | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| NPHIES Agent | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

> **Design principle:** MASTERLINC is restricted to Admins and Engineering only.
> It has access to all other agents' tools and can orchestrate across domains — this
> power requires the most trusted group membership.

---

## Access Grant Details

All 46 grants from the export are `resource_type: "model"`, `principal_type: "group"`,
`permission: "read"`. Grant IDs are assigned at creation time; the canonical UUIDs
live in `config/access_grants.json`.

### Restoring grants
```bash
# Automated restore (uses groups API to re-fetch IDs)
ADMIN_KEY=sk-xxx bash config/restore.sh

# Or manually via API:
curl -X POST https://work.elfadil.com/api/v1/access-control/grants \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "resource_type": "model",
    "resource_id": "claimlinc",
    "principal_type": "group",
    "principal_id": "16f46a1c-a8d5-4ad8-93d8-4d8508b77810",
    "permission": "read"
  }'
```

---

## Managing Groups

### Add a user to a group
```
Admin Panel → Users → [select user] → Groups tab → assign group
```

### Verify group membership via API
```bash
curl -sf https://work.elfadil.com/api/v1/groups \
  -H "Authorization: Bearer $ADMIN_KEY" | python3 -m json.tool
```

### Check a user's effective permissions
```bash
# List groups for user UUID
curl -sf "https://work.elfadil.com/api/v1/users/c232ed5d-0dc3-4ab5-928f-86fea4ebdfad" \
  -H "Authorization: Bearer $ADMIN_KEY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('groups',[]))"
```

### Create a new group (API)
```bash
curl -X POST https://work.elfadil.com/api/v1/groups/create \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Radiology",
    "description": "Radiology department — RadioLinc access",
    "permissions": {
      "workspace": {"models": true, "knowledge": true, "prompts": true, "tools": false, "skills": true},
      "chat": {"file_upload": true, "delete": true, "edit": true, "temporary": true},
      "features": {"web_search": true, "image_generation": true, "code_interpreter": false, "memories": true}
    }
  }'
```

### Onboarding a new user
1. Create user account in Admin Panel → Users → Add User
2. Assign to appropriate group (RCM / Clinical / Nursing / Operations)
3. Inform user of their platform URL: `https://work.elfadil.com`
4. User will only see agents and workspaces granted to their group
5. Signup is disabled — users cannot self-register
