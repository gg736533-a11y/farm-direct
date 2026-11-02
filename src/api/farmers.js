import apiClient from './client';

export const farmersApi = {
  getPublicFarmers: async () => {
    return apiClient.get('/farmers');
  },

  getFarmerById: async (id) => {
    return apiClient.get(`/farmers/${id}`);
  },

  getMyFarmerProfile: async () => {
    return apiClient.get('/farmers/me');
  },

  getDashboardStats: async () => {
    return apiClient.get('/farmers/me/dashboard');
  }
};

export default farmersApi;
