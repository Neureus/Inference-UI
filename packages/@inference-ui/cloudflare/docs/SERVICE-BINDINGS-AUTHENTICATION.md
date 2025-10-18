# Service Bindings Authentication & Tenant Context

> **Understanding authentication flow with service bindings - no HTTP headers, no JWT in RPC calls**

## The Architecture

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client → Your Worker (HTTP)                              │
│    ✅ Has: HTTP headers, JWT, cookies                       │
│    ✅ Can: Authenticate, extract tenant                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Your Worker → Inference UI (Service Binding)             │
│    ❌ NO: HTTP headers, JWT, cookies                        │
│    ❌ NO: Network request at all (direct RPC)               │
│    ✅ Has: Only what you pass in the function call          │
└─────────────────────────────────────────────────────────────┘
```

### Key Insight

**Service bindings are NOT HTTP requests** - they're direct function calls between Workers running in the same isolate. There are no headers, no JWT tokens, no cookies in the service binding call itself.

**Your Worker is responsible for:**
1. Authenticating the incoming HTTP request
2. Extracting tenant/user context
3. Passing that context explicitly in the service binding call

---

## How It Actually Works

### Step-by-Step Flow

```typescript
/**
 * COMPLETE AUTHENTICATION FLOW
 */

interface Env {
  INFERENCE_UI: any;        // Service binding (no HTTP!)
  JWT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // ┌─────────────────────────────────────────────────────────┐
    // │ STEP 1: Authenticate the HTTP request (YOUR job)        │
    // └─────────────────────────────────────────────────────────┘

    // Extract JWT from HTTP Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT (YOUR responsibility)
    const jwt = await verifyJWT(token, env.JWT_SECRET);
    if (!jwt) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // ┌─────────────────────────────────────────────────────────┐
    // │ STEP 2: Extract tenant context (YOUR job)               │
    // └─────────────────────────────────────────────────────────┘

    const tenantId = jwt.organizationId;   // From JWT claims
    const userId = jwt.userId;
    const userRole = jwt.role;

    // ┌─────────────────────────────────────────────────────────┐
    // │ STEP 3: Call Inference UI via service binding           │
    // │ Pass context explicitly (NO headers available!)         │
    // └─────────────────────────────────────────────────────────┘

    const response = await env.INFERENCE_UI.graphql({
      query: `{ events { id } }`,
      context: {
        tenantId,      // ← YOU provide this
        userId,        // ← YOU provide this
        role: userRole // ← YOU provide this
        // Inference UI has NO access to original HTTP request!
      }
    });

    return response;
  }
};

/**
 * JWT verification (YOUR implementation)
 */
async function verifyJWT(token: string, secret: string): Promise<any> {
  // Use jose, jsonwebtoken, or similar
  try {
    const payload = await verify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
```

---

## Common Misconceptions

### ❌ WRONG: Assuming Inference UI can see HTTP headers

```typescript
// This doesn't work!
const response = await env.INFERENCE_UI.graphql({
  query: '{ events { id } }'
  // ❌ Inference UI CANNOT see:
  // - request.headers.get('Authorization')
  // - request.headers.get('X-Tenant-ID')
  // - Cookies
  // - Client IP
  // - User agent
});
```

**Why?** Service bindings are direct RPC calls, not HTTP requests. Inference UI Worker only receives what you explicitly pass in the function parameters.

### ✅ CORRECT: Explicitly passing context

```typescript
// Extract from YOUR incoming HTTP request
const tenantId = extractFromHTTP(request);

// Pass explicitly to Inference UI
const response = await env.INFERENCE_UI.graphql({
  query: '{ events { id } }',
  context: {
    tenantId,  // ✅ YOU extract and pass this
    userId     // ✅ YOU extract and pass this
  }
});
```

---

## Complete Working Example

### Your Worker (Consumer)

```typescript
/**
 * YOUR WORKER - Handles HTTP, authenticates, calls Inference UI
 */

interface Env {
  INFERENCE_UI: any;
  DB: D1Database;
  JWT_SECRET: string;
}

interface JWTPayload {
  userId: string;
  organizationId: string;
  role: string;
  permissions: string[];
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ═══════════════════════════════════════════════════════════
    // YOUR AUTHENTICATION (HTTP layer)
    // ═══════════════════════════════════════════════════════════

    // 1. Extract JWT from HTTP request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    // 2. Verify JWT signature
    const jwt = await verifyJWT(authHeader.replace('Bearer ', ''), env.JWT_SECRET);
    if (!jwt) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // 3. Validate user exists and has access
    const user = await env.DB
      .prepare('SELECT * FROM users WHERE id = ? AND organization_id = ?')
      .bind(jwt.userId, jwt.organizationId)
      .first();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 403 });
    }

    // ═══════════════════════════════════════════════════════════
    // CALL INFERENCE UI (Service Binding layer)
    // ═══════════════════════════════════════════════════════════

    // Route to your application endpoints
    switch (url.pathname) {
      case '/api/analytics':
        return getAnalytics(jwt, env);

      case '/api/events':
        return trackEvent(request, jwt, env);

      default:
        return new Response('Not found', { status: 404 });
    }
  }
};

