/**
 * PersonQL Service Binding Types
 *
 * These types define the interface for the PersonQL service binding API.
 * Other workers can use these types to interact with PersonQL via service bindings.
 */
/**
 * Type guard to check if an object implements PersonQLService
 */
export function isPersonQLService(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'query' in obj &&
        'direct' in obj &&
        'enrich' in obj &&
        'cache' in obj &&
        'health' in obj);
}
//# sourceMappingURL=index.js.map