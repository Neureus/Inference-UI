# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Inference UI** is an AI-native cross-platform UI component library that integrates AI capabilities into every component. The project combines intelligent, adaptive user interfaces with built-in event intelligence and is optimized for AI-assisted development workflows.

### Core Vision

- **AI-Native Components**: Every component includes built-in AI capabilities (validation, autocomplete, adaptation)
- **AI-Optimized Development**: Designed for seamless integration with AI coding tools like Claude Code
- **Built-in Event Intelligence**: Zero-configuration analytics platform integrated at the component layer
- **Cross-Platform**: Unified components across web (React, Vue, Angular), mobile (React Native, Flutter), and desktop
- **Privacy-First**: Local AI processing with optional cloud enhancement
- **Open Source + SaaS Hybrid**: Free open-source foundation with premium SaaS tiers

### Business Model

- **Open Source (Free)**: Core library with basic AI features, local processing, essential templates
- **Developer Tier ($29/mo)**: Enhanced AI models, advanced code generation, premium integrations
- **Business Tier ($199/mo)**: Advanced analytics, real-time optimization, unlimited events
- **Enterprise Tier (Custom)**: Private cloud, on-premises, custom AI models, compliance features

## Technology Stack

### Current Status
**Phase 1 Implementation Started**: Inference UI Glass design system prototype has been implemented.

- **Completed**: Expo-based glassmorphism design system with React Native
- **Location**: `liquid-glass-app/` directory
- **Status**: Working prototype with example showcase

### Planned Architecture

#### Core Technologies
- **TypeScript**: Primary development language with full type safety
- **Monorepo Structure**: Using Lerna or Nx for multi-package management
- **WebAssembly**: For local AI model execution in browsers
- **React 18+**: Primary web framework with concurrent features
- **React Native 0.70+**: Mobile implementation with new architecture
- **Flutter/Dart**: Alternative mobile/desktop implementation

#### AI & ML Stack (Hybrid Architecture)
**Local AI (On-Device)**:
- **TensorFlow Lite**: Mobile AI via react-native-fast-tflite
- **ONNX Runtime Mobile**: Cross-platform model execution
- **Local Models**: Form validation, text classification, autocomplete (~20MB total)
- **Privacy-First**: All sensitive data processed locally

**Edge AI (Cloudflare Workers AI)**:
- **Workers AI**: 180+ edge locations for AI inference
- **Available Models**: Llama 3.1, Mistral, Stable Diffusion, Whisper, ResNet-50
- **Use Cases**: Advanced LLM, text-to-image, speech recognition, image classification
- **Performance**: <100ms latency globally

**Hybrid Decision Engine**:
- Privacy/Offline/Speed → Local TFLite
- Advanced/Complex → Cloudflare Workers AI

#### Cloudflare Platform (Complete Stack)
**Compute & AI**:
- **Cloudflare Workers**: Serverless edge compute (180+ locations)
- **Workers AI**: GPU-powered AI inference at edge
- **Durable Objects**: Stateful edge compute for real-time features

**Storage**:
- **D1**: SQLite database at edge (users, flows, configs)
- **R2**: S3-compatible object storage (models, exports, backups)
- **KV**: Global key-value cache (sessions, AI results, rate limits)
- **Vectorize**: Vector database for embeddings and semantic search

**Analytics & Events**:
- **Analytics Engine**: Time-series database for event data
- **Queues**: Message queuing for async processing
- **Real-time Streams**: WebSocket via Durable Objects

**Deployment & CI/CD**:
- **Cloudflare Pages**: Frontend hosting with edge functions
- **Wrangler**: CLI for local dev and deployment
- **GitHub Actions**: CI/CD integration

**Business Services**:
- **Billing**: Stripe integration via Workers
- **Authentication**: Multi-tenant auth with D1 + KV
- **GraphQL API**: Edge API via Cloudflare Workers

## Module Structure (Monorepo)

