# Authentication & Tenant Identification

## Overview

Inference UI uses **API key-based authentication** to identify tenants (users/customers) for all SDK requests. This ensures proper usage tracking, tier limit enforcement, and data isolation in our multi-tenant SaaS platform.

**Status**: ✅ Deployed to production (https://inference-ui-api.finhub.workers.dev)

## How Tenant Identification Works

```
Client SDK → API Key in Headers → Validate Key → Extract User ID → Service Binding with Context
```

### 1. Client Includes API Key

SDKs include the API key in every request:

```typescript
// React SDK
import { InferenceUIProvider } from 'inference-ui-react';

<InferenceUIProvider
  config={{
    apiKey: 'sk_live_abc123...',  // ← Tenant identifier
    apiUrl: 'https://inference-ui-api.finhub.workers.dev'
  }}
>
  <App />
</InferenceUIProvider>
```

```typescript
// React Native SDK
import { EventProvider } from 'inference-ui-events';

<EventProvider
  endpoint="https://inference-ui-api.finhub.workers.dev/events"
  apiKey="sk_live_abc123..."  // ← Tenant identifier
>
  <App />
</EventProvider>
```

### 2. Main Worker Validates API Key

```typescript
// Main API Worker (public HTTP endpoint)
import { requireAuth } from './auth/middleware';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Extract and validate API key from headers
    const authResult = await requireAuth(request, env);

    // If invalid, return 401
    if (authResult instanceof Response) {
      return authResult;
    }

    // Valid authentication context
    const { userId, tier } = authResult;

    // Now we know which tenant this is!
    console.log(`Request from user ${userId} (${tier} tier)`);

    // ...route to service binding with user context
  }
};
```

### 3. Pass User Context to Service Binding

```typescript
// Call inference service with user context
const response = await env.INFERENCE.processEvents({
  events: batchEvents,
  userId: authResult.userId,  // ← Tenant context
});

// Service binding receives user ID
// Can enforce tier limits, track usage, isolate data
```

## API Key Format

**Production Keys**:
```
sk_live_xxxxxxxxxxxxxxxxxxxxx
```

**Development Keys**:
```
sk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Components**:
- `sk` = secret key
- `live`/`test` = environment
- `xxx...` = 32 random characters

## Authentication Headers

SDKs can use multiple header formats:

### Authorization Header (Recommended)
```http
Authorization: Bearer sk_live_abc123...
```

### X-API-Key Header
```http
X-API-Key: sk_live_abc123...
```

### Custom Header
```http
x-inference-key: sk_live_abc123...
```

### Query Parameter (Development Only)
```
https://api.inference-ui.dev/events?api_key=sk_test_abc123
```
⚠️ **Not recommended for production** (keys visible in logs)

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Client SDK sends request with API key                    │
│    POST /events                                              │
│    Authorization: Bearer sk_live_abc123...                   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Main API Worker extracts API key                         │
│    - Check Authorization header                              │
│    - Check X-API-Key header                                  │
│    - Check custom headers                                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Validate API key (with caching)                          │
│    - Check KV cache (fast: <1ms)                            │
│    - If not cached, query D1 database                       │
│    - Hash key with SHA-256                                   │
│    - Look up in api_keys table                              │
│    - Join with users table to get tier                      │
│    - Check if revoked or expired                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Return authentication context                            │
│    {                                                          │
│      userId: 'user-123',                                     │
│      tier: 'business',                                       │
│      apiKey: 'sk_live_...',                                  │
│      isAuthenticated: true                                   │
│    }                                                          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Pass user context to service bindings                    │
│    await env.INFERENCE.processEvents({                       │
│      events: [...],                                          │
│      userId: 'user-123'  ← Tenant identified!               │
│    });                                                        │
└──────────────────────────────────────────────────────────────┘
```

## Database Schema

### api_keys Table

```sql
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  key_hash TEXT NOT NULL UNIQUE,  -- SHA-256 hash (never store raw keys!)
  key_prefix TEXT NOT NULL,       -- First 12 chars for display (sk_live_abc1)
  name TEXT,                       -- Human-readable name ("Production API", "iOS App")
  last_used_at INTEGER,            -- Timestamp of last use
  expires_at INTEGER,              -- Optional expiration timestamp
  revoked_at INTEGER,              -- Timestamp when revoked (NULL = active)
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
```

### users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  tier TEXT CHECK(tier IN ('free', 'developer', 'business', 'enterprise')),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

## Security Features

### 1. Never Store Raw API Keys

```typescript
// ❌ WRONG - Never store raw keys
await db.insert({ user_id, api_key: 'sk_live_abc123...' });

// ✅ CORRECT - Hash keys before storage
const keyHash = hashApiKey('sk_live_abc123...');
await db.insert({ user_id, key_hash: keyHash });
```

### 2. Use KV Cache to Prevent Database Hammering

```typescript
// Check cache first (fast: <1ms)
const cached = await env.KV.get(`api_key:${apiKey}`);
if (cached) {
  return JSON.parse(cached);
}

// Cache miss: query database (slow: ~50ms)
const result = await env.DB.query(...);

// Cache for 5 minutes
await env.KV.put(`api_key:${apiKey}`, JSON.stringify(result), {
  expirationTtl: 300
});
```

### 3. Key Rotation

Users can create multiple API keys and revoke old ones:

```typescript
// Create new key
const { apiKey, keyPrefix } = await createApiKey(
  userId,
  'New Production Key',
  env
);

// Revoke old key
await revokeApiKey(oldApiKey, env);
```

### 4. Expiration Support

Keys can have expiration dates:

```typescript
// Create key that expires in 90 days
const { apiKey } = await createApiKey(
  userId,
  'Temporary Key',
  env,
  90  // expires in 90 days
);
```

## Tier-Based Access Control

After authentication, enforce tier limits:

```typescript
import { requireTier } from './auth/middleware';

// Require business tier for advanced analytics
const tierCheck = requireTier(authContext, 'business');
if (tierCheck instanceof Response) {
  return tierCheck;  // 403 Forbidden
}

// User has business tier, proceed
const analytics = await env.INFERENCE.getAnalytics({
  type: 'funnels',
  userId: authContext.userId
});
```

## Error Responses

### 401 Unauthorized (No or Invalid API Key)

```json
{
  "error": "Unauthorized",
  "message": "Valid API key required. Include your API key in the Authorization header: \"Bearer sk_xxx\"",
  "docs": "https://inference-ui.dev/docs/authentication"
}
```

### 403 Forbidden (Insufficient Tier)

```json
{
  "error": "Forbidden",
  "message": "This feature requires business tier or higher. Current tier: developer",
  "currentTier": "developer",
  "requiredTier": "business",
  "upgradeUrl": "https://inference-ui.dev/pricing"
}
```

## API Key Management Endpoints

### Create API Key (GraphQL)

```graphql
mutation {
  createApiKey(input: {
    name: "Production API"
    expiresInDays: 90
  }) {
    apiKey          # Only shown once! Store securely.
    keyPrefix       # sk_live_abc1 (for display)
    createdAt
    expiresAt
  }
}
```

### List API Keys

```graphql
query {
  apiKeys {
    keyPrefix       # sk_live_abc1
    name            # "Production API"
    lastUsedAt
    expiresAt
    revokedAt
  }
}
```

### Revoke API Key

```graphql
mutation {
  revokeApiKey(keyPrefix: "sk_live_abc1") {
    success
  }
}
```

## Integration with SDKs

### React Web

```typescript
import { InferenceUIProvider } from 'inference-ui-react';

<InferenceUIProvider
  config={{
    apiKey: process.env.NEXT_PUBLIC_INFERENCE_API_KEY,  // From env
  }}
>
  <App />
</InferenceUIProvider>
```

The provider automatically includes the API key in all requests:

```typescript
// Internally, useChat adds Authorization header
const { messages, append } = useChat();  // ← API key included automatically
```

### React Native

```typescript
import { EventProvider } from 'inference-ui-events';

<EventProvider
  endpoint="https://inference-ui-api.finhub.workers.dev/events"
  apiKey={Config.INFERENCE_API_KEY}  // From react-native-config
>
  <App />
</EventProvider>
```

## Performance

**With KV Cache**:
- API key validation: <1ms (cache hit)
- Total request overhead: ~2ms

**Without Cache** (cold start):
- API key validation: ~50ms (D1 query)
- Total request overhead: ~60ms

**Cache Hit Rate**: ~95% (5-minute TTL)

## Multi-Tenancy Benefits

With API key authentication, we achieve:

1. **User Identification**: Know which tenant every request belongs to
2. **Usage Tracking**: Track events, AI requests, flows per user
3. **Tier Limits**: Enforce limits based on subscription tier
4. **Data Isolation**: Each user's data stays separate
5. **Billing**: Accurate usage-based billing per tenant
6. **Analytics**: Per-tenant analytics and dashboards
7. **Rate Limiting**: Per-tenant rate limits (not global)
8. **Security**: Each tenant has their own API keys

## Best Practices

1. **Never commit API keys to git** - Use environment variables
2. **Rotate keys regularly** - Create new keys, revoke old ones
3. **Use different keys per environment** - Test keys for dev, live keys for prod
4. **Monitor key usage** - Alert on suspicious patterns
5. **Set expiration dates** - Especially for temporary/contractor access
6. **Name your keys** - "iOS Production", "Web App Dev", etc.
7. **Revoke immediately** - If a key is compromised
8. **Use HTTPS only** - Never send keys over unencrypted connections

## Migration Path

For existing deployments without authentication:

1. **Add authentication middleware** - Install auth system
2. **Create default API keys** - Generate keys for existing users
3. **Update SDK packages** - Add apiKey prop support
4. **Deploy with grace period** - Allow unauthenticated requests initially
5. **Notify users** - Email users with their API keys
6. **Enable enforcement** - Require authentication after grace period

## References

- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys-best-practices)
- [Multi-Tenant SaaS Patterns](https://aws.amazon.com/blogs/apn/saas-tenant-isolation-strategies/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/kv/)
