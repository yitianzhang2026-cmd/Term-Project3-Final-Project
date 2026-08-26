import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('contract_guardian_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
}

export const userApi = {
  list: () => api.get('/users/'),
  update: (id, data) => api.put(`/users/${id}`, data),
}

export const contractApi = {
  list: (params) => api.get('/contracts', { params }),
  get: (id) => api.get(`/contracts/${id}`),
  create: (data) => api.post('/contracts', data),
  upload: (form) => api.post('/contracts/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  delete: (id) => api.delete(`/contracts/${id}`),
  view: (id) => api.get(`/contracts/${id}/view`, { responseType: 'blob' }),
  download: (id) => api.get(`/contracts/${id}/download`, { responseType: 'blob' }),
  addNote: (id, content) => api.post(`/contracts/${id}/notes`, { content }),
}

export const notificationApi = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.put(`/notifications/mark-read/${id}`),
  count: () => api.get('/notifications/count'),
}

export const adminApi = {
  stats: () => api.get('/admin/stats'),
}

export default api
