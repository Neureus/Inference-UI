/**
 * GraphQL API Handler
 */

import type { Env } from '../types';
import { createResponse, createErrorResponse } from '../workers';
import { schema } from './schema';
import { buildExecutionContext } from './context';

export async function handleGraphQL(
  request: Request,
  env: Env,
  ctx: ExecutionContext
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

    // Build execution context
    const context = buildExecutionContext(request, env, ctx);

    // TODO: Implement GraphQL execution with graphql-js or similar
    // For now, return a stub response
    const result = {
      data: {
        __schema: {
          queryType: { name: 'Query' },
          mutationType: { name: 'Mutation' },
          subscriptionType: null,
        },
      },
    };

    return createResponse(result);
  } catch (error) {
    console.error('GraphQL execution error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'GraphQL execution failed',
      500
    );
  }
}
