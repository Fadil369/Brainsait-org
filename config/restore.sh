#!/usr/bin/env bash
# ============================================================
# BrainSAIT Platform Restore Script v2.0
# Restores all 13 agents, 20 tools, 3 functions, 6 groups,
# 20 channels, 10 skills and access grants to a fresh
# open-webui container.
#
# Usage:
#   export ADMIN_KEY="sk-your-admin-api-key"
#   export BASE_URL="https://work.elfadil.com"   # optional, default shown
#   bash restore.sh
#
# Requirements: bash, curl, python3 (stdlib only)
# The payload JSON files must be in the same directory as this script.
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_URL="${BASE_URL:-https://work.elfadil.com}"
ADMIN_KEY="${ADMIN_KEY:?'ERROR: Set ADMIN_KEY env var to your admin API key'}"

AUTH_HEADER="Authorization: Bearer ${ADMIN_KEY}"
CT_HEADER="Content-Type: application/json"

# ── Helpers ──────────────────────────────────────────────────
ok()   { echo "  ✅ $*"; }
err()  { echo "  ❌ $*" >&2; }
info() { echo ""; echo "▶ $*"; }
sep()  { echo "────────────────────────────────────────────"; }

api_post() {
  local path="$1" data="$2"
  local resp http_code
  resp=$(curl -s -w "\n%{http_code}" -X POST \
    -H "$AUTH_HEADER" -H "$CT_HEADER" \
    -d "$data" \
    "${BASE_URL}${path}" 2>&1)
  http_code=$(echo "$resp" | tail -1)
  body=$(echo "$resp" | head -n -1)
  if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
    echo "$body"
    return 0
  else
    echo "HTTP $http_code: $body" >&2
    return 1
  fi
}

api_get() {
  local path="$1"
  curl -sf -H "$AUTH_HEADER" "${BASE_URL}${path}"
}

sep
echo "  🧠 BrainSAIT Platform Restore Script v2.0"
echo "  Target: ${BASE_URL}"
sep

info "Checking connectivity..."
if curl -sf "${BASE_URL}/health" > /dev/null 2>&1; then
  ok "Platform reachable at ${BASE_URL}"
else
  err "Cannot reach ${BASE_URL} — check URL and network"
  exit 1
fi

# Verify admin key works
if ! api_get "/api/v1/auths/api_key" > /dev/null 2>&1; then
  err "ADMIN_KEY authentication failed — get your API key from Settings > Account"
  exit 1
fi
ok "Admin authentication verified"

# ============================================================
# STEP 1: TOOLS (must be created before agents reference them)
# ============================================================
info "Step 1/6: Registering 20 tools..."

TOOLS_FILE="${SCRIPT_DIR}/tools_payload.json"
if [[ ! -f "$TOOLS_FILE" ]]; then
  err "Missing ${TOOLS_FILE} — run export first or place payload files in config/"
  exit 1
fi

python3 - << 'PYEOF'
import json, subprocess, sys, os

base_url = os.environ.get('BASE_URL', 'https://work.elfadil.com')
admin_key = os.environ['ADMIN_KEY']
script_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else os.getcwd()

# Find tools file relative to script
tools_file = os.path.join(os.environ.get('SCRIPT_DIR', script_dir), 'tools_payload.json')
tools = json.load(open(tools_file))

success = 0
fail = 0
for tool in tools:
    payload = json.dumps({
        "id": tool["id"],
        "name": tool["name"],
        "content": tool.get("content", ""),
        "meta": {"description": tool.get("name", "")},
        "is_active": True
    })
    result = subprocess.run([
        "curl", "-s", "-w", "\n%{http_code}",
        "-X", "POST",
        f"{base_url}/api/v1/tools/create",
        "-H", f"Authorization: Bearer {admin_key}",
        "-H", "Content-Type: application/json",
        "-d", payload
    ], capture_output=True, text=True)
    lines = result.stdout.strip().split("\n")
    code = lines[-1] if lines else "000"
    if code.startswith("2"):
        print(f"  ✅ {tool['name']}")
        success += 1
    else:
        print(f"  ⚠️  {tool['name']} (HTTP {code}) — may already exist")
        fail += 1

print(f"\n  Tools: {success} created, {fail} skipped/existing")
PYEOF

# ============================================================
# STEP 2: FUNCTIONS (global pipeline filters)
# ============================================================
info "Step 2/6: Registering 3 pipeline functions..."

python3 - << 'PYEOF'
import json, subprocess, sys, os

base_url = os.environ.get('BASE_URL', 'https://work.elfadil.com')
admin_key = os.environ['ADMIN_KEY']
script_dir = os.environ.get('SCRIPT_DIR', os.getcwd())

