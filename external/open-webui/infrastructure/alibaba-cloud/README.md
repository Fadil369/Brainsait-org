# Alibaba Cloud Deployment Guide - Basma Healthcare AI Platform
# Configured for Dr. Elfadil Healthcare Services - Riyadh, Saudi Arabia

## Overview
Complete infrastructure-as-code deployment for Basma bilingual AI voice secretary on Alibaba Cloud, optimized for **Riyadh, Saudi Arabia** region with HIPAA compliance and elfadil.com domain.

## Architecture Components - Riyadh Region

### Primary Region: **Saudi Arabia (Riyadh)**
- **Region Code**: `me-central-1` (Riyadh)
- **Availability Zones**: `me-central-1a`, `me-central-1b`, `me-central-1c`
- **Data Residency**: All data stored within Saudi Arabia
- **Latency**: < 5ms for local users in Riyadh/Jeddah

### 1. **ECS (Elastic Compute Service)** - Riyadh
- Application servers with auto-scaling
- Deployed across 3 availability zones in Riyadh
- Load balanced for high availability

### 2. **Function Compute (FC)** - Riyadh
- Serverless webhook handlers
- Real-time voice processing
- Auto-scaling based on demand

### 3. **OSS (Object Storage Service)** - Riyadh
- Call recordings with lifecycle policies
- Transcript storage with KMS encryption
- Static asset hosting for elfadil.com

### 4. **RDS PostgreSQL** - Riyadh
- Managed database with automatic backups
- Multi-AZ deployment in Riyadh
- Encrypted storage compliant with Saudi regulations

### 5. **CDN** - Global with Riyadh Origin
- Origin servers in Riyadh
- Edge nodes optimized for Saudi Arabia and Gulf region
- Custom domain: elfadil.com, www.elfadil.com, api.elfadil.com

### 6. **API Gateway** - Riyadh
- RESTful API routing at api.elfadil.com
- Rate limiting and throttling
- Request/response transformation

### 7. **TableStore (NoSQL)** - Riyadh
- High-throughput session storage
- Real-time analytics data
- Auto-scaling capacity

### 8. **SLS (Simple Log Service)** - Riyadh
- Centralized logging within Saudi Arabia
- Real-time log analysis
- 3-year audit retention for HIPAA & Saudi MoH compliance

## Quick Start

### Step 1: Install Dependencies
```bash
# Install Alibaba Cloud CLI
brew install aliyun-cli

# Configure credentials (Riyadh region)
aliyun configure
# When prompted:
# - Access Key ID: [your access key]
# - Access Key Secret: [your secret key]
# - Default Region: me-central-1
# - Language: en

# Install Terraform
brew install terraform

# Install project dependencies
npm install
```

### Step 2: Configure Environment for Elfadil.com
```bash
# Copy template
cp infrastructure/alibaba-cloud/.env.template .env.alibaba

# Edit credentials
vim .env.alibaba

# Set these values:
# ALIBABA_CLOUD_REGION=me-central-1  # Riyadh
# CDN_DOMAIN=elfadil.com
# API_GATEWAY_DOMAIN=api.elfadil.com
# OSS_BUCKET_STATIC=elfadil-static-assets
```

### Step 3: Initialize Terraform for Riyadh
```bash
cd infrastructure/alibaba-cloud/terraform

# Initialize
terraform init

# Validate configuration
terraform validate

# Plan deployment (Riyadh region)
terraform plan -var-file=riyadh-production.tfvars

# Review the plan carefully
```

### Step 4: Deploy Infrastructure in Riyadh
```bash
# Apply (creates all cloud resources in Riyadh)
terraform apply -var-file=riyadh-production.tfvars

# This will create:
# - VPC in me-central-1 (Riyadh)
# - ECS instances in Riyadh AZs
# - RDS PostgreSQL in Riyadh
# - OSS buckets in Riyadh
# - Function Compute in Riyadh
# - CDN with Riyadh origin

# Save outputs
terraform output > ../outputs.json
```

### Step 5: Configure DNS for elfadil.com
```bash
# Add CNAME records to your DNS provider
# (GoDaddy, Namecheap, or Alibaba Cloud DNS)

# For elfadil.com:
elfadil.com.           CNAME   elfadil-cdn.aliyuncs.com.
www.elfadil.com.       CNAME   elfadil-cdn.aliyuncs.com.
api.elfadil.com.       CNAME   elfadil-api.me-central-1.aliyuncs.com.

# Or use Alibaba Cloud DNS
aliyun alidns AddDomainRecord \
  --DomainName elfadil.com \
  --RR www \
  --Type CNAME \
  --Value elfadil-cdn.aliyuncs.com
```

### Step 6: Deploy Applications
```bash
# Build all services
cd ../../..
npm run build

# Deploy to Alibaba Cloud (Riyadh)
npm run deploy:alibaba

# Verify deployment
curl https://api.elfadil.com/health
```

## Regional Configuration - Saudi Arabia Specific

