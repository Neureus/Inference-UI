/**
 * Tool Registry - Manages tool definitions and execution
 */

import type { ToolDefinition } from '../types';

/**
 * Global tool registry
 */
class ToolRegistryClass {
  private tools = new Map<string, ToolDefinition>();

  /**
   * Register a tool
   */
  register<TArgs = Record<string, unknown>, TResult = unknown>(
    tool: ToolDefinition<TArgs, TResult>
  ): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool as ToolDefinition);
  }

  /**
   * Register multiple tools
   */
  registerAll(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): void {
    this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool definitions for API (without execute/render functions)
   */
  getDefinitions(): Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }> {
    return this.getAll().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: (tool.parameters as any)?.shape || {},
    }));
  }

  /**
   * Execute a tool by name
   */
  async execute<TResult = unknown>(name: string, args: unknown): Promise<TResult> {
    const tool = this.get(name);

    if (!tool) {
      throw new Error(`Tool "${name}" not found in registry`);
    }

    // Validate arguments with Zod schema
    const validatedArgs = tool.parameters.parse(args);

    // Execute tool
    return (await tool.execute(validatedArgs)) as TResult;
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
  }
}

/**
 * Singleton instance
 */
export const ToolRegistry = new ToolRegistryClass();

/**
 * Hook to access tool registry
 */
export function useToolRegistry(): ToolRegistryClass {
  return ToolRegistry;
}
