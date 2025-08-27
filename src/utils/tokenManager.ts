/**
 * Utilitário para gerenciar o token de autenticação de forma segura
 */

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';
const REFRESH_TOKEN_KEY =
  import.meta.env.VITE_REFRESH_TOKEN_KEY || '@sheila-garcia-pro-refresh-token';
const TOKEN_EXPIRY_KEY = import.meta.env.VITE_TOKEN_EXPIRY_KEY || '@sheila-garcia-pro-token-expiry';

export const tokenManager = {
  /**
   * Obtém o token do localStorage
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  },

  /**
   * Salva o token no localStorage
   */
  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);

      // Tentar extrair e salvar o tempo de expiração do JWT
      try {
        if (token.includes('.')) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp) {
              localStorage.setItem(TOKEN_EXPIRY_KEY, payload.exp.toString());
            }
          }
        }
      } catch (jwtError) {
        console.warn('Não foi possível extrair expiração do token:', jwtError);
      }
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  },
  /**
   * Remove o token do localStorage e sessionStorage
   */
  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Erro ao remover token:', error);
    }
  },

  /**
   * Obtém o tempo de expiração do token
   */
  getTokenExpiry(): number | null {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Erro ao obter expiração do token:', error);
      return null;
    }
  },
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter refresh token:', error);
      return null;
    }
  },

  /**
   * Salva o refresh token no localStorage
   */
  setRefreshToken(refreshToken: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Erro ao salvar refresh token:', error);
    }
  },

  /**
   * Remove o refresh token do localStorage e sessionStorage
   */
  removeRefreshToken(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao remover refresh token:', error);
    }
  },
  /**
   * Verifica se existe um token válido
   */
  hasToken(): boolean {
    const token = this.getToken();
    return token !== null && token.trim() !== '';
  },

  /**
   * Verifica se existe um refresh token válido
   */
  hasRefreshToken(): boolean {
    const refreshToken = this.getRefreshToken();
    return refreshToken !== null && refreshToken.trim() !== '';
  },
  /**
   * Limpa completamente os dados de autenticação
   */
  clearAuthData(): void {
    this.removeToken();
    this.removeRefreshToken();

    // Limpar outros dados relacionados à autenticação se necessário
    try {
      // Remover dados do usuário se existirem em localStorage
      const userDataKeys = [
        '@sheila-garcia-pro-user',
        '@sheila-garcia-pro-preferences',
        '@sheila-garcia-pro-cache',
        TOKEN_EXPIRY_KEY,
      ];

      userDataKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  },

  /**
   * Verifica se o token está expirado
   * Primeiro tenta usar o tempo de expiração salvo, depois decodifica o JWT
   */
  isTokenExpired(): boolean {
    try {
      const token = this.getToken();
      if (!token) return true;

      // Primeiro, tentar usar o tempo de expiração salvo
      const savedExpiry = this.getTokenExpiry();
      if (savedExpiry) {
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = savedExpiry < currentTime;

        return isExpired;
      }

      // Se não tem expiração salva, tentar decodificar o JWT
      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp) {
            const isExpired = payload.exp < currentTime;

            // Salvar a expiração para uso futuro
            localStorage.setItem(TOKEN_EXPIRY_KEY, payload.exp.toString());

            return isExpired;
          }
        }
      }

      // Se não conseguir determinar a expiração, assumir que não está expirado
      // (mas isso pode indicar que o token não é um JWT válido)
      console.warn('⚠️ Não foi possível verificar expiração do token');
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar expiração do token:', error);
      // Em caso de erro, assumir que está expirado por segurança
      return true;
    }
  } /**
   * Verifica se o refresh token está expirado
   * Considera um prazo de 7 dias para o refresh token
   */,
  isRefreshTokenExpired(): boolean {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return true;

    try {
      // Se for um JWT, podemos decodificar e verificar a expiração
      if (refreshToken.includes('.')) {
        const parts = refreshToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp) {
            const isExpired = payload.exp < currentTime;
            return isExpired;
          }
        }
      }

      // Se não conseguir decodificar ou não tiver exp, assumir que não está expirado
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar expiração do refresh token:', error);
      // Em caso de erro, assumir que está expirado por segurança
      return true;
    }
  },
};

export default tokenManager;
