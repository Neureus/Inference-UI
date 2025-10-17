# Inference UI Service Bindings API

Complete guide for connecting to Inference UI via Cloudflare Service Bindings for direct, zero-latency access.

## Overview

Inference UI Service Bindings provide a high-performance API for accessing Inference UI functionality directly from other Cloudflare Workers. By using service bindings instead of HTTP calls, you get:

- **🚀 0ms Latency** - Direct worker-to-worker calls with no network overhead
- **💰 50% Cost Savings** - Service binding calls are free (no request fees)
- **🔒 Internal-Only** - No public endpoints, enhanced security
- **⚡ Type-Safe** - Full TypeScript support with compile-time checks
- **🎯 Simplified** - No API keys, authentication, or HTTP clients needed

## Architecture

```
Your Worker → Service Binding (0ms) → Inference UI API → D1/KV/R2/Workers AI
                                            ↓
                                      Streaming Worker (via service binding)
```

## Quick Start

### 1. Configure Service Binding

Add Inference UI service binding to your `wrangler.toml`:

```toml
[[services]]
binding = "INFERENCE_UI"
service = "inference-ui-api"
environment = "production"
```

### 2. Define Types

```typescript
import type {
  InferenceUIGraphQLRequest,
  InferenceUIEventRequest,
  InferenceUIBatchEventRequest,
  InferenceUIChatRequest,
} from '@inference-ui/cloudflare/src/types/service-bindings';

interface Env {
  INFERENCE_UI: {
    graphql(request: InferenceUIGraphQLRequest): Promise<Response>;
    ingestEvent(request: InferenceUIEventRequest): Promise<Response>;
    ingestBatch(request: InferenceUIBatchEventRequest): Promise<Response>;
    streamChat(request: InferenceUIChatRequest): Promise<Response>;
    streamCompletion(request: InferenceUICompletionRequest): Promise<Response>;
    streamObject(request: InferenceUIObjectRequest): Promise<Response>;
    health(): Promise<Response>;
  };
}
```

### 3. Use Inference UI

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Query Inference UI via service binding
    const response = await env.INFERENCE_UI.graphql({
      query: 'query { componentEvents { id type timestamp } }',
    });

    return response;
  },
};
```

## API Reference

### 1. GraphQL API

Execute GraphQL queries and mutations against Inference UI.

**Method**: `env.INFERENCE_UI.graphql(request)`

**Request**:
```typescript
interface InferenceUIGraphQLRequest {
  query: string;                          // GraphQL query or mutation
  variables?: Record<string, unknown>;    // Query variables
  operationName?: string;                 // Operation name
  context?: {
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  };
}
```

**Example - Query Component Events**:
```typescript
const response = await env.INFERENCE_UI.graphql({
  query: `
    query GetComponentEvents($componentId: ID!) {
      componentEvents(componentId: $componentId, limit: 10) {
        id
        type
        timestamp
        data
        user {
          id
          name
        }
      }
    }
  `,
  variables: { componentId: 'button-submit' },
  context: {
    userId: 'current-user',
    sessionId: 'session-123',
  },
});

const result = await response.json();
console.log(result.data.componentEvents);
```

**Example - Mutation**:
```typescript
const response = await env.INFERENCE_UI.graphql({
  query: `
    mutation CreateFlow($input: FlowInput!) {
      createFlow(input: $input) {
        id
        name
        steps
      }
    }
  `,
  variables: {
    input: {
      name: 'User Onboarding',
      steps: [
        { component: 'WelcomeScreen', duration: 3 },
        { component: 'ProfileForm', required: true },
      ],
    },
  },
});
```

**Response**:
```typescript
interface InferenceUIGraphQLResponse {
  data?: unknown;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
  extensions?: Record<string, unknown>;
}
```

### 2. Event Ingestion API

Ingest user interaction events for analytics and tracking.

**Method**: `env.INFERENCE_UI.ingestEvent(request)`

**Request**:
```typescript
interface InferenceUIEventRequest {
  type: string;                           // Event type
  data: Record<string, unknown>;          // Event data
  userId?: string;                        // User ID
  sessionId?: string;                     // Session ID
  timestamp?: number;                     // Timestamp (defaults to now)
  metadata?: Record<string, unknown>;     // Event metadata
}
```

**Example - Single Event**:
```typescript
const response = await env.INFERENCE_UI.ingestEvent({
  type: 'button_click',
  data: {
    buttonId: 'submit-form',
    componentId: 'contact-form',
    label: 'Submit',
    value: null,
  },
  userId: 'user-123',
  sessionId: 'session-abc',
  timestamp: Date.now(),
  metadata: {
    source: 'mobile-app',
    platform: 'ios',
    version: '1.2.3',
  },
});

