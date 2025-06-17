/**
 * Utilitário para gerenciar o token de autenticação de forma segura
 */

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';

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
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao remover token:', error);
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
   * Limpa completamente os dados de autenticação
   */
  clearAuthData(): void {
    this.removeToken();

    // Limpar outros dados relacionados à autenticação se necessário
    try {
      // Remover dados do usuário se existirem em localStorage
      const userDataKeys = [
        '@sheila-garcia-pro-user',
        '@sheila-garcia-pro-preferences',
        '@sheila-garcia-pro-cache',
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
   * Verifica se o token está expirado (se possível)
   * Esta função pode ser expandida para decodificar JWT e verificar expiração
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Se for um JWT, podemos decodificar e verificar a expiração
      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp) {
            const isExpired = payload.exp < currentTime;
            console.log('🕐 Token expiration check:', {
              exp: payload.exp,
              current: currentTime,
              isExpired,
            });
            return isExpired;
          }
        }
      }

      // Se não conseguir decodificar ou não tiver exp, assumir que não está expirado
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar expiração do token:', error);
      // Em caso de erro, assumir que está expirado por segurança
      return true;
    }
  },
};

export default tokenManager;
