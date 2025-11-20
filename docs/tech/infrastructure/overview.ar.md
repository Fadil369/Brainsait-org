---
title: Infrastructure Overview
domain: tech
chapter: infrastructure
version: 1.0.0
---

!!! info "Translation in Progress / الترجمة قيد الإجراء"
    This content is currently being translated. / هذا المحتوى قيد الترجمة حالياً.

<div dir="rtl">


# BrainSAIT Infrastructure Overview

## Architecture Philosophy

BrainSAIT's infrastructure is built on principles of:
- **Resilience**: Multi-layer redundancy
- **Security**: Zero-trust architecture
- **Scalability**: Elastic resource allocation
- **Cost-efficiency**: Hybrid cloud approach
- **Compliance**: PDPL and HIPAA alignment

---

## Infrastructure Stack

```
┌─────────────────────────────────────────────────────────┐
│                    EDGE LAYER                            │
│  Cloudflare: CDN, DDoS Protection, Zero Trust           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                       │
│  Coolify: Container Orchestration, Auto-scaling          │
│  Workers: Serverless Functions                           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                            │
│  PostgreSQL: Relational Data                             │
│  D1: Edge Database                                       │
│  R2: Object Storage                                      │
│  ChromaDB: Vector Database                               │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  COMPUTE LAYER                           │
│  VPS: Primary workloads                                  │
│  Raspberry Pi Cluster: Edge computing                    │
│  Starlink: Hybrid connectivity                           │
└─────────────────────────────────────────────────────────┘
```

---

## Cloudflare Services

### DNS & CDN
- **Global network**: 300+ data centers
- **Smart routing**: Argo Smart Routing
- **Caching**: Automatic edge caching
- **SSL/TLS**: Universal SSL with auto-renewal

### Workers
**Serverless Edge Computing**

```javascript
// Example: NPHIES API proxy with caching
export default {
  async fetch(request, env) {
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    
    // Check cache first
    let response = await cache.match(cacheKey);
    
    if (!response) {
      // Forward to NPHIES
      response = await fetch('https://nphies.sa/api', {
        method: request.method,
        headers: {
          'Authorization': `Bearer ${env.NPHIES_TOKEN}`,
          'Content-Type': 'application/fhir+json'
        },
        body: request.body
      });
      
      // Cache successful responses
      if (response.ok) {
        response = new Response(response.body, response);
        response.headers.set('Cache-Control', 'max-age=300');
        await cache.put(cacheKey, response.clone());
      }
    }
    
    return response;
  }
};
```

### D1 Database
**Edge SQL Database**

```sql
-- Schema for claim tracking
CREATE TABLE claims (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  payer_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount REAL NOT NULL,
  submitted_at INTEGER NOT NULL,
  adjudicated_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_claims_provider ON claims(provider_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_submitted ON claims(submitted_at);
```

### R2 Storage
**Object Storage for Medical Documents**

```python
# Upload medical document to R2
async def upload_medical_document(
    document: bytes,
    document_id: str,
    metadata: dict
) -> str:
    """
    Upload document with encryption and compliance
    
    BRAINSAIT: Audit logging enabled
    MEDICAL: PHI encryption required
    """
    # Encrypt document
    encrypted_doc = encrypt_document(
        document,
        key=env.ENCRYPTION_KEY
    )
    
    # Upload to R2
    r2_client.put_object(
        Bucket='medical-documents',
        Key=f'documents/{document_id}',
        Body=encrypted_doc,
        Metadata={
            'patient-id': metadata['patient_id'],
            'document-type': metadata['type'],
            'uploaded-by': metadata['user_id'],
            'encrypted': 'true'
        },
        ServerSideEncryption='AES256'
    )
    
    # Audit log
    audit_logger.log_document_upload(
        document_id=document_id,
        user=current_user,
        metadata=metadata
    )
    
    return f"r2://medical-documents/documents/{document_id}"
```

### Zero Trust
**Secure Access Architecture**

- **Access**: Application-level authentication
- **Gateway**: DNS filtering and inspection
- **Tunnel**: Secure connection to origin servers
- **WARP**: Client-to-edge encryption

---

## Coolify Deployment

### Container Orchestration

```yaml
# docker-compose.yml for ClaimLinc service
version: '3.8'

services:
  claimlinc-api:
    image: brainsait/claimlinc:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - NPHIES_ENDPOINT=${NPHIES_ENDPOINT}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - brainsait-network
    labels:
      - "coolify.managed=true"
      - "coolify.domain=claimlinc.brainsait.com"
      - "coolify.https=true"

  claimlinc-worker:
    image: brainsait/claimlinc-worker:latest
    environment:
      - REDIS_URL=${REDIS_URL}
      - DATABASE_URL=${DATABASE_URL}
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: '1'
          memory: 2G
    networks:
      - brainsait-network

networks:
  brainsait-network:
    driver: overlay
```

### Auto-Scaling Configuration

```yaml
# coolify-autoscale.yml
autoscaling:
  enabled: true
  min_replicas: 2
  max_replicas: 10
  metrics:
    - type: cpu
      target: 70
    - type: memory
      target: 80
    - type: requests_per_second
      target: 1000
  scale_up:
    threshold: 80
    cooldown: 60s
  scale_down:
    threshold: 30
    cooldown: 300s
```

