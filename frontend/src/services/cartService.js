import api from './api';

export const cartService = {
  getCart: () => api.get('/api/cart'),
  addToCart: (productId) => api.post('/api/cart', { product_id: productId }),
  updateCartItem: (cartItemId, quantity) => api.patch(`/api/cart/${cartItemId}`, { quantity }),
  removeCartItem: (cartItemId) => api.delete(`/api/cart/${cartItemId}`),
  clearCart: () => api.delete('/api/cart'),
};

export default cartService;
