/**
 * PersonQL Service Binding Worker
 *
 * This worker exposes PersonQL functionality via service bindings,
 * allowing other Cloudflare Workers to access PersonQL directly
 * without HTTP calls (0ms latency, no request costs).
 *
 * @example
 * // From another worker:
 * const response = await env.PERSONQL.query({
 *   query: 'query { person(id: "123") { id name email } }'
 * });
 */
import type { PersonQLEnv, PersonQLQueryRequest, PersonQLDirectRequest, PersonQLAIRequest, PersonQLCacheRequest } from './types';
/**
 * Service Binding RPC Interface
 *
 * These methods are directly callable via service bindings
 */
declare const _default: {
    /**
     * Main fetch handler (for HTTP access if needed)
     */
    fetch(request: Request, env: PersonQLEnv, ctx: ExecutionContext): Promise<Response>;
    /**
     * Service Binding RPC Methods
     *
     * These methods are callable directly from other workers via service bindings
     */
    /**
     * Execute GraphQL query
     */
    query(request: PersonQLQueryRequest, env: PersonQLEnv, ctx: ExecutionContext): Promise<Response>;
    /**
     * Direct database access
     */
    direct(request: PersonQLDirectRequest, env: PersonQLEnv, ctx: ExecutionContext): Promise<Response>;
    /**
     * AI enrichment
     */
    enrich(request: PersonQLAIRequest, env: PersonQLEnv, ctx: ExecutionContext): Promise<Response>;
    /**
     * Cache operations
     */
    cache(request: PersonQLCacheRequest, env: PersonQLEnv): Promise<Response>;
    /**
     * Health check
     */
    health(): Promise<Response>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map