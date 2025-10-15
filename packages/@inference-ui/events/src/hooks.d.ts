/**
 * React hooks for event tracking
 * Provides easy-to-use hooks for React Native components
 */
import React from 'react';
import type { EventConfig } from './types';
/**
 * Provider component for event tracking
 * Wrap your app with this to enable event tracking
 */
export declare function EventProvider({ children, config, }: {
    children: React.ReactNode;
    config: EventConfig;
}): React.JSX.Element;
/**
 * Hook to access event tracker
 */
export declare function useEventTracker(): (event: string, properties?: Record<string, unknown>) => void;
/**
 * Hook to track component lifecycle events
 * Automatically tracks mount, unmount, and updates
 */
export declare function useComponentTracking(componentName: string, trackUpdates?: boolean): void;
/**
 * Hook to track screen views
 * Call this in your screen components
 */
export declare function useScreenTracking(screenName: string, params?: Record<string, unknown>): void;
/**
 * Hook to track button presses
 * Returns a function to wrap your onPress handler
 */
export declare function useButtonTracking(buttonName: string): (onPress?: () => void) => () => void;
/**
 * Hook to track form interactions
 */
export declare function useFormTracking(formName: string): {
    trackFieldFocus: (fieldName: string) => void;
    trackFieldBlur: (fieldName: string, value?: unknown) => void;
    trackSubmit: (success: boolean, errors?: Record<string, string>) => void;
};
/**
 * Hook to track errors
 */
export declare function useErrorTracking(): (error: Error, context?: Record<string, unknown>) => void;
/**
 * Hook to track custom events with automatic batching
 */
export declare function useCustomEvent(): (eventName: string, properties?: Record<string, unknown>) => void;
/**
 * Hook to track performance metrics
 */
export declare function usePerformanceTracking(operationName: string): {
    start: () => void;
    end: (metadata?: Record<string, unknown>) => void;
};
/**
 * Hook to get event queue stats
 */
export declare function useEventStats(): {
    queueSize: number;
    lastFlush: number;
};
//# sourceMappingURL=hooks.d.ts.map