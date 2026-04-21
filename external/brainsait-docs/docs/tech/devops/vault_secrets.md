# Vault & Secrets Management

## Overview

This document describes BrainSAIT's secrets management practices using HashiCorp Vault and other tools for secure credential storage and distribution.

---

## Architecture

### Vault Deployment
- High availability cluster
- Auto-unseal (cloud KMS)
- Audit logging
- Disaster recovery

### Secret Types
- Database credentials
- API keys
- TLS certificates
- Encryption keys
- OAuth tokens

---

## Secret Lifecycle

### Creation
1. Generate secure secret
2. Store in Vault
3. Set access policies
4. Configure rotation

### Distribution
- Dynamic secrets
- Short-lived tokens
- Just-in-time access

### Rotation
- Automatic rotation
- Zero-downtime
- Audit trail

---

## Configuration

### Vault Policy

```hcl
path "secret/data/production/*" {
  capabilities = ["read"]
}

path "database/creds/readonly" {
  capabilities = ["read"]
}
```

### Kubernetes Integration

```yaml
vault.hashicorp.com/agent-inject: "true"
vault.hashicorp.com/role: "myapp"
vault.hashicorp.com/agent-inject-secret-db: "database/creds/myapp"
```

---

## Related Documents

- [Security](../infrastructure/security.md)
- [SecUnit](../agents/secunit.md)
- [CI/CD](cicd.md)

---

*Last updated: January 2025*
