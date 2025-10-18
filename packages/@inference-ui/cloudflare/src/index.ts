/**
 * Inference UI - Cloudflare Workers Main Entry Point
 * HTTP API router for GraphQL and events
 * Service binding RPC methods are in inference-service worker
 */

import { createResponse, createErrorResponse } from './workers';
import { handleGraphQL } from './graphql';
import { handleEventIngestion } from './events';
import type { Env } from './types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route requests
      switch (true) {
        case path === '/graphql' || path === '/api/graphql':
          return await handleGraphQL(request, env, ctx);

        case path === '/events' || path === '/api/events':
          return await handleEventIngestion(request, env, ctx);

        // Stream endpoints - Route to streaming worker via service binding
        case path.startsWith('/stream/') || path.startsWith('/api/stream/'):
          const streamPath = path.replace('/stream', '').replace('/api/stream', '');
          const streamUrl = new URL(streamPath, request.url);

          // Forward to streaming worker (0ms latency via service binding)
          return await env.STREAMING.fetch(streamUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body,
          });

        case path === '/health':
          return createResponse({ status: 'healthy', timestamp: Date.now() });

        case path === '/':
          return createResponse({
            name: 'Inference UI API',
            version: env.API_VERSION || 'v1',
            architecture: 'service-bindings',
            endpoints: {
              graphql: '/graphql',
              events: '/events',
              streamChat: '/stream/chat (→ streaming worker)',
              streamCompletion: '/stream/completion (→ streaming worker)',
              streamObject: '/stream/object (→ streaming worker)',
              health: '/health',
            },
          });

        default:
          return createErrorResponse('Not found', 404);
      }
    } catch (error) {
      console.error('Error handling request:', error);
      return createErrorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  },

  // Scheduled event handler (for cron jobs)
  async scheduled(controller: ScheduledController, _env: Env, _ctx: ExecutionContext): Promise<void> {
    // Process aggregated analytics
    console.log('Running scheduled task:', controller.scheduledTime);
    // TODO: Implement scheduled analytics processing
  },
};
