/**
 * Type definitions for Inference UI Node.js SDK
 */

export interface InferenceUIConfig {
  /**
   * API endpoint URL
   * @default "https://inference-ui-api.finhub.workers.dev"
   */
  apiUrl?: string;

  /**
   * API key for authentication (required)
   */
  apiKey: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;
}

export interface User {
  id: string;
  email: string;
  tier: 'free' | 'developer' | 'business' | 'enterprise';
  createdAt: number;
}

export interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  lastUsedAt: number | null;
  expiresAt: number | null;
  revokedAt: number | null;
  createdAt: number;
}

export interface CreateApiKeyInput {
  name: string;
  expiresInDays?: number;
}

export interface CreateApiKeyResponse {
  apiKey: string;
  keyPrefix: string;
  createdAt: number;
  expiresAt: number | null;
}

export interface Flow {
  id: string;
  userId: string;
  name: string;
  steps: FlowStep[];
  createdAt: number;
  updatedAt: number;
}

export interface FlowStep {
  id: string;
  component: string;
  props?: Record<string, any>;
  condition?: string;
}

export interface Event {
  id?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  event: string;
  component?: string;
  data?: Record<string, any>;
}

export interface EventBatch {
  events: Event[];
}

export interface AnalyticsQuery {
  userId?: string;
  startDate: number;
  endDate: number;
  metrics?: string[];
  groupBy?: string;
}

export interface AnalyticsResult {
  metrics: Record<string, number>;
  breakdown?: Array<{
    key: string;
    value: number;
  }>;
}

export interface UsageMetrics {
  userId: string;
  tier: string;
  eventsThisMonth: number;
  eventsLimit: number;
  aiRequestsThisMonth: number;
  aiRequestsLimit: number;
}
