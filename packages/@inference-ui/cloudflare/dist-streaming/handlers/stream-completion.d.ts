/**
 * Stream Completion Handler
 * Handles streaming text completions with Workers AI
 */
import type { StreamingEnv } from '../types';
/**
 * Stream completion endpoint
 * POST /completion
 */
export declare function handleStreamCompletion(request: Request, env: StreamingEnv, ctx: ExecutionContext): Promise<Response>;
//# sourceMappingURL=stream-completion.d.ts.map