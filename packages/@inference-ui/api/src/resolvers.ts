/**
 * GraphQL Resolvers
 * Platform-agnostic business logic using database adapters
 */

import type {
  APIContext,
  CreateFlowInput,
  UpdateFlowInput,
  EventInput,
  TimeRange,
} from './types';

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: APIContext) => {
      if (!context.userId) {
        return null;
      }

      const user = await context.database.getUserById(context.userId);
      if (!user) {
        return null;
      }

      const usage = await context.database.getUserUsage(context.userId);

      return {
        id: user.id,
        email: user.email,
        tier: user.tier.toUpperCase(),
        createdAt: new Date(user.createdAt * 1000).toISOString(),
        usage,
      };
    },

    flows: async (
      _parent: unknown,
      args: { limit?: number; offset?: number },
      context: APIContext
    ) => {
      const { limit = 100, offset = 0 } = args;

      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const flows = await context.database.getFlows(context.userId, limit, offset);

      return flows.map((flow) => ({
        id: flow.id,
        name: flow.name,
        steps: flow.steps,
        aiConfig: flow.aiConfig,
        createdAt: new Date(flow.createdAt * 1000).toISOString(),
        updatedAt: new Date(flow.updatedAt * 1000).toISOString(),
      }));
    },

    flow: async (
      _parent: unknown,
      args: { id: string },
      context: APIContext
    ) => {
      const flow = await context.database.getFlowById(args.id);

      if (!flow) {
        return null;
      }

      return {
        id: flow.id,
        name: flow.name,
        steps: flow.steps,
        aiConfig: flow.aiConfig,
        createdAt: new Date(flow.createdAt * 1000).toISOString(),
        updatedAt: new Date(flow.updatedAt * 1000).toISOString(),
      };
    },

    flowAnalytics: async (
      _parent: unknown,
      args: { flowId: string; timeRange: TimeRange },
      context: APIContext
    ) => {
      return context.database.getFlowAnalytics(args.flowId, args.timeRange);
    },
  },

  Mutation: {
    createFlow: async (
      _parent: unknown,
      args: { input: CreateFlowInput },
      context: APIContext
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const flow = await context.database.createFlow(context.userId, args.input);

      return {
        id: flow.id,
        name: flow.name,
        steps: flow.steps,
        aiConfig: flow.aiConfig,
        createdAt: new Date(flow.createdAt * 1000).toISOString(),
        updatedAt: new Date(flow.updatedAt * 1000).toISOString(),
      };
    },

    updateFlow: async (
      _parent: unknown,
      args: { id: string; input: UpdateFlowInput },
      context: APIContext
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      const flow = await context.database.updateFlow(args.id, context.userId, args.input);

      return {
        id: flow.id,
        name: flow.name,
        steps: flow.steps,
        aiConfig: flow.aiConfig,
        createdAt: new Date(flow.createdAt * 1000).toISOString(),
        updatedAt: new Date(flow.updatedAt * 1000).toISOString(),
      };
    },

    deleteFlow: async (
      _parent: unknown,
      args: { id: string },
      context: APIContext
    ) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      return context.database.deleteFlow(args.id, context.userId);
    },

    trackEvent: async (
      _parent: unknown,
      args: { input: EventInput },
      context: APIContext
    ) => {
      const event = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        userId: context.userId,
        sessionId: context.sessionId || 'unknown',
        event: args.input.event,
        component: args.input.component,
        properties: args.input.properties,
      };

      // Write to database
      await context.database.createEvent(event);

      // Write to analytics if available
      if (context.analytics) {
        try {
          await context.analytics.writeDataPoint({
            indexes: [
              event.userId || 'anonymous',
              event.sessionId,
              event.event,
              event.component || 'unknown',
            ],
            blobs: [JSON.stringify(event.properties || {})],
            doubles: [event.timestamp, 1],
          });
        } catch (error) {
          console.error('Analytics write failed (non-fatal):', error);
        }
      }

      return true;
    },
  },
};
