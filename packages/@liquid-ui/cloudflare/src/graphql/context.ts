/**
 * GraphQL Context Builder
 */

import type { Env } from '../types';

export interface GraphQLContext {
  env: Env;
  ctx: ExecutionContext;
  userId?: string;
  sessionId?: string;
}

export function buildExecutionContext(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): GraphQLContext {
  // Extract user ID from Authorization header
  const authHeader = request.headers.get('Authorization');
  let userId: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    // TODO: Verify JWT token and extract user ID
    userId = 'user-id-placeholder';
  }

  // Extract session ID from headers
  const sessionId = request.headers.get('X-Session-ID') || undefined;

  return {
    env,
    ctx,
    userId,
    sessionId,
  };
}
