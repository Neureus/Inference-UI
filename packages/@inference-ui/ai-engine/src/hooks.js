/**
 * React hooks for AI engine
 * Provides easy-to-use hooks for React Native components
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeLocalAI } from './local';
import { initializeEdgeAI } from './edge';
import { initializeRouter, routeAIRequest } from './router';
/**
 * Hook to initialize AI engines
 * Call this once at app startup
 */
export function useAIInitialization(config) {
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let mounted = true;
        async function init() {
            try {
                setLoading(true);
                // Initialize local AI
                if (config?.enableLocalAI !== false) {
                    await initializeLocalAI();
                }
                // Initialize edge AI
                if (config?.enableEdgeAI !== false && config?.edgeEndpoint) {
                    initializeEdgeAI({
                        endpoint: config.edgeEndpoint,
                        apiKey: config.edgeApiKey,
                    });
                }
                // Initialize router
                initializeRouter(config);
                if (mounted) {
                    setInitialized(true);
                    setLoading(false);
                }
            }
            catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('AI initialization failed'));
                    setLoading(false);
                }
            }
        }
        init();
        return () => {
            mounted = false;
        };
    }, [config]);
    return { initialized, loading, error };
}
/**
 * Hook to execute AI tasks
 * Returns a function to run AI inference with state management
 */
export function useAI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const execute = useCallback(async (task) => {
        setLoading(true);
        setError(null);
        try {
            const aiResult = await routeAIRequest(task);
            setResult(aiResult);
            setLoading(false);
            return aiResult;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error('AI execution failed');
            setError(error);
            setLoading(false);
            throw error;
        }
    }, []);
    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setLoading(false);
    }, []);
    return {
        execute,
        loading,
        error,
        result,
        reset,
    };
}
/**
 * Hook for text classification with AI
 */
export function useTextClassification() {
    const { execute, loading, error, result } = useAI();
    const classify = useCallback(async (text) => {
        return execute({
            type: 'text_classification',
            input: text,
            needsUnder100ms: true, // Prefer local for speed
        });
    }, [execute]);
    return {
        classify,
        loading,
        error,
        result: result?.output,
    };
}
/**
 * Hook for form validation with AI
 */
export function useFormValidation() {
    const { execute, loading, error, result } = useAI();
    const validate = useCallback(async (data) => {
        return execute({
            type: 'form_validation',
            input: data,
            requiresPrivacy: true, // Always use local for form data
        });
    }, [execute]);
    return {
        validate,
        loading,
        error,
        result: result?.output,
    };
}
/**
 * Hook for autocomplete with AI
 */
export function useAutocomplete() {
    const { execute, loading, error, result } = useAI();
    const debounceTimer = useRef(undefined);
    const getSuggestions = useCallback(async (prefix, debounce = 300) => {
        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        // Debounce the request
        return new Promise((resolve, reject) => {
            debounceTimer.current = setTimeout(async () => {
                try {
                    const result = await execute({
                        type: 'autocomplete',
                        input: prefix,
                        needsUnder100ms: true,
                    });
                    resolve(result);
                }
                catch (err) {
                    reject(err);
                }
            }, debounce);
        });
    }, [execute]);
    return {
        getSuggestions,
        loading,
        error,
        suggestions: result?.output,
    };
}
/**
 * Hook for accessibility checking with AI
 */
export function useAccessibilityCheck() {
    const { execute, loading, error, result } = useAI();
    const check = useCallback(async (component) => {
        return execute({
            type: 'accessibility_check',
            input: component,
        });
    }, [execute]);
    return {
        check,
        loading,
        error,
        result: result?.output,
    };
}
/**
 * Hook to get AI metrics
 * Useful for monitoring and debugging
 */
export function useAIMetrics() {
    const [metrics, setMetrics] = useState(null);
    const refresh = useCallback(async () => {
        const { getRouter } = await import('./router');
        const router = getRouter();
        if (router) {
            const stats = router.getStats();
            setMetrics({
                localInferences: stats.totalInferences * (stats.localPercentage / 100),
                edgeInferences: stats.totalInferences * (stats.edgePercentage / 100),
                fallbacks: stats.totalInferences * (stats.fallbackRate / 100),
                averageLocalLatency: stats.averageLocalLatency,
                averageEdgeLatency: stats.averageEdgeLatency,
                errors: stats.totalInferences * (stats.errorRate / 100),
            });
        }
    }, []);
    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [refresh]);
    return { metrics, refresh };
}
//# sourceMappingURL=hooks.js.map