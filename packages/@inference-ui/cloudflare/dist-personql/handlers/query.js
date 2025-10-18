/**
 * PersonQL GraphQL Query Handler
 * Handles GraphQL queries via service binding
 */
/**
 * Execute GraphQL query
 */
export async function handleQuery(request, env, ctx) {
    const startTime = Date.now();
    try {
        // Validate request
        if (!request.query || typeof request.query !== 'string') {
            return createErrorResponse('Invalid query: query string required', 400);
        }
        // Check cache first
        const cacheKey = `query:${hashQuery(request.query, request.variables)}`;
        const cached = await env.KV.get(cacheKey, 'json');
        if (cached) {
            const response = {
                data: cached,
                metadata: {
                    executionTime: Date.now() - startTime,
                    cacheHit: true,
                    source: 'cache',
                },
            };
            return new Response(JSON.stringify(response), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // Execute query against D1
        const result = await executeGraphQLQuery(request, env);
        // Cache successful results
        if (result.data && !result.errors) {
            ctx.waitUntil(env.KV.put(cacheKey, JSON.stringify(result.data), {
                expirationTtl: 300, // 5 minutes
            }));
        }
        // Track analytics
        ctx.waitUntil(Promise.resolve(env.ANALYTICS.writeDataPoint({
            indexes: [request.context?.userId || 'anonymous', 'query'],
            blobs: [request.operationName || 'unnamed'],
            doubles: [Date.now(), Date.now() - startTime],
        })));
        const response = {
            ...result,
            metadata: {
                executionTime: Date.now() - startTime,
                cacheHit: false,
                source: 'database',
            },
        };
        return new Response(JSON.stringify(response), {
            status: result.errors ? 400 : 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    catch (error) {
        console.error('Query error:', error);
        const response = {
            errors: [
                {
                    message: error instanceof Error ? error.message : 'Internal server error',
                    extensions: { code: 'INTERNAL_ERROR' },
                },
            ],
            metadata: {
                executionTime: Date.now() - startTime,
            },
        };
        return new Response(JSON.stringify(response), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
/**
 * Execute GraphQL query against D1 database
 */
async function executeGraphQLQuery(request, env) {
    // Simple query parser (in production, use a proper GraphQL executor)
    const query = request.query.trim();
    // Handle person query
    if (query.includes('person(') && query.includes('id:')) {
        const idMatch = query.match(/id:\s*"([^"]+)"/);
        if (idMatch) {
            const person = await env.DB.prepare('SELECT * FROM persons WHERE id = ?')
                .bind(idMatch[1])
                .first();
            if (person) {
                return { data: { person } };
            }
            else {
                return {
                    errors: [{ message: `Person with id ${idMatch[1]} not found` }],
                };
            }
        }
    }
    // Handle persons list query
    if (query.includes('persons')) {
        const limitMatch = query.match(/limit:\s*(\d+)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 10;
        const { results } = await env.DB.prepare('SELECT * FROM persons LIMIT ?')
            .bind(limit)
            .all();
        return { data: { persons: results } };
    }
    // Handle person creation mutation
    if (query.includes('createPerson')) {
        const vars = request.variables || {};
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await env.DB.prepare(`INSERT INTO persons (id, email, name, phone, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .bind(id, vars.email || null, vars.name || null, vars.phone || null, JSON.stringify(vars.metadata || {}), now, now)
            .run();
        const person = await env.DB.prepare('SELECT * FROM persons WHERE id = ?')
            .bind(id)
            .first();
        return { data: { createPerson: person } };
    }
    return {
        errors: [{ message: 'Query not supported or invalid syntax' }],
    };
}
/**
 * Hash query for caching
 */
function hashQuery(query, variables) {
    const normalized = query.replace(/\s+/g, ' ').trim();
    const input = normalized + JSON.stringify(variables || {});
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}
/**
 * Create error response
 */
function createErrorResponse(message, status) {
    return new Response(JSON.stringify({
        errors: [{ message }],
    }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
//# sourceMappingURL=query.js.map