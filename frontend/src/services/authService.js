import api from './api';

export const authService = {
  register: (userData) => api.post('/api/auth/register', userData),
  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
};

export default authService;
