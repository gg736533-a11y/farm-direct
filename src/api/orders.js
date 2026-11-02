import apiClient from './client';

export const ordersApi = {
  /**
   * Create new consumer order with server-side pricing and stock verification
   */
  createOrder: async (orderData) => {
    return apiClient.post('/orders', orderData);
  },

  /**
   * Get all orders for authenticated consumer
   */
  getConsumerOrders: async () => {
    return apiClient.get('/orders');
  },

  /**
   * Get single consumer order details
   */
  getConsumerOrderById: async (id) => {
    return apiClient.get(`/orders/${id}`);
  },

  /**
   * Get all orders containing products for authenticated farmer
   */
  getFarmerOrders: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return apiClient.get(`/farmers/me/orders${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get single farmer-scoped order details
   */
  getFarmerOrderById: async (id) => {
    return apiClient.get(`/farmers/me/orders/${id}`);
  },

  /**
   * Update order status by farmer
   */
  updateFarmerOrderStatus: async (id, status) => {
    return apiClient.patch(`/farmers/me/orders/${id}/status`, { status });
  }
};

export default ordersApi;
