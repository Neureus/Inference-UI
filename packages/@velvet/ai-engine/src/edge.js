/**
 * Edge AI execution with Cloudflare Workers AI
 * Executes advanced models at the edge via Cloudflare's GPU infrastructure
 */
class EdgeAIEngine {
    constructor(config) {
        this.config = config;
    }
    /**
     * Execute AI task on Cloudflare Workers AI
     */
    async execute(task) {
        const startTime = Date.now();
        try {
            const response = await this.callWorkersAI(task);
            const latency = Date.now() - startTime;
            return {
                output: response.output,
                confidence: response.confidence,
                executedAt: 'edge',
                latency,
                modelUsed: response.model,
            };
        }
        catch (error) {
            const latency = Date.now() - startTime;
            console.error('[EdgeAI] Execution error:', error);
            return {
                output: null,
                executedAt: 'fallback',
                latency,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Call Cloudflare Workers AI API
     */
    async callWorkersAI(task) {
        const model = this.selectModel(task.type);
        const payload = this.preparePayload(task, model);
        const response = await fetch(`${this.config.endpoint}/ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
            },
            body: JSON.stringify({
                task: task.type,
                model,
                input: payload,
            }),
        });
        if (!response.ok) {
            throw new Error(`Workers AI request failed: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    }
    /**
     * Select appropriate Cloudflare Workers AI model
     */
    selectModel(taskType) {
        const modelMap = {
            text_classification: '@cf/huggingface/distilbert-sst-2-int8',
            sentiment_analysis: '@cf/huggingface/distilbert-sst-2-int8',
            intent_detection: '@cf/meta/llama-3-8b-instruct',
            entity_extraction: '@cf/meta/llama-3-8b-instruct',
            form_validation: '@cf/meta/llama-3-8b-instruct',
            autocomplete: '@cf/meta/llama-3-8b-instruct',
        };
        return modelMap[taskType] || '@cf/meta/llama-3-8b-instruct';
    }
    /**
     * Prepare payload for Workers AI
     */
    preparePayload(task, model) {
        if (model.includes('llama') || model.includes('mistral')) {
            // LLM models need messages format
            return {
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt(task.type),
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(task.input),
                    },
                ],
            };
        }
        else if (model.includes('distilbert')) {
            // Classification models need text input
            return {
                text: typeof task.input === 'string' ? task.input : JSON.stringify(task.input),
            };
        }
        return task.input;
    }
    /**
     * Get system prompt for LLM tasks
     */
    getSystemPrompt(taskType) {
        const prompts = {
            intent_detection: 'You are an AI that detects user intent from UI interactions. Classify the intent as one of: navigation, search, create, edit, delete, view, help, settings, or other.',
            entity_extraction: 'You are an AI that extracts entities from user input. Identify names, dates, locations, and other key information.',
            form_validation: 'You are an AI that validates form data. Check if the data is valid and provide specific error messages if not.',
            autocomplete: 'You are an AI that provides autocomplete suggestions. Given a prefix, suggest likely completions.',
        };
        return prompts[taskType] || 'You are a helpful AI assistant.';
    }
}
// Module-level instance
let instance = null;
export function initializeEdgeAI(config) {
    if (!instance) {
        instance = new EdgeAIEngine(config);
    }
    return instance;
}
export function getEdgeAI() {
    return instance;
}
export { EdgeAIEngine };
//# sourceMappingURL=edge.js.map