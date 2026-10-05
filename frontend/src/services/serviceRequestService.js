import api from './api';

export const serviceRequestService = {
  createRequest: (serviceId) => api.post('/api/service-requests', { service_id: serviceId }),
  getMyRequests: () => api.get('/api/service-requests/my-requests'),
  getBusinessRequests: () => api.get('/api/service-requests/business/requests'),
  updateStatus: (requestId, status) => api.patch(`/api/service-requests/business/requests/${requestId}/status`, { status }),
  cancelRequest: (requestId) => api.patch(`/api/service-requests/${requestId}/cancel`),
  completeRequest: (requestId) => api.patch(`/api/service-requests/business/requests/${requestId}/complete`),
};

export default serviceRequestService;
