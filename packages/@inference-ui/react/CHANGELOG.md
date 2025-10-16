# Changelog

All notable changes to `inference-ui-react` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-16

### Added
- **InferenceUIProvider** - Global configuration context for zero-config usage
  - Eliminates need for repetitive `api` props on every hook
  - Supports environment variables for production deployments
  - Custom endpoint overrides per hook type
  - Global headers and authentication
  - Default throttle configuration
- **Zero-config mode** - Hooks work without any configuration when wrapped in provider
- **Self-hosted support** - Easy configuration for custom Cloudflare Workers deployments

### Changed
- **BREAKING**: `api` prop is now optional on all hooks (`useChat`, `useCompletion`, `useObject`)
  - Uses provider configuration when not specified
  - Can still override per-component
- Updated documentation with provider pattern examples
- Added `provider-example.tsx` showcasing all configuration patterns

### Migration Guide

**Before (v0.1.0):**
```tsx
const { messages, append } = useChat({
  api: 'https://inference-ui-api.neureus.workers.dev/stream/chat',
});
```

**After (v0.2.0) - Recommended:**
```tsx
// Wrap app once
<InferenceUIProvider>
  <App />
</InferenceUIProvider>

// Use anywhere without config
const { messages, append } = useChat();
```

**After (v0.2.0) - Still works:**
```tsx
// Old code continues to work
const { messages, append } = useChat({
  api: 'https://inference-ui-api.neureus.workers.dev/stream/chat',
});
```

## [0.1.0] - 2025-10-16

### Added
- Initial release with core streaming hooks
- `useChat` - Conversational AI with multi-turn context
- `useCompletion` - Single-turn text completions
- `useObject` - Type-safe object generation with Zod validation
- `ToolRegistry` - Generative UI with custom React components
- `MessageList` component for rendering messages
- Full TypeScript support with type inference
- Cloudflare Workers AI integration
- Comprehensive documentation and examples

[0.2.0]: https://github.com/Neureus/Inference-UI/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Neureus/Inference-UI/releases/tag/v0.1.0
