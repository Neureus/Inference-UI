/**
 * Event Processing Service
 * Reusable event processing logic with classification
 */

import type { EventRecord, EventInput, AIAdapter, DatabaseAdapter, AnalyticsAdapter } from '../types';

export interface EventProcessorConfig {
  database: DatabaseAdapter;
  analytics?: AnalyticsAdapter;
  ai?: AIAdapter;
  useAI?: boolean;
}

export interface IncomingEvent extends EventInput {
  id?: string;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export class EventProcessor {
  constructor(private config: EventProcessorConfig) {}

  /**
   * Process a single event
   */
  async processEvent(incomingEvent: IncomingEvent): Promise<void> {
    // Normalize event with defaults
    const event: EventRecord = {
      id: incomingEvent.id || crypto.randomUUID(),
      timestamp: incomingEvent.timestamp || Date.now(),
      userId: incomingEvent.userId,
      sessionId: incomingEvent.sessionId || crypto.randomUUID(),
      event: incomingEvent.event,
      component: incomingEvent.component,
      properties: incomingEvent.properties || {},
    };

    // Classify event
    let intent: string;
    let sentiment: string;

    if (this.config.useAI && this.config.ai) {
      try {
        const classification = await this.classifyWithAI(event);
        intent = classification.intent;
        sentiment = classification.sentiment;
      } catch (error) {
        console.error('AI classification failed, using rule-based:', error);
        intent = this.classifyIntent(event.event, event.properties);
        sentiment = this.classifySentiment(event.event);
      }
    } else {
      intent = this.classifyIntent(event.event, event.properties);
      sentiment = this.classifySentiment(event.event);
    }

    event.intent = intent;
    event.sentiment = sentiment;

    // Write to analytics (non-fatal)
    if (this.config.analytics) {
      try {
        await this.config.analytics.writeDataPoint({
          indexes: [
            event.userId || 'anonymous',
            event.sessionId,
            event.event,
            event.component || 'unknown',
          ],
          blobs: [
            JSON.stringify(event.properties || {}),
            event.intent || 'unknown',
            event.sentiment || 'neutral',
          ],
          doubles: [event.timestamp, 1],
        });
      } catch (error) {
        console.error('Analytics write failed (non-fatal):', error);
      }
    }

    // Write to database
    try {
      await this.config.database.createEvent(event);
    } catch (error) {
      console.error('Database write failed:', error);
      throw error;
    }
  }

  /**
   * Process multiple events in batch
   */
  async processBatch(events: IncomingEvent[]): Promise<{
    processed: number;
    errors: number;
  }> {
    const results = await Promise.allSettled(
      events.map((event) => this.processEvent(event))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const errorCount = results.filter((r) => r.status === 'rejected').length;

    return {
      processed: successCount,
      errors: errorCount,
    };
  }

  /**
   * Classify event with AI
   */
  private async classifyWithAI(event: EventRecord): Promise<{
    intent: string;
    sentiment: string;
  }> {
    if (!this.config.ai) {
      throw new Error('AI adapter not configured');
    }

    const analysisPrompt = `Analyze this user event and provide:
1. Intent (e.g., explore, purchase, configure, help, error)
2. Sentiment (positive, neutral, negative)

Event: ${event.event}
Component: ${event.component || 'unknown'}
Properties: ${JSON.stringify(event.properties || {})}

Respond in JSON format: {"intent": "...", "sentiment": "..."}`;

    const aiResult = await this.config.ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are an event analysis assistant. Analyze user events and respond with JSON.',
        },
        { role: 'user', content: analysisPrompt },
      ],
    });

    // Parse AI response
    if (aiResult && typeof aiResult === 'object') {
      const response = aiResult.response || aiResult.text || '';

      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent || this.classifyIntent(event.event, event.properties),
          sentiment: parsed.sentiment || this.classifySentiment(event.event),
        };
      }
    }

    // Fallback
    return {
      intent: this.classifyIntent(event.event, event.properties),
      sentiment: this.classifySentiment(event.event),
    };
  }

  /**
   * Rule-based intent classification
   */
  private classifyIntent(eventName: string, _properties?: Record<string, unknown>): string {
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

  /**
   * Rule-based sentiment classification
   */
  private classifySentiment(eventName: string): string {
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
}
