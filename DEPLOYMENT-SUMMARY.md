# Inference UI Deployment Summary

Complete deployment guide for all Inference UI components - demo applications, documentation site, and backend infrastructure.

**Date**: October 15, 2025
**Status**: Ready for deployment
**Platform**: Cloudflare (Workers, Pages, D1, R2, KV, Analytics Engine)

---

## 📦 What's Ready to Deploy

### 1. ✅ Demo Applications
- **inference-ui-demo-app/** - Standalone Expo application
- **examples/** - Importable demo components

### 2. ✅ Documentation Site
- **docs/** - Nextra 4 with Next.js 15 App Router
- Modern, fast, SEO-optimized

### 3. ✅ Backend Infrastructure
- **packages/@inference-ui/cloudflare/** - Workers API, GraphQL, event ingestion

---

## 🚀 Deployment Steps

### Step 1: Demo App (Local Testing)

```bash
# Navigate to demo app
cd inference-ui-demo-app

# Install dependencies
npm install

# Start Expo dev server
npm start

# Test on platforms
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

**Expected Result**:
- Demo app loads with Inference UI Glass design
- AI status card shows "Initializing..." then "Ready"
- Smart login form with validation
- Component showcase displays properly
- Flow demo navigation works

### Step 2: Documentation Site (Cloudflare Pages)

#### Option A: Automatic Deployment (Recommended)

1. **Connect GitHub to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Workers & Pages → Create application → Pages → Connect to Git
   - Select the Inference UI repository
   - Authorize access

2. **Configure Build Settings**:
   ```
   Framework preset:    Next.js (Static HTML Export)
   Build command:       npm run build
   Build output dir:    .next
   Root directory:      docs
   Environment vars:    NODE_VERSION=18
   ```

3. **Deploy**:
   - Click "Save and Deploy"
   - Wait for build (~2-3 minutes)
   - Site will be available at `https://velvet-docs.pages.dev`

4. **Custom Domain** (Optional):
   - Go to your Pages project
   - Custom domains → Set up a custom domain
   - Enter: `docs.velvet.dev`
   - Add DNS records as instructed
   - Enable "Always Use HTTPS"

#### Option B: CLI Deployment

```bash
# Navigate to docs
cd docs

# Install dependencies
npm install

# Build the site
npm run build

# Install Wrangler (if not installed)
npm install -g wrangler

# Login to Cloudflare (use FinHub account)
wrangler login

# Deploy
wrangler pages deploy .next --project-name=velvet-docs
```

**Expected Result**:
- Documentation site builds successfully
- All pages accessible and navigable
- Search functionality works (after indexing)
- Code blocks have syntax highlighting
- Dark mode toggle works
- Mobile responsive layout

### Step 3: Backend Infrastructure (Cloudflare Workers)

```bash
# Navigate to Cloudflare package
cd packages/@inference-ui/cloudflare

# Install dependencies (if not done)
npm install

# Login to Cloudflare (use FinHub account)
wrangler login

# Verify account
wrangler whoami

# Create D1 database
wrangler d1 create velvet-db
# Copy the database_id from output

# Update wrangler.toml with database_id
# Edit wrangler.toml and replace YOUR_DATABASE_ID

# Initialize database schema
wrangler d1 execute velvet-db --file=./schema.sql

# Create KV namespace
wrangler kv:namespace create KV
# Copy the id from output

# Update wrangler.toml with KV id
# Edit wrangler.toml and replace YOUR_KV_ID

# Create R2 bucket
wrangler r2 bucket create velvet-assets

# Build the Worker
npm run build

# Deploy to development
wrangler deploy

# Test the deployment
curl https://velvet-api.<YOUR_SUBDOMAIN>.workers.dev/health

# Deploy to production
wrangler deploy --env=production
```

**Expected Result**:
- Worker deployed to edge (180+ locations)
- Health endpoint returns `{"status":"ok"}`
- GraphQL endpoint accepts queries
- D1 database accessible
- All bindings working (D1, R2, KV, Analytics Engine, Workers AI)

---

## 🔧 Configuration Required

### Environment Variables

#### For Demo App
Update `inference-ui-demo-app/App.tsx`:
```tsx
<EventProvider config={{
  batchSize: 50,
  batchInterval: 20000,
  endpoint: 'https://velvet-api-production.YOUR_SUBDOMAIN.workers.dev/events',
}}>
```

#### For Cloudflare Workers
Set secrets:
```bash
wrangler secret put JWT_SECRET --env=production
wrangler secret put STRIPE_SECRET_KEY --env=production
```

### Resource IDs

Update `packages/@inference-ui/cloudflare/wrangler.toml`:
```toml
[[d1_databases]]
database_id = "YOUR_ACTUAL_DATABASE_ID"

[[kv_namespaces]]
id = "YOUR_ACTUAL_KV_ID"
```

---

## 📋 Pre-Deployment Checklist

### Demo App
- [ ] Dependencies installed (`npm install`)
- [ ] App starts without errors (`npm start`)
- [ ] All components render correctly
- [ ] No console errors in dev tools
- [ ] Event tracking endpoint updated
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on web browser

### Documentation Site
- [ ] Dependencies installed (`npm install`)
- [ ] Build completes successfully (`npm run build`)
- [ ] All pages accessible locally
- [ ] No broken links
- [ ] Code blocks render correctly
- [ ] Search works (after build)
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] Lighthouse score 90+ (all metrics)

### Backend Infrastructure
- [ ] Cloudflare account access (FinHub)
- [ ] Wrangler CLI installed and authenticated
- [ ] D1 database created and schema applied
- [ ] KV namespace created
- [ ] R2 bucket created
- [ ] wrangler.toml updated with all IDs
- [ ] Secrets configured (if any)
- [ ] Worker builds without errors
- [ ] Local testing with `wrangler dev`
- [ ] Health endpoint responds
- [ ] GraphQL endpoint accepts queries
- [ ] Event ingestion works

---

## 🧪 Testing After Deployment

### Documentation Site
```bash
# Test landing page
curl https://docs.velvet.dev/ | grep "Inference UI"

# Test docs page
curl https://docs.velvet.dev/docs/getting-started | grep "Getting Started"

# Test search (may need time to index)
# Use browser to test search functionality
```

### Backend API
```bash
# Replace with your actual Worker URL
WORKER_URL="https://velvet-api-production.YOUR_SUBDOMAIN.workers.dev"

# Test health endpoint
curl $WORKER_URL/health

# Test GraphQL endpoint
curl -X POST $WORKER_URL/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}'

# Test event ingestion (requires API key)
curl -X POST $WORKER_URL/events/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"events": [{"type": "test", "timestamp": 1234567890}]}'
```

---

## 📊 Monitoring

### Cloudflare Dashboard

#### Pages (Documentation)
- **Analytics**: Workers & Pages → velvet-docs → Analytics
- **Deployments**: View deployment history and logs
- **Custom domains**: Manage DNS and SSL
- **Build logs**: Debug build issues

#### Workers (Backend)
- **Analytics**: Workers & Pages → velvet-api → Analytics
- **Logs**: Real-time with `wrangler tail`
- **Metrics**: Requests, errors, CPU time
- **Triggers**: Cron jobs, custom domains

#### D1 Database
- **Dashboard**: Workers & Pages → D1 → velvet-db
- **Queries**: Run SQL directly in dashboard
- **Metrics**: Storage, queries, performance

#### Analytics Engine
- **Dashboard**: Analytics & Logs → Analytics Engine
- **Queries**: SQL-like queries for events
- **Exports**: Download data

### Command Line Monitoring

```bash
# View Worker logs (real-time)
wrangler tail --env=production

# View Pages deployments
wrangler pages deployments list --project-name=velvet-docs

# Query D1 database
wrangler d1 execute velvet-db --command="SELECT COUNT(*) FROM users"

# List R2 buckets
wrangler r2 bucket list

# List KV keys
wrangler kv:key list --binding=KV
```

---

## 💰 Cost Estimates

### Cloudflare Pages (Documentation)
- **Free tier**: Unlimited bandwidth, unlimited requests
- **Paid tier** ($20/mo): 5,000 builds/month, advanced analytics
- **Expected**: $0/month (free tier sufficient)

### Cloudflare Workers (Backend)
With 30M events/month:
- Workers: ~$15/month
- Workers AI: ~$10/month
- Analytics Engine: ~$3/month
- D1: $0 (within free tier)
- R2: $0 (within free tier)
- KV: $0 (within free tier)
- **Total**: ~$28/month

### At Scale (1B events/month)
- Workers: ~$500/month
- Workers AI: ~$300/month
- Analytics Engine: ~$100/month
- D1: ~$50/month
- **Total**: ~$950/month

**Gross Margin**: 98%+ vs 60-70% with traditional cloud

---

## 🔒 Security Considerations

### Documentation Site
- ✅ Static site (no server-side code)
- ✅ HTTPS by default
- ✅ No sensitive data
- ✅ DDoS protection (Cloudflare)
- ✅ Rate limiting (automatic)

### Backend API
- ✅ HTTPS only
- ✅ CORS configured
- ✅ Rate limiting per endpoint
- ✅ JWT authentication (when configured)
- ✅ Database encryption (D1)
- ✅ Secrets management (Wrangler)
- ⚠️  Configure JWT_SECRET before production
- ⚠️  Setup API key authentication
- ⚠️  Enable request logging

### Demo App
- ✅ Local AI processing (privacy)
- ✅ Encrypted AsyncStorage
- ✅ HTTPS for API calls
- ⚠️  Update API endpoint URLs
- ⚠️  Configure proper CORS

---

## 🚨 Troubleshooting

### Documentation Build Fails

**Error**: `Module not found` or `Cannot find module`
```bash
cd docs
rm -rf node_modules .next
npm install
npm run build
```

**Error**: `Next.js build failed`
- Check Node.js version (needs 18+)
- Verify all MDX files have valid syntax
- Check `next.config.mjs` configuration

### Worker Deployment Fails

**Error**: `No account found`
```bash
wrangler logout
wrangler login
```

**Error**: `Binding not found`
- Check `wrangler.toml` has correct resource IDs
- Verify D1 database exists: `wrangler d1 list`
- Verify KV namespace exists: `wrangler kv:namespace list`

**Error**: `Database not found`
```bash
wrangler d1 list
wrangler d1 create velvet-db
```

### Demo App Won't Start

**Error**: `Cannot find module '@inference-ui/react-native'`
```bash
cd inference-ui-demo-app
rm -rf node_modules
npm install
```

**Error**: `Expo error`
- Clear Expo cache: `npx expo start --clear`
- Update Expo: `npm install expo@latest`

---

## 📝 Post-Deployment Tasks

### Immediate
- [ ] Test all deployed endpoints
- [ ] Verify documentation site loads
- [ ] Check Workers health endpoint
- [ ] Test event ingestion
- [ ] Configure monitoring alerts
- [ ] Document actual URLs
- [ ] Update demo app with production URLs

### Within 24 Hours
- [ ] Monitor error rates in Cloudflare dashboard
- [ ] Check D1 database for test data
- [ ] Verify Analytics Engine receiving events
- [ ] Test search functionality (needs indexing time)
- [ ] Run Lighthouse audit on docs site
- [ ] Load test Workers API

### Within 1 Week
- [ ] Setup custom domain for docs (`docs.velvet.dev`)
- [ ] Configure GitHub Actions for auto-deployment
- [ ] Setup status page monitoring
- [ ] Document API endpoints for team
- [ ] Create runbook for common issues
- [ ] Plan for capacity scaling

---

## 📞 Support Resources

### Cloudflare
- **Dashboard**: https://dash.cloudflare.com/
- **Docs**: https://developers.cloudflare.com/
- **Community**: https://community.cloudflare.com/
- **Status**: https://www.cloudflarestatus.com/

### Inference UI
- **GitHub**: https://github.com/velvet-ui/velvet
- **Issues**: https://github.com/velvet-ui/velvet/issues
- **Discussions**: https://github.com/velvet-ui/velvet/discussions
- **Documentation**: https://docs.velvet.dev (after deployment)

### Emergency Contacts
- **Cloudflare Support**: Via dashboard (paid plans)
- **FinHub Account Admin**: [Contact info]

---

## ✅ Success Criteria

Deployment is successful when:

### Documentation Site
- ✅ Site accessible at deployment URL
- ✅ All pages load without 404 errors
- ✅ Search functionality works
- ✅ Lighthouse score 90+ (all metrics)
- ✅ Mobile responsive
- ✅ No console errors

### Backend Infrastructure
- ✅ Health endpoint returns 200 OK
- ✅ GraphQL endpoint accepts queries
- ✅ Event ingestion processes events
- ✅ D1 database accessible
- ✅ Workers AI responds
- ✅ < 100ms response time (p95)
- ✅ 0 errors in first hour

### Demo App
- ✅ Builds successfully
- ✅ All components render
- ✅ No runtime errors
- ✅ Events tracked successfully
- ✅ Connects to backend API

---

## 🎯 Next Steps After Deployment

1. **Monitor for 48 hours** - Watch for errors, performance issues
2. **Gather feedback** - Internal testing and user feedback
3. **Optimize** - Based on real usage data
4. **Scale** - Adjust resources as needed
5. **Document** - Update docs with actual deployment experience
6. **Iterate** - Plan next features based on usage

---

**Deployment Guide Version**: 1.0
**Last Updated**: October 15, 2025
**Maintained By**: Inference UI Team

**Ready to deploy!** 🚀
