/**
 * Analytics Service
 * Comprehensive analytics queries and metrics aggregation
 */

import { D1DatabaseAdapter } from '../adapters/d1-database';
import { AnalyticsEngineAdapter } from '../adapters/analytics';
import { CacheAdapter } from '@inference-ui/api';

export interface TimeRange {
  start: string; // ISO 8601 date string
  end: string;   // ISO 8601 date string
}

export interface EventMetrics {
  totalEvents: number;
  uniqueSessions: number;
  uniqueUsers: number;
  eventsByType: Array<{ event: string; count: number }>;
  eventsByComponent: Array<{ component: string; count: number }>;
  trend: Array<{ date: string; count: number }>;
}

export interface FlowMetrics {
  flowId: string;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageDuration: number; // milliseconds
  dropoffPoints: Array<{
    stepId: string;
    stepName: string;
    dropoffCount: number;
    dropoffRate: number;
  }>;
}

export interface SessionMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  averageEventsPerSession: number;
  sessionsByHour: Array<{ hour: number; count: number }>;
  topFlows: Array<{ flowId: string; sessionCount: number }>;
}

export interface ComponentAnalytics {
  component: string;
  totalUsage: number;
  uniqueUsers: number;
  averageInteractionsPerUser: number;
  topEvents: Array<{ event: string; count: number }>;
}

export interface TrendData {
  metric: string;
  groupBy: 'hour' | 'day' | 'week' | 'month';
  data: Array<{ timestamp: string; value: number }>;
}

export class AnalyticsService {
  constructor(
    private database: D1DatabaseAdapter,
    _analytics?: AnalyticsEngineAdapter, // Reserved for future Analytics Engine queries
    private cache?: CacheAdapter
  ) {}

  /**
   * Get event metrics for a user
   */
  async getEventMetrics(
    userId: string,
    timeRange: TimeRange
  ): Promise<EventMetrics> {
    const cacheKey = `event-metrics:${userId}:${timeRange.start}:${timeRange.end}`;

    // Check cache first
    if (this.cache) {
      const cached = await this.cache.get<EventMetrics>(cacheKey);
      if (cached) return cached;
    }

    const startTs = Math.floor(new Date(timeRange.start).getTime() / 1000);
    const endTs = Math.floor(new Date(timeRange.end).getTime() / 1000);

    // Get total events
    const totalResult = await this.database['db']
      .prepare(
        `SELECT COUNT(*) as count FROM events
         WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?`
      )
      .bind(userId, startTs * 1000, endTs * 1000)
      .first();

    // Get unique sessions
    const sessionsResult = await this.database['db']
      .prepare(
        `SELECT COUNT(DISTINCT session_id) as count FROM events
         WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?`
      )
      .bind(userId, startTs * 1000, endTs * 1000)
      .first();

    // Get events by type
    const byTypeResult = await this.database['db']
      .prepare(
        `SELECT event, COUNT(*) as count FROM events
         WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
         GROUP BY event ORDER BY count DESC LIMIT 10`
      )
      .bind(userId, startTs * 1000, endTs * 1000)
      .all();

    // Get events by component
    const byComponentResult = await this.database['db']
      .prepare(
        `SELECT component, COUNT(*) as count FROM events
         WHERE user_id = ? AND timestamp >= ? AND timestamp <= ? AND component IS NOT NULL
         GROUP BY component ORDER BY count DESC LIMIT 10`
      )
      .bind(userId, startTs * 1000, endTs * 1000)
      .all();

    // Get daily trend
    const trendResult = await this.database['db']
      .prepare(
        `SELECT DATE(timestamp / 1000, 'unixepoch') as date, COUNT(*) as count
         FROM events
         WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
         GROUP BY date ORDER BY date ASC`
      )
      .bind(userId, startTs * 1000, endTs * 1000)
      .all();

    const metrics: EventMetrics = {
      totalEvents: (totalResult as any)?.count || 0,
      uniqueSessions: (sessionsResult as any)?.count || 0,
      uniqueUsers: 1, // For now, single user
      eventsByType: (byTypeResult.results || []).map((row: any) => ({
        event: row.event,
        count: row.count,
      })),
      eventsByComponent: (byComponentResult.results || []).map((row: any) => ({
        component: row.component,
        count: row.count,
      })),
      trend: (trendResult.results || []).map((row: any) => ({
        date: row.date,
        count: row.count,
      })),
    };

    // Cache for 5 minutes
    if (this.cache) {
      await this.cache.set(cacheKey, metrics, 300);
    }

    return metrics;
  }

  /**
   * Get flow metrics and completion analysis
   */
  async getFlowMetrics(
    flowId: string,
    timeRange: TimeRange
  ): Promise<FlowMetrics> {
    const cacheKey = `flow-metrics:${flowId}:${timeRange.start}:${timeRange.end}`;

    if (this.cache) {
      const cached = await this.cache.get<FlowMetrics>(cacheKey);
      if (cached) return cached;
    }

    const startTs = Math.floor(new Date(timeRange.start).getTime() / 1000);
    const endTs = Math.floor(new Date(timeRange.end).getTime() / 1000);

    // Get total sessions for this flow
    const totalSessionsResult = await this.database['db']
      .prepare(
        `SELECT COUNT(*) as count FROM sessions
         WHERE flow_id = ? AND started_at >= ? AND started_at <= ?`
      )
      .bind(flowId, startTs, endTs)
      .first();

    // Get completed sessions
    const completedResult = await this.database['db']
      .prepare(
        `SELECT COUNT(*) as count FROM sessions
         WHERE flow_id = ? AND completed = 1
         AND started_at >= ? AND started_at <= ?`
      )
      .bind(flowId, startTs, endTs)
      .first();

    // Get average duration for completed sessions
    const durationResult = await this.database['db']
      .prepare(
        `SELECT AVG(ended_at - started_at) as avg_duration FROM sessions
         WHERE flow_id = ? AND completed = 1 AND ended_at IS NOT NULL
         AND started_at >= ? AND started_at <= ?`
      )
      .bind(flowId, startTs, endTs)
      .first();

    // Get dropoff points (sessions that didn't complete, grouped by last step)
    const dropoffResult = await this.database['db']
      .prepare(
        `SELECT current_step, COUNT(*) as count FROM sessions
         WHERE flow_id = ? AND completed = 0 AND current_step IS NOT NULL
         AND started_at >= ? AND started_at <= ?
         GROUP BY current_step ORDER BY count DESC`
      )
      .bind(flowId, startTs, endTs)
      .all();

    const totalSessions = (totalSessionsResult as any)?.count || 0;
    const completedSessions = (completedResult as any)?.count || 0;
    const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;

    const metrics: FlowMetrics = {
      flowId,
      totalSessions,
      completedSessions,
      completionRate,
      averageDuration: ((durationResult as any)?.avg_duration || 0) * 1000, // Convert to ms
      dropoffPoints: (dropoffResult.results || []).map((row: any) => ({
        stepId: row.current_step,
        stepName: row.current_step, // TODO: Get actual step name from flow definition
        dropoffCount: row.count,
        dropoffRate: totalSessions > 0 ? row.count / totalSessions : 0,
      })),
    };

    // Cache for 10 minutes
    if (this.cache) {
      await this.cache.set(cacheKey, metrics, 600);
    }

    return metrics;
  }

  /**
   * Get session metrics and patterns
   */
  async getSessionMetrics(
    userId: string,
    timeRange: TimeRange
  ): Promise<SessionMetrics> {
    const cacheKey = `session-metrics:${userId}:${timeRange.start}:${timeRange.end}`;

    if (this.cache) {
      const cached = await this.cache.get<SessionMetrics>(cacheKey);
      if (cached) return cached;
    }

    const startTs = Math.floor(new Date(timeRange.start).getTime() / 1000);
    const endTs = Math.floor(new Date(timeRange.end).getTime() / 1000);

    // Get total sessions
    const totalResult = await this.database['db']
      .prepare(
        `SELECT COUNT(*) as count FROM sessions
         WHERE user_id = ? AND started_at >= ? AND started_at <= ?`
      )
      .bind(userId, startTs, endTs)
      .first();

    // Get average session duration
    const durationResult = await this.database['db']
      .prepare(
        `SELECT AVG(ended_at - started_at) as avg_duration FROM sessions
         WHERE user_id = ? AND ended_at IS NOT NULL
         AND started_at >= ? AND started_at <= ?`
      )
      .bind(userId, startTs, endTs)
      .first();

    // Get average events per session
    const eventsPerSessionResult = await this.database['db']
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM events WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?) * 1.0 /
          (SELECT COUNT(*) FROM sessions WHERE user_id = ? AND started_at >= ? AND started_at <= ?)
          as avg_events`
      )
      .bind(userId, startTs * 1000, endTs * 1000, userId, startTs, endTs)
      .first();

    // Get sessions by hour
    const byHourResult = await this.database['db']
      .prepare(
        `SELECT strftime('%H', started_at, 'unixepoch') as hour, COUNT(*) as count
         FROM sessions
         WHERE user_id = ? AND started_at >= ? AND started_at <= ?
         GROUP BY hour ORDER BY hour ASC`
      )
      .bind(userId, startTs, endTs)
      .all();

    // Get top flows by session count
    const topFlowsResult = await this.database['db']
      .prepare(
        `SELECT flow_id, COUNT(*) as count FROM sessions
         WHERE user_id = ? AND flow_id IS NOT NULL
         AND started_at >= ? AND started_at <= ?
         GROUP BY flow_id ORDER BY count DESC LIMIT 5`
      )
      .bind(userId, startTs, endTs)
      .all();

    const metrics: SessionMetrics = {
      totalSessions: (totalResult as any)?.count || 0,
      averageSessionDuration: ((durationResult as any)?.avg_duration || 0) * 1000,
      averageEventsPerSession: (eventsPerSessionResult as any)?.avg_events || 0,
      sessionsByHour: (byHourResult.results || []).map((row: any) => ({
        hour: parseInt(row.hour),
        count: row.count,
      })),
      topFlows: (topFlowsResult.results || []).map((row: any) => ({
        flowId: row.flow_id,
        sessionCount: row.count,
      })),
    };

    // Cache for 10 minutes
    if (this.cache) {
      await this.cache.set(cacheKey, metrics, 600);
    }

    return metrics;
  }

  /**
   * Get component usage analytics
   */
  async getComponentAnalytics(
    userId: string,
    component: string,
    timeRange: TimeRange
  ): Promise<ComponentAnalytics> {
    const cacheKey = `component-analytics:${userId}:${component}:${timeRange.start}:${timeRange.end}`;

    if (this.cache) {
      const cached = await this.cache.get<ComponentAnalytics>(cacheKey);
      if (cached) return cached;
    }

    const startTs = Math.floor(new Date(timeRange.start).getTime() / 1000);
    const endTs = Math.floor(new Date(timeRange.end).getTime() / 1000);

    // Get total usage
    const totalResult = await this.database['db']
      .prepare(
        `SELECT COUNT(*) as count FROM events
         WHERE user_id = ? AND component = ?
         AND timestamp >= ? AND timestamp <= ?`
      )
      .bind(userId, component, startTs * 1000, endTs * 1000)
      .first();

    // Get unique users (for now just 1, but query ready for multi-tenant)
    const uniqueUsersResult = await this.database['db']
      .prepare(
        `SELECT COUNT(DISTINCT user_id) as count FROM events
         WHERE component = ? AND timestamp >= ? AND timestamp <= ?`
      )
      .bind(component, startTs * 1000, endTs * 1000)
      .first();

    // Get top events for this component
    const topEventsResult = await this.database['db']
      .prepare(
        `SELECT event, COUNT(*) as count FROM events
         WHERE user_id = ? AND component = ?
         AND timestamp >= ? AND timestamp <= ?
         GROUP BY event ORDER BY count DESC LIMIT 5`
      )
      .bind(userId, component, startTs * 1000, endTs * 1000)
      .all();

    const totalUsage = (totalResult as any)?.count || 0;
    const uniqueUsers = (uniqueUsersResult as any)?.count || 1;

    const analytics: ComponentAnalytics = {
      component,
      totalUsage,
      uniqueUsers,
      averageInteractionsPerUser: uniqueUsers > 0 ? totalUsage / uniqueUsers : 0,
      topEvents: (topEventsResult.results || []).map((row: any) => ({
        event: row.event,
        count: row.count,
      })),
    };

    // Cache for 15 minutes
    if (this.cache) {
      await this.cache.set(cacheKey, analytics, 900);
    }

    return analytics;
  }

  /**
   * Get trend analysis for a metric
   */
  async getTrendAnalysis(
    userId: string,
    metric: 'events' | 'sessions' | 'flows',
    timeRange: TimeRange,
    groupBy: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<TrendData> {
    const cacheKey = `trend:${userId}:${metric}:${groupBy}:${timeRange.start}:${timeRange.end}`;

    if (this.cache) {
      const cached = await this.cache.get<TrendData>(cacheKey);
      if (cached) return cached;
    }

    const startTs = Math.floor(new Date(timeRange.start).getTime() / 1000);
    const endTs = Math.floor(new Date(timeRange.end).getTime() / 1000);

    let dateFormat: string;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%W';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
    }

    let query: string;
    let bind: any[];

    if (metric === 'events') {
      query = `
        SELECT strftime(?, timestamp / 1000, 'unixepoch') as period, COUNT(*) as value
        FROM events
        WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
        GROUP BY period ORDER BY period ASC
      `;
      bind = [dateFormat, userId, startTs * 1000, endTs * 1000];
    } else if (metric === 'sessions') {
      query = `
        SELECT strftime(?, started_at, 'unixepoch') as period, COUNT(*) as value
        FROM sessions
        WHERE user_id = ? AND started_at >= ? AND started_at <= ?
        GROUP BY period ORDER BY period ASC
      `;
      bind = [dateFormat, userId, startTs, endTs];
    } else {
      // flows (completed flows)
      query = `
        SELECT strftime(?, started_at, 'unixepoch') as period, COUNT(*) as value
        FROM sessions
        WHERE user_id = ? AND completed = 1
        AND started_at >= ? AND started_at <= ?
        GROUP BY period ORDER BY period ASC
      `;
      bind = [dateFormat, userId, startTs, endTs];
    }

    const result = await this.database['db']
      .prepare(query)
      .bind(...bind)
      .all();

    const trendData: TrendData = {
      metric,
      groupBy,
      data: (result.results || []).map((row: any) => ({
        timestamp: row.period,
        value: row.value,
      })),
    };

    // Cache for 15 minutes
    if (this.cache) {
      await this.cache.set(cacheKey, trendData, 900);
    }

    return trendData;
  }
}
