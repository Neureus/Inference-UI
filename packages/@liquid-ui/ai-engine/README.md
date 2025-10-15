# @liquid-ui/ai-engine

> Hybrid AI engine combining local TensorFlow Lite with Cloudflare Workers AI

## Features

- 🎯 **Intelligent Routing** - Automatically routes tasks between local and edge AI
- 🔒 **Privacy-First** - Sensitive data stays on-device
- ⚡ **Ultra-Low Latency** - Local inference under 100ms
- ☁️ **Advanced Models** - Cloudflare Workers AI for complex tasks
- 📊 **Performance Metrics** - Built-in monitoring and analytics

## Installation

```bash
npm install @liquid-ui/ai-engine
```

## Quick Start

```tsx
import { useAIInitialization, useTextClassification } from '@liquid-ui/ai-engine';

function MyComponent() {
  // Initialize AI engines
  const { initialized } = useAIInitialization({
    enableLocalAI: true,
    enableEdgeAI: true,
    edgeEndpoint: 'https://your-worker.workers.dev',
  });

  // Use AI features
  const { classify, result } = useTextClassification();

  return (
    <View>
      {initialized && (
        <Button
          title="Classify"
          onPress={() => classify('Great product!')}
        />
      )}
      {result && <Text>{result.label}</Text>}
    </View>
  );
}
```

## Hooks

### useAIInitialization

Initialize AI engines at app startup.

```tsx
const { initialized, loading, error } = useAIInitialization({
  enableLocalAI: true,
  enableEdgeAI: true,
  edgeEndpoint: 'https://your-worker.workers.dev',
  edgeApiKey: 'your-api-key', // optional
});
```

### useAI

Generic hook for executing any AI task.

```tsx
const { execute, loading, error, result, reset } = useAI();

// Execute task
await execute({
  type: 'text_classification',
  input: 'Hello world',
  needsUnder100ms: true, // prefer local
  requiresPrivacy: false,
});
```

### useTextClassification

Text classification (sentiment, intent, etc.).

```tsx
const { classify, loading, error, result } = useTextClassification();

await classify('This is amazing!');
// result: { label: 'positive', confidence: 0.95 }
```

### useFormValidation

AI-powered form validation.

```tsx
const { validate, loading, error, result } = useFormValidation();

await validate({
  email: 'user@example.com',
  phone: '1234567890',
});
// result: { email: { valid: true }, phone: { valid: false, message: 'Invalid' } }
```

### useAutocomplete

Autocomplete suggestions with debouncing.

```tsx
const { getSuggestions, loading, suggestions } = useAutocomplete();

// Auto-debounced (300ms default)
await getSuggestions('hel', 300);
// suggestions: ['hello', 'help', 'helicopter']
```

### useAccessibilityCheck

AI-powered accessibility validation.

```tsx
const { check, loading, result } = useAccessibilityCheck();

await check({
  type: 'Button',
  label: 'Submit',
  hasAccessibilityLabel: true,
});
// result: { score: 95, issues: [...] }
```

### useAIMetrics

Monitor AI performance.

```tsx
const { metrics, refresh } = useAIMetrics();

// metrics: {
//   localInferences: 150,
//   edgeInferences: 45,
//   averageLocalLatency: 85,
//   averageEdgeLatency: 320,
//   errors: 2
// }
```

## Routing Logic

The AI engine automatically routes tasks based on:

1. **Privacy** - `requiresPrivacy: true` always uses local
2. **Latency** - `needsUnder100ms: true` prefers local
3. **Capability** - `needsAdvancedModel: true` uses edge
4. **Connectivity** - `isOffline: true` forces local
5. **Task Type** - Simple tasks (classification) use local, complex (entity extraction) use edge

## Supported Task Types

- `text_classification` - Sentiment, intent detection
- `form_validation` - Smart form validation
- `autocomplete` - Text completion suggestions
- `accessibility_check` - WCAG compliance checking
- `sentiment_analysis` - Sentiment analysis
- `intent_detection` - User intent classification
- `entity_extraction` - Named entity recognition

## Configuration

```tsx
interface AIEngineConfig {
  enableLocalAI?: boolean;         // Default: true
  enableEdgeAI?: boolean;          // Default: true
  maxLocalLatency?: number;        // Default: 100ms
  fallbackToEdge?: boolean;        // Default: true
  modelCacheDir?: string;          // Default: '@liquid-ui/models'
  edgeEndpoint?: string;           // Required for edge AI
  edgeApiKey?: string;             // Optional API key
}
```

## Example

See [AIExamples.tsx](../../../examples/AIExamples.tsx) for complete examples.
