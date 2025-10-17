/**
 * PersonQL Service Binding Consumer Example
 *
 * This example shows how to use PersonQL via service bindings from another worker.
 * Service bindings provide 0ms latency access to PersonQL without HTTP calls.
 */

import type {
  PersonQLQueryRequest,
  PersonQLDirectRequest,
  PersonQLAIRequest,
  PersonQLCacheRequest,
} from '../../src-personql/types';

/**
 * Consumer Worker Environment
 */
interface Env {
  // PersonQL Service Binding
  PERSONQL: {
    query(request: PersonQLQueryRequest): Promise<Response>;
    direct(request: PersonQLDirectRequest): Promise<Response>;
    enrich(request: PersonQLAIRequest): Promise<Response>;
    cache(request: PersonQLCacheRequest): Promise<Response>;
    health(): Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route examples
      switch (path) {
        case '/example-query':
          return await exampleGraphQLQuery(env);

        case '/example-direct':
          return await exampleDirectAccess(env);

        case '/example-enrich':
          return await exampleAIEnrichment(env);

        case '/example-cache':
          return await exampleCacheOperations(env);

        case '/example-full-flow':
          return await exampleFullFlow(env, ctx);

        case '/health':
          // Check PersonQL service health via service binding
          return await env.PERSONQL.health();

        default:
          return new Response(
            JSON.stringify({
              service: 'PersonQL Consumer Example',
              endpoints: {
                '/example-query': 'GraphQL query example',
                '/example-direct': 'Direct access example',
                '/example-enrich': 'AI enrichment example',
                '/example-cache': 'Cache operations example',
                '/example-full-flow': 'Complete workflow example',
                '/health': 'PersonQL health check',
              },
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

/**
 * Example 1: GraphQL Query via Service Binding
 */
async function exampleGraphQLQuery(env: Env): Promise<Response> {
  // Execute GraphQL query via service binding (0ms latency!)
  const response = await env.PERSONQL.query({
    query: `
      query GetPerson($id: ID!) {
        person(id: $id) {
          id
          name
          email
          createdAt
        }
      }
    `,
    variables: {
      id: '123',
    },
    context: {
      userId: 'current-user-id',
      tenantId: 'tenant-123',
    },
  });

  const result = await response.json();

  return new Response(
    JSON.stringify({
      example: 'GraphQL Query',
      result,
      note: 'Query executed via service binding with 0ms latency',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Example 2: Direct Database Access (Bypass GraphQL)
 */
async function exampleDirectAccess(env: Env): Promise<Response> {
  // Get a single person
  const getResponse = await env.PERSONQL.direct({
    operation: 'get',
    entity: 'person',
    params: {
      id: '123',
    },
  });

  const getPerson = await getResponse.json();

  // List persons with filter
  const listResponse = await env.PERSONQL.direct({
    operation: 'list',
    entity: 'person',
    params: {
      filter: {
        email: 'user@example.com',
      },
      limit: 10,
      offset: 0,
    },
  });

  const listResult = await listResponse.json();

  // Create a new person
  const createResponse = await env.PERSONQL.direct({
    operation: 'create',
    entity: 'person',
    params: {
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        metadata: {
          source: 'api',
          tags: ['customer', 'premium'],
        },
      },
    },
    context: {
      userId: 'admin',
    },
  });

  const createResult = await createResponse.json();

  return new Response(
    JSON.stringify({
      example: 'Direct Database Access',
      operations: {
        get: getPerson,
        list: listResult,
        create: createResult,
      },
      note: 'Direct access bypasses GraphQL for maximum performance',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Example 3: AI Enrichment
 */
async function exampleAIEnrichment(env: Env): Promise<Response> {
  // Generate insights about a person
  const insightsResponse = await env.PERSONQL.enrich({
    type: 'insights',
    person: '123',
    options: {
      model: '@cf/meta/llama-3.1-8b-instruct',
      temperature: 0.7,
      includeConfidence: true,
    },
  });

  const insights = await insightsResponse.json();

  // Generate recommendations
  const recommendationsResponse = await env.PERSONQL.enrich({
    type: 'recommendations',
    person: '123',
  });

  const recommendations = await recommendationsResponse.json();

  // Classify person
  const classificationResponse = await env.PERSONQL.enrich({
    type: 'classification',
    person: {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      metadata: {
        industry: 'technology',
        company: 'Tech Corp',
      },
    },
  });

  const classification = await classificationResponse.json();

  return new Response(
    JSON.stringify({
      example: 'AI Enrichment',
      results: {
        insights,
        recommendations,
        classification,
      },
      note: 'AI enrichment powered by Workers AI at the edge',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Example 4: Cache Operations
 */
async function exampleCacheOperations(env: Env): Promise<Response> {
  // Set cache value
  await env.PERSONQL.cache({
    operation: 'set',
    key: 'user:preferences:123',
    value: {
      theme: 'dark',
      language: 'en',
      notifications: true,
    },
    ttl: 3600, // 1 hour
  });

  // Get cache value
  const getResponse = await env.PERSONQL.cache({
    operation: 'get',
    key: 'user:preferences:123',
  });

  const cachedValue = await getResponse.json();

  // Delete cache value
  const deleteResponse = await env.PERSONQL.cache({
    operation: 'delete',
    key: 'user:preferences:123',
  });

  const deleteResult = await deleteResponse.json();

  return new Response(
    JSON.stringify({
      example: 'Cache Operations',
      operations: {
        get: cachedValue,
        delete: deleteResult,
      },
      note: 'Cache operations for high-performance data access',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Example 5: Complete Workflow
 * Shows a real-world scenario using multiple PersonQL features
 */
async function exampleFullFlow(env: Env, ctx: ExecutionContext): Promise<Response> {
  const userId = '123';

  // Step 1: Check cache first
  const cacheResponse = await env.PERSONQL.cache({
    operation: 'get',
    key: `person:${userId}`,
  });

  const cached = await cacheResponse.json();

  if (cached.data) {
    return new Response(
      JSON.stringify({
        example: 'Full Workflow (Cache Hit)',
        person: cached.data,
        source: 'cache',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Step 2: Fetch from database
  const personResponse = await env.PERSONQL.direct({
    operation: 'get',
    entity: 'person',
    params: { id: userId },
  });

  const personResult = await personResponse.json();

  if (!personResult.success) {
    return new Response(
      JSON.stringify({
        error: 'Person not found',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const person = personResult.data;

  // Step 3: Enrich with AI insights (non-blocking)
  ctx.waitUntil(
    env.PERSONQL.enrich({
      type: 'insights',
      person: userId,
    })
  );

  // Step 4: Cache the result
  ctx.waitUntil(
    env.PERSONQL.cache({
      operation: 'set',
      key: `person:${userId}`,
      value: person,
      ttl: 300, // 5 minutes
    })
  );

  return new Response(
    JSON.stringify({
      example: 'Full Workflow (Database Hit)',
      person,
      source: 'database',
      note: 'Person cached for 5 minutes, AI enrichment running in background',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
