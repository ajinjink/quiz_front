import axios, { AxiosInstance } from 'axios';

const API_BASE_URL: string = (process.env.REACT_APP_API_BASE_URL as string) || 'http://127.0.0.1:4000'; 

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;