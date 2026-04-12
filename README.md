# 🧠 BrainSAIT — Open WebUI Platform

**AI-native healthcare operating system for Saudi Arabia and MENA**

> Version 6.0 | Author: Dr. Mohamed El Fadil | BrainSAIT LTD (UK) | Operations: Riyadh, Saudi Arabia

---

## Strategic Mission

BrainSAIT builds an AI-native healthcare operating system aligned with **Saudi Vision 2030 digital health transformation**, integrating:

- 🤖 LINC multi-agent orchestration (13 specialist agents)
- 🏥 FHIR R4 / NPHIES insurance interoperability
- 🔒 HIPAA-grade bilingual Arabic-English automation
- ☁️ Cloudflare-native edge infrastructure

---

## Repository Structure

```
open-webui/
├── apps/
│   ├── web/                    # Next.js 16 + React 19 frontend
│   └── workers/
│       ├── api/                # Hono REST API (Cloudflare Workers)
│       └── voice/              # Twilio voice handler + WebSocket streaming
├── packages/
│   ├── shared/                 # Types, AIService, STT/TTS, Logger
│   ├── masterlinc-orchestrator/# MASTERLINC A2A orchestration core
│   └── 3cx-mcp/                # 3CX telephony MCP integration
├── brainsait-mcp-worker/       # BrainSAIT MCP Cloudflare Worker (6 healthcare tools)
├── infrastructure/
│   └── schema.sql              # D1 SQLite schema
└── scripts/                    # Deployment & setup scripts
```

---

## LINC Agent Ecosystem

| Layer | Agents | Purpose |
|-------|--------|---------|
| **Orchestrator** | MASTERLINC | Routing, A2A coordination, audit |
| **Clinical** | HEALTHCARELINC, CLINICALLINC, RadioLinc, CodeLinc | Clinical workflow AI |
| **Insurance** | ClaimLinc, AuthLinc, DRGLinc | RCM & revenue cycle |
| **Infrastructure** | BridgeLinc, TTLINC, COMPLIANCELINC | FHIR / compliance |
| **Communication** | Basma | AI patient voice/messaging |

All 13 agents validated: **76/76 test scenarios — 100% pass rate**

---

## BrainSAIT MCP Worker

6 healthcare tools exposed via MCP JSON-RPC 2.0:
- `nphies_eligibility_check` — real-time insurance eligibility
- `claim_status_lookup` — claim status via NPHIES
- `fhir_validate` — FHIR R4 bundle validation
- `oracle_portal_query` — Oracle RAD hospital portal queries
- `call_linc_agent` — A2A agent delegation (internal)
- `icd_cpt_lookup` — ICD-10 / CPT code lookup

---

## Infrastructure Topology

```
Hospitals (Oracle RAD portals)
        │
        ▼
Cloudflare Tunnel (work.elfadil.com)
        │
        ▼
Open-WebUI Container (port 8080)
        │
        ▼
BrainSAIT API Gateway
        ├── ClaimLinc
        ├── AuthLinc
        ├── BridgeLinc
        └── ComplianceLinc
        │
        ▼
NPHIES Platform
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build all
npm run build

# Deploy workers
npm run deploy

# Database migration
npm run db:migrate
```

### Environment Variables

Copy `.env.example` and populate:

```bash
cp .env.example .env.local
```

Required secrets (set via `wrangler secret put`):
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER`
- `WHATSAPP_BUSINESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID`
- `JWT_SECRET` / `ENCRYPTION_KEY`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend API | Hono, Cloudflare Workers |
| Voice | Twilio, OpenAI Whisper, WebSocket streaming |
| AI | Anthropic Claude, GPT-4o, DeepSeek R1/V3 |
| Database | Cloudflare D1 (SQLite), R2 (storage), KV (cache) |
| Infrastructure | Cloudflare Tunnels, Cloudflare Workers, Docker |
| Protocols | FHIR R4, NPHIES, A2A (agent-to-agent), MCP |

---

## Security Policy

Sensitive credentials are **never** stored in documentation or source code.

Secrets are stored in:
- Cloudflare Secrets (`wrangler secret put`)
- GitHub Encrypted Secrets
- Docker environment variables (`.env` files, never committed)

---

## License

Proprietary — BrainSAIT LTD (UK) © 2026. All rights reserved.