const result = await response.json();
// { success: true, count: 1 }
```

**Method**: `env.INFERENCE_UI.ingestBatch(request)`

**Example - Batch Events** (More Efficient):
```typescript
const response = await env.INFERENCE_UI.ingestBatch({
  events: [
    {
      type: 'page_view',
      data: { page: '/home', referrer: '/landing' },
      userId: 'user-123',
      timestamp: Date.now(),
    },
    {
      type: 'component_interaction',
      data: { componentId: 'search-box', action: 'focus' },
      userId: 'user-123',
      timestamp: Date.now() + 1000,
    },
    {
      type: 'form_submit',
      data: { formId: 'newsletter', success: true },
      userId: 'user-123',
      timestamp: Date.now() + 2000,
    },
  ],
  metadata: {
    source: 'mobile-app',
    batchId: crypto.randomUUID(),
  },
});

const result = await response.json();
// { success: true, count: 3 }
```

**Response**:
```typescript
interface InferenceUIEventResponse {
  success: boolean;
  count?: number;
  error?: {
    message: string;
    code: string;
  };
}
```

### 3. AI Streaming APIs

Stream AI responses using Workers AI.

#### Chat Completion

**Method**: `env.INFERENCE_UI.streamChat(request)`

**Request**:
```typescript
interface InferenceUIChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;                         // AI model to use
  temperature?: number;                   // 0-1
  maxTokens?: number;                     // Max response tokens
  chatId?: string;                        // Chat session ID
  context?: {
    userId?: string;
    sessionId?: string;
  };
}
```

**Example**:
```typescript
const response = await env.INFERENCE_UI.streamChat({
  messages: [
    {
      role: 'system',
      content: 'You are a helpful UI design assistant.',
    },
    {
      role: 'user',
      content: 'What are the best practices for button design?',
    },
  ],
  model: '@cf/meta/llama-3.1-8b-instruct',
  temperature: 0.7,
  maxTokens: 500,
  context: {
    userId: 'user-123',
    sessionId: 'session-abc',
  },
});

// Response is a Server-Sent Events (SSE) stream
return new Response(response.body, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  },
});
```

#### Text Completion

**Method**: `env.INFERENCE_UI.streamCompletion(request)`

**Request**:
```typescript
interface InferenceUICompletionRequest {
  prompt: string;                         // Prompt text
  model?: string;                         // AI model
  temperature?: number;                   // 0-1
  maxTokens?: number;                     // Max response tokens
  stop?: string[];                        // Stop sequences
  context?: {
    userId?: string;
    sessionId?: string;
  };
}
```

**Example**:
```typescript
const response = await env.INFERENCE_UI.streamCompletion({
  prompt: 'Generate a list of 5 UI component ideas for a dashboard:',
  model: '@cf/meta/llama-3.1-8b-instruct',
  temperature: 0.8,
  maxTokens: 300,
  stop: ['\n\n'],
});
```

#### Object Generation

**Method**: `env.INFERENCE_UI.streamObject(request)`

**Request**:
```typescript
interface InferenceUIObjectRequest {
  prompt: string;                         // Generation prompt
  schema: Record<string, unknown>;        // JSON schema for output
  model?: string;                         // AI model
  temperature?: number;                   // 0-1
  context?: {
    userId?: string;
    sessionId?: string;
  };
}
```

**Example**:
```typescript
const response = await env.INFERENCE_UI.streamObject({
  prompt: 'Generate a user profile with realistic data',
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      age: { type: 'number' },
      interests: { type: 'array', items: { type: 'string' } },
    },
    required: ['name', 'email'],
  },
  model: '@cf/meta/llama-3.1-8b-instruct',
});
```

### 4. Health Check

**Method**: `env.INFERENCE_UI.health()`

**Example**:
```typescript
const response = await env.INFERENCE_UI.health();
const result = await response.json();
console.log(result.status); // 'healthy'
```

## Best Practices

### 1. Background Event Processing

Use `ctx.waitUntil()` for non-blocking event ingestion:

```typescript
// Track event without waiting
ctx.waitUntil(
  env.INFERENCE_UI.ingestEvent({
    type: 'api_call_completed',
    data: { endpoint: '/api/users', duration: 150 },
  })
);

