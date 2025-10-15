/**
 * Edge AI execution with Cloudflare Workers AI
 * Executes advanced models at the edge via Cloudflare's GPU infrastructure
 */

import type { AITask, AIResult } from './types';

interface EdgeAIConfig {
  endpoint: string;
  apiKey?: string;
}

class EdgeAIEngine {
  private config: EdgeAIConfig;

  constructor(config: EdgeAIConfig) {
    this.config = config;
  }

  /**
   * Execute AI task on Cloudflare Workers AI
   */
  async execute(task: AITask): Promise<AIResult> {
    const startTime = Date.now();

    try {
      const response = await this.callWorkersAI(task);
      const latency = Date.now() - startTime;

      return {
        output: response.output,
        confidence: response.confidence,
        executedAt: 'edge',
        latency,
        modelUsed: response.model,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('[EdgeAI] Execution error:', error);

      return {
        output: null,
        executedAt: 'fallback',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Call Cloudflare Workers AI API
   */
  private async callWorkersAI(task: AITask): Promise<{
    output: unknown;
    confidence?: number;
    model: string;
  }> {
    const model = this.selectModel(task.type);
    const payload = this.preparePayload(task, model);

    const response = await fetch(`${this.config.endpoint}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        task: task.type,
        model,
        input: payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`Workers AI request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Select appropriate Cloudflare Workers AI model
   */
  private selectModel(taskType: string): string {
    const modelMap: Record<string, string> = {
      text_classification: '@cf/huggingface/distilbert-sst-2-int8',
      sentiment_analysis: '@cf/huggingface/distilbert-sst-2-int8',
      intent_detection: '@cf/meta/llama-3-8b-instruct',
      entity_extraction: '@cf/meta/llama-3-8b-instruct',
      form_validation: '@cf/meta/llama-3-8b-instruct',
      autocomplete: '@cf/meta/llama-3-8b-instruct',
    };

    return modelMap[taskType] || '@cf/meta/llama-3-8b-instruct';
  }

  /**
   * Prepare payload for Workers AI
   */
  private preparePayload(task: AITask, model: string): unknown {
    if (model.includes('llama') || model.includes('mistral')) {
      // LLM models need messages format
      return {
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(task.type),
          },
          {
            role: 'user',
            content: JSON.stringify(task.input),
          },
        ],
      };
    } else if (model.includes('distilbert')) {
      // Classification models need text input
      return {
        text: typeof task.input === 'string' ? task.input : JSON.stringify(task.input),
      };
    }

    return task.input;
  }

  /**
   * Get system prompt for LLM tasks
   */
  private getSystemPrompt(taskType: string): string {
    const prompts: Record<string, string> = {
      intent_detection:
        'You are an AI that detects user intent from UI interactions. Classify the intent as one of: navigation, search, create, edit, delete, view, help, settings, or other.',
      entity_extraction:
        'You are an AI that extracts entities from user input. Identify names, dates, locations, and other key information.',
      form_validation:
        'You are an AI that validates form data. Check if the data is valid and provide specific error messages if not.',
      autocomplete:
        'You are an AI that provides autocomplete suggestions. Given a prefix, suggest likely completions.',
    };

    return prompts[taskType] || 'You are a helpful AI assistant.';
  }
}

// Module-level instance
let instance: EdgeAIEngine | null = null;

export function initializeEdgeAI(config: EdgeAIConfig): EdgeAIEngine {
  if (!instance) {
    instance = new EdgeAIEngine(config);
  }
  return instance;
}

export function getEdgeAI(): EdgeAIEngine | null {
  return instance;
}

export { EdgeAIEngine };
