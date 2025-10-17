/**
 * Streaming Worker Type Definitions
 */

/**
 * Streaming Worker Environment
 * Minimal bindings needed for AI streaming
 */
export interface StreamingEnv {
  // Workers AI - GPU-powered inference
  AI: Ai;

  // KV for response caching
  KV: KVNamespace;

  // D1 for usage tracking
  DB: D1Database;

  // Analytics for performance metrics
  ANALYTICS: AnalyticsEngineDataset;

  // Environment variables
  ENVIRONMENT?: string;
  API_VERSION?: string;
}

/**
 * Message interface (matches @inference-ui/react types)
 */
export interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  parts: MessagePart[];
  createdAt: Date | string;
  metadata?: Record<string, unknown>;
}

/**
 * Message part types
 */
export type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'tool-call'; toolCallId: string; toolName: string; args: unknown }
  | { type: 'tool-result'; toolCallId: string; toolName: string; result: unknown; isError?: boolean }
  | { type: 'file'; data: string; mimeType: string }
  | { type: 'reasoning'; text: string }
  | { type: 'source-url'; url: string; title?: string };

/**
 * Chat request
 */
export interface ChatRequest {
  messages: UIMessage[];
  chatId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
}

/**
 * Completion request
 */
export interface CompletionRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Object generation request
 */
export interface ObjectRequest {
  prompt: string;
  schema: string; // JSON Schema as string
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Tool definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/**
 * SSE event types
 */
export type SSEEvent =
  | { type: 'message-start'; message: Partial<UIMessage> }
  | { type: 'message-part'; part: MessagePart }
  | { type: 'message-end'; message: UIMessage }
  | { type: 'error'; error: { message: string; code?: string } }
  | { type: 'done' };

/**
 * AI model names
 */
export const AI_MODELS = {
  LLAMA_3_1_8B: '@cf/meta/llama-3.1-8b-instruct',
  LLAMA_3_8B: '@cf/meta/llama-3-8b-instruct',
  MISTRAL_7B: '@cf/mistral/mistral-7b-instruct-v0.1',
} as const;

/**
 * Streaming response helper
 */
export class StreamingResponse {
  private encoder = new TextEncoder();

  constructor(
    private writer: WritableStreamDefaultWriter<Uint8Array>
  ) {}

  /**
   * Write SSE event
   */
  async writeEvent(event: SSEEvent): Promise<void> {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    await this.writer.write(this.encoder.encode(data));
  }

  /**
   * Close stream
   */
  async close(): Promise<void> {
    await this.writer.close();
  }
}
