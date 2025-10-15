/**
 * Hybrid AI Router
 * Intelligently routes AI tasks between local (TFLite) and edge (Cloudflare Workers AI)
 * based on privacy, latency, and capability requirements
 */

import { getLocalAI } from './local';
import { getEdgeAI } from './edge';
import type { AITask, AIResult, AIEngineConfig, AIMetrics } from './types';

export class HybridAIRouter {
  private config: AIEngineConfig;
  private metrics: AIMetrics = {
    localInferences: 0,
    edgeInferences: 0,
    fallbacks: 0,
    averageLocalLatency: 0,
    averageEdgeLatency: 0,
    errors: 0,
  };

  constructor(config: Partial<AIEngineConfig> = {}) {
    this.config = {
      enableLocalAI: true,
      enableEdgeAI: true,
      maxLocalLatency: 100, // 100ms max for local
      fallbackToEdge: true,
      modelCacheDir: '@velvet/models',
      ...config,
    };
  }

  /**
   * Route AI task to optimal execution engine
   */
  async execute(task: AITask): Promise<AIResult> {
    const decision = this.makeRoutingDecision(task);

    console.log(
      `[HybridAI] Routing ${task.type} to ${decision.target} (reason: ${decision.reason})`
    );

    let result: AIResult;

    if (decision.target === 'local') {
      result = await this.executeLocal(task);

      // Fallback to edge if local fails and fallback is enabled
      if (result.executedAt === 'fallback' && this.config.fallbackToEdge) {
        console.log('[HybridAI] Local execution failed, falling back to edge');
        result = await this.executeEdge(task);
        this.metrics.fallbacks++;
      }
    } else {
      result = await this.executeEdge(task);

      // Fallback to local if edge fails
      if (result.executedAt === 'fallback' && this.config.enableLocalAI) {
        console.log('[HybridAI] Edge execution failed, falling back to local');
        result = await this.executeLocal(task);
        this.metrics.fallbacks++;
      }
    }

    // Update metrics
    this.updateMetrics(result);

    return result;
  }

  /**
   * Make intelligent routing decision
   */
  private makeRoutingDecision(task: AITask): {
    target: 'local' | 'edge';
    reason: string;
  } {
    // Privacy-first: Always use local for sensitive data
    if (task.requiresPrivacy) {
      return { target: 'local', reason: 'privacy_required' };
    }

    // Offline mode: Must use local
    if (task.isOffline) {
      return { target: 'local', reason: 'offline_mode' };
    }

    // Local not enabled: Use edge
    if (!this.config.enableLocalAI) {
      return { target: 'edge', reason: 'local_disabled' };
    }

    // Edge not enabled: Use local
    if (!this.config.enableEdgeAI) {
      return { target: 'local', reason: 'edge_disabled' };
    }

    // Ultra-low latency required: Use local
    if (task.needsUnder100ms || (task.maxLatency && task.maxLatency < 100)) {
      return { target: 'local', reason: 'ultra_low_latency' };
    }

    // Advanced models needed: Use edge
    if (task.needsAdvancedModel) {
      return { target: 'edge', reason: 'advanced_model_required' };
    }

    // Latest data needed: Use edge
    if (task.needsLatestData) {
      return { target: 'edge', reason: 'latest_data_required' };
    }

    // Task-specific routing based on complexity
    const complexTasks = ['entity_extraction', 'intent_detection'];
    if (complexTasks.includes(task.type)) {
      return { target: 'edge', reason: 'complex_task' };
    }

    // Simple tasks: Prefer local for speed
    const simpleTasks = ['text_classification', 'form_validation', 'accessibility_check'];
    if (simpleTasks.includes(task.type)) {
      return { target: 'local', reason: 'simple_task_local_preferred' };
    }

    // Default to local for speed and cost
    return { target: 'local', reason: 'default_local' };
  }

  /**
   * Execute on local AI engine
   */
  private async executeLocal(task: AITask): Promise<AIResult> {
    const localAI = getLocalAI();

    if (!localAI) {
      return {
        output: null,
        executedAt: 'fallback',
        latency: 0,
        error: 'Local AI not initialized',
      };
    }

    return await localAI.execute(task);
  }

  /**
   * Execute on edge AI engine
   */
  private async executeEdge(task: AITask): Promise<AIResult> {
    const edgeAI = getEdgeAI();

    if (!edgeAI) {
      return {
        output: null,
        executedAt: 'fallback',
        latency: 0,
        error: 'Edge AI not initialized',
      };
    }

    return await edgeAI.execute(task);
  }

  /**
   * Update metrics based on execution result
   */
  private updateMetrics(result: AIResult): void {
    if (result.executedAt === 'local') {
      this.metrics.localInferences++;
      this.metrics.averageLocalLatency =
        (this.metrics.averageLocalLatency * (this.metrics.localInferences - 1) + result.latency) /
        this.metrics.localInferences;
    } else if (result.executedAt === 'edge') {
      this.metrics.edgeInferences++;
      this.metrics.averageEdgeLatency =
        (this.metrics.averageEdgeLatency * (this.metrics.edgeInferences - 1) + result.latency) /
        this.metrics.edgeInferences;
    }

    if (result.error) {
      this.metrics.errors++;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): AIMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      localInferences: 0,
      edgeInferences: 0,
      fallbacks: 0,
      averageLocalLatency: 0,
      averageEdgeLatency: 0,
      errors: 0,
    };
  }

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
  } {
    const total = this.metrics.localInferences + this.metrics.edgeInferences;

    return {
      totalInferences: total,
      localPercentage: total > 0 ? (this.metrics.localInferences / total) * 100 : 0,
      edgePercentage: total > 0 ? (this.metrics.edgeInferences / total) * 100 : 0,
      fallbackRate: total > 0 ? (this.metrics.fallbacks / total) * 100 : 0,
      errorRate: total > 0 ? (this.metrics.errors / total) * 100 : 0,
      averageLocalLatency: this.metrics.averageLocalLatency,
      averageEdgeLatency: this.metrics.averageEdgeLatency,
    };
  }
}

// Singleton instance
let routerInstance: HybridAIRouter | null = null;

export function initializeRouter(config?: Partial<AIEngineConfig>): HybridAIRouter {
  if (!routerInstance) {
    routerInstance = new HybridAIRouter(config);
  }
  return routerInstance;
}

export function getRouter(): HybridAIRouter | null {
  return routerInstance;
}

/**
 * Convenience function for routing AI requests
 */
export async function routeAIRequest(task: AITask): Promise<AIResult> {
  const router = getRouter();

  if (!router) {
    throw new Error('Hybrid AI Router not initialized. Call initializeRouter() first.');
  }

  return await router.execute(task);
}
