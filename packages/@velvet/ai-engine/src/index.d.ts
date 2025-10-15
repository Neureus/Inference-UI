/**
 * @velvet/ai-engine
 * Hybrid AI engine (local TFLite + Cloudflare Workers AI)
 *
 * Intelligently routes AI tasks between:
 * - Local TFLite models (privacy, speed, offline)
 * - Cloudflare Workers AI (advanced models, latest data)
 */
export { HybridAIRouter, initializeRouter, getRouter, routeAIRequest } from './router';
export { LocalAIEngine, initializeLocalAI, getLocalAI } from './local';
export { EdgeAIEngine, initializeEdgeAI, getEdgeAI } from './edge';
export { useAIInitialization, useAI, useTextClassification, useFormValidation, useAutocomplete, useAccessibilityCheck, useAIMetrics, } from './hooks';
export type { AITask, AIResult, AITaskType, LocalModel, ModelRegistry, AIEngineConfig, AIMetrics, } from './types';
//# sourceMappingURL=index.d.ts.map