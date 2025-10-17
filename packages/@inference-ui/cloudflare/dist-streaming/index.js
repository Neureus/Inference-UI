/**
 * Inference UI - Streaming Worker
 *
 * Dedicated worker for AI streaming responses with Workers AI.
 * Called via service binding from main API worker.
 *
 * Benefits:
 * - Independent scaling for AI workloads
 * - Isolated CPU/memory resources
 * - Reduced cold start times
 * - Optimized for long-running streams
 */
import { handleStreamChat } from './handlers/stream-chat';
import { handleStreamCompletion } from './handlers/stream-completion';
import { handleStreamObject } from './handlers/stream-object';
/**
 * Error response helper
 */
function createErrorResponse(message, status = 500) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
/**
 * Streaming Worker Entry Point
 */
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };
        // Handle OPTIONS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        try {
            // Route streaming requests
            switch (path) {
                case '/chat':
                    return await handleStreamChat(request, env, ctx);
                case '/completion':
                    return await handleStreamCompletion(request, env, ctx);
                case '/object':
                    return await handleStreamObject(request, env, ctx);
                case '/health':
                    return new Response(JSON.stringify({
                        status: 'healthy',
                        worker: 'streaming',
                        timestamp: Date.now(),
                    }), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    });
                default:
                    return createErrorResponse(`Not found: ${path}. Available endpoints: /chat, /completion, /object`, 404);
            }
        }
        catch (error) {
            console.error('Streaming worker error:', error);
            return createErrorResponse(error instanceof Error ? error.message : 'Internal server error', 500);
        }
    },
};
//# sourceMappingURL=index.js.map