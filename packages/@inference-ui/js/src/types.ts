/**
 * Configuration for Inference UI JavaScript client
 */
export interface InferenceConfig {
  /** API key for authentication (sk_live_xxx or sk_test_xxx) */
  apiKey: string;
  /** Optional API URL (defaults to production) */
  apiUrl?: string;
  /** Optional custom headers */
  headers?: Record<string, string>;
}

/**
 * User information
 */
export interface User {
  id: string;
  email: string;
  tier: 'free' | 'developer' | 'business' | 'enterprise';
  createdAt: number;
}

/**
 * API Key information
 */
export interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  lastUsedAt: number | null;
  expiresAt: number | null;
  revokedAt: number | null;
  createdAt: number;
}

/**
 * Create API Key input
 */
export interface CreateApiKeyInput {
  name: string;
  expiresInDays?: number;
}

/**
 * Create API Key response
 */
export interface CreateApiKeyResponse {
  apiKey: string;
  keyPrefix: string;
  createdAt: number;
  expiresAt: number | null;
}

/**
 * Flow step definition
 */
export interface FlowStep {
  id: string;
  component: string;
  props?: Record<string, any>;
}

/**
 * Flow definition
 */
export interface Flow {
  id: string;
  userId: string;
  name: string;
  steps: FlowStep[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Event data
 */
export interface Event {
  id?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  event: string;
  component?: string;
  data?: Record<string, any>;
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQuery {
  userId?: string;
  startDate: number;
  endDate: number;
  metrics?: string[];
  groupBy?: string;
}

/**
 * Analytics result
 */
export interface AnalyticsResult {
  metrics: Record<string, any>;
  breakdown: any[];
}

/**
 * Usage metrics
 */
export interface UsageMetrics {
  userId: string;
  tier: string;
  eventsThisMonth: number;
  eventsLimit: number;
  aiRequestsThisMonth: number;
  aiRequestsLimit: number;
}

/**
 * GraphQL request
 */
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

/**
 * GraphQL response
 */
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: any[];
    path?: any[];
  }>;
}
