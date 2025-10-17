# PersonQL Service Bindings API

Complete guide for using PersonQL via Cloudflare Service Bindings for direct access without HTTP calls.

## Overview

PersonQL Service Bindings provide a high-performance API for accessing PersonQL functionality directly from other Cloudflare Workers. By using service bindings instead of HTTP calls, you get:

- **🚀 0ms Latency** - Direct worker-to-worker calls with no network overhead
- **💰 Zero Request Costs** - Service binding calls are free (no request fees)
- **🔒 Enhanced Security** - Internal-only communication, no public endpoints
- **⚡ Type Safety** - Full TypeScript support with compile-time checks
- **🎯 Simplified Architecture** - No need for API keys, authentication, or HTTP clients

## Architecture

```
Your Worker → Service Binding (0ms) → PersonQL Worker
                                           ↓
                                    D1, KV, R2, Workers AI
```

## Quick Start

### 1. Configure Service Binding

Add PersonQL service binding to your `wrangler.toml`:

```toml
[[services]]
binding = "PERSONQL"
service = "personql-service"
environment = "production"
```

### 2. Define Types

```typescript
import type {
  PersonQLQueryRequest,
  PersonQLDirectRequest,
  PersonQLAIRequest,
  PersonQLCacheRequest,
} from '@inference-ui/cloudflare/src-personql/types';

interface Env {
  PERSONQL: {
    query(request: PersonQLQueryRequest): Promise<Response>;
    direct(request: PersonQLDirectRequest): Promise<Response>;
    enrich(request: PersonQLAIRequest): Promise<Response>;
    cache(request: PersonQLCacheRequest): Promise<Response>;
    health(): Promise<Response>;
  };
}
```

### 3. Use PersonQL

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Query PersonQL via service binding
    const response = await env.PERSONQL.query({
      query: 'query { person(id: "123") { id name email } }',
    });

    const result = await response.json();
    return new Response(JSON.stringify(result));
  },
};
```

## API Reference

### 1. GraphQL Query API

Execute GraphQL queries against PersonQL.

**Method**: `env.PERSONQL.query(request)`

**Request**:
```typescript
interface PersonQLQueryRequest {
  query: string;                          // GraphQL query string
  variables?: Record<string, unknown>;    // Query variables
  operationName?: string;                 // Operation name
  context?: {
    userId?: string;
    tenantId?: string;
    permissions?: string[];
    metadata?: Record<string, unknown>;
  };
}
```

**Example**:
```typescript
const response = await env.PERSONQL.query({
  query: `
    query GetPerson($id: ID!) {
      person(id: $id) {
        id
        name
        email
        metadata
        createdAt
      }
    }
  `,
  variables: { id: '123' },
  context: {
    userId: 'current-user',
    tenantId: 'tenant-123',
  },
});

const result = await response.json();
console.log(result.data.person);
```

**Response**:
```typescript
interface PersonQLQueryResponse {
  data?: unknown;                         // Query result data
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
  metadata?: {
    executionTime?: number;
    cacheHit?: boolean;
    source?: 'database' | 'cache' | 'ai';
  };
}
```

### 2. Direct Access API

Bypass GraphQL for direct database operations (faster, simpler).

**Method**: `env.PERSONQL.direct(request)`

**Request**:
```typescript
interface PersonQLDirectRequest {
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  entity: 'person' | 'organization' | 'relationship' | 'event';
  params: {
    id?: string;
    ids?: string[];
    filter?: Record<string, unknown>;
    limit?: number;
    offset?: number;
    data?: Record<string, unknown>;
  };
  context?: {
    userId?: string;
    tenantId?: string;
  };
}
```

**Examples**:

**Get Single Person**:
```typescript
const response = await env.PERSONQL.direct({
  operation: 'get',
  entity: 'person',
  params: { id: '123' },
});

const result = await response.json();
if (result.success) {
  console.log(result.data); // Person object
}
```

**List Persons with Filter**:
```typescript
const response = await env.PERSONQL.direct({
  operation: 'list',
  entity: 'person',
  params: {
    filter: {
      email: 'user@example.com',
    },
    limit: 10,
    offset: 0,
  },
});

const result = await response.json();
console.log(result.data);         // Array of persons
console.log(result.metadata.totalCount);
console.log(result.metadata.hasMore);
```

**Create Person**:
```typescript
const response = await env.PERSONQL.direct({
  operation: 'create',
  entity: 'person',
  params: {
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      metadata: {
        source: 'api',
        tags: ['customer', 'premium'],
      },
    },
  },
  context: {
    userId: 'admin',
  },
});

