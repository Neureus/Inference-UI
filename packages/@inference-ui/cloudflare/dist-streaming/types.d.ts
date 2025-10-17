/**
 * Streaming Worker Type Definitions
 */
/**
 * Streaming Worker Environment
 * Minimal bindings needed for AI streaming
 */
export interface StreamingEnv {
    AI: Ai;
    KV: KVNamespace;
    DB: D1Database;
    ANALYTICS: AnalyticsEngineDataset;
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
export type MessagePart = {
    type: 'text';
    text: string;
} | {
    type: 'tool-call';
    toolCallId: string;
    toolName: string;
    args: unknown;
} | {
    type: 'tool-result';
    toolCallId: string;
    toolName: string;
    result: unknown;
    isError?: boolean;
} | {
    type: 'file';
    data: string;
    mimeType: string;
} | {
    type: 'reasoning';
    text: string;
} | {
    type: 'source-url';
    url: string;
    title?: string;
};
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
    schema: string;
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
export type SSEEvent = {
    type: 'message-start';
    message: Partial<UIMessage>;
} | {
    type: 'message-part';
    part: MessagePart;
} | {
    type: 'message-end';
    message: UIMessage;
} | {
    type: 'error';
    error: {
        message: string;
        code?: string;
    };
} | {
    type: 'done';
};
/**
 * AI model names
 */
export declare const AI_MODELS: {
    readonly LLAMA_3_1_8B: "@cf/meta/llama-3.1-8b-instruct";
    readonly LLAMA_3_8B: "@cf/meta/llama-3-8b-instruct";
    readonly MISTRAL_7B: "@cf/mistral/mistral-7b-instruct-v0.1";
};
/**
 * Streaming response helper
 */
export declare class StreamingResponse {
    private writer;
    private encoder;
    constructor(writer: WritableStreamDefaultWriter<Uint8Array>);
    /**
     * Write SSE event
     */
    writeEvent(event: SSEEvent): Promise<void>;
    /**
     * Close stream
     */
    close(): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map