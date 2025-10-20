/**
 * GraphQL API Handler (Cloudflare Workers)
 * Uses reusable API package with Cloudflare adapters
 */

import { graphql, buildSchema } from 'graphql';
import { schema, resolvers, AuthService, type APIContext } from '@inference-ui/api';
import type { Env } from '../types';
import type { AuthContext } from '../auth/middleware';
import { createResponse, createErrorResponse } from '../workers';
import {
  D1DatabaseAdapter,
  AnalyticsEngineAdapter,
  KVCacheAdapter,
  R2StorageAdapter,
  WorkersAIAdapter,
} from '../adapters';

// Build GraphQL schema
const graphqlSchema = buildSchema(schema);

export async function handleGraphQL(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  authContext: AuthContext
): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed. Use POST.', 405);
  }

  try {
    const body = await request.json();
    const { query, variables, operationName } = body as {
      query: string;
      variables?: Record<string, unknown>;
      operationName?: string;
    };

    if (!query) {
      return createErrorResponse('Missing query parameter', 400);
    }

    // Extract additional context from headers (sessionId, userAgent)
    const headerContext = AuthService.extractAuthContext(request.headers);

    // Build API context with adapters and authenticated user
    const context: APIContext = {
      database: new D1DatabaseAdapter(env.DB),
      analytics: env.ANALYTICS ? new AnalyticsEngineAdapter(env.ANALYTICS) : undefined,
      cache: env.KV ? new KVCacheAdapter(env.KV) : undefined,
      storage: env.STORAGE ? new R2StorageAdapter(env.STORAGE) : undefined,
      ai: env.AI ? new WorkersAIAdapter(env.AI) : undefined,
      userId: authContext.userId, // From API key authentication
      sessionId: headerContext.sessionId,
      userAgent: headerContext.userAgent,
    };

    // Execute GraphQL query
    const result = await graphql({
      schema: graphqlSchema,
      source: query,
      rootValue: resolvers,
      contextValue: context,
      variableValues: variables,
      operationName,
    });

    return createResponse(result);
  } catch (error) {
    console.error('GraphQL execution error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'GraphQL execution failed',
      500
    );
  }
}
