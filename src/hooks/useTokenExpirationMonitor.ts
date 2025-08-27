import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '@store/slices/authSlice';
import tokenManager from '@utils/tokenManager';
import { refreshToken } from '@services/api/auth';

/**
 * Hook para monitorar a expiração do token e renovar automaticamente
 * Este hook deve ser usado apenas uma vez na aplicação (preferencialmente no App.tsx)
 */
export const useTokenExpirationMonitor = (isAuthenticated: boolean) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Só executar se estiver autenticado e tiver token válido
    if (!isAuthenticated) {
      return;
    }

    // Função para verificar e renovar o token se necessário
    const checkAndRefreshToken = async () => {
      try {
        const token = tokenManager.getToken();

        // Se não há token, não fazer nada
        if (!token) {
          return;
        }

        // Se o token já está expirado, não tentar renovar preventivamente
        if (tokenManager.isTokenExpired()) {
          return;
        }

        // Verificar se o token está próximo de expirar (5 minutos antes)
        const isNearExpiry = isTokenNearExpiry();

        if (isNearExpiry) {
          try {
            const response = await refreshToken();
            tokenManager.setToken(response.token);

            if (response.refreshToken) {
              tokenManager.setRefreshToken(response.refreshToken);
            }
          } catch (error) {
            console.error('❌ Erro ao renovar token preventivamente:', error);

            // Não fazer logout aqui, deixar o interceptor lidar com isso
            // tokenManager.clearAuthData();
            // dispatch(logout());
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar expiração do token:', error);
      }
    };

    // Verificar imediatamente
    checkAndRefreshToken();

    // Configurar verificação periódica a cada 2 minutos
    const interval = setInterval(checkAndRefreshToken, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, dispatch]);
};

/**
 * Verifica se o token está próximo de expirar (dentro de 5 minutos)
 */
const isTokenNearExpiry = (): boolean => {
  try {
    const expiry = tokenManager.getTokenExpiry();

    if (!expiry) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesInSeconds = 5 * 60;

    // Retorna true se o token expira em menos de 5 minutos
    return expiry - currentTime <= fiveMinutesInSeconds;
  } catch (error) {
    console.error('❌ Erro ao verificar proximidade de expiração:', error);
    return false;
  }
};

export default useTokenExpirationMonitor;