const result = await response.json();
console.log(result.data.id); // New person ID
```

**Update Person**:
```typescript
const response = await env.PERSONQL.direct({
  operation: 'update',
  entity: 'person',
  params: {
    id: '123',
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
    },
  },
});
```

**Delete Person**:
```typescript
const response = await env.PERSONQL.direct({
  operation: 'delete',
  entity: 'person',
  params: { id: '123' },
});
```

**Response**:
```typescript
interface PersonQLDirectResponse {
  success: boolean;
  data?: unknown | unknown[];
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    count?: number;
    totalCount?: number;
    hasMore?: boolean;
    executionTime?: number;
  };
}
```

### 3. AI Enrichment API

Use Workers AI to enrich person data with insights, recommendations, and classifications.

**Method**: `env.PERSONQL.enrich(request)`

**Request**:
```typescript
interface PersonQLAIRequest {
  type: 'profile' | 'insights' | 'recommendations' | 'classification';
  person: string | Partial<Person>;     // Person ID or inline data
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    includeConfidence?: boolean;
  };
}
```

**Examples**:

**Generate Insights**:
```typescript
const response = await env.PERSONQL.enrich({
  type: 'insights',
  person: '123',
  options: {
    model: '@cf/meta/llama-3.1-8b-instruct',
    includeConfidence: true,
  },
});

const result = await response.json();
console.log(result.data.insights);    // Array of insights
console.log(result.data.confidence);  // 0.8
```

**Generate Recommendations**:
```typescript
const response = await env.PERSONQL.enrich({
  type: 'recommendations',
  person: {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    metadata: {
      industry: 'technology',
    },
  },
});

const result = await response.json();
console.log(result.data.recommendations);
```

**Classify Person**:
```typescript
const response = await env.PERSONQL.enrich({
  type: 'classification',
  person: '123',
});

const result = await response.json();
console.log(result.data.classification);
// { industry: 1.0, professional: 0.9, consumer: 0.8 }
```

**Response**:
```typescript
interface PersonQLAIResponse {
  success: boolean;
  data?: {
    insights?: string[];
    recommendations?: string[];
    classification?: Record<string, number>;
    confidence?: number;
  };
  error?: {
    message: string;
    code: string;
  };
}
```

### 4. Cache API

High-performance KV cache operations.

**Method**: `env.PERSONQL.cache(request)`

**Request**:
```typescript
interface PersonQLCacheRequest {
  operation: 'get' | 'set' | 'delete' | 'clear';
  key: string;
  value?: unknown;           // For 'set' operation
  ttl?: number;              // TTL in seconds
}
```

**Examples**:

**Set Cache Value**:
```typescript
await env.PERSONQL.cache({
  operation: 'set',
  key: 'user:preferences:123',
  value: {
    theme: 'dark',
    language: 'en',
  },
  ttl: 3600, // 1 hour
});
```

**Get Cache Value**:
```typescript
const response = await env.PERSONQL.cache({
  operation: 'get',
  key: 'user:preferences:123',
});

const result = await response.json();
if (result.success && result.data) {
  console.log(result.data); // Cached value
}
```

**Delete Cache Value**:
```typescript
await env.PERSONQL.cache({
  operation: 'delete',
  key: 'user:preferences:123',
});
```

**Clear Cache by Prefix**:
```typescript
await env.PERSONQL.cache({
  operation: 'clear',
  key: 'user:preferences:', // Prefix
});
```

### 5. Health Check

**Method**: `env.PERSONQL.health()`

**Example**:
```typescript
const response = await env.PERSONQL.health();
const result = await response.json();
console.log(result.status); // 'healthy'
```

## Best Practices

### 1. Cache-First Pattern

Check cache before querying database:

```typescript
// Try cache first
const cacheResponse = await env.PERSONQL.cache({
  operation: 'get',
  key: `person:${userId}`,
});

const cached = await cacheResponse.json();

if (cached.data) {
  return new Response(JSON.stringify(cached.data));
}

// Fallback to database
const personResponse = await env.PERSONQL.direct({
  operation: 'get',
  entity: 'person',
  params: { id: userId },
});

const person = await personResponse.json();

// Cache for next time
ctx.waitUntil(
  env.PERSONQL.cache({
    operation: 'set',
    key: `person:${userId}`,
    value: person.data,
    ttl: 300,
  })
);
```

### 2. Background Processing

Use `ctx.waitUntil()` for non-critical operations:

```typescript
// Enrich in background
ctx.waitUntil(
  env.PERSONQL.enrich({
    type: 'insights',
    person: userId,
  })
);

// Return response immediately
return new Response(JSON.stringify(person));
```

### 3. Error Handling

Always check response status:

```typescript
const response = await env.PERSONQL.direct({
  operation: 'get',
  entity: 'person',
  params: { id: userId },
});

