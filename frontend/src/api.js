import axios from 'axios';

const backendHost = '192.168.0.108';
const api = axios.create({ 
  baseURL: `http://${backendHost}:8080/api`,
  timeout: 10000, // 10 second timeout to prevent hanging requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor for Auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor for Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
       console.error("Critical: Backend is unreachable. Check network/firewall.");
       alert("Network Error: Could not reach the backend server. Please check if your Windows Firewall is blocking port 8080.");
    }
    return Promise.reject(error);
  }
);

export default api;
