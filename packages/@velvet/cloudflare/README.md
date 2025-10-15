# @liquid-ui/cloudflare

Cloudflare Workers infrastructure for Velvet - includes GraphQL API, event ingestion, Workers AI integration, and D1 database.

## Setup

### Prerequisites

- Cloudflare account (use FinHub account)
- Wrangler CLI installed globally or via npm

### Install Dependencies

```bash
npm install
```

### Initialize Cloudflare Services

#### 1. Login to Cloudflare

```bash
npx wrangler login
```

#### 2. Create D1 Database

```bash
npx wrangler d1 create liquid-ui-db
```

Copy the database ID from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "liquid-ui-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

#### 3. Apply Database Schema

```bash
npx wrangler d1 execute liquid-ui-db --file=./schema.sql
```

#### 4. Create R2 Bucket

```bash
npx wrangler r2 bucket create liquid-ui-assets
```

#### 5. Create KV Namespace

```bash
npx wrangler kv:namespace create "LIQUID_UI_KV"
```

Copy the namespace ID and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_NAMESPACE_ID_HERE"
```

## Development

### Run Local Development Server

```bash
npm run dev
```

This starts Wrangler dev server with hot reloading.

### Test Locally

GraphQL endpoint:
```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}'
```

Event ingestion:
```bash
curl -X POST http://localhost:8787/events \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "test-1",
    "timestamp": 1234567890,
    "sessionId": "session-1",
    "event": "component_mounted",
    "component": "GlassButton"
  }]'
```

## Deployment

### Deploy to Cloudflare

```bash
npm run deploy
```

### Deploy to Production

```bash
npx wrangler deploy --env production
```

## Architecture

### Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /graphql` - GraphQL API
- `POST /events` - Event ingestion

### Services Used

- **Workers**: Serverless edge compute
- **D1**: SQLite database at edge
- **R2**: Object storage (assets, exports)
- **KV**: Key-value cache (sessions, config)
- **Analytics Engine**: Time-series event data
- **Workers AI**: Edge AI inference

### GraphQL Schema

See `src/graphql/schema.ts` for complete schema. Key types:

- `User` - User accounts and tier information
- `Flow` - UX flow definitions
- `FlowAnalytics` - Analytics for flows
- `Event` - Event tracking

### Event Ingestion

Events are:
1. Enriched with Workers AI (intent, sentiment)
2. Written to Analytics Engine (time-series data)
3. Stored in D1 (recent events for queries)
4. Checked for real-time triggers

### Database Schema

Tables:
- `users` - User accounts
- `flows` - Flow definitions
- `events` - Recent events (30 days)
- `sessions` - User sessions
- `usage` - Monthly usage tracking
- `api_keys` - API authentication

See `schema.sql` for complete schema.

## Environment Variables

Set in `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "development"
API_VERSION = "v1"
```

For secrets (not in version control):

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put STRIPE_API_KEY
```

## Monitoring

View logs:
```bash
npx wrangler tail
```

View analytics in Cloudflare dashboard:
- Workers Analytics
- Analytics Engine queries
- D1 database stats

## Cost Estimation

With Cloudflare's pricing:

- **Workers**: 100K requests/day free, then $0.50/million
- **D1**: 5GB storage free, 5M reads/day free
- **R2**: 10GB storage free, no egress fees
- **KV**: 100K reads/day free
- **Analytics Engine**: $0.10 per 1M writes
- **Workers AI**: ~$0.011 per 1K neurons

Expected costs at scale:
- 1M events/day: ~$0.10/day (Analytics Engine)
- Workers AI enrichment: ~$10/month
- Total: **< $15/month** for 30M events/month

## License

MIT
