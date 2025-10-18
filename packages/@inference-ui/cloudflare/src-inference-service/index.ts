/**
 * Inference UI Service - Service Bindings Worker
 *
 * This worker provides RPC methods for other workers to interact with Inference UI
 * via service bindings. It handles GraphQL queries, event ingestion, and streaming operations.
 */

import { createResponse } from '../src/workers';
import { handleGraphQL } from '../src/graphql';
import { handleEventIngestion } from '../src/events';
import type { Env } from '../src/types';
import type {
  InferenceUIGraphQLRequest,
  InferenceUIEventRequest,
  InferenceUIBatchEventRequest,
  InferenceUIChatRequest,
  InferenceUICompletionRequest,
  InferenceUIObjectRequest,
} from '../src/types/service-bindings';

export default {
  /**
   * Service Binding RPC Methods
   *
   * These methods are callable directly from other workers via service bindings.
   * They provide a typed interface for interacting with Inference UI functionality.
   */

  /**
   * Execute GraphQL query via service binding
   *
   * @param request - GraphQL query, variables, and context
   * @param env - Worker environment with service bindings
   * @param ctx - Execution context
   * @returns GraphQL response
   */
  async graphql(
    request: InferenceUIGraphQLRequest,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Create a fake Request object for the GraphQL handler
    const graphqlRequest = new Request('http://internal/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await handleGraphQL(graphqlRequest, env, ctx);
  },

  /**
   * Ingest single event via service binding
   *
   * @param request - Event data with type, userId, sessionId
   * @param env - Worker environment
   * @param ctx - Execution context
   * @returns Event ingestion response
   */
  async ingestEvent(
    request: InferenceUIEventRequest,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Create a fake Request object for the event handler
    const eventRequest = new Request('http://internal/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: [request] }),
    });

    return await handleEventIngestion(eventRequest, env, ctx);
  },

  /**
   * Ingest batch of events via service binding
   *
   * @param request - Batch of events with metadata
   * @param env - Worker environment
   * @param ctx - Execution context
   * @returns Batch ingestion response
   */
  async ingestBatch(
    request: InferenceUIBatchEventRequest,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Create a fake Request object for the event handler
    const eventRequest = new Request('http://internal/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await handleEventIngestion(eventRequest, env, ctx);
  },

  /**
   * Stream chat completion via service binding
   *
   * Forwards request to the streaming worker for SSE response.
   *
   * @param request - Chat messages and configuration
   * @param env - Worker environment with STREAMING binding
   * @param _ctx - Execution context (unused)
   * @returns Streaming SSE response
   */
  async streamChat(
    request: InferenceUIChatRequest,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    // Forward to streaming worker via service binding
    const streamRequest = new Request('http://internal/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await env.STREAMING.fetch(streamRequest);
  },

  /**
   * Stream text completion via service binding
   *
   * Forwards request to the streaming worker for SSE response.
   *
   * @param request - Prompt and completion parameters
   * @param env - Worker environment with STREAMING binding
   * @param _ctx - Execution context (unused)
   * @returns Streaming SSE response
   */
  async streamCompletion(
    request: InferenceUICompletionRequest,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    // Forward to streaming worker via service binding
    const streamRequest = new Request('http://internal/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await env.STREAMING.fetch(streamRequest);
  },

  /**
   * Stream object generation via service binding
   *
   * Forwards request to the streaming worker for SSE response.
   *
   * @param request - Prompt and JSON schema
   * @param env - Worker environment with STREAMING binding
   * @param _ctx - Execution context (unused)
   * @returns Streaming SSE response with structured objects
   */
  async streamObject(
    request: InferenceUIObjectRequest,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    // Forward to streaming worker via service binding
    const streamRequest = new Request('http://internal/object', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await env.STREAMING.fetch(streamRequest);
  },

  /**
   * Health check via service binding
   *
   * Returns a simple health status response.
   *
   * @returns Health status with timestamp
   */
  async health(): Promise<Response> {
    return createResponse({
      status: 'healthy',
      service: 'inference-service',
      timestamp: Date.now(),
    });
  },
};
