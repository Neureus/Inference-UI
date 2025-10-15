# Inference UI Cloudflare Workers Deployment Guide

Complete guide to deploying Inference UI's backend infrastructure to Cloudflare Workers using the FinHub account.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (FinHub)
- Wrangler CLI installed globally: `npm install -g wrangler`

## Authentication

### 1. Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with your Cloudflare account. Make sure to use the **FinHub** account credentials.

### 2. Verify Account

```bash
wrangler whoami
```

Ensure you're logged in to the correct FinHub account.

## Initial Setup

### 1. Create D1 Database

```bash
cd packages/@inference-ui/cloudflare
wrangler d1 create velvet-db
```

**Output**:
```
✅ Successfully created DB 'velvet-db'

[[d1_databases]]
binding = "DB"
database_name = "velvet-db"
database_id = "<DATABASE_ID>"
```

Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "velvet-db"
database_id = "<DATABASE_ID>"  # Replace with actual ID
```

### 2. Initialize Database Schema

```bash
wrangler d1 execute velvet-db --file=./schema.sql
```

Verify tables were created:

```bash
wrangler d1 execute velvet-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### 3. Create KV Namespace

**Development**:
```bash
wrangler kv:namespace create KV
```

**Production**:
```bash
wrangler kv:namespace create KV --env=production
```

**Output**:
```
✅ Created namespace with id "<NAMESPACE_ID>"
```

Update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV"
id = "<NAMESPACE_ID>"  # Replace with actual ID
```

### 4. Create R2 Bucket

```bash
wrangler r2 bucket create velvet-assets
```

Verify:

```bash
wrangler r2 bucket list
```

### 5. Configure Analytics Engine

Analytics Engine requires no setup - it's automatically available with the binding.

### 6. Configure Workers AI

Workers AI is automatically available with the `[ai]` binding in `wrangler.toml`. No setup required.

## Environment Variables

### Development

Already configured in `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "development"
API_VERSION = "v1"
```

### Production

For sensitive values (API keys, secrets), use Wrangler secrets:

```bash
# Set production secrets
wrangler secret put STRIPE_SECRET_KEY --env=production
wrangler secret put JWT_SECRET --env=production
wrangler secret put OPENAI_API_KEY --env=production  # If using OpenAI fallback
```

## Deployment

### Development Deployment

Deploy to `*.workers.dev` subdomain:

```bash
cd packages/@inference-ui/cloudflare
npm run build
wrangler deploy
```

**Output**:
```
✨ Published velvet-api (v1)
   https://velvet-api.<YOUR_SUBDOMAIN>.workers.dev
```

Test the deployment:

```bash
curl https://velvet-api.<YOUR_SUBDOMAIN>.workers.dev/health
```

### Production Deployment

Deploy to production:

```bash
wrangler deploy --env=production
```

**Output**:
```
✨ Published velvet-api-production (v1)
   https://velvet-api-production.<YOUR_SUBDOMAIN>.workers.dev
```

### Custom Domain (Optional)

1. Add custom domain in Cloudflare Dashboard:
   - Go to Workers & Pages > velvet-api > Settings > Triggers
   - Add Custom Domain: `api.velvet.dev`

2. Or via CLI:

```bash
wrangler domains add api.velvet.dev
```

## Testing Deployment

### 1. Health Check

```bash
curl https://velvet-api.<YOUR_SUBDOMAIN>.workers.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "v1",
  "timestamp": 1234567890
}
```

### 2. GraphQL Endpoint

```bash
curl -X POST https://velvet-api.<YOUR_SUBDOMAIN>.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

### 3. Event Ingestion

```bash
curl -X POST https://velvet-api.<YOUR_SUBDOMAIN>.workers.dev/events/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -d '{
    "events": [
      {
        "type": "button_press",
        "userId": "test-user",
        "sessionId": "test-session",
        "timestamp": 1234567890,
        "properties": {
          "button": "test-button"
        }
      }
    ]
  }'
```

## Database Migrations

### Apply Migration

```bash
wrangler d1 execute velvet-db --file=./migrations/001_add_column.sql
```

### Backup Database

```bash
wrangler d1 backup create velvet-db
```

List backups:

```bash
wrangler d1 backup list velvet-db
```

Restore backup:

```bash
wrangler d1 backup restore velvet-db <BACKUP_ID>
```

## Monitoring

### View Logs

**Real-time logs** (requires deployment):

```bash
wrangler tail
```

**Production logs**:

```bash
wrangler tail --env=production
```

### Analytics

View analytics in Cloudflare Dashboard:
- Workers & Pages > velvet-api > Analytics

Or query via API:

```bash
curl "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/workers/scripts/velvet-api/analytics" \
  -H "Authorization: Bearer <API_TOKEN>"
```

### Metrics

Key metrics to monitor:
- **Requests**: Total requests per second
- **Errors**: 5xx error rate
- **CPU Time**: Execution time per request
- **Success Rate**: % of successful requests

## Local Development

### Start Local Dev Server

```bash
cd packages/@inference-ui/cloudflare
wrangler dev
```

**Output**:
```
⎔ Starting local server...
⎔ Listening on http://localhost:8787
```

Test locally:

```bash
curl http://localhost:8787/health
```

### Local D1 Database

Wrangler automatically uses a local SQLite database for development:

```bash
wrangler d1 execute velvet-db --local --command="SELECT * FROM users"
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy-workers.yml`:

```yaml
name: Deploy Cloudflare Workers

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Workers
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        working-directory: packages/@inference-ui/cloudflare

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: packages/@inference-ui/cloudflare
          command: deploy --env=production
```

Set secrets in GitHub:
- `CLOUDFLARE_API_TOKEN` - From Cloudflare Dashboard > My Profile > API Tokens
- `CLOUDFLARE_ACCOUNT_ID` - From Cloudflare Dashboard URL

## Troubleshooting

### Error: "No account found"

**Solution**: Ensure you're logged in with the correct FinHub account:

```bash
wrangler logout
wrangler login
```

### Error: "Binding not found"

**Solution**: Ensure all resource IDs are filled in `wrangler.toml`:
- `database_id` for D1
- `id` for KV namespace

### Error: "Workers AI model not found"

**Solution**: Check available models:

```bash
wrangler ai list
```

### Error: "D1 database not found"

**Solution**: List databases and verify name:

```bash
wrangler d1 list
```

### High CPU time

**Solution**:
- Optimize database queries (add indexes)
- Cache frequently accessed data in KV
- Reduce AI model inference complexity

## Cost Optimization

### Free Tier Limits
- **Workers**: 100K requests/day
- **D1**: 5GB storage, 5M reads/day free
- **R2**: 10GB storage free
- **Analytics Engine**: First 10M writes free
- **Workers AI**: $0.011 per 1K neurons

### Cost Reduction Tips
1. **Enable KV caching** for AI results
2. **Batch events** before writing to Analytics Engine
3. **Use local AI** for simple tasks (offload to mobile app)
4. **Implement request caching** with Cache API
5. **Monitor usage** in Cloudflare Dashboard

## Production Checklist

- [ ] D1 database created and schema applied
- [ ] KV namespace created
- [ ] R2 bucket created
- [ ] All secrets configured
- [ ] Custom domain added (optional)
- [ ] Production deployment successful
- [ ] Health check passing
- [ ] GraphQL endpoint responding
- [ ] Event ingestion working
- [ ] Monitoring and alerts configured
- [ ] Database backups scheduled
- [ ] CI/CD pipeline configured

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Analytics Engine Docs](https://developers.cloudflare.com/analytics/analytics-engine/)

## Support

For issues or questions:
1. Check [Cloudflare Community](https://community.cloudflare.com/)
2. Review [Inference UI Documentation](../../../README.md)
3. Check Cloudflare Dashboard logs
4. Contact FinHub account administrator

---

**Last Updated**: October 15, 2025