// Continue processing immediately
return new Response('Success');
```

### 2. Parallel Queries

Execute multiple queries in parallel:

```typescript
const [eventsData, metricsData, usersData] = await Promise.all([
  env.INFERENCE_UI.graphql({
    query: 'query { events(limit: 100) { type timestamp } }',
  }),
  env.INFERENCE_UI.graphql({
    query: 'query { metrics { p50 p95 p99 } }',
  }),
  env.INFERENCE_UI.graphql({
    query: 'query { users { id name email } }',
  }),
]);
```

### 3. Batch Events for Efficiency

Always batch events when possible:

```typescript
// ❌ Don't do this (3 separate calls)
await env.INFERENCE_UI.ingestEvent({ type: 'event1', data: {} });
await env.INFERENCE_UI.ingestEvent({ type: 'event2', data: {} });
await env.INFERENCE_UI.ingestEvent({ type: 'event3', data: {} });

// ✅ Do this (1 batch call)
await env.INFERENCE_UI.ingestBatch({
  events: [
    { type: 'event1', data: {} },
    { type: 'event2', data: {} },
    { type: 'event3', data: {} },
  ],
});
```

### 4. Error Handling

Always check response status:

```typescript
const response = await env.INFERENCE_UI.graphql({
  query: 'query { user(id: "123") { id name } }',
});

const result = await response.json();

if (result.errors) {
  console.error('GraphQL errors:', result.errors);
  return new Response('Query failed', { status: 400 });
}

return new Response(JSON.stringify(result.data));
```

### 5. Type Safety

Import and use types for compile-time checks:

```typescript
import type {
  InferenceUIGraphQLRequest,
  InferenceUIGraphQLResponse,
} from '@inference-ui/cloudflare/src/types/service-bindings';

const request: InferenceUIGraphQLRequest = {
  query: 'query { events { id } }',
  variables: {},
  context: { userId: 'user-123' },
};

const response = await env.INFERENCE_UI.graphql(request);
const result: InferenceUIGraphQLResponse = await response.json();
```

## Performance Comparison

### HTTP API vs Service Bindings

**HTTP API** (Traditional):
```
Your Worker → HTTP Request (50-100ms) → Inference UI
    ↓                                         ↓
Cost: $0.50/M requests              Cost: $0.50/M requests
Total: $1.00/M requests
Latency: 50-100ms + processing
```

**Service Bindings** (Recommended):
```
Your Worker → Service Binding (0ms) → Inference UI
    ↓                                       ↓
