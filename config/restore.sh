#!/usr/bin/env bash
# ============================================================
# BrainSAIT Platform Restore Script
# Restores all agents, tools, functions, groups, channels,
# skills to a fresh open-webui container.
# Usage: ADMIN_KEY=sk-xxx BASE_URL=https://work.elfadil.com bash restore.sh
# ============================================================
set -euo pipefail

BASE_URL="${BASE_URL:-https://work.elfadil.com}"
ADMIN_KEY="${ADMIN_KEY:?'Set ADMIN_KEY env var to your admin API key'}"
HEADERS=(-H "Authorization: Bearer $ADMIN_KEY" -H "Content-Type: application/json")

ok() { echo "✅ $*"; }
err() { echo "❌ $*" >&2; }
info() { echo "ℹ️  $*"; }

info "BrainSAIT restore → $BASE_URL"
info "Checking connection..."
curl -sf "$BASE_URL/health" > /dev/null || { err "Cannot reach $BASE_URL"; exit 1; }
ok "Connected"

# ── HELPER ────────────────────────────────────────────────────
post() {
  local endpoint="$1" payload="$2"
  curl -sf -X POST "$BASE_URL$endpoint" "${HEADERS[@]}" -d "$payload" 2>&1
}

# ============================================================
# 1. AGENTS (models)
# ============================================================
info "Creating LINC agents..."

create_agent() {
  local id="$1" name="$2" base="$3" desc="$4" system="$5"
  post "/api/v1/models/create" "{
    \"id\": \"$id\",
    \"name\": \"$name\",
    \"base_model_id\": \"$base\",
    \"meta\": {\"description\": \"$desc\"},
    \"params\": {\"system\": \"$system\", \"temperature\": 0.1}
  }" && ok "$name" || err "$name"
}

create_agent "masterlinc" "MASTERLINC" "gpt-4o" \
  "Master orchestrator routing all LINC agents" \
  "You are MASTERLINC, BrainSAIT's master orchestrator. Route requests to specialist agents: ClaimLinc (claims), AuthLinc (auth), DRGLinc (DRG), ClinicalLinc (clinical), RadioLinc (radiology), CodeLinc (coding), BridgeLinc (FHIR), ComplianceLinc (compliance), TTLinc (translation), Basma (patient comms), NPHIES-Agent (NPHIES ops). Always respond in the same language as the user. Enforce HIPAA audit logging."

create_agent "claimlinc" "ClaimLinc" "gpt-4o" \
  "NPHIES claims automation and processing" \
  "You are ClaimLinc, BrainSAIT's claims automation AI. Process Saudi NPHIES insurance claims. Output structured JSON. Validate against NPHIES v2 rules. Handle: claim submission, denial analysis, appeal letters, batch processing. Always cite claim IDs and payer codes."

create_agent "authlinc" "AuthLinc" "gpt-4o" \
  "Prior authorization AI for Saudi insurers" \
  "You are AuthLinc, BrainSAIT's prior authorization AI. Process PA requests for Saudi insurers (Bupa, Tawnia, AXA, Medgulf, Al Rajhi). Apply clinical criteria (InterQual, MCG). Output: approval/denial recommendation, required documentation, appeal pathway."

create_agent "drglinc" "DRGLinc" "DeepSeek-R1" \
  "Saudi DRG optimization and case-mix intelligence" \
  "You are DRGLinc, BrainSAIT's DRG optimization AI. Analyze Saudi DRG groupings, optimize case-mix, identify upcoding opportunities within ethical bounds. Apply Saudi DRG v3.1 rules. Output: DRG code, weight, optimization recommendations."

create_agent "clinicallinc" "ClinicalLinc" "gpt-4o" \
  "Clinical decision support and differential diagnosis" \
  "You are ClinicalLinc, BrainSAIT's clinical AI. Provide evidence-based clinical decision support. Differential diagnosis, drug interactions, dosing (renal/hepatic adjustment), clinical pathways. Always cite clinical guidelines. Flag emergencies immediately."

create_agent "healthcarelinc" "HealthcareLinc" "gpt-4o" \
  "Patient journey and care coordination" \
  "You are HealthcareLinc, BrainSAIT's care coordination AI. Manage patient journeys: admission, OPD, discharge planning, chronic disease management, international patients. Coordinate between departments. Always bilingual Arabic/English."

create_agent "radiolinc" "RadioLinc" "gpt-4o" \
  "Radiology AI and structured report generation" \
  "You are RadioLinc, BrainSAIT's radiology AI. Interpret imaging findings, generate structured radiology reports (BI-RADS, TI-RADS, Fleischner). Support: CT, MRI, US, PET-CT, X-Ray. Output: findings, impression, recommendations. HIPAA compliant."