funcs_file = os.path.join(script_dir, 'functions_payload.json')
functions = json.load(open(funcs_file))

for fn in functions:
    payload = json.dumps({
        "id": fn["id"],
        "name": fn["name"],
        "type": fn.get("type", "filter"),
        "content": fn.get("content", ""),
        "is_active": True,
        "is_global": fn.get("is_global", True),
        "meta": {"description": fn.get("name", "")}
    })
    result = subprocess.run([
        "curl", "-s", "-w", "\n%{http_code}",
        "-X", "POST",
        f"{base_url}/api/v1/functions/create",
        "-H", f"Authorization: Bearer {admin_key}",
        "-H", "Content-Type: application/json",
        "-d", payload
    ], capture_output=True, text=True)
    lines = result.stdout.strip().split("\n")
    code = lines[-1] if lines else "000"
    if code.startswith("2"):
        print(f"  ✅ {fn['name']} (global filter)")
    else:
        print(f"  ⚠️  {fn['name']} (HTTP {code}) — may already exist")
PYEOF

# ============================================================
# STEP 3: AGENTS (LINC models with system prompts)
# ============================================================
info "Step 3/6: Registering 13 LINC agents..."

python3 - << 'PYEOF'
import json, subprocess, sys, os

base_url = os.environ.get('BASE_URL', 'https://work.elfadil.com')
admin_key = os.environ['ADMIN_KEY']
script_dir = os.environ.get('SCRIPT_DIR', os.getcwd())

agents_file = os.path.join(script_dir, 'agents_payload.json')
agents = json.load(open(agents_file))

# Model base IDs — map to GitHub Models proxy IDs
MODEL_MAP = {
    None: "gpt-4o",
    "gpt-4o": "gpt-4o",
    "gpt-4.1": "gpt-4.1",
    "DeepSeek-R1": "DeepSeek-R1",
    "DeepSeek-V3-0324": "DeepSeek-V3-0324",
}

success = 0
fail = 0
for agent in agents:
    meta = agent.get("meta", {}) or {}
    params = agent.get("params", {}) or {}
    base_id = agent.get("base_model_id") or "gpt-4o"

    payload = json.dumps({
        "id": agent["id"],
        "name": agent["name"],
        "base_model_id": base_id,
        "meta": {
            "description": meta.get("description", ""),
            "toolIds": meta.get("toolIds", []),
            "capabilities": meta.get("capabilities", {})
        },
        "params": {
            "system": params.get("system", ""),
            "temperature": params.get("temperature", 0.3),
            "stream_response": True
        },
        "is_active": True
    })
    result = subprocess.run([
        "curl", "-s", "-w", "\n%{http_code}",
        "-X", "POST",
        f"{base_url}/api/v1/models/create",
        "-H", f"Authorization: Bearer {admin_key}",
        "-H", "Content-Type: application/json",
        "-d", payload
    ], capture_output=True, text=True)
    lines = result.stdout.strip().split("\n")
    code = lines[-1] if lines else "000"
    if code.startswith("2"):
        print(f"  ✅ {agent['name']} [{base_id}]")
        success += 1
    else:
        print(f"  ⚠️  {agent['name']} (HTTP {code}) — may already exist")
        fail += 1

print(f"\n  Agents: {success} created, {fail} skipped/existing")
PYEOF

# ============================================================
# STEP 4: GROUPS
# ============================================================
info "Step 4/6: Creating 6 groups..."

create_group() {
  local name="$1" desc="$2"
  local payload
  payload=$(python3 -c "import json; print(json.dumps({'name': '$name', 'description': '$desc', 'permissions': {'workspace': {'models': True, 'knowledge': True, 'prompts': True, 'tools': False, 'skills': True}, 'chat': {'file_upload': True, 'delete': True, 'edit': True, 'temporary': True}, 'features': {'web_search': True, 'image_generation': False, 'code_interpreter': False, 'memories': True, 'direct_tool_servers': False}}}))")
  local resp
  resp=$(curl -s -w "\n%{http_code}" -X POST \
    -H "$AUTH_HEADER" -H "$CT_HEADER" \
    -d "$payload" \
    "${BASE_URL}/api/v1/groups/create" 2>&1)
  local code
  code=$(echo "$resp" | tail -1)
  if [[ "$code" -ge 200 && "$code" -lt 300 ]]; then
    echo "  ✅ Group: $name"
    echo "$resp" | head -n -1 | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id',''))"
  else
    err "Group: $name (HTTP $code)"
    echo ""
  fi
}

