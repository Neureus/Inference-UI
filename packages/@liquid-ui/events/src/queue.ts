/**
 * Event queue with local storage
 */

import type { Event } from './types';

export class EventQueue {
  async add(_event: Event): Promise<void> {
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
