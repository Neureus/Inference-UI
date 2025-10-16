/**
 * Stream Object Worker - Handles streaming object generation with schema validation
 */

import type { Env } from '../types';

/**
 * Object generation request
 */
interface ObjectRequest {
  prompt: string;
  schema: Record<string, unknown>;
  objectId?: string;
  model?: string;
  temperature?: number;
}

/**
 * Stream object endpoint
 */
export async function handleStreamObject(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as ObjectRequest;

    if (!body.prompt) {
      return new Response(JSON.stringify({ error: 'Invalid request: prompt required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.schema) {
      return new Response(JSON.stringify({ error: 'Invalid request: schema required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create streaming response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Start streaming in background
    (async () => {
      try {
        // Send message-start event
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'message-start',
              message: { metadata: { objectId: body.objectId } },
            })}\n\n`
          )
        );

        // Create system prompt with schema
        const systemPrompt = `You are a JSON generator. Generate a valid JSON object that matches the following schema:

${JSON.stringify(body.schema, null, 2)}

IMPORTANT:
- Return ONLY the JSON object, no explanations or markdown
- The JSON must be valid and match the schema exactly
- Do not wrap the JSON in code blocks
- Stream the JSON progressively as you generate it`;

        // Prepare messages for AI
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: body.prompt },
        ];

        // Stream from Workers AI
        const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
          messages,
          stream: true,
        });

        // Stream tokens
        if (aiResponse && typeof aiResponse === 'object' && 'readable' in aiResponse) {
          const aiStream = aiResponse as ReadableStream;
          const aiReader = aiStream.getReader();

          while (true) {
            const { done, value } = await aiReader.read();
            if (done) break;

            // Parse AI response chunk
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter((line) => line.trim());

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  // Extract text from response
                  let text = parsed.response || parsed.content || '';

                  // Remove markdown code blocks if present
                  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

                  if (text) {
                    // Send message-part event
                    await writer.write(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: 'message-part',
                          part: { type: 'text', text },
                        })}\n\n`
                      )
                    );
                  }
                } catch {
                  // Ignore JSON parse errors
                }
              }
            }
          }
        }

        // Send message-end event
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'message-end',
              message: {
                id: crypto.randomUUID(),
                role: 'assistant',
                parts: [],
                createdAt: new Date().toISOString(),
              },
            })}\n\n`
          )
        );

        // Send done event
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch (error) {
        // Send error event
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: { message: error instanceof Error ? error.message : String(error) },
            })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    // Return streaming response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
