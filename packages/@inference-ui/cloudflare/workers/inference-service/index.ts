/**
 * Inference Service Worker
 *
 * Exposes AI inference and analytics methods via Service Bindings (RPC).
 * This worker is called directly by other workers without HTTP overhead.
 *
 * Service Binding Benefits:
 * - Direct function calls (no HTTP serialization)
 * - Type-safe with TypeScript
 * - Lower latency (<1ms vs ~50ms for HTTP)
 * - No fetch() overhead
 * - Shared types between workers
 */

import type { Env } from '../../src/types';

export interface InferenceService {
  /**
   * Streaming chat completion (returns ReadableStream)
   */
  streamChat(request: ChatRequest): Promise<Response>;

  /**
   * Streaming text completion (returns ReadableStream)
   */
  streamCompletion(request: CompletionRequest): Promise<Response>;

  /**
   * Streaming object generation with schema (returns ReadableStream)
   */
  streamObject(request: ObjectRequest): Promise<Response>;

  /**
   * Process batch events with AI enrichment
   */
  processEvents(request: EventBatchRequest): Promise<EventBatchResponse>;

  /**
   * Get analytics metrics
   */
  getAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse>;

  /**
   * Get usage metrics for tier limits
   */
  getUsageMetrics(userId: string): Promise<UsageMetrics>;
}

// Request/Response Types
export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  userId?: string;
  sessionId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CompletionRequest {
  prompt: string;
  systemPrompt?: string;
  userId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ObjectRequest {
  prompt: string;
  schema: Record<string, any>;
  userId?: string;
  temperature?: number;
}

export interface EventBatchRequest {
  events: Array<{
    event: string;
    component?: string;
    userId?: string;
    sessionId?: string;
    timestamp: number;
    properties?: Record<string, any>;
  }>;
  userId?: string;
}

export interface EventBatchResponse {
  processed: number;
  failed: number;
  errors?: string[];
}

export interface AnalyticsRequest {
  type: 'events' | 'flows' | 'sessions' | 'components';
  userId: string;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}

export interface AnalyticsResponse {
  data: any;
  cached: boolean;
  timestamp: number;
}

export interface UsageMetrics {
  events: number;
  aiRequests: number;
  flows: number;
  limit: {
    events: number;
    aiRequests: number;
    flows: number;
  };
  tier: string;
  warningLevel: 'ok' | 'warning' | 'critical' | 'exceeded';
}

// Service Worker Implementation
export default class InferenceServiceWorker implements InferenceService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Streaming chat completion using Workers AI
   */
  async streamChat(request: ChatRequest): Promise<Response> {
    try {
      const stream = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: request.messages,
        stream: true,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
      });

      // Convert AI stream to SSE format
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        try {
          for await (const chunk of stream as any) {
            if (chunk.response) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content: chunk.response })}\n\n`));
            }
          }
          await writer.write(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`));
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Streaming text completion
   */
  async streamCompletion(request: CompletionRequest): Promise<Response> {
    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    return this.streamChat({ ...request, messages });
  }

  /**
   * Streaming object generation with schema validation
   */
  async streamObject(request: ObjectRequest): Promise<Response> {
    const systemPrompt = `You are a JSON generator. Generate a valid JSON object that matches this schema: ${JSON.stringify(request.schema)}. Return ONLY the JSON object, no markdown or explanation.`;

    return this.streamCompletion({
      prompt: request.prompt,
      systemPrompt,
      userId: request.userId,
      temperature: request.temperature,
    });
  }

  /**
   * Process batch events with AI enrichment
   */
  async processEvents(request: EventBatchRequest): Promise<EventBatchResponse> {
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      // Process events in parallel
      const results = await Promise.allSettled(
        request.events.map(async (event) => {
          // Simple rule-based classification (fast)
          const intent = this.classifyIntent(event.event, event.component);
          const sentiment = this.classifySentiment(event.event);

          // Write to Analytics Engine
          if (this.env.ANALYTICS) {
            await this.env.ANALYTICS.writeDataPoint({
              indexes: [event.userId || 'anonymous', event.sessionId || 'unknown'],
              blobs: [event.event, event.component || 'unknown', intent, sentiment],
              doubles: [event.timestamp, 1.0],
            });
          }

          // Write to D1 for queryable history
          if (this.env.DB && event.userId) {
            await this.env.DB.prepare(`
              INSERT INTO events (user_id, session_id, event, component, intent, sentiment, timestamp, properties)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              event.userId,
              event.sessionId || null,
              event.event,
              event.component || null,
              intent,
              sentiment,
              event.timestamp,
              JSON.stringify(event.properties || {})
            ).run();
          }

          return true;
        })
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          processed++;
        } else {
          failed++;
          errors.push(`Event ${index}: ${result.reason}`);
        }
      });

      return { processed, failed, errors: errors.length > 0 ? errors : undefined };
    } catch (error) {
      return {
        processed,
        failed: request.events.length - processed,
        errors: [String(error)],
      };
    }
  }

  /**
   * Get analytics metrics with caching
   */
  async getAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse> {
    const cacheKey = `analytics:${request.type}:${request.userId}:${request.startDate}:${request.endDate}`;

    // Try cache first
    if (this.env.KV) {
      const cached = await this.env.KV.get(cacheKey);
      if (cached) {
        return {
          data: JSON.parse(cached),
          cached: true,
          timestamp: Date.now(),
        };
      }
    }

    // Query from D1 based on type
    let data: any = {};

    if (this.env.DB) {
      switch (request.type) {
        case 'events':
          const events = await this.env.DB.prepare(`
            SELECT event, COUNT(*) as count
            FROM events
            WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
            GROUP BY event
            ORDER BY count DESC
            LIMIT 10
          `).bind(
            request.userId,
            request.startDate ? new Date(request.startDate).getTime() : Date.now() - 7 * 24 * 60 * 60 * 1000,
            request.endDate ? new Date(request.endDate).getTime() : Date.now()
          ).all();
          data = events.results;
          break;

        case 'sessions':
          const sessions = await this.env.DB.prepare(`
            SELECT session_id, COUNT(*) as events, MIN(timestamp) as start, MAX(timestamp) as end
            FROM events
            WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
            GROUP BY session_id
            ORDER BY start DESC
            LIMIT 50
          `).bind(
            request.userId,
            request.startDate ? new Date(request.startDate).getTime() : Date.now() - 7 * 24 * 60 * 60 * 1000,
            request.endDate ? new Date(request.endDate).getTime() : Date.now()
          ).all();
          data = sessions.results;
          break;

        default:
          data = { message: 'Analytics type not implemented' };
      }
    }

    // Cache for 10 minutes
    if (this.env.KV) {
      await this.env.KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 600 });
    }

    return {
      data,
      cached: false,
      timestamp: Date.now(),
    };
  }

  /**
   * Get usage metrics for tier limit enforcement
   */
  async getUsageMetrics(userId: string): Promise<UsageMetrics> {
    if (!this.env.DB) {
      throw new Error('Database not available');
    }

    // Get user tier
    const user = await this.env.DB.prepare('SELECT tier FROM users WHERE id = ?').bind(userId).first<{ tier: string }>();
    const tier = user?.tier || 'free';

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = await this.env.DB.prepare(`
      SELECT events_count, ai_requests_count, flows_count
      FROM usage
      WHERE user_id = ? AND month = ?
    `).bind(userId, currentMonth).first<{ events_count: number; ai_requests_count: number; flows_count: number }>();

    const events = usage?.events_count || 0;
    const aiRequests = usage?.ai_requests_count || 0;
    const flows = usage?.flows_count || 0;

    // Tier limits
    const limits = {
      free: { events: 1000, aiRequests: 100, flows: 10 },
      developer: { events: 50000, aiRequests: 5000, flows: 100 },
      business: { events: -1, aiRequests: 50000, flows: 500 },
      enterprise: { events: -1, aiRequests: -1, flows: -1 },
    }[tier] || { events: 1000, aiRequests: 100, flows: 10 };

    // Calculate warning level
    const percentages = {
      events: limits.events === -1 ? 0 : (events / limits.events) * 100,
      aiRequests: limits.aiRequests === -1 ? 0 : (aiRequests / limits.aiRequests) * 100,
      flows: limits.flows === -1 ? 0 : (flows / limits.flows) * 100,
    };

    const maxPercentage = Math.max(...Object.values(percentages));
    let warningLevel: 'ok' | 'warning' | 'critical' | 'exceeded' = 'ok';
    if (maxPercentage >= 100) warningLevel = 'exceeded';
    else if (maxPercentage >= 90) warningLevel = 'critical';
    else if (maxPercentage >= 75) warningLevel = 'warning';

    return {
      events,
      aiRequests,
      flows,
      limit: limits,
      tier,
      warningLevel,
    };
  }

  // Helper methods
  private classifyIntent(event: string, component?: string): string {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('click') || eventLower.includes('tap')) {
      if (eventLower.includes('buy') || eventLower.includes('purchase') || eventLower.includes('checkout')) {
        return 'purchase';
      }
      if (eventLower.includes('help') || eventLower.includes('support')) {
        return 'help';
      }
      if (eventLower.includes('settings') || eventLower.includes('configure')) {
        return 'configure';
      }
      return 'interact';
    }
    if (eventLower.includes('view') || eventLower.includes('scroll')) {
      return 'explore';
    }
    if (eventLower.includes('error') || eventLower.includes('fail')) {
      return 'error';
    }
    if (eventLower.includes('submit') || eventLower.includes('send')) {
      return 'submit';
    }
    if (eventLower.includes('search') || eventLower.includes('query')) {
      return 'search';
    }
    return 'unknown';
  }

  private classifySentiment(event: string): string {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('error') || eventLower.includes('fail') || eventLower.includes('cancel')) {
      return 'negative';
    }
    if (eventLower.includes('success') || eventLower.includes('complete') || eventLower.includes('buy')) {
      return 'positive';
    }
    return 'neutral';
  }
}

// Cloudflare Workers RPC Export
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Service binding workers can still have HTTP endpoints for debugging
    return new Response('Inference Service Worker - Use service bindings for RPC calls', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  },
} satisfies ExportedHandler<Env>;
