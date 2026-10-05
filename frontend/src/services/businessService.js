import api from './api';

export const businessService = {
  getProfile: () => api.get('/api/business/profile'),
  updateProfile: (data) => api.put('/api/business/profile', data),
  uploadLogo: (formData) => api.patch('/api/business/logo', formData),
  getCategories: () => api.get('/api/business/categories'),
  getLogo: () => api.get('/api/business/logo'),
};

export default businessService;