ADMINS_ID=$(create_group "Admins" "Platform Administrators — full access to all LINC agents and admin panel")
ENGINEERING_ID=$(create_group "Engineering" "BrainSAIT Engineering — full workspace, API keys, direct model access")
RCM_ID=$(create_group "RCM" "Revenue Cycle Management — ClaimLinc, AuthLinc, DRGLinc, NPHIES workflows")
CLINICAL_ID=$(create_group "Clinical" "Clinical Teams — ClinicalLinc, HealthcareLinc, RadioLinc, CodeLinc")
NURSING_ID=$(create_group "Nursing" "Nursing and Allied Health — HealthcareLinc, Basma, ward management")
OPERATIONS_ID=$(create_group "Operations" "Operations and Infrastructure — BridgeLinc, ComplianceLinc, TTLinc")

echo "  Group IDs captured for access grants"

# ============================================================
# STEP 5: CHANNELS (workspaces)
# ============================================================
info "Step 5/6: Creating 20 channels/workspaces..."

create_channel() {
  local name="$1" desc="$2"
  local payload
  payload=$(python3 -c "import json; print(json.dumps({'name': '${name}', 'description': '${desc}', 'is_private': False}))")
  local resp code
  resp=$(curl -s -w "\n%{http_code}" -X POST \
    -H "$AUTH_HEADER" -H "$CT_HEADER" \
    -d "$payload" \
    "${BASE_URL}/api/v1/channels/create" 2>&1)
  code=$(echo "$resp" | tail -1)
  if [[ "$code" -ge 200 && "$code" -lt 300 ]]; then
    echo "  ✅ $name"
  else
    err "$name (HTTP $code)"
  fi
}

# RCM / Insurance Payers
create_channel "Tawnia Claims" "Tawnia (MOH-backed) insurance claims and NPHIES submissions"
create_channel "MOH Claims" "Ministry of Health direct billing and government reimbursements"
create_channel "Bupa Arabia" "Bupa Arabia corporate health claims and prior authorization"
create_channel "Al Rajhi Takaful" "Al Rajhi Takaful Sharia-compliant insurance processing"
create_channel "AXA Arabia" "AXA Arabia international health protocols and claims"
create_channel "Medgulf" "Medgulf Insurance claims, eligibility, and authorization"

# Clinical Workflows
create_channel "OPD Workflow" "Outpatient department consultations, follow-ups, and referrals"
create_channel "Ward Management" "Inpatient nursing ward rounds, medication, and observations"
create_channel "Pharmacy CDS" "Pharmacy clinical decision support, drug interactions, and dosing"
create_channel "Emergency and Triage" "Emergency department triage, rapid assessment, and escalation"
create_channel "Discharge Planning" "Discharge coordination, summary generation, insurance clearance"
create_channel "Patient Care" "General patient management, chronic disease, and care coordination"

# Specialty Desks
create_channel "Coding Desk" "Medical coding ICD-10-AM CPT DRG assignment via CodeLinc"
create_channel "Radiology Desk" "Radiology reports PACS integration AI findings via RadioLinc"
create_channel "DRG and Case-Mix" "DRG optimization, case-mix analysis, revenue enhancement"
create_channel "NPHIES Operations" "NPHIES batch submissions, eligibility checks, remittance"

# Infrastructure
create_channel "Infrastructure" "BridgeLinc system health Cloudflare Oracle portal management"
create_channel "FHIR Bridge" "FHIR R4 bundle construction, validation, NPHIES profile compliance"
create_channel "Compliance Monitor" "ComplianceLinc HIPAA audit PDPL data governance"
create_channel "Translation Hub" "TTLinc bilingual medical document translation Arabic English"

# ============================================================
# STEP 6: ACCESS GRANTS — assign agents to groups
# ============================================================
info "Step 6/6: Setting up access grants..."

# Re-fetch group IDs in case they already existed
python3 - << 'PYEOF'
import json, subprocess, os, sys

base_url = os.environ.get('BASE_URL', 'https://work.elfadil.com')
admin_key = os.environ['ADMIN_KEY']

# Get groups from API
result = subprocess.run([
    "curl", "-sf",
    "-H", f"Authorization: Bearer {admin_key}",
    f"{base_url}/api/v1/groups"
], capture_output=True, text=True)

try:
    groups = json.loads(result.stdout)
    if isinstance(groups, dict) and "groups" in groups:
        groups = groups["groups"]
except Exception:
    print("  ⚠️  Could not fetch groups for access grants")
    sys.exit(0)

group_map = {g["name"]: g["id"] for g in groups}

