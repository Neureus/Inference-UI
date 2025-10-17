/**
 * Stream Chat Handler
 * Handles streaming chat responses with Workers AI
 */

import type { StreamingEnv, ChatRequest } from '../types';
import { AI_MODELS } from '../types';

/**
 * Stream chat endpoint
 * POST /chat
 */
export async function handleStreamChat(
  request: Request,
  env: StreamingEnv,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request: messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create streaming response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Start streaming in background
    ctx.waitUntil(
      (async () => {
        try {
          // Send message-start event
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'message-start',
                message: { role: 'assistant', parts: [], metadata: { chatId: body.chatId } },
              })}\n\n`
            )
          );

          // Convert messages to AI format
          const aiMessages = body.messages.map((msg) => {
            const content = msg.parts
              .filter((part) => part.type === 'text')
              .map((part) => (part as any).text || '')
              .join('\n');

            return { role: msg.role, content };
          });

          // Select model (default to Llama 3.1 8B)
          const model = body.model || AI_MODELS.LLAMA_3_1_8B;

          // Stream from Workers AI
          const aiResponse = await env.AI.run(model as any, {
            messages: aiMessages,
            stream: true,
            temperature: body.temperature || 0.7,
            max_tokens: body.maxTokens || 2048,
          });

          // Stream tokens
          if (aiResponse && typeof aiResponse === 'object' && 'readable' in aiResponse) {
            const aiStream = aiResponse as ReadableStream;
            const aiReader = aiStream.getReader();

            let fullResponse = '';

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
                    const text = parsed.response || parsed.content || '';

                    if (text) {
                      fullResponse += text;

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

            // Track usage in D1 (non-blocking)
            ctx.waitUntil(
              env.DB.prepare(
                `INSERT INTO events (id, user_id, type, data, timestamp)
                 VALUES (?, ?, ?, ?, ?)`
              )
                .bind(
                  crypto.randomUUID(),
                  'system', // TODO: Get actual user_id from auth
                  'chat_completion',
                  JSON.stringify({
                    model,
                    tokenCount: fullResponse.length / 4, // Rough estimate
                    messageCount: body.messages.length,
                  }),
                  Date.now()
                )
                .run()
                .catch((err) => console.error('Failed to track usage:', err))
            );
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
          console.error('Stream chat error:', error);
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
      })()
    );

    // Return streaming response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Stream chat handler error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