```
packages/
├── @inference-ui/core                - Platform-agnostic logic
├── @inference-ui/react-native        - React Native components (PRIMARY)
├── @inference-ui/react               - React web (Phase 3)
├── @inference-ui/vue                 - Vue integration (Phase 3)
├── @inference-ui/ai-engine            - AI processing layer
│   ├── local/                     - TFLite on-device AI
│   ├── edge/                      - Cloudflare Workers AI
│   └── hybrid/                    - Local vs Edge routing
├── @inference-ui/events              - Event intelligence
│   ├── capture/                   - Auto-capture middleware
│   ├── enrichment/                - AI event enrichment
│   ├── storage/                   - Local queue (AsyncStorage)
│   └── sinks/                     - Output adapters
├── @inference-ui/flows               - UX flow engine
│   ├── engine/                    - Flow orchestration
│   ├── templates/                 - Pre-built flows
│   └── analytics/                 - Flow metrics
├── @inference-ui/cloudflare          - Cloudflare integrations
│   ├── workers/                   - Edge Workers
│   ├── api/                       - GraphQL API
│   ├── analytics/                 - Analytics Engine integration
│   └── storage/                   - D1, R2, KV, Durable Objects
└── @inference-ui/dev-tools           - Developer tooling
    ├── cli/                       - Command line tools
    ├── generators/                - Code generators
    └── wrangler-integration/      - Cloudflare dev tools
```

## Development Workflow

### AI-Optimized Development Approach
All components should include:
1. **Intent Documentation**: Natural language description of component purpose
2. **Semantic Metadata**: AI-parseable component definitions
3. **Usage Examples**: Both code and natural language examples
4. **Development Prompts**: Hints for AI coding assistants

### Component Development Pattern

```typescript
// AI-optimized component definition
export const LoginForm = createAIComponent({
  intent: "Create a secure login form with validation and accessibility",
  semantics: {
    purpose: "user-authentication",
    sensitivity: "high",
    accessibility: "enhanced"
  },
  aiCapabilities: ["smart-validation", "auto-focus", "error-guidance"],
  devPrompts: {
    usage: "Use for user login screens with built-in security best practices",
    variants: "Supports social login, 2FA, and password reset flows",
    customization: "Fully themeable with design system integration"
  }
});
```

### Flow Development Pattern

```typescript
// UX flow with AI intelligence
const AuthFlow = createAIFlow({
  name: "SmartAuthFlow",
  intent: "Secure user authentication with adaptive security",
  steps: [
    { component: "EmailCapture", aiFeatures: ["spam-detection"] },
    { component: "SecurityAssessment", ai: "risk-based-auth" },
    { component: "ProfileCompletion", trigger: "conditional" }
  ],
  analytics: ["conversion-tracking", "friction-analysis"]
});
```

## Key Architectural Principles

### 1. AI-First Design
- Every component has built-in AI capabilities
- Local processing by default, cloud enhancement opt-in
- Zero-configuration intelligence with smart defaults
- Progressive enhancement based on available resources

### 2. Privacy-First Analytics
- Automatic event capture with zero configuration
- Local-first processing with optional cloud sync
- GDPR/CCPA compliant by design
- End-to-end encryption for all data

### 3. Cross-Platform Consistency
- Framework-agnostic core architecture
- Platform-specific adapters for rendering
- Shared AI models across all platforms
- Unified developer experience

### 4. Performance Requirements
- Initial bundle size < 100KB (gzipped) for core library
- Component load time < 50ms
- AI processing latency < 200ms (local)
- Memory overhead < 50MB for AI capabilities
- Tree-shakable exports for optimal bundle size

### 5. Accessibility Requirements
- WCAG 2.2 AA compliance minimum
- AI-powered accessibility enhancements
- Automatic ARIA labels and descriptions
- Full keyboard navigation support
- Screen reader optimization

## Development Commands

**Note**: Commands will be defined once the project structure is initialized.

Typical commands will include:
```bash
# Development
npm run dev              # Start development server
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Lint codebase

# Package-specific
npm run build:core       # Build core package
npm run test:react       # Test React package
npm run dev:examples     # Run example applications

# AI Development Tools
npm run generate         # AI-powered component generation
npm run analyze          # Analyze component semantics
npm run optimize         # Bundle size optimization
```

## Testing Strategy

### Component Testing
- Unit tests for all components
- Visual regression testing
- Accessibility testing (axe-core)
- Performance benchmarking
- AI behavior validation

### Integration Testing
- Cross-framework compatibility
- Analytics event capture validation
- Flow composition and navigation
- Third-party integrations

### E2E Testing
- Complete user flows
- Cross-browser testing
- Mobile device testing
- AI feature validation

## Security Considerations

### AI Model Security
- Signed and verified AI models only
- Regular security audits of models
- Sandboxed model execution
- No sensitive data in model inputs

### Data Privacy
- No PII transmitted without explicit consent
- Local-first data processing
- Encrypted data transmission
- Audit logging for compliance

