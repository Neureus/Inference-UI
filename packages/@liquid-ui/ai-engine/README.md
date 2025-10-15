# @liquid-ui/ai-engine

Hybrid AI engine that intelligently routes between local TensorFlow Lite models and Cloudflare Workers AI for optimal performance, privacy, and cost.

## Features

- **Hybrid Architecture**: Local TFLite + Cloudflare Workers AI
- **Intelligent Routing**: Automatic decision-making based on privacy, latency, and capability
- **Privacy-First**: Sensitive data never leaves device
- **Offline Support**: Full functionality without network
- **Ultra-Low Latency**: <100ms for local inference
- **Advanced Models**: Access to Llama 3, Mistral, and more at edge
- **Automatic Fallback**: Graceful degradation when one engine fails
- **Metrics Tracking**: Detailed performance analytics

## Installation

```bash
npm install @liquid-ui/ai-engine
```

### Peer Dependencies

```bash
npm install react-native-fast-tflite @react-native-async-storage/async-storage
```

## Usage

### Initialize Engines

```typescript
import { initializeLocalAI, initializeEdgeAI, initializeRouter } from '@liquid-ui/ai-engine';

// Initialize local AI (TFLite)
await initializeLocalAI();

// Initialize edge AI (Cloudflare Workers)
initializeEdgeAI({
  endpoint: 'https://your-worker.workers.dev',
  apiKey: 'your-api-key', // Optional
});

// Initialize hybrid router
const router = initializeRouter({
  enableLocalAI: true,
  enableEdgeAI: true,
  maxLocalLatency: 100,
  fallbackToEdge: true,
});
```

### Execute AI Tasks

```typescript
import { routeAIRequest } from '@liquid-ui/ai-engine';

// Text classification (routes to local)
const result = await routeAIRequest({
  type: 'text_classification',
  input: 'This product is amazing!',
  needsUnder100ms: true,
});

console.log(result.output); // { label: 'positive', confidence: 0.95 }
console.log(result.executedAt); // 'local'
console.log(result.latency); // 45ms

// Intent detection (routes to edge)
const intent = await routeAIRequest({
  type: 'intent_detection',
  input: 'I want to delete my account',
  needsAdvancedModel: true,
});

console.log(intent.output); // { intent: 'delete', confidence: 0.92 }
console.log(intent.executedAt); // 'edge'

// Privacy-sensitive task (forces local)
const privateResult = await routeAIRequest({
  type: 'form_validation',
  input: {
    ssn: '123-45-6789',
    email: 'user@example.com',
  },
  requiresPrivacy: true,
});

console.log(privateResult.executedAt); // 'local' (always)
```

## Task Types

- `text_classification` - Classify text sentiment, category, etc.
- `sentiment_analysis` - Detect positive/negative/neutral sentiment
- `intent_detection` - Understand user intent from input
- `entity_extraction` - Extract entities (names, dates, locations)
- `form_validation` - Validate form data with AI
- `autocomplete` - Provide intelligent suggestions
- `accessibility_check` - Verify accessibility compliance

## Routing Logic

The router automatically decides where to execute tasks:

### Routes to Local (TFLite)

- Privacy required (`requiresPrivacy: true`)
- Offline mode (`isOffline: true`)
- Ultra-low latency needed (`needsUnder100ms: true`)
- Simple tasks (classification, validation)
- Default for cost and speed

### Routes to Edge (Workers AI)

- Advanced models needed (`needsAdvancedModel: true`)
- Latest data required (`needsLatestData: true`)
- Complex tasks (intent detection, entity extraction)

### Fallback Behavior

- Local fails → Falls back to edge (if enabled)
- Edge fails → Falls back to local (if enabled)
- Both fail → Returns error result

## Advanced Usage

### Direct Engine Access

```typescript
import { getLocalAI, getEdgeAI } from '@liquid-ui/ai-engine';

// Use local AI directly
const localAI = getLocalAI();
const result = await localAI.execute({
  type: 'text_classification',
  input: 'Great service!',
});

// Use edge AI directly
const edgeAI = getEdgeAI();
const result = await edgeAI.execute({
  type: 'intent_detection',
  input: 'Show me my orders',
});
```

### Metrics and Statistics

