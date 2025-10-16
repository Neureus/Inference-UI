# npm Publishing Guide

## @inference-ui/react v0.1.0

### Prerequisites

1. **npm Account**: Must have publish rights for @inference-ui organization
   ```bash
   npm login
   npm whoami  # Should show your username
   ```

2. **Verify Organization Access**:
   ```bash
   npm access ls-packages @inference-ui
   ```

3. **Clean Build**: Already completed
   ```bash
   cd packages/@inference-ui/react
   npm run build  # Already done, dist/ is ready
   ```

### Publishing Steps

#### 1. Dry Run (Verify Package Contents)

```bash
cd packages/@inference-ui/react
npm pack --dry-run
```

Expected output:
```
npm notice package: @inference-ui/react@0.1.0
npm notice === Tarball Contents ===
npm notice 2.2kB  package.json
npm notice 50.1kB README.md
npm notice 1.5kB  dist/index.js
npm notice 1.1kB  dist/index.d.ts
npm notice ...    (all dist/ files)
npm notice === Tarball Details ===
npm notice name:          @inference-ui/react
npm notice version:       0.1.0
npm notice filename:      inference-ui-react-0.1.0.tgz
npm notice package size:  ~15.0 kB
npm notice unpacked size: ~50.0 kB
npm notice total files:   20+
```

#### 2. Publish to npm

```bash
npm publish --access public
```

If you have 2FA enabled (recommended):
```bash
npm publish --access public --otp <your-6-digit-code>
```

Expected output:
```
npm notice Publishing to https://registry.npmjs.org/
+ @inference-ui/react@0.1.0
```

#### 3. Verify Publication

```bash
# View on npm registry
npm view @inference-ui/react

# Check version
npm view @inference-ui/react version

# Check dist-tags
npm view @inference-ui/react dist-tags
```

Expected output:
```json
{
  "name": "@inference-ui/react",
  "description": "React hooks for AI streaming, chat, completions, and generative UI",
  "dist-tags": { "latest": "0.1.0" },
  "versions": [ "0.1.0" ],
  "maintainers": [ ... ],
  "time": {
    "created": "2025-10-16T...",
    "modified": "2025-10-16T...",
    "0.1.0": "2025-10-16T..."
  }
}
```

#### 4. Test Installation

Create a test project to verify:

```bash
mkdir test-inference-ui
cd test-inference-ui
npm init -y
npm install @inference-ui/react zod react
```

Test import:

```tsx
// test.tsx
import { useChat, useCompletion, useObject } from '@inference-ui/react';

console.log('Successfully imported:', { useChat, useCompletion, useObject });
```

### Post-Publication Tasks

#### 1. Update npm Package Links

Add badges to README.md:

```markdown
[![npm version](https://badge.fury.io/js/@inference-ui%2Freact.svg)](https://www.npmjs.com/package/@inference-ui/react)
[![npm downloads](https://img.shields.io/npm/dm/@inference-ui/react.svg)](https://www.npmjs.com/package/@inference-ui/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

#### 2. Create GitHub Release

```bash
cd /Users/am/Projects/Inference\ UX

# Create and push tag
git tag -a v0.1.0 -m "Release v0.1.0: @inference-ui/react with streaming AI hooks"
git push origin v0.1.0
```

Then create release on GitHub:
- Go to https://github.com/Neureus/Inference-UI/releases/new
- Select tag: v0.1.0
- Title: "v0.1.0: @inference-ui/react - AI Streaming Hooks"
- Description:

```markdown
## @inference-ui/react v0.1.0

First public release of @inference-ui/react - React hooks for AI streaming, chat, completions, and generative UI.

### Features

- **useChat** - Conversational AI with message streaming
- **useCompletion** - Text completion streaming
- **useObject** - Type-safe object generation with Zod validation
- **Generative UI** - Tool registry and custom component rendering
- **Full TypeScript** - Complete type safety and inference

### Installation

```bash
npm install @inference-ui/react zod react
```

### Documentation

