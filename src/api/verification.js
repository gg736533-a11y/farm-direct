import apiClient from './client.js';

export const verificationApi = {
  /**
   * Run verification & anomaly analysis on a single product owned by the farmer
   */
  analyzeProduct: (productId) =>
    apiClient.post(`/verification/analyze-product/${productId}`),

  /**
   * Get freshly calculated analysis for a single product
   */
  getProductAnalysis: (productId) =>
    apiClient.get(`/verification/product/${productId}`),

  /**
   * Run verification & anomaly analysis on all products owned by the authenticated farmer
   */
  analyzeFarmer: () =>
    apiClient.post('/verification/analyze-farmer')
};

export default verificationApi;
