# Cloudflare Workers - Service Bindings Deployment Guide

Complete guide for deploying Inference UI with service bindings architecture.

## Architecture Overview

```
Client → Main API Worker → Streaming Worker (via service binding)
```

**Main API Worker** (`inference-ui-api`):
- GraphQL API
- Event ingestion
- Routes streaming requests to streaming worker

**Streaming Worker** (`inference-ui-streaming`):
- AI streaming (chat, completion, object)
- Workers AI integration
- Independent scaling

**Benefits**:
- 🚀 **0ms latency** - Direct worker-to-worker calls
- 💰 **Cost savings** - Service binding calls are free
- 🔒 **Security** - Internal communication only
- 📈 **Independent scaling** - Each worker scales separately

## Prerequisites

1. **Cloudflare Account**
   - Account ID: `2bba1309281bf805590ca30d4e49adb0`
   - Workers subscription (for Workers AI)

2. **Wrangler CLI**
   ```bash
   npm install -g wrangler@latest
   ```

3. **Authentication**
   ```bash
   wrangler login
   ```

## Local Development

### 1. Build Both Workers

```bash
cd packages/@inference-ui/cloudflare

# Build main API worker
npm run build

# Build streaming worker
npm run build:streaming

# Or build both at once
npm run build:all
```

### 2. Start Streaming Worker First

```bash
# Terminal 1 - Start streaming worker
npm run dev:streaming

# This starts on port 8788 (default Wrangler port)
```

### 3. Start Main API Worker

```bash
# Terminal 2 - Start main API worker
npm run dev

# This starts on port 8787
# Main worker connects to streaming worker via service binding
```

### 4. Test the Setup

**Health Check (Main Worker)**:
```bash
curl http://localhost:8787/health
```

**Health Check (Streaming Worker)**:
```bash
curl http://localhost:8788/health
```

**Test Chat Streaming (via Service Binding)**:
```bash
curl -X POST http://localhost:8787/stream/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "parts": [{"type": "text", "text": "Hello!"}]}
    ]
  }'
```

The request flows:
1. Client → Main API Worker (`localhost:8787`)
2. Main Worker → Streaming Worker (via service binding)
3. Streaming Worker → Workers AI
4. Response streams back through the chain

## Production Deployment

### Deployment Order

**IMPORTANT**: Deploy streaming worker FIRST, then main worker.

### 1. Deploy Streaming Worker

```bash
# Deploy streaming worker to production
npm run deploy:streaming

# Expected output:
# ✨ Built successfully
# ✔ Successfully published inference-ui-streaming (production)
```

**Verify Deployment**:
```bash
# Test streaming worker health
curl https://inference-ui-streaming.neureus.workers.dev/health
```

### 2. Deploy Main API Worker

```bash
# Deploy main API worker to production
npm run deploy

# Expected output:
# ✨ Built successfully
# ✔ Successfully published inference-ui-api (production)
```

**Verify Deployment**:
```bash
# Test main worker
curl https://inference-ui-api.neureus.workers.dev/

# Should show service bindings architecture
```

### 3. Test Service Bindings in Production

**Test Chat via Service Binding**:
```bash
curl -X POST https://inference-ui-api.neureus.workers.dev/stream/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "parts": [{"type": "text", "text": "Explain service bindings"}]
      }
    ]
  }'
```

**Test Completion via Service Binding**:
```bash
curl -X POST https://inference-ui-api.neureus.workers.dev/stream/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are Cloudflare service bindings?",
    "maxTokens": 500
  }'
```

## Deployment Scripts

### Deploy All at Once

```bash
# Deploy both workers in correct order
npm run deploy:all

# This runs:
# 1. npm run deploy:streaming (streaming worker first)
# 2. npm run deploy (main worker second)
```

### Individual Deployments

```bash
# Deploy only streaming worker
npm run deploy:streaming

# Deploy only main API worker
npm run deploy
```

## Configuration

### wrangler.toml (Main Worker)

