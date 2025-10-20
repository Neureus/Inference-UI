/**
 * GraphQL client for Inference UI API
 */

import { GraphQLClient } from 'graphql-request';
import type { InferenceUIConfig } from '../types';

export class InferenceGraphQLClient {
  private client: GraphQLClient;
  private apiUrl: string;
  private apiKey: string;

  constructor(config: InferenceUIConfig) {
    this.apiUrl = config.apiUrl || 'https://inference-ui-api.finhub.workers.dev';
    this.apiKey = config.apiKey;

    this.client = new GraphQLClient(`${this.apiUrl}/graphql`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
  }

  /**
   * Execute a GraphQL query
   */
  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error: any) {
      throw new Error(`GraphQL query failed: ${error.message}`);
    }
  }

  /**
   * Execute a GraphQL mutation
   */
  async mutate<T = any>(mutation: string, variables?: Record<string, any>): Promise<T> {
    try {
      return await this.client.request<T>(mutation, variables);
    } catch (error: any) {
      throw new Error(`GraphQL mutation failed: ${error.message}`);
    }
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client = new GraphQLClient(`${this.apiUrl}/graphql`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
