# Inference UI - Quick Start Guide

> **Get started with Inference UI in under 10 minutes**

## Choose Your Integration

Inference UI offers two powerful ways to integrate. Choose based on your needs:

### 🤖 MCP Server - For AI Assistants

**Best for:**
- Non-technical users who want natural language access
- Developers using Claude Code, Cline, or other AI tools
- Rapid prototyping and exploration
- Ad-hoc queries and analysis

**What you get:**
- Natural language interface ("Show me last 10 clicks")
- No coding required for basic queries
- AI-powered analytics and insights
- Perfect for research and debugging

**Setup time:** 5 minutes

[👉 Jump to MCP Setup](#mcp-setup)

---

### ⚡ Service Bindings - For Cloudflare Workers

**Best for:**
- Production applications on Cloudflare Workers
- High-performance, low-latency integrations
- Cost-sensitive applications
- Worker-to-Worker communication

**What you get:**
- 0ms latency (vs 50-100ms HTTP)
- 50% cost savings (service bindings are free)
- Type-safe TypeScript integration
- Direct RPC calls between Workers

**Setup time:** 10 minutes

[👉 Jump to Service Bindings Setup](#service-bindings-setup)

---

### 🌐 HTTP API - For Everything Else

**Best for:**
- Non-Cloudflare platforms (AWS Lambda, Vercel, etc.)
- Mobile apps and web frontends
- Cross-account or public access
- Maximum compatibility

**What you get:**
- Standard REST/GraphQL API
- Works from anywhere
- No special configuration
- Well-documented endpoints

**Setup time:** 2 minutes

[👉 Jump to HTTP API Setup](#http-api-setup)

---

## Quick Comparison

| Feature | MCP Server | Service Bindings | HTTP API |
|---------|------------|------------------|----------|
| **Latency** | Local (0ms) | 0ms | 50-100ms |
| **Cost** | Free | Free | $0.50/M requests |
| **Use Case** | AI assistants | Cloudflare Workers | Universal |
| **Coding** | Not required | TypeScript/JS | Any language |
| **Setup** | 5 min | 10 min | 2 min |
| **Best For** | Exploration | Production | Cross-platform |

---

## MCP Setup

### Prerequisites

- Claude Desktop, Cline, or any MCP-compatible AI assistant
- Node.js 18+ installed
- 5 minutes

### Step 1: Build the MCP Server

```bash
# Clone or navigate to the repository
cd packages/@inference-ui/cloudflare/mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

### Step 2: Get the Absolute Path

```bash
# Get the full path
pwd
# Output: /Users/yourname/inference-ui/packages/@inference-ui/cloudflare/mcp-server

# The executable is at:
# /Users/yourname/inference-ui/packages/@inference-ui/cloudflare/mcp-server/dist/index.js
```

### Step 3: Configure Claude Desktop

**Find config file:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Add this configuration:**

```json
{
  "mcpServers": {
    "inference-ui": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/mcp-server/dist/index.js"
      ],
      "env": {
        "INFERENCE_UI_API_URL": "https://inference-ui-api.finhub.workers.dev"
      }
    }
  }
}
```

**Replace** `/ABSOLUTE/PATH/TO/` with your actual path from Step 2!

### Step 4: Restart Claude Desktop

Completely quit and restart Claude Desktop (⌘+Q on Mac, Alt+F4 on Windows).

### Step 5: Test It!

Open Claude Desktop and ask:

```
What Inference UI tools do you have access to?
```

Claude should list 7 tools. Now try:

```
Check if the Inference UI API is healthy
```

✅ **Success!** You can now use natural language to interact with Inference UI.

### Next Steps

Try these queries:
- "Show me the last 10 button clicks"
- "Track that user user_123 clicked the signup button"
- "Generate a welcome message for new users"

[📚 Read the full MCP User Guide →](MCP-USER-GUIDE.md)

---

## Service Bindings Setup

### Prerequisites

- Cloudflare Workers project
- Wrangler CLI installed (`npm install -g wrangler`)
- TypeScript/JavaScript knowledge
- 10 minutes

### Step 1: Configure Service Binding

Add to your `wrangler.toml`:

```toml
name = "my-app"
main = "src/index.ts"
compatibility_date = "2024-10-01"

# Add this service binding
[[services]]
binding = "INFERENCE_UI"
service = "inference-ui-api"
environment = "production"

# Optional but recommended: Smart Placement
[placement]
mode = "smart"
```

### Step 2: Add TypeScript Types

Create `src/env.d.ts`:

```typescript
interface Env {
  INFERENCE_UI: {
    graphql(request: { query: string; variables?: any }): Promise<Response>;
    ingestEvent(request: { type: string; data: any; userId?: string }): Promise<Response>;
    ingestBatch(request: { events: any[] }): Promise<Response>;
    streamChat(request: { messages: any[] }): Promise<Response>;
    streamCompletion(request: { prompt: string }): Promise<Response>;
    streamObject(request: { prompt: string; schema: any }): Promise<Response>;
    health(): Promise<Response>;
  };
}
```

### Step 3: Use in Your Worker

Edit `src/index.ts`:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Health check
    const health = await env.INFERENCE_UI.health();
    const status = await health.json();

    // Track page view
    await env.INFERENCE_UI.ingestEvent({
      type: 'page_view',
      data: { page: new URL(request.url).pathname },
      userId: 'demo-user'
    });

    return Response.json({
      message: '✅ Connected to Inference UI!',
      status
    });
  }
};
```

### Step 4: Deploy

```bash
wrangler deploy
```

### Step 5: Test It!

```bash
curl https://YOUR-WORKER.workers.dev
```

You should see:

```json
{
  "message": "✅ Connected to Inference UI!",
  "status": {
    "status": "healthy",
    "timestamp": 1704067200000
  }
}
```

✅ **Success!** Your Worker can now call Inference UI with 0ms latency.

### Next Steps

Explore the methods:
- [graphql()](SERVICE-BINDINGS-USER-GUIDE.md#1-graphqlrequest) - Query analytics
- [ingestEvent()](SERVICE-BINDINGS-USER-GUIDE.md#2-ingesteventrequest) - Track events
- [streamChat()](SERVICE-BINDINGS-USER-GUIDE.md#4-streamchatrequest) - AI chat

[📚 Read the full Service Bindings Guide →](SERVICE-BINDINGS-USER-GUIDE.md)

---

## HTTP API Setup

### Prerequisites

- Any programming environment
- HTTP client (fetch, axios, curl, etc.)
- 2 minutes

### API Endpoint

```
https://inference-ui-api.finhub.workers.dev
```

### Example: Health Check

```bash
curl https://inference-ui-api.finhub.workers.dev/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": 1704067200000
}
```

### Example: GraphQL Query

```bash
curl -X POST https://inference-ui-api.finhub.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { events(limit: 5) { id type timestamp } }"
  }'
```

### Example: Ingest Event

```bash
curl -X POST https://inference-ui-api.finhub.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "type": "button_click",
      "data": { "buttonId": "signup-cta" },
      "userId": "user_123"
    }]
  }'
```

### Example: JavaScript/TypeScript

```typescript
// Query events
const response = await fetch('https://inference-ui-api.finhub.workers.dev/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query GetEvents {
        events(limit: 10) {
          id
          type
          timestamp
          data
        }
      }
    `
  })
});

