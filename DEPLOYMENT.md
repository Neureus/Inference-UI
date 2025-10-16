# Inference UI - Deployment Guide

## Cloudflare Workers API

### ✅ Deployed: October 16, 2025

**Production URL**: https://inference-ui-api.neureus.workers.dev

**Account**: Neureus (2bba1309281bf805590ca30d4e49adb0)

### Available Endpoints

```
GET  /                  - API information and endpoint listing
GET  /health            - Health check with timestamp
POST /graphql           - GraphQL API (queries and mutations)
POST /events            - Batch event ingestion with AI enrichment
POST /stream/chat       - Streaming conversational AI (SSE)
POST /stream/completion - Streaming text completion (SSE)
POST /stream/object     - Streaming object generation (SSE)
```

### Testing Deployed Endpoints

#### Health Check
```bash
curl https://inference-ui-api.neureus.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": 1760626231380
}
```

#### Stream Chat Example
```bash
curl -X POST https://inference-ui-api.neureus.workers.dev/stream/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "id": "1",
        "role": "user",
        "parts": [{"type": "text", "text": "Hello!"}],
        "createdAt": "2025-10-16T00:00:00Z"
      }
    ]
  }'
```

---

## npm Package Publishing

### @inference-ui/react v0.1.0

**Status**: ✅ Built and ready for publishing

**To publish**:

```bash
cd packages/@inference-ui/react

# Verify you're logged in
npm whoami

# Publish to npm
npm publish --access public
```

---

**Deployed**: October 16, 2025
