import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@store/slices/authSlice';
import tokenManager from '@utils/tokenManager';
import useRefreshToken from '@hooks/useRefreshToken';

/**
 * Hook que monitora mudanças no localStorage para detectar remoção de token
 */
export const useTokenWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { attemptRefresh, shouldRefresh } = useRefreshToken();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const tokenKey = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';

      // Se o token foi removido
      if (e.key === tokenKey && !e.newValue) {
        dispatch(logout());

        // Verificar se não está em rota pública
        const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      }
    };

    // Listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange); // Verificação periódica (a cada 30 segundos)
    const intervalCheck = setInterval(async () => {
      const token = tokenManager.getToken();
      const currentPath = location.pathname;
      const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

      // Se não tem token e não está em rota pública
      if (!token && !publicRoutes.includes(currentPath)) {
        dispatch(logout());
        navigate('/login', { replace: true });
        return;
      }

      // Se tem token mas está expirado
      if (token && tokenManager.isTokenExpired() && !publicRoutes.includes(currentPath)) {
        // Tentar renovar o token se possível
        if (shouldRefresh()) {
          const refreshSuccess = await attemptRefresh();

          if (refreshSuccess) {
            return;
          }
        }

        tokenManager.clearAuthData();
        dispatch(logout());
        navigate('/login', { replace: true });
      }
    }, 30000); // 30 segundos

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalCheck);
    };
  }, [navigate, location.pathname, dispatch, attemptRefresh, shouldRefresh]);
};

export default useTokenWatcher;
