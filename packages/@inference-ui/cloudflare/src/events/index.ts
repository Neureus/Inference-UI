/**
 * Event Ingestion Handler (Cloudflare Workers)
 * Uses reusable EventProcessor with Cloudflare adapters
 */

import type { Env } from '../types';
import type { RequestContext } from '../auth/middleware';
import { createResponse, createErrorResponse } from '../workers';
import { EventProcessor, type IncomingEvent } from '@inference-ui/api';
import {
  D1DatabaseAdapter,
  AnalyticsEngineAdapter,
  WorkersAIAdapter,
} from '../adapters';
import { enforceEventLimit, trackEventUsage, parseUsageLimitError } from '../middleware/usage-tracker';

export async function handleEventIngestion(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  authContext: RequestContext
): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed. Use POST.', 405);
  }

  try {
    const body = await request.json();
    const events = Array.isArray(body) ? body : [body];

    // Create database adapter
    const database = new D1DatabaseAdapter(env.DB);

    // Use authenticated user ID if available, otherwise check event payload
    const userId = authContext.isAuthenticated
      ? authContext.userId
      : events[0]?.userId;

    // Enrich events with authenticated user context
    if (authContext.isAuthenticated) {
      events.forEach((event: any) => {
        event.userId = authContext.userId;
        event.userTier = authContext.tier;
      });
    }

    // Check tier limits for authenticated users before processing
    if (userId) {
      try {
        await enforceEventLimit(database, userId);
      } catch (error) {
        // Check if it's a usage limit error
        const limitError = parseUsageLimitError(error);
        if (limitError) {
          return createResponse(limitError, 429);
        }
        throw error;
      }
    }

    // Create event processor with Cloudflare adapters
    const processor = new EventProcessor({
      database,
      analytics: env.ANALYTICS ? new AnalyticsEngineAdapter(env.ANALYTICS) : undefined,
      ai: env.AI ? new WorkersAIAdapter(env.AI) : undefined,
      useAI: env.ENVIRONMENT === 'production' && false, // Disabled by default
    });

    // Process events in batch
    const result = await processor.processBatch(events as IncomingEvent[]);

    // Track usage for authenticated users after successful processing
    if (userId && result.processed > 0) {
      await trackEventUsage(database, userId, result.processed);
    }

    return createResponse({
      processed: result.processed,
      errors: result.errors,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Event ingestion error:', error);

    // Check if it's a usage limit error
    const limitError = parseUsageLimitError(error);
    if (limitError) {
      return createResponse(limitError, 429);
    }

    return createErrorResponse(
      error instanceof Error ? error.message : 'Event ingestion failed',
      500
    );
  }
}