### Dependency Security
- Regular dependency updates
- Automated vulnerability scanning
- Minimal dependency footprint
- Verified package sources

## Documentation Requirements

All code should include:
1. **TypeScript Types**: Comprehensive type definitions
2. **JSDoc Comments**: AI-readable documentation
3. **Usage Examples**: Code examples for common use cases
4. **Intent Documentation**: Natural language purpose descriptions
5. **Performance Notes**: Expected performance characteristics
6. **Accessibility Notes**: A11y features and requirements

## Development Priorities (Phase 1: Months 1-6)

1. **Core Architecture Setup**
   - Monorepo structure with TypeScript
   - Build system and tooling
   - Testing infrastructure
   - CI/CD pipeline

2. **Core AI Engine**
   - WebAssembly runtime setup
   - Basic AI model integration
   - Local processing capabilities
   - Model loading and caching

3. **React Component Library**
   - Basic components (Button, Input, Form, Table)
   - Layout components
   - AI-enhanced validation
   - Accessibility features

4. **Event Intelligence Platform**
   - Automatic event capture
   - Local event processing
   - Real-time streaming
   - Basic analytics

5. **Flow Engine**
   - Flow composition framework
   - Navigation and routing
   - State management
   - 5+ essential flow templates

6. **Claude Code Integration**
   - Semantic metadata system
   - Component generation tools
   - Development workflows
   - AI-optimized APIs

7. **Documentation**
   - API documentation
   - Getting started guides
   - Component examples
   - AI integration tutorials

## Key Design Patterns

### Component Composition
- Use composition over inheritance
- Provide both controlled and uncontrolled variants
- Support render props and slots patterns
- Enable deep customization via props

### AI Integration
- Lazy-load AI models on demand
- Cache AI processing results
- Provide fallbacks for unsupported environments
- Allow AI feature opt-out

### Event Intelligence
- Capture events automatically via component lifecycle
- Enrich events with AI context
- Batch events for efficient processing
- Respect privacy preferences

### State Management
- Component-level state by default
- Optional global state integration
- AI-powered state optimization
- Predictable state updates

## Reference Documentation

- **PRD**: See `ai-native-ui-library-prd.md` for complete product requirements
- **Target Metrics**: 10K+ GitHub stars, 100K+ weekly downloads, $16M ARR by Year 3
- **Success Criteria**: See PRD sections on success metrics and roadmap

## Inference UI Glass Design System (Prototype)

### Overview
An Expo-based glassmorphism design system implemented as the first prototype for the Inference UI project. Located in `liquid-glass-app/`.

### Technology Stack
- **Expo SDK 54**: Cross-platform framework
- **expo-blur**: Cross-platform blur effects (iOS, Android, Web)
- **expo-glass-effect**: Native iOS liquid glass effects
- **expo-linear-gradient**: Animated gradient backgrounds
- **TypeScript**: Full type safety
- **React Native 0.81.4**: Mobile-first implementation

### Design System Structure

```
liquid-glass-app/src/design-system/
├── theme/
│   ├── colors.ts       - Glass color variants and palette
│   ├── spacing.ts      - Spacing scale (0-96)
│   ├── typography.ts   - Type system
│   ├── glass.ts        - Glass effect presets
│   └── index.ts        - Theme exports
├── primitives/
│   ├── GlassView.tsx   - Core glass component
│   ├── GlassCard.tsx   - Card with glass effects
│   ├── GlassText.tsx   - Typography component
│   ├── GlassButton.tsx - Interactive glass button
│   └── index.ts        - Component exports
└── utils/
    └── GradientBackground.tsx - Gradient backgrounds
```

### Core Components

#### GlassView
- Base component for glassmorphism effects
- Uses native iOS glass when available (expo-glass-effect)
- Falls back to BlurView for cross-platform support
- Configurable blur intensity (1-100)
- Multiple tint options (light, dark, default)
- Shadow and border radius variants

#### GlassCard
- Card component with padding/margin utilities
- Extends GlassView with layout features
- Spacing system integration (theme.spacing)

#### GlassText
- Typography optimized for glass backgrounds
- Text shadows for better contrast
- Variant system (heading, body, caption)
- Full size and weight scales

#### GlassButton
- Interactive button with press animations
- Opacity and scale transitions
- Disabled state support
- Full-width and auto-width modes

#### GradientBackground
- Linear gradients for glass layering
- Predefined gradient sets (aurora, sunset, ocean, forest, cosmic)

