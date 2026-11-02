import apiClient from './client';

export const usersApi = {
  getProfile: async () => {
    return apiClient.get('/users/me');
  },

  updateProfile: async (data) => {
    return apiClient.patch('/users/me', data);
  },

  getConsumerMe: async () => {
    return apiClient.get('/consumers/me');
  }
};

export default usersApi;
