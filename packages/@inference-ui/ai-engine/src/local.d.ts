/**
 * Local AI execution with TensorFlow Lite
 * Uses react-native-fast-tflite for on-device inference
 */
import type { AITask, AIResult } from './types';
declare class LocalAIEngine {
    private models;
    private initialized;
    /**
     * Initialize local AI engine
     * Downloads models if needed, loads into memory
     */
    initialize(): Promise<void>;
    /**
     * Execute AI task locally
     */
    execute(task: AITask): Promise<AIResult>;
    /**
     * Run text classification
     */
    private runTextClassification;
    /**
     * Run form validation
     */
    private runFormValidation;
    /**
     * Run autocomplete
     */
    private runAutocomplete;
    /**
     * Run accessibility check
     */
    private runAccessibilityCheck;
    /**
     * Load model from cache or download
     */
    private loadModel;
    /**
     * Get cached models from AsyncStorage
     */
    private getCachedModels;
    /**
     * Preprocess text to input tensor
     */
    private preprocessText;
    /**
     * Postprocess classification output
     */
    private postprocessClassification;
    /**
     * Get engine statistics
     */
    getStats(): {
        initialized: boolean;
        modelsLoaded: number;
        availableModels: string[];
    };
    /**
     * Cleanup and release resources
     */
    dispose(): Promise<void>;
}
export declare function initializeLocalAI(): Promise<LocalAIEngine>;
export declare function getLocalAI(): LocalAIEngine | null;
export { LocalAIEngine };
//# sourceMappingURL=local.d.ts.map