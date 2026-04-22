# 👤 BrainSAIT User Management Reference

> **Platform:** BrainSAIT Healthcare OS (BOS) v6.0
> **Admin URL:** https://work.elfadil.com/admin

---

## 👑 Current Users

| User | Username | Email | Role | Status |
|------|----------|-------|------|--------|
| Dr. Mohamed El Fadil | `fadil369` | brainsait@icloud.com | `admin` | Active |

### Admin Account Details
- **User ID:** `c232ed5d-0dc3-4ab5-928f-86fea4ebdfad`
- **Role:** `admin` — full platform access
- **API Keys:** Enabled
- **JWT Expiry:** 4 weeks

---

## 🔐 User Roles

| Role | Description | Default Assignment |
|------|-------------|-------------------|
| `admin` | Full platform control: user management, agent creation, system config | Admin group members |
| `user` | Standard access scoped by group permissions | All clinical/operational staff |
| `pending` | Account created but not yet approved by admin | New signups (if enabled) |

### Role Capabilities

| Capability | admin | user | pending |
|------------|:-----:|:----:|:-------:|
| Access platform | Yes | Yes | No |
| Use assigned agents | Yes | Yes | No |
| Manage agents | Yes | No | No |
| Manage tools | Yes | Group-based | No |
| Manage users | Yes | No | No |
| View admin panel | Yes | No | No |
| Create API keys | Yes | Yes (if enabled) | No |

---

## 🔒 Signup Settings

| Setting | Value |
|---------|-------|
| **Signup Mode** | Disabled (enable_signup: false) |
| **Access Model** | Admin-invite-only |
| **Default User Role** | admin (configurable) |
| **Default Group** | None (must be manually assigned) |
| **JWT Expiry** | 4 weeks |
| **API Keys** | Enabled |

> **Current policy:** Open registration is disabled. Users must be created by an administrator via the UI or API.

---

## ➕ How to Add Users

### Method 1: Admin UI

1. Navigate to `https://work.elfadil.com/admin/users`
2. Click **Add User**
3. Fill in: Name, Email, Password (temporary), Role (`user`)
4. Click **Save**
5. Assign to a group (see Group Assignment below)

### Method 2: API

```bash
curl -X POST https://work.elfadil.com/api/v1/auths/add \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sara Al-Ghamdi",
    "email": "sara.alghamdi@hospital.sa",
    "password": "TempPass123!",
    "role": "user"
  }'
```

---

## 👥 Group Assignment Process

### Via API

```bash
# List groups to get IDs
curl -X GET https://work.elfadil.com/api/v1/groups \
  -H "Authorization: Bearer $ADMIN_KEY"

# Add user to group
curl -X POST https://work.elfadil.com/api/v1/groups/{GROUP_ID}/members/add \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_UUID"}'
```

### Group IDs Reference

| Group | ID |
|-------|----|
| Admins | `f8a1c2d3-e4f5-6789-abcd-ef0123456789` |
| Engineering | `b2c3d4e5-f6a7-8901-bcde-f01234567890` |
| RCM | `16f46a1c-a8d5-4ad8-93d8-4d8508b77810` |
| Clinical | `6c4d469b-00ee-4f73-970c-a935ae82a095` |
| Nursing | `71b69b61-80f3-4fb4-83c0-a7552eba52ee` |
| Operations | `8f696cff-def9-4b9f-9e3d-6609d8dd8161` |

---

## 🔑 API Key Management

API keys are enabled platform-wide (`enable_api_keys: true`).

**Self-service:** Settings (avatar) -> Account -> API Keys -> Generate New Key

**Via Admin API:**
```bash
# Create key
curl -X POST https://work.elfadil.com/api/v1/users/{USER_ID}/api-keys \
  -H "Authorization: Bearer $ADMIN_KEY"

# Revoke key
curl -X DELETE https://work.elfadil.com/api/v1/users/{USER_ID}/api-keys/{KEY_ID} \
  -H "Authorization: Bearer $ADMIN_KEY"
```

---

## 🔐 Access Grant Model

Access grants control which groups can use which resources (agents, tools, knowledge bases).

### Grant Structure

| Field | Type | Description |
|-------|------|-------------|
| `resource_type` | string | `model`, `tool`, `knowledge`, `prompt` |
| `resource_id` | string | Agent ID, tool ID, etc. |
| `principal_type` | string | `group` or `user` |
| `principal_id` | UUID | Group ID or User ID |
| `permission` | string | `read`, `write`, `admin` |

