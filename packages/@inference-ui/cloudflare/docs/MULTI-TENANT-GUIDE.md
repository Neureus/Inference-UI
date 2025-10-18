# Multi-Tenant Architecture with Service Bindings

> **Complete guide to implementing multi-tenant applications with Inference UI service bindings**

## Table of Contents

- [Overview](#overview)
- [Tenant Identification Methods](#tenant-identification-methods)
- [Implementation Patterns](#implementation-patterns)
- [Complete Examples](#complete-examples)
- [Security Considerations](#security-considerations)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

---

## Overview

### The Challenge

With **HTTP APIs**, tenant identification is straightforward:
```typescript
// HTTP - Tenant ID in headers
fetch('https://api.example.com/graphql', {
  headers: {
    'X-Tenant-ID': 'tenant_123',
    'Authorization': 'Bearer token...'
  }
});
```

With **Service Bindings**, there are no HTTP headers! Requests are direct RPC calls:
```typescript
// Service Bindings - No headers!
await env.INFERENCE_UI.graphql({
  query: '...'
});
// ❓ Where does tenant ID go?
```

### The Solution

**Pass tenant context in the request payload**, not headers:

```typescript
await env.INFERENCE_UI.graphql({
  query: '...',
  context: {
    tenantId: 'tenant_123',    // ← Tenant identification
    userId: 'user_456',
    sessionId: 'sess_789'
  }
});
```

---

## Tenant Identification Methods

### Method 1: Context Object (Recommended)

**Best for**: SaaS applications, multi-org platforms

Every request includes a `context` object with tenant information:

```typescript
interface TenantContext {
  tenantId: string;           // Organization/tenant ID
  userId?: string;            // User within tenant
  sessionId?: string;         // Session ID
  metadata?: {
    role?: string;            // User role in tenant
    permissions?: string[];   // Tenant-specific permissions
  };
}

// In every request
await env.INFERENCE_UI.graphql({
  query: '...',
  context: {
    tenantId: 'org_acme_corp',
    userId: 'user_123',
    metadata: {
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    }
  }
});
```

**Advantages**:
✅ Explicit and clear
✅ Type-safe with TypeScript
✅ No additional infrastructure needed
✅ Easy to audit and log

**Implementation**:
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Extract tenant from request (header, subdomain, JWT, etc.)
    const tenantId = extractTenantId(request);
    const userId = extractUserId(request);

    // Include in all Inference UI calls
    const response = await env.INFERENCE_UI.graphql({
      query: '...',
      context: {
        tenantId,
        userId,
        sessionId: request.headers.get('X-Session-ID')
      }
    });

    return response;
  }
};

function extractTenantId(request: Request): string {
  // Option A: From subdomain
  const url = new URL(request.url);
  const subdomain = url.hostname.split('.')[0];
  if (subdomain !== 'www') return `tenant_${subdomain}`;

  // Option B: From custom header
  const header = request.headers.get('X-Tenant-ID');
  if (header) return header;

  // Option C: From JWT token
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (token) {
    const decoded = decodeJWT(token);
    return decoded.tenantId;
  }

  throw new Error('Tenant ID not found');
}
```

---

### Method 2: Event Metadata

**Best for**: Event tracking, analytics

Include tenant information in event metadata:

```typescript
await env.INFERENCE_UI.ingestEvent({
  type: 'button_click',
  data: {
    buttonId: 'signup-cta',
    label: 'Get Started'
  },
  userId: 'user_123',
  metadata: {
    tenantId: 'org_acme_corp',        // ← Tenant in metadata
    organizationName: 'Acme Corp',
    plan: 'enterprise',
    region: 'us-east-1'
  }
});
```

**Query by tenant**:
```typescript
const response = await env.INFERENCE_UI.graphql({
  query: `
    query GetTenantEvents($tenantId: ID!) {
      events(
        filter: {
          metadata: { tenantId: $tenantId }
        }
        limit: 100
      ) {
        id
        type
        timestamp
      }
    }
  `,
  variables: { tenantId: 'org_acme_corp' }
});
```

---

### Method 3: Separate Service Bindings Per Tenant (Enterprise)

**Best for**: Large enterprises, strict data isolation

Configure separate Inference UI deployments per major tenant:

```toml
# wrangler.toml

# Tenant A binding
[[services]]
binding = "INFERENCE_UI_TENANT_A"
service = "inference-ui-tenant-a"
environment = "production"

# Tenant B binding
[[services]]
binding = "INFERENCE_UI_TENANT_B"
service = "inference-ui-tenant-b"
environment = "production"
```

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const tenantId = extractTenantId(request);

    // Route to tenant-specific binding
    let inferenceUI;
    switch (tenantId) {
      case 'tenant_a':
        inferenceUI = env.INFERENCE_UI_TENANT_A;
        break;
      case 'tenant_b':
        inferenceUI = env.INFERENCE_UI_TENANT_B;
        break;
      default:
        inferenceUI = env.INFERENCE_UI; // Default/shared
    }

    const response = await inferenceUI.graphql({
      query: '...'
    });

    return response;
  }
};
```

**Advantages**:
✅ Complete data isolation
✅ Independent scaling per tenant
✅ Separate databases per tenant
✅ Compliance-ready (HIPAA, SOC2)

**Disadvantages**:
❌ More complex infrastructure
❌ Higher operational overhead
❌ Resource duplication

---

## Implementation Patterns

### Pattern 1: Middleware Approach

Create a wrapper that automatically includes tenant context:

```typescript
/**
 * Tenant-aware Inference UI client
 */
class TenantAwareInferenceUI {
  constructor(
    private inferenceUI: any,
    private tenantId: string,
    private userId?: string
  ) {}

  async graphql(request: any): Promise<Response> {
    return this.inferenceUI.graphql({
      ...request,
      context: {
        ...request.context,
        tenantId: this.tenantId,
        userId: this.userId
      }
    });
  }

  async ingestEvent(request: any): Promise<Response> {
    return this.inferenceUI.ingestEvent({
      ...request,
      metadata: {
        ...request.metadata,
        tenantId: this.tenantId
      }
    });
  }

  async ingestBatch(request: any): Promise<Response> {
    return this.inferenceUI.ingestBatch({
      ...request,
      events: request.events.map((event: any) => ({
        ...event,
        metadata: {
          ...event.metadata,
          tenantId: this.tenantId
        }
      })),
      metadata: {
        ...request.metadata,
        tenantId: this.tenantId
      }
    });
  }

  async health(): Promise<Response> {
    return this.inferenceUI.health();
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const tenantId = extractTenantId(request);
    const userId = extractUserId(request);

    // Create tenant-scoped client
    const inferenceUI = new TenantAwareInferenceUI(
      env.INFERENCE_UI,
      tenantId,
      userId
    );

    // All calls automatically include tenant context
    const response = await inferenceUI.graphql({
      query: '{ events { id } }'
      // tenantId automatically added!
    });

    return response;
  }
};
```

**Usage**:
```typescript
// Before: Manual tenant ID everywhere
await env.INFERENCE_UI.graphql({
  query: '...',
  context: { tenantId: 'org_123' }
});

// After: Automatic tenant ID
const inferenceUI = new TenantAwareInferenceUI(env.INFERENCE_UI, 'org_123');
await inferenceUI.graphql({ query: '...' });
```

---

### Pattern 2: Request Factory

Create a factory function that builds tenant-scoped requests:

```typescript
/**
 * Request factory with tenant context
 */
function createTenantRequest(tenantId: string, userId?: string) {
  return {
    graphql: (request: any) => ({
      ...request,
      context: {
        ...request.context,
        tenantId,
        userId
      }
    }),

    ingestEvent: (request: any) => ({
      ...request,
      metadata: {
        ...request.metadata,
        tenantId,
        organizationId: tenantId
      }
    }),

    ingestBatch: (request: any) => ({
      ...request,
      events: request.events.map((e: any) => ({
        ...e,
        metadata: { ...e.metadata, tenantId }
      })),
      metadata: {
        ...request.metadata,
        tenantId
      }
    })
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const tenantId = extractTenantId(request);
    const userId = extractUserId(request);

    // Create request factory
    const req = createTenantRequest(tenantId, userId);

    // Use factory to build requests
    const response = await env.INFERENCE_UI.graphql(
      req.graphql({
        query: '{ events { id } }'
      })
    );

    return response;
  }
};
```

---

### Pattern 3: Execution Context

Store tenant context in the Worker's execution context:

```typescript
interface AppContext {
  tenantId: string;
  userId: string;
  inferenceUI: TenantAwareInferenceUI;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Extract tenant info
    const tenantId = extractTenantId(request);
    const userId = extractUserId(request);

    // Create app context
    const appContext: AppContext = {
      tenantId,
      userId,
      inferenceUI: new TenantAwareInferenceUI(env.INFERENCE_UI, tenantId, userId)
    };

    // Route to handlers with context
    const url = new URL(request.url);
    switch (url.pathname) {
      case '/api/analytics':
        return handleAnalytics(request, appContext);
      case '/api/events':
        return handleEvents(request, appContext);
      default:
        return new Response('Not found', { status: 404 });
    }
  }
};

async function handleAnalytics(request: Request, ctx: AppContext): Promise<Response> {
  // Tenant ID already in context!
  const response = await ctx.inferenceUI.graphql({
    query: '{ events { id } }'
  });

  return response;
}
```

---

## Complete Examples

### Example 1: Multi-Tenant SaaS Application

```typescript
/**
 * Multi-Tenant SaaS Platform
 * Supports organizations with role-based access
 */

interface Env {
  INFERENCE_UI: any;
  DB: D1Database;
  JWT_SECRET: string;
}

interface JWTPayload {
  userId: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: string[];
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Authenticate and extract tenant context
    const jwt = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!jwt) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(jwt, env.JWT_SECRET);
    if (!payload) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create tenant-scoped client
    const inferenceUI = new TenantAwareInferenceUI(
      env.INFERENCE_UI,
      payload.organizationId,
      payload.userId
    );

    // Route requests
    switch (url.pathname) {
      case '/api/dashboard':
        return getDashboard(inferenceUI, payload);

      case '/api/analytics':
        return getAnalytics(inferenceUI, payload);

      case '/api/events':
        return ingestEvents(request, inferenceUI, payload);

      default:
        return new Response('Not found', { status: 404 });
    }
  }
};

/**
 * Get dashboard data for organization
 */
async function getDashboard(
  inferenceUI: TenantAwareInferenceUI,
  payload: JWTPayload
): Promise<Response> {
  // Query organization-specific data
  const [users, events, metrics] = await Promise.all([
    inferenceUI.graphql({
      query: `
        query GetOrgUsers {
          organization {
            users {
              id
              email
              role
              lastActive
            }
          }
        }
      `
    }),

    inferenceUI.graphql({
      query: `
        query GetOrgEvents {
          events(limit: 100) {
            id
            type
            timestamp
            userId
          }
        }
      `
    }),

    inferenceUI.graphql({
      query: `
        query GetOrgMetrics {
          metrics {
            activeUsers
            totalEvents
            avgSessionDuration
          }
        }
      `
    })
  ]);

  return Response.json({
    users: await users.json(),
    events: await events.json(),
    metrics: await metrics.json(),
    organization: {
      id: payload.organizationId,
      role: payload.role
    }
  });
}

/**
 * Ingest events with automatic tenant tagging
 */
async function ingestEvents(
  request: Request,
  inferenceUI: TenantAwareInferenceUI,
  payload: JWTPayload
): Promise<Response> {
  const events = await request.json();

  // Ingest with automatic tenant context
  const response = await inferenceUI.ingestBatch({
    events: events.map((event: any) => ({
      ...event,
      userId: payload.userId,
      // tenantId automatically added by wrapper
    }))
  });

  return response;
}

/**
 * JWT verification
 */
async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    // Use jose or similar library
    const decoded = await verifyToken(token, secret);
    return decoded as JWTPayload;
  } catch (error) {
    return null;
  }
}
```

---

### Example 2: Subdomain-Based Tenancy

```typescript
/**
 * Subdomain-based multi-tenancy
 * acme.app.com → tenant: acme
 * globex.app.com → tenant: globex
 */

interface Env {
  INFERENCE_UI: any;
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Extract tenant from subdomain
    const hostname = url.hostname;
    const subdomain = hostname.split('.')[0];

    // Validate tenant exists
    const tenant = await env.DB
      .prepare('SELECT * FROM tenants WHERE subdomain = ?')
      .bind(subdomain)
      .first();

    if (!tenant) {
      return Response.json({ error: 'Invalid tenant' }, { status: 404 });
    }

    // Create tenant-scoped client
    const inferenceUI = new TenantAwareInferenceUI(
      env.INFERENCE_UI,
      tenant.id,
      extractUserId(request)
    );

    // Handle request with tenant context
    switch (url.pathname) {
      case '/api/events':
        return handleEvents(request, inferenceUI, tenant);

      case '/api/analytics':
        return handleAnalytics(request, inferenceUI, tenant);

      default:
        return new Response('Not found', { status: 404 });
    }
  }
};

async function handleEvents(
  request: Request,
  inferenceUI: TenantAwareInferenceUI,
  tenant: any
): Promise<Response> {
  const events = await request.json();

  // Events automatically tagged with tenant
  await inferenceUI.ingestBatch({
    events: events.map((event: any) => ({
      ...event,
      metadata: {
        ...event.metadata,
        tenantSubdomain: tenant.subdomain,
        tenantName: tenant.name,
        tenantPlan: tenant.plan
      }
    }))
  });

  return Response.json({ success: true });
}
```

---

### Example 3: Data Isolation Verification

```typescript
/**
 * Verify tenant data isolation
 * Ensure users can only access their tenant's data
 */

interface Env {
  INFERENCE_UI: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const userTenantId = extractTenantId(request);
    const userId = extractUserId(request);

    // Query with tenant filter
    const response = await env.INFERENCE_UI.graphql({
      query: `
        query GetTenantData($tenantId: ID!, $userId: ID!) {
          # Only returns data for this tenant
          events(
            filter: {
              metadata: { tenantId: $tenantId }
              userId: $userId
            }
          ) {
            id
            type
            timestamp
          }
        }
      `,
      variables: {
        tenantId: userTenantId,
        userId
      },
      context: {
        tenantId: userTenantId,
        userId
      }
    });

    const data = await response.json();

    // Verify all returned data belongs to tenant
    const isIsolated = verifyDataIsolation(data, userTenantId);
    if (!isIsolated) {
      console.error('Data isolation breach detected!');
      return Response.json({ error: 'Security error' }, { status: 500 });
    }

    return Response.json(data);
  }
};

function verifyDataIsolation(data: any, tenantId: string): boolean {
  // Check that all events belong to the requesting tenant
  if (data.data?.events) {
    return data.data.events.every((event: any) =>
      event.metadata?.tenantId === tenantId
    );
  }
  return true;
}
```

---

## Security Considerations

### 1. Always Validate Tenant Access

```typescript
async function validateTenantAccess(
  userId: string,
  tenantId: string,
  env: Env
): Promise<boolean> {
  // Check user belongs to tenant
  const membership = await env.DB
    .prepare('SELECT * FROM tenant_users WHERE user_id = ? AND tenant_id = ?')
    .bind(userId, tenantId)
    .first();

  return !!membership;
}
```

### 2. Encrypt Tenant IDs in URLs

```typescript
// Don't expose raw tenant IDs
// ❌ Bad: /api/tenants/tenant_12345/analytics
// ✅ Good: /api/tenants/encrypted_abc123/analytics

function encryptTenantId(tenantId: string, secret: string): string {
  // Use encryption to hide actual tenant IDs
  return encrypt(tenantId, secret);
}
```

### 3. Audit Tenant Access

```typescript
async function auditTenantAccess(
  userId: string,
  tenantId: string,
  action: string,
  env: Env
): Promise<void> {
  await env.INFERENCE_UI.ingestEvent({
    type: 'tenant_access',
    data: {
      userId,
      tenantId,
      action,
      timestamp: Date.now()
    },
    metadata: {
      auditLog: true,
      severity: 'info'
    }
  });
}
```

### 4. Rate Limit Per Tenant

```typescript
async function checkTenantRateLimit(
  tenantId: string,
  env: Env
): Promise<boolean> {
  const key = `ratelimit:${tenantId}`;
  const count = await env.KV.get(key);

  if (count && parseInt(count) > 1000) {
    return false; // Rate limit exceeded
  }

  await env.KV.put(key, String((parseInt(count || '0') + 1)), {
    expirationTtl: 60 // 1 minute window
  });

  return true;
}
```

---

## Best Practices

### ✅ DO

1. **Always include tenant context**
   ```typescript
   await env.INFERENCE_UI.graphql({
     query: '...',
     context: { tenantId: 'org_123' }
   });
   ```

2. **Validate tenant access on every request**
   ```typescript
   const hasAccess = await validateTenantAccess(userId, tenantId, env);
   if (!hasAccess) return Response.json({ error: 'Forbidden' }, { status: 403 });
   ```

3. **Use wrapper classes for automatic context**
   ```typescript
   const inferenceUI = new TenantAwareInferenceUI(env.INFERENCE_UI, tenantId);
   ```

4. **Tag events with tenant metadata**
   ```typescript
   metadata: {
     tenantId: 'org_123',
     tenantName: 'Acme Corp',
     tenantPlan: 'enterprise'
   }
   ```

5. **Audit cross-tenant access attempts**
   ```typescript
   if (requestedTenant !== userTenant) {
     await auditSecurityEvent('cross_tenant_access_attempt', userId);
   }
   ```

### ❌ DON'T

1. **Don't trust client-provided tenant IDs**
   ```typescript
   // ❌ Bad: Accept tenant ID from request body
   const { tenantId } = await request.json();

   // ✅ Good: Extract from authenticated session
   const tenantId = extractTenantFromJWT(authToken);
   ```

2. **Don't skip tenant validation**
   ```typescript
   // ❌ Bad: Assume user has access
   const data = await env.INFERENCE_UI.graphql({ query });

   // ✅ Good: Validate first
   const hasAccess = await validateAccess(userId, tenantId);
   if (!hasAccess) throw new Error('Forbidden');
   ```

3. **Don't mix tenant data**
   ```typescript
   // ❌ Bad: Query without tenant filter
   query { events { id } }

   // ✅ Good: Always filter by tenant
   query { events(filter: { tenantId: "org_123" }) { id } }
   ```

4. **Don't log sensitive tenant data**
   ```typescript
   // ❌ Bad: Log everything
   console.log('User data:', userData);

   // ✅ Good: Log sanitized data
   console.log('User accessed tenant:', { tenantId, userId });
   ```

---

## Migration Guide

### From HTTP API to Service Bindings

**Before (HTTP with headers)**:
```typescript
const response = await fetch('https://api.example.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'org_123',
    'X-User-ID': 'user_456'
  },
  body: JSON.stringify({ query: '...' })
});
```

**After (Service Bindings with context)**:
```typescript
const response = await env.INFERENCE_UI.graphql({
  query: '...',
  context: {
    tenantId: 'org_123',
    userId: 'user_456'
  }
});
```

### Migration Checklist

- [ ] Identify all places tenant ID is extracted from headers
- [ ] Create tenant extraction function (subdomain/JWT/header)
- [ ] Create TenantAwareInferenceUI wrapper class
- [ ] Update all service binding calls to include context
- [ ] Add tenant validation middleware
- [ ] Update GraphQL queries to filter by tenant
- [ ] Test data isolation
- [ ] Audit cross-tenant access attempts
- [ ] Deploy and monitor

---

## FAQ

**Q: Can I use HTTP headers with service bindings?**
A: No. Service bindings are direct RPC calls, not HTTP requests. Use the `context` object instead.

**Q: How do I prevent cross-tenant data leaks?**
A: Always validate tenant access, filter queries by tenant, and audit access attempts.

**Q: Should I create separate databases per tenant?**
A: For most applications, use tenant IDs in a shared database. Only use separate databases for enterprise compliance requirements.

**Q: How do I handle tenant deletion?**
A: Include tenant deletion events and mark data for deletion/archival.

**Q: Can tenants share data?**
A: Yes, but require explicit permissions and audit all cross-tenant access.

---

## Next Steps

1. Choose your tenant identification method
2. Implement TenantAwareInferenceUI wrapper
3. Add tenant validation middleware
4. Test with multiple tenants
5. Monitor and audit access

**Need help?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or [open an issue](https://github.com/your-org/inference-ui/issues).
