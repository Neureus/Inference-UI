/**
 * Event tracker
 * Tracks events and adds them to the queue
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
const SESSION_STORAGE_KEY = '@velvet/events/session';
const USER_STORAGE_KEY = '@velvet/events/user';
export class EventTracker {
    constructor(queue) {
        this.sessionId = null;
        this.userId = null;
        this.queue = queue;
        this.initializeSession();
    }
    /**
     * Track an event
     */
    async track(eventName, properties) {
        try {
            const event = {
                id: this.generateId(),
                timestamp: Date.now(),
                sessionId: await this.getSessionId(),
                userId: await this.getUserId(),
                event: eventName,
                properties,
            };
            // Add to queue (async, non-blocking)
            await this.queue.add(event);
            console.log(`[EventTracker] Event tracked: ${event.event} (${event.id})`);
        }
        catch (error) {
            console.error('[EventTracker] Failed to track event:', error);
            // Don't throw - tracking failures shouldn't break the app
        }
    }
    /**
     * Set user ID for tracking
     */
    async setUserId(userId) {
        this.userId = userId;
        if (userId) {
            await AsyncStorage.setItem(USER_STORAGE_KEY, userId);
        }
        else {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
    }
    /**
     * Get current user ID
     */
    async getUserId() {
        if (this.userId) {
            return this.userId;
        }
        try {
            const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (stored) {
                this.userId = stored;
                return stored;
            }
        }
        catch (error) {
            console.error('[EventTracker] Failed to get user ID:', error);
        }
        return undefined;
    }
    /**
     * Start a new session
     */
    async startNewSession() {
        this.sessionId = this.generateId();
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, this.sessionId);
        console.log(`[EventTracker] New session started: ${this.sessionId}`);
    }
    /**
     * Get current session ID
     */
    async getSessionId() {
        if (this.sessionId) {
            return this.sessionId;
        }
        try {
            const stored = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
            if (stored) {
                this.sessionId = stored;
                return stored;
            }
        }
        catch (error) {
            console.error('[EventTracker] Failed to get session ID:', error);
        }
        // Create new session if none exists
        this.sessionId = this.generateId();
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, this.sessionId);
        return this.sessionId;
    }
    /**
     * Initialize session on startup
     */
    async initializeSession() {
        try {
            // Try to restore session
            const stored = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
            if (stored) {
                // Check if session is still valid (< 30 minutes old)
                const sessionData = await AsyncStorage.getItem(`${SESSION_STORAGE_KEY}_timestamp`);
                const timestamp = sessionData ? parseInt(sessionData, 10) : 0;
                const now = Date.now();
                // Session expires after 30 minutes of inactivity
                if (now - timestamp < 30 * 60 * 1000) {
                    this.sessionId = stored;
                    console.log(`[EventTracker] Session restored: ${this.sessionId}`);
                }
                else {
                    await this.startNewSession();
                }
            }
            else {
                await this.startNewSession();
            }
            // Update session timestamp
            await AsyncStorage.setItem(`${SESSION_STORAGE_KEY}_timestamp`, Date.now().toString());
            // Restore user ID if exists
            const userId = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (userId) {
                this.userId = userId;
            }
        }
        catch (error) {
            console.error('[EventTracker] Failed to initialize session:', error);
            // Create new session on error
            this.sessionId = this.generateId();
        }
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * Get tracker statistics
     */
    async getStats() {
        return {
            sessionId: await this.getSessionId(),
            userId: await this.getUserId(),
            queueSize: await this.queue.size(),
        };
    }
}
//# sourceMappingURL=tracker.js.map