### Glass Style Presets

```typescript
// Available in theme.glass.styles
'subtle'      // Minimal blur (10), high transparency
'light'       // Moderate blur (25), light transparency
'medium'      // Balanced blur (50), moderate transparency
'strong'      // Heavy blur (75), moderate transparency
'darkSubtle'  // Dark variant with minimal blur
'darkMedium'  // Dark variant with moderate blur
'darkStrong'  // Dark variant with heavy blur
```

### Development Commands

```bash
cd liquid-glass-app

# Start development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web
```

### Example Usage

```typescript
import {
  GradientBackground,
  GlassCard,
  GlassText,
  GlassButton,
  theme,
} from './src/design-system';

<GradientBackground gradient="aurora">
  <GlassCard
    glassStyle="medium"
    padding={6}
    borderRadius="xl"
    shadow="lg"
  >
    <GlassText variant="heading" size="2xl" weight="bold">
      Welcome to Inference UI Glass
    </GlassText>
    <GlassButton
      title="Get Started"
      glassStyle="strong"
      onPress={() => console.log('Pressed')}
    />
  </GlassCard>
</GradientBackground>
```

### Platform-Specific Features

**iOS (26+):**
- Native liquid glass effects via UIVisualEffectView
- Smooth, performant blur rendering
- System-level glass materials

**Android/Web:**
- Cross-platform blur via expo-blur
- Consistent visual appearance
- Fallback to styled views when blur unavailable

### Performance Characteristics

- Lazy component loading
- Optimized blur rendering
- Minimal re-renders with React.memo patterns
- Native glass performance on iOS
- Efficient gradient rendering with expo-linear-gradient

### Next Steps for Full Inference UI Integration

1. **Monorepo Setup**: Move liquid-glass-app to `@inference-ui/react-native` package
2. **Cloudflare Workers**: Setup edge infrastructure
3. **Hybrid AI Engine**: Integrate local TFLite + Cloudflare Workers AI
4. **Event Pipeline**: Implement capture → Workers → Analytics Engine
5. **Flow Engine**: Add UX flow composition with Cloudflare storage
6. **Component Expansion**: Grow from 4 to 25+ AI-enhanced components

### Reference Files
- `liquid-glass-app/README.md` - Complete component documentation
- `liquid-glass-app/App.tsx` - Comprehensive showcase example
- `liquid-glass-app/src/design-system/` - Full implementation

---

## Cloudflare Architecture (Implementation Details)

### Overview
Inference UI uses **Cloudflare's complete edge platform** for all cloud services, providing:
- 180+ global edge locations for ultra-low latency
- Zero DevOps overhead (fully serverless)
- 98%+ gross margins (vs 60% with traditional cloud)
- Integrated AI, database, storage, and analytics

### Event Intelligence Pipeline

```
React Native App
    ↓ (Local AsyncStorage queue)
Cloudflare Workers (Edge Ingestion)
    ↓
Workers AI (Event Enrichment)
    ↓
Analytics Engine (Time-Series Storage)
    +
D1 Database (User/Flow Metadata)
    +
Durable Objects (Real-Time Aggregation)
    ↓
GraphQL API (Dashboard Queries)
```

**Event Flow Example**:
```typescript
// Mobile app auto-captures event
<AIButton onPress={handlePress} analytics="auto" />

// Event batched locally (20s or 50 events)
→ AsyncStorage (encrypted queue)

// POST to Cloudflare Worker
→ workers.inference-ui.dev/ingest

// Worker processes
→ Validates & sanitizes
→ Enriches with Workers AI (user intent, predictions)
→ Writes to Analytics Engine (time-series)
→ Sends to Queue for batch processing
→ Updates Durable Object (real-time dashboard)
```

### Hybrid AI Architecture

**Decision Router**:
```typescript
function routeAIRequest(task: AITask) {
  if (task.requiresPrivacy || task.isOffline || task.needsUnder100ms) {
    return executeLocal(task);  // TFLite on device
  } else if (task.needsAdvancedModel || task.needsLatestData) {
    return executeEdge(task);   // Cloudflare Workers AI
  }
}
```

**Local AI (TFLite)** - Instant, Private:
- Form validation (email, phone formats)
- Text classification (sentiment, intent)
- Autocomplete predictions
- Accessibility suggestions
- Offline capability

