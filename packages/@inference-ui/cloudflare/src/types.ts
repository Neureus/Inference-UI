/**
 * Cloudflare types
 */

export interface Env {
  DB: D1Database;
  AI: Ai;
  ANALYTICS: AnalyticsEngineDataset;
  STORAGE: R2Bucket;
  KV: KVNamespace;
  API_VERSION?: string;
  ENVIRONMENT?: string;
}

export interface WorkerRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}
