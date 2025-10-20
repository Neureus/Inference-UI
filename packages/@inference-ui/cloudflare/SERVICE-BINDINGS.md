# Service Bindings Architecture

## Overview

Inference UI uses **Cloudflare Service Bindings** for worker-to-worker communication. This provides:

- **Direct RPC calls** (no HTTP overhead)
- **Type-safe** method calls with TypeScript
- **Lower latency** (<1ms vs ~50ms for HTTP fetch)
- **No serialization** overhead for simple types
- **Shared types** between workers

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Main API Worker (inference-ui-api)            │
│                                                          │
│  - GraphQL API (public HTTP endpoint)                   │
│  - Event ingestion (public HTTP endpoint)               │
│  - Streaming endpoints (public HTTP endpoints)          │
│  - Auth & routing logic                                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ env.INFERENCE.streamChat(request)                │   │
│  │ env.INFERENCE.processEvents(batch)               │   │
│  │ env.INFERENCE.getAnalytics(query)                │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Service Binding (RPC)
                         │ No HTTP, Direct Function Calls
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│      Inference Service Worker (inference-service)       │
│                                                          │
│  - AI inference (chat, completion, object)              │
│  - Event processing with AI enrichment                  │
│  - Analytics queries with caching                       │
│  - Usage metrics for tier limits                        │
│  - NOT exposed via HTTP routes                          │
│  - Called only via service bindings (RPC)               │
│                                                          │
│  Dependencies:                                           │
│  - Workers AI (Llama 3.1 8B)                            │
│  - D1 Database                                           │
│  - KV Cache                                              │
│  - Analytics Engine                                      │
│  - R2 Storage                                            │
└─────────────────────────────────────────────────────────┘
```

## Benefits vs HTTP Fetch

### HTTP Fetch (Traditional)
```typescript
// SLOW: HTTP overhead, serialization, network roundtrip
const response = await fetch('https://inference-service.workers.dev/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [...] })
});
const data = await response.json();
// ~50ms overhead + network latency
```

### Service Binding (Modern)
```typescript
// FAST: Direct function call, no HTTP, no serialization
const response = await env.INFERENCE.streamChat({
  messages: [...]
});
// <1ms overhead, type-safe
```

## Performance Comparison

| Method | Latency | Overhead | Type Safety |
|--------|---------|----------|-------------|
| HTTP fetch() | ~50ms | High (JSON serialization, HTTP headers) | No |
| Service Binding | <1ms | Minimal (direct call) | Yes ✅ |

**Result**: Service bindings are ~50x faster for worker-to-worker calls.

## Using Service Bindings

### 1. Define the Service Interface

```typescript
// workers/inference-service/index.ts
export interface InferenceService {
  streamChat(request: ChatRequest): Promise<Response>;
  processEvents(batch: EventBatchRequest): Promise<EventBatchResponse>;
  getAnalytics(query: AnalyticsRequest): Promise<AnalyticsResponse>;
}

export default class InferenceServiceWorker implements InferenceService {
  async streamChat(request: ChatRequest): Promise<Response> {
    // Implementation
  }
  // ...
}
```

### 2. Configure wrangler.toml

**Main Worker** (`wrangler.toml`):
```toml
name = "inference-ui-api"

# Bind to inference-service worker
[[services]]
binding = "INFERENCE"  # Access via env.INFERENCE
service = "inference-service"  # Worker name to bind to
```

**Service Worker** (`workers/inference-service/wrangler.toml`):
```toml
name = "inference-service"

# NO routes configured = not accessible via HTTP
# Only accessible via service bindings (RPC)
```

### 3. Add TypeScript Types

```typescript
// src/types.ts
import type { InferenceService } from '../workers/inference-service';

export interface Env {
  INFERENCE: Service<InferenceService>;  // Type-safe binding
  // ...
}

