/**
 * Inference UI - Streaming Worker
 *
 * Dedicated worker for AI streaming responses with Workers AI.
 * Called via service binding from main API worker.
 *
 * Benefits:
 * - Independent scaling for AI workloads
 * - Isolated CPU/memory resources
 * - Reduced cold start times
 * - Optimized for long-running streams
 */
import type { StreamingEnv } from './types';
/**
 * Streaming Worker Entry Point
 */
declare const _default: {
    fetch(request: Request, env: StreamingEnv, ctx: ExecutionContext): Promise<Response>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map