Service binding configuration in `wrangler.toml`:

```toml
[[services]]
binding = "STREAMING"
service = "inference-ui-streaming"
environment = "production"
```

**Key Points**:
- `binding`: Name used in code (`env.STREAMING`)
- `service`: Name of streaming worker
- `environment`: Target environment

### wrangler-streaming.toml (Streaming Worker)

Streaming worker has its own configuration:

```toml
name = "inference-ui-streaming"
main = "src-streaming/index.ts"

[ai]
binding = "AI"

[[kv_namespaces]]
binding = "KV"

[[d1_databases]]
binding = "DB"
```

## Smart Placement

**Status**: ✅ Enabled for all workers

### What is Smart Placement?

Smart Placement is a Cloudflare feature that automatically places workers near their backend services (D1, R2, KV, Workers AI) to minimize latency. Instead of running in every Cloudflare data center globally, workers are intelligently placed near the services they access most.

**Enabled in both workers**:
```toml
[placement]
mode = "smart"
```

### Performance Benefits

**D1 Database Access**:
- Without Smart Placement: 50-150ms
- With Smart Placement: 1-5ms
- **Improvement**: 10-30x faster

**Workers AI Inference**:
- Without Smart Placement: 100-300ms
- With Smart Placement: 50-150ms
- **Improvement**: 2-3x faster

**Cost Savings**:
- Faster backend access = shorter CPU time
- Average savings: 20-40% on CPU costs

### How It Works

**Traditional Placement**:
```
User (Tokyo) → Worker (Tokyo) → D1 Database (US-East) ❌
                     ↑
              Long distance = High latency
```

**Smart Placement**:
```
User (Tokyo) → Worker (US-East) → D1 Database (US-East) ✅
         ↑                    ↑
    CDN fast route     Near database = Low latency
```

### Verifying Smart Placement

**Check Configuration**:
```bash
# Verify both workers have Smart Placement enabled
grep -A 1 "\[placement\]" wrangler.toml
grep -A 1 "\[placement\]" wrangler-streaming.toml

# Should show: mode = "smart"
```

**Monitor Placement**:
1. Go to Cloudflare Dashboard → Workers & Pages
2. Click on worker name
3. Settings → General
4. Look for "Placement: Smart"

**View Metrics**:
1. Worker → Analytics
2. Check CPU time (should decrease 20-40%)
3. Check duration (should decrease 30-60% for data operations)
4. View invocations by location (fewer locations = working correctly)

### Important Notes

**Deployment**:
- Smart Placement propagates within 10-15 minutes after deployment
- No code changes required
- Workers automatically placed near backend services

**Performance Trade-offs**:
- Initial request routing may be slightly longer for distant users
- Backend operations are much faster (net improvement)
- Overall latency decreases for data-heavy operations

**Monitoring First Week**:
- Check latency improvements in dashboard
- Verify CPU time reduction
- Monitor error rates (should be stable)
- Review placement locations

For comprehensive Smart Placement documentation, see [`SMART-PLACEMENT.md`](./SMART-PLACEMENT.md).

## Monitoring

### Cloudflare Dashboard

**Main Worker**:
1. Go to Workers & Pages
2. Click `inference-ui-api`
3. View metrics: requests, errors, CPU time

**Streaming Worker**:
1. Click `inference-ui-streaming`
2. View metrics: AI inference time, throughput

### Service Binding Metrics

**Check Service Binding Latency**:
1. Main Worker → Analytics
2. Filter by: Service Binding calls
3. View: Latency (should be <1ms)

### Logs

**Real-time Logs (Main Worker)**:
```bash
wrangler tail inference-ui-api
```

**Real-time Logs (Streaming Worker)**:
```bash
wrangler tail inference-ui-streaming --config wrangler-streaming.toml
```

**Both Workers**:
```bash
# Terminal 1
wrangler tail inference-ui-api

# Terminal 2
wrangler tail inference-ui-streaming --config wrangler-streaming.toml
```

## Troubleshooting

### Service Binding Not Found

**Error**: `Service binding STREAMING not found`

**Solution**:
1. Deploy streaming worker first: `npm run deploy:streaming`
2. Verify it's deployed: `wrangler deployments list inference-ui-streaming`
3. Then deploy main worker: `npm run deploy`

### 404 on Streaming Endpoints

**Error**: `404 Not Found` on `/stream/chat`

**Check**:
1. Main worker routes correctly to streaming worker
2. Streaming worker endpoints match: `/chat`, `/completion`, `/object`
3. Service binding configured in `wrangler.toml`

**Test Direct**:
```bash
# Test streaming worker directly (should work)
curl https://inference-ui-streaming.neureus.workers.dev/chat

# Test via main worker (should also work)
curl https://inference-ui-api.neureus.workers.dev/stream/chat
```

### Workers AI Quota Exceeded

**Error**: `Workers AI quota exceeded`

**Solution**:
1. Check usage: Cloudflare Dashboard → Workers AI
2. Upgrade plan if needed
3. Implement caching in KV to reduce AI calls

### Service Binding Latency Issues

**Expected**: <1ms
**If Higher**:
1. Check if workers are in same region
2. Verify both workers are warm
3. Check Cloudflare status page

## Performance Expectations

### Latency

**Before** (HTTP calls between workers):
- Network latency: 50-100ms
- TLS handshake: 20-50ms
- DNS lookup: 10-30ms
- **Total**: 80-180ms overhead

**After** (Service Bindings):
- Service binding call: <1ms
- **Total**: <1ms overhead

### Cost Savings

**Example**: 1M streaming requests/month

**Without Service Bindings**:
- Main worker: 1M requests × $0.50/M = $0.50
- Streaming worker: 1M requests × $0.50/M = $0.50
- **Total**: $1.00/month

**With Service Bindings**:
- Main worker: 1M requests × $0.50/M = $0.50
- Streaming worker: 0 requests (service bindings free!)
- **Total**: $0.50/month

**Savings**: 50% reduction in request costs

## Rollback Plan

### If Issues Occur Post-Deployment

**1. Quick Rollback to Previous Version**:
```bash
# Check deployments
wrangler deployments list inference-ui-api

# Rollback to previous deployment
wrangler rollback inference-ui-api --message "Rollback due to service binding issues"
```

**2. Emergency: Disable Service Bindings**:

If service bindings cause issues, you can temporarily revert to direct handlers:

1. Edit `src/index.ts`:
   ```typescript
   // Comment out service binding call
   // return await env.STREAMING.fetch(streamUrl, ...);

   // Temporarily use direct handlers
   import { handleStreamChat } from './workers/stream-chat';
   return await handleStreamChat(request, env);
   ```

2. Deploy: `npm run deploy`

3. Fix streaming worker issues

4. Re-enable service bindings

## Best Practices

### Development

1. **Always test locally first** with both workers running
2. **Test service bindings** before deploying to production
3. **Monitor logs** during and after deployment
4. **Deploy during low-traffic periods** to minimize impact

### Production

1. **Deploy streaming worker first** (always!)
2. **Verify streaming worker** before deploying main worker
3. **Monitor metrics** for first hour post-deployment
4. **Have rollback plan ready** before deployment
5. **Test critical paths** immediately after deployment

### Scaling

1. **Independent scaling** - Each worker scales separately
2. **Monitor CPU time** per worker
3. **Use KV caching** in streaming worker to reduce AI calls
4. **Set appropriate timeouts** for long-running streams

## Support

### Cloudflare Community

- Forum: https://community.cloudflare.com/
- Discord: https://discord.gg/cloudflaredev
- Documentation: https://developers.cloudflare.com/workers/

### Project Support

- GitHub Issues: https://github.com/Neureus/Inference-UI/issues
- Documentation: https://docs.inference-ui.dev

---

**Last Updated**: October 17, 2025
**Architecture Version**: Service Bindings v1 + Smart Placement
