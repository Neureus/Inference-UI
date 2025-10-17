/**
 * PersonQL Service Binding Worker
 *
 * This worker exposes PersonQL functionality via service bindings,
 * allowing other Cloudflare Workers to access PersonQL directly
 * without HTTP calls (0ms latency, no request costs).
 *
 * @example
 * // From another worker:
 * const response = await env.PERSONQL.query({
 *   query: 'query { person(id: "123") { id name email } }'
 * });
 */

import type {
  PersonQLEnv,
  PersonQLQueryRequest,
  PersonQLDirectRequest,
  PersonQLAIRequest,
  PersonQLCacheRequest,
} from './types';

import { handleQuery } from './handlers/query';
import { handleDirect } from './handlers/direct';
import { handleEnrich } from './handlers/enrich';
import { handleCache } from './handlers/cache';

/**
 * Service Binding RPC Interface
 *
 * These methods are directly callable via service bindings
 */
export default {
  /**
   * Main fetch handler (for HTTP access if needed)
   */
  async fetch(request: Request, env: PersonQLEnv, ctx: ExecutionContext): Promise<Response> {
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
      // Route based on path
      switch (path) {
        case '/health':
          return new Response(
            JSON.stringify({
              status: 'healthy',
              service: 'personql',
              version: 'v1',
              timestamp: Date.now(),
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );

        case '/query':
          if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
          }
          const queryReq = (await request.json()) as PersonQLQueryRequest;
          return await handleQuery(queryReq, env, ctx);

        case '/direct':
          if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
          }
          const directReq = (await request.json()) as PersonQLDirectRequest;
          return await handleDirect(directReq, env, ctx);

        case '/enrich':
          if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
          }
          const enrichReq = (await request.json()) as PersonQLAIRequest;
          return await handleEnrich(enrichReq, env, ctx);

        case '/cache':
          if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
          }
          const cacheReq = (await request.json()) as PersonQLCacheRequest;
          return await handleCache(cacheReq, env);

        case '/':
          return new Response(
            JSON.stringify({
              service: 'PersonQL Service Binding API',
              version: 'v1',
              description: 'Direct access to PersonQL via service bindings',
              endpoints: {
                query: '/query - Execute GraphQL query',
                direct: '/direct - Direct database access',
                enrich: '/enrich - AI enrichment',
                cache: '/cache - Cache operations',
                health: '/health - Health check',
              },
              serviceBinding: {
                usage: 'Use env.PERSONQL.query(...) from other workers',
                benefits: [
                  '0ms latency (no network calls)',
                  'No request costs',
                  'Type-safe interface',
                  'Automatic retries',
                ],
              },
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );

        default:
          return new Response(
            JSON.stringify({
              error: `Not found: ${path}`,
              availableEndpoints: ['/query', '/direct', '/enrich', '/cache', '/health'],
            }),
            {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
      }
    } catch (error) {
      console.error('PersonQL worker error:', error);

      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },

  /**
   * Service Binding RPC Methods
   *
   * These methods are callable directly from other workers via service bindings
   */

  /**
   * Execute GraphQL query
   */
  async query(
    request: PersonQLQueryRequest,
    env: PersonQLEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    return await handleQuery(request, env, ctx);
  },

  /**
   * Direct database access
   */
  async direct(
    request: PersonQLDirectRequest,
    env: PersonQLEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    return await handleDirect(request, env, ctx);
  },

  /**
   * AI enrichment
   */
  async enrich(
    request: PersonQLAIRequest,
    env: PersonQLEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    return await handleEnrich(request, env, ctx);
  },

  /**
   * Cache operations
   */
  async cache(request: PersonQLCacheRequest, env: PersonQLEnv): Promise<Response> {
    return await handleCache(request, env);
  },

  /**
   * Health check
   */
  async health(): Promise<Response> {
    return new Response(
      JSON.stringify({
        status: 'healthy',
        service: 'personql',
        timestamp: Date.now(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
