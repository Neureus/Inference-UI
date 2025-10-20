# @inference-ui/js

[![npm version](https://badge.fury.io/js/%40inference-ui%2Fjs.svg)](https://www.npmjs.com/package/@inference-ui/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

JavaScript SDK for Inference UI - browser-compatible client for web applications without React.

## Installation

```bash
npm install @inference-ui/js
```

Or via CDN:

```html
<script type="module">
  import { InferenceClient } from 'https://cdn.jsdelivr.net/npm/@inference-ui/js@latest/dist/index.esm.js';
</script>
```

## Quick Start

```javascript
import { InferenceClient } from '@inference-ui/js';

// Initialize client with your API key
const client = new InferenceClient({
  apiKey: 'sk_live_xxx', // Get from https://inference-ui.dev
});

// Get current user
const user = await client.getCurrentUser();
console.log(user);

// Track events
await client.trackEvent({
  event: 'button_click',
  timestamp: Date.now(),
  data: { button: 'signup' },
});

// Query analytics
const analytics = await client.queryAnalytics({
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
  endDate: Date.now(),
});
```

## Features

- ✅ **Browser-Compatible** - Works in all modern browsers with fetch API
- ✅ **Framework-Agnostic** - Use with vanilla JS, Vue, Angular, Svelte, etc.
- ✅ **Type-Safe** - Full TypeScript support with type definitions
- ✅ **Lightweight** - ~5KB gzipped, zero dependencies
- ✅ **ESM & CommonJS** - Supports both module formats
- ✅ **User Management** - Get user info, check tier limits
- ✅ **API Key Management** - Create, list, and revoke API keys
- ✅ **Event Tracking** - Track events and batch operations
- ✅ **Analytics** - Query usage metrics and analytics data
- ✅ **Flow Management** - Create and manage UX flows

## API Reference

### Client Initialization

```javascript
const client = new InferenceClient({
  apiKey: 'sk_live_xxx',           // Required: Your API key
  apiUrl: 'https://...',           // Optional: Custom API endpoint
  headers: { 'X-Custom': 'value' } // Optional: Custom headers
});
```

### User Management

```javascript
// Get current user
const user = await client.getCurrentUser();
// Returns: { id, email, tier, createdAt }
```

### API Key Management

```javascript
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

```javascript
// Track single event
await client.trackEvent({
  event: 'page_view',
  timestamp: Date.now(),
  data: { page: '/dashboard' },
});

// Track multiple events (batch)
await client.trackEvents([
  { event: 'button_click', timestamp: Date.now(), data: { button: 'submit' } },
  { event: 'form_submit', timestamp: Date.now(), data: { form: 'contact' } },
]);
```

### Analytics

```javascript
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

```javascript
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

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Inference UI Example</title>
</head>
<body>
  <button id="trackBtn">Track Click</button>
  <div id="analytics"></div>

  <script type="module">
    import { InferenceClient } from 'https://cdn.jsdelivr.net/npm/@inference-ui/js@latest/dist/index.esm.js';

    const client = new InferenceClient({
      apiKey: 'sk_live_xxx',
    });

    // Track button clicks
    document.getElementById('trackBtn').addEventListener('click', async () => {
      await client.trackEvent({
        event: 'button_click',
        timestamp: Date.now(),
        data: { button: 'trackBtn' },
      });
      console.log('Event tracked!');
    });

    // Load analytics
    async function loadAnalytics() {
      const analytics = await client.queryAnalytics({
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        endDate: Date.now(),
      });
      document.getElementById('analytics').textContent = JSON.stringify(analytics, null, 2);
    }

    loadAnalytics();
  </script>
</body>
</html>
```

### Vue.js

```vue
<template>
  <div>
    <button @click="trackClick">Track Click</button>
    <div>{{ analytics }}</div>
  </div>
</template>

<script>
import { InferenceClient } from '@inference-ui/js';

export default {
  data() {
    return {
      client: new InferenceClient({ apiKey: process.env.VUE_APP_INFERENCE_KEY }),
      analytics: null,
    };
  },
  methods: {
    async trackClick() {
      await this.client.trackEvent({
        event: 'button_click',
        timestamp: Date.now(),
      });
    },
    async loadAnalytics() {
      this.analytics = await this.client.queryAnalytics({
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        endDate: Date.now(),
      });
    },
  },
  mounted() {
    this.loadAnalytics();
  },
};
</script>
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import { InferenceClient } from '@inference-ui/js';

@Component({
  selector: 'app-analytics',
  template: `
    <button (click)="trackClick()">Track Click</button>
    <pre>{{ analytics | json }}</pre>
  `,
})
export class AnalyticsComponent implements OnInit {
  private client = new InferenceClient({
    apiKey: environment.inferenceApiKey,
  });
  analytics: any;

  async ngOnInit() {
    this.analytics = await this.client.queryAnalytics({
      startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endDate: Date.now(),
    });
  }

  async trackClick() {
    await this.client.trackEvent({
      event: 'button_click',
      timestamp: Date.now(),
    });
  }
}
```

### Svelte

```svelte
<script>
  import { InferenceClient } from '@inference-ui/js';
  import { onMount } from 'svelte';

  const client = new InferenceClient({
    apiKey: import.meta.env.VITE_INFERENCE_KEY,
  });

  let analytics = null;

  async function trackClick() {
    await client.trackEvent({
      event: 'button_click',
      timestamp: Date.now(),
    });
  }

  onMount(async () => {
    analytics = await client.queryAnalytics({
      startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endDate: Date.now(),
    });
  });
</script>

<button on:click={trackClick}>Track Click</button>
<pre>{JSON.stringify(analytics, null, 2)}</pre>
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  InferenceConfig,
  User,
  ApiKey,
  Event,
  AnalyticsQuery,
  UsageMetrics,
} from '@inference-ui/js';

const config: InferenceConfig = {
  apiKey: 'sk_live_xxx',
};

const event: Event = {
  event: 'page_view',
  timestamp: Date.now(),
};
```

## Error Handling

```javascript
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

## Browser Compatibility

Works in all modern browsers that support:
- Fetch API
- Promises
- ES2020 syntax

For older browsers, use polyfills:
```html
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3/dist/fetch.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>
```

## Environment Variables

```bash
# .env
INFERENCE_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
```

## Bundle Size

- **ESM**: ~5KB gzipped
- **CommonJS**: ~5KB gzipped
- **Zero runtime dependencies**

## Links

- **npm**: https://www.npmjs.com/package/@inference-ui/js
- **GitHub**: https://github.com/Neureus/Inference-UI
- **Documentation**: https://inference-ui.dev/docs/js-sdk
- **API Reference**: https://inference-ui.dev/docs/api

## License

MIT

## Related Packages

- **React**: `npm install inference-ui-react` - React hooks and components
- **Node.js**: `npm install @inference-ui/node` - Node.js backend SDK
- **React Native**: `npm install inference-ui-react-native` - Mobile SDK
