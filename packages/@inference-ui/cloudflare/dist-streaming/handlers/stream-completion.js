/**
 * Stream Completion Handler
 * Handles streaming text completions with Workers AI
 */
import { AI_MODELS } from '../types';
/**
 * Stream completion endpoint
 * POST /completion
 */
export async function handleStreamCompletion(request, env, ctx) {
    try {
        const body = (await request.json());
        if (!body.prompt) {
            return new Response(JSON.stringify({ error: 'Invalid request: prompt required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // Create streaming response
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        // Start streaming in background
        ctx.waitUntil((async () => {
            try {
                // Send message-start event
                await writer.write(encoder.encode(`data: ${JSON.stringify({
                    type: 'message-start',
                    message: { metadata: {} },
                })}\n\n`));
                // Prepare messages for AI
                const messages = [];
                if (body.systemPrompt) {
                    messages.push({ role: 'system', content: body.systemPrompt });
                }
                messages.push({ role: 'user', content: body.prompt });
                // Select model
                const model = body.model || AI_MODELS.LLAMA_3_1_8B;
                // Stream from Workers AI
                const aiResponse = await env.AI.run(model, {
                    messages,
                    stream: true,
                    temperature: body.temperature || 0.7,
                    max_tokens: body.maxTokens || 1024,
                });
                // Stream tokens
                if (aiResponse && typeof aiResponse === 'object' && 'readable' in aiResponse) {
                    const aiStream = aiResponse;
                    const aiReader = aiStream.getReader();
                    while (true) {
                        const { done, value } = await aiReader.read();
                        if (done)
                            break;
                        // Parse AI response chunk
                        const chunk = new TextDecoder().decode(value);
                        const lines = chunk.split('\n').filter((line) => line.trim());
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data === '[DONE]')
                                    continue;
                                try {
                                    const parsed = JSON.parse(data);
                                    // Extract text from response
                                    const text = parsed.response || parsed.content || '';
                                    if (text) {
                                        // Send message-part event
                                        await writer.write(encoder.encode(`data: ${JSON.stringify({
                                            type: 'message-part',
                                            part: { type: 'text', text },
                                        })}\n\n`));
                                    }
                                }
                                catch {
                                    // Ignore JSON parse errors
                                }
                            }
                        }
                    }
                }
                // Send message-end event
                await writer.write(encoder.encode(`data: ${JSON.stringify({
                    type: 'message-end',
                    message: {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        parts: [],
                        createdAt: new Date().toISOString(),
                    },
                })}\n\n`));
                // Send done event
                await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
            }
            catch (error) {
                console.error('Stream completion error:', error);
                // Send error event
                await writer.write(encoder.encode(`data: ${JSON.stringify({
                    type: 'error',
                    error: { message: error instanceof Error ? error.message : String(error) },
                })}\n\n`));
            }
            finally {
                await writer.close();
            }
        })());
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
    }
    catch (error) {
        console.error('Stream completion handler error:', error);
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
//# sourceMappingURL=stream-completion.js.map