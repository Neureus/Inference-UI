/**
 * Hybrid AI Router
 * Intelligently routes AI tasks between local (TFLite) and edge (Cloudflare Workers AI)
 * based on privacy, latency, and capability requirements
 */
import type { AITask, AIResult, AIEngineConfig, AIMetrics } from './types';
export declare class HybridAIRouter {
    private config;
    private metrics;
    constructor(config?: Partial<AIEngineConfig>);
    /**
     * Route AI task to optimal execution engine
     */
    execute(task: AITask): Promise<AIResult>;
    /**
     * Make intelligent routing decision
     */
    private makeRoutingDecision;
    /**
     * Execute on local AI engine
     */
    private executeLocal;
    /**
     * Execute on edge AI engine
     */
    private executeEdge;
    /**
     * Update metrics based on execution result
     */
    private updateMetrics;
    /**
     * Get current metrics
     */
    getMetrics(): AIMetrics;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    /**
     * Get routing statistics
     */
    getStats(): {
        totalInferences: number;
        localPercentage: number;
        edgePercentage: number;
        fallbackRate: number;
        errorRate: number;
        averageLocalLatency: number;
        averageEdgeLatency: number;
    };
}
export declare function initializeRouter(config?: Partial<AIEngineConfig>): HybridAIRouter;
export declare function getRouter(): HybridAIRouter | null;
/**
 * Convenience function for routing AI requests
 */
export declare function routeAIRequest(task: AITask): Promise<AIResult>;
//# sourceMappingURL=router.d.ts.map