/**
 * Event queue with local storage
 * Manages event batching and persistence
 */
import type { Event, EventConfig } from './types';
export declare class EventQueue {
    private config?;
    private flushInProgress;
    constructor(config?: EventConfig);
    /**
     * Add event to queue
     */
    add(event: Event): Promise<void>;
    /**
     * Flush events to server
     */
    flush(): Promise<void>;
    /**
     * Get queued events
     */
    get(): Promise<Event[]>;
    /**
     * Get queue size
     */
    size(): Promise<number>;
    /**
     * Clear all queued events
     */
    clear(): Promise<void>;
    /**
     * Send events to server with retry
     */
    private sendToServer;
    /**
     * Get queue statistics
     */
    getStats(): Promise<{
        queueSize: number;
        oldestEvent?: number;
        newestEvent?: number;
    }>;
}
//# sourceMappingURL=queue.d.ts.map