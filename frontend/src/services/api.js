import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const reservationAPI = {
  create: (data) => api.post('/reservations', data),
  getMy: () => api.get('/reservations/my'),
  cancel: (id) => api.delete(`/reservations/${id}`),
  checkAvailability: (params) => api.get('/reservations/availability', { params }),
};

export const tableAPI = {
  getAll: () => api.get('/tables'),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getReservations: () => api.get('/admin/reservations'),
  getReservationsByDate: (date) => api.get(`/admin/reservations/date/${date}`),
  updateReservation: (id, data) => api.put(`/admin/reservations/${id}`, data),
  deleteReservation: (id) => api.delete(`/admin/reservations/${id}`),
  getUsers: () => api.get('/admin/users'),
};

export default api;
