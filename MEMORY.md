# MEMORY.md - Long-Term Memory

## Identity

- I am Basma (بسمة) — BrainSAIT's bilingual AI assistant, named by Dr. Mohamed El Fadil on Fri 24 Apr 2026
- I am both a product (LINC Agents Suite #12 — patient engagement) and Dr. Fadil's personal OpenClaw assistant
- Bilingual Arabic/English is core to who I am — not an afterthought

## The Human

- **Dr. Mohamed El Fadil, MBBS** — Founder & CEO of BrainSAIT LTD
- Emergency Medicine / Neurosurgery / Critical Care background
- Full-stack engineer (Python, TypeScript, Swift)
- Based in Saudi Arabia operations, UK company registration
- Telegram: @Fadil369 | Email: brainsait@icloud.com | Phone: +966 510 010 991

## BrainSAIT

- AI-Native Healthcare OS for Saudi Vision 2030
- Flagship: ClaimLinc (claim rejection: 15-25% → <5%, payment cycles: 87 days → cut 40-60%)
- 12 LINC Agents, NPHIES/FHIR R4 native, bilingual clinical NLP
- Oracle RAD integration (6 hospitals)
- Infrastructure: Cloudflare + Google Cloud + Hostinger VPS + Raspberry Pi 5
- Revenue targets: SAR 4-9M (Y1), 11-27M (Y2), 30-60M+ (Y3+)
- Philosophy: "LEARN → DO → TEACH → SELL"

## Credentials

- Cloudflare Account ID: `d7b99530559ab4f2545e9bdc72a7ab9b` (elfadil.com zone / BrainSAIT Workers)
- CF API Token: stored in `.secrets` (workspace) — Edit Workers scope, rolled 2026-04-24
- Do NOT put credentials in MEMORY.md — always reference `.secrets`

## Key Lessons / Notes

- Dr. Fadil communicates in Arabic and English — match his language
- He's a builder — be direct, technically-literate, avoid fluff
- Clinical precision matters — I should understand NPHIES, FHIR, claims workflows
- First bootstrap session: Fri 24 Apr 2026

## NPHIES Integration (2026-04-26)

- **Auth**: Keycloak `community` client, password grant, `sehaticoreprod` realm — NO OTP required for API access
- **Transaction Viewer API**: `https://sgw.nphies.sa/viewerapi/`
- **Community Portal API**: `https://sgw.nphies.sa/sehaticoreprod-assistaPortal/api/`
- **Org**: AlInma Medical Services Company (org_id: 624) = Hayat National Hospital Group
- **6 facilities** mapped: Riyadh, Madinah, Unaizah, Khamis, Jizan, Abha
- **Riyadh license**: `10000000000988`
- **Live data**: SAR 835.7M network value, 98.6% approval rate, 51,018 PA records, 564 COCs
- **Python client**: `integrations/nphies/client.py` | Oracle Bridge: `integrations/nphies/oracle_bridge.py`
- **Skill**: `~/.openclaw/skills/nphies/SKILL.md`
- Required headers: `facilitylicense`, `facilitytype`, `username`
- Oracle RAD integration: 6 branches fully mapped, bridge module live
- **Credentials in**: `.secrets` (do NOT log here)
- **Riyadh flag**: 88.5% approval (only branch with rejections — needs investigation)
- **All 5 integration steps COMPLETE** as of 2026-04-26

## Oracle RAD Integration

- 6 hospital branches: riyadh, madinah, unaizah, khamis, jizan, abha
- Oracle portal tools active: `oracle_check_eligibility`, `oracle_claims_search`, `oracle_manage_approvals`, `oracle_patient_search`

## Session Log

- **2026-04-24:** Bootstrap complete. Identity established. USER.md, IDENTITY.md updated with full BrainSAIT context.
- **2026-04-26:** NPHIES portal fully integrated. All 5 steps complete: Eligibility, Oracle Bridge, Prior Auth (51K records), ClaimLinc metrics (SAR 835.7M / 98.6%), Basma network queries. Oracle RAD ↔ NPHIES bridge live.

## ClaimLinc API — Cloudflare Worker (2026-04-26)

- **Worker**: `claimlinc-api` deployed to `brainsait-fadil.workers.dev`
- **URL**: `https://claimlinc-api.brainsait-fadil.workers.dev`
- **Route**: `api.brainsait.org/nphies/*`
- **API Key**: `.secrets` → `CLAIMLINC_API_KEY`
- **Endpoints**: /nphies/facilities, /nphies/network/summary, /nphies/gss/:branch, /nphies/coc/:branch, /nphies/pa/:branch[/checkstatus], /nphies/claims/:branch, /nphies/eligibility/:branch, /nphies/rejections/:branch
- **Basma voice**: /basma/health, /basma/eligibility, /basma/pa/status, /basma/network/kpis, /basma/claim/status
- Speech output: bilingual Arabic + English, TTS-ready. Live and tested.
- Source: `integrations/claimlinc-worker/src/`

## n8n Docker (2026-04-26)

- **Container**: `n8n-brainsait` on Raspberry Pi 5
- **Local**: http://localhost:5678 | **Tailscale**: http://100.126.118.25:5678
- **Timezone**: Asia/Riyadh | **Data**: `/home/fadil369/n8n/data`
- NPHIES + ClaimLinc API env vars pre-injected
- **N8N_ENCRYPTION_KEY**: in `.secrets`

## Riyadh Rejection Analysis (2026-04-26)

- 1 rejected GSS: May 2025, GlobeMed Saudi, SAR 99,997.32, 1 claim
- ReasonCode: WI (predominant across PA requests)
- All other 5 branches: 100% approval
- 16,229 PA requests at Riyadh — Tawuniya dominant payer for PA
