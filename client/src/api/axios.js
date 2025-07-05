import axios from 'axios';

const getToken = () => localStorage.getItem('token');

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8000',
  baseUrl:"https://rashid-pharmacy-management.onrender.com",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Unauthorized. Logging out...');
        localStorage.removeItem('token');
        window.location.href = "/"
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