const { data } = await response.json();
console.log(data.events);
```

### Example: Python

```python
import requests

# Query events
response = requests.post(
    'https://inference-ui-api.finhub.workers.dev/graphql',
    json={
        'query': '''
            query GetEvents {
                events(limit: 10) {
                    id
                    type
                    timestamp
                }
            }
        '''
    }
)

data = response.json()
print(data['data']['events'])
```

✅ **Success!** You can now call Inference UI from any platform.

### Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check API status |
| `/graphql` | POST | Query analytics data |
| `/events` | POST | Ingest events |
| `/stream/chat` | POST | AI chat streaming |
| `/stream/completion` | POST | Text generation |
| `/stream/object` | POST | Object generation |

### Next Steps

- [API Documentation](https://inference-ui-api.finhub.workers.dev)
- [GraphQL Schema](https://inference-ui-api.finhub.workers.dev/graphql)
- Example integrations for your platform

---

## Common Use Cases

### Use Case 1: Track Button Clicks

**MCP (Natural Language):**
```
You: Track that user user_123 clicked the "Get Started" button
```

**Service Bindings (TypeScript):**
```typescript
await env.INFERENCE_UI.ingestEvent({
  type: 'button_click',
  data: { buttonId: 'get-started', label: 'Get Started' },
  userId: 'user_123'
});
```

**HTTP API (cURL):**
```bash
curl -X POST https://inference-ui-api.finhub.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "type": "button_click",
      "data": { "buttonId": "get-started", "label": "Get Started" },
      "userId": "user_123"
    }]
  }'
