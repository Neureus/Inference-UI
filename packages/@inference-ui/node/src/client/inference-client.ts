/**
 * Main Inference UI client for Node.js
 */

import { InferenceGraphQLClient } from './graphql-client';
import type {
  InferenceUIConfig,
  User,
  ApiKey,
  CreateApiKeyInput,
  CreateApiKeyResponse,
  Flow,
  Event,
  EventBatch,
  AnalyticsQuery,
  AnalyticsResult,
  UsageMetrics,
} from '../types';

export class InferenceUIClient {
  private graphql: InferenceGraphQLClient;
  private apiUrl: string;
  private apiKey: string;

  constructor(config: InferenceUIConfig) {
    this.apiUrl = config.apiUrl || 'https://inference-ui-api.finhub.workers.dev';
    this.apiKey = config.apiKey;
    this.graphql = new InferenceGraphQLClient(config);
  }

  // ==================== User Management ====================

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const query = `
      query {
        me {
          id
          email
          tier
          createdAt
        }
      }
    `;
    const result = await this.graphql.query<{ me: User }>(query);
    return result.me;
  }

  // ==================== API Key Management ====================

  /**
   * Create a new API key
   */
  async createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResponse> {
    const mutation = `
      mutation CreateApiKey($name: String!, $expiresInDays: Int) {
        createApiKey(input: { name: $name, expiresInDays: $expiresInDays }) {
          apiKey
          keyPrefix
          createdAt
          expiresAt
        }
      }
    `;
    const result = await this.graphql.mutate<{ createApiKey: CreateApiKeyResponse }>(
      mutation,
      input
    );
    return result.createApiKey;
  }

  /**
   * List all API keys for the current user
   */
  async listApiKeys(): Promise<ApiKey[]> {
    const query = `
      query {
        apiKeys {
          id
          keyPrefix
          name
          lastUsedAt
          expiresAt
          revokedAt
          createdAt
        }
      }
    `;
    const result = await this.graphql.query<{ apiKeys: ApiKey[] }>(query);
    return result.apiKeys;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyPrefix: string): Promise<boolean> {
    const mutation = `
      mutation RevokeApiKey($keyPrefix: String!) {
        revokeApiKey(keyPrefix: $keyPrefix) {
          success
        }
      }
    `;
    const result = await this.graphql.mutate<{ revokeApiKey: { success: boolean } }>(
      mutation,
      { keyPrefix }
    );
    return result.revokeApiKey.success;
  }

  // ==================== Flow Management ====================

  /**
   * Get all flows for the current user
   */
  async getFlows(): Promise<Flow[]> {
    const query = `
      query {
        flows {
          id
          userId
          name
          steps
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.graphql.query<{ flows: Flow[] }>(query);
    return result.flows;
  }

  /**
   * Get a specific flow by ID
   */
  async getFlow(id: string): Promise<Flow> {
    const query = `
      query GetFlow($id: ID!) {
        flow(id: $id) {
          id
          userId
          name
          steps
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.graphql.query<{ flow: Flow }>(query, { id });
    return result.flow;
  }

  /**
   * Create a new flow
   */
  async createFlow(name: string, steps: any[]): Promise<Flow> {
    const mutation = `
      mutation CreateFlow($name: String!, $steps: JSON!) {
        createFlow(input: { name: $name, steps: $steps }) {
          id
          userId
          name
          steps
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.graphql.mutate<{ createFlow: Flow }>(mutation, {
      name,
      steps,
    });
    return result.createFlow;
  }

  /**
   * Delete a flow
   */
  async deleteFlow(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteFlow($id: ID!) {
        deleteFlow(id: $id) {
          success
        }
      }
    `;
    const result = await this.graphql.mutate<{ deleteFlow: { success: boolean } }>(
      mutation,
      { id }
    );
    return result.deleteFlow.success;
  }

  // ==================== Event Tracking ====================

  /**
   * Track a single event
   */
  async trackEvent(event: Event): Promise<void> {
    await this.trackEvents([event]);
  }

  /**
   * Track multiple events in batch
   */
  async trackEvents(events: Event[]): Promise<void> {
    const response = await fetch(`${this.apiUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(events),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Event tracking failed: ${error}`);
    }
  }

  // ==================== Analytics ====================

  /**
   * Query analytics data
   */
  async queryAnalytics(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const graphqlQuery = `
      query Analytics($userId: ID, $startDate: Int!, $endDate: Int!, $metrics: [String!], $groupBy: String) {
        analytics(userId: $userId, startDate: $startDate, endDate: $endDate, metrics: $metrics, groupBy: $groupBy) {
          metrics
          breakdown
        }
      }
    `;
    const result = await this.graphql.query<{ analytics: AnalyticsResult }>(
      graphqlQuery,
      query
    );
    return result.analytics;
  }

  /**
   * Get usage metrics for current user
   */
  async getUsageMetrics(): Promise<UsageMetrics> {
    const query = `
      query {
        usageMetrics {
          userId
          tier
          eventsThisMonth
          eventsLimit
          aiRequestsThisMonth
          aiRequestsLimit
        }
      }
    `;
    const result = await this.graphql.query<{ usageMetrics: UsageMetrics }>(query);
    return result.usageMetrics;
  }
}
