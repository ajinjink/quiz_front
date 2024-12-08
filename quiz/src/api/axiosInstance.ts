import axios, { AxiosInstance } from 'axios';
import TokenService from './tokenService';

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
  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) { // 토큰 만료 / 오류
      originalRequest._retry = true;

      try {
        await TokenService.refreshTokens(); // 토큰 리프레시
        return axiosInstance(originalRequest); // 새 토큰으로 원래 요청 재시도
      } catch (refreshError) { // refresh 실패
        TokenService.clearTokens();
        localStorage.removeItem('user');
        window.location.href = '/login'; // 로그아웃
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;