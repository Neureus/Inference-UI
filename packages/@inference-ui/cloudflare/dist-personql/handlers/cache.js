/**
 * PersonQL Cache Handler
 * Manages KV cache operations
 */
/**
 * Handle cache operation
 */
export async function handleCache(request, env) {
    try {
        // Validate request
        if (!request.operation || !request.key) {
            return createErrorResponse('Invalid request: operation and key required', 400);
        }
        let result;
        switch (request.operation) {
            case 'get':
                result = await handleGet(request.key, env);
                break;
            case 'set':
                result = await handleSet(request.key, request.value, request.ttl, env);
                break;
            case 'delete':
                result = await handleDelete(request.key, env);
                break;
            case 'clear':
                result = await handleClear(request.key, env);
                break;
            default:
                return createErrorResponse(`Unsupported operation: ${request.operation}`, 400);
        }
        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    catch (error) {
        console.error('Cache error:', error);
        return createErrorResponse(error instanceof Error ? error.message : 'Internal server error', 500);
    }
}
/**
 * Get value from cache
 */
async function handleGet(key, env) {
    const value = await env.KV.get(key, 'json');
    return value;
}
/**
 * Set value in cache
 */
async function handleSet(key, value, ttl, env) {
    if (value === undefined) {
        throw new Error('Value required for set operation');
    }
    const options = ttl ? { expirationTtl: ttl } : undefined;
    await env.KV.put(key, JSON.stringify(value), options);
    return { cached: true };
}
/**
 * Delete value from cache
 */
async function handleDelete(key, env) {
    await env.KV.delete(key);
    return { deleted: true };
}
/**
 * Clear cache by prefix
 */
async function handleClear(prefix, env) {
    // Note: KV doesn't support bulk delete by prefix natively
    // This is a placeholder - in production, you'd need to track keys or use a different approach
    const list = await env.KV.list({ prefix });
    let cleared = 0;
    for (const key of list.keys) {
        await env.KV.delete(key.name);
        cleared++;
    }
    return { cleared };
}
/**
 * Create error response
 */
function createErrorResponse(message, status) {
    return new Response(JSON.stringify({ success: false, error: { message } }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
//# sourceMappingURL=cache.js.map