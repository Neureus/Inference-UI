/**
 * Inference UI Service Binding Types
 *
 * These types define the interface for the Inference UI service binding API.
 * Other workers can use these types to interact with Inference UI via service bindings.
 */

/**
 * GraphQL Request for Service Binding
 */
export interface InferenceUIGraphQLRequest {
  /**
   * GraphQL query or mutation
   */
  query: string;

  /**
   * Query variables
   */
  variables?: Record<string, unknown>;

  /**
   * Operation name
   */
  operationName?: string;

  /**
   * User context
   */
  context?: {
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * GraphQL Response
 */
export interface InferenceUIGraphQLResponse {
  /**
   * Query result data
   */
  data?: unknown;

  /**
   * GraphQL errors
   */
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, unknown>;
  }>;

  /**
   * Response extensions
   */
  extensions?: Record<string, unknown>;
}

/**
 * Event Ingestion Request
 */
export interface InferenceUIEventRequest {
  /**
   * Event type
   */
  type: string;

  /**
   * Event data
   */
  data: Record<string, unknown>;

  /**
   * User ID
   */
  userId?: string;

  /**
   * Session ID
   */
  sessionId?: string;

  /**
   * Timestamp (defaults to now)
   */
  timestamp?: number;

  /**
   * Event metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Batch Event Ingestion Request
 */
export interface InferenceUIBatchEventRequest {
  /**
   * Array of events
   */
  events: InferenceUIEventRequest[];

  /**
   * Batch metadata
   */
  metadata?: {
    source?: string;
    batchId?: string;
  };
}

/**
 * Event Ingestion Response
 */
export interface InferenceUIEventResponse {
  /**
   * Success status
   */
  success: boolean;

  /**
   * Number of events ingested
   */
  count?: number;

  /**
   * Error information
   */
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Chat Streaming Request
 */
export interface InferenceUIChatRequest {
  /**
   * Chat messages
   */
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;

  /**
   * Model to use
   */
  model?: string;

  /**
   * Temperature (0-1)
   */
  temperature?: number;

  /**
   * Max tokens
   */
  maxTokens?: number;

  /**
   * Chat ID
   */
  chatId?: string;

  /**
   * User context
   */
  context?: {
    userId?: string;
    sessionId?: string;
  };
}

/**
 * Text Completion Request
 */
export interface InferenceUICompletionRequest {
  /**
   * Prompt text
   */
  prompt: string;

  /**
   * Model to use
   */
  model?: string;

  /**
   * Temperature (0-1)
   */
  temperature?: number;

  /**
   * Max tokens
   */
  maxTokens?: number;

  /**
   * Stop sequences
   */
  stop?: string[];

  /**
   * User context
   */
  context?: {
    userId?: string;
    sessionId?: string;
  };
}

/**
 * Object Generation Request
 */
export interface InferenceUIObjectRequest {
  /**
   * Prompt for object generation
   */
  prompt: string;

  /**
   * JSON schema for output
   */
  schema: Record<string, unknown>;

  /**
   * Model to use
   */
  model?: string;

  /**
   * Temperature (0-1)
   */
  temperature?: number;

  /**
   * User context
   */
  context?: {
    userId?: string;
    sessionId?: string;
  };
}

/**
 * Inference UI Service Binding Interface
 *
 * This is the main interface that other workers use to interact with Inference UI.
 * All methods return Response objects for compatibility with Cloudflare Workers.
 */
export interface InferenceUIService {
  /**
   * Execute GraphQL query or mutation
   *
   * @param request - GraphQL request
   * @returns Response with query results
   *
   * @example
   * ```typescript
   * const response = await env.INFERENCE_UI.graphql({
   *   query: `query GetUser($id: ID!) {
   *     user(id: $id) { id name email }
   *   }`,
   *   variables: { id: "123" }
   * });
   * const result = await response.json();
   * ```
   */
  graphql(request: InferenceUIGraphQLRequest): Promise<Response>;

  /**
   * Ingest single event
   *
   * @param request - Event data
   * @returns Response with ingestion status
   *
   * @example
   * ```typescript
   * const response = await env.INFERENCE_UI.ingestEvent({
   *   type: 'button_click',
   *   data: { buttonId: 'submit', componentId: 'form-1' },
   *   userId: 'user-123'
   * });
   * ```
   */
  ingestEvent(request: InferenceUIEventRequest): Promise<Response>;

  /**
   * Ingest batch of events
   *
   * @param request - Batch event data
   * @returns Response with ingestion status
   *
   * @example
   * ```typescript
   * const response = await env.INFERENCE_UI.ingestBatch({
   *   events: [
   *     { type: 'page_view', data: { page: '/home' } },
   *     { type: 'button_click', data: { buttonId: 'cta' } }
   *   ]
   * });
   * ```
   */
  ingestBatch(request: InferenceUIBatchEventRequest): Promise<Response>;

  /**
   * Stream chat completion
   *
   * @param request - Chat request
   * @returns Streaming response (SSE)
   *
   * @example
   * ```typescript
   * const response = await env.INFERENCE_UI.streamChat({
   *   messages: [
   *     { role: 'user', content: 'Hello!' }
   *   ]
   * });
   * // Response is a streaming SSE response
   * ```
   */
  streamChat(request: InferenceUIChatRequest): Promise<Response>;

  /**
   * Stream text completion
   *
   * @param request - Completion request
   * @returns Streaming response (SSE)
   *
   * @example
   * ```typescript
   * const response = await env.INFERENCE_UI.streamCompletion({
   *   prompt: 'Write a haiku about coding'
   * });
   * ```
   */
  streamCompletion(request: InferenceUICompletionRequest): Promise<Response>;

  /**
   * Stream object generation
   *
   * @param request - Object generation request
   * @returns Streaming response (SSE)
   *
   * @example
   * ```typescript
   * const response = await env.INFERENCE_UI.streamObject({
   *   prompt: 'Generate user profile',
   *   schema: { type: 'object', properties: { name: { type: 'string' } } }
   * });
   * ```
   */
  streamObject(request: InferenceUIObjectRequest): Promise<Response>;

  /**
   * Health check
   *
   * @returns Response with health status
   */
  health(): Promise<Response>;
}

/**
 * Type guard to check if an object implements InferenceUIService
 */
export function isInferenceUIService(obj: unknown): obj is InferenceUIService {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'graphql' in obj &&
    'ingestEvent' in obj &&
    'ingestBatch' in obj &&
    'streamChat' in obj &&
    'streamCompletion' in obj &&
    'streamObject' in obj &&
    'health' in obj
  );
}