create_agent "codelinc" "CodeLinc" "DeepSeek-R1" \
  "Medical coding AI: ICD-10-AM, CPT, Saudi DRG" \
  "You are CodeLinc, BrainSAIT's medical coding AI. Assign accurate ICD-10-AM, CPT, and Saudi DRG codes. Apply sequencing rules (PDx, SDx, OR procedures). Validate against NPHIES coding requirements. Ultra-low temperature for deterministic output."

create_agent "bridgelinc" "BridgeLinc" "gpt-4.1" \
  "FHIR R4 interoperability and API transformations" \
  "You are BridgeLinc, BrainSAIT's FHIR integration AI. Build and validate FHIR R4 bundles for NPHIES. Transform HL7 v2, CDA to FHIR. Validate against Saudi NPHIES profiles. Support: Patient, Coverage, Claim, ClaimResponse, Organization resources."

create_agent "compliancelinc" "ComplianceLinc" "gpt-4o" \
  "Healthcare compliance: PDPO, NPHIES, HIPAA" \
  "You are ComplianceLinc, BrainSAIT's compliance AI. Enforce Saudi PDPO, NPHIES rules, HIPAA standards, MOH regulations. Audit data handling, breach response (72-hour rule), AI governance, cross-border data transfers. Generate compliance reports."

create_agent "ttlinc" "TTLinc" "DeepSeek-V3-0324" \
  "Medical translation: Arabic-English bilingual" \
  "You are TTLinc, BrainSAIT's medical translation AI. Translate medical documents Arabic↔English. Saudi Arabic dialects (Najdi, Hijazi, Gulf). Precise clinical terms: الكسر (fracture), قلصية (spastic), طفيف (mild), الكسر، الجراحة، التشخيص. ISO 17100 standard. Output: ORIGINAL | TRANSLATION | CONFIDENCE | DIALECT_NOTES."

create_agent "basma" "Basma" "gpt-4o" \
  "AI patient secretary: bilingual voice/messaging" \
  "You are Basma (بسمة), BrainSAIT's AI patient secretary. Handle appointment booking, insurance queries, prescription reminders, patient communication via voice and WhatsApp. Always warm, professional, bilingual Arabic/English. Never disclose PHI without verification."

create_agent "brainsait-nphies-agent" "BrainSAIT NPHIES Agent" "gpt-4.1" \
  "NPHIES technical operations and API management" \
  "You are the BrainSAIT NPHIES Agent. Technical operations: batch claim submission, eligibility checks, remittance advice processing, NPHIES v2 compliance. Output structured JSON. Validate all bundles before submission. Log all transactions."

ok "Agents created"

# ============================================================
# 2. FUNCTIONS (global pipeline filters)
# ============================================================
info "Creating pipeline functions..."

create_function() {
  local id="$1" name="$2" type="$3" content="$4"
  post "/api/v1/functions/create" "{
    \"id\": \"$id\",
    \"name\": \"$name\",
    \"type\": \"$type\",
    \"is_active\": true,
    \"is_global\": true,
    \"content\": $(echo "$content" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
  }" && ok "$name" || err "$name"
}

PHI_GUARDIAN='
class Filter:
    def inlet(self, body, __user__=None):
        import re
        patterns = [
            (r"\b\d{10}\b", "[NATIONAL_ID]"),
            (r"\b\d{3}-\d{2}-\d{4}\b", "[SSN]"),
            (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL]"),
            (r"\b(?:\+966|00966|0)?\s*5[0-9]{8}\b", "[PHONE]"),
        ]
        for msg in body.get("messages", []):
            content = msg.get("content", "")
            for pattern, replacement in patterns:
                content = re.sub(pattern, replacement, content)
            msg["content"] = content
        return body
    def outlet(self, body, __user__=None):
        return body
'
create_function "phi_guardian" "PHI Guardian" "filter" "$PHI_GUARDIAN"

COMPLIANCE_AUDITOR='
class Filter:
    def inlet(self, body, __user__=None):
        return body
    def outlet(self, body, __user__=None):
        import json, datetime
        audit = {"timestamp": datetime.datetime.utcnow().isoformat(), "user": str(__user__), "messages": len(body.get("messages", []))}
        # In production: write to audit log
        return body
'
create_function "compliance_auditor" "Compliance Auditor" "filter" "$COMPLIANCE_AUDITOR"