/**
 * Get analytics data
 */
async function getAnalytics(jwt: JWTPayload, env: Env): Promise<Response> {
  // Call Inference UI with context YOU extracted
  const response = await env.INFERENCE_UI.graphql({
    query: `
      query GetOrgAnalytics {
        events(limit: 100) {
          id
          type
          timestamp
          userId
        }
      }
    `,
    context: {
      tenantId: jwt.organizationId,  // From YOUR JWT
      userId: jwt.userId,             // From YOUR JWT
      role: jwt.role,                 // From YOUR JWT
      metadata: {
        permissions: jwt.permissions
      }
    }
  });

  return response;
}

/**
 * Track event
 */
async function trackEvent(
  request: Request,
  jwt: JWTPayload,
  env: Env
): Promise<Response> {
  const { eventType, eventData } = await request.json();

  // Call Inference UI with context YOU extracted
  await env.INFERENCE_UI.ingestEvent({
    type: eventType,
    data: eventData,
    userId: jwt.userId,        // From YOUR JWT
    metadata: {
      tenantId: jwt.organizationId,  // From YOUR JWT
      userRole: jwt.role,             // From YOUR JWT
      clientIp: request.headers.get('CF-Connecting-IP') // YOU can access HTTP headers
    }
  });

  return Response.json({ success: true });
}

/**
 * JWT verification - YOUR implementation
 */
async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    // Example using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Parse JWT (simplified - use a proper library in production)
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64));

    // Verify signature
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      data
    );

    if (!isValid) return null;

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
```

---

## Different Authentication Sources

### Option 1: JWT in Authorization Header

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Extract from header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const jwt = await verifyJWT(token, env.JWT_SECRET);

    // Pass to Inference UI
    await env.INFERENCE_UI.graphql({
      query: '...',
      context: {
        tenantId: jwt.organizationId,
        userId: jwt.userId
      }
    });
  }
};
```

### Option 2: API Key in Header

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Extract API key
    const apiKey = request.headers.get('X-API-Key');

    // Look up organization by API key
    const org = await env.DB
      .prepare('SELECT * FROM organizations WHERE api_key = ?')
      .bind(apiKey)
      .first();

    if (!org) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Pass to Inference UI
    await env.INFERENCE_UI.graphql({
      query: '...',
      context: {
        tenantId: org.id,
        apiKeyUsed: true
      }
    });
  }
};
```

### Option 3: Subdomain-Based

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Extract from subdomain
    const url = new URL(request.url);
    const subdomain = url.hostname.split('.')[0];

    // Look up organization
    const org = await env.DB
      .prepare('SELECT * FROM organizations WHERE subdomain = ?')
      .bind(subdomain)
      .first();

    if (!org) {
      return Response.json({ error: 'Unknown organization' }, { status: 404 });
    }

    // Still need user authentication!
    const jwt = await verifyJWT(request.headers.get('Authorization'), env.JWT_SECRET);

    // Verify user belongs to organization
    if (jwt.organizationId !== org.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Pass to Inference UI
    await env.INFERENCE_UI.graphql({
      query: '...',
      context: {
        tenantId: org.id,
        userId: jwt.userId,
        subdomain: subdomain
      }
    });
  }
};
```

### Option 4: Session Cookie

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Extract session cookie
    const cookieHeader = request.headers.get('Cookie');
    const sessionId = parseCookie(cookieHeader, 'session_id');

    // Look up session
    const sessionData = await env.KV.get(`session:${sessionId}`);
    if (!sessionData) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    const session = JSON.parse(sessionData);

    // Pass to Inference UI
    await env.INFERENCE_UI.graphql({
      query: '...',
      context: {
        tenantId: session.organizationId,
        userId: session.userId,
        sessionId: sessionId
      }
    });
  }
};

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}
```

---

## Security Layer Responsibilities

### Your Worker's Job (Consumer)

```typescript
// ✅ YOUR responsibilities:
// 1. Authenticate incoming HTTP requests
// 2. Verify JWT signatures
// 3. Check API keys
// 4. Validate sessions
// 5. Enforce rate limits
// 6. Check user permissions
// 7. Extract tenant context
// 8. Pass context to Inference UI

const jwt = await verifyJWT(token, env.JWT_SECRET);  // YOU do this
const hasPermission = await checkPermissions(jwt);   // YOU do this
const tenantId = jwt.organizationId;                 // YOU extract this

await env.INFERENCE_UI.graphql({
  context: { tenantId, userId }  // YOU pass this
});
```

### Inference UI's Job (Service)

```typescript
// ✅ INFERENCE UI responsibilities:
// 1. Process GraphQL queries
// 2. Ingest events
// 3. Store analytics data
// 4. Run AI models
// 5. Filter data by tenant context YOU provide
// 6. Return results