export type Service<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? (...args: Args) => Return
    : T[K];
};
```

### 4. Call Service Methods

```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Direct RPC call - type-safe, fast
    const response = await env.INFERENCE.streamChat({
      messages: [{ role: 'user', content: 'Hello!' }],
      userId: 'user-123',
    });

    return response;
  }
};
```

## Example Use Cases

### Streaming Chat
```typescript
// Main worker receives HTTP request
app.post('/stream/chat', async (req, res) => {
  const { messages } = req.body;

  // Direct RPC call to inference service
  const stream = await env.INFERENCE.streamChat({
    messages,
    userId: req.user?.id,
  });

  // Return stream to client
  return stream;
});
```

### Batch Event Processing
```typescript
// Main worker receives batch events
app.post('/events', async (req, res) => {
  const events = req.body;

  // Direct RPC call to process events
  const result = await env.INFERENCE.processEvents({
    events,
    userId: req.user?.id,
  });

  return Response.json(result);
});
```

### Analytics Queries
```typescript
// Main worker handles GraphQL query
const resolvers = {
  Query: {
    eventMetrics: async (_, { timeRange }, { env, userId }) => {
      // Direct RPC call to get analytics
      const result = await env.INFERENCE.getAnalytics({
        type: 'events',
        userId,
        startDate: timeRange.start,
        endDate: timeRange.end,
      });

      return result.data;
    },
  },
};
```

## Deployment

### Development
```bash
# Terminal 1: Deploy inference-service first
cd workers/inference-service
wrangler deploy

# Terminal 2: Deploy main API worker
cd ../..
wrangler deploy
```

### Production
```bash
# Deploy both workers to production
wrangler deploy --env production
```

## Smart Placement

Service bindings work best with **Smart Placement** enabled:

```toml
# wrangler.toml
[placement]
mode = "smart"
```

This automatically:
- Places workers near their dependencies (D1, R2, KV)
- Minimizes latency for service bindings
- Co-locates workers that communicate frequently

## Security Benefits

### HTTP Approach (Public)
```
Internet → Main Worker → HTTP fetch → Inference Worker
                          ↑
                     Must be public route
                     Needs auth/rate limiting
                     Exposed to internet
```

### Service Binding Approach (Private)
```
Internet → Main Worker → RPC → Inference Worker
                         ↑
                    Private binding
                    Not exposed to internet
                    No auth needed (internal)
```

## Limitations

1. **Same Account**: Both workers must be in the same Cloudflare account
2. **Response Types**: Can return `Response`, `ReadableStream`, or JSON-serializable data
3. **No HTTP Features**: No cookies, headers (except in Response objects), CORS
4. **Deployment Order**: Service worker must be deployed before main worker

## Best Practices

1. **Keep Services Small**: One responsibility per service worker
2. **Use Types**: Share TypeScript interfaces for type safety
3. **Handle Errors**: Service calls can fail, handle gracefully
4. **Cache Results**: Use KV to cache expensive operations
5. **Monitor Performance**: Track service binding latency

## Debugging

### View Logs
```bash
# Inference service logs
wrangler tail inference-service

# Main worker logs
wrangler tail inference-ui-api
```

### Test RPC Calls
```bash
# Call via main worker HTTP endpoint (which uses RPC internally)
curl https://inference-ui-api.finhub.workers.dev/stream/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## Migration from HTTP to Service Bindings

### Before (HTTP Fetch)
```typescript
const response = await fetch('https://inference.workers.dev/chat', {
  method: 'POST',
  body: JSON.stringify({ messages }),
});
```

### After (Service Binding)
```typescript
const response = await env.INFERENCE.streamChat({ messages });
```

**Benefits**:
- ✅ 50x faster (~50ms → <1ms)
- ✅ Type-safe with IntelliSense
- ✅ No HTTP serialization overhead
- ✅ Private (not exposed to internet)
- ✅ No auth needed (internal only)

## References

- [Cloudflare Service Bindings Docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Smart Placement](https://developers.cloudflare.com/workers/configuration/smart-placement/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
