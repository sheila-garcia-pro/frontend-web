import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@store/slices/authSlice';
import tokenManager from '@utils/tokenManager';

/**
 * Hook para verificar token na inicialização da aplicação
 */
export const useInitialTokenCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const performInitialCheck = () => {
      const token = tokenManager.getToken();
      const currentPath = location.pathname;

      console.log('🔍 Verificação inicial de token:', {
        hasToken: !!token,
        currentPath,
        isTokenExpired: token ? tokenManager.isTokenExpired() : null,
      });

      // Rotas públicas que não precisam de token
      const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicRoute = publicRoutes.includes(currentPath);

      // Se não tem token
      if (!token) {
        // Limpar estado do Redux para garantir
        dispatch(logout());

        // Se não está em rota pública, redirecionar
        if (!isPublicRoute) {
          console.log('❌ Sem token - redirecionando para login');
          navigate('/login', { replace: true });
        }
        return;
      }

      // Se tem token mas está expirado
      if (tokenManager.isTokenExpired()) {
        console.log('⏰ Token expirado - limpando e redirecionando');
        tokenManager.clearAuthData();
        dispatch(logout());

        if (!isPublicRoute) {
          navigate('/login', { replace: true });
        }
        return;
      }

      // Se tem token válido mas está em rota pública
      if (token && !tokenManager.isTokenExpired() && isPublicRoute) {
        console.log('✅ Token válido em rota pública - redirecionando para home');
        navigate('/', { replace: true });
      }
    };

    // Executar verificação após um pequeno delay para garantir que tudo esteja carregado
    const timer = setTimeout(performInitialCheck, 100);

    return () => clearTimeout(timer);
  }, [navigate, location.pathname, dispatch]);
};

export default useInitialTokenCheck;
