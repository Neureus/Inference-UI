/**
 * GraphQL API Handler
 */

import { graphql, buildSchema } from 'graphql';
import type { Env } from '../types';
import { createResponse, createErrorResponse } from '../workers';
import { buildExecutionContext } from './context';
import { schema } from './schema';
import { resolvers } from './resolvers';

// Build GraphQL schema
const graphqlSchema = buildSchema(schema);

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
    const context = {
      ...buildExecutionContext(request, env, ctx),
      env,
      ctx,
      userId: undefined, // TODO: Extract from auth headers
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
