/**
 * Stream Chat Handler
 * Handles streaming chat responses with Workers AI
 */
import type { StreamingEnv } from '../types';
/**
 * Stream chat endpoint
 * POST /chat
 */
export declare function handleStreamChat(request: Request, env: StreamingEnv, ctx: ExecutionContext): Promise<Response>;
//# sourceMappingURL=stream-chat.d.ts.map