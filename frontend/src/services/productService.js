import api from './api';

export const productService = {
  getProducts: () => api.get('/api/products'),
  getBusinessProducts: (businessId) => api.get(`/api/products/business/${businessId}`),
  getMyProducts: () => api.get('/api/products/my-products'),
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (productId, data) => api.patch(`/api/products/${productId}`, data),
  deleteProduct: (productId) => api.delete(`/api/products/${productId}`),
};

export default productService;