Cost: $0.50/M requests              Cost: $0 (free!)
Total: $0.50/M requests (50% savings)
Latency: <1ms + processing
```

**Benefits**:
- **50-100ms faster** - No network latency
- **50% cost savings** - Service binding calls are free
- **Type-safe** - Compile-time checks
- **Simpler** - No HTTP client, auth, or retry logic

## Example Workflows

### Complete User Interaction Flow

```typescript
async function trackUserInteraction(
  userId: string,
  env: Env,
  ctx: ExecutionContext
) {
  const sessionId = crypto.randomUUID();

  // 1. Track interaction event
  ctx.waitUntil(
    env.INFERENCE_UI.ingestEvent({
      type: 'user_interaction_started',
      data: { workflow: 'checkout' },
      userId,
      sessionId,
    })
  );

  // 2. Query user data
  const userResponse = await env.INFERENCE_UI.graphql({
    query: `
      query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          profile { name email }
          recentEvents(limit: 5) { type timestamp }
        }
      }
    `,
    variables: { userId },
  });

  const userData = await userResponse.json();

  // 3. Get AI recommendations
  const aiResponse = await env.INFERENCE_UI.streamCompletion({
    prompt: `User ${userData.data?.user.profile.name} needs checkout assistance. Suggest 3 actions:`,
    maxTokens: 200,
  });

  const recommendations = await aiResponse.text();

  // 4. Track completion
  ctx.waitUntil(
    env.INFERENCE_UI.ingestEvent({
      type: 'user_interaction_completed',
      data: { workflow: 'checkout', success: true },
      userId,
      sessionId,
    })
  );

  return {
    user: userData.data?.user,
    recommendations,
  };
}
```

### Real-time Analytics Dashboard

```typescript
async function buildDashboard(env: Env): Promise<Response> {
  // Query all dashboard data in parallel
  const [events, components, performance, users] = await Promise.all([
    env.INFERENCE_UI.graphql({
      query: 'query { events(limit: 1000) { type timestamp data } }',
    }),
    env.INFERENCE_UI.graphql({
      query: 'query { componentUsage { componentId count avgDuration } }',
    }),
    env.INFERENCE_UI.graphql({
      query: 'query { performanceMetrics { p50 p95 p99 errorRate } }',
    }),
    env.INFERENCE_UI.graphql({
      query: 'query { activeUsers(timeRange: "24h") { count locations } }',
    }),
  ]);

  const dashboard = {
    events: await events.json(),
    components: await components.json(),
    performance: await performance.json(),
    users: await users.json(),
  };

  return new Response(JSON.stringify(dashboard), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

## Deployment

### 1. Ensure Inference UI is Deployed

```bash
cd packages/@inference-ui/cloudflare
npm run deploy
```

### 2. Configure Consumer Worker

Add service binding to `wrangler.toml`:

```toml
[[services]]
binding = "INFERENCE_UI"
service = "inference-ui-api"
environment = "production"
```

### 3. Deploy Consumer Worker

```bash
wrangler deploy
```

## Troubleshooting

### Service Binding Not Found

**Error**: `Service binding INFERENCE_UI not found`

**Solution**:
1. Ensure Inference UI API is deployed first
2. Check service name in `wrangler.toml` matches deployed worker
3. Redeploy consumer worker

### Type Errors

**Error**: `Property 'INFERENCE_UI' does not exist on type 'Env'`

**Solution**:
```typescript
import type { ... } from '@inference-ui/cloudflare/src/types/service-bindings';

interface Env {
  INFERENCE_UI: { ... };
}
```

### Response Errors

**Issue**: Getting errors from Inference UI

**Debug**:
```typescript
const response = await env.INFERENCE_UI.graphql(...);
const result = await response.json();

if (result.errors) {
  console.error('Inference UI errors:', result.errors);
}
```

## Use Cases

### 1. Multi-Platform Analytics

Aggregate events from mobile apps, web apps, and IoT devices:

```typescript
// Mobile app events
ctx.waitUntil(
  env.INFERENCE_UI.ingestBatch({
    events: mobileEvents,
    metadata: { source: 'ios-app', version: '2.1.0' },
  })
);

// Web app events
ctx.waitUntil(
  env.INFERENCE_UI.ingestBatch({
    events: webEvents,
    metadata: { source: 'web-app', browser: 'chrome' },
  })
);
```

### 2. Real-time Dashboards

Build analytics dashboards with live data:

```typescript
const dashboardData = await env.INFERENCE_UI.graphql({
  query: `
    query Dashboard {
      liveMetrics { activeUsers pageViews conversions }
      topComponents { id name usageCount }
      recentEvents(limit: 50) { type timestamp }
    }
  `,
});
```

### 3. AI-Powered Features

Add AI capabilities to your platform:

```typescript
const aiResponse = await env.INFERENCE_UI.streamChat({
  messages: [
    { role: 'system', content: 'Help users with UI questions' },
    { role: 'user', content: userQuestion },
  ],
});
```

### 4. Cross-Platform Event Tracking

Track user journeys across multiple platforms:

```typescript
await env.INFERENCE_UI.ingestBatch({
  events: [
    { type: 'mobile_app_opened', data: { platform: 'ios' } },
    { type: 'web_page_viewed', data: { page: '/home' } },
    { type: 'desktop_app_action', data: { action: 'sync' } },
  ],
  metadata: { userId: 'user-123', journey: 'cross-platform' },
});
```

## Summary

Inference UI Service Bindings provide the fastest, cheapest, and simplest way to access Inference UI from other Cloudflare Workers:

✅ **0ms latency** - Direct worker-to-worker calls
✅ **50% cost savings** - Service bindings are free
✅ **Type-safe** - Full TypeScript support
✅ **Simple** - No HTTP client or auth needed
✅ **Flexible** - GraphQL, events, and AI streaming APIs

**Ready to get started?** See `examples/inference-ui-consumer/` for complete working examples!

---

**Last Updated**: October 17, 2025
**Version**: v1.0.0
