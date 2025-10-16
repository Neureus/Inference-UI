/**
 * Event Ingestion Handler
 * Receives events from React Native apps, enriches with AI, and stores in Analytics Engine
 */

import type { Env } from '../types';
import { createResponse, createErrorResponse } from '../workers';
import { runAI, MODELS } from '../ai';

interface IncomingEvent {
  id?: string;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
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
  incomingEvent: IncomingEvent,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  // Normalize event with defaults
  const event = {
    id: incomingEvent.id || crypto.randomUUID(),
    timestamp: incomingEvent.timestamp || Date.now(),
    userId: incomingEvent.userId,
    sessionId: incomingEvent.sessionId || crypto.randomUUID(),
    event: incomingEvent.event,
    component: incomingEvent.component,
    properties: incomingEvent.properties || {},
  };

  // 1. Enrich event with classification
  let intent: string;
  let sentiment: string;

  // Use rule-based classification by default for reliability
  // AI enrichment can be enabled via env var when ready
  const useAI = env.ENVIRONMENT === 'production' && false; // Disabled for now

  if (useAI) {
    try {
      // Generate a prompt for intent and sentiment analysis
      const analysisPrompt = `Analyze this user event and provide:
1. Intent (e.g., explore, purchase, configure, help, error)
2. Sentiment (positive, neutral, negative)

Event: ${event.event}
Component: ${event.component || 'unknown'}
Properties: ${JSON.stringify(event.properties || {})}

Respond in JSON format: {"intent": "...", "sentiment": "..."}`;

      const aiResult = await runAI(env.AI, MODELS.LLAMA_3_8B, {
        messages: [
          { role: 'system', content: 'You are an event analysis assistant. Analyze user events and respond with JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
      });

      // Parse AI response
      if (aiResult && typeof aiResult === 'object') {
        const response = (aiResult as any).response || (aiResult as any).text || '';

        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[^}]+\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          intent = parsed.intent || classifyIntent(event.event, event.properties);
          sentiment = parsed.sentiment || classifySentiment(event.event);
        } else {
          // Fallback: simple keyword-based classification
          intent = classifyIntent(event.event, event.properties);
          sentiment = classifySentiment(event.event);
        }
      } else {
        // Fallback classification
        intent = classifyIntent(event.event, event.properties);
        sentiment = classifySentiment(event.event);
      }
    } catch (error) {
      console.error('AI enrichment failed, using rule-based classification:', error);
      // Fallback to rule-based classification
      intent = classifyIntent(event.event, event.properties);
      sentiment = classifySentiment(event.event);
    }
  } else {
    // Use reliable rule-based classification
    intent = classifyIntent(event.event, event.properties);
    sentiment = classifySentiment(event.event);
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
    console.error('Analytics Engine write failed (non-fatal):', error);
    // Don't throw - Analytics Engine is optional
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

  // 4. Check for real-time alerts/triggers (disabled for now)
  // ctx.waitUntil(checkTriggers(event, env));
}

// async function checkTriggers(_event: IncomingEvent, _env: Env): Promise<void> {
//   // TODO: Implement trigger checking
//   // - High-value user actions
//   // - Error events
//   // - Conversion events
//   // - etc.
// }

// Fallback classification functions

function classifyIntent(eventName: string, _properties?: Record<string, unknown>): string {
  const event = eventName.toLowerCase();

  // Button/action intents
  if (event.includes('click') || event.includes('tap') || event.includes('press')) {
    if (event.includes('buy') || event.includes('purchase') || event.includes('checkout')) {
      return 'purchase';
    }
    if (event.includes('help') || event.includes('support') || event.includes('contact')) {
      return 'help';
    }
    if (event.includes('config') || event.includes('setting')) {
      return 'configure';
    }
    return 'interact';
  }

  // Navigation intents
  if (event.includes('view') || event.includes('open') || event.includes('navigate')) {
    return 'explore';
  }

  // Error intents
  if (event.includes('error') || event.includes('fail') || event.includes('crash')) {
    return 'error';
  }

  // Form intents
  if (event.includes('submit') || event.includes('form')) {
    return 'submit';
  }

  // Search intents
  if (event.includes('search') || event.includes('query')) {
    return 'search';
  }

  return 'unknown';
}

function classifySentiment(eventName: string): string {
  const event = eventName.toLowerCase();

  // Negative sentiment indicators
  if (
    event.includes('error') ||
    event.includes('fail') ||
    event.includes('crash') ||
    event.includes('cancel') ||
    event.includes('close') ||
    event.includes('exit')
  ) {
    return 'negative';
  }

  // Positive sentiment indicators
  if (
    event.includes('success') ||
    event.includes('complete') ||
    event.includes('purchase') ||
    event.includes('buy') ||
    event.includes('share') ||
    event.includes('like') ||
    event.includes('favorite')
  ) {
    return 'positive';
  }

  return 'neutral';
}
