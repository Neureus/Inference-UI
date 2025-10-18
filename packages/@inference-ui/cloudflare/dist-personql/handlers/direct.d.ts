/**
 * PersonQL Direct Access Handler
 * Bypasses GraphQL for direct database operations
 */
import type { PersonQLEnv, PersonQLDirectRequest } from '../types';
/**
 * Handle direct data access request
 */
export declare function handleDirect(request: PersonQLDirectRequest, env: PersonQLEnv, ctx: ExecutionContext): Promise<Response>;
//# sourceMappingURL=direct.d.ts.map