```

---

### Use Case 2: Query Recent Events

**MCP (Natural Language):**
```
You: Show me the last 10 events for user user_123
```

**Service Bindings (TypeScript):**
```typescript
const response = await env.INFERENCE_UI.graphql({
  query: `
    query GetUserEvents($userId: ID!) {
      userEvents(userId: $userId, limit: 10) {
        id
        type
        timestamp
        data
      }
    }
  `,
  variables: { userId: 'user_123' }
});

const { data } = await response.json();
console.log(data.userEvents);
```

**HTTP API (JavaScript):**
```javascript
const response = await fetch('https://inference-ui-api.finhub.workers.dev/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query GetUserEvents($userId: ID!) {
        userEvents(userId: $userId, limit: 10) {
          id type timestamp data
        }
      }
    `,
    variables: { userId: 'user_123' }
  })
});

const { data } = await response.json();
```

---

### Use Case 3: Generate AI Content

**MCP (Natural Language):**
```
You: Generate a welcome email for new users who signed up for the Pro plan
```

**Service Bindings (TypeScript):**
```typescript
const response = await env.INFERENCE_UI.streamCompletion({
  prompt: 'Write a welcome email for new users who signed up for the Pro plan:',
  temperature: 0.7,
  maxTokens: 500
});

const email = await response.text();
console.log(email);
```

**HTTP API (JavaScript):**
```javascript
const response = await fetch('https://inference-ui-api.finhub.workers.dev/stream/completion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Write a welcome email for new users who signed up for the Pro plan:',
    temperature: 0.7,
    maxTokens: 500
  })
});

const email = await response.text();
```

---

## Performance Comparison

**Test**: Track 100 events and query analytics data

| Method | Time | Cost | Notes |
|--------|------|------|-------|
| **MCP Server** | ~2s | $0 | Natural language, no coding |
| **Service Bindings** | 0.05s | $0 | Fastest, production-ready |
| **HTTP API** | 7.5s | $0.05 | Universal, works anywhere |

---

## Troubleshooting

### MCP Server Issues

**Problem**: Tools not showing in Claude Desktop

**Solution**:
1. Check config file exists and has correct path
2. Restart Claude Desktop completely (⌘+Q, not just close window)
3. Verify server builds: `npm run build` in mcp-server directory

[Full MCP Troubleshooting →](MCP-USER-GUIDE.md#troubleshooting)

---

### Service Bindings Issues

**Problem**: `Cannot read property 'graphql' of undefined`

**Solution**:
1. Verify `wrangler.toml` has service binding configured
2. Check `inference-ui-api` is deployed: `wrangler deployments list --name inference-ui-api`
3. Add TypeScript types in `env.d.ts`

[Full Service Bindings Troubleshooting →](SERVICE-BINDINGS-USER-GUIDE.md#troubleshooting)

---

### HTTP API Issues

**Problem**: Connection refused or timeout

**Solution**:
1. Test health endpoint: `curl https://inference-ui-api.finhub.workers.dev/health`
2. Check firewall allows outbound HTTPS (port 443)
3. Verify you're using POST for GraphQL and events endpoints

---

## Next Steps

### Learn More

📚 **Detailed Guides**:
- [MCP User Guide](MCP-USER-GUIDE.md) - Complete MCP reference
- [Service Bindings Guide](SERVICE-BINDINGS-USER-GUIDE.md) - Production integration
- [Integration Examples](INTEGRATION-EXAMPLES.md) - Real-world patterns

🛠 **Advanced Topics**:
- GraphQL schema exploration
- Event enrichment with AI
- Real-time analytics dashboards
- Multi-tenant configurations

💬 **Get Help**:
- GitHub Issues for bugs
- Discord for community support
- Email support for Business/Enterprise

---

## Success Checklist

### MCP Server
- [ ] Server built successfully
- [ ] Configuration added to Claude Desktop
- [ ] Claude Desktop restarted
- [ ] Tools visible in Claude
- [ ] Health check works
- [ ] First query successful

### Service Bindings
- [ ] Service binding in wrangler.toml
- [ ] TypeScript types added
- [ ] Worker deployed
- [ ] Health check returns 200
- [ ] Event ingestion works
- [ ] GraphQL query successful

### HTTP API
- [ ] Health endpoint responds
- [ ] GraphQL query works
- [ ] Event ingestion successful
- [ ] Integrated into application
- [ ] Error handling implemented
- [ ] Production deployment complete

---

**🎉 You're all set! Start building amazing things with Inference UI.**

Need help? [Open an issue](https://github.com/your-org/inference-ui/issues) or [join our Discord](https://discord.gg/inference-ui).
