# Inference UI Examples

Collection of example code demonstrating Inference UI's AI-native features.

## Complete Integration Example (⭐ NEW)

### complete-integration-example.tsx
**The ultimate integration showcase** - demonstrates all Inference UI packages working together in a single application:

**Features:**
- ✅ InferenceUIProvider for zero-config streaming AI
- ✅ EventProvider for automatic analytics tracking
- ✅ Hybrid AI Engine (local TFLite + edge Workers AI)
- ✅ Real-time AI metrics and performance monitoring
- ✅ Smart form with AI validation and sentiment analysis
- ✅ Streaming chat with automatic event tracking
- ✅ Analytics dashboard with live metrics
- ✅ Error tracking and performance monitoring

**Demonstrates:**
- Provider pattern for unified configuration
- Hybrid AI routing (local vs edge decisions)
- Event tracking throughout the entire app
- Streaming AI with real-time updates
- Form validation with AI + Zod
- Text classification and sentiment analysis
- Performance metrics and monitoring
- Error handling and recovery

**Perfect for:** Learning how all packages work together, understanding the complete architecture, building production applications.

## AI Components Demo (⭐ NEW)

### ai-components-demo.tsx
**Complete showcase of all AI-powered components** - demonstrates production-ready components with built-in AI capabilities:

**Featured Components:**
- 🎨 **AIForm** - Smart forms with AI validation and Zod schemas
- 📝 **AIInput** - Intelligent input with autocomplete suggestions
- 💬 **ChatInterface** - Complete chat UI with streaming responses
- 🔍 **SearchBox** - AI-powered search with semantic suggestions

**8 Complete Examples:**
1. **User Registration Form** - Smart validation with AI assistance
2. **Product Feedback Form** - Complex multi-field forms
3. **Email Autocomplete** - Intelligent email suggestions
4. **Search Query Input** - Search autocomplete with debouncing
5. **Customer Support Chat** - Full chat with initial messages
6. **AI Assistant Chat** - Fresh conversation interface
7. **Documentation Search** - Search with AI suggestions
8. **Product Search** - E-commerce search with filtering

**Demonstrates:**
- Real-time AI autocomplete with debouncing
- Progressive validation on blur
- Keyboard navigation (Arrow keys, Enter, Escape)
- Streaming chat with auto-scroll
- Search history and suggestions
- Custom styling and theming
- Error handling and loading states

**Perfect for:** Learning component APIs, building AI-powered UIs, understanding best practices.

## React Streaming Examples

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
