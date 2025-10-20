/**
 * Cloudflare types
 */

// Import service binding types from separate file to avoid path issues
import type { InferenceService } from './service-types';

export interface Env {
  // Service Bindings - Direct RPC calls (no HTTP)
  INFERENCE: InferenceService; // Direct RPC to inference service worker

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

export interface WorkerRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}