const result = await response.json();

if (!result.success) {
  return new Response(
    JSON.stringify({ error: result.error.message }),
    { status: 404 }
  );
}
```

### 4. Type Safety

Import types for compile-time checks:

```typescript
import type {
  PersonQLDirectRequest,
  PersonQLDirectResponse,
} from '@inference-ui/cloudflare/src-personql/types';

const request: PersonQLDirectRequest = {
  operation: 'get',
  entity: 'person',
  params: { id: '123' },
};

const response = await env.PERSONQL.direct(request);
const result: PersonQLDirectResponse = await response.json();
```

## Performance Comparison

### HTTP API vs Service Bindings

**HTTP API** (Traditional):
```
Your Worker → HTTP Request (50-100ms) → PersonQL Worker
    ↓                                         ↓
Cost: $0.50/M requests              Cost: $0.50/M requests
Total: $1.00/M requests
Latency: 50-100ms + processing
```

**Service Bindings** (PersonQL):
```
Your Worker → Service Binding (0ms) → PersonQL Worker
    ↓                                       ↓
Cost: $0.50/M requests              Cost: $0 (free!)
Total: $0.50/M requests (50% savings)
Latency: <1ms + processing
```

**Benefits**:
- **50% cost savings** - Service binding calls are free
- **50-100ms faster** - No network latency
- **Type-safe** - Compile-time checks
- **Simpler** - No HTTP client, auth, or retry logic needed

## Example Workflows

### Complete User Lookup Flow

```typescript
async function getUserProfile(userId: string, env: Env, ctx: ExecutionContext) {
  // 1. Check cache
  const cacheKey = `profile:${userId}`;
  const cacheResponse = await env.PERSONQL.cache({
    operation: 'get',
    key: cacheKey,
  });

  const cached = await cacheResponse.json();
  if (cached.data) {
    return { ...cached.data, source: 'cache' };
  }

  // 2. Get from database
  const personResponse = await env.PERSONQL.direct({
    operation: 'get',
    entity: 'person',
    params: { id: userId },
  });

  const personResult = await personResponse.json();

  if (!personResult.success) {
    throw new Error('Person not found');
  }

  const person = personResult.data;

  // 3. Enrich with AI (background)
  ctx.waitUntil(
    env.PERSONQL.enrich({
      type: 'insights',
      person: userId,
    })
  );

  // 4. Cache result
  ctx.waitUntil(
    env.PERSONQL.cache({
      operation: 'set',
      key: cacheKey,
      value: person,
      ttl: 300,
    })
  );

  return { ...person, source: 'database' };
}
```

## Deployment

### 1. Deploy PersonQL Worker

```bash
cd packages/@inference-ui/cloudflare
npm run deploy:personql
```

**Output**:
```
✔ Uploaded personql-service
✔ Deployed personql-service
  https://personql-service.finhub.workers.dev
```

### 2. Configure Consumer Worker

Add service binding to your `wrangler.toml`:

```toml
[[services]]
binding = "PERSONQL"
service = "personql-service"
environment = "production"
```

### 3. Deploy Consumer Worker

```bash
wrangler deploy
```

## Troubleshooting

### Service Binding Not Found

**Error**: `Service binding PERSONQL not found`

**Solution**:
1. Ensure PersonQL worker is deployed first
2. Check `wrangler.toml` has correct service name
3. Redeploy consumer worker

### Type Errors

**Error**: `Property 'PERSONQL' does not exist on type 'Env'`

**Solution**:
Import types and define Env interface:

```typescript
import type { ... } from '@inference-ui/cloudflare/src-personql/types';

interface Env {
  PERSONQL: { ... };
}
```

### Response Errors

**Issue**: Getting errors from PersonQL

**Debug**:
```typescript
const response = await env.PERSONQL.direct(...);
const result = await response.json();

if (!result.success) {
  console.error('PersonQL error:', result.error);
}
```

## Support

- **Documentation**: See examples in `examples/personql-consumer/`
- **Types**: Full TypeScript definitions in `src-personql/types/`
- **Issues**: Report issues to your development team

## Summary

PersonQL Service Bindings provide the fastest, cheapest, and simplest way to access PersonQL from other Cloudflare Workers:

✅ **0ms latency** - Direct worker-to-worker calls
✅ **50% cost savings** - Service bindings are free
✅ **Type-safe** - Full TypeScript support
✅ **Simple** - No HTTP client or auth needed
✅ **Flexible** - GraphQL, direct access, AI, and cache APIs

**Ready to get started?** See `examples/personql-consumer/` for complete working examples!

---

**Last Updated**: October 17, 2025
**Version**: v1.0.0