- [README](https://github.com/Neureus/Inference-UI/blob/main/packages/@inference-ui/react/README.md)
- [Examples](https://github.com/Neureus/Inference-UI/tree/main/examples)
- [API Documentation](https://inference-ui.dev/docs)

### Deployed Backend

All hooks work with our deployed Cloudflare Workers API:
- https://inference-ui-api.neureus.workers.dev

### What's Next

- Additional hooks (useAssistant, useAgent)
- More examples and templates
- Performance optimizations
- Extended documentation
```

#### 3. Announce Release

**Twitter/X**:
```
🚀 Announcing @inference-ui/react v0.1.0!

React hooks for AI streaming with:
✅ useChat - Conversational AI
✅ useCompletion - Text streaming
✅ useObject - Type-safe generation
✅ Zod validation
✅ Generative UI

Built on Cloudflare Workers AI for <100ms global latency.

npm install @inference-ui/react

#ReactJS #AI #TypeScript #Cloudflare
```

**Reddit** (r/reactjs):
```
Title: [Show /r/reactjs] Inference UI - React hooks for AI streaming

Body:
I've built Inference UI, a library of React hooks for AI streaming that makes it easy to add conversational AI, text completion, and type-safe object generation to your apps.

Features:
- useChat for multi-turn conversations
- useCompletion for text streaming
- useObject for type-safe generation with Zod
- Generative UI with tool rendering
- Works with Cloudflare Workers AI

Deployed backend available for testing, or bring your own API.

GitHub: https://github.com/Neureus/Inference-UI
npm: https://www.npmjs.com/package/@inference-ui/react

Would love feedback!
```

**Hacker News** (Show HN):
```
Title: Show HN: Inference UI – React hooks for AI streaming with Cloudflare Workers

Text:
I built Inference UI to make it easy to add AI streaming to React apps. It provides three main hooks:

- useChat: Multi-turn conversational AI with streaming
- useCompletion: Single-turn text completions
- useObject: Type-safe object generation with Zod validation

All hooks support progressive streaming, error handling, and retry logic. There's also a generative UI system for rendering custom React components from AI tool calls.

Backend runs on Cloudflare Workers AI for sub-100ms global latency. You can use the deployed API or bring your own.

It's inspired by Vercel's AI SDK but built for Cloudflare's edge platform with a focus on type safety and progressive streaming.

GitHub: https://github.com/Neureus/Inference-UI
Docs: https://inference-ui.dev
Live demo: https://inference-ui.dev/demo

Happy to answer questions!
```

**Dev.to Blog Post**:
```markdown
---
title: Building AI Streaming Hooks for React with Cloudflare Workers
published: true
description: How to add conversational AI, text completion, and type-safe object generation to React apps
tags: react, ai, typescript, cloudflare
---

# Building AI Streaming Hooks for React with Cloudflare Workers

Today I'm releasing Inference UI, a library of React hooks that make it easy to add AI streaming capabilities to your applications.

## The Problem

Adding AI features to React apps typically requires:
- Managing WebSocket or SSE connections
- Handling progressive streaming updates
- Type-safe schema validation
- Error handling and retries
- Tool calling and generative UI

Most solutions require complex setup or vendor lock-in.

## The Solution

Inference UI provides three main hooks that handle all of this:

### 1. useChat - Conversational AI

```tsx
import { useChat } from '@inference-ui/react';

function ChatApp() {
  const { messages, input, setInput, append } = useChat({
    api: 'https://your-api.workers.dev/stream/chat',
  });

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => append({ role: 'user', content: input })}>
        Send
      </button>
    </div>
  );
}
```

### 2. useCompletion - Text Streaming

Perfect for autocomplete, summarization, or any single-turn completion:

```tsx
const { completion, complete } = useCompletion({
  api: 'https://your-api.workers.dev/stream/completion',
});

<button onClick={() => complete('Write a haiku about coding')}>
  Generate
</button>
```

### 3. useObject - Type-Safe Generation

Generate structured data with Zod validation:

```tsx
const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
});

const { object, submit } = useObject({
  api: 'https://your-api.workers.dev/stream/object',
  schema: RecipeSchema,
});

// `object` is typed as Partial<Recipe> during streaming
// and fully validated on completion
```

## Why Cloudflare Workers?

The backend runs on Cloudflare Workers AI, which provides:
- Sub-100ms latency globally (180+ edge locations)
- Built-in GPU inference with 50+ models
- Pay-per-request pricing (~$0.011/1K neurons)
- No cold starts

## Getting Started

```bash
npm install @inference-ui/react zod react
```

Check out the examples and documentation:
- GitHub: https://github.com/Neureus/Inference-UI
- Docs: https://inference-ui.dev
- Examples: Full chat app, recipe generator, code autocomplete

I'd love your feedback! What AI features would you like to see?
```

#### 4. Submit to Directories

- **Awesome React**: https://github.com/enaqx/awesome-react
- **Awesome AI Tools**: https://github.com/mahseema/awesome-ai-tools
- **Awesome TypeScript**: https://github.com/dzharii/awesome-typescript
- **Product Hunt**: https://www.producthunt.com/posts/new

---

## Troubleshooting

### Issue: "403 Forbidden - you do not have permission to publish"

**Solution**:
1. Create @inference-ui organization on npm: https://www.npmjs.com/org/create
2. Add yourself as maintainer
3. Try publishing again

### Issue: "Package name too similar to existing package"

**Solution**:
- npm may block if name is similar to another package
- Choose a different name or contact npm support
- Alternative: Publish as `@<your-username>/inference-ui-react`

### Issue: "npm ERR! 402 Payment Required"

**Solution**:
- Scoped packages (@inference-ui/react) require paid account or use `--access public`
- We already have `--access public` in the command

### Issue: "Version 0.1.0 already published"

**Solution**:
```bash
# Bump version
npm version patch  # 0.1.0 → 0.1.1
# or
npm version minor  # 0.1.0 → 0.2.0

# Then publish
npm publish --access public
```

---

## Verification Checklist

Before publishing, verify:

- [x] Package built successfully (`npm run build`)
- [x] dist/ directory contains all files
- [x] package.json has correct version, description, keywords
- [x] README.md is comprehensive
- [x] .npmignore excludes source files
- [x] Repository URL is correct
- [x] License is specified (MIT)
- [x] publishConfig.access is set to "public"

After publishing, verify:

- [ ] Package appears on npm: https://www.npmjs.com/package/@inference-ui/react
- [ ] Installation works: `npm install @inference-ui/react`
- [ ] Types are included and working
- [ ] README renders correctly on npm
- [ ] All exports are accessible

---

**Status**: Ready to publish
**Date**: October 16, 2025
**Version**: 0.1.0
