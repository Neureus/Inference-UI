/**
 * Inference UI - Cloudflare Workers Main Entry Point
 * GraphQL API for AI-native UI library
 */

import { createResponse, createErrorResponse } from './workers';
import { handleGraphQL } from './graphql';
import { handleEventIngestion } from './events';
import type { Env } from './types';
import type {
  InferenceUIGraphQLRequest,
  InferenceUIEventRequest,
  InferenceUIBatchEventRequest,
  InferenceUIChatRequest,
  InferenceUICompletionRequest,
  InferenceUIObjectRequest,
} from './types/service-bindings';

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

  /**
   * Service Binding RPC Methods
   *
   * These methods are callable directly from other workers via service bindings
   */

  /**
   * Execute GraphQL query via service binding
   */
  async graphql(
    request: InferenceUIGraphQLRequest,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Create a fake Request object for the GraphQL handler
    const graphqlRequest = new Request('http://internal/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await handleGraphQL(graphqlRequest, env, ctx);
  },

  /**
   * Ingest single event via service binding
   */
  async ingestEvent(
    request: InferenceUIEventRequest,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Create a fake Request object for the event handler
    const eventRequest = new Request('http://internal/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: [request] }),
    });

    return await handleEventIngestion(eventRequest, env, ctx);
  },

  /**
   * Ingest batch of events via service binding
   */
  async ingestBatch(
    request: InferenceUIBatchEventRequest,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Create a fake Request object for the event handler
    const eventRequest = new Request('http://internal/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await handleEventIngestion(eventRequest, env, ctx);
  },

  /**
   * Stream chat completion via service binding
   */
  async streamChat(
    request: InferenceUIChatRequest,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    // Forward to streaming worker via service binding
    const streamRequest = new Request('http://internal/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await env.STREAMING.fetch(streamRequest);
  },

  /**
   * Stream text completion via service binding
   */
  async streamCompletion(
    request: InferenceUICompletionRequest,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    // Forward to streaming worker via service binding
    const streamRequest = new Request('http://internal/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await env.STREAMING.fetch(streamRequest);
  },

  /**
   * Stream object generation via service binding
   */
  async streamObject(
    request: InferenceUIObjectRequest,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    // Forward to streaming worker via service binding
    const streamRequest = new Request('http://internal/object', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await env.STREAMING.fetch(streamRequest);
  },

  /**
   * Health check via service binding
   */
  async health(): Promise<Response> {
    return createResponse({ status: 'healthy', timestamp: Date.now() });
  },
};
