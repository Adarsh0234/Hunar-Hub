import api from './api';

export const userService = {
  getMe: () => api.get('/api/users/me'),
};

export default userService;
