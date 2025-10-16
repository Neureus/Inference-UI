/**
 * Cloudflare KV Cache Adapter
 */

import type { CacheAdapter } from '@inference-ui/api';

export class KVCacheAdapter implements CacheAdapter {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get(key, 'text');
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.kv.put(key, stringValue, ttl ? { expirationTtl: ttl } : undefined);
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}
