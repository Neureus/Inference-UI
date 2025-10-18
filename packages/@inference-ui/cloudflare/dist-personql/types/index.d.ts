/**
 * PersonQL Service Binding Types
 *
 * These types define the interface for the PersonQL service binding API.
 * Other workers can use these types to interact with PersonQL via service bindings.
 */
/**
 * PersonQL Environment Bindings
 */
export interface PersonQLEnv {
    DB: D1Database;
    KV: KVNamespace;
    STORAGE: R2Bucket;
    AI: Ai;
    ANALYTICS: AnalyticsEngineDataset;
    ENVIRONMENT?: string;
    API_VERSION?: string;
}
/**
 * PersonQL Query Request
 */
export interface PersonQLQueryRequest {
    /**
     * GraphQL query string
     */
    query: string;
    /**
     * Query variables
     */
    variables?: Record<string, unknown>;
    /**
     * Operation name (for multi-operation queries)
     */
    operationName?: string;
    /**
     * User context for authentication/authorization
     */
    context?: {
        userId?: string;
        tenantId?: string;
        permissions?: string[];
        metadata?: Record<string, unknown>;
    };
}
/**
 * PersonQL Query Response
 */
export interface PersonQLQueryResponse {
    /**
     * Query result data
     */
    data?: unknown;
    /**
     * GraphQL errors (if any)
     */
    errors?: Array<{
        message: string;
        locations?: Array<{
            line: number;
            column: number;
        }>;
        path?: Array<string | number>;
        extensions?: Record<string, unknown>;
    }>;
    /**
     * Response metadata
     */
    metadata?: {
        executionTime?: number;
        cacheHit?: boolean;
        source?: 'database' | 'cache' | 'ai';
    };
}
/**
 * Person Data Structure
 */
export interface Person {
    id: string;
    email?: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
/**
 * PersonQL Direct Access Request
 * Bypasses GraphQL for direct data access
 */
export interface PersonQLDirectRequest {
    /**
     * Operation type
     */
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    /**
     * Entity type
     */
    entity: 'person' | 'organization' | 'relationship' | 'event';
    /**
     * Operation parameters
     */
    params: {
        id?: string;
        ids?: string[];
        filter?: Record<string, unknown>;
        limit?: number;
        offset?: number;
        data?: Record<string, unknown>;
    };
    /**
     * User context
     */
    context?: {
        userId?: string;
        tenantId?: string;
    };
}
/**
 * PersonQL Direct Access Response
 */
export interface PersonQLDirectResponse {
    /**
     * Operation success status
     */
    success: boolean;
    /**
     * Result data
     */
    data?: unknown | unknown[];
    /**
     * Error information (if failed)
     */
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    /**
     * Response metadata
     */
    metadata?: {
        count?: number;
        totalCount?: number;
        hasMore?: boolean;
        executionTime?: number;
    };
}
/**
 * PersonQL AI Enrichment Request
 */
export interface PersonQLAIRequest {
    /**
     * Enrichment type
     */
    type: 'profile' | 'insights' | 'recommendations' | 'classification';
    /**
     * Person ID or data
     */
    person: string | Partial<Person>;
    /**
     * Enrichment options
     */
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        includeConfidence?: boolean;
    };
}
/**
 * PersonQL AI Enrichment Response
 */
export interface PersonQLAIResponse {
    /**
     * Success status
     */
    success: boolean;
    /**
     * Enriched data
     */
    data?: {
        insights?: string[];
        recommendations?: string[];
        classification?: Record<string, number>;
        confidence?: number;
    };
    /**
     * Error information
     */
    error?: {
        message: string;
        code: string;
    };
}
/**
 * PersonQL Cache Request
 */
export interface PersonQLCacheRequest {
    /**
     * Cache operation
     */
    operation: 'get' | 'set' | 'delete' | 'clear';
    /**
     * Cache key
     */
    key: string;
    /**
     * Cache value (for set operation)
     */
    value?: unknown;
    /**
     * TTL in seconds (for set operation)
     */
    ttl?: number;
}
/**
 * PersonQL Service Binding Interface
 *
 * This is the main interface that other workers use to interact with PersonQL.
 * All methods return Response objects for compatibility with Cloudflare Workers.
 */
export interface PersonQLService {
    /**
     * Execute GraphQL query
     *
     * @param request - GraphQL query request
     * @returns Response with query results
     *
     * @example
     * ```typescript
     * const response = await env.PERSONQL.query({
     *   query: `query GetPerson($id: ID!) {
     *     person(id: $id) { id name email }
     *   }`,
     *   variables: { id: "123" }
     * });
     * const result = await response.json();
     * ```
     */
    query(request: PersonQLQueryRequest): Promise<Response>;
    /**
     * Direct data access (bypasses GraphQL)
     *
     * @param request - Direct access request
     * @returns Response with operation results
     *
     * @example
     * ```typescript
     * const response = await env.PERSONQL.direct({
     *   operation: 'get',
     *   entity: 'person',
     *   params: { id: "123" }
     * });
     * ```
     */
    direct(request: PersonQLDirectRequest): Promise<Response>;
    /**
     * AI-powered enrichment
     *
     * @param request - AI enrichment request
     * @returns Response with enriched data
     *
     * @example
     * ```typescript
     * const response = await env.PERSONQL.enrich({
     *   type: 'insights',
     *   person: "123",
     *   options: { model: '@cf/meta/llama-3.1-8b-instruct' }
     * });
     * ```
     */
    enrich(request: PersonQLAIRequest): Promise<Response>;
    /**
     * Cache operations
     *
     * @param request - Cache request
     * @returns Response with cache operation result
     *
     * @example
     * ```typescript
     * await env.PERSONQL.cache({
     *   operation: 'set',
     *   key: 'person:123',
     *   value: { id: "123", name: "John" },
     *   ttl: 300
     * });
     * ```
     */
    cache(request: PersonQLCacheRequest): Promise<Response>;
    /**
     * Health check
     *
     * @returns Response with health status
     */
    health(): Promise<Response>;
}
/**
 * Type guard to check if an object implements PersonQLService
 */
export declare function isPersonQLService(obj: unknown): obj is PersonQLService;
//# sourceMappingURL=index.d.ts.map