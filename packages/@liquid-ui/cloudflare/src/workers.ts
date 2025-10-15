/**
 * Cloudflare Workers utilities
 */

export function createResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function createErrorResponse(error: string, status = 500): Response {
  return createResponse({ error }, status);
}
