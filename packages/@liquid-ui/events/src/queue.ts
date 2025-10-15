/**
 * Event queue with local storage
 */

import type { Event } from './types';

export class EventQueue {
  private static QUEUE_KEY = '@liquid-ui/events';
  private static MAX_QUEUE_SIZE = 50;

  async add(event: Event): Promise<void> {
    // TODO: Implement AsyncStorage queue
  }

  async flush(): Promise<void> {
    // TODO: Send to Cloudflare Workers
  }

  async get(): Promise<Event[]> {
    // TODO: Get from AsyncStorage
    return [];
  }
}
