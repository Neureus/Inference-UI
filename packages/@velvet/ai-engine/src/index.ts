/**
 * @velvet/ai-engine
 * Hybrid AI engine (local TFLite + Cloudflare Workers AI)
 *
 * Intelligently routes AI tasks between:
 * - Local TFLite models (privacy, speed, offline)
 * - Cloudflare Workers AI (advanced models, latest data)
 */

// Router (primary API)
export { HybridAIRouter, initializeRouter, getRouter, routeAIRequest } from './router';

// Local AI Engine
export { LocalAIEngine, initializeLocalAI, getLocalAI } from './local';

// Edge AI Engine
export { EdgeAIEngine, initializeEdgeAI, getEdgeAI } from './edge';

// React Hooks
export {
  useAIInitialization,
  useAI,
  useTextClassification,
  useFormValidation,
  useAutocomplete,
  useAccessibilityCheck,
  useAIMetrics,
} from './hooks';

// Types
export type {
  AITask,
  AIResult,
  AITaskType,
  LocalModel,
  ModelRegistry,
  AIEngineConfig,
  AIMetrics,
} from './types';
