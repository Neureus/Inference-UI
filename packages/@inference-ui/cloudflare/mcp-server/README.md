# Inference UI MCP Server

> **Model Context Protocol (MCP) server for Inference UI** - enables AI assistants like Claude to interact with Inference UI's GraphQL API, event intelligence, and AI streaming capabilities.

[![MCP](https://img.shields.io/badge/MCP-1.0.4-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## Overview

The Inference UI MCP Server provides AI assistants with direct access to:

- **GraphQL API** - Query component events, user analytics, flow metrics
- **Event Intelligence** - Ingest and track user interactions with AI enrichment
- **AI Streaming** - Stream chat completions, text generation, and structured objects
- **Edge Computing** - Powered by Cloudflare Workers AI (180+ global locations)

## Features

✨ **7 MCP Tools** for comprehensive Inference UI integration:
- `graphql_query` - Execute GraphQL queries
- `ingest_event` - Ingest single event
- `ingest_batch` - Batch event ingestion
- `stream_chat` - AI chat completions
- `stream_completion` - Text generation
- `stream_object` - Structured object generation
- `health_check` - API health status

🚀 **Performance**:
- 0ms latency when using service bindings
- <50ms globally with Cloudflare edge network
- Streaming responses for real-time AI

🔒 **Security**:
- Optional API key authentication
- Configurable timeouts
- Error handling and retry logic

## Installation

### Via NPM

```bash
npm install @inference-ui/mcp-server
```

### From Source

```bash
git clone https://github.com/your-org/inference-ui.git
cd inference-ui/packages/@inference-ui/cloudflare/mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
# Required: Inference UI API URL
export INFERENCE_UI_API_URL="https://inference-ui-api.finhub.workers.dev"

# Optional: API key for authentication
export INFERENCE_UI_API_KEY="your-api-key-here"
```

### Claude Desktop Configuration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "inference-ui": {
      "command": "node",
      "args": [
        "/path/to/inference-ui/mcp-server/dist/index.js"
      ],
      "env": {
        "INFERENCE_UI_API_URL": "https://inference-ui-api.finhub.workers.dev",
        "INFERENCE_UI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Cline Configuration

Add to `.clinerules` in your project:

```yaml
mcp_servers:
  - name: inference-ui
    command: node
    args:
      - /path/to/inference-ui/mcp-server/dist/index.js
    env:
      INFERENCE_UI_API_URL: https://inference-ui-api.finhub.workers.dev
      INFERENCE_UI_API_KEY: your-api-key-here
```

## Usage Examples

### Example 1: GraphQL Query

```typescript
// Query component usage analytics
const query = `
  query GetComponentUsage($componentId: String!, $limit: Int!) {
    componentEvents(componentId: $componentId, limit: $limit) {
      id
      type
      timestamp
      data
      userId
      sessionId
    }
  }
`;

// AI assistant will call:
// graphql_query(query, { componentId: "button-submit", limit: 10 })
```

**Response**:
```json
{
  "data": {
    "componentEvents": [
      {
        "id": "evt_123",
        "type": "button_click",
        "timestamp": 1704067200000,
        "data": { "label": "Submit Form" },
        "userId": "user_456",
        "sessionId": "sess_789"
      }
    ]
  }
}
```

### Example 2: Event Ingestion

```typescript
// Ingest single event
// AI assistant will call:
// ingest_event({
//   type: "button_click",
//   data: { buttonId: "cta-signup", label: "Get Started" },
//   userId: "user_123",
//   sessionId: "sess_456"
// })
```

**Response**:
```json
{
  "success": true,
  "count": 1
}
```

### Example 3: Batch Event Ingestion

```typescript
// Ingest multiple events efficiently
// AI assistant will call:
// ingest_batch({
//   events: [
//     { type: "page_view", data: { page: "/home" }, userId: "user_123" },
//     { type: "button_click", data: { buttonId: "nav-features" }, userId: "user_123" },
//     { type: "form_submit", data: { formId: "contact" }, userId: "user_123" }
//   ],
//   metadata: { source: "web-app", batchId: "batch_789" }
// })
```

**Response**:
```json
{
  "success": true,
  "count": 3
}
```

### Example 4: AI Chat Streaming

```typescript
// Stream AI chat completion
// AI assistant will call:
// stream_chat({
//   messages: [
//     { role: "system", content: "You are a helpful UI assistant." },
//     { role: "user", content: "Explain the benefits of event-driven analytics." }
//   ],
//   model: "@cf/meta/llama-3.1-8b-instruct",
//   temperature: 0.7,
//   maxTokens: 500
// })
```

**Response** (Server-Sent Events):
```
data: {"response":"Event-driven analytics..."}

data: {"response":"...provides real-time insights..."}

data: {"response":"...into user behavior patterns."}

data: [DONE]
```

### Example 5: AI Text Completion

```typescript
// Generate text completion
// AI assistant will call:
// stream_completion({
//   prompt: "Generate 3 user onboarding tips for a SaaS dashboard:",
//   model: "@cf/meta/llama-3.1-8b-instruct",
//   temperature: 0.7,
//   maxTokens: 300
// })
```

### Example 6: AI Structured Object Generation

```typescript
// Generate structured JSON object
// AI assistant will call:
// stream_object({
//   prompt: "Generate a user profile for a new signup",
//   schema: {
//     type: "object",
//     properties: {
//       name: { type: "string" },
//       email: { type: "string" },
//       role: { type: "string", enum: ["user", "admin"] },
//       preferences: {
//         type: "object",
//         properties: {
//           theme: { type: "string" },
//           notifications: { type: "boolean" }
//         }
//       }
//     },
//     required: ["name", "email", "role"]
//   },
//   temperature: 0.7
// })
```

**Response**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

### Example 7: Health Check

```typescript
// Check API health status
// AI assistant will call:
// health_check()
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": 1704067200000
}
```

## Tool Reference

### graphql_query

Execute GraphQL queries against Inference UI API.

**Parameters**:
- `query` (string, required) - GraphQL query or mutation
- `variables` (object, optional) - Query variables
- `operationName` (string, optional) - Operation name

**Returns**: GraphQL response with data or errors

### ingest_event

Ingest a single event into Inference UI.

**Parameters**:
- `type` (string, required) - Event type (e.g., "button_click", "page_view")
- `data` (object, required) - Event data payload
- `userId` (string, optional) - User identifier
- `sessionId` (string, optional) - Session identifier
- `timestamp` (number, optional) - Unix timestamp in ms
- `metadata` (object, optional) - Additional metadata

**Returns**: Success status and count

### ingest_batch

Ingest multiple events efficiently.

**Parameters**:
- `events` (array, required) - Array of event objects
- `metadata` (object, optional) - Batch metadata with `source` and `batchId`

**Returns**: Success status and total count

### stream_chat

Stream AI chat completion using Cloudflare Workers AI.

**Parameters**:
- `messages` (array, required) - Chat messages with `role` and `content`
- `model` (string, optional) - Model name (default: @cf/meta/llama-3.1-8b-instruct)
- `temperature` (number, optional) - Temperature 0-1 (default: 0.7)
- `maxTokens` (number, optional) - Max tokens (default: 500)
- `chatId` (string, optional) - Chat identifier
- `context` (object, optional) - User context with `userId` and `sessionId`

**Returns**: Server-Sent Events stream

### stream_completion

Stream AI text completion.

**Parameters**:
- `prompt` (string, required) - Text prompt
- `model` (string, optional) - Model name
- `temperature` (number, optional) - Temperature 0-1
- `maxTokens` (number, optional) - Max tokens
- `stop` (array, optional) - Stop sequences
- `context` (object, optional) - User context

**Returns**: Server-Sent Events stream

### stream_object

Stream AI-generated structured objects.

**Parameters**:
- `prompt` (string, required) - Generation prompt
- `schema` (object, required) - JSON schema for output
- `model` (string, optional) - Model name
- `temperature` (number, optional) - Temperature 0-1
- `context` (object, optional) - User context

**Returns**: Server-Sent Events stream

### health_check

Check Inference UI API health.

**Parameters**: None

**Returns**: Health status with timestamp

## Advanced Usage

### Custom API URL

```javascript
import { InferenceUIMCPServer } from '@inference-ui/mcp-server';

const server = new InferenceUIMCPServer({
  apiUrl: 'https://your-custom-domain.com',
  apiKey: 'your-api-key',
  timeout: 60000, // 60 seconds
});

await server.start();
```

### Error Handling

The MCP server automatically handles errors and returns structured error responses:

```json
{
  "error": "API request failed: 500 Internal Server Error",
  "tool": "graphql_query"
}
```

## Troubleshooting

### MCP Server Not Starting

1. **Check Node.js version**: Ensure Node.js >= 18.0.0
   ```bash
   node --version
   ```

2. **Verify installation**:
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

3. **Check configuration**: Ensure `INFERENCE_UI_API_URL` is set correctly

### API Connection Errors

1. **Test API directly**:
   ```bash
   curl https://inference-ui-api.finhub.workers.dev/health
   ```

2. **Verify API key**: Ensure `INFERENCE_UI_API_KEY` is valid (if required)

3. **Check network**: Ensure firewall allows outbound HTTPS

### Claude Desktop Integration Issues

1. **Restart Claude Desktop** after updating configuration
2. **Check logs**: View Claude Desktop logs for MCP errors
3. **Verify paths**: Ensure absolute paths in configuration

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Run Locally

```bash
npm start
```

## Architecture

```
AI Assistant (Claude/Cline)
    ↓ (MCP Protocol - stdio)
MCP Server (Node.js)
    ↓ (HTTPS)
Cloudflare Workers API
    ↓ (Service Bindings)
Inference UI Services
    - GraphQL API
    - Event Intelligence
    - AI Streaming (Workers AI)
    - Analytics Engine
    - D1 Database
```

## Performance

- **Latency**: <50ms globally via Cloudflare edge
- **Throughput**: Scales automatically with Cloudflare Workers
- **Streaming**: Real-time SSE responses for AI
- **Reliability**: 99.99% SLA with Cloudflare

## Security

- **Authentication**: Optional API key via `Authorization` header
- **Encryption**: TLS 1.3 for all connections
- **Timeouts**: Configurable request timeouts (default: 30s)
- **Rate Limiting**: Handled by Cloudflare Workers

## License

MIT

## Support

- **Documentation**: https://docs.inference-ui.com
- **Issues**: https://github.com/your-org/inference-ui/issues
- **Discord**: https://discord.gg/inference-ui

## Related Projects

- [@inference-ui/react](https://www.npmjs.com/package/@inference-ui/react) - React component library
- [@inference-ui/cloudflare](https://www.npmjs.com/package/@inference-ui/cloudflare) - Cloudflare Workers API
- [Inference UI Docs](https://docs.inference-ui.com)

---

Built with ❤️ using [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
