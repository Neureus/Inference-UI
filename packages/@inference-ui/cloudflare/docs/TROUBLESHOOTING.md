# Inference UI - Troubleshooting Guide

> **Complete troubleshooting reference for MCP Server, Service Bindings, and HTTP API**

## Table of Contents

- [MCP Server Issues](#mcp-server-issues)
- [Service Bindings Issues](#service-bindings-issues)
- [HTTP API Issues](#http-api-issues)
- [Performance Issues](#performance-issues)
- [Data Quality Issues](#data-quality-issues)
- [Deployment Issues](#deployment-issues)
- [Common Error Messages](#common-error-messages)
- [Debugging Tools](#debugging-tools)

---

## MCP Server Issues

### Issue: MCP Server Not Starting

**Symptoms**:
- No output when running `npm start`
- Process exits immediately
- No response to requests

**Solutions**:

1. **Check Node.js Version**
   ```bash
   node --version
   # Should be >= 18.0.0
   ```

   If too old:
   ```bash
   # Install Node.js 18+ from nodejs.org or use nvm
   nvm install 18
   nvm use 18
   ```

2. **Rebuild the Server**
   ```bash
   cd mcp-server
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Check for Dependency Errors**
   ```bash
   npm install --verbose
   # Look for any errors in output
   ```

4. **Verify TypeScript Compilation**
   ```bash
   npm run build
   # Should complete without errors
   ls dist/
   # Should show: index.js, index.d.ts, types.js, types.d.ts
   ```

---

### Issue: Tools Not Showing in Claude Desktop

**Symptoms**:
- Claude doesn't list Inference UI tools
- "What tools do you have?" returns generic response
- No mention of `graphql_query`, `ingest_event`, etc.

**Solutions**:

1. **Verify Configuration File Location**
   ```bash
   # macOS
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Windows
   type %APPDATA%\Claude\claude_desktop_config.json

   # Linux
   cat ~/.config/Claude/claude_desktop_config.json
   ```

2. **Validate JSON Syntax**
   ```bash
   # macOS/Linux
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python3 -m json.tool

   # Or use online JSON validator
   ```

   Common JSON errors:
   - Missing commas between objects
   - Trailing commas (not allowed)
   - Unescaped backslashes in paths (Windows)

3. **Check Absolute Path**
   ```bash
   cd /path/to/mcp-server
   pwd
   # Copy this EXACT path

   # Verify file exists
   ls /ABSOLUTE/PATH/TO/mcp-server/dist/index.js
   ```

   ❌ **Wrong** (relative path):
   ```json
   {
     "args": ["./dist/index.js"]
   }
   ```

   ✅ **Correct** (absolute path):
   ```json
   {
     "args": ["/Users/yourname/inference-ui/mcp-server/dist/index.js"]
   }
   ```

4. **Windows Path Escaping**

   ❌ **Wrong**:
   ```json
   {
     "args": ["C:\Users\name\mcp-server\dist\index.js"]
   }
   ```

   ✅ **Correct**:
   ```json
   {
     "args": ["C:\\Users\\name\\mcp-server\\dist\\index.js"]
   }
   ```

   Or use forward slashes:
   ```json
   {
     "args": ["C:/Users/name/mcp-server/dist/index.js"]
   }
   ```

5. **Restart Claude Desktop Properly**

   ❌ **Not enough** (just closing window):
   - Click X button

   ✅ **Required** (quit application):
   - macOS: `⌘+Q` (Cmd+Q)
   - Windows: `Alt+F4` or Right-click taskbar → Quit
   - Linux: `Ctrl+Q` or kill process

   After quitting, wait 5 seconds, then start Claude Desktop again.

6. **Check MCP Server Logs**

   Run server manually to see errors:
   ```bash
   cd mcp-server
   node dist/index.js
   # Should print: "Inference UI MCP Server started"
   # Leave running and test in Claude Desktop
   ```

---

### Issue: MCP Tools Return Errors

**Symptoms**:
- Tools are listed but return error when called
- "API request failed" messages
- Timeout errors

**Solutions**:

1. **Test API Connectivity**
   ```bash
   curl https://inference-ui-api.finhub.workers.dev/health
   # Should return: {"status":"healthy","timestamp":...}
   ```

2. **Check Environment Variables**

   Verify in `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "inference-ui": {
         "env": {
           "INFERENCE_UI_API_URL": "https://inference-ui-api.finhub.workers.dev"
         }
       }
     }
   }
   ```

3. **Test with Custom URL**

   If using self-hosted:
   ```json
   {
     "env": {
       "INFERENCE_UI_API_URL": "https://your-custom-domain.com"
     }
   }
   ```

4. **Check Firewall/Network**
   ```bash
   # Test network connectivity
   ping inference-ui-api.finhub.workers.dev

   # Test HTTPS
   curl -v https://inference-ui-api.finhub.workers.dev/health
   ```

5. **Increase Timeout**

   Edit `mcp-server/src/index.ts`:
   ```typescript
   const DEFAULT_CONFIG = {
     apiUrl: '...',
     timeout: 60000, // Increase to 60 seconds
   };
   ```

   Rebuild:
   ```bash
   npm run build
   ```

---

## Service Bindings Issues

### Issue: Service Binding Not Found

**Symptoms**:
- `Cannot read property 'graphql' of undefined`
- `env.INFERENCE_UI is undefined`
- TypeScript error: "Property 'INFERENCE_UI' does not exist"

**Solutions**:

1. **Verify wrangler.toml Configuration**
   ```toml
   [[services]]
   binding = "INFERENCE_UI"    # Must match env.INFERENCE_UI
   service = "inference-ui-api" # Must match deployed worker name
   environment = "production"   # Must match target environment
   ```

2. **Check Worker is Deployed**
   ```bash
   # List all deployed workers
   wrangler deployments list

   # Check specific worker
   wrangler deployments list --name inference-ui-api

   # If not deployed, deploy it
   cd ../inference-ui
   wrangler deploy
   ```

3. **Verify Environment Names Match**

   ❌ **Mismatch**:
   ```toml
   # Your worker (production)
   [env.production]
   [[env.production.services]]
   environment = "development"  # ← Wrong!
   ```

   ✅ **Match**:
   ```toml
   # Your worker (production)
   [env.production]
   [[env.production.services]]
   environment = "production"  # ← Correct!
   ```

4. **Add TypeScript Types**

   Create `src/env.d.ts`:
   ```typescript
   interface Env {
     INFERENCE_UI: {
       graphql(request: any): Promise<Response>;
       ingestEvent(request: any): Promise<Response>;
       ingestBatch(request: any): Promise<Response>;
       streamChat(request: any): Promise<Response>;
       streamCompletion(request: any): Promise<Response>;
       streamObject(request: any): Promise<Response>;
       health(): Promise<Response>;
     };
   }
   ```

5. **Redeploy Your Worker**
   ```bash
   wrangler deploy
   # Watch for "service binding" in deployment output
   ```

6. **Test Service Binding**
   ```typescript
   export default {
     async fetch(request: Request, env: Env): Promise<Response> {
       console.log('INFERENCE_UI available?', !!env.INFERENCE_UI);

       if (!env.INFERENCE_UI) {
         return Response.json({
           error: 'Service binding not configured'
         }, { status: 500 });
       }

       const health = await env.INFERENCE_UI.health();
       return health;
     }
   };
   ```

---

### Issue: Service Binding Works in Dev but Not Production

**Symptoms**:
- `wrangler dev --remote` works fine
- Production deployment fails or returns errors
- Different behavior in different environments

**Solutions**:

1. **Check Environment Configuration**
   ```toml
   # Development
   [env.development]
   [[env.development.services]]
   binding = "INFERENCE_UI"
   service = "inference-ui-api"
   environment = "development"

   # Production
   [env.production]
   [[env.production.services]]
   binding = "INFERENCE_UI"
   service = "inference-ui-api"
   environment = "production"  # ← Must be different!
   ```

2. **Deploy to Correct Environment**
   ```bash
   # Development
   wrangler deploy --env development

   # Production
   wrangler deploy --env production

   # Check which is deployed
   wrangler deployments list
   ```

3. **Verify Both Workers are Deployed**
   ```bash
   # Check inference-ui-api
   wrangler deployments list --name inference-ui-api

   # Check your worker
   wrangler deployments list --name your-worker-name
   ```

4. **Test Production Directly**
   ```bash
   curl https://your-worker.workers.dev/health
   ```

---

### Issue: Type Errors with Service Bindings

**Symptoms**:
- TypeScript errors: "Type 'X' is not assignable"
- "Expected 1-2 arguments but got 3"
- Build fails with type errors

**Solutions**:

1. **Install Type Definitions**
   ```bash
   npm install --save-dev @inference-ui/cloudflare
   ```

2. **Import Correct Types**
   ```typescript
   import type {
     InferenceUIService,
     InferenceUIGraphQLRequest,
     InferenceUIEventRequest,
   } from '@inference-ui/cloudflare/types/service-bindings';

   interface Env {
     INFERENCE_UI: InferenceUIService;
   }
   ```

3. **Use Type Assertions**
   ```typescript
   const response = await env.INFERENCE_UI.graphql({
     query: '...'
   } as InferenceUIGraphQLRequest);
   ```

4. **Check Method Signatures**

   ❌ **Wrong** (too many parameters):
   ```typescript
   await env.INFERENCE_UI.graphql(query, variables, context);
   ```

   ✅ **Correct** (single object):
   ```typescript
   await env.INFERENCE_UI.graphql({
     query,
     variables,
     context
   });
   ```

---

## HTTP API Issues

### Issue: Connection Refused or Timeout

**Symptoms**:
- `ECONNREFUSED` error
- Request times out
- "Could not connect to server"

**Solutions**:

1. **Test API Health**
   ```bash
   curl https://inference-ui-api.finhub.workers.dev/health
   # Should return JSON with status: "healthy"
   ```

2. **Check Network Connectivity**
   ```bash
   # Test DNS resolution
   nslookup inference-ui-api.finhub.workers.dev

   # Test connection
   telnet inference-ui-api.finhub.workers.dev 443
   ```

3. **Verify Firewall Settings**
   - Check corporate firewall allows outbound HTTPS (port 443)
   - Ensure no proxy blocking requests
   - Test from different network if possible

4. **Check API Status Page**
   - Visit [Cloudflare Status](https://www.cloudflarestatus.com/)
   - Check for ongoing incidents

5. **Use Correct Endpoint**

   ❌ **Wrong**:
   ```
   http://inference-ui-api.finhub.workers.dev  # Missing 's'
   ```

   ✅ **Correct**:
   ```
   https://inference-ui-api.finhub.workers.dev  # HTTPS required
   ```

---

### Issue: 404 Not Found

**Symptoms**:
- API returns 404
- "Endpoint not found"
- Valid requests return "Not Found"

**Solutions**:

1. **Check Endpoint Path**

   Valid endpoints:
   ```
   GET  https://inference-ui-api.finhub.workers.dev/health
   POST https://inference-ui-api.finhub.workers.dev/graphql
   POST https://inference-ui-api.finhub.workers.dev/events
   POST https://inference-ui-api.finhub.workers.dev/stream/chat
   POST https://inference-ui-api.finhub.workers.dev/stream/completion
   POST https://inference-ui-api.finhub.workers.dev/stream/object
   ```

   Common mistakes:
   ```
   /api/graphql  # Wrong! Use /graphql
   /event        # Wrong! Use /events (plural)
   /streams/chat # Wrong! Use /stream/chat (singular)
   ```

2. **Use Correct HTTP Method**

   ❌ **Wrong**:
   ```bash
   curl -X GET https://inference-ui-api.finhub.workers.dev/graphql
   ```

   ✅ **Correct**:
   ```bash
   curl -X POST https://inference-ui-api.finhub.workers.dev/graphql \
     -d '{"query":"..."}'
   ```

3. **Include Content-Type Header**
   ```bash
   curl -X POST https://inference-ui-api.finhub.workers.dev/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ events { id } }"}'
   ```

---

### Issue: 400 Bad Request

**Symptoms**:
- API returns 400
- "Invalid request"
- "Validation error"

**Solutions**:

1. **Validate JSON Syntax**
   ```bash
   # Test JSON validity
   echo '{"query":"{ events { id } }"}' | python3 -m json.tool
   ```

2. **Check Required Fields**

   For GraphQL:
   ```json
   {
     "query": "REQUIRED - GraphQL query string"
   }
   ```

   For Events:
   ```json
   {
     "events": [{
       "type": "REQUIRED - event type",
       "data": "REQUIRED - event data object"
     }]
   }
   ```

3. **Verify Data Types**
   ```json
   {
     "events": [{
       "type": "button_click",     // Must be string
       "data": { "id": 123 },      // Must be object
       "timestamp": 1704067200000  // Must be number
     }]
   }
   ```

4. **Test with Minimal Request**
   ```bash
   curl -X POST https://inference-ui-api.finhub.workers.dev/events \
     -H "Content-Type: application/json" \
     -d '{
       "events": [{
         "type": "test",
         "data": {}
       }]
     }'
   ```

---

## Performance Issues

### Issue: Slow Response Times

**Symptoms**:
- Requests take > 1 second
- Timeouts in production
- Sluggish dashboard

**Solutions**:

1. **Use Service Bindings Instead of HTTP**

   Migration:
   ```typescript
   // Before (HTTP): 50-100ms
   const response = await fetch('https://api.../graphql', {...});

   // After (Service Bindings): 0ms
   const response = await env.INFERENCE_UI.graphql({...});
   ```

2. **Enable Smart Placement**
   ```toml
   [placement]
   mode = "smart"
   ```

3. **Batch Operations**

   ❌ **Slow** (10 API calls):
   ```typescript
   for (const event of events) {
     await env.INFERENCE_UI.ingestEvent(event);
   }
   ```

   ✅ **Fast** (1 API call):
   ```typescript
   await env.INFERENCE_UI.ingestBatch({ events });
   ```

4. **Query in Parallel**

   ❌ **Slow** (sequential):
   ```typescript
   const users = await env.INFERENCE_UI.graphql({ query: usersQuery });
   const events = await env.INFERENCE_UI.graphql({ query: eventsQuery });
   // Total: time(users) + time(events)
   ```

   ✅ **Fast** (parallel):
   ```typescript
   const [users, events] = await Promise.all([
     env.INFERENCE_UI.graphql({ query: usersQuery }),
     env.INFERENCE_UI.graphql({ query: eventsQuery })
   ]);
   // Total: max(time(users), time(events))
   ```

5. **Limit Query Results**
   ```typescript
   // ❌ Slow: Returns 10,000 events
   query { events { id type data } }

   // ✅ Fast: Returns 100 events
   query { events(limit: 100) { id type data } }
   ```

6. **Add Time Range Filters**
   ```typescript
   query {
     events(
       limit: 100
       period: "24h"  // Only last 24 hours
     ) {
       id
       type
     }
   }
   ```

7. **Cache Results**
   ```typescript
   const cacheKey = `analytics:${userId}:${date}`;
   const cached = await env.KV.get(cacheKey);
   if (cached) return Response.json(JSON.parse(cached));

   const response = await env.INFERENCE_UI.graphql({ query });
   const data = await response.json();

   await env.KV.put(cacheKey, JSON.stringify(data), {
     expirationTtl: 300  // 5 minutes
   });

   return Response.json(data);
   ```

---

### Issue: High Latency for Users

**Symptoms**:
- Users in certain regions experience slow responses
- Latency varies by geographic location
- Inconsistent performance

**Solutions**:

1. **Use Cloudflare Workers**
   - Automatically deployed to 180+ locations worldwide
   - Requests routed to nearest edge location
   - <50ms latency globally

2. **Enable Smart Placement**
   ```toml
   [placement]
   mode = "smart"
   ```

3. **Use Non-Blocking Event Tracking**
   ```typescript
   // Don't wait for analytics to complete
   ctx.waitUntil(
     env.INFERENCE_UI.ingestEvent({...})
   );

   // Respond immediately
   return Response.json({ success: true });
   ```

4. **Measure Actual Latency**
   ```typescript
   const start = Date.now();
   const response = await env.INFERENCE_UI.graphql({ query });
   const latency = Date.now() - start;
   console.log(`GraphQL query latency: ${latency}ms`);
   ```

---

## Data Quality Issues

### Issue: Events Not Appearing in Analytics

**Symptoms**:
- Events ingested successfully but not in queries
- Missing data in dashboard
- Counts don't match expected

**Solutions**:

1. **Check Event Timestamps**
   ```typescript
   // ❌ Wrong: Future timestamp
   timestamp: Date.now() * 1000  // Too large!

   // ✅ Correct: Unix milliseconds
   timestamp: Date.now()
   ```

2. **Verify Event Types Match**
   ```typescript
   // Ingestion
   await env.INFERENCE_UI.ingestEvent({
     type: 'button_click',  // Note the underscore
     data: {...}
   });

   // Query
   query {
     events(type: "button-click") {  // ❌ Wrong! Hyphen != underscore
       id
     }
   }

   // ✅ Correct query
   query {
     events(type: "button_click") {
       id
     }
   }
   ```

3. **Check Query Time Range**
   ```typescript
   // If events are older, expand range
   query {
     events(
       type: "button_click"
       period: "30d"  // Increase from default 7d
     ) {
       id
     }
   }
   ```

4. **Verify User/Session IDs**
   ```typescript
   // Ensure consistent IDs
   await env.INFERENCE_UI.ingestEvent({
     type: 'button_click',
     data: {...},
     userId: 'user_123',      // Must match
     sessionId: 'sess_abc'    // Must match
   });

   query {
     userEvents(userId: "user_123") {  // Same ID
       id
     }
   }
   ```

---

## Deployment Issues

### Issue: Deployment Fails

**Symptoms**:
- `wrangler deploy` fails
- Build errors
- Deployment timeout

**Solutions**:

1. **Check Build**
   ```bash
   npm run build
   # Should complete without errors
   ```

2. **Verify wrangler.toml**
   ```bash
   wrangler deploy --dry-run --outdir dist
   # Shows what would be deployed
   ```

3. **Check Account/API Token**
   ```bash
   wrangler whoami
   # Should show your account details
   ```

4. **Clear Build Cache**
   ```bash
   rm -rf dist/ .wrangler/
   npm run build
   wrangler deploy
   ```

5. **Check Worker Size**
   ```bash
   # Worker must be < 10MB
   ls -lh dist/
   ```

---

## Common Error Messages

### "ECONNREFUSED"
**Cause**: Cannot connect to API
**Solution**: Check network, firewall, API URL

### "Service binding not found"
**Cause**: Service binding not configured
**Solution**: Add `[[services]]` to wrangler.toml

### "TypeError: Cannot read property 'graphql'"
**Cause**: Service binding undefined
**Solution**: Check env.INFERENCE_UI exists, verify deployment

### "401 Unauthorized"
**Cause**: Missing or invalid API key
**Solution**: Add INFERENCE_UI_API_KEY to env

### "429 Too Many Requests"
**Cause**: Rate limit exceeded
**Solution**: Reduce request rate, use batch operations

### "500 Internal Server Error"
**Cause**: API error
**Solution**: Check API health, review logs

---

## Debugging Tools

### Test MCP Server Manually

```bash
cd mcp-server
node dist/index.js

# In another terminal, send test request
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | nc localhost -
```

### Test Service Binding Directly

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const health = await env.INFERENCE_UI.health();
      const status = await health.json();
      return Response.json({ success: true, status });
    } catch (error) {
      return Response.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
  }
};
```

### Monitor Logs

```bash
# Real-time logs
wrangler tail

# Specific worker
wrangler tail --name your-worker-name

# With filters
wrangler tail --status error
```

### Check Deployment Status

```bash
# List all deployments
wrangler deployments list

# Check specific worker
wrangler deployments list --name inference-ui-api

# View deployment details
wrangler deployment view [deployment-id]
```

---

## Getting Help

If you're still stuck:

1. **Check Logs**: Run `wrangler tail` and reproduce the issue
2. **Test Minimal Example**: Isolate the problem with minimal code
3. **Search Issues**: Check [GitHub Issues](https://github.com/your-org/inference-ui/issues)
4. **Ask Community**: Join [Discord server](https://discord.gg/inference-ui)
5. **Contact Support**: Email support@inference-ui.com (Business/Enterprise)

---

**Last Updated**: 2025-01-17

**Need more help?** [Open an issue](https://github.com/your-org/inference-ui/issues/new)
