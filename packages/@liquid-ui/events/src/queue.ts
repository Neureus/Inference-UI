/**
 * Event queue with local storage
 * Manages event batching and persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Event, EventConfig } from './types';

const QUEUE_STORAGE_KEY = '@liquid-ui/events/queue';
const MAX_QUEUE_SIZE = 1000;
const MAX_RETRY_ATTEMPTS = 3;

export class EventQueue {
  private config?: EventConfig;
  private flushInProgress = false;

  constructor(config?: EventConfig) {
    this.config = config;
  }

  /**
   * Add event to queue
   */
  async add(event: Event): Promise<void> {
    try {
      const queue = await this.get();

      // Add new event
      queue.push(event);

      // Trim queue if it exceeds max size (keep most recent)
      if (queue.length > MAX_QUEUE_SIZE) {
        queue.splice(0, queue.length - MAX_QUEUE_SIZE);
      }

      // Save to storage
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));

      // Auto-flush if batch size reached
      if (this.config && queue.length >= this.config.batchSize) {
        this.flush().catch((error) => {
          console.error('[EventQueue] Auto-flush failed:', error);
        });
      }
    } catch (error) {
      console.error('[EventQueue] Failed to add event:', error);
      throw error;
    }
  }

  /**
   * Flush events to server
   */
  async flush(): Promise<void> {
    // Prevent concurrent flushes
    if (this.flushInProgress) {
      return;
    }

    this.flushInProgress = true;

    try {
      const queue = await this.get();

      if (queue.length === 0) {
        return;
      }

      if (!this.config?.endpoint) {
        console.warn('[EventQueue] No endpoint configured, events will remain queued');
        return;
      }

      // Send to server with retry logic
      await this.sendToServer(queue, 0);

      // Clear queue on success
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);

      console.log(`[EventQueue] Flushed ${queue.length} events successfully`);
    } catch (error) {
      console.error('[EventQueue] Flush failed:', error);
      // Events remain in queue for next flush attempt
      throw error;
    } finally {
      this.flushInProgress = false;
    }
  }

  /**
   * Get queued events
   */
  async get(): Promise<Event[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[EventQueue] Failed to get queue:', error);
      return [];
    }
  }

  /**
   * Get queue size
   */
  async size(): Promise<number> {
    const queue = await this.get();
    return queue.length;
  }

  /**
   * Clear all queued events
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      console.log('[EventQueue] Queue cleared');
    } catch (error) {
      console.error('[EventQueue] Failed to clear queue:', error);
      throw error;
    }
  }

  /**
   * Send events to server with retry
   */
  private async sendToServer(events: Event[], attempt: number): Promise<void> {
    if (!this.config?.endpoint) {
      throw new Error('No endpoint configured');
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[EventQueue] Server response:', result);
    } catch (error) {
      // Retry logic
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`[EventQueue] Retry attempt ${attempt + 1} in ${delay}ms`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.sendToServer(events, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    queueSize: number;
    oldestEvent?: number;
    newestEvent?: number;
  }> {
    const queue = await this.get();

    if (queue.length === 0) {
      return { queueSize: 0 };
    }

    return {
      queueSize: queue.length,
      oldestEvent: queue[0]?.timestamp,
      newestEvent: queue[queue.length - 1]?.timestamp,
    };
  }
}
