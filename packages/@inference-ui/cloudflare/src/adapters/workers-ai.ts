/**
 * Cloudflare Workers AI Adapter
 */

import type { AIAdapter, AIOptions, AIResult } from '@inference-ui/api';

export class WorkersAIAdapter implements AIAdapter {
  constructor(private ai: Ai) {}

  async run(model: string, options: AIOptions): Promise<AIResult> {
    const result = await this.ai.run(model as any, {
      messages: options.messages,
      prompt: options.prompt,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    } as any);

    return result as AIResult;
  }
}
