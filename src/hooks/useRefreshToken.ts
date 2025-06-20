import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '@store/slices/authSlice';
import { addNotification } from '@store/slices/uiSlice';
import tokenManager from '@utils/tokenManager';
import * as authService from '@services/api/auth';

/**
 * Hook para gerenciar refresh token
 */
export const useRefreshToken = () => {
  const dispatch = useDispatch();

  /**
   * Tenta renovar o token usando o refresh token
   */
  const attemptRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTokenValue = tokenManager.getRefreshToken();

      if (!refreshTokenValue || tokenManager.isRefreshTokenExpired()) {
        console.log('❌ Refresh token não encontrado ou expirado');
        return false;
      }

      console.log('🔄 Tentando renovar token automaticamente...');

      const response = await authService.refreshToken();

      // Salvar os novos tokens
      tokenManager.setToken(response.token);
      if (response.refreshToken) {
        tokenManager.setRefreshToken(response.refreshToken);
      }

      console.log('✅ Token renovado automaticamente');

      return true;
    } catch (error) {
      console.error('❌ Erro ao renovar token automaticamente:', error);
      return false;
    }
  }, []);

  /**
   * Força o logout quando o refresh falha
   */
  const forceLogout = useCallback(() => {
    tokenManager.clearAuthData();
    dispatch(logout());
    dispatch(
      addNotification({
        message: 'Sua sessão expirou. Faça login novamente.',
        type: 'warning',
      }),
    );
  }, [dispatch]);

  /**
   * Verifica se deve tentar o refresh do token
   */
  const shouldRefresh = useCallback((): boolean => {
    const hasToken = tokenManager.hasToken();
    const hasRefreshToken = tokenManager.hasRefreshToken();
    const isTokenExpired = tokenManager.isTokenExpired();
    const isRefreshTokenExpired = tokenManager.isRefreshTokenExpired();

    return hasToken && hasRefreshToken && isTokenExpired && !isRefreshTokenExpired;
  }, []);

  return {
    attemptRefresh,
    forceLogout,
    shouldRefresh,
  };
};

export default useRefreshToken;
