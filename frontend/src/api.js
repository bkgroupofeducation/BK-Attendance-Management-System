import axios from 'axios';

const backendHost = '192.168.0.102';
const api = axios.create({ baseURL: `http://${backendHost}:8080/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