**Edge AI (Workers AI)** - Advanced, Global:
- LLM responses (Llama 3.1, Mistral)
- Text-to-image generation (Stable Diffusion)
- Speech recognition (Whisper)
- Image classification (ResNet-50)
- Semantic search (text embeddings)

### Cloudflare Services Detail

**1. Cloudflare Workers** - Edge Compute
```typescript
// workers/event-ingest.ts
export default {
  async fetch(request, env: Env) {
    const events = await request.json();

    // AI enrichment at edge
    const enriched = await env.AI.run('@cf/meta/llama-3-8b', {
      messages: [{
        role: 'system',
        content: 'Classify user intent from event data'
      }]
    });

    // Write to Analytics Engine
    env.ANALYTICS.writeDataPoint({
      indexes: [events.userId, events.sessionId],
      blobs: [events.event, events.component],
      doubles: [events.timestamp, events.value]
    });

    return new Response('OK');
  }
}
```

**2. D1 Database** - Edge SQLite
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  tier TEXT CHECK(tier IN ('free', 'developer', 'business', 'enterprise')),
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Flow configurations
CREATE TABLE flows (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT,
  steps JSON,
  ai_config JSON
);

-- Event metadata
CREATE TABLE event_summaries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT,
  total_events INTEGER,
  unique_sessions INTEGER
);
```

**3. Analytics Engine** - Time-Series Events
```typescript
// Write events (cheap: $0.10 per 1M writes)
env.ANALYTICS.writeDataPoint({
  indexes: ['user_123', 'session_456'],    // Filterable
  blobs: ['button_click', 'AIButton'],     // Metadata
  doubles: [Date.now(), 1.0]               // Metrics
});

// Query events
const results = await env.ANALYTICS.query({
  query: `
    SELECT index1 as userId, blob1 as event, count() as total
    FROM analytics
    WHERE timestamp > now() - interval '7' day
    GROUP BY userId, event
  `
});
```

**4. R2 Storage** - Object Storage
```typescript
// Store AI models, user exports, backups
await env.R2.put('models/validation-v2.tflite', modelBuffer);
await env.R2.put('exports/user_123_events.json', jsonData);

// No egress fees (unlike S3)
// Ultra-cheap: $0.015/GB storage
```

**5. KV** - Global Cache
```typescript
// Cache AI inference results (60s TTL)
const cached = await env.KV.get('ai:intent:' + text);
if (cached) return JSON.parse(cached);

const result = await runAI(text);
await env.KV.put('ai:intent:' + text, JSON.stringify(result), {
  expirationTtl: 60
});
```

**6. Durable Objects** - Real-Time State
```typescript
// Real-time dashboard via WebSocket
export class RealtimeDashboard {
  state: DurableObjectState;
  sessions: WebSocket[];

