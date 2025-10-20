# @inference-ui/node

[![npm version](https://badge.fury.io/js/%40inference-ui%2Fnode.svg)](https://www.npmjs.com/package/@inference-ui/node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Node.js client SDK for Inference UI - interact with the Cloudflare-hosted API from your Node.js backend.

## Installation

```bash
npm install @inference-ui/node
```

## Quick Start

```typescript
import { InferenceUIClient } from '@inference-ui/node';

// Initialize client with your API key
const client = new InferenceUIClient({
  apiKey: process.env.INFERENCE_API_KEY, // sk_live_xxx
});

// Get current user
const user = await client.getCurrentUser();
console.log(user);

// Track events
await client.trackEvent({
  event: 'user_signup',
  timestamp: Date.now(),
  data: { plan: 'business' },
});

// Query analytics
const analytics = await client.queryAnalytics({
  startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  endDate: Date.now(),
  metrics: ['events', 'users'],
});
```

## Features

- ✅ **Type-Safe** - Full TypeScript support with type definitions
- ✅ **GraphQL Client** - Built-in GraphQL client for API queries/mutations
- ✅ **User Management** - Get user info, check tier limits
- ✅ **API Key Management** - Create, list, and revoke API keys
- ✅ **Event Tracking** - Track events and batch operations
- ✅ **Analytics** - Query usage metrics and analytics data
- ✅ **Flow Management** - Create and manage UX flows

## API Reference

### Client Initialization

```typescript
const client = new InferenceUIClient({
  apiKey: 'sk_live_xxx',           // Required: Your API key
  apiUrl: 'https://...',           // Optional: Custom API endpoint
  timeout: 30000,                  // Optional: Request timeout (ms)
  headers: { 'X-Custom': 'value' } // Optional: Custom headers
});
```

### User Management

```typescript
// Get current user
const user = await client.getCurrentUser();
// Returns: { id, email, tier, createdAt }
```

### API Key Management

```typescript
// Create new API key
const apiKey = await client.createApiKey({
  name: 'Production API',
  expiresInDays: 90, // Optional
});
// Returns: { apiKey, keyPrefix, createdAt, expiresAt }
// ⚠️ apiKey is only shown once - store it securely!

// List all API keys
const keys = await client.listApiKeys();
// Returns: [{ id, keyPrefix, name, lastUsedAt, expiresAt, revokedAt, createdAt }]

// Revoke an API key
await client.revokeApiKey('sk_live_abc1');
```

### Event Tracking

```typescript
// Track single event
await client.trackEvent({
  event: 'button_click',
  component: 'PurchaseButton',
  timestamp: Date.now(),
  data: { price: 99.99 },
});

// Track multiple events (batch)
await client.trackEvents([
  { event: 'page_view', timestamp: Date.now() },
  { event: 'form_submit', timestamp: Date.now() },
]);
```

### Analytics

```typescript
// Query analytics
const analytics = await client.queryAnalytics({
  userId: 'user_123',              // Optional: specific user
  startDate: 1704067200000,        // Required: start timestamp
  endDate: 1706745600000,          // Required: end timestamp
  metrics: ['events', 'sessions'], // Optional: specific metrics
  groupBy: 'day',                  // Optional: group by time period
});
// Returns: { metrics: {...}, breakdown: [...] }

// Get usage metrics
const usage = await client.getUsageMetrics();
// Returns: { userId, tier, eventsThisMonth, eventsLimit, ... }
```

### Flow Management

```typescript
// Get all flows
const flows = await client.getFlows();

// Get specific flow
const flow = await client.getFlow('flow_123');

// Create new flow
const newFlow = await client.createFlow('Onboarding', [
  { id: '1', component: 'WelcomeScreen' },
  { id: '2', component: 'ProfileSetup' },
]);

// Delete flow
await client.deleteFlow('flow_123');
```

## Usage Examples

### Next.js API Route

```typescript
// app/api/analytics/route.ts
import { InferenceUIClient } from '@inference-ui/node';

const client = new InferenceUIClient({
  apiKey: process.env.INFERENCE_API_KEY!,
});

export async function GET() {
  const analytics = await client.queryAnalytics({
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
    endDate: Date.now(),
  });

  return Response.json(analytics);
}
```

### Express Server

```typescript
import express from 'express';
import { InferenceUIClient } from '@inference-ui/node';

const app = express();
const client = new InferenceUIClient({
  apiKey: process.env.INFERENCE_API_KEY!,
});

app.post('/track', async (req, res) => {
  await client.trackEvent({
    event: req.body.event,
    timestamp: Date.now(),
    data: req.body.data,
  });

  res.json({ success: true });
});

app.listen(3000);
```

### Scheduled Jobs (Cron)

```typescript
import { InferenceUIClient } from '@inference-ui/node';

const client = new InferenceUIClient({
  apiKey: process.env.INFERENCE_API_KEY!,
});

// Daily analytics report
async function dailyReport() {
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  const today = Date.now();

  const analytics = await client.queryAnalytics({
    startDate: yesterday,
    endDate: today,
    metrics: ['events', 'users', 'sessions'],
  });

  console.log('Daily Analytics:', analytics);
}

// Run daily
setInterval(dailyReport, 24 * 60 * 60 * 1000);
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  InferenceUIConfig,
  User,
  ApiKey,
  Event,
  AnalyticsQuery,
  UsageMetrics,
} from '@inference-ui/node';
```

## Error Handling

```typescript
try {
  const user = await client.getCurrentUser();
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    console.error('Invalid API key');
  } else if (error.message.includes('timeout')) {
    console.error('Request timed out');
  } else {
    console.error('API error:', error);
  }
}
```

## Environment Variables

```bash
# .env
INFERENCE_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
```

## Links

- **npm**: https://www.npmjs.com/package/@inference-ui/node
- **GitHub**: https://github.com/Neureus/Inference-UI
- **Documentation**: https://inference-ui.dev/docs/node-sdk
- **API Reference**: https://inference-ui.dev/docs/api

## License

MIT