---

## Database Architecture

### PostgreSQL (Primary Database)

**Schema Design**:
```sql
-- Healthcare domain tables
CREATE SCHEMA healthcare;

-- Patients
CREATE TABLE healthcare.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims
CREATE TABLE healthcare.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES healthcare.patients(id),
  provider_id UUID NOT NULL,
  payer_id UUID NOT NULL,
  encounter_id UUID NOT NULL,
  status TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  approved_amount DECIMAL(10,2),
  fhir_bundle JSONB NOT NULL,
  submission_id TEXT,
  submitted_at TIMESTAMPTZ,
  adjudicated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE healthcare.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  user_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_claims_patient ON healthcare.claims(patient_id);
CREATE INDEX idx_claims_status ON healthcare.claims(status);
CREATE INDEX idx_claims_submitted ON healthcare.claims(submitted_at);
CREATE INDEX idx_audit_logs_entity ON healthcare.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON healthcare.audit_logs(created_at);
```

### ChromaDB (Vector Database)

**For RAG and Semantic Search**:
```python
# Initialize ChromaDB for documentation
import chromadb
from chromadb.config import Settings

client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_db"
))

# Create collection for medical policies
policies_collection = client.create_collection(
    name="medical_policies",
    metadata={
        "description": "Payer policy documents and rules",
        "domain": "healthcare"
    }
)

# Add policy documents
policies_collection.add(
    documents=[policy_text],
    metadatas=[{
        "payer_id": "bupa",
        "policy_type": "coverage_rules",
        "effective_date": "2025-01-01",
        "language": "ar"
    }],
    ids=[policy_id]
)

# Query for relevant policies
results = policies_collection.query(
    query_texts=["ما هي شروط تغطية العلاج الطبيعي؟"],
    n_results=5,
    where={"payer_id": "bupa"}
)
```

---

## Raspberry Pi Cluster

### Edge Computing Setup

**Hardware**:
- 5x Raspberry Pi 5 (8GB RAM)
- 1TB NVMe storage per node
- 10Gbps network switch
- UPS backup power

**Use Cases**:
- Local AI inference
- Development environment
- Testing and staging
- Disaster recovery backup
- IoT gateway

**K3s Cluster Configuration**:
```yaml
# k3s-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: brainsait-config
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: claimlinc-edge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: claimlinc-edge
  template:
    metadata:
      labels:
        app: claimlinc-edge
    spec:
      containers:
      - name: claimlinc
        image: brainsait/claimlinc:arm64
        resources:
          limits:
            memory: "2Gi"
            cpu: "1000m"
          requests:
            memory: "1Gi"
            cpu: "500m"
```

---

## Starlink Hybrid Connectivity

### Network Architecture

```
Primary: Fiber (1Gbps) ──┐
                          ├──→ Load Balancer ──→ Services
Backup: Starlink (200Mbps)┘
```

**Failover Configuration**:
- Automatic failover in <30 seconds
- Health check every 10 seconds
- Traffic prioritization
- Bandwidth monitoring

---

## Security Architecture

### Encryption

**At Rest**:
- AES-256-GCM for databases
- Server-side encryption for object storage
- Encrypted backups

**In Transit**:
- TLS 1.3 for all connections
- mTLS for service-to-service
- VPN for administrative access

### Access Control

```python
# Role-based access control
class Permission(Enum):
    READ_CLAIMS = "claims:read"
    WRITE_CLAIMS = "claims:write"
    ADMIN_USERS = "users:admin"
    VIEW_PHI = "phi:view"

class Role(Enum):
    VIEWER = [Permission.READ_CLAIMS]
    BILLER = [Permission.READ_CLAIMS, Permission.WRITE_CLAIMS]
    ADMIN = [Permission.READ_CLAIMS, Permission.WRITE_CLAIMS, 
             Permission.ADMIN_USERS, Permission.VIEW_PHI]

@require_permission(Permission.VIEW_PHI)
async def get_patient_data(patient_id: str):
    """
    Retrieve patient data with PHI access control
    
    BRAINSAIT: Audit logged
    MEDICAL: PHI access restricted
    """
    # Audit log
    audit_logger.log_phi_access(
        patient_id=patient_id,
        user=current_user,
        purpose="clinical_review"
    )
    
    return await patient_repository.get(patient_id)
```

---

## Monitoring & Observability

### Metrics Collection

```yaml
# Prometheus configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'claimlinc'
    static_configs:
      - targets: ['claimlinc:8000']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### Logging

```python
# Structured logging
import structlog

logger = structlog.get_logger()

logger.info(
    "claim_submitted",
    claim_id=claim.id,
    provider_id=claim.provider_id,
    payer_id=claim.payer_id,
    amount=claim.total_amount,
    user_id=current_user.id
)
```

---

## Disaster Recovery

### Backup Strategy

- **Database**: Hourly incremental, daily full
- **Object Storage**: Continuous replication
- **Configuration**: Git-based versioning
- **Secrets**: Vault with HA setup

### Recovery Objectives

- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 15 minutes

---

## Related Documentation

- [Cloudflare Setup](./cloudflare.md)
- [Coolify Deployment](./coolify.md)
- [Security Guidelines](./security.md)
- [DevOps Pipelines](../devops/cicd.md)


</div>