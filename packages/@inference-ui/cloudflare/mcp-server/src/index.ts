#!/usr/bin/env node

/**
 * Inference UI MCP Server
 *
 * Model Context Protocol server that enables AI assistants to interact with
 * Inference UI's GraphQL API, event intelligence, and AI streaming capabilities.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import type {
  GraphQLRequest,
  GraphQLResponse,
  EventRequest,
  BatchEventRequest,
  EventResponse,
  ChatRequest,
  CompletionRequest,
  ObjectRequest,
  HealthResponse,
  MCPServerConfig,
} from './types.js';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: MCPServerConfig = {
  apiUrl: process.env.INFERENCE_UI_API_URL || 'https://inference-ui-api.finhub.workers.dev',
  apiKey: process.env.INFERENCE_UI_API_KEY,
  timeout: 30000, // 30 seconds
};

/**
 * Inference UI MCP Server
 */
class InferenceUIMCPServer {
  private server: Server;
  private config: MCPServerConfig;

  constructor(config: Partial<MCPServerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.server = new Server(
      {
        name: 'inference-ui-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Setup tool handlers
   */
  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'graphql_query':
            return await this.handleGraphQLQuery(args as any);

          case 'ingest_event':
            return await this.handleIngestEvent(args as any);

          case 'ingest_batch':
            return await this.handleIngestBatch(args as any);

          case 'stream_chat':
            return await this.handleStreamChat(args as any);

          case 'stream_completion':
            return await this.handleStreamCompletion(args as any);

          case 'stream_object':
            return await this.handleStreamObject(args as any);

          case 'health_check':
            return await this.handleHealthCheck();

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: errorMessage,
                tool: name,
              }, null, 2),
            },
          ],
        };
      }
    });
  }

  /**
   * Get available tools
   */
  private getTools(): Tool[] {
    return [
      {
        name: 'graphql_query',
        description: 'Execute a GraphQL query against Inference UI API. Supports queries for component events, user analytics, flow metrics, and more.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'GraphQL query or mutation string',
            },
            variables: {
              type: 'object',
              description: 'Query variables (optional)',
            },
            operationName: {
              type: 'string',
              description: 'Operation name (optional)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'ingest_event',
        description: 'Ingest a single event into Inference UI event intelligence system. Events are automatically captured, enriched with AI, and stored for analytics.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Event type (e.g., "button_click", "page_view", "form_submit")',
            },
            data: {
              type: 'object',
              description: 'Event data payload',
            },
            userId: {
              type: 'string',
              description: 'User ID (optional)',
            },
            sessionId: {
              type: 'string',
              description: 'Session ID (optional)',
            },
            timestamp: {
              type: 'number',
              description: 'Unix timestamp in milliseconds (optional, defaults to now)',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata (optional)',
            },
          },
          required: ['type', 'data'],
        },
      },
      {
        name: 'ingest_batch',
        description: 'Ingest a batch of events into Inference UI. More efficient than ingesting events individually.',
        inputSchema: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              description: 'Array of events to ingest',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  data: { type: 'object' },
                  userId: { type: 'string' },
                  sessionId: { type: 'string' },
                  timestamp: { type: 'number' },
                  metadata: { type: 'object' },
                },
                required: ['type', 'data'],
              },
            },
            metadata: {
              type: 'object',
              description: 'Batch metadata (optional)',
              properties: {
                source: { type: 'string' },
                batchId: { type: 'string' },
              },
            },
          },
          required: ['events'],
        },
      },
      {
        name: 'stream_chat',
        description: 'Stream an AI chat completion using Cloudflare Workers AI at the edge. Returns streaming response.',
        inputSchema: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              description: 'Chat messages array',
              items: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['user', 'assistant', 'system'],
                  },
                  content: { type: 'string' },
                },
                required: ['role', 'content'],
              },
            },
            model: {
              type: 'string',
              description: 'Model to use (default: @cf/meta/llama-3.1-8b-instruct)',
            },
            temperature: {
              type: 'number',
              description: 'Temperature 0-1 (default: 0.7)',
            },
            maxTokens: {
              type: 'number',
              description: 'Max tokens to generate (default: 500)',
            },
            chatId: {
              type: 'string',
              description: 'Chat ID for tracking (optional)',
            },
            context: {
              type: 'object',
              description: 'User context (optional)',
              properties: {
                userId: { type: 'string' },
                sessionId: { type: 'string' },
              },
            },
          },
          required: ['messages'],
        },
      },
      {
        name: 'stream_completion',
        description: 'Stream an AI text completion using Cloudflare Workers AI. Ideal for text generation tasks.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text prompt for completion',
            },
            model: {
              type: 'string',
              description: 'Model to use (default: @cf/meta/llama-3.1-8b-instruct)',
            },
            temperature: {
              type: 'number',
              description: 'Temperature 0-1 (default: 0.7)',
            },
            maxTokens: {
              type: 'number',
              description: 'Max tokens to generate (default: 500)',
            },
            stop: {
              type: 'array',
              description: 'Stop sequences (optional)',
              items: { type: 'string' },
            },
            context: {
              type: 'object',
              description: 'User context (optional)',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'stream_object',
        description: 'Stream an AI-generated structured object using Cloudflare Workers AI. Ideal for generating JSON data.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Prompt for object generation',
            },
            schema: {
              type: 'object',
              description: 'JSON schema for the output object',
            },
            model: {
              type: 'string',
              description: 'Model to use (default: @cf/meta/llama-3.1-8b-instruct)',
            },
            temperature: {
              type: 'number',
              description: 'Temperature 0-1 (default: 0.7)',
            },
            context: {
              type: 'object',
              description: 'User context (optional)',
            },
          },
          required: ['prompt', 'schema'],
        },
      },
      {
        name: 'health_check',
        description: 'Check the health status of Inference UI API',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  /**
   * Handle GraphQL query
   */
  private async handleGraphQLQuery(args: GraphQLRequest) {
    const response = await this.fetchAPI('/graphql', {
      method: 'POST',
      body: JSON.stringify(args),
    });

    const result = (await response.json()) as GraphQLResponse;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle ingest event
   */
  private async handleIngestEvent(args: EventRequest) {
    const response = await this.fetchAPI('/events', {
      method: 'POST',
      body: JSON.stringify({ events: [args] }),
    });

    const result = (await response.json()) as EventResponse;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle ingest batch
   */
  private async handleIngestBatch(args: BatchEventRequest) {
    const response = await this.fetchAPI('/events', {
      method: 'POST',
      body: JSON.stringify(args),
    });

    const result = (await response.json()) as EventResponse;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle stream chat
   */
  private async handleStreamChat(args: ChatRequest) {
    const response = await this.fetchAPI('/stream/chat', {
      method: 'POST',
      body: JSON.stringify(args),
    });

    // Read the entire stream
    const text = await response.text();

    return {
      content: [
        {
          type: 'text',
          text: text,
        },
      ],
    };
  }

  /**
   * Handle stream completion
   */
  private async handleStreamCompletion(args: CompletionRequest) {
    const response = await this.fetchAPI('/stream/completion', {
      method: 'POST',
      body: JSON.stringify(args),
    });

    const text = await response.text();

    return {
      content: [
        {
          type: 'text',
          text: text,
        },
      ],
    };
  }

  /**
   * Handle stream object
   */
  private async handleStreamObject(args: ObjectRequest) {
    const response = await this.fetchAPI('/stream/object', {
      method: 'POST',
      body: JSON.stringify(args),
    });

    const text = await response.text();

    return {
      content: [
        {
          type: 'text',
          text: text,
        },
      ],
    };
  }

  /**
   * Handle health check
   */
  private async handleHealthCheck() {
    const response = await this.fetchAPI('/health', {
      method: 'GET',
    });

    const result = (await response.json()) as HealthResponse;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Fetch API helper
   */
  private async fetchAPI(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.config.apiUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Inference UI MCP Server started');
  }
}

/**
 * Main entry point
 */
async function main() {
  const server = new InferenceUIMCPServer();
  await server.start();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
