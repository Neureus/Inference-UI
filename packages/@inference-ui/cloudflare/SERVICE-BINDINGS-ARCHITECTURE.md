# Service Bindings Architecture

## Overview

Inference UI uses Cloudflare Service Bindings for efficient, secure worker-to-worker communication. Service bindings provide:

- **Zero latency** - Direct Worker-to-Worker calls with no network overhead
- **Type safety** - Full TypeScript support with typed bindings
- **Security** - Internal communication, never exposed to internet
- **No request limits** - Service binding calls don't count against request quotas
- **Cost effective** - No additional charges for inter-worker communication

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                     │
│              (React, React Native, Vue, etc.)               │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              inference-ui-api (Main Worker)                 │
│                                                             │
│  Routes:                                                    │
│  - /graphql          → GraphQL API                         │
│  - /events           → Event Ingestion                     │
│  - /stream/*         → Service Binding to Streaming Worker │
│  - /health           → Health Check                        │
│                                                             │
│  Bindings:                                                 │
│  - STREAMING         → Service Binding                     │
│  - DB                → D1 Database                         │
│  - KV                → KV Namespace                        │
│  - STORAGE           → R2 Bucket                           │
│  - ANALYTICS         → Analytics Engine                    │
└────────────────────┬────────────────────────────────────────┘
                     │ Service Binding (internal)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         inference-ui-streaming (Streaming Worker)           │
│                                                             │
│  Routes:                                                    │
│  - /chat             → Streaming chat responses            │
│  - /completion       → Text completion streaming           │
│  - /object           → Object generation streaming         │
│                                                             │
│  Bindings:                                                 │
│  - AI                → Workers AI (Llama, Mistral, etc.)   │
│  - KV                → KV Namespace (caching)              │
│  - DB                → D1 Database (analytics)             │
│  - ANALYTICS         → Analytics Engine (metrics)          │
└─────────────────────────────────────────────────────────────┘
```

## Worker Responsibilities

### Main API Worker (`inference-ui-api`)

**Purpose**: Entry point for all client requests, handles business logic

**Responsibilities**:
- GraphQL API with D1 queries
- Event ingestion with batch processing
- User authentication and authorization
- Rate limiting and request validation
- Routes streaming requests to streaming worker via service binding

**Bindings**:
- `STREAMING` (Service Binding) → Streaming worker
- `DB` (D1) → Database for users, flows, events
- `KV` (KV Namespace) → Caching and sessions
- `STORAGE` (R2) → Object storage for assets
- `ANALYTICS` (Analytics Engine) → Event data

### Streaming Worker (`inference-ui-streaming`)

**Purpose**: Handles all AI streaming responses with Workers AI

**Responsibilities**:
- Chat streaming with Llama 3.1 8B
- Text completion streaming
- Object generation with JSON streaming
- AI inference optimization and caching
- Token streaming with SSE protocol

**Bindings**:
- `AI` (Workers AI) → GPU-powered AI inference
- `KV` (KV Namespace) → Response caching
- `DB` (D1) → Usage tracking
- `ANALYTICS` (Analytics Engine) → Performance metrics

## Service Binding Benefits

### 1. Performance
- **0ms network latency** - Direct in-process calls
- **No DNS lookups** - Internal routing
- **No TLS handshake** - Secure by default
- **Shared memory** - Efficient data passing

### 2. Cost Savings
- **No request charges** - Service binding calls are free
- **No bandwidth costs** - Internal communication
- **Reduced cold starts** - Workers stay warm longer

### 3. Security
- **Never exposed to internet** - Internal only
- **No public endpoints** - Cannot be called directly
- **Isolated execution** - Separate CPU/memory limits
- **Type-safe contracts** - TypeScript interfaces

### 4. Scalability
- **Independent scaling** - Each worker scales separately
- **Resource isolation** - CPU/memory per worker
- **Fault isolation** - Failures don't cascade
- **Deployment independence** - Deploy workers separately

## Implementation

### wrangler.toml Configuration

**Main API Worker**:
```toml
name = "inference-ui-api"

# Service binding to streaming worker
[[services]]
binding = "STREAMING"
service = "inference-ui-streaming"
environment = "production"
```

**Streaming Worker**:
```toml
name = "inference-ui-streaming"

# No service bindings needed (leaf worker)
```

### TypeScript Types

```typescript
// Main API Worker Env
interface Env {
  // Service binding (typed)
  STREAMING: Fetcher;

  // Other bindings
  DB: D1Database;
  KV: KVNamespace;
  STORAGE: R2Bucket;
  ANALYTICS: AnalyticsEngineDataset;
}

// Usage
const response = await env.STREAMING.fetch(request);
```

### Request Flow Example

**Client Request**:
```
POST https://inference-ui-api.neureus.workers.dev/stream/chat
```

**Main API Worker**:
```typescript
// Route to streaming worker via service binding
case path.startsWith('/stream/'):
  const streamPath = path.replace('/stream', '');
  const streamUrl = new URL(streamPath, request.url);

  // Forward to streaming worker (0ms latency)
  return await env.STREAMING.fetch(streamUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
```

**Streaming Worker**:
```typescript
// Handle the request
case path === '/chat':
  return await handleStreamChat(request, env);
```

## Migration Plan

### Phase 1: Create Streaming Worker
1. Create `src-streaming/` directory
2. Move streaming handlers (chat, completion, object)
3. Create streaming worker entry point
4. Add streaming worker wrangler.toml

### Phase 2: Update Main Worker
1. Remove streaming handlers from main worker
2. Add service binding configuration
3. Update routing to forward to streaming worker
4. Update type definitions

### Phase 3: Testing
1. Test locally with `wrangler dev`
2. Test service binding communication
3. Verify performance improvements
4. Load testing with production traffic

### Phase 4: Deployment
1. Deploy streaming worker first
2. Deploy main worker with service binding
3. Verify health checks
4. Monitor metrics

## Performance Expectations

### Before (HTTP Calls)
- **Latency**: 50-100ms (network + TLS + DNS)
- **Cost**: 2 requests per streaming call
- **Reliability**: Network failures possible

### After (Service Bindings)
- **Latency**: <1ms (in-process call)
- **Cost**: 1 request total (binding call is free)
- **Reliability**: 99.99% (no network failures)

## Monitoring

### Metrics to Track
- Service binding call latency (should be <1ms)
- Streaming worker response times
- Error rates per worker
- CPU/memory usage per worker
- Cold start frequencies

### Cloudflare Dashboard
- Worker → Analytics → Service Bindings
- View call rates and latencies
- Monitor error rates
- Track CPU time per worker

## Future Enhancements

### Additional Workers

**Event Processing Worker** (`inference-ui-events`):
- Async event processing
- AI enrichment in background
- Batch analytics aggregation

**Analytics Worker** (`inference-ui-analytics`):
- Real-time dashboard queries
- Metrics aggregation
- Report generation

### Service Binding Graph
```
Main API
  ├─► Streaming Worker
  ├─► Event Processing Worker
  └─► Analytics Worker

Event Processing Worker
  └─► Streaming Worker (for AI enrichment)
```

## Best Practices

1. **Keep workers focused** - Single responsibility per worker
2. **Use typed bindings** - TypeScript interfaces for all service calls
3. **Handle errors gracefully** - Fallback to direct calls if needed
4. **Cache responses** - Use KV to cache AI responses
5. **Monitor performance** - Track latency and error rates
6. **Version APIs** - Use versioned routes for breaking changes
7. **Test locally** - Use `wrangler dev` with `--local` flag
8. **Deploy atomically** - Deploy all dependent workers together

## Cost Analysis

### Example: 10M requests/month

**Without Service Bindings** (all in one worker):
- 10M requests × $0.50/M = $5.00
- CPU time: $0.02/ms × usage
- Total: ~$15-25/month

**With Service Bindings** (2 workers):
- Main API: 10M requests × $0.50/M = $5.00
- Streaming: 0 requests (service bindings free!)
- CPU time: $0.02/ms × usage (same)
- Total: ~$5-10/month

**Savings**: 40-60% reduction in request costs

## References

- [Cloudflare Service Bindings Docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)

---

**Last Updated**: October 16, 2025
**Status**: Design Complete, Implementation In Progress
