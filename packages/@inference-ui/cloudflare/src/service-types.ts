/**
 * Service Binding Types
 * Shared types for inference service RPC calls
 */

export interface InferenceService {
  streamChat(request: ChatRequest): Promise<Response>;
  streamCompletion(request: CompletionRequest): Promise<Response>;
  streamObject(request: ObjectRequest): Promise<Response>;
  processEvents(request: EventBatchRequest): Promise<EventBatchResponse>;
  getAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse>;
  getUsageMetrics(userId: string): Promise<UsageMetrics>;
}

export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  userId?: string;
  sessionId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CompletionRequest {
  prompt: string;
  systemPrompt?: string;
  userId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ObjectRequest {
  prompt: string;
  schema: Record<string, any>;
  userId?: string;
  temperature?: number;
}

export interface EventBatchRequest {
  events: Array<{
    event: string;
    component?: string;
    userId?: string;
    sessionId?: string;
    timestamp: number;
    properties?: Record<string, any>;
  }>;
  userId?: string;
}

export interface EventBatchResponse {
  processed: number;
  failed: number;
  errors?: string[];
}

export interface AnalyticsRequest {
  type: 'events' | 'flows' | 'sessions' | 'components';
  userId: string;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}

export interface AnalyticsResponse {
  data: any;
  cached: boolean;
  timestamp: number;
}

export interface UsageMetrics {
  events: number;
  aiRequests: number;
  flows: number;
  limit: {
    events: number;
    aiRequests: number;
    flows: number;
  };
  tier: string;
  warningLevel: 'ok' | 'warning' | 'critical' | 'exceeded';
}
