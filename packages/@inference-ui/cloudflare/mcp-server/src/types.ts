/**
 * Inference UI API Types for MCP Server
 */

/**
 * GraphQL Request
 */
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

/**
 * GraphQL Response
 */
export interface GraphQLResponse {
  data?: unknown;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, unknown>;
  }>;
}

/**
 * Event Request
 */
export interface EventRequest {
  type: string;
  data: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Batch Event Request
 */
export interface BatchEventRequest {
  events: EventRequest[];
  metadata?: {
    source?: string;
    batchId?: string;
  };
}

/**
 * Event Response
 */
export interface EventResponse {
  success: boolean;
  count?: number;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Chat Request
 */
export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  chatId?: string;
  context?: {
    userId?: string;
    sessionId?: string;
  };
}

/**
 * Completion Request
 */
export interface CompletionRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
  context?: {
    userId?: string;
    sessionId?: string;
  };
}

/**
 * Object Generation Request
 */
export interface ObjectRequest {
  prompt: string;
  schema: Record<string, unknown>;
  model?: string;
  temperature?: number;
  context?: {
    userId?: string;
    sessionId?: string;
  };
}

/**
 * Health Response
 */
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: number;
  version?: string;
}

/**
 * MCP Server Configuration
 */
export interface MCPServerConfig {
  apiUrl: string;
  apiKey?: string;
  timeout?: number;
}
