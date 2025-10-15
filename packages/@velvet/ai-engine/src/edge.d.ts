/**
 * Edge AI execution with Cloudflare Workers AI
 * Executes advanced models at the edge via Cloudflare's GPU infrastructure
 */
import type { AITask, AIResult } from './types';
interface EdgeAIConfig {
    endpoint: string;
    apiKey?: string;
}
declare class EdgeAIEngine {
    private config;
    constructor(config: EdgeAIConfig);
    /**
     * Execute AI task on Cloudflare Workers AI
     */
    execute(task: AITask): Promise<AIResult>;
    /**
     * Call Cloudflare Workers AI API
     */
    private callWorkersAI;
    /**
     * Select appropriate Cloudflare Workers AI model
     */
    private selectModel;
    /**
     * Prepare payload for Workers AI
     */
    private preparePayload;
    /**
     * Get system prompt for LLM tasks
     */
    private getSystemPrompt;
}
export declare function initializeEdgeAI(config: EdgeAIConfig): EdgeAIEngine;
export declare function getEdgeAI(): EdgeAIEngine | null;
export { EdgeAIEngine };
//# sourceMappingURL=edge.d.ts.map