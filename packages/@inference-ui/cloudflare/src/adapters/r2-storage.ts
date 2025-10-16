/**
 * Cloudflare R2 Storage Adapter
 */

import type { StorageAdapter } from '@inference-ui/api';

export class R2StorageAdapter implements StorageAdapter {
  constructor(private r2: R2Bucket) {}

  async put(key: string, value: ArrayBuffer | ReadableStream): Promise<void> {
    await this.r2.put(key, value);
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    const object = await this.r2.get(key);
    if (!object) {
      return null;
    }
    return object.arrayBuffer();
  }

  async delete(key: string): Promise<void> {
    await this.r2.delete(key);
  }

  async list(prefix: string): Promise<string[]> {
    const listed = await this.r2.list({ prefix });
    return listed.objects.map((obj) => obj.key);
  }
}
