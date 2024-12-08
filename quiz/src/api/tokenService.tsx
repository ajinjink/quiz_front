import axiosInstance from './axiosInstance';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

class TokenService {
  private static refreshPromise: Promise<Tokens> | null = null;

  static getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken')
    };
  }

  static setTokens(tokens: Tokens): void {
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  static clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }

  static async refreshTokens(): Promise<Tokens> {
    // 진행 중인 토큰 갱신이 있다면 그 Promise를 반환
    if (TokenService.refreshPromise) {
      return TokenService.refreshPromise;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // 새로운 토큰 갱신 Promise 생성
    TokenService.refreshPromise = (async () => {
      try {
        const response = await axiosInstance.post<Tokens>('/token/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        
        const tokens = response.data;
        TokenService.setTokens(tokens);
        return tokens;
      } finally {
        TokenService.refreshPromise = null;
      }
    })();

    return TokenService.refreshPromise;
  }
}

export default TokenService;