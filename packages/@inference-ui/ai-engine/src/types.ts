/**
 * AI Engine types
 */

export type AITaskType =
  | 'text_classification'
  | 'form_validation'
  | 'autocomplete'
  | 'accessibility_check'
  | 'sentiment_analysis'
  | 'intent_detection'
  | 'entity_extraction';

export interface AITask {
  type: AITaskType;
  input: string | Record<string, unknown>;
  context?: Record<string, unknown>;

  // Routing hints
  requiresPrivacy?: boolean;
  isOffline?: boolean;
  needsUnder100ms?: boolean;
  needsAdvancedModel?: boolean;
  needsLatestData?: boolean;
  maxLatency?: number; // milliseconds
}

export interface AIResult {
  output: unknown;
  confidence?: number;
  executedAt: 'local' | 'edge' | 'fallback';
  latency: number;
  modelUsed?: string;
  error?: string;
}

export interface LocalModel {
  name: string;
  path: string;
  size: number; // bytes
  version: string;
  tasks: AITaskType[];
  loaded: boolean;
}

export interface ModelRegistry {
  textClassification: LocalModel;
  formValidation: LocalModel;
  autocomplete: LocalModel;
  accessibility: LocalModel;
}

export interface AIEngineConfig {
  enableLocalAI: boolean;
  enableEdgeAI: boolean;
  edgeEndpoint?: string;
  edgeApiKey?: string;
  maxLocalLatency: number;
  fallbackToEdge: boolean;
  modelCacheDir: string;
}

export interface AIMetrics {
  localInferences: number;
  edgeInferences: number;
  fallbacks: number;
  averageLocalLatency: number;
  averageEdgeLatency: number;
  errors: number;
}
