/**
 * Cloudflare types
 */

export interface Env {
  // Service Bindings
  STREAMING: Fetcher; // Service binding to streaming worker

  // Cloudflare Bindings
  DB: D1Database;
  AI?: Ai; // Optional: Only used in streaming worker now
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
