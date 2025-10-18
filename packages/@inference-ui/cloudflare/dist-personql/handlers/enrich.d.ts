/**
 * PersonQL AI Enrichment Handler
 * Uses Workers AI to enrich person data
 */
import type { PersonQLEnv, PersonQLAIRequest } from '../types';
/**
 * Handle AI enrichment request
 */
export declare function handleEnrich(request: PersonQLAIRequest, env: PersonQLEnv, ctx: ExecutionContext): Promise<Response>;
//# sourceMappingURL=enrich.d.ts.map