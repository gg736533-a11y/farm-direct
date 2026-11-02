import apiClient from './client';

export const favoritesApi = {
  /**
   * Get all favorites for authenticated consumer
   */
  getFavorites: async () => {
    return apiClient.get('/favorites');
  },

  /**
   * Add a product to favorites
   */
  addFavorite: async (productId) => {
    return apiClient.post(`/favorites/${productId}`);
  },

  /**
   * Remove a product from favorites
   */
  removeFavorite: async (productId) => {
    return apiClient.delete(`/favorites/${productId}`);
  }
};

export default favoritesApi;
