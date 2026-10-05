import api from './api';

export const orderService = {
  createOrder: () => api.post('/api/orders'),
  getMyOrders: () => api.get('/api/orders/my-orders'),
  getOrderDetails: (orderId) => api.get(`/api/orders/${orderId}`),
  getBusinessOrders: () => api.get('/api/orders/business/orders'),
  getBusinessOrderDetails: (orderId) => api.get(`/api/orders/business/orders/${orderId}`),
  updateOrderStatus: (orderId, order_status) => api.patch(`/api/orders/business/orders/${orderId}/status`, { order_status }),
  cancelOrder: (orderId) => api.patch(`/api/orders/${orderId}/cancel`),
};

export default orderService;
