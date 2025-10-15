/**
 * Event tracker
 */

import type { Event } from './types';

export class EventTracker {
  track(eventName: string, properties?: Record<string, unknown>): void {
    // TODO: Add to queue
    const event: Event = {
      id: this.generateId(),
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      event: eventName,
      properties,
    };
    console.log('Event tracked:', event.id);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    // TODO: Get or create session ID
    return 'session-id';
  }
}
