import api from './api';

export const reviewService = {
  createProductReview: (data) => api.post('/api/product-reviews', data),
  getProductReviews: (productId) => api.get(`/api/product-reviews/product/${productId}`),
  createServiceReview: (data) => api.post('/api/service-reviews', data),
  getServiceReviews: (serviceId) => api.get(`/api/service-reviews/service/${serviceId}`),
};

export default reviewService;
