/**
 * Cloudflare types
 */

// Import service binding types
import type { InferenceService } from '../workers/inference-service';

export interface Env {
  // Service Bindings - Direct RPC calls (no HTTP)
  INFERENCE: Service<InferenceService>; // Direct RPC to inference service worker

  // Cloudflare Bindings
  DB: D1Database;
  AI: Ai; // Workers AI for inference
  ANALYTICS: AnalyticsEngineDataset;
  STORAGE: R2Bucket;
  KV: KVNamespace;

  // Environment Variables
  API_VERSION?: string;
  ENVIRONMENT?: string;
}

// Service binding wrapper type
export type Service<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? (...args: Args) => Return
    : T[K];
};

export interface WorkerRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}