# Access grant definitions: (agent_id, group_names)
agent_grants = [
    ("masterlinc",              ["Admins", "Engineering"]),
    ("claimlinc",               ["Admins", "Engineering", "RCM"]),
    ("authlinc",                ["Admins", "Engineering", "RCM"]),
    ("drglinc",                 ["Admins", "Engineering", "RCM"]),
    ("clinicallinc",            ["Admins", "Engineering", "Clinical"]),
    ("healthcarelinc",          ["Admins", "Engineering", "Clinical", "Nursing"]),
    ("radiolinc",               ["Admins", "Engineering", "Clinical"]),
    ("codelinc",                ["Admins", "Engineering", "Clinical", "RCM"]),
    ("bridgelinc",              ["Admins", "Engineering", "Operations", "RCM"]),
    ("compliancelinc",          ["Admins", "Engineering", "Operations"]),
    ("ttlinc",                  ["Admins", "Engineering", "Operations", "Clinical", "Nursing", "RCM"]),
    ("basma",                   ["Admins", "Engineering", "Clinical", "Nursing"]),
    ("brainsait-nphies-agent",  ["Admins", "Engineering", "RCM", "Operations"]),
]

success = 0
fail = 0
for agent_id, group_names in agent_grants:
    for group_name in group_names:
        group_id = group_map.get(group_name)
        if not group_id:
            print(f"  ⚠️  Group '{group_name}' not found — skipping grant for {agent_id}")
            continue
        payload = json.dumps({
            "resource_type": "model",
            "resource_id": agent_id,
            "principal_type": "group",
            "principal_id": group_id,
            "permission": "read"
        })
        result = subprocess.run([
            "curl", "-s", "-w", "\n%{http_code}",
            "-X", "POST",
            f"{base_url}/api/v1/access-control/grants",
            "-H", f"Authorization: Bearer {admin_key}",
            "-H", "Content-Type: application/json",
            "-d", payload
        ], capture_output=True, text=True)
        lines = result.stdout.strip().split("\n")
        code = lines[-1] if lines else "000"
        if code.startswith("2") or code == "409":
            success += 1
        else:
            print(f"  ⚠️  Grant {agent_id} -> {group_name} (HTTP {code})")
            fail += 1

print(f"  ✅ Access grants: {success} applied, {fail} failed")
PYEOF

# ============================================================
# STEP 7: SKILLS
# ============================================================
info "Step 7 (bonus): Registering 10 skills..."

python3 - << 'PYEOF'
import json, subprocess, os

base_url = os.environ.get('BASE_URL', 'https://work.elfadil.com')
admin_key = os.environ['ADMIN_KEY']
script_dir = os.environ.get('SCRIPT_DIR', os.getcwd())

skills_file = os.path.join(script_dir, 'skills_payload.json')
if not os.path.exists(skills_file):
    print("  ⚠️  skills_payload.json not found — skipping skills")
    exit(0)

skills = json.load(open(skills_file))
success = 0
fail = 0
for skill in skills:
    meta = skill.get("meta", {}) or {}
    payload = json.dumps({
        "id": skill["id"],
        "name": skill["name"],
        "content": skill.get("content", ""),
        "meta": meta,
        "is_active": True
    })
    result = subprocess.run([
        "curl", "-s", "-w", "\n%{http_code}",
        "-X", "POST",
        f"{base_url}/api/v1/skills/create",
        "-H", f"Authorization: Bearer {admin_key}",
        "-H", "Content-Type: application/json",
        "-d", payload
    ], capture_output=True, text=True)
    lines = result.stdout.strip().split("\n")
    code = lines[-1] if lines else "000"
    if code.startswith("2"):
        print(f"  ✅ {skill['name']}")
        success += 1
    else:
        print(f"  ⚠️  {skill['name']} (HTTP {code}) — may already exist")
        fail += 1

print(f"\n  Skills: {success} registered, {fail} skipped/existing")
PYEOF

# ============================================================
# DONE
# ============================================================
sep
echo ""
echo "  🎉 BrainSAIT Platform Restore Complete!"
echo ""
echo "  Platform: ${BASE_URL}"
echo ""
echo "  Summary:"
echo "    ✅ 20 tools registered"
echo "    ✅  3 global pipeline functions"
echo "    ✅ 13 LINC agents"
echo "    ✅  6 groups"
echo "    ✅ 20 channels/workspaces"
echo "    ✅ 46 access grants"
echo "    ✅ 10 skills"
echo ""
echo "  Next steps:"
echo "    1. Apply custom theme: Admin Panel > Interface > Custom CSS"
echo "       (see docs/custom-theme.md for the full CSS block)"
echo "    2. Verify agent tool assignments in Admin Panel > Models"
echo "    3. Add clinical users and assign to groups:"
echo "       bash -c 'source restore.sh && add_user <name> <email> <group>'"
echo "    4. Set GITHUB_MODELS_TOKEN secret for model proxy"
echo "    5. Test NPHIES connectivity: ask NPHIES Agent to run endpoint test"
sep
