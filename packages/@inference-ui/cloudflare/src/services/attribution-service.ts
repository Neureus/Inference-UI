/**
 * Attribution Modeling Service
 * Track conversions and attribute them to sources, campaigns, and features
 */

import { D1DatabaseAdapter } from '../adapters/d1-database';
import { CacheAdapter } from '@inference-ui/api';

export interface ConversionEvent {
  id: string;
  userId: string;
  sessionId: string;
  event: string;           // Conversion event name
  value?: number;          // Monetary value
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TouchPoint {
  id: string;
  userId: string;
  sessionId: string;
  source?: string;         // utm_source, referrer
  medium?: string;         // utm_medium
  campaign?: string;       // utm_campaign
  content?: string;        // utm_content
  component?: string;      // UI component interacted with
  event: string;
  timestamp: number;
  position: number;        // Position in conversion path (0 = first)
}

export interface AttributionResult {
  source: string;
  conversions: number;
  totalValue: number;
  averageValue: number;
  attribution: {
    firstTouch: number;    // Percentage attributed to first touch
    lastTouch: number;     // Percentage attributed to last touch
    linear: number;        // Percentage attributed via linear model
    timeDecay: number;     // Percentage attributed via time decay
  };
}

export interface ConversionPath {
  userId: string;
  conversionId: string;
  touchPoints: TouchPoint[];
  conversionValue: number;
  pathLength: number;
  timeToConversion: number; // Milliseconds
}

export interface AttributionModel {
  type: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  description: string;
}

export interface TimeRange {
  start: string; // ISO 8601
  end: string;   // ISO 8601
}

export class AttributionService {
  constructor(
    private database: D1DatabaseAdapter,
    private cache?: CacheAdapter
  ) {}

  /**
   * Track a conversion event
   */
  async trackConversion(
    userId: string,
    sessionId: string,
    event: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<ConversionEvent> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    await this.database['db']
      .prepare(
        `INSERT INTO conversions (id, user_id, session_id, event, value, timestamp, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        userId,
        sessionId,
        event,
        value || null,
        timestamp,
        metadata ? JSON.stringify(metadata) : null
      )
      .run();

    return {
      id,
      userId,
      sessionId,
      event,
      value,
      timestamp,
      metadata,
    };
  }

  /**
   * Get conversion path for a user
   */
  async getConversionPath(
    userId: string,
    conversionId: string
  ): Promise<ConversionPath | null> {
    // Get conversion details
    const conversionResult = await this.database['db']
      .prepare(`SELECT * FROM conversions WHERE id = ? AND user_id = ?`)
      .bind(conversionId, userId)
      .first();

    if (!conversionResult) return null;

    const conversion = conversionResult as any;
    const conversionTimestamp = conversion.timestamp;

    // Get all touch points before conversion
    const touchPointsResult = await this.database['db']
      .prepare(
        `SELECT
          id,
          user_id,
          session_id,
          event,
          component,
          timestamp,
          properties
         FROM events
         WHERE user_id = ?
         AND timestamp <= ?
         ORDER BY timestamp ASC`
      )
      .bind(userId, conversionTimestamp)
      .all();

    const touchPoints: TouchPoint[] = (touchPointsResult.results || []).map(
      (row: any, index: number) => {
        const properties = row.properties ? JSON.parse(row.properties) : {};

        return {
          id: row.id,
          userId: row.user_id,
          sessionId: row.session_id,
          source: properties.source || properties.utm_source,
          medium: properties.medium || properties.utm_medium,
          campaign: properties.campaign || properties.utm_campaign,
          content: properties.content || properties.utm_content,
          component: row.component,
          event: row.event,
          timestamp: row.timestamp,
          position: index,
        };
      }
    );

    const firstTouchPoint = touchPoints[0];
    const timeToConversion = firstTouchPoint
      ? conversionTimestamp - firstTouchPoint.timestamp
      : 0;

    return {
      userId,
      conversionId,
      touchPoints,
      conversionValue: conversion.value || 0,
      pathLength: touchPoints.length,
      timeToConversion,
    };
  }

  /**
   * Analyze attribution using different models
   */
  async analyzeAttribution(
    timeRange: TimeRange,
    model: AttributionModel['type'] = 'last_touch',
    groupBy: 'source' | 'medium' | 'campaign' | 'component' = 'source'
  ): Promise<AttributionResult[]> {
    const cacheKey = `attribution:${model}:${groupBy}:${timeRange.start}:${timeRange.end}`;

    // Check cache
    if (this.cache) {
      const cached = await this.cache.get<AttributionResult[]>(cacheKey);
      if (cached) return cached;
    }

    const startTs = new Date(timeRange.start).getTime();
    const endTs = new Date(timeRange.end).getTime();

    // Get all conversions in time range
    const conversionsResult = await this.database['db']
      .prepare(
        `SELECT * FROM conversions
         WHERE timestamp >= ? AND timestamp <= ?
         ORDER BY timestamp ASC`
      )
      .bind(startTs, endTs)
      .all();

    const conversions = conversionsResult.results || [];

    // Build attribution map
    const attributionMap = new Map<
      string,
      {
        conversions: number;
        totalValue: number;
        firstTouch: number;
        lastTouch: number;
        linear: number;
        timeDecay: number;
      }
    >();

    // Process each conversion
    for (const conversion of conversions) {
      const conversionData = conversion as any;
      const path = await this.getConversionPath(
        conversionData.user_id,
        conversionData.id
      );

      if (!path || path.touchPoints.length === 0) continue;

      const value = conversionData.value || 1;

      // Apply attribution models
      const touchPoints = path.touchPoints;
      const firstPoint = touchPoints[0];
      const lastPoint = touchPoints[touchPoints.length - 1];

      // Extract groupBy value
      const getGroupValue = (point: TouchPoint) => {
        switch (groupBy) {
          case 'source':
            return point.source || 'direct';
          case 'medium':
            return point.medium || 'none';
          case 'campaign':
            return point.campaign || 'none';
          case 'component':
            return point.component || 'unknown';
        }
      };

      // First touch attribution
      const firstKey = getGroupValue(firstPoint);
      this.updateAttribution(attributionMap, firstKey, {
        conversions: 1,
        totalValue: value,
        firstTouch: value,
        lastTouch: 0,
        linear: 0,
        timeDecay: 0,
      });

      // Last touch attribution
      const lastKey = getGroupValue(lastPoint);
      this.updateAttribution(attributionMap, lastKey, {
        conversions: 0, // Already counted in first touch
        totalValue: 0,  // Already counted in first touch
        firstTouch: 0,
        lastTouch: value,
        linear: 0,
        timeDecay: 0,
      });

      // Linear attribution
      const linearValue = value / touchPoints.length;
      for (const point of touchPoints) {
        const key = getGroupValue(point);
        this.updateAttribution(attributionMap, key, {
          conversions: 0,
          totalValue: 0,
          firstTouch: 0,
          lastTouch: 0,
          linear: linearValue,
          timeDecay: 0,
        });
      }

      // Time decay attribution (exponential decay, half-life = 7 days)
      const halfLife = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      const conversionTime = conversionData.timestamp;

      let totalWeight = 0;
      const weights: { key: string; weight: number }[] = [];

      for (const point of touchPoints) {
        const timeDiff = conversionTime - point.timestamp;
        const weight = Math.exp(-Math.log(2) * timeDiff / halfLife);
        totalWeight += weight;
        weights.push({ key: getGroupValue(point), weight });
      }

      // Normalize and distribute
      for (const { key, weight } of weights) {
        const normalizedValue = (weight / totalWeight) * value;
        this.updateAttribution(attributionMap, key, {
          conversions: 0,
          totalValue: 0,
          firstTouch: 0,
          lastTouch: 0,
          linear: 0,
          timeDecay: normalizedValue,
        });
      }
    }

    // Convert map to results
    const results: AttributionResult[] = [];
    for (const [source, data] of attributionMap.entries()) {
      results.push({
        source,
        conversions: data.conversions,
        totalValue: data.totalValue,
        averageValue: data.conversions > 0 ? data.totalValue / data.conversions : 0,
        attribution: {
          firstTouch: data.firstTouch,
          lastTouch: data.lastTouch,
          linear: data.linear,
          timeDecay: data.timeDecay,
        },
      });
    }

    // Sort by selected model value
    results.sort((a, b) => {
      const getValue = (r: AttributionResult) => {
        switch (model) {
          case 'first_touch':
            return r.attribution.firstTouch;
          case 'last_touch':
            return r.attribution.lastTouch;
          case 'linear':
            return r.attribution.linear;
          case 'time_decay':
            return r.attribution.timeDecay;
          default:
            return r.totalValue;
        }
      };
      return getValue(b) - getValue(a);
    });

    // Cache for 30 minutes
    if (this.cache) {
      await this.cache.set(cacheKey, results, 1800);
    }

    return results;
  }

  /**
   * Get conversion summary
   */
  async getConversionSummary(timeRange: TimeRange) {
    const startTs = new Date(timeRange.start).getTime();
    const endTs = new Date(timeRange.end).getTime();

    const result = await this.database['db']
      .prepare(
        `SELECT
          COUNT(*) as total_conversions,
          COUNT(DISTINCT user_id) as unique_converters,
          SUM(value) as total_value,
          AVG(value) as average_value
         FROM conversions
         WHERE timestamp >= ? AND timestamp <= ?`
      )
      .bind(startTs, endTs)
      .first();

    return {
      totalConversions: (result as any)?.total_conversions || 0,
      uniqueConverters: (result as any)?.unique_converters || 0,
      totalValue: (result as any)?.total_value || 0,
      averageValue: (result as any)?.average_value || 0,
    };
  }

  /**
   * Get top converting paths
   */
  async getTopConvertingPaths(
    timeRange: TimeRange,
    limit: number = 10
  ): Promise<Array<{ path: string; conversions: number; totalValue: number }>> {
    const startTs = new Date(timeRange.start).getTime();
    const endTs = new Date(timeRange.end).getTime();

    // Get all conversions
    const conversionsResult = await this.database['db']
      .prepare(
        `SELECT * FROM conversions
         WHERE timestamp >= ? AND timestamp <= ?`
      )
      .bind(startTs, endTs)
      .all();

    const pathMap = new Map<
      string,
      { conversions: number; totalValue: number }
    >();

    for (const conversion of conversionsResult.results || []) {
      const conversionData = conversion as any;
      const path = await this.getConversionPath(
        conversionData.user_id,
        conversionData.id
      );

      if (!path) continue;

      // Create path string
      const pathString = path.touchPoints
        .map((tp) => tp.source || tp.component || 'direct')
        .join(' → ');

      const existing = pathMap.get(pathString) || {
        conversions: 0,
        totalValue: 0,
      };
      pathMap.set(pathString, {
        conversions: existing.conversions + 1,
        totalValue: existing.totalValue + (conversionData.value || 0),
      });
    }

    // Convert to array and sort
    const paths = Array.from(pathMap.entries())
      .map(([path, data]) => ({
        path,
        conversions: data.conversions,
        totalValue: data.totalValue,
      }))
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, limit);

    return paths;
  }

  /**
   * Helper to update attribution map
   */
  private updateAttribution(
    map: Map<
      string,
      {
        conversions: number;
        totalValue: number;
        firstTouch: number;
        lastTouch: number;
        linear: number;
        timeDecay: number;
      }
    >,
    key: string,
    values: {
      conversions: number;
      totalValue: number;
      firstTouch: number;
      lastTouch: number;
      linear: number;
      timeDecay: number;
    }
  ) {
    const existing = map.get(key) || {
      conversions: 0,
      totalValue: 0,
      firstTouch: 0,
      lastTouch: 0,
      linear: 0,
      timeDecay: 0,
    };

    map.set(key, {
      conversions: existing.conversions + values.conversions,
      totalValue: existing.totalValue + values.totalValue,
      firstTouch: existing.firstTouch + values.firstTouch,
      lastTouch: existing.lastTouch + values.lastTouch,
      linear: existing.linear + values.linear,
      timeDecay: existing.timeDecay + values.timeDecay,
    });
  }

  /**
   * Get available attribution models
   */
  getAttributionModels(): AttributionModel[] {
    return [
      {
        type: 'first_touch',
        description: '100% credit to the first interaction',
      },
      {
        type: 'last_touch',
        description: '100% credit to the last interaction before conversion',
      },
      {
        type: 'linear',
        description: 'Equal credit to all interactions',
      },
      {
        type: 'time_decay',
        description: 'More credit to recent interactions (7-day half-life)',
      },
      {
        type: 'position_based',
        description: '40% first, 40% last, 20% distributed to middle',
      },
    ];
  }
}