// ❌ INFERENCE UI does NOT:
// - Authenticate users (you already did this)
// - Verify JWT tokens (no JWT passed!)
// - Check API keys (no headers!)
// - Validate sessions (no cookies!)
// - Extract tenant IDs (you pass them!)
```

---

## Trust Model

### Service Bindings Trust

```
┌────────────────────────────────────────────────────┐
│  Cloudflare Account                                │
│  ┌──────────────┐         ┌──────────────┐       │
│  │ Your Worker  │────────▶│ Inference UI │       │
│  │              │ Trusts  │              │       │
│  │ (Auth layer) │         │ (Data layer) │       │
│  └──────────────┘         └──────────────┘       │
│         │                                          │
│         │ Same account = Trusted                  │
│         │ Service bindings are internal           │
└────────────────────────────────────────────────────┘
```

**Key principle**: Since both Workers run in the same Cloudflare account and service bindings are internal, **Inference UI trusts the context YOU provide**.

This means:
- ✅ **Your Worker** is the security boundary
- ✅ **You** authenticate and authorize
- ✅ **You** determine what tenant context is valid
- ✅ **Inference UI** trusts your context is correct

---

## Complete Example with All Auth Methods

```typescript
/**
 * Flexible authentication supporting multiple methods
 */

interface Env {
  INFERENCE_UI: any;
  DB: D1Database;
  KV: KVNamespace;
  JWT_SECRET: string;
}

interface AuthContext {
  tenantId: string;
  userId: string;
  role: string;
  authMethod: 'jwt' | 'api-key' | 'session';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Authenticate using one of multiple methods
    const authContext = await authenticate(request, env);

    if (!authContext) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Now call Inference UI with authenticated context
    const response = await env.INFERENCE_UI.graphql({
      query: `{ events { id type } }`,
      context: {
        tenantId: authContext.tenantId,
        userId: authContext.userId,
        role: authContext.role,
        metadata: {
          authMethod: authContext.authMethod
        }
      }
    });

    return response;
  }
};

/**
 * Unified authentication - tries multiple methods
 */
async function authenticate(request: Request, env: Env): Promise<AuthContext | null> {
  // Try Method 1: JWT
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const jwt = await verifyJWT(token, env.JWT_SECRET);

    if (jwt) {
      return {
        tenantId: jwt.organizationId,
        userId: jwt.userId,
        role: jwt.role,
        authMethod: 'jwt'
      };
    }
  }

  // Try Method 2: API Key
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey) {
    const org = await env.DB
      .prepare('SELECT * FROM organizations WHERE api_key_hash = ?')
      .bind(await hashApiKey(apiKey))
      .first();

    if (org) {
      return {
        tenantId: org.id,
        userId: 'api-key-user', // API keys are org-level, not user-level
        role: 'api',
        authMethod: 'api-key'
      };
    }
  }

  // Try Method 3: Session Cookie
  const cookieHeader = request.headers.get('Cookie');
  const sessionId = parseCookie(cookieHeader, 'session_id');

  if (sessionId) {
    const sessionData = await env.KV.get(`session:${sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      return {
        tenantId: session.organizationId,
        userId: session.userId,
        role: session.role,
        authMethod: 'session'
      };
    }
  }

  // No valid authentication method found
  return null;
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

async function verifyJWT(token: string, secret: string): Promise<any> {
  // JWT verification implementation
  // (same as previous examples)
}
```

---

## Summary: The Two-Layer Model

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: HTTP Authentication (YOUR WORKER)              │
│                                                          │
│  Client HTTP Request                                    │
│    ↓                                                    │
│  Extract: Authorization header, API key, cookies        │
│    ↓                                                    │
│  Verify: JWT signature, API key hash, session validity  │
│    ↓                                                    │
│  Extract: tenantId, userId, role, permissions           │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Service Binding Call (INFERENCE UI)            │
│                                                          │
│  env.INFERENCE_UI.graphql({                            │
│    context: {                                           │
│      tenantId: "org_123",  ← YOU provide from Layer 1  │
│      userId: "user_456"    ← YOU provide from Layer 1  │
│    }                                                    │
│  })                                                     │
│    ↓                                                    │
│  Inference UI processes with context YOU provided       │
│    ↓                                                    │
│  Returns results filtered by tenant                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Service bindings have NO HTTP headers** - they're direct function calls
2. **YOUR worker handles authentication** from the original HTTP request
3. **YOU extract tenant context** from JWT/API key/session/subdomain
4. **YOU pass context explicitly** in the service binding call
5. **Inference UI trusts the context** you provide (same account)
6. **This is actually MORE secure** - authentication happens once at your boundary

The architecture is simpler than it seems:
- **HTTP layer** (your worker): Authenticate & authorize
- **RPC layer** (service binding): Pass context
- **Data layer** (Inference UI): Process with context

---

## Next Steps

1. Implement authentication in your Worker
2. Extract tenant context from your auth method
3. Create wrapper class to auto-include context
4. Test with multiple tenants
5. Add audit logging

**Need help?** See the [Multi-Tenant Guide](MULTI-TENANT-GUIDE.md) for implementation patterns.
