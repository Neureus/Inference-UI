/**
 * Stream Chat Worker - Handles streaming chat responses
 */

import type { Env } from '../types';

/**
 * Message interface (simplified for API)
 */
interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  parts: Array<{
    type: string;
    text?: string;
    [key: string]: unknown;
  }>;
  createdAt: Date | string;
  metadata?: Record<string, unknown>;
}

/**
 * Chat request
 */
interface ChatRequest {
  messages: UIMessage[];
  chatId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
}

/**
 * Stream chat endpoint
 */
export async function handleStreamChat(request: Request, env: Env): Promise<Response> {
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
            .filter((part: { type: string; text?: string }) => part.type === 'text')
            .map((part: { type: string; text?: string }) => part.text || '')
            .join('\n');

          return { role: msg.role, content };
        });

        // Stream from Workers AI
        const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct' as any, {
          messages: aiMessages,
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
                  const text = parsed.response || parsed.content || '';

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
