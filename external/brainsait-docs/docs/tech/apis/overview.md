# API Overview

## Overview

BrainSAIT provides RESTful APIs for integrating with our platform. All APIs use JSON and follow OpenAPI 3.0 specifications.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.brainsait.com/v1` |
| Sandbox | `https://sandbox.brainsait.com/v1` |

---

## Authentication

All APIs require authentication via:
- API Key (header)
- OAuth 2.0 Bearer token

See [Authentication](authentication.md) for details.

---

## Core APIs

### Claims API
- Submit claims
- Check status
- Get results

### Eligibility API
- Check coverage
- Verify benefits

### Documents API
- Upload documents
- Process extraction
- Get results

### Analytics API
- Query metrics
- Generate reports

---

## Rate Limits

| Tier | Requests/min |
|------|--------------|
| Standard | 100 |
| Professional | 500 |
| Enterprise | Custom |

---

## SDKs

- Python
- JavaScript/TypeScript
- Go

---

## Related Documents

- [Authentication](authentication.md)
- [API Template](../../brand/templates/api_template.md)
- [NPHIES API Reference](../../healthcare/nphies/api_reference.md)

---

*Last updated: January 2025*
