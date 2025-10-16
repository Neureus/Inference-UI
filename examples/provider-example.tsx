/**
 * InferenceUIProvider Example
 * Demonstrates zero-config and provider-based configuration
 */

import React from 'react';
import { InferenceUIProvider, useChat, useCompletion, useObject } from 'inference-ui-react';
import { z } from 'zod';

/**
 * Example 1: Zero-config usage (uses default SaaS endpoint)
 */
function ZeroConfigChat() {
  const { messages, input, setInput, append, isLoading } = useChat();
  // No need to specify 'api' prop - uses provider default

  return (
    <div>
      <h2>Zero Config Chat</h2>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role}>
            {msg.parts.map((part, i) =>
              part.type === 'text' ? <p key={i}>{part.text}</p> : null
            )}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          append({ role: 'user', content: input });
          setInput('');
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

/**
 * Example 2: Environment-based configuration
 */
function App() {
  return (
    <InferenceUIProvider
      config={{
        // Use environment variables for production
        apiUrl: process.env.NEXT_PUBLIC_INFERENCE_API_URL,
        apiKey: process.env.NEXT_PUBLIC_INFERENCE_API_KEY,
        experimental_throttle: 50,
      }}
    >
      <div className="app">
        <h1>Inference UI - Provider Pattern</h1>

        {/* All hooks inherit provider config */}
        <ZeroConfigChat />
        <CompletionExample />
        <ObjectExample />

        {/* Can still override per-component */}
        <CustomEndpointChat />
      </div>
    </InferenceUIProvider>
  );
}

/**
 * Example 3: Completion without api prop
 */
function CompletionExample() {
  const { completion, complete, isLoading } = useCompletion();

  return (
    <div>
      <h2>Code Completion</h2>
      <button onClick={() => complete('function fibonacci(n) {')} disabled={isLoading}>
        Complete Code
      </button>
      {completion && (
        <pre>
          <code>{completion}</code>
        </pre>
      )}
    </div>
  );
}

/**
 * Example 4: Object generation without api prop
 */
const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
});

function ObjectExample() {
  const { object, submit, isLoading } = useObject({ schema: RecipeSchema });

  return (
    <div>
      <h2>Recipe Generator</h2>
      <button onClick={() => submit('Generate a recipe for pasta carbonara')} disabled={isLoading}>
        Generate Recipe
      </button>
      {object && (
        <div>
          <h3>{object.name}</h3>
          <ul>
            {object.ingredients?.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Override provider config for specific component
 */
function CustomEndpointChat() {
  const { messages, input, setInput, append, isLoading } = useChat({
    // Override provider's endpoint for this specific chat
    api: 'https://my-custom-workers.company.com/stream/chat',
    headers: {
      'X-Custom-Header': 'my-value',
    },
  });

  return (
    <div>
      <h2>Custom Endpoint Chat</h2>
      <p>This chat uses a custom endpoint instead of the provider default</p>
      {/* ... rest of chat UI ... */}
    </div>
  );
}

/**
 * Example 6: Multi-environment setup
 */
const configs = {
  development: {
    apiUrl: 'http://localhost:8787',
    experimental_throttle: 0, // No throttling in dev
  },
  staging: {
    apiUrl: 'https://inference-ui-staging.neureus.workers.dev',
    apiKey: process.env.STAGING_API_KEY,
  },
  production: {
    apiUrl: 'https://inference-ui-api.neureus.workers.dev',
    apiKey: process.env.PRODUCTION_API_KEY,
    experimental_throttle: 100,
  },
};

function MultiEnvApp() {
  const env = (process.env.NODE_ENV || 'development') as keyof typeof configs;

  return (
    <InferenceUIProvider config={configs[env]}>
      <App />
    </InferenceUIProvider>
  );
}

/**
 * Example 7: Self-hosted deployment
 */
function SelfHostedApp() {
  return (
    <InferenceUIProvider
      config={{
        // Your own Cloudflare Workers deployment
        apiUrl: 'https://my-inference.company.com',

        // Custom endpoint paths if needed
        endpoints: {
          chat: 'https://my-inference.company.com/api/chat',
          completion: 'https://my-inference.company.com/api/complete',
          object: 'https://my-inference.company.com/api/generate',
        },

        // Global headers for all requests
        headers: {
          'X-Company-Id': 'company-123',
        },
      }}
    >
      <App />
    </InferenceUIProvider>
  );
}

export default App;
