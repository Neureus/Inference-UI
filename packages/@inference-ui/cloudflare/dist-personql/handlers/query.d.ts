/**
 * PersonQL GraphQL Query Handler
 * Handles GraphQL queries via service binding
 */
import type { PersonQLEnv, PersonQLQueryRequest } from '../types';
/**
 * Execute GraphQL query
 */
export declare function handleQuery(request: PersonQLQueryRequest, env: PersonQLEnv, ctx: ExecutionContext): Promise<Response>;
//# sourceMappingURL=query.d.ts.map