# Inference UI Examples

Collection of example code demonstrating Inference UI's AI-native features.

## React Streaming Examples (NEW)

### chat-app.tsx
Full-featured chat application with streaming AI:
- Real-time message streaming with `useChat`
- Conversation history management
- Message status indicators
- Stop, retry, and regenerate controls
- Beautiful glassmorphic UI
- Mobile-responsive design

### recipe-generator.tsx
Type-safe recipe generation with Zod:
- Progressive object streaming with `useObject`
- Zod schema validation in real-time
- Partial object updates during streaming
- Save and manage generated recipes
- Preset prompt templates
- Nutrition information display

### code-autocomplete.tsx
Real-time code suggestions:
- Code completion with `useCompletion`
- Debounced autocomplete triggers
- Keyboard shortcuts (Tab, Esc, Ctrl+Space)
- Inline suggestion overlay
- Multiple language examples
- Monaco-style editor

## React Native Examples

### AIExamples.tsx
Complete examples of AI engine integration:
- AI initialization and status monitoring
- Text classification with sentiment analysis
- AI-powered form validation
- Autocomplete with debouncing
- Accessibility checking
- Real-time AI metrics

### EventTrackingExamples.tsx
Event tracking patterns and best practices:
- Component lifecycle tracking
- Screen view tracking
- Button press tracking
- Form interaction tracking
- Custom event tracking
- Performance tracking
- Error tracking

### FlowExamples.tsx
Flow-based UX pattern examples:
- Basic flow navigation
- Wizard-style flows
- Onboarding flows
- Checkout flows with validation
- Conditional flow routing
- Flow analytics integration

### VelvetDemo.tsx
Comprehensive demo combining all features:
- AI-powered components
- Event tracking throughout
- Flow-based navigation
- Velvet Glass design system
- Real-time metrics display

## Running React Streaming Examples

### Prerequisites

```bash
npm install inference-ui-react zod
```

### Setup Backend

Deploy the streaming endpoints to Cloudflare:

```bash
cd packages/@inference-ui/cloudflare
wrangler deploy
```

Your API will be available at: `https://inference-ui-api.neureus.workers.dev`

### Use in Your React App

```tsx
import ChatApp from './examples/chat-app';
import RecipeGenerator from './examples/recipe-generator';
import CodeAutocomplete from './examples/code-autocomplete';

// Use in your app
export default function App() {
  return (
    <div>
      <ChatApp />
      {/* or */}
      <RecipeGenerator />
      {/* or */}
      <CodeAutocomplete />
    </div>
  );
}
```

### Quick Start

```tsx
import { useChat } from 'inference-ui-react';

function QuickChatExample() {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: 'https://inference-ui-api.neureus.workers.dev/stream/chat',
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{/* render message */}</div>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={() => append({ role: 'user', content: input })}>
        Send
      </button>
    </div>
  );
}
```

## Running React Native Examples

These examples are meant to be imported into React Native applications.

For a complete, runnable demo see:
- [`../velvet-demo-app/`](../velvet-demo-app/) - Standalone Expo app

### Usage

```tsx
import { AIInitializationExample } from './examples/AIExamples';
import { EventTrackingExample } from './examples/EventTrackingExamples';
import { FlowExample } from './examples/FlowExamples';

// Use in your app
export default function App() {
  return (
    <EventProvider config={eventConfig}>
      <FlowProvider>
        <AIInitializationExample />
      </FlowProvider>
    </EventProvider>
  );
}
```

## Learn More

- [Inference UI Documentation](../README.md)
- [Component API](../packages/inference-ui-react-native/README.md)
- [AI Engine](../packages/@inference-ui/ai-engine/README.md)
- [Event Tracking](../packages/@inference-ui/events/README.md)
- [Flow Engine](../packages/@inference-ui/flows/README.md)
