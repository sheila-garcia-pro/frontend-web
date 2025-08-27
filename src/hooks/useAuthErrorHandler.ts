import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '@store/slices/authSlice';
import tokenManager from '@utils/tokenManager';

/**
 * Hook que monitora erros 401 e limpa automaticamente a autenticação
 */
export const useAuthErrorHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Interceptar erros 401 de qualquer lugar da aplicação
    const handleUnauthorized = () => {
      // Limpar token
      tokenManager.clearAuthData();

      // Atualizar estado do Redux
      dispatch(logout());
    };

    // Adicionar listener global para erros 401
    window.addEventListener('auth:tokenExpired', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:tokenExpired', handleUnauthorized);
    };
  }, [dispatch]);
};

export default useAuthErrorHandler;