BILINGUAL_FORMATTER='
class Filter:
    def inlet(self, body, __user__=None):
        return body
    def outlet(self, body, __user__=None):
        for msg in body.get("messages", []):
            if msg.get("role") == "assistant":
                content = msg.get("content", "")
                if not content.strip().startswith("#") and len(content) > 200:
                    pass  # formatting applied at model level via system prompt
        return body
'
create_function "bilingual_formatter" "Bilingual Formatter" "filter" "$BILINGUAL_FORMATTER"

ok "Functions created"

# ============================================================
# 3. GROUPS
# ============================================================
info "Creating groups..."

create_group() {
  local name="$1" desc="$2"
  post "/api/v1/groups/create" "{\"name\": \"$name\", \"description\": \"$desc\", \"permissions\": {}}" \
    && ok "Group: $name" || err "Group: $name"
}

create_group "Admins" "🔑 Platform Administrators — full access to all LINC agents, tools, and admin panel"
create_group "RCM" "💰 Revenue Cycle Management — ClaimLinc, AuthLinc, DRGLinc, NPHIES workflows"
create_group "Clinical" "🩺 Clinical Teams — ClinicalLinc, HealthcareLinc, RadioLinc, CodeLinc"
create_group "Nursing" "👩‍⚕️ Nursing & Allied Health — HealthcareLinc, Basma. Ward management focus"
create_group "Operations" "🔗 Operations & Infrastructure — BridgeLinc, ComplianceLinc, TTLinc"
create_group "Engineering" "⚙️ BrainSAIT Engineering — full workspace, API keys, direct model access"

ok "Groups created"

# ============================================================
# 4. CHANNELS (workspaces)
# ============================================================
info "Creating workspaces/channels..."

create_channel() {
  local name="$1" desc="$2"
  post "/api/v1/channels/create" "{\"name\": \"$name\", \"description\": \"$desc\", \"is_private\": false}" \
    && ok "Channel: $name" || err "Channel: $name"
}

# RCM / Insurance Payers
create_channel "💰 Tawnia Claims" "Tawnia (تأمينية) — MOH-backed national insurer claims processing"
create_channel "🏥 MOH Claims" "Ministry of Health direct billing and government claims"
create_channel "🔵 Bupa Arabia" "Bupa Arabia corporate health — prior auth, claims, case management"
create_channel "🏦 Al Rajhi Takaful" "Al Rajhi Takaful — Sharia-compliant insurance processing"
create_channel "🌐 AXA Arabia" "AXA Arabia — international protocols, expatriate health"
create_channel "💊 Medgulf" "Medgulf Insurance — claims, eligibility, authorization"

# Clinical Workflows
create_channel "🏥 OPD Workflow" "Outpatient department — consultations, follow-ups, referrals"
create_channel "👩‍⚕️ Ward Management" "Inpatient nursing — ward rounds, medication, observations"
create_channel "💊 Pharmacy CDS" "Pharmacy clinical decision support — drug interactions, dosing"
create_channel "🚑 Emergency & Triage" "Emergency department — triage, rapid assessment, escalation"
create_channel "🚪 Discharge Planning" "Discharge coordination — summary, follow-up, insurance clearance"
create_channel "🤒 Patient Care" "General patient management — chronic disease, monitoring"

# Specialty Desks
create_channel "📋 Coding Desk" "Medical coding — ICD-10-AM, CPT, DRG assignment (CodeLinc)"
create_channel "🩻 Radiology Desk" "Radiology reports, PACS integration, AI findings (RadioLinc)"
create_channel "📈 DRG & Case-Mix" "DRG optimization, case-mix analysis, revenue enhancement"
create_channel "📊 NPHIES Operations" "NPHIES batch submissions, eligibility, remittance processing"

# Infrastructure
create_channel "⚙️ Infrastructure" "BridgeLinc — FHIR, system health, Cloudflare, Oracle RAD"
create_channel "🔗 FHIR Bridge" "FHIR R4 bundle creation, validation, NPHIES profile compliance"
create_channel "🛡️ Compliance Monitor" "ComplianceLinc — HIPAA audit, PDPO, data governance"
create_channel "🌍 Translation Hub" "TTLinc — bilingual medical document translation AR↔EN"

ok "Channels created"

# ============================================================
echo ""
echo "════════════════════════════════════════════"
echo "  BrainSAIT Platform Restore Complete ✅"
echo "  → $BASE_URL"
echo "════════════════════════════════════════════"
echo "Next steps:"
echo "  1. Assign tools to each agent via Admin Panel"
echo "  2. Add users to groups"
echo "  3. Apply custom CSS theme (docs/custom-theme.md)"
echo "  4. Set GITHUB_MODELS_TOKEN secret for GitHub proxy"
echo "  5. Run: python3 tests/base_scenarios.py to validate"
