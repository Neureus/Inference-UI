/**
 * Streaming Worker Type Definitions
 */
/**
 * AI model names
 */
export const AI_MODELS = {
    LLAMA_3_1_8B: '@cf/meta/llama-3.1-8b-instruct',
    LLAMA_3_8B: '@cf/meta/llama-3-8b-instruct',
    MISTRAL_7B: '@cf/mistral/mistral-7b-instruct-v0.1',
};
/**
 * Streaming response helper
 */
export class StreamingResponse {
    writer;
    encoder = new TextEncoder();
    constructor(writer) {
        this.writer = writer;
    }
    /**
     * Write SSE event
     */
    async writeEvent(event) {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        await this.writer.write(this.encoder.encode(data));
    }
    /**
     * Close stream
     */
    async close() {
        await this.writer.close();
    }
}
//# sourceMappingURL=types.js.map