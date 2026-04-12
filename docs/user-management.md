# BrainSAIT User Management

## Platform Users

The platform currently runs with a single admin account. Additional users can be
added via the Admin Panel or provisioned programmatically via the REST API.

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
