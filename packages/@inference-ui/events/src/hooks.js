/**
 * React hooks for event tracking
 * Provides easy-to-use hooks for React Native components
 */
import React, { useState, useEffect, useCallback, useRef, useContext, createContext } from 'react';
import { EventTracker } from './tracker';
import { EventQueue } from './queue';
const EventContext = createContext(null);
/**
 * Provider component for event tracking
 * Wrap your app with this to enable event tracking
 */
export function EventProvider({ children, config, }) {
    const queueRef = useRef(new EventQueue(config));
    const trackerRef = useRef(new EventTracker(queueRef.current));
    const value = {
        tracker: trackerRef.current,
        queue: queueRef.current,
        config,
    };
    // Setup automatic flush interval
    useEffect(() => {
        const interval = setInterval(() => {
            queueRef.current.flush().catch((error) => {
                console.error('[Events] Failed to flush queue:', error);
            });
        }, config.batchInterval || 20000); // Default 20 seconds
        return () => clearInterval(interval);
    }, [config.batchInterval]);
    return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
/**
 * Hook to access event tracker
 */
export function useEventTracker() {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEventTracker must be used within EventProvider');
    }
    const track = useCallback((event, properties) => {
        context.tracker.track(event, properties);
    }, [context.tracker]);
    return track;
}
/**
 * Hook to track component lifecycle events
 * Automatically tracks mount, unmount, and updates
 */
export function useComponentTracking(componentName, trackUpdates = false) {
    const track = useEventTracker();
    const updateCount = useRef(0);
    useEffect(() => {
        // Track mount
        track('component_mounted', {
            component: componentName,
            timestamp: Date.now(),
        });
        // Track unmount
        return () => {
            track('component_unmounted', {
                component: componentName,
                lifetime: Date.now(),
                updates: updateCount.current,
            });
        };
    }, [componentName, track]);
    useEffect(() => {
        if (trackUpdates && updateCount.current > 0) {
            track('component_updated', {
                component: componentName,
                updateNumber: updateCount.current,
            });
        }
        updateCount.current++;
    });
}
/**
 * Hook to track screen views
 * Call this in your screen components
 */
export function useScreenTracking(screenName, params) {
    const track = useEventTracker();
    const [viewStartTime] = useState(Date.now());
    useEffect(() => {
        // Track screen view
        track('screen_view', {
            screen: screenName,
            timestamp: Date.now(),
            ...params,
        });
        // Track screen exit on unmount
        return () => {
            const duration = Date.now() - viewStartTime;
            track('screen_exit', {
                screen: screenName,
                duration,
            });
        };
    }, [screenName, track, params, viewStartTime]);
}
/**
 * Hook to track button presses
 * Returns a function to wrap your onPress handler
 */
export function useButtonTracking(buttonName) {
    const track = useEventTracker();
    const trackPress = useCallback((onPress) => {
        return () => {
            track('button_press', {
                button: buttonName,
                timestamp: Date.now(),
            });
            onPress?.();
        };
    }, [buttonName, track]);
    return trackPress;
}
/**
 * Hook to track form interactions
 */
export function useFormTracking(formName) {
    const track = useEventTracker();
    const [startTime] = useState(Date.now());
    const [interactions, setInteractions] = useState(0);
    const trackFieldFocus = useCallback((fieldName) => {
        track('form_field_focus', {
            form: formName,
            field: fieldName,
        });
        setInteractions((prev) => prev + 1);
    }, [formName, track]);
    const trackFieldBlur = useCallback((fieldName, value) => {
        track('form_field_blur', {
            form: formName,
            field: fieldName,
            hasValue: value !== undefined && value !== '',
        });
    }, [formName, track]);
    const trackSubmit = useCallback((success, errors) => {
        const duration = Date.now() - startTime;
        track('form_submit', {
            form: formName,
            success,
            duration,
            interactions,
            errorCount: errors ? Object.keys(errors).length : 0,
            errors,
        });
    }, [formName, track, startTime, interactions]);
    return {
        trackFieldFocus,
        trackFieldBlur,
        trackSubmit,
    };
}
/**
 * Hook to track errors
 */
export function useErrorTracking() {
    const track = useEventTracker();
    const trackError = useCallback((error, context) => {
        track('error', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context,
        });
    }, [track]);
    return trackError;
}
/**
 * Hook to track custom events with automatic batching
 */
export function useCustomEvent() {
    const track = useEventTracker();
    const trackCustom = useCallback((eventName, properties) => {
        track(`custom_${eventName}`, {
            ...properties,
            timestamp: Date.now(),
        });
    }, [track]);
    return trackCustom;
}
/**
 * Hook to track performance metrics
 */
export function usePerformanceTracking(operationName) {
    const track = useEventTracker();
    const startTimeRef = useRef(undefined);
    const start = useCallback(() => {
        startTimeRef.current = Date.now();
    }, []);
    const end = useCallback((metadata) => {
        if (startTimeRef.current) {
            const duration = Date.now() - startTimeRef.current;
            track('performance', {
                operation: operationName,
                duration,
                ...metadata,
            });
            startTimeRef.current = undefined;
        }
    }, [operationName, track]);
    return { start, end };
}
/**
 * Hook to get event queue stats
 */
export function useEventStats() {
    const context = useContext(EventContext);
    const [stats, setStats] = useState({
        queueSize: 0,
        lastFlush: 0,
    });
    useEffect(() => {
        if (!context)
            return;
        const interval = setInterval(async () => {
            const queue = await context.queue.get();
            setStats({
                queueSize: queue.length,
                lastFlush: Date.now(),
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [context]);
    return stats;
}
//# sourceMappingURL=hooks.js.map