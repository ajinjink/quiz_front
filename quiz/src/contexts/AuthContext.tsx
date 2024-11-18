import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../api/axiosInstance';

interface User {
  department: string;
  email: string;
  university: string;
  userID: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (userData: { user: User; accessToken: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 초기 인증 상태 복원
  useEffect(() => {
    const initializeAuth = () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setAccessToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: { user: User; accessToken: string }) => {
    setUser(userData.user);
    setAccessToken(userData.accessToken);
    setIsAuthenticated(true);
    localStorage.setItem('token', userData.accessToken);
    localStorage.setItem('user', JSON.stringify(userData.user));
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};