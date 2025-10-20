/**
 * Inference UI JavaScript Client
 * Browser-compatible client for web applications
 */

import type {
  InferenceConfig,
  User,
  ApiKey,
  CreateApiKeyInput,
  CreateApiKeyResponse,
  Flow,
  FlowStep,
  Event,
  AnalyticsQuery,
  AnalyticsResult,
  UsageMetrics,
  GraphQLRequest,
  GraphQLResponse,
} from './types';

export class InferenceClient {
  private apiUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(config: InferenceConfig) {
    this.apiUrl = config.apiUrl || 'https://inference-ui-api.finhub.workers.dev';
    this.apiKey = config.apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...config.headers,
    };
  }

  /**
   * Execute a GraphQL query
   */
  private async graphql<T = any>(request: GraphQLRequest): Promise<T> {
    const response = await fetch(`${this.apiUrl}/graphql`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GraphQL request failed: ${error}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(`GraphQL error: ${result.errors[0].message}`);
    }

    if (!result.data) {
      throw new Error('GraphQL request returned no data');
    }

    return result.data;
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
    const result = await this.graphql<{ me: User }>({ query });
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
    const result = await this.graphql<{ createApiKey: CreateApiKeyResponse }>({
      query: mutation,
      variables: input,
    });
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
    const result = await this.graphql<{ apiKeys: ApiKey[] }>({ query });
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
    const result = await this.graphql<{ revokeApiKey: { success: boolean } }>({
      query: mutation,
      variables: { keyPrefix },
    });
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
    const result = await this.graphql<{ flows: Flow[] }>({ query });
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
    const result = await this.graphql<{ flow: Flow }>({ query, variables: { id } });
    return result.flow;
  }

  /**
   * Create a new flow
   */
  async createFlow(name: string, steps: FlowStep[]): Promise<Flow> {
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
    const result = await this.graphql<{ createFlow: Flow }>({
      query: mutation,
      variables: { name, steps },
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
    const result = await this.graphql<{ deleteFlow: { success: boolean } }>({
      query: mutation,
      variables: { id },
    });
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
      headers: this.headers,
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
    const result = await this.graphql<{ analytics: AnalyticsResult }>({
      query: graphqlQuery,
      variables: query,
    });
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
    const result = await this.graphql<{ usageMetrics: UsageMetrics }>({ query });
    return result.usageMetrics;
  }
}
