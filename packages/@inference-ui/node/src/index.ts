/**
 * @inference-ui/node
 * Node.js client SDK for Inference UI API
 */

// Main client
export { InferenceUIClient, InferenceGraphQLClient } from './client';

// Types
export type {
  InferenceUIConfig,
  User,
  ApiKey,
  CreateApiKeyInput,
  CreateApiKeyResponse,
  Flow,
  FlowStep,
  Event,
  EventBatch,
  AnalyticsQuery,
  AnalyticsResult,
  UsageMetrics,
} from './types';

// Default export
export { InferenceUIClient as default } from './client';
