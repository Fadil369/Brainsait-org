# BrainSAIT Platform - Cloudflare Deployment Guide

## 📋 Prerequisites

1. **Cloudflare Account Setup**
   - Create account at [cloudflare.com](https://cloudflare.com)
   - Obtain Account ID from dashboard
   - Generate API Token with Workers and Pages permissions

2. **Install Required Tools**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **Environment Variables**
   Create `.env.production` with:
   ```env
   CLOUDFLARE_API_TOKEN=your_token
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   CLAUDE_API_KEY=your_claude_key
   ```

## 🚀 Quick Deployment

### One-Command Deployment
```bash
# Deploy everything to production
./deploy.sh production all

# Deploy specific service to staging
./deploy.sh staging frontend
./deploy.sh staging backend
./deploy.sh staging ai
```

## 📦 Service-by-Service Deployment

### 1. Frontend (Cloudflare Pages)

```bash
# Build and deploy frontend
cd packages/brainsait-frontend
npm run build
npm run export
wrangler pages deploy out --project-name=brainsait-frontend
```

**Access URLs:**
- Production: `https://brainsait.com`
- Staging: `https://staging.brainsait.pages.dev`

### 2. Backend API (Cloudflare Workers)

```bash
# Generate Prisma client and deploy
cd packages/brainsait-backend
npx prisma generate
npm run build
wrangler deploy --env production
```

**Access URLs:**
- Production: `https://api.brainsait.com`
- Staging: `https://staging-api.brainsait.com`

### 3. AI Service (Cloudflare Workers)

```bash
# Deploy AI service
cd packages/brainsait-ai
npm run build
wrangler deploy --env production
```

**Access URLs:**
- Production: `https://ai.brainsait.com`
- Staging: `https://staging-ai.brainsait.com`

### 4. Document Service (Cloudflare Workers)

```bash
# Deploy docs service
cd packages/brainsait-docs
npm run build
wrangler deploy --env production
```

**Access URLs:**
- Production: `https://docs.brainsait.com`
- Staging: `https://staging-docs.brainsait.com`

## 🗄️ Database Setup

### Cloudflare D1 (Recommended)

1. **Create D1 Database**
   ```bash
   wrangler d1 create brainsait-db
   ```

2. **Run Migrations**
   ```bash
   cd packages/brainsait-backend
   wrangler d1 migrations apply brainsait-db
   ```

### External PostgreSQL

1. **Update Connection String**
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/brainsait?sslmode=require"
   ```

2. **Run Migrations**
   ```bash
   cd packages/brainsait-backend
   npx prisma migrate deploy
   ```

## 🔐 Secrets Management

### Set Production Secrets
```bash
# Backend secrets
wrangler secret put DATABASE_URL --env production
wrangler secret put JWT_SECRET --env production
wrangler secret put OPENAI_API_KEY --env production
wrangler secret put CLAUDE_API_KEY --env production
wrangler secret put REDIS_URL --env production
wrangler secret put EMAIL_API_KEY --env production
wrangler secret put SAUDI_GOV_API_KEY --env production

# AI service secrets
cd packages/brainsait-ai
wrangler secret put OPENAI_API_KEY --env production
wrangler secret put CLAUDE_API_KEY --env production
wrangler secret put VECTOR_DB_URL --env production
wrangler secret put VECTOR_DB_API_KEY --env production
```

## 🌐 Custom Domain Setup

### Configure DNS
1. Add your domain to Cloudflare
2. Update DNS records:
   ```
   Type  Name    Content
   CNAME www     brainsait.pages.dev
   CNAME api     brainsait-backend.workers.dev
   CNAME ai      brainsait-ai.workers.dev
   CNAME docs    brainsait-docs.workers.dev
   ```

### SSL Configuration
- Cloudflare provides automatic SSL
- Enable "Full (strict)" SSL mode
- Force HTTPS redirects

## 📊 Monitoring & Analytics

### Cloudflare Analytics
- Workers Analytics: Monitor API performance
- Pages Analytics: Track frontend usage
- Web Analytics: User behavior tracking

### Custom Metrics
```javascript
// Track AI usage
env.AI_ANALYTICS.writeDataPoint({
  blobs: [userId, feature],
  doubles: [tokensUsed, responseTime],
  indexes: ["user", "feature"]
});
```

## 🔄 CI/CD with GitHub Actions

### Setup
1. Add secrets to GitHub repository:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - All service secrets

2. Push to trigger deployment:
   ```bash
   git push origin main  # Deploy to production
   git push origin develop  # Deploy to staging
   ```

### Manual Deployment Trigger
```bash
# Trigger workflow manually
gh workflow run deploy-cloudflare.yml -f environment=production
```

## 🧪 Testing Deployment

### Health Checks
```bash
# Check all services
curl https://brainsait.com/health
curl https://api.brainsait.com/health
curl https://ai.brainsait.com/health
curl https://docs.brainsait.com/health
```

### Smoke Tests
```bash
# Test API endpoints
curl -X POST https://api.brainsait.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Test AI service
curl -X POST https://ai.brainsait.com/api/ai/completion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Test prompt","feature":"test"}'
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Deployment Failures**
   ```bash
   # Check wrangler configuration
   wrangler whoami
   wrangler deployments list
   ```

3. **Database Connection Issues**
   ```bash
   # Test connection
   cd packages/brainsait-backend
   npx prisma db pull
   ```

### Rollback Procedure
```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

## 📈 Performance Optimization

### Cloudflare Settings
1. **Caching**
   - Enable Tiered Cache
   - Set appropriate cache headers
   - Use Cache Rules for static assets

2. **Performance**
   - Enable Brotli compression
   - Minify JavaScript/CSS
   - Enable Early Hints

3. **Security**
   - Enable WAF rules
   - Configure rate limiting
   - Set up DDoS protection

### Worker Optimization
```javascript
// Use KV for caching
const cached = await env.AI_CACHE.get(cacheKey);
if (cached) return new Response(cached);

// Store in cache
await env.AI_CACHE.put(cacheKey, response, {
  expirationTtl: 3600
});
```

## 🎯 Production Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Secrets configured
- [ ] DNS records updated

### Deployment
- [ ] Deploy backend first
- [ ] Run database migrations
- [ ] Deploy AI service
- [ ] Deploy document service
- [ ] Deploy frontend last

### Post-Deployment
- [ ] Health checks passing
- [ ] Smoke tests successful
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify AI service integration

## 📞 Support & Resources

### Cloudflare Resources
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Pages Documentation](https://developers.cloudflare.com/pages/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)

### Project Support
- GitHub Issues: [github.com/Fadil369/Incubator/issues](https://github.com/Fadil369/Incubator/issues)
- Documentation: See `/docs` directory
- AI Integration: See `AI_ADOPTION_INTEGRATION_PLAN.md`

## 🚨 Emergency Procedures

### Service Outage
1. Check Cloudflare status page
2. Review error logs: `wrangler tail`
3. Rollback if necessary
4. Contact support if critical

### Data Recovery
1. Database backups available in D1/PostgreSQL
2. R2 storage has versioning enabled
3. KV namespace exports available

---

**Last Updated**: 2024-01-29
**Platform Version**: 1.0.0
**AI Integration**: Enabled