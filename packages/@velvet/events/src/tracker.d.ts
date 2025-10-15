/**
 * Event tracker
 * Tracks events and adds them to the queue
 */
import { EventQueue } from './queue';
export declare class EventTracker {
    private queue;
    private sessionId;
    private userId;
    constructor(queue: EventQueue);
    /**
     * Track an event
     */
    track(eventName: string, properties?: Record<string, unknown>): Promise<void>;
    /**
     * Set user ID for tracking
     */
    setUserId(userId: string | null): Promise<void>;
    /**
     * Get current user ID
     */
    getUserId(): Promise<string | undefined>;
    /**
     * Start a new session
     */
    startNewSession(): Promise<void>;
    /**
     * Get current session ID
     */
    getSessionId(): Promise<string>;
    /**
     * Initialize session on startup
     */
    private initializeSession;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Get tracker statistics
     */
    getStats(): Promise<{
        sessionId: string;
        userId?: string;
        queueSize: number;
    }>;
}
//# sourceMappingURL=tracker.d.ts.map