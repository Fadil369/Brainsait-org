# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Basma is a bilingual (Arabic/English) AI voice secretary platform for BrainSAIT, a healthcare technology company. The system handles inbound/outbound calls via Twilio, processes speech with OpenAI Whisper, generates responses with Claude AI, and manages appointments, visitors, and leads.

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Start all apps in development mode
npm run dev

# Build all apps
npm run build

# Deploy all workers to Cloudflare
npm run deploy

# Database operations
npm run db:migrate    # Apply schema to D1
npm run db:seed       # Seed initial data

# Run individual apps
cd apps/web && npm run dev           # Next.js frontend (localhost:3000)
cd apps/workers/api && npm run dev   # API worker (wrangler dev)
cd apps/workers/voice && npm run dev # Voice worker (wrangler dev)

# Linting
cd apps/web && npm run lint
```

## Architecture

### Monorepo Structure (Turbo + npm workspaces)

```
apps/
├── web/                    # Next.js 16 frontend with React 19
│   └── src/
│       ├── app/            # App Router pages
│       ├── components/     # React components (CallControl, VoicePulse)
│       ├── hooks/          # Custom hooks (useSaudiLanguage)
│       ├── services/       # API client, audio utilities
│       └── constants.tsx   # Basma AI prompts and tool definitions
└── workers/
    ├── api/                # Hono REST API on Cloudflare Workers
    │   └── src/index.ts    # CRUD for appointments, visitors, logs, messages
    └── voice/              # Twilio voice handler on Cloudflare Workers
        └── src/index.ts    # WebSocket streaming, STT/TTS, AI processing

packages/
└── shared/                 # Shared utilities
    ├── types.ts            # Env bindings, TypeScript interfaces
    ├── ai-service.ts       # AIService class wrapping Anthropic SDK
    ├── speech.ts           # STT (Whisper) and TTS functions
    └── logger.ts           # Structured logging, audit trail

infrastructure/
└── schema.sql              # D1 database schema (SQLite)
```

### Key Data Flow

1. **Inbound call** → Twilio webhook → `/twilio/voice` returns TwiML → Opens WebSocket
2. **Audio stream** → Voice worker receives mulaw frames → Transcribes with Whisper
3. **User text** → `AIService.processCall()` generates Claude response → TTS synthesis
4. **Audio response** → Streamed back to caller via WebSocket
5. **Call end** → Visitor data extracted, call log saved to D1, transcript to R2

### Cloudflare Bindings

| Binding | Type | Purpose |
|---------|------|---------|
| `DB` | D1 | SQLite database for all entities |
| `R2_STORAGE` | R2 | Transcripts, recordings storage |
| `CACHE` | KV | General caching |
| `SESSIONS` | KV | Session management |
| `RATE_LIMIT` | KV | Rate limiting |

## Environment Variables

Workers require these secrets (set via `wrangler secret put`):

- `ANTHROPIC_API_KEY` - Claude AI
- `OPENAI_API_KEY` - Whisper STT and TTS
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `WHATSAPP_BUSINESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
- `JWT_SECRET`, `ENCRYPTION_KEY`

## Key Conventions

- **Bilingual**: All user-facing content supports Arabic/English. Use `useSaudiLanguage` hook for dialect-aware UI.
- **HIPAA-aware**: Never log or process Protected Health Information (PHI). Audit logs track all data access.
- **Shared package**: Import from `@basma/shared/types`, `@basma/shared/ai-service`, etc.
- **Database timestamps**: Use Unix timestamps (milliseconds) for all `created_at`, `updated_at` fields.
- **API pattern**: All API endpoints follow REST conventions with `x-request-id` header for tracing.

## Database Tables

Core entities: `users`, `visitors`, `appointments`, `call_logs`, `messages`, `conversations`, `integrations`, `audit_logs`, `visitor_segments`, `analytics_events`

Visitor statuses: `new` → `contacted` → `qualified` → `converted` | `lost`
Appointment types: `demo`, `consultation`, `technical`, `partnership`, `support`, `other`
