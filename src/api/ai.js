import apiClient from './client';

export const aiApi = {
  /**
   * Farmer-only: Generates customer-friendly product description using strictly supplied fields.
   */
  generateProductDescription: (payload) =>
    apiClient.post('/ai/product-description', payload),

  /**
   * Authenticated: Generates concise product summary for consumers.
   */
  generateProductSummary: (payload) =>
    apiClient.post('/ai/product-summary', payload),

  /**
   * Authenticated: Translates product text to target language (e.g. Tamil or Simple English).
   */
  translateContent: (payload) =>
    apiClient.post('/ai/translate', payload),

  /**
   * Authenticated: Simplifies product text for better readability.
   */
  simplifyContent: (payload) =>
    apiClient.post('/ai/simple-english', payload),

  /**
   * Interprets natural-language query and retrieves matching real PostgreSQL products.
   */
  smartShopping: (query) =>
    apiClient.post('/ai/smart-shopping', { query })
};

export default aiApi;
