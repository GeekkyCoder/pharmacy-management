import axios from 'axios';

const getToken = () => localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  // baseURL:"https://rashid-pharmacy-management.onrender.com",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
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
        const jwtError = error.response.data?.message === "Not authorized - Please login..";
        if (jwtError) {
          // clearing localStorage and redirect to login
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = "/";
          }, 1000);
        }

      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
