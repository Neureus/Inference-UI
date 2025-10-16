# @inference-ui/api

Reusable API layer with GraphQL schema, resolvers, and business logic for Inference UI.

## Overview

This package contains platform-agnostic business logic that can be deployed to any serverless platform (Cloudflare Workers, AWS Lambda, Google Cloud Functions, etc.). It uses the **Adapter Pattern** to abstract away platform-specific implementations.

## Architecture

```
@inference-ui/api (Platform-Agnostic)
├── GraphQL Schema & Resolvers
├── Event Processing Logic
├── Authentication Service
└── Database/Storage/AI Abstractions

↓ (Implements)

Platform Adapters (e.g., @inference-ui/cloudflare)
├── D1DatabaseAdapter
├── AnalyticsEngineAdapter
├── KVCacheAdapter
├── R2StorageAdapter
└── WorkersAIAdapter
```

## Key Components

### 1. Database Abstraction

```typescript
import { DatabaseAdapter } from '@inference-ui/api';

// Implement for your platform
class MyDatabaseAdapter implements DatabaseAdapter {
  async getUserById(id: string): Promise<User | null> {
    // Your database implementation
  }
  // ... other methods
}
```

### 2. GraphQL API

```typescript
import { schema, resolvers, type APIContext } from '@inference-ui/api';
import { graphql, buildSchema } from 'graphql';

const graphqlSchema = buildSchema(schema);

// Build context with your adapters
const context: APIContext = {
  database: new MyDatabaseAdapter(),
  analytics: new MyAnalyticsAdapter(),
  cache: new MyCacheAdapter(),
  ai: new MyAIAdapter(),
  userId: 'user-123',
};

// Execute query
const result = await graphql({
  schema: graphqlSchema,
  source: query,
  rootValue: resolvers,
  contextValue: context,
});
```

### 3. Event Processing

```typescript
import { EventProcessor } from '@inference-ui/api';

const processor = new EventProcessor({
  database: myDatabaseAdapter,
  analytics: myAnalyticsAdapter,
  ai: myAIAdapter,
  useAI: true, // Enable AI classification
});

// Process single event
await processor.processEvent({
  event: 'button_click',
  component: 'AIButton',
  properties: { label: 'Get Started' },
});

// Process batch
const result = await processor.processBatch(events);
console.log(`Processed: ${result.processed}, Errors: ${result.errors}`);
```

### 4. Authentication Service

```typescript
import { AuthService } from '@inference-ui/api';

// Extract auth context from request headers
const authContext = AuthService.extractAuthContext(request.headers);

// Use in GraphQL context
const context: APIContext = {
  database: myDatabaseAdapter,
  userId: authContext.userId,
  sessionId: authContext.sessionId,
};
```

## Adapter Interfaces

### DatabaseAdapter

Implement this interface to connect to your database:

```typescript
interface DatabaseAdapter {
  // User operations
  getUserById(id: string): Promise<User | null>;
  createUser(user: CreateUserInput): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Flow operations
  getFlows(userId: string, limit: number, offset: number): Promise<Flow[]>;
  getFlowById(id: string): Promise<Flow | null>;
  createFlow(userId: string, input: CreateFlowInput): Promise<Flow>;
  updateFlow(id: string, userId: string, input: UpdateFlowInput): Promise<Flow>;
  deleteFlow(id: string, userId: string): Promise<boolean>;

  // Event operations
  createEvent(event: EventRecord): Promise<void>;
  getEvents(userId: string, limit: number, offset: number): Promise<EventRecord[]>;

  // Analytics operations
  getFlowAnalytics(flowId: string, timeRange: TimeRange): Promise<FlowAnalytics>;
  getUserUsage(userId: string): Promise<Usage>;
}
```

### AnalyticsAdapter

```typescript
interface AnalyticsAdapter {
  writeDataPoint(data: AnalyticsDataPoint): Promise<void>;
  query(query: string): Promise<any>;
}
```

### CacheAdapter

```typescript
interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
```

### StorageAdapter

```typescript
interface StorageAdapter {
  put(key: string, value: ArrayBuffer | ReadableStream): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}
```

### AIAdapter

```typescript
interface AIAdapter {
  run(model: string, options: AIOptions): Promise<AIResult>;
}
```

## Event Processing Features

The `EventProcessor` provides:

- **Rule-based classification**: Fast, reliable intent and sentiment detection
- **AI-powered classification**: Optional LLM-based analysis (requires AIAdapter)
- **Batch processing**: Efficient parallel event processing
- **Non-fatal analytics**: Analytics failures don't stop event processing
- **Automatic fallback**: AI failures fall back to rule-based classification

### Intent Classification

Automatically detects user intent from event names:
- `purchase` - Buy, checkout actions
- `help` - Support, contact actions
- `configure` - Settings, config actions
- `interact` - General button/tap actions
- `explore` - Navigation, view actions
- `error` - Error, fail, crash events
- `submit` - Form submissions
- `search` - Search queries
- `unknown` - Fallback

### Sentiment Classification

Automatically detects sentiment:
- `positive` - Success, complete, purchase, like, share
- `negative` - Error, fail, crash, cancel, exit
- `neutral` - Default

## Platform Implementations

### Cloudflare Workers

See `@inference-ui/cloudflare` for complete Cloudflare implementation with:
- D1DatabaseAdapter (SQLite at edge)
- AnalyticsEngineAdapter (time-series analytics)
- KVCacheAdapter (global key-value cache)
- R2StorageAdapter (S3-compatible storage)
- WorkersAIAdapter (GPU-powered AI inference)

### AWS Lambda (Coming Soon)

AWS implementation with:
- DynamoDBAdapter
- CloudWatchAnalyticsAdapter
- ElastiCacheAdapter
- S3StorageAdapter
- BedrockAIAdapter

## Development

```bash
# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Type check
npm run typecheck
```

## Benefits of This Architecture

1. **Platform Agnostic**: Deploy to any serverless platform
2. **Testable**: Easy to mock adapters for unit tests
3. **Reusable**: Share business logic across platforms
4. **Flexible**: Swap implementations without changing business logic
5. **Type Safe**: Full TypeScript support with strong typing
6. **Modular**: Clear separation of concerns

## Example: Multi-Platform Deployment

```typescript
// Cloudflare Workers
import { D1DatabaseAdapter } from '@inference-ui/cloudflare';

// AWS Lambda
import { DynamoDBAdapter } from '@inference-ui/aws';

// Google Cloud Functions
import { FirestoreAdapter } from '@inference-ui/gcp';

// All use the same resolvers and business logic
import { resolvers } from '@inference-ui/api';
```

## License

MIT
