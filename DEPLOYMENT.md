# Inference UI Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Wrangler CLI authenticated with Cloudflare account
- Neureus Cloudflare account access

## Architecture

```
@inference-ui/api (Platform-Agnostic)
        ↓
Cloudflare Adapters
        ↓
Cloudflare Services (D1, R2, KV, Analytics Engine, Workers AI)
```

## Cloudflare Resources (Neureus Account)

**Account ID**: `2bba1309281bf805590ca30d4e49adb0`

**Created Resources**:
- ✅ D1 Database: `inference-ui-db` (47fd4ca8-72b1-44be-b310-53feb2e0a101)
- ✅ KV Namespace: `inference-ui-cache` (a9cf26e3f5104521b279b245adaa2801)
- ✅ R2 Bucket: `inference-ui-assets`
- ✅ Database Schema: 5 tables initialized (17 queries executed)

**Required Services** (enable in Cloudflare Dashboard):
- Analytics Engine: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/analytics-engine

## Deployment Steps

### 1. Enable Analytics Engine

Visit: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/analytics-engine

Click "Enable Analytics Engine" if not already enabled.

### 2. Deploy Workers API

```bash
cd "/Users/am/Projects/Inference UX/packages/@inference-ui/cloudflare"
wrangler deploy
```

Expected output:
```
✨ Built successfully
🌎 Deploying to Cloudflare Workers...
✅ Deployed to: https://inference-ui-api.neureus.workers.dev
```

### 3. Test Deployment

```bash
# Test root endpoint
curl https://inference-ui-api.neureus.workers.dev/

# Test health endpoint
curl https://inference-ui-api.neureus.workers.dev/health

# Test GraphQL
curl -X POST https://inference-ui-api.neureus.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __schema { types { name } } }"}' | jq

# Test event ingestion
curl -X POST https://inference-ui-api.neureus.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '[{"event":"test_deployment","component":"CLI"}]' | jq
```

## API Endpoints

### Base URL
- **Production**: `https://inference-ui-api.neureus.workers.dev`

### Endpoints

**GET /**
- Returns API information and available endpoints

**GET /health**
- Health check with timestamp

**POST /graphql**
- GraphQL API endpoint
- Body: `{"query": "...", "variables": {...}, "operationName": "..."}`

**POST /events**
- Event ingestion endpoint
- Body: Single event object or array of events

## GraphQL Schema

### Queries

```graphql
query {
  me {
    id
    email
    tier
    createdAt
    usage {
      eventsThisMonth
      flowsCount
      aiRequestsThisMonth
    }
  }

  flows(limit: 10, offset: 0) {
    id
    name
    steps {
      id
      component
      props
      next
    }
    aiConfig {
      enabled
      models
      features
    }
    createdAt
    updatedAt
  }

  flow(id: "flow-id") {
    id
    name
  }

  flowAnalytics(flowId: "flow-id", timeRange: {start: "2025-01-01", end: "2025-12-31"}) {
    flowId
    completionRate
    averageDuration
    totalSessions
  }
}
```

### Mutations

```graphql
mutation {
  createFlow(input: {
    name: "Onboarding Flow"
    steps: [
      {id: "1", component: "EmailCapture"}
      {id: "2", component: "ProfileSetup"}
    ]
    aiConfig: {enabled: true, models: ["llama-3"], features: ["validation"]}
  }) {
    id
    name
  }

  updateFlow(id: "flow-id", input: {name: "Updated Flow"}) {
    id
    name
  }

  deleteFlow(id: "flow-id")

  trackEvent(input: {
    event: "button_click"
    component: "AIButton"
    properties: {label: "Get Started"}
  })
}
```

## Event Ingestion

### Single Event

```bash
curl -X POST https://inference-ui-api.neureus.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '{
    "event": "button_click",
    "component": "AIButton",
    "properties": {"label": "Get Started"}
  }'
```

### Batch Events

```bash
curl -X POST https://inference-ui-api.neureus.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '[
    {"event": "page_view", "component": "HomePage"},
    {"event": "button_click", "component": "CTAButton", "properties": {"label": "Sign Up"}},
    {"event": "form_submit", "component": "ContactForm", "properties": {"fields": ["name", "email"]}}
  ]'
```

### Event Classification

Events are automatically classified with:

**Intent** (rule-based):
- `purchase` - Buy, checkout actions
- `help` - Support, contact actions
- `configure` - Settings, config actions
- `interact` - General button/tap actions
- `explore` - Navigation, view actions
- `error` - Error, fail, crash events
- `submit` - Form submissions
- `search` - Search queries
- `unknown` - Fallback

**Sentiment** (rule-based):
- `positive` - Success, complete, purchase, like, share
- `negative` - Error, fail, crash, cancel, exit
- `neutral` - Default

**AI Classification** (optional):
- Enable with environment variable: `ENVIRONMENT=production`
- Uses Llama 3.1 8B for advanced classification
- Automatic fallback to rule-based on failure

## Authentication

Currently using placeholder authentication. To implement:

1. Generate JWT tokens for users
2. Send in Authorization header: `Bearer <token>`
3. Tokens verified in `AuthService.extractAuthContext()`

## Monitoring

### Cloudflare Dashboard

- **Workers**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/services/view/inference-ui-api
- **D1 Database**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/d1
- **R2 Storage**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/r2/buckets
- **KV**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/kv/namespaces
- **Analytics Engine**: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/analytics-engine

### Logs

```bash
# Stream live logs
cd packages/@inference-ui/cloudflare
wrangler tail
```

### Metrics

View in Cloudflare Dashboard:
- Request rate
- Error rate
- Latency (p50, p95, p99)
- D1 query performance
- Analytics Engine data volume

## Database Operations

### Run Migrations

```bash
cd packages/@inference-ui/cloudflare
wrangler d1 execute inference-ui-db --remote --file=migrations/0001_initial_schema.sql
```

### Query Database

```bash
wrangler d1 execute inference-ui-db --remote --command "SELECT * FROM users LIMIT 10"
wrangler d1 execute inference-ui-db --remote --command "SELECT COUNT(*) FROM events"
```

### Backup Database

```bash
wrangler d1 backup create inference-ui-db
wrangler d1 backup list inference-ui-db
```

## Troubleshooting

### Analytics Engine Error

If deployment fails with "You need to enable Analytics Engine":
1. Visit: https://dash.cloudflare.com/2bba1309281bf805590ca30d4e49adb0/workers/analytics-engine
2. Click "Enable Analytics Engine"
3. Retry deployment

### Database Connection Error

If GraphQL queries fail with database errors:
1. Verify D1 database exists: `wrangler d1 list`
2. Check database ID in wrangler.toml matches
3. Run migrations if schema is missing

### Authentication Required Error

GraphQL mutations require authentication (userId):
1. Implement JWT token generation
2. Send token in Authorization header
3. Update AuthService to verify real tokens

## Next Steps

1. ✅ Deploy to Neureus account
2. ✅ Test all endpoints
3. 🔄 Implement real JWT authentication
4. 🔄 Deploy marketing website
5. 🔄 Update marketing site API endpoint
6. 🔄 Set up custom domain
7. 🔄 Configure rate limiting
8. 🔄 Enable monitoring alerts

## Support

- GitHub Issues: https://github.com/Neureus/Inference-UI/issues
- Documentation: Coming soon to docs.inference-ui.dev
- API Reference: GraphQL introspection endpoint

---

**Last Updated**: October 16, 2025
**Version**: 0.1.0 (Refactored with adapter pattern)
