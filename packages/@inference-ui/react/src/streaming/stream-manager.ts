/**
 * StreamManager - Handles streaming AI responses
 * Supports both text streaming and Server-Sent Events (SSE)
 */

import type { StreamEvent, StreamProtocol, MessagePart } from '../types';
import { parseTextChunk, parseJSONChunk } from './message-parser';

/**
 * Stream configuration
 */
export interface StreamOptions {
  api: string;
  protocol?: StreamProtocol;
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
  body?: Record<string, unknown> | (() => Record<string, unknown> | Promise<Record<string, unknown>>);
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  onEvent?: (event: StreamEvent) => void;
  experimental_throttle?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * StreamManager class for handling streaming responses
 */
export class StreamManager {
  private options: StreamOptions;
  private controller: AbortController;
  private isStreaming = false;
  private retryCount = 0;

  constructor(options: StreamOptions) {
    this.options = {
      protocol: 'data',
      credentials: 'same-origin',
      maxRetries: 3,
      retryDelay: 1000,
      ...options,
    };
    this.controller = new AbortController();
  }

  /**
   * Start streaming
   */
  async start(): Promise<void> {
    if (this.isStreaming) {
      throw new Error('Stream already active');
    }

    this.isStreaming = true;
    this.retryCount = 0;

    try {
      await this.processStream();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Stream was cancelled, don't retry
        return;
      }

      // Emit error event
      this.emitEvent({
        type: 'error',
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Retry logic
      if (this.retryCount < (this.options.maxRetries || 3)) {
        this.retryCount++;
        await this.delay(this.options.retryDelay || 1000);
        await this.start();
      }
    } finally {
      this.isStreaming = false;
    }
  }

  /**
   * Process the stream
   */
  private async processStream(): Promise<void> {
    // Resolve headers and body
    const headers = await this.resolveValue(this.options.headers);
    const body = await this.resolveValue(this.options.body);

    // Create request
    const response = await fetch(this.options.api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: this.options.credentials,
      signal: this.options.signal || this.controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Process stream based on protocol
    if (this.options.protocol === 'text') {
      await this.processTextStream(response.body);
    } else {
      await this.processDataStream(response.body);
    }

    // Emit done event
    this.emitEvent({ type: 'done' });
  }

  /**
   * Process text stream (plain text)
   */
  private async processTextStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Emit text parts
        const parts = parseTextChunk(chunk);
        for (const part of parts) {
          await this.throttle();
          this.emitEvent({ type: 'message-part', part });
        }
      }

      // Handle any remaining buffer
      if (buffer.trim()) {
        const parts = parseTextChunk(buffer);
        for (const part of parts) {
          this.emitEvent({ type: 'message-part', part });
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process data stream (SSE or line-delimited JSON)
   */
  private async processDataStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          // Handle SSE format
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            await this.processDataLine(data);
          } else {
            // Handle plain JSON lines
            await this.processDataLine(line);
          }
        }
      }

      // Handle any remaining buffer
      if (buffer.trim()) {
        await this.processDataLine(buffer);
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process a single data line
   */
  private async processDataLine(data: string): Promise<void> {
    if (data === '[DONE]') {
      return;
    }

    try {
      // Parse as JSON and extract message parts
      const parts = parseJSONChunk(data);

      for (const part of parts) {
        await this.throttle();
        this.emitEvent({ type: 'message-part', part });
      }
    } catch (error) {
      // If JSON parsing fails, treat as text
      const parts = parseTextChunk(data);
      for (const part of parts) {
        await this.throttle();
        this.emitEvent({ type: 'message-part', part });
      }
    }
  }

  /**
   * Emit stream event
   */
  private emitEvent(event: StreamEvent): void {
    if (this.options.onEvent) {
      this.options.onEvent(event);
    }
  }

  /**
   * Throttle stream updates
   */
  private async throttle(): Promise<void> {
    if (this.options.experimental_throttle) {
      await this.delay(this.options.experimental_throttle);
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Resolve a value that might be a function
   */
  private async resolveValue<T>(
    value: T | (() => T | Promise<T>) | undefined
  ): Promise<T | undefined> {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === 'function') {
      return await (value as () => T | Promise<T>)();
    }

    return value;
  }

  /**
   * Stop streaming
   */
  stop(): void {
    this.controller.abort();
    this.isStreaming = false;
  }

  /**
   * Check if stream is active
   */
  isActive(): boolean {
    return this.isStreaming;
  }

  /**
   * Get retry count
   */
  getRetryCount(): number {
    return this.retryCount;
  }
}

/**
 * Create and start a stream
 */
export async function createStream(options: StreamOptions): Promise<StreamManager> {
  const manager = new StreamManager(options);
  await manager.start();
  return manager;
}

/**
 * Stream message parts from an API
 */
export async function* streamParts(
  api: string,
  options: Omit<StreamOptions, 'api' | 'onEvent'>
): AsyncGenerator<MessagePart, void, unknown> {
  const parts: MessagePart[] = [];
  let error: Error | null = null;
  let isDone = false;

  const manager = new StreamManager({
    api,
    ...options,
    onEvent: (event) => {
      if (event.type === 'message-part') {
        parts.push(event.part);
      } else if (event.type === 'error') {
        error = event.error;
      } else if (event.type === 'done') {
        isDone = true;
      }
    },
  });

  // Start streaming in background
  manager.start().catch((e) => {
    error = e instanceof Error ? e : new Error(String(e));
  });

  // Yield parts as they arrive
  while (!isDone && !error) {
    if (parts.length > 0) {
      yield parts.shift()!;
    } else {
      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  // Yield remaining parts
  while (parts.length > 0) {
    yield parts.shift()!;
  }

  // Throw error if one occurred
  if (error) {
    throw error;
  }
}