### Create a Grant
```bash
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

## 🏥 Onboarding: New RCM Billing Specialist

**Step 1: Create the user account**
```bash
curl -X POST https://work.elfadil.com/api/v1/auths/add \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ahmed Al-Harbi","email":"a.alharbi@hospital.sa","password":"ChangeMe2025!","role":"user"}'
# Note the returned user ID
```

**Step 2: Assign to RCM group**
```bash
curl -X POST "https://work.elfadil.com/api/v1/groups/16f46a1c-a8d5-4ad8-93d8-4d8508b77810/members/add" \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID_FROM_STEP_1"}'
```

After group assignment, the user automatically gets read access to:
**ClaimLinc, AuthLinc, DRGLinc, NPHIES Agent, BridgeLinc, CodeLinc, TTLinc**

---

## 🏥 Onboarding: New Clinical Physician

**Step 1: Create user**
```bash
curl -X POST https://work.elfadil.com/api/v1/auths/add \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Nora Al-Otaibi","email":"n.alotaibi@hospital.sa","password":"ChangeMe2025!","role":"user"}'
```

**Step 2: Assign to Clinical group**
```bash
curl -X POST "https://work.elfadil.com/api/v1/groups/6c4d469b-00ee-4f73-970c-a935ae82a095/members/add" \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID_FROM_STEP_1"}'
```

Access granted: **ClinicalLinc, HealthcareLinc, RadioLinc, CodeLinc, TTLinc, Basma**

---

## 📋 User Management Quick Reference

| Action | Method | Endpoint |
|--------|--------|---------|
| List all users | GET | `/api/v1/users` |
| Create user | POST | `/api/v1/auths/add` |
| Update user role | POST | `/api/v1/users/{id}/role` |
| Delete user | DELETE | `/api/v1/users/{id}` |
| List groups | GET | `/api/v1/groups` |
| Add to group | POST | `/api/v1/groups/{id}/members/add` |
| Remove from group | DELETE | `/api/v1/groups/{id}/members/{user_id}` |
| List API keys | GET | `/api/v1/users/{id}/api-keys` |
| Create API key | POST | `/api/v1/users/{id}/api-keys` |

---

## Legacy Content

---

## Admin Account

| Field | Value |
|-------|-------|
| Email | `brainsait@icloud.com` |
| Role | `admin` |
| Groups | Admins, Engineering |

> **Security:** Rotate the admin API key regularly via Admin Panel → Account → API Keys.

---

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full platform access, admin panel, user management |
| `user` | Standard access — limited to assigned groups/models |
| `pending` | Awaiting admin approval (sign-up flow) |

---

## Adding Users

### Via Admin Panel
1. Admin Panel → **Users** → **+**
2. Enter email, name, role
3. Assign group(s)
4. Send invite or set temporary password

### Via API
```bash
curl -X POST https://work.elfadil.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@hospital.sa","name":"User Name","password":"TempPass123!"}'
```

Then promote to user role and assign groups via admin panel.

---

## Group Assignment

Each user can belong to multiple groups. Access is the union of all group permissions.

Recommended group assignments by role:

| Job Title | Groups |
|-----------|--------|
| Hospital Administrator | Admins |
| Claims Processor | RCM |
| Insurance Coordinator | RCM |
| Physician | Clinical |
| Radiologist | Clinical |
| Medical Coder | Clinical, RCM |
| Nurse | Nursing |
| Ward Manager | Nursing, Clinical |
| IT Manager | Operations, Engineering |
| FHIR Developer | Engineering |
| Compliance Officer | Operations |

---

## SSO / LDAP (Planned)

Future integration:
- **SAML 2.0** — hospital LDAP/AD
- **OAuth 2.0** — Microsoft Entra (Azure AD)
- **OIDC** — Google Workspace

Configure via: `WEBUI_AUTH_TRUSTED_EMAIL_HEADER` for header-based SSO.

---

## API Key Management

Each user can generate personal API keys for programmatic access.

```bash
# Use API key in requests
curl https://work.elfadil.com/api/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{"model":"masterlinc","messages":[{"role":"user","content":"Hello"}]}'
```

Admin can view and revoke all keys via Admin Panel → **Users** → select user → **API Keys**.

---

## Access Grants

Access grants control which models/agents are visible to which groups.
Stored in `access_grant` table with:
- `type`: model | tool | function | skill
- `access_control`: JSON with group IDs

View all grants:
```bash
docker exec open-webui python3 -c "
import sqlite3, json
db = sqlite3.connect('/app/backend/data/webui.db')
rows = db.execute('SELECT * FROM access_grant').fetchall()
print(json.dumps(rows, indent=2))
"
```

---

## Audit Trail

All user actions are captured by the **Compliance Auditor** pipeline function.
For HIPAA-grade auditing, export logs from `audit_log` table:

```bash
docker exec open-webui sqlite3 /app/backend/data/webui.db \
  "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100"
```