### Riyadh Region (Primary) - me-central-1
```yaml
Region: me-central-1
Location: Riyadh, Saudi Arabia
Availability Zones:
  - me-central-1a (Riyadh Data Center 1)
  - me-central-1b (Riyadh Data Center 2)
  - me-central-1c (Riyadh Data Center 3)

Data Residency: ✅ All data stays in Saudi Arabia
Compliance: ✅ Saudi MoH, HIPAA, SAMA
Latency to Major Cities:
  - Riyadh: < 1ms
  - Jeddah: 3-5ms
  - Dammam: 5-8ms
  - Dubai: 15-20ms
```

### CDN Configuration for Saudi Arabia
```yaml
CDN Settings:
  Primary Domain: elfadil.com
  Additional Domains:
    - www.elfadil.com
    - api.elfadil.com
    - cdn.elfadil.com
  
  Origin Server: Riyadh (me-central-1)
  
  Edge Nodes (Priority Order):
    1. Riyadh, Saudi Arabia
    2. Jeddah, Saudi Arabia
    3. Dubai, UAE
    4. Bahrain
    5. Kuwait
  
  Cache Rules:
    - Static assets: 24 hours TTL
    - API responses: No cache
    - HTML pages: 5 minutes TTL
  
  SSL/TLS:
    - Certificate: Let's Encrypt or Custom
    - Protocol: TLS 1.3 only
    - HSTS: Enabled
```

## Cost Optimization for Riyadh Deployment

### Monthly Cost Estimate (Saudi Riyal - SAR)
| Service | Configuration | Monthly Cost (SAR) |
|---------|--------------|-------------------|
| ECS (2x c7.large) Riyadh | 2 vCPU, 4GB each | 450-750 SAR |
| RDS PostgreSQL Riyadh | 1 core, 2GB | 300-450 SAR |
| OSS Storage Riyadh | 100GB + requests | 55-110 SAR |
| Function Compute | 1M invocations | 75-185 SAR |
| CDN (Saudi focused) | 500GB transfer | 280-560 SAR |
| API Gateway | 10M requests | 110-185 SAR |
| TableStore | Reserved capacity | 150-300 SAR |
| SLS Logging | 50GB/day | 95-185 SAR |
| KMS | Key management | 20-40 SAR |
| **Total** | | **~1,535-2,765 SAR/month** |
|  | | **($410-740 USD/month)** |

### Cost Saving Tips for Saudi Deployment
1. **Reserved Instances**: 30% savings on ECS with 1-year commitment
2. **Local Traffic**: Keep traffic within Riyadh to avoid cross-region charges
3. **Smart Caching**: Aggressive CDN caching for Saudi users
4. **Lifecycle Policies**: Auto-archive old recordings after 90 days
5. **Auto-Scaling**: Scale down during low-usage hours (midnight-5am)

## Security Configuration - Saudi Arabia Compliance

### 1. Data Residency Compliance
```yaml
Saudi Arabia Data Residency:
  ✅ All PII data stored in Riyadh (me-central-1)
  ✅ No cross-border data transfer
  ✅ Backups within Saudi Arabia only
  ✅ Compliant with SAMA regulations
  ✅ Compliant with Saudi MoH guidelines

Network Isolation:
  VPC: Private network in Riyadh
  Subnets: Isolated per service tier
  Security Groups: Strict firewall rules
  NAT Gateway: For secure outbound access only
```

### 2. Encryption Standards
```bash
# At Rest (Saudi MoH & HIPAA compliant)
OSS Encryption: AES-256 with KMS (Riyadh keys)
RDS Encryption: TDE with regional KMS
TableStore: Automatic encryption
Backups: Encrypted snapshots

# In Transit
HTTPS/TLS 1.3: All connections
Database SSL: Enforced
Internal VPC: Encrypted traffic
```

### 3. Access Control (RAM) - Saudi Team
```yaml
Administrator Role (Saudi IT Team):
  - Full access to Riyadh resources
  - MFA required
  - IP whitelist: Saudi Arabia only

Application Role (Basma App):
  - Read/Write OSS (Riyadh buckets only)
  - Execute Function Compute
  - Read/Write RDS
  - Write to SLS logs

Developer Role (Development Team):
  - Read-only production access
  - Full staging environment access
  - Audit logs for all actions
```

## DNS Configuration for elfadil.com

### Option 1: Using Alibaba Cloud DNS
```bash
# Add domain to Alibaba Cloud DNS
aliyun alidns AddDomain --DomainName elfadil.com

# Add CDN CNAME
aliyun alidns AddDomainRecord \
  --DomainName elfadil.com \
  --RR @ \
  --Type CNAME \
  --Value elfadil-prod.me-central-1.cdn.aliyuncs.com

aliyun alidns AddDomainRecord \
  --DomainName elfadil.com \
  --RR www \
  --Type CNAME \
  --Value elfadil-prod.me-central-1.cdn.aliyuncs.com

# Add API subdomain
aliyun alidns AddDomainRecord \
  --DomainName elfadil.com \
  --RR api \
  --Type CNAME \
  --Value elfadil-api-gw.me-central-1.alicloudapi.com
```

