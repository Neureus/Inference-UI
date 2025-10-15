/**
 * Event Ingestion Handler
 * Receives events from React Native apps, enriches with AI, and stores in Analytics Engine
 */

import type { Env } from '../types';
import { createResponse, createErrorResponse } from '../workers';
import { runAI, MODELS } from '../ai';

interface IncomingEvent {
  id: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  event: string;
  component?: string;
  properties?: Record<string, unknown>;
}

export async function handleEventIngestion(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed. Use POST.', 405);
  }

  try {
    const body = await request.json();
    const events = Array.isArray(body) ? body : [body];

    // Process events in parallel
    const results = await Promise.allSettled(
      events.map((event: IncomingEvent) => processEvent(event, env, ctx))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const errorCount = results.filter((r) => r.status === 'rejected').length;

    return createResponse({
      processed: successCount,
      errors: errorCount,
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

async function processEvent(
  event: IncomingEvent,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  // 1. Enrich event with AI classification
  let intent: string | undefined;
  let sentiment: string | undefined;

  try {
    const aiResult = await runAI(env.AI, MODELS.TEXT_CLASSIFICATION, {
      text: JSON.stringify(event.properties || {}),
    });

    // TODO: Parse AI result
    intent = 'unknown';
    sentiment = 'neutral';
  } catch (error) {
    console.error('AI enrichment failed:', error);
    // Continue without AI enrichment
  }

  // 2. Write to Analytics Engine
  try {
    env.ANALYTICS.writeDataPoint({
      indexes: [
        event.userId || 'anonymous',
        event.sessionId,
        event.event,
        event.component || 'unknown',
      ],
      blobs: [
        JSON.stringify(event.properties || {}),
        intent || 'unknown',
        sentiment || 'neutral',
      ],
      doubles: [event.timestamp, 1], // timestamp, count
    });
  } catch (error) {
    console.error('Analytics Engine write failed:', error);
    throw error;
  }

  // 3. Store detailed event in D1 (for recent events query)
  try {
    await env.DB.prepare(
      `INSERT INTO events (id, user_id, session_id, event, component, properties, intent, sentiment, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        event.id,
        event.userId || null,
        event.sessionId,
        event.event,
        event.component || null,
        JSON.stringify(event.properties || {}),
        intent || null,
        sentiment || null,
        event.timestamp
      )
      .run();
  } catch (error) {
    console.error('D1 insert failed:', error);
    // Don't fail the request if D1 insert fails
  }

  // 4. Check for real-time alerts/triggers
  ctx.waitUntil(checkTriggers(event, env));
}

async function checkTriggers(event: IncomingEvent, env: Env): Promise<void> {
  // TODO: Implement trigger checking
  // - High-value user actions
  // - Error events
  // - Conversion events
  // - etc.
}
