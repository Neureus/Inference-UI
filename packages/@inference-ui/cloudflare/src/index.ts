/**
 * Velvet - Cloudflare Workers Main Entry Point
 * GraphQL API for AI-native UI library
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

        case path === '/health':
          return createResponse({ status: 'healthy', timestamp: Date.now() });

        case path === '/':
          return createResponse({
            name: 'Velvet API',
            version: env.API_VERSION || 'v1',
            endpoints: {
              graphql: '/graphql',
              events: '/events',
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
} satisfies ExportedHandler<Env>;
