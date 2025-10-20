/**
 * Inference Service Worker
 *
 * Exposes AI inference and analytics methods via Service Bindings (RPC).
 * This worker is called directly by other workers without HTTP overhead.
 *
 * Service Binding Benefits:
 * - Direct function calls (no HTTP serialization)
 * - Type-safe with TypeScript
 * - Lower latency (<1ms vs ~50ms for HTTP)
 * - No fetch() overhead
 * - Shared types between workers
 */
import type { Env } from '../../src/types';
export interface InferenceService {
    /**
     * Streaming chat completion (returns ReadableStream)
     */
    streamChat(request: ChatRequest): Promise<Response>;
    /**
     * Streaming text completion (returns ReadableStream)
     */
    streamCompletion(request: CompletionRequest): Promise<Response>;
    /**
     * Streaming object generation with schema (returns ReadableStream)
     */
    streamObject(request: ObjectRequest): Promise<Response>;
    /**
     * Process batch events with AI enrichment
     */
    processEvents(request: EventBatchRequest): Promise<EventBatchResponse>;
    /**
     * Get analytics metrics
     */
    getAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse>;
    /**
     * Get usage metrics for tier limits
     */
    getUsageMetrics(userId: string): Promise<UsageMetrics>;
}
export interface ChatRequest {
    messages: Array<{
        role: string;
        content: string;
    }>;
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
declare const _default: {
    streamChat(request: ChatRequest, env: Env): Promise<Response>;
    streamCompletion(request: CompletionRequest, env: Env): Promise<Response>;
    streamObject(request: ObjectRequest, env: Env): Promise<Response>;
    processEvents(request: EventBatchRequest, env: Env): Promise<EventBatchResponse>;
    getAnalytics(request: AnalyticsRequest, env: Env): Promise<AnalyticsResponse>;
    getUsageMetrics(userId: string, env: Env): Promise<UsageMetrics>;
    fetch(_request: Request, _env: Env): Promise<Response>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map