```typescript
import { getRouter } from '@liquid-ui/ai-engine';

const router = getRouter();

// Get detailed metrics
const metrics = router.getMetrics();
console.log(metrics);
// {
//   localInferences: 45,
//   edgeInferences: 12,
//   fallbacks: 2,
//   averageLocalLatency: 52.3,
//   averageEdgeLatency: 234.5,
//   errors: 1
// }

// Get routing statistics
const stats = router.getStats();
console.log(stats);
// {
//   totalInferences: 57,
//   localPercentage: 78.9,
//   edgePercentage: 21.1,
//   fallbackRate: 3.5,
//   errorRate: 1.8,
//   averageLocalLatency: 52.3,
//   averageEdgeLatency: 234.5
// }

// Reset metrics
router.resetMetrics();
```

### Custom Configuration

```typescript
import { initializeRouter } from '@liquid-ui/ai-engine';

const router = initializeRouter({
  enableLocalAI: true, // Enable local TFLite
  enableEdgeAI: true, // Enable edge Workers AI
  maxLocalLatency: 100, // Max acceptable local latency (ms)
  fallbackToEdge: true, // Fallback to edge if local fails
  modelCacheDir: '@liquid-ui/models', // Model cache location
  edgeEndpoint: 'https://api.liquid-ui.dev',
  edgeApiKey: process.env.LIQUID_UI_API_KEY,
});
```

## Model Management

### Local Models (TFLite)

The engine automatically manages local models:

- Downloaded on first use
- Cached in AsyncStorage
- Lazy-loaded for memory efficiency
- ~20MB total for all models

Default models:
- Text classification (5MB)
- Form validation (4MB)
- Autocomplete (6MB)
- Accessibility check (5MB)

### Edge Models (Workers AI)

Available models at edge:
- `@cf/meta/llama-3-8b-instruct` - Advanced LLM
- `@cf/mistral/mistral-7b-instruct-v0.1` - Fast LLM
- `@cf/huggingface/distilbert-sst-2-int8` - Text classification
- And 50+ more models

## Performance

### Local AI (TFLite)

- **Latency**: 20-100ms
- **Privacy**: 100% on-device
- **Offline**: Full functionality
- **Cost**: $0 (free)
- **Models**: 4 optimized models (~20MB)

### Edge AI (Workers AI)

- **Latency**: 200-500ms
- **Privacy**: Data sent to edge
- **Offline**: Requires network
- **Cost**: ~$0.011 per 1K neurons
- **Models**: 50+ cutting-edge models

### Hybrid Benefits

- **Best of both**: Speed + capability
- **Cost-effective**: 80% local, 20% edge
- **Always available**: Automatic fallback
- **Privacy-preserved**: Sensitive data stays local

## Architecture

```
┌─────────────────────────────────────────┐
│         Hybrid AI Router                │
│  (Intelligent routing decisions)        │
└───────────┬─────────────────────┬───────┘
            │                     │
    ┌───────▼────────┐    ┌──────▼────────┐
    │   Local AI     │    │   Edge AI     │
    │  (TFLite)      │    │ (Workers AI)  │
    │                │    │               │
    │ • Privacy      │    │ • Advanced    │
    │ • Speed        │    │ • Latest data │
    │ • Offline      │    │ • 50+ models  │
    │ • Free         │    │ • GPU-powered │
    └────────────────┘    └───────────────┘
```

## Error Handling

All errors are gracefully handled with fallbacks:

```typescript
const result = await routeAIRequest({
  type: 'text_classification',
  input: 'Test input',
});

if (result.error) {
  console.error('AI execution failed:', result.error);
  console.log('Executed at:', result.executedAt); // 'fallback'
}
```

## React Native Integration

```typescript
import { useEffect, useState } from 'react';
import { initializeLocalAI, initializeEdgeAI, initializeRouter } from '@liquid-ui/ai-engine';

function useAI() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeLocalAI();
      initializeEdgeAI({
        endpoint: 'https://api.liquid-ui.dev',
      });
      initializeRouter();
      setReady(true);
    }
    init();
  }, []);

  return { ready };
}

// In your component
function MyComponent() {
  const { ready } = useAI();

  if (!ready) {
    return <Text>Loading AI...</Text>;
  }

  // Use AI...
}
```

## License

MIT
