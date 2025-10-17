/**
 * AI-Powered Components
 * Production-ready React components with built-in AI capabilities
 */

import { aiFormStyles } from './AIForm';
import { aiInputStyles } from './AIInput';
import { chatInterfaceStyles } from './ChatInterface';
import { searchBoxStyles } from './SearchBox';

export { AIForm } from './AIForm';
export type { AIFormProps, AIFormField } from './AIForm';

export { AIInput } from './AIInput';
export type { AIInputProps } from './AIInput';

export { ChatInterface } from './ChatInterface';
export type { ChatInterfaceProps } from './ChatInterface';

export { SearchBox } from './SearchBox';
export type { SearchBoxProps, SearchResult } from './SearchBox';

/**
 * Individual style exports
 */
export { aiFormStyles, aiInputStyles, chatInterfaceStyles, searchBoxStyles };

/**
 * Combined styles export
 * Import all component styles at once
 */
export const allComponentStyles = `
  ${aiFormStyles}
  ${aiInputStyles}
  ${chatInterfaceStyles}
  ${searchBoxStyles}
`;