  async fetch(request: Request) {
    const [client, server] = new WebSocketPair();
    this.sessions.push(server);

    // Broadcast live events
    this.broadcast(await this.getLatestEvents());

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
}
```

**7. Queues** - Async Processing
```typescript
// Batch event processing
await env.EVENT_QUEUE.send({
  batch: events,
  priority: 'normal'
});

// Consumer processes in background
export default {
  async queue(batch, env) {
    for (const message of batch.messages) {
      await processEvent(message.body, env);
    }
  }
}
```

### Development Commands (Cloudflare)

```bash
# Local development with Wrangler
cd packages/cloudflare
wrangler dev                    # Start local Workers runtime
wrangler d1 execute DB --local  # Local D1 database
wrangler r2 object get ...      # Test R2 storage

# Deployment
wrangler deploy                 # Deploy to Cloudflare edge
wrangler pages deploy           # Deploy frontend to Pages
wrangler tail                   # Stream production logs

# Database management
wrangler d1 execute DB --command "SELECT * FROM users"
wrangler d1 migrations apply    # Run migrations

# Analytics queries
wrangler analytics query "SELECT ..."

# AI model testing
wrangler ai run @cf/meta/llama-3-8b --input "..."
```

### Cost Structure (Example)

**Business Tier Customer** (1M events/month):
```
Cloudflare Costs:
- Workers (10M requests): $1.50
- Workers AI (100K inferences): $1.00
- Analytics Engine (1M writes): $0.10
- D1 (500K reads): $0.00 (free tier)
- R2 (10GB storage): $0.15
- KV (1M reads): $0.50
- Durable Objects (100K requests): $0.015
Total Cloudflare: ~$3.30/month

Revenue: $199/month
Gross Margin: 98.3%
```

**Comparison to AWS/GCP**:
- Traditional cloud: ~$60-80/month per customer
- Gross margin: ~60-70%
- Cloudflare: 98%+ margins
- No egress fees
- No server management
- Global edge by default

### SaaS Platform Implementation

**GraphQL API** (Cloudflare Workers):
```typescript
// workers/graphql-api/src/index.ts
import { createYoga } from 'graphql-yoga';

const yoga = createYoga({
  schema: makeExecutableSchema({ typeDefs, resolvers }),
  context: ({ request, env }) => ({
    user: await authenticate(request, env.D1),
    db: env.D1,
    analytics: env.ANALYTICS,
    ai: env.AI,
    storage: env.R2,
    cache: env.KV
  })
});

export default { fetch: yoga.fetch };
```

**Authentication**:
```typescript
// D1 + KV for multi-tenant auth
async function authenticate(request: Request, db: D1Database) {
  const token = request.headers.get('Authorization');

  // Check KV cache first
  const cached = await env.KV.get('auth:' + token);
  if (cached) return JSON.parse(cached);

  // Query D1
  const user = await db
    .prepare('SELECT * FROM users WHERE token = ?')
    .bind(token)
    .first();

  // Cache for 5 min
  await env.KV.put('auth:' + token, JSON.stringify(user), {
    expirationTtl: 300
  });

  return user;
}
```

**Billing Integration**:
```typescript
// Stripe webhooks via Cloudflare Workers
export default {
  async fetch(request, env) {
    const sig = request.headers.get('stripe-signature');
    const event = await stripe.webhooks.constructEvent(
      await request.text(), sig, env.STRIPE_WEBHOOK_SECRET
    );

    // Update D1 on subscription changes
    if (event.type === 'customer.subscription.updated') {
      await env.D1.prepare(`
        UPDATE users SET tier = ?, updated_at = ?
        WHERE stripe_customer_id = ?
      `).bind(event.data.tier, Date.now(), event.data.customer).run();
    }

    return new Response('OK');
  }
}
```

### Monitoring & Observability

**Cloudflare Dashboard**:
- Workers metrics (requests, errors, latency)
- D1 analytics (queries, storage, performance)
- Analytics Engine data volume
- AI model usage and costs
- Real-time logs and traces

**Custom Dashboards**:
```typescript
// Query own analytics for monitoring
const metrics = await env.ANALYTICS.query(`
  SELECT
    toStartOfHour(timestamp) as hour,
    count() as requests,
    avg(double1) as avg_latency
  FROM analytics
  WHERE timestamp > now() - interval '24' hour
  GROUP BY hour
  ORDER BY hour DESC
`);
```

### Security & Compliance

**Data Encryption**:
- TLS 1.3 for all connections
- Encrypted D1 databases
- Encrypted R2 objects
- End-to-end encryption option

**Access Controls**:
- Multi-tenant data isolation
- Role-based access (D1)
- API rate limiting (Workers)
- DDoS protection (Cloudflare)

**Compliance**:
- SOC2 ready architecture
- GDPR compliant (regional routing)
- Audit trails (Analytics Engine)
- Data residency controls

### Performance Characteristics

**Latency** (p95):
- Workers execution: <5ms
- D1 queries: <10ms
- Workers AI inference: <50ms
- Analytics writes: <5ms
- Global edge: <50ms to any user

**Scalability**:
- Auto-scales from 0 to millions
- No capacity planning needed
- Pay only for usage
- No cold starts (Workers stay warm)

### Why Cloudflare Works for Inference UI

1. **Edge-First Architecture**: AI inference where users are
2. **Integrated Stack**: Workers + AI + DB + Storage + Analytics
3. **Cost Efficiency**: 98%+ margins enable aggressive pricing
4. **Developer Experience**: `wrangler dev` and you're coding
5. **Zero Ops**: No servers, no scaling, no infrastructure
6. **Privacy-First**: Regional data processing, no central cloud
7. **Performance**: <50ms globally beats AWS/GCP
8. **Reliability**: Cloudflare's 99.99% SLA

## Important Notes

- This is an AI-NATIVE library - AI capabilities are core, not add-ons
- Optimize for AI-assisted development workflows from day one
- Privacy and performance are non-negotiable requirements
- Cross-platform consistency is essential
- Analytics and optimization are built-in, not bolted on
- Open source sustainability via thoughtful SaaS monetization
- **Inference UI Glass prototype demonstrates the visual design foundation**
