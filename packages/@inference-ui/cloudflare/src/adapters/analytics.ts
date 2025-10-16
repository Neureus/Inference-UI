/**
 * Cloudflare Analytics Engine Adapter
 */

import type { AnalyticsAdapter, AnalyticsDataPoint } from '@inference-ui/api';

export class AnalyticsEngineAdapter implements AnalyticsAdapter {
  constructor(private analytics: AnalyticsEngineDataset) {}

  async writeDataPoint(data: AnalyticsDataPoint): Promise<void> {
    this.analytics.writeDataPoint({
      indexes: data.indexes,
      blobs: data.blobs,
      doubles: data.doubles,
    });
  }

  async query(_query: string): Promise<any> {
    // Analytics Engine doesn't support direct queries from Workers
    // Queries are done via the Cloudflare API or dashboard
    throw new Error('Analytics Engine queries must be done via Cloudflare API');
  }
}
