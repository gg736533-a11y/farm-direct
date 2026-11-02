import apiClient from './client';

export const productsApi = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category.toString().toUpperCase() !== 'ALL') {
      query.set('category', params.category.toString().toUpperCase());
    }
    if (params.search) query.set('search', params.search);
    if (params.farmerId) query.set('farmerId', params.farmerId);
    if (params.status) query.set('status', params.status);
    if (params.priceRange && params.priceRange !== 'all') query.set('priceRange', params.priceRange);
    if (params.location && params.location !== 'all') query.set('location', params.location);
    if (params.freshness && params.freshness !== 'all') query.set('freshness', params.freshness);
    if (params.verifiedOnly) query.set('verifiedOnly', 'true');
    if (params.inStockOnly) query.set('inStockOnly', 'true');
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.limit) query.set('limit', params.limit);
    if (params.page) query.set('page', params.page);

    const qs = query.toString();
    return apiClient.get(`/products${qs ? `?${qs}` : ''}`);
  },

  getProductById: async (id) => {
    return apiClient.get(`/products/${id}`);
  },

  getFarmerProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.sort) query.set('sort', params.sort);

    const qs = query.toString();
    return apiClient.get(`/farmers/me/products${qs ? `?${qs}` : ''}`);
  },

  createProduct: async (productData) => {
    return apiClient.post('/products', productData);
  },

  updateProduct: async (id, productData) => {
    return apiClient.patch(`/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    return apiClient.delete(`/products/${id}`);
  }
};

export default productsApi;
