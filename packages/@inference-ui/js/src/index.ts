/**
 * @inference-ui/js
 * JavaScript SDK for Inference UI - browser-compatible client
 */

// Main client
export { InferenceClient } from './client';

// Types
export type {
  InferenceConfig,
  User,
  ApiKey,
  CreateApiKeyInput,
  CreateApiKeyResponse,
  Flow,
  FlowStep,
  Event,
  AnalyticsQuery,
  AnalyticsResult,
  UsageMetrics,
  GraphQLRequest,
  GraphQLResponse,
} from './types';

// Default export
export { InferenceClient as default } from './client';
