# @inference-ui/react

React hooks for AI streaming, chat, completions, and generative UI. Built on Cloudflare Workers AI for ultra-low latency edge inference.

## Features

- 🚀 **Streaming AI Responses** - Real-time token streaming for instant UX
- 💬 **Chat Interface** - Multi-turn conversations with message history
- ✍️ **Text Completion** - Single-turn completions for autocomplete, summarization
- 🎯 **Type-Safe Objects** - Generate structured data with Zod schema validation
- 🧩 **Generative UI** - Render custom React components from AI tool calls
- ⚡ **Edge Inference** - Powered by Cloudflare Workers AI (180+ locations)
- 🔒 **Privacy-First** - Works with local TFLite models or edge AI
- 📦 **Zero Config** - Works out of the box with sensible defaults

## Installation

```bash
npm install @inference-ui/react zod
```

## Quick Start

### Chat Interface

```tsx
import { useChat } from '@inference-ui/react';

function ChatDemo() {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: 'https://inference-ui-api.neureus.workers.dev/stream/chat',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      append({ role: 'user', content: input });
      setInput('');
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role}>
            {msg.parts
              .filter((p) => p.type === 'text')
              .map((p) => p.text)
              .join('')}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### Text Completion

```tsx
import { useCompletion } from '@inference-ui/react';

function CompletionDemo() {
  const { completion, complete, isLoading } = useCompletion({
    api: 'https://inference-ui-api.neureus.workers.dev/stream/completion',
  });

  return (
    <div>
      <button
        onClick={() => complete('Write a haiku about coding')}
        disabled={isLoading}
      >
        Generate Haiku
      </button>
      <div className="completion">{completion}</div>
    </div>
  );
}
```

### Type-Safe Object Generation

```tsx
import { useObject } from '@inference-ui/react';
import { z } from 'zod';

const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prepTime: z.number(),
});

function RecipeGenerator() {
  const { object, submit, isLoading } = useObject({
    api: 'https://inference-ui-api.neureus.workers.dev/stream/object',
    schema: RecipeSchema,
  });

  return (
    <div>
      <button
        onClick={() => submit('Generate a recipe for chocolate chip cookies')}
        disabled={isLoading}
      >
        Generate Recipe
      </button>

      {object && (
        <div>
          <h2>{object.name}</h2>
          <h3>Ingredients:</h3>
          <ul>
            {object.ingredients?.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
          <h3>Instructions:</h3>
          <ol>
            {object.instructions?.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {object.prepTime && <p>Prep time: {object.prepTime} minutes</p>}
        </div>
      )}
    </div>
  );
}
```

## API Reference

### `useChat`

Hook for building conversational AI interfaces with streaming responses.

#### Parameters

```typescript
interface ChatConfig {
  api: string;                           // Required: API endpoint
  id?: string;                           // Optional: Chat session ID
  initialMessages?: UIMessage[];         // Optional: Initial conversation history
  maxMessages?: number;                  // Optional: Limit conversation length
  headers?: HeadersConfig;               // Optional: Custom headers
  body?: BodyConfig;                     // Optional: Additional request data
  credentials?: RequestCredentials;      // Optional: CORS credentials
  onFinish?: (message: UIMessage) => void;  // Optional: Callback on completion
  onError?: (error: Error) => void;      // Optional: Error handler
  experimental_throttle?: number;        // Optional: Throttle updates (ms)
}
```

#### Return Value

```typescript
interface UseChatResult {
  messages: UIMessage[];                    // Conversation history
  input: string;                            // Current input value
  setInput: (input: string) => void;        // Update input
  status: StreamStatus;                     // 'ready' | 'streaming' | 'submitted' | 'error'
  error: Error | null;                      // Current error
  append: (message) => Promise<void>;       // Send message
  reload: () => Promise<void>;              // Regenerate last response
  stop: () => void;                         // Stop streaming
  isLoading: boolean;                       // Is currently processing
  data?: unknown;                           // Metadata from response
}
```

#### Example with Advanced Features

```tsx
import { useChat } from '@inference-ui/react';
import { MessageList } from '@inference-ui/react';

function AdvancedChat() {
  const {
    messages,
    input,
    setInput,
    append,
    reload,
    stop,
    isLoading,
    error,
  } = useChat({
    api: '/stream/chat',
    initialMessages: [
      {
        id: '1',
        role: 'system',
        parts: [{ type: 'text', text: 'You are a helpful assistant.' }],
        createdAt: new Date(),
      },
    ],
    maxMessages: 20,
    headers: {
      'Authorization': 'Bearer your-token',
    },
    onFinish: (message) => {
      console.log('Assistant responded:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  return (
    <div>
      {/* Use built-in MessageList component */}
      <MessageList messages={messages} />

      {error && <div className="error">{error.message}</div>}

      <form onSubmit={(e) => {
        e.preventDefault();
        append({ role: 'user', content: input });
        setInput('');
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
        {isLoading && <button onClick={stop}>Stop</button>}
      </form>

      <button onClick={reload} disabled={isLoading || messages.length === 0}>
        Regenerate
      </button>
    </div>
  );
}
```

### `useCompletion`

Hook for single-turn text completions with streaming.

#### Parameters

```typescript
interface CompletionConfig {
  api: string;                              // Required: API endpoint
  id?: string;                              // Optional: Completion ID
  initialInput?: string;                    // Optional: Initial input
  initialCompletion?: string;               // Optional: Initial completion
  headers?: HeadersConfig;                  // Optional: Custom headers
  body?: BodyConfig;                        // Optional: Additional request data
  credentials?: RequestCredentials;         // Optional: CORS credentials
  onFinish?: (completion: string) => void;  // Optional: Callback on completion
  onError?: (error: Error) => void;         // Optional: Error handler
  experimental_throttle?: number;           // Optional: Throttle updates (ms)
}
```

#### Return Value

```typescript
interface UseCompletionResult {
  completion: string;                       // Current completion text
  input: string;                            // Current input value
  setInput: (input: string) => void;        // Update input
  status: StreamStatus;                     // Current status
  error: Error | null;                      // Current error
  complete: (prompt: string) => Promise<string>;  // Generate completion
  reload: () => Promise<string>;            // Regenerate last completion
  stop: () => void;                         // Stop streaming
  isLoading: boolean;                       // Is currently processing
  data?: unknown;                           // Metadata from response
}
```

#### Example: Autocomplete

```tsx
import { useCompletion } from '@inference-ui/react';

function Autocomplete() {
  const { completion, complete, isLoading } = useCompletion({
    api: '/stream/completion',
    experimental_throttle: 50, // Update every 50ms
  });

  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Trigger autocomplete after 2 seconds of no typing
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      complete(`Continue this text: ${value}`);
    }, 2000);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Start typing..."
      />
      {isLoading && <div className="completion-preview">{completion}</div>}
    </div>
  );
}
```

### `useObject`

Hook for type-safe structured data generation with Zod validation.

#### Parameters

```typescript
interface ObjectConfig<T extends z.ZodType> {
  api: string;                              // Required: API endpoint
  schema: T;                                // Required: Zod schema
  id?: string;                              // Optional: Object generation ID
  initialValue?: z.infer<T>;                // Optional: Initial object
  headers?: HeadersConfig;                  // Optional: Custom headers
  body?: BodyConfig;                        // Optional: Additional request data
  credentials?: RequestCredentials;         // Optional: CORS credentials
  onFinish?: (object: z.infer<T>) => void;  // Optional: Callback on completion
  onError?: (error: Error) => void;         // Optional: Error handler
  experimental_throttle?: number;           // Optional: Throttle updates (ms)
}
```

#### Return Value

```typescript
interface UseObjectResult<T> {
  object: Partial<T> | undefined;           // Current object (partial during streaming)
  input: string;                            // Current input value
  setInput: (input: string) => void;        // Update input
  status: StreamStatus;                     // Current status
  error: Error | null;                      // Current error
  validationError: z.ZodError | null;       // Validation errors
  submit: (prompt: string) => Promise<T | undefined>;  // Generate object
  reload: () => Promise<T | undefined>;     // Regenerate last object
  stop: () => void;                         // Stop streaming
  isLoading: boolean;                       // Is currently processing
  isValidating: boolean;                    // Has validation errors
  data?: unknown;                           // Metadata from response
}
```

#### Example: Form Data Generation

```tsx
import { useObject } from '@inference-ui/react';
import { z } from 'zod';

const UserProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18).max(120),
  interests: z.array(z.string()),
  bio: z.string().optional(),
});

function ProfileGenerator() {
  const {
    object,
    submit,
    validationError,
    isLoading,
    isValidating,
  } = useObject({
    api: '/stream/object',
    schema: UserProfileSchema,
    onFinish: (profile) => {
      console.log('Generated profile:', profile);
      // Save to database
    },
  });

  return (
    <div>
      <button
        onClick={() => submit('Generate a profile for a software engineer who loves hiking')}
        disabled={isLoading}
      >
        Generate Profile
      </button>

      {object && (
        <form>
          <input
            type="text"
            value={object.name || ''}
            placeholder="Name"
            readOnly={isLoading}
          />
          <input
            type="email"
            value={object.email || ''}
            placeholder="Email"
            readOnly={isLoading}
          />
          <input
            type="number"
            value={object.age || ''}
            placeholder="Age"
            readOnly={isLoading}
          />
          {/* ... more fields */}
        </form>
      )}

      {validationError && (
        <div className="validation-errors">
          {validationError.errors.map((err, i) => (
            <div key={i}>{err.path.join('.')}: {err.message}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Generative UI

Render custom React components from AI tool calls.

### Tool Registry

```tsx
import { ToolRegistry } from '@inference-ui/react';
import { z } from 'zod';

// Define a tool
const weatherTool = {
  name: 'getWeather',
  description: 'Get weather for a location',
  parameters: z.object({
    location: z.string(),
    unit: z.enum(['celsius', 'fahrenheit']).optional(),
  }),
  execute: async (args) => {
    const response = await fetch(`/api/weather?location=${args.location}`);
    return response.json();
  },
  renderComponent: (result, state) => {
    if (state === 'output-error') {
      return <div className="error">Failed to get weather</div>;
    }

    return (
      <div className="weather-card">
        <h3>{result.location}</h3>
        <div className="temp">{result.temperature}°</div>
        <div className="conditions">{result.conditions}</div>
      </div>
    );
  },
};

// Register tool
ToolRegistry.register(weatherTool);
```

### Message Rendering

```tsx
import { MessageList, ToolRenderer } from '@inference-ui/react';

function ChatWithTools() {
  const { messages } = useChat({
    api: '/stream/chat',
    body: {
      tools: ToolRegistry.getDefinitions(), // Send tool definitions to API
    },
  });

  return (
    <MessageList
      messages={messages}
      showMetadata={false}
      className="chat-messages"
    />
  );
}
```

## Advanced Usage

### Custom Headers (Authentication)

```tsx
const { messages, append } = useChat({
  api: '/stream/chat',
  headers: async () => {
    const token = await getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'X-User-ID': userId,
    };
  },
});
```

### Custom Request Body

```tsx
const { completion, complete } = useCompletion({
  api: '/stream/completion',
  body: {
    model: 'llama-3.1-70b',
    temperature: 0.7,
    maxTokens: 500,
  },
});
```

### Progressive Loading States

```tsx
const { completion, isLoading, status } = useCompletion({
  api: '/stream/completion',
});

return (
  <div>
    {status === 'submitted' && <Spinner />}
    {status === 'streaming' && <div className="streaming-indicator">●</div>}
    {status === 'error' && <div className="error">Failed</div>}
    <div className="completion">{completion}</div>
  </div>
);
```

### Error Handling

```tsx
const { error, reload } = useChat({
  api: '/stream/chat',
  onError: (error) => {
    // Log to error tracking service
    trackError(error);
    // Show user-friendly message
    toast.error('Failed to send message. Please try again.');
  },
});

// Manual retry
if (error) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reload}>Retry</button>
    </div>
  );
}
```

## Backend Setup

### Cloudflare Workers

See the [`@inference-ui/cloudflare`](../cloudflare/) package for backend implementation.

Deploy streaming endpoints:

```bash
cd packages/@inference-ui/cloudflare
wrangler deploy
```

Available endpoints:
- `POST /stream/chat` - Conversational AI
- `POST /stream/completion` - Text completions
- `POST /stream/object` - Object generation

### Custom Backend

Implement your own streaming endpoint that returns Server-Sent Events (SSE):

```typescript
// Example Express.js endpoint
app.post('/stream/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send message-start event
  res.write(`data: ${JSON.stringify({
    type: 'message-start',
    message: { role: 'assistant', parts: [] }
  })}\n\n`);

  // Stream tokens
  for await (const token of aiStream) {
    res.write(`data: ${JSON.stringify({
      type: 'message-part',
      part: { type: 'text', text: token }
    })}\n\n`);
  }

  // Send done event
  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  res.end();
});
```

## TypeScript

Full TypeScript support with strict type inference:

```typescript
import type {
  UIMessage,
  MessagePart,
  StreamStatus,
  ToolDefinition,
} from '@inference-ui/react';

// Type-safe tool definition
const myTool: ToolDefinition<{ query: string }, SearchResults> = {
  name: 'search',
  description: 'Search the web',
  parameters: z.object({ query: z.string() }),
  execute: async (args) => {
    return await searchAPI(args.query);
  },
};

// Type inference works automatically
const { object } = useObject({
  schema: UserSchema,
  api: '/stream/object',
});
// object is typed as Partial<z.infer<typeof UserSchema>>
```

## Performance

- **Edge Inference**: <100ms latency globally via Cloudflare Workers AI
- **Progressive Streaming**: Instant UI feedback as tokens arrive
- **Efficient Bundling**: Tree-shakable exports, ~15KB gzipped
- **Optimized Rendering**: React.memo and efficient state updates
- **Request Batching**: Automatic message batching for efficiency

## Examples

See [`/examples`](../../examples/) for complete demo applications:

- **Chat Application** - Full-featured chat with message history
- **Code Autocomplete** - Real-time code suggestions
- **Form Generator** - Dynamic form generation from schemas
- **Recipe Generator** - Structured data with validation
- **Customer Support Bot** - Multi-turn conversations with context

## Contributing

See [CONTRIBUTING.md](../../../CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](../../../LICENSE)
