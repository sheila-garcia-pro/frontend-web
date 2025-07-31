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
   * Tenta renovar o token usando o refresh token (que está nos cookies)
   */
  const attemptRefresh = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Tentando renovar token automaticamente...');

      // A API de refresh agora usa cookies, não precisamos do refresh token do localStorage
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
   * Agora só verifica se o token atual está expirado,
   * pois o refresh token está nos cookies gerenciados pelo servidor
   */
  const shouldRefresh = useCallback((): boolean => {
    const hasToken = tokenManager.hasToken();
    const isTokenExpired = tokenManager.isTokenExpired();

    // Deve tentar refresh se tem token mas ele está expirado
    return hasToken && isTokenExpired;
  }, []);

  return {
    attemptRefresh,
    forceLogout,
    shouldRefresh,
  };
};

export default useRefreshToken;
