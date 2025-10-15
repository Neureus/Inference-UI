/**
 * React hooks for AI engine
 * Provides easy-to-use hooks for React Native components
 */
import type { AITask, AIResult, AIEngineConfig, AIMetrics } from './types';
/**
 * Hook to initialize AI engines
 * Call this once at app startup
 */
export declare function useAIInitialization(config?: Partial<AIEngineConfig>): {
    initialized: boolean;
    loading: boolean;
    error: Error | null;
};
/**
 * Hook to execute AI tasks
 * Returns a function to run AI inference with state management
 */
export declare function useAI(): {
    execute: (task: AITask) => Promise<AIResult>;
    loading: boolean;
    error: Error | null;
    result: AIResult | null;
    reset: () => void;
};
/**
 * Hook for text classification with AI
 */
export declare function useTextClassification(): {
    classify: (text: string) => Promise<AIResult>;
    loading: boolean;
    error: Error | null;
    result: {
        label: string;
        confidence: number;
    } | null;
};
/**
 * Hook for form validation with AI
 */
export declare function useFormValidation(): {
    validate: (data: Record<string, unknown>) => Promise<AIResult>;
    loading: boolean;
    error: Error | null;
    result: Record<string, {
        valid: boolean;
        message?: string;
    }> | null;
};
/**
 * Hook for autocomplete with AI
 */
export declare function useAutocomplete(): {
    getSuggestions: (prefix: string, debounce?: number) => Promise<AIResult>;
    loading: boolean;
    error: Error | null;
    suggestions: string[] | null;
};
/**
 * Hook for accessibility checking with AI
 */
export declare function useAccessibilityCheck(): {
    check: (component: Record<string, unknown>) => Promise<AIResult>;
    loading: boolean;
    error: Error | null;
    result: {
        score: number;
        issues: Array<{
            type: string;
            severity: string;
            message: string;
        }>;
    } | null;
};
/**
 * Hook to get AI metrics
 * Useful for monitoring and debugging
 */
export declare function useAIMetrics(): {
    metrics: AIMetrics | null;
    refresh: () => Promise<void>;
};
//# sourceMappingURL=hooks.d.ts.map