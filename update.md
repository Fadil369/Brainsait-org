# Update — 2026-04-28 19:46 GMT+1

## Deployed Versions

| Worker | Version | Status |
|--------|---------|--------|
| voice-agent | b106d683 | ✅ Deployed + workers.dev re-enabled |
| brainsait-healthcare-gateway | 29a4fc80 | ✅ Deployed |

## What Changed

### Voice-Agent (DeepSeek Prompt)
- Added **LANGUAGE RULE**: Match user language — Arabic → Saudi dialect, English → English. Never mix.
- BASMA_SYSTEM prompt enhanced with explicit language awareness

### BSMA (brainsait-healthcare-gateway)
- **Voice flow v3.0** — complete rewrite:
  - `continuous: false` + `interimResults: false` for stable recognition
  - Recognition never stopped mid-stream during AI processing
  - Clean restart via `onend` only (no race conditions)
- **Proactive tool detection** (`detectAndRunTool`):
  - Emergency detection (chest pain, bleeding → redirect to ER)
  - Appointment booking (fetches CRM slots)
  - Insurance eligibility (asks for national ID)
  - Claim status (fetches NPHIES data)
  - Patient lookup (via Oracle eligibility endpoint)
- **Direct greeting** — greets user directly in detected language
- **Language-aware toggle** — EN/AR button re-greets in new language mid-call
- All status labels now in Saudi dialect

## Next
- Test on bsma.elfadil.com in Chrome with mic