### Option 2: Using External DNS (GoDaddy/Namecheap)
```dns
; DNS Records for elfadil.com

; Main website
elfadil.com.           300  CNAME   elfadil-prod.me-central-1.cdn.aliyuncs.com.
www.elfadil.com.       300  CNAME   elfadil-prod.me-central-1.cdn.aliyuncs.com.

; API endpoint
api.elfadil.com.       300  CNAME   elfadil-api-gw.me-central-1.alicloudapi.com.

; Booking subdomain
booking.elfadil.com.   300  CNAME   elfadil-prod.me-central-1.cdn.aliyuncs.com.

; Email (if using Alibaba Mail)
@                      300  MX 10   mx1.elfadil.com.
@                      300  MX 20   mx2.elfadil.com.

; SPF record
@                      300  TXT     "v=spf1 include:spf.alimail.com ~all"
```

## SSL Certificate Setup for elfadil.com

### Option 1: Free SSL (Let's Encrypt via Alibaba Cloud)
```bash
# Request free SSL certificate
aliyun cas CreateUserCertificate \
  --CertName elfadil-com-ssl \
  --Cert "$(cat elfadil.com.crt)" \
  --Key "$(cat elfadil.com.key)"

# Or auto-provision through CDN console
# (Automatically renews every 90 days)
```

### Option 2: Paid SSL Certificate
```bash
# Purchase from Alibaba Cloud SSL Certificates
# - Single domain: elfadil.com (~$200/year)
# - Wildcard: *.elfadil.com (~$500/year)
# - Multi-domain: elfadil.com + subdomains (~$300/year)

# Upload to Alibaba Cloud
aliyun cdn SetDomainServerCertificate \
  --DomainName elfadil.com \
  --ServerCertificateStatus on \
  --CertName elfadil-com-2026 \
  --ServerCertificate "$(cat certificate.crt)" \
  --PrivateKey "$(cat private.key)"
```

## Monitoring & Alerts - Riyadh Deployment

### CloudMonitor Dashboard (Riyadh)
```bash
# View ECS metrics in Riyadh
aliyun cms DescribeMetricList \
  --Namespace acs_ecs_dashboard \
  --MetricName CPUUtilization \
  --Dimensions "[{\"instanceId\":\"i-riyadh-xxx\"}]"

# View RDS metrics in Riyadh
aliyun cms DescribeMetricList \
  --Namespace acs_rds_dashboard \
  --MetricName ConnectionUsage \
  --Dimensions "[{\"instanceId\":\"rm-riyadh-xxx\"}]"
```

### Alert Configuration (Saudi Phone/Email)
```yaml
SMS Alerts (Saudi Mobile):
  Phone: +966 5X XXX XXXX
  Carrier: STC/Mobily/Zain
  
Email Alerts:
  Primary: ops@elfadil.com
  Secondary: admin@elfadil.com
  
DingTalk Integration (Popular in Saudi):
  Webhook: https://oapi.dingtalk.com/robot/send?access_token=xxx
  
Critical Alerts:
  - High CPU (> 80% for 5 min)
  - Database down
  - Function errors (> 1%)
  - SSL certificate expiring (< 30 days)
```

## Deployment Commands

### Deploy to Riyadh Production
```bash
# Set environment
export ALIBABA_CLOUD_REGION=me-central-1
export DOMAIN=elfadil.com

# Deploy infrastructure
cd infrastructure/alibaba-cloud/terraform
terraform workspace select riyadh-production || terraform workspace new riyadh-production
terraform apply -var-file=riyadh-production.tfvars

# Deploy applications
cd ../../..
npm run build
npm run deploy:alibaba -- --region=me-central-1 --domain=elfadil.com

# Verify
curl https://api.elfadil.com/health
curl https://elfadil.com

# Check logs
aliyun sls GetLogs \
  --ProjectName basma-logs \
  --LogstoreName application-logs \
  --Query "* | SELECT * WHERE __topic__ = 'deployment' ORDER BY __time__ DESC LIMIT 100"
```

## Next Steps - Elfadil.com Deployment

1. ✅ **Obtain Alibaba Cloud Account** (Riyadh region access)
2. ✅ **Configure credentials** (.env.alibaba with me-central-1)
3. ✅ **Review Terraform config** (riyadh-production.tfvars)
4. ✅ **Purchase/Configure elfadil.com domain**
5. ✅ **Deploy infrastructure** (terraform apply)
6. ✅ **Setup DNS records** (CNAME to Alibaba Cloud)
7. ✅ **Configure SSL certificate** (for elfadil.com)
8. ✅ **Deploy applications** (npm run deploy:alibaba)
9. ✅ **Test from Riyadh** (latency should be < 5ms)
10. ✅ **Enable production traffic**

---

**Region**: Riyadh, Saudi Arabia (me-central-1)  
**Domain**: elfadil.com  
**Version**: 1.0.0  
**Last Updated**: March 2, 2026  
**Contact**: admin@elfadil.com
