/**
 * Local AI execution with TensorFlow Lite
 * Uses react-native-fast-tflite for on-device inference
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AITask, AIResult, LocalModel, ModelRegistry } from './types';

// TODO: Uncomment when react-native-fast-tflite is properly installed
// import { TensorflowModel } from 'react-native-fast-tflite';

class LocalAIEngine {
  private models: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize local AI engine
   * Downloads models if needed, loads into memory
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Check if models are cached
      const cachedModels = await this.getCachedModels();

      // Load models
      await this.loadModel('textClassification', cachedModels.textClassification);
      await this.loadModel('formValidation', cachedModels.formValidation);
      await this.loadModel('autocomplete', cachedModels.autocomplete);
      await this.loadModel('accessibility', cachedModels.accessibility);

      this.initialized = true;
      console.log('[LocalAI] Initialized with', this.models.size, 'models');
    } catch (error) {
      console.error('[LocalAI] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute AI task locally
   */
  async execute(task: AITask): Promise<AIResult> {
    const startTime = Date.now();

    if (!this.initialized) {
      throw new Error('Local AI engine not initialized');
    }

    try {
      let output: unknown;
      let modelUsed = 'unknown';

      switch (task.type) {
        case 'text_classification':
        case 'sentiment_analysis':
        case 'intent_detection':
          output = await this.runTextClassification(task.input as string);
          modelUsed = 'textClassification';
          break;

        case 'form_validation':
          output = await this.runFormValidation(task.input as Record<string, unknown>);
          modelUsed = 'formValidation';
          break;

        case 'autocomplete':
          output = await this.runAutocomplete(task.input as string);
          modelUsed = 'autocomplete';
          break;

        case 'accessibility_check':
          output = await this.runAccessibilityCheck(task.input as Record<string, unknown>);
          modelUsed = 'accessibility';
          break;

        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }

      const latency = Date.now() - startTime;

      return {
        output,
        confidence: 0.85, // TODO: Extract from model output
        executedAt: 'local',
        latency,
        modelUsed,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('[LocalAI] Execution error:', error);

      return {
        output: null,
        executedAt: 'fallback',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Run text classification
   */
  private async runTextClassification(text: string): Promise<{
    label: string;
    confidence: number;
  }> {
    const model = this.models.get('textClassification');
    if (!model) {
      throw new Error('Text classification model not loaded');
    }

    // Preprocess text to input tensor
    const inputTensor = this.preprocessText(text);

    // Run inference
    const output = await model.run([inputTensor]);

    // Postprocess output
    const result = this.postprocessClassification(output);

    return result;
  }

  /**
   * Run form validation
   */
  private async runFormValidation(
    data: Record<string, unknown>
  ): Promise<Record<string, { valid: boolean; message?: string }>> {
    const model = this.models.get('formValidation');
    if (!model) {
      throw new Error('Form validation model not loaded');
    }

    // TODO: Implement form validation inference
    // For now, return basic validation
    const results: Record<string, { valid: boolean; message?: string }> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.length > 0) {
        results[key] = { valid: true };
      } else {
        results[key] = { valid: false, message: 'Field is required' };
      }
    }

    return results;
  }

  /**
   * Run autocomplete
   */
  private async runAutocomplete(_prefix: string): Promise<string[]> {
    const model = this.models.get('autocomplete');
    if (!model) {
      throw new Error('Autocomplete model not loaded');
    }

    // TODO: Implement autocomplete inference
    // For now, return empty suggestions
    return [];
  }

  /**
   * Run accessibility check
   */
  private async runAccessibilityCheck(
    _component: Record<string, unknown>
  ): Promise<{
    score: number;
    issues: Array<{ type: string; severity: string; message: string }>;
  }> {
    const model = this.models.get('accessibility');
    if (!model) {
      throw new Error('Accessibility model not loaded');
    }

    // TODO: Implement accessibility check inference
    // For now, return basic check
    return {
      score: 95,
      issues: [],
    };
  }

  /**
   * Load model from cache or download
   */
  private async loadModel(name: string, modelInfo?: LocalModel): Promise<void> {
    try {
      if (!modelInfo) {
        console.warn(`[LocalAI] Model ${name} not cached, skipping load`);
        return;
      }

      // Load model using react-native-fast-tflite
      // TODO: Import TensorflowModel from 'react-native-fast-tflite'
      // const model = await TensorflowModel.loadFromFile(modelInfo.path);
      // this.models.set(name, model);

      console.log(`[LocalAI] Model loading placeholder: ${name} (${modelInfo.size} bytes)`);
    } catch (error) {
      console.error(`[LocalAI] Failed to load model ${name}:`, error);
      // Continue without this model
    }
  }

  /**
   * Get cached models from AsyncStorage
   */
  private async getCachedModels(): Promise<Partial<ModelRegistry>> {
    try {
      const cached = await AsyncStorage.getItem('@liquid-ui/models');
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('[LocalAI] Failed to read cached models:', error);
      return {};
    }
  }

  /**
   * Preprocess text to input tensor
   */
  private preprocessText(text: string): Float32Array {
    // TODO: Implement proper tokenization and encoding
    // For now, return dummy tensor
    const maxLength = 128;
    const encoded = text
      .split('')
      .slice(0, maxLength)
      .map((char) => char.charCodeAt(0) % 256);

    // Pad to maxLength
    while (encoded.length < maxLength) {
      encoded.push(0);
    }

    return new Float32Array(encoded);
  }

  /**
   * Postprocess classification output
   */
  private postprocessClassification(_output: unknown): {
    label: string;
    confidence: number;
  } {
    // TODO: Implement proper postprocessing
    // For now, return dummy result
    return {
      label: 'neutral',
      confidence: 0.85,
    };
  }

  /**
   * Get engine statistics
   */
  getStats(): {
    initialized: boolean;
    modelsLoaded: number;
    availableModels: string[];
  } {
    return {
      initialized: this.initialized,
      modelsLoaded: this.models.size,
      availableModels: Array.from(this.models.keys()),
    };
  }

  /**
   * Cleanup and release resources
   */
  async dispose(): Promise<void> {
    for (const [name] of this.models) {
      try {
        // TODO: Implement proper model disposal when TensorflowModel is available
        console.log(`[LocalAI] Disposed model: ${name}`);
      } catch (error) {
        console.error(`[LocalAI] Failed to dispose model ${name}:`, error);
      }
    }

    this.models.clear();
    this.initialized = false;
  }
}

// Singleton instance
let instance: LocalAIEngine | null = null;

export async function initializeLocalAI(): Promise<LocalAIEngine> {
  if (!instance) {
    instance = new LocalAIEngine();
    await instance.initialize();
  }
  return instance;
}

export function getLocalAI(): LocalAIEngine | null {
  return instance;
}

export { LocalAIEngine };
