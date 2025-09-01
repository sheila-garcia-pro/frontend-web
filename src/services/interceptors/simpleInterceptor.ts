import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import tokenManager from '@utils/tokenManager';
import { getLoginInProgress } from '@utils/loginFlag';

/**
 * Interceptor simples e seguro - sem refresh automático por enquanto
 * Para debug da tela branca
 */
export const setupSimpleInterceptor = (api: AxiosInstance): void => {
  // Interceptor de requisição para adicionar token
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      try {
        const token = tokenManager.getToken();

        if (token && !tokenManager.isTokenExpired()) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Configurar withCredentials apenas para endpoints que precisam de cookies
        if (config.url?.includes('/v1/auth/refresh')) {
          config.withCredentials = true;
        }

        return config;
      } catch (error) {
        console.error('❌ Erro no interceptor de requisição:', error);
        return config;
      }
    },
    (error: AxiosError): Promise<AxiosError> => {
      return Promise.reject(error);
    },
  );

  // Interceptor de resposta simples
  api.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    (error: AxiosError): Promise<AxiosError> => {
      try {
        const status = error.response?.status;

        // Se receber 401 e não for em rota de login, limpar dados e redirecionar
        if (status === 401) {
          const originalRequest = error.config as InternalAxiosRequestConfig;

          // Não interferir durante login em progresso ou na rota de login
          const isLoginRoute = originalRequest?.url?.includes('/v1/auth/login');
          const isLoginActive = getLoginInProgress();

          if (!isLoginRoute && !isLoginActive) {
            // Adicionar delay pequeno para evitar condições de corrida
            setTimeout(() => {
              // Verificar novamente se login ainda não está em progresso
              if (!getLoginInProgress()) {
                try {
                  tokenManager.clearAuthData();
                } catch (clearError) {
                  console.error('❌ Erro ao limpar dados:', clearError);
                }

                // Verificar se não está já em uma rota de autenticação
                const currentPath = window.location.pathname;
                const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

                if (!authRoutes.includes(currentPath)) {
                  window.location.replace('/login');
                }
              }
            }, 150); // 150ms de delay
          }
        }

        // Se receber 403, também limpar dados e redirecionar para login
        // pois pode indicar token expirado ou inválido
        if (status === 403) {
          const originalRequest = error.config as InternalAxiosRequestConfig;
          const isLoginRoute = originalRequest?.url?.includes('/v1/auth/login');
          const isLoginActive = getLoginInProgress();

          if (!isLoginRoute && !isLoginActive) {
            setTimeout(() => {
              if (!getLoginInProgress()) {
                try {
                  tokenManager.clearAuthData();

                  // Disparar evento para notificar componentes
                  window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
                } catch (clearError) {
                  console.error('❌ Erro ao limpar dados:', clearError);
                }

                const currentPath = window.location.pathname;
                const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

                if (!authRoutes.includes(currentPath)) {
                  window.location.replace('/login');
                }
              }
            }, 150); // 150ms de delay
          }
        }
      } catch (interceptorError) {
        console.error('❌ Erro no interceptor de resposta:', interceptorError);
      }

      return Promise.reject(error);
    },
  );
};

export default setupSimpleInterceptor;
