/**
 * Cloudflare Workers AI utilities
 */

export async function runAI(
  ai: Ai,
  model: string,
  input: unknown
): Promise<unknown> {
  return await ai.run(model, input);
}

export const MODELS = {
  LLAMA_3_8B: '@cf/meta/llama-3-8b-instruct',
  MISTRAL_7B: '@cf/mistral/mistral-7b-instruct-v0.1',
  TEXT_CLASSIFICATION: '@cf/huggingface/distilbert-sst-2-int8',
  STABLE_DIFFUSION: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  WHISPER: '@cf/openai/whisper',
} as const;
