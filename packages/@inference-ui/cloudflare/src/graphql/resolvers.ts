/**
 * GraphQL Resolvers
 */

import type { Env } from '../types';
import { D1DatabaseAdapter } from '../adapters/d1-database';
import { getTierLimits } from '../config/tier-limits';
import { UserTier } from '@inference-ui/api';
import { enforceFlowLimit, enforceEventLimit, trackEventUsage } from '../middleware/usage-tracker';
import { AnalyticsService } from '../services/analytics-service';
import { KVCacheAdapter } from '../adapters/kv-cache';
import { FunnelAnalyzer } from '../services/funnel-analyzer';
import { CohortAnalyzer } from '../services/cohort-analyzer';
import { AttributionService } from '../services/attribution-service';

export interface Context {
  env: Env;
  ctx: ExecutionContext;
  userId?: string;
}

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, _context: Context) => {
      // TODO: Implement authentication and fetch current user
      // For now, return null (unauthenticated)
      return null;
    },

    flows: async (_parent: unknown, args: { limit?: number; offset?: number }, context: Context) => {
      const { limit = 100, offset = 0 } = args;

      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const result = await context.env.DB.prepare(
        `SELECT * FROM flows WHERE user_id = ? AND active = 1
         ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
        .bind(context.userId, limit, offset)
        .all();

      return result.results.map((row: any) => ({
        id: row.id,
        name: row.name,
        steps: JSON.parse(row.steps),
        aiConfig: row.ai_config ? JSON.parse(row.ai_config) : null,
        createdAt: new Date(row.created_at * 1000).toISOString(),
        updatedAt: new Date(row.updated_at * 1000).toISOString(),
      }));
    },

    flow: async (_parent: unknown, args: { id: string }, context: Context) => {
      const result = await context.env.DB.prepare(
        `SELECT * FROM flows WHERE id = ?`
      )
        .bind(args.id)
        .first();

      if (!result) {
        return null;
      }

      return {
        id: result.id,
        name: result.name,
        steps: JSON.parse(result.steps as string),
        aiConfig: result.ai_config ? JSON.parse(result.ai_config as string) : null,
        createdAt: new Date((result.created_at as number) * 1000).toISOString(),
        updatedAt: new Date((result.updated_at as number) * 1000).toISOString(),
      };
    },

    flowAnalytics: async (_parent: unknown, args: { flowId: string; timeRange: { start: string; end: string } }, _context: Context) => {
      // TODO: Implement flow analytics using Analytics Engine
      // For now, return stub data
      return {
        flowId: args.flowId,
        completionRate: 0.75,
        averageDuration: 120000,
        dropoffPoints: [],
        totalSessions: 0,
      };
    },

    usageMetrics: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const db = new D1DatabaseAdapter(context.env.DB);
      const metrics = await db.getUserUsageWithLimits(context.userId);

      return {
        usage: metrics.usage,
        limits: {
          eventsPerMonth: metrics.limits.eventsPerMonth,
          maxFlows: metrics.limits.maxFlows,
          aiRequestsPerMonth: metrics.limits.aiRequestsPerMonth,
        },
        warnings: {
          events: metrics.warnings.events.toUpperCase(),
          flows: metrics.warnings.flows.toUpperCase(),
          aiRequests: metrics.warnings.aiRequests.toUpperCase(),
        },
        percentages: {
          events: metrics.percentages.events,
          flows: metrics.percentages.flows,
          aiRequests: metrics.percentages.aiRequests,
        },
      };
    },

    tierLimits: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const db = new D1DatabaseAdapter(context.env.DB);
      const user = await db.getUserById(context.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const limits = getTierLimits(user.tier as UserTier);

      return {
        tier: user.tier.toUpperCase(),
        limits: {
          eventsPerMonth: limits.eventsPerMonth,
          maxFlows: limits.maxFlows,
          aiRequestsPerMonth: limits.aiRequestsPerMonth,
        },
        features: {
          basicMetrics: limits.analyticsFeatures.basicMetrics,
          advancedAnalytics: limits.analyticsFeatures.advancedAnalytics,
          aiInsights: limits.analyticsFeatures.aiInsights,
          customDashboards: limits.analyticsFeatures.customDashboards,
          dataExport: limits.analyticsFeatures.dataExport,
          realTimeAnalytics: limits.analyticsFeatures.realTimeAnalytics,
        },
        dataRetentionDays: limits.dataRetentionDays,
      };
    },

    eventMetrics: async (_parent: unknown, args: { timeRange: { start: string; end: string } }, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const analytics = new AnalyticsService(db, undefined, cache);

      return await analytics.getEventMetrics(context.userId, args.timeRange);
    },

    flowMetrics: async (_parent: unknown, args: { flowId: string; timeRange: { start: string; end: string } }, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const analytics = new AnalyticsService(db, undefined, cache);

      return await analytics.getFlowMetrics(args.flowId, args.timeRange);
    },

    sessionMetrics: async (_parent: unknown, args: { timeRange: { start: string; end: string } }, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const analytics = new AnalyticsService(db, undefined, cache);

      return await analytics.getSessionMetrics(context.userId, args.timeRange);
    },

    componentAnalytics: async (_parent: unknown, args: { component: string; timeRange: { start: string; end: string } }, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const analytics = new AnalyticsService(db, undefined, cache);

      return await analytics.getComponentAnalytics(context.userId, args.component, args.timeRange);
    },

    trendAnalysis: async (
      _parent: unknown,
      args: { metric: string; timeRange: { start: string; end: string }; groupBy?: string },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const analytics = new AnalyticsService(db, undefined, cache);

      const metric = args.metric.toLowerCase() as 'events' | 'sessions' | 'flows';
      const groupBy = (args.groupBy?.toLowerCase() || 'day') as 'hour' | 'day' | 'week' | 'month';

      return await analytics.getTrendAnalysis(context.userId, metric, args.timeRange, groupBy);
    },

    // Phase 3: Advanced Analytics - Funnel Analysis
    funnel: async (_parent: unknown, args: { id: string }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const funnelAnalyzer = new FunnelAnalyzer(db, cache);

      return await funnelAnalyzer.getFunnel(args.id);
    },

    userFunnels: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const funnelAnalyzer = new FunnelAnalyzer(db, cache);

      return await funnelAnalyzer.getUserFunnels(context.userId);
    },

    analyzeFunnel: async (_parent: unknown, args: { funnelId: string; timeRange: { start: string; end: string } }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const funnelAnalyzer = new FunnelAnalyzer(db, cache);

      return await funnelAnalyzer.analyzeFunnel(args.funnelId, args.timeRange);
    },

    funnelInsights: async (_parent: unknown, args: { funnelId: string; timeRange: { start: string; end: string } }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const funnelAnalyzer = new FunnelAnalyzer(db, cache);

      return await funnelAnalyzer.getFunnelInsights(args.funnelId, args.timeRange);
    },

    // Phase 3: Advanced Analytics - Cohort Analysis
    cohort: async (_parent: unknown, args: { id: string }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const cohortAnalyzer = new CohortAnalyzer(db, cache);

      return await cohortAnalyzer.getCohort(args.id);
    },

    userCohorts: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const cohortAnalyzer = new CohortAnalyzer(db, cache);

      return await cohortAnalyzer.getUserCohorts(context.userId);
    },

    cohortSize: async (_parent: unknown, args: { cohortId: string; timeRange?: { start: string; end: string } }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const cohortAnalyzer = new CohortAnalyzer(db, cache);

      return await cohortAnalyzer.getCohortSize(args.cohortId, args.timeRange);
    },

    cohortRetention: async (
      _parent: unknown,
      args: { cohortId: string; periodType?: string; maxPeriods?: number },
      context: Context
    ) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const cohortAnalyzer = new CohortAnalyzer(db, cache);

      const periodType = (args.periodType?.toLowerCase() || 'week') as 'day' | 'week' | 'month';
      const maxPeriods = args.maxPeriods || 12;

      return await cohortAnalyzer.analyzeRetention(args.cohortId, periodType, maxPeriods);
    },

    compareCohorts: async (
      _parent: unknown,
      args: { cohortIds: string[]; periodType?: string },
      context: Context
    ) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const cohortAnalyzer = new CohortAnalyzer(db, cache);

      const periodType = (args.periodType?.toLowerCase() || 'week') as 'day' | 'week' | 'month';

      return await cohortAnalyzer.compareCohorts(args.cohortIds, periodType);
    },

    // Phase 3: Advanced Analytics - Attribution Analysis
    attributionAnalysis: async (
      _parent: unknown,
      args: { timeRange: { start: string; end: string }; model?: string; groupBy?: string },
      context: Context
    ) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const attributionService = new AttributionService(db, cache);

      const model = (args.model?.toLowerCase().replace('_', '_') || 'last_touch') as any;
      const groupBy = (args.groupBy?.toLowerCase() || 'source') as 'source' | 'medium' | 'campaign' | 'component';

      return await attributionService.analyzeAttribution(args.timeRange, model, groupBy);
    },

    conversionSummary: async (
      _parent: unknown,
      args: { timeRange: { start: string; end: string } },
      context: Context
    ) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const attributionService = new AttributionService(db, cache);

      return await attributionService.getConversionSummary(args.timeRange);
    },

    topConvertingPaths: async (
      _parent: unknown,
      args: { timeRange: { start: string; end: string }; limit?: number },
      context: Context
    ) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const attributionService = new AttributionService(db, cache);

      return await attributionService.getTopConvertingPaths(args.timeRange, args.limit || 10);
    },

    attributionModels: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const attributionService = new AttributionService(db);

      return attributionService.getAttributionModels();
    },
  },

  Mutation: {
    createFlow: async (_parent: unknown, args: { input: any }, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      // Check tier limits before creating flow
      const db = new D1DatabaseAdapter(context.env.DB);
      await enforceFlowLimit(db, context.userId);

      const id = crypto.randomUUID();
      const now = Math.floor(Date.now() / 1000);

      await context.env.DB.prepare(
        `INSERT INTO flows (id, user_id, name, steps, ai_config, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          id,
          context.userId,
          args.input.name,
          JSON.stringify(args.input.steps),
          args.input.aiConfig ? JSON.stringify(args.input.aiConfig) : null,
          now,
          now
        )
        .run();

      return {
        id,
        name: args.input.name,
        steps: args.input.steps,
        aiConfig: args.input.aiConfig,
        createdAt: new Date(now * 1000).toISOString(),
        updatedAt: new Date(now * 1000).toISOString(),
      };
    },

    updateFlow: async (_parent: unknown, args: { id: string; input: any }, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const now = Math.floor(Date.now() / 1000);
      const updates: string[] = [];
      const values: any[] = [];

      if (args.input.name !== undefined) {
        updates.push('name = ?');
        values.push(args.input.name);
      }

      if (args.input.steps !== undefined) {
        updates.push('steps = ?');
        values.push(JSON.stringify(args.input.steps));
      }

      if (args.input.aiConfig !== undefined) {
        updates.push('ai_config = ?');
        values.push(JSON.stringify(args.input.aiConfig));
      }

      updates.push('updated_at = ?');
      values.push(now);
      values.push(args.id);

      await context.env.DB.prepare(
        `UPDATE flows SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
      )
        .bind(...values, context.userId)
        .run();

      // Fetch updated flow
      const result = await context.env.DB.prepare(
        `SELECT * FROM flows WHERE id = ?`
      )
        .bind(args.id)
        .first();

      if (!result) {
        throw new Error('Flow not found');
      }

      return {
        id: result.id,
        name: result.name,
        steps: JSON.parse(result.steps as string),
        aiConfig: result.ai_config ? JSON.parse(result.ai_config as string) : null,
        createdAt: new Date((result.created_at as number) * 1000).toISOString(),
        updatedAt: new Date((result.updated_at as number) * 1000).toISOString(),
      };
    },

    deleteFlow: async (_parent: unknown, args: { id: string }, context: Context) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const result = await context.env.DB.prepare(
        `UPDATE flows SET active = 0 WHERE id = ? AND user_id = ?`
      )
        .bind(args.id, context.userId)
        .run();

      return result.meta.changes > 0;
    },

    trackEvent: async (_parent: unknown, args: { input: any }, context: Context) => {
      const db = new D1DatabaseAdapter(context.env.DB);

      // Check tier limits for authenticated users
      await enforceEventLimit(db, context.userId);

      // Use the event ingestion handler
      const event = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        userId: context.userId,
        sessionId: 'graphql-session',
        ...args.input,
      };

      // Write to Analytics Engine
      context.env.ANALYTICS.writeDataPoint({
        indexes: [
          event.userId || 'anonymous',
          event.sessionId,
          event.event,
          event.component || 'unknown',
        ],
        blobs: [
          JSON.stringify(event.properties || {}),
        ],
        doubles: [event.timestamp, 1],
      });

      // Track usage for authenticated users
      await trackEventUsage(db, context.userId);

      return true;
    },

    // Phase 3: Advanced Analytics - Funnel and Cohort Mutations
    createFunnel: async (_parent: unknown, args: { input: any }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const funnelAnalyzer = new FunnelAnalyzer(db, cache);

      return await funnelAnalyzer.createFunnel(
        context.userId,
        args.input.name,
        args.input.steps,
        {
          description: args.input.description,
          flowId: args.input.flowId,
        }
      );
    },

    deleteFunnel: async (_parent: unknown, args: { id: string }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const funnelAnalyzer = new FunnelAnalyzer(db, cache);

      return await funnelAnalyzer.deleteFunnel(args.id, context.userId);
    },

    createCohort: async (_parent: unknown, args: { input: any }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const cohortAnalyzer = new CohortAnalyzer(db, cache);

      // Convert GraphQL enum to lowercase for service
      const criteria = {
        ...args.input.criteria,
        type: args.input.criteria.type.toLowerCase(),
      };

      return await cohortAnalyzer.createCohort(
        context.userId,
        args.input.name,
        criteria,
        args.input.description
      );
    },

    deleteCohort: async (_parent: unknown, args: { id: string }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const cohortAnalyzer = new CohortAnalyzer(db, cache);

      return await cohortAnalyzer.deleteCohort(args.id, context.userId);
    },

    trackConversion: async (_parent: unknown, args: { input: any }, context: Context) => {
      if (!context.userId) throw new Error('Authentication required');

      const db = new D1DatabaseAdapter(context.env.DB);
      const cache = context.env.KV ? new KVCacheAdapter(context.env.KV) : undefined;
      const attributionService = new AttributionService(db, cache);

      // Get session ID from context (simplified - in production, would come from session management)
      const sessionId = 'session-' + Date.now();

      return await attributionService.trackConversion(
        context.userId,
        sessionId,
        args.input.event,
        args.input.value,
        args.input.metadata
      );
    },
  },
};
