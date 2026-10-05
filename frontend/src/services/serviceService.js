import api from './api';

export const serviceService = {
  getServices: () => api.get('/api/services'),
  getBusinessServices: (businessId) => api.get(`/api/services/business/${businessId}`),
  getMyServices: () => api.get('/api/services/my-services'),
  createService: (data) => api.post('/api/services', data),
  updateService: (serviceId, data) => api.patch(`/api/services/${serviceId}`, data),
  deleteService: (serviceId) => api.delete(`/api/services/${serviceId}`),
};

export default serviceService;
