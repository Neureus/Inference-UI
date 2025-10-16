/**
 * TypeScript types for Inference UI React package
 * AI streaming, chat, completions, and generative UI
 */

import type { z } from 'zod';

/**
 * Stream status
 */
export type StreamStatus = 'ready' | 'streaming' | 'submitted' | 'error';

/**
 * Message role
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * Message part types
 */
export type MessagePartType = 'text' | 'tool-call' | 'tool-result' | 'file' | 'reasoning' | 'source-url';

/**
 * Text part
 */
export interface TextPart {
  type: 'text';
  text: string;
}

/**
 * Tool call part
 */
export interface ToolCallPart {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

/**
 * Tool result part
 */
export interface ToolResultPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: unknown;
  state?: 'input-available' | 'output-available' | 'output-error';
}

/**
 * File part
 */
export interface FilePart {
  type: 'file';
  url: string;
  mimeType?: string;
  name?: string;
}

/**
 * Reasoning part
 */
export interface ReasoningPart {
  type: 'reasoning';
  text: string;
}

/**
 * Source URL part
 */
export interface SourceURLPart {
  type: 'source-url';
  url: string;
  title?: string;
}

/**
 * Union of all message parts
 */
export type MessagePart =
  | TextPart
  | ToolCallPart
  | ToolResultPart
  | FilePart
  | ReasoningPart
  | SourceURLPart;

/**
 * UI Message with parts
 */
export interface UIMessage {
  id: string;
  role: MessageRole;
  parts: MessagePart[];
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Stream configuration
 */
export interface StreamConfig {
  /**
   * API endpoint URL
   * If not provided, uses the endpoint from InferenceUIProvider
   * @example 'https://inference-ui-api.neureus.workers.dev/stream/chat'
   * @example 'https://my-api.com/custom-endpoint'
   */
  api?: string;
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
  body?: Record<string, unknown> | (() => Record<string, unknown> | Promise<Record<string, unknown>>);
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  onFinish?: (message: UIMessage) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  experimental_throttle?: number;
}

/**
 * Chat configuration
 */
export interface ChatConfig extends StreamConfig {
  id?: string;
  initialMessages?: UIMessage[];
  maxMessages?: number;
}

/**
 * Completion configuration
 */
export interface CompletionConfig extends Omit<StreamConfig, 'onFinish'> {
  id?: string;
  initialInput?: string;
  initialCompletion?: string;
  onFinish?: (completion: string) => void | Promise<void>;
}

/**
 * Object generation configuration
 */
export interface ObjectConfig<T extends z.ZodType> extends Omit<StreamConfig, 'onFinish'> {
  schema: T;
  id?: string;
  initialValue?: z.infer<T>;
  onFinish?: (object: z.infer<T>) => void | Promise<void>;
}

/**
 * Tool definition
 */
export interface ToolDefinition<TArgs = Record<string, unknown>, TResult = unknown> {
  name: string;
  description: string;
  parameters: z.ZodType<TArgs>;
  execute: (args: TArgs) => Promise<TResult> | TResult;
  renderComponent?: (result: TResult, state: 'input-available' | 'output-available' | 'output-error') => React.ReactNode;
}

/**
 * Stream event types
 */
export type StreamEvent =
  | { type: 'message-start'; message: Partial<UIMessage> }
  | { type: 'message-part'; part: MessagePart }
  | { type: 'message-end'; message: UIMessage }
  | { type: 'error'; error: Error }
  | { type: 'done' };

/**
 * Stream protocol
 */
export type StreamProtocol = 'text' | 'data';
