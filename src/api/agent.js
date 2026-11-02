import apiClient from './client';

export const agentApi = {
  /**
   * Smart Shopping Agent
   * Understands goal, creates plan, selects approved tools, queries PostgreSQL products,
   * inspects freshness, and calculates combination pricing under budget.
   *
   * @param {string | { message: string, query?: string }} payload
   */
  smartShopping: (payload) => {
    const body = typeof payload === 'string' ? { message: payload } : payload;
    return apiClient.post('/agent/smart-shopping', body);
  },

  /**
   * Farmer Insight Agent
   * Farmer role protected. Audits catalog for low stock, expiry warnings, and missing data.
   *
   * @param {string | { message?: string }} [payload]
   */
  farmerInsights: (payload = {}) => {
    const body = typeof payload === 'string' ? { message: payload } : payload;
    return apiClient.post('/agent/farmer-insights', body);
  }
};

export default agentApi;
