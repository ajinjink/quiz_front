import axios, { AxiosInstance } from 'axios';

const API_BASE_URL: string = process.env.REACT_APP_API_BASE_URL as string; 

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
  console.log('Request headers:', config.headers);
  return config;
}, (error) => {
  if (error.response?.status === 401) { // 토큰 만료 / 오류
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // 로그아웃
  }
  return Promise.reject(error);
});

export default axiosInstance;