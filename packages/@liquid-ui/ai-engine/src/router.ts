/**
 * AI Router - decides local vs edge execution
 */

import type { AITask, AIResult } from './types';

export function routeAIRequest(task: AITask): Promise<AIResult> {
  // Route to local or edge based on task requirements
  if (task.requiresPrivacy || task.isOffline || task.needsUnder100ms) {
    return executeLocal(task);
  } else if (task.needsAdvancedModel || task.needsLatestData) {
    return executeEdge(task);
  }

  // Default to local for speed
  return executeLocal(task);
}

async function executeLocal(task: AITask): Promise<AIResult> {
  // TODO: Implement local TFLite execution
  const startTime = Date.now();

  return {
    output: null,
    executedAt: 'local',
    latency: Date.now() - startTime,
  };
}

async function executeEdge(task: AITask): Promise<AIResult> {
  // TODO: Implement Cloudflare Workers AI execution
  const startTime = Date.now();

  return {
    output: null,
    executedAt: 'edge',
    latency: Date.now() - startTime,
  };
}
