# 🚀 Inference UI - Deployment Instructions

## Current Status

✅ **Architecture Refactored**: Core services extracted to reusable `@inference-ui/api` package
✅ **Cloudflare Adapters Created**: D1, KV, R2, Analytics Engine, Workers AI adapters ready
✅ **Database Initialized**: D1 schema created with 5 tables
✅ **Tests Created**: Integration tests for EventProcessor
✅ **Verification Script Ready**: Automated deployment testing
✅ **Website Configuration Updated**: API endpoints pointing to Neureus account
✅ **All Code Committed**: Latest changes pushed to GitHub

## Deployment Steps

### Step 1: Deploy Cloudflare Workers API

```bash
cd "/Users/am/Projects/Inference UX/packages/@inference-ui/cloudflare"
wrangler deploy
```

**Expected Output**:
```
✨ Built successfully
🌎 Deploying to Cloudflare Workers...
✅ Deployed to: https://inference-ui-api.neureus.workers.dev
```

**Account**: Neureus (2bba1309281bf805590ca30d4e49adb0)

**Resources Created**:
- D1 Database: `inference-ui-db` (47fd4ca8-72b1-44be-b310-53feb2e0a101)
- KV Namespace: `inference-ui-cache` (a9cf26e3f5104521b279b245adaa2801)
- R2 Bucket: `inference-ui-assets`
- Analytics Engine: INFERENCE_UI_ANALYTICS

### Step 2: Verify API Deployment

```bash
cd "/Users/am/Projects/Inference UX/packages/@inference-ui/cloudflare"
./verify-deployment.sh
```

This will test:
- ✓ Root endpoint
- ✓ Health check
- ✓ GraphQL API (introspection + queries)
- ✓ Event ingestion (single + batch)
- ✓ Intent classification
- ✓ Error handling

**Expected Result**: All tests pass ✅

### Step 3: Deploy Marketing Website

```bash
cd "/Users/am/Projects/Inference UX/website"
npx wrangler pages deploy out --project-name inference-ui-website
```

**Alternative** (if using Git integration):
1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/pages
2. Create new Pages project
3. Connect to GitHub repo: Neureus/Inference-UI
4. Configure build:
   - Build command: `npm run build`
   - Build output directory: `out`
   - Root directory: `website`

**Expected URL**: https://inference-ui-website.pages.dev

### Step 4: Test Complete Integration

```bash
# Test API directly
curl https://inference-ui-api.neureus.workers.dev/

# Test website
open https://inference-ui-website.pages.dev

# Track test event from website
curl -X POST https://inference-ui-api.neureus.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '{"event":"website_test","component":"DeploymentVerification"}'
```

## API Endpoints

### Cloudflare Workers API

**Base URL**: https://inference-ui-api.neureus.workers.dev

- `GET /` - API information
- `GET /health` - Health check
- `POST /graphql` - GraphQL API
- `POST /events` - Event ingestion

### GraphQL Examples

```bash
# Introspection
curl -X POST https://inference-ui-api.neureus.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | jq

# Query flows (requires auth)
curl -X POST https://inference-ui-api.neureus.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"{ flows(limit: 10) { id name } }"}' | jq
```

### Event Tracking Examples

```bash
# Single event
curl -X POST https://inference-ui-api.neureus.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '{
    "event": "button_click",
    "component": "CTAButton",
    "properties": {"label": "Get Started"}
  }'

# Batch events
curl -X POST https://inference-ui-api.neureus.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '[
    {"event": "page_view", "component": "HomePage"},
    {"event": "button_click", "component": "PricingCTA"}
  ]'
```

## Monitoring

### Cloudflare Dashboard

**Workers**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/services/view/inference-ui-api

**Pages**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/pages

**D1**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/d1

**Analytics Engine**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/analytics-engine

### Live Logs

```bash
# Stream Workers logs
cd packages/@inference-ui/cloudflare
wrangler tail

# Stream Pages logs
cd website
npx wrangler pages deployment tail
```

## Troubleshooting

### Analytics Engine Not Enabled

**Error**: "You need to enable Analytics Engine"

**Solution**:
1. Visit: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/analytics-engine
2. Click "Enable Analytics Engine"
3. Retry deployment

### Database Connection Error

**Error**: "D1 database not found"

**Solution**:
```bash
# Verify database exists
cd packages/@inference-ui/cloudflare
wrangler d1 list

# Re-run migrations
wrangler d1 execute inference-ui-db --remote --file=migrations/0001_initial_schema.sql
```

### Website Build Fails

**Error**: Build errors in Next.js

**Solution**:
```bash
cd website
npm install
npm run build
```

## Architecture Benefits

### ✅ Platform Agnostic
- Core logic in `@inference-ui/api` works anywhere
- Easy to add AWS Lambda, Google Cloud Functions, etc.

### ✅ Testable
- Mock adapters for unit tests
- Integration tests included
- Verification script automated

### ✅ Type Safe
- Full TypeScript throughout
- Strong typing at all layers

### ✅ Modular
- Clear separation of concerns
- Easy to extend and maintain

## What Got Refactored

### Before
```
@inference-ui/cloudflare
├── Embedded GraphQL resolvers
├── Embedded event processing
├── Direct D1 dependencies
└── Platform-specific business logic
```

### After
```
@inference-ui/api (Reusable)
├── GraphQL schema & resolvers
├── Event processor with classification
├── Auth service
└── Adapter interfaces

@inference-ui/cloudflare (Thin Adapter)
├── D1DatabaseAdapter
├── AnalyticsEngineAdapter
├── KVCacheAdapter
├── R2StorageAdapter
└── WorkersAIAdapter
```

## Post-Deployment Checklist

- [ ] API deployed to Neureus account
- [ ] Verification script passes all tests
- [ ] Website deployed to Neureus Pages
- [ ] Website can connect to API
- [ ] Event tracking working
- [ ] GraphQL queries working
- [ ] Monitoring dashboards accessible
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Rate limiting configured (optional)

## Next Steps After Deployment

1. **Implement Real Authentication**
   - Add JWT token generation
   - Implement token verification in AuthService
   - Add user registration/login endpoints

2. **Set Up Custom Domains**
   - API: api.inference-ui.dev
   - Website: inference-ui.dev

3. **Enable Advanced Features**
   - AI-powered event classification (set `useAI: true`)
   - Real-time triggers and alerts
   - Advanced analytics queries

4. **Mobile App Integration**
   - Configure API endpoints in mobile app
   - Test event tracking from React Native
   - Verify end-to-end flow

5. **Monitoring & Alerts**
   - Set up Cloudflare alerts for errors
   - Configure uptime monitoring
   - Create analytics dashboards

## Support

- **Documentation**: DEPLOYMENT.md (detailed guide)
- **API Reference**: GraphQL introspection endpoint
- **GitHub Issues**: https://github.com/Neureus/Inference-UI/issues

---

**Ready to deploy!** 🚀

Run the deployment commands above and verify everything works with the automated test script.
