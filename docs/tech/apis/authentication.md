# API Authentication

## Overview

This document describes authentication methods for BrainSAIT APIs.

---

## Authentication Methods

### API Key

```http
GET /v1/claims
X-API-Key: your-api-key
```

### OAuth 2.0

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=your-client-id
&client_secret=your-secret
```

Response:
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Usage:
```http
GET /v1/claims
Authorization: Bearer eyJ...
```

---

## Security Best Practices

1. **Never expose secrets** in client-side code
2. **Rotate keys** regularly
3. **Use HTTPS** always
4. **Limit scopes** to minimum needed
5. **Monitor usage** for anomalies

---

## Key Management

- Generate keys in dashboard
- Revoke compromised keys immediately
- Use different keys per environment

---

## Related Documents

- [API Overview](overview.md)
- [Vault & Secrets](../devops/vault_secrets.md)
- [Security](../infrastructure/security.md)

---

*Last updated: January 2025*
