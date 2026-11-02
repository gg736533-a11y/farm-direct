import apiClient from './client';

export const traceabilityApi = {
  getTraceability: async (productId) => {
    return apiClient.get(`/traceability/${productId}`);
  }
};

export default traceabilityApi;
