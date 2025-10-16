/**
 * Event Ingestion Handler (Cloudflare Workers)
 * Uses reusable EventProcessor with Cloudflare adapters
 */

import type { Env } from '../types';
import { createResponse, createErrorResponse } from '../workers';
import { EventProcessor, type IncomingEvent } from '@inference-ui/api';
import {
  D1DatabaseAdapter,
  AnalyticsEngineAdapter,
  WorkersAIAdapter,
} from '../adapters';

export async function handleEventIngestion(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed. Use POST.', 405);
  }

  try {
    const body = await request.json();
    const events = Array.isArray(body) ? body : [body];

    // Create event processor with Cloudflare adapters
    const processor = new EventProcessor({
      database: new D1DatabaseAdapter(env.DB),
      analytics: env.ANALYTICS ? new AnalyticsEngineAdapter(env.ANALYTICS) : undefined,
      ai: env.AI ? new WorkersAIAdapter(env.AI) : undefined,
      useAI: env.ENVIRONMENT === 'production' && false, // Disabled by default
    });

    // Process events in batch
    const result = await processor.processBatch(events as IncomingEvent[]);

    return createResponse({
      processed: result.processed,
      errors: result.errors,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Event ingestion error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Event ingestion failed',
      500
    );
  }
}
