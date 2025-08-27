import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import tokenManager from '@utils/tokenManager';
import { refreshToken } from '@services/api/auth';

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: AxiosError) => void;
}> = [];

/**
 * Processa a fila de requisições que falharam enquanto o token estava sendo renovado
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Redireciona para a página de login
 */
const redirectToLogin = () => {
  const currentPath = window.location.pathname;
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  if (!authRoutes.includes(currentPath)) {
    // Disparar evento para que hooks possam reagir
    window.dispatchEvent(new CustomEvent('auth:tokenExpired'));

    // Redirecionar
    window.location.replace('/login');
  }
};

/**
 * Verifica se deve tentar renovar o token
 */
const shouldAttemptRefresh = (error: AxiosError): boolean => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  // Não tentar renovar se:
  // 1. Não é erro 401
  // 2. Já tentou renovar esta requisição
  // 3. A requisição falhou é para o endpoint de refresh
  // 4. A requisição falhou é para o endpoint de login (primeira tentativa)
  if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
    return false;
  }

  if (
    originalRequest.url?.includes('/v1/auth/refresh') ||
    originalRequest.url?.includes('/v1/auth/login')
  ) {
    return false;
  }

  return true;
};

/**
 * Função que configura os interceptors do Axios com suporte a refresh token automatico
 */
export const setupTokenRefreshInterceptor = (api: AxiosInstance): void => {
  // Interceptor de requisição para adicionar token e configurar cookies condicionalmente
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
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
    },
    (error: AxiosError): Promise<AxiosError> => {
      return Promise.reject(error);
    },
  );

  // Interceptor de resposta com lógica de refresh token
  api.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    async (error: AxiosError): Promise<AxiosResponse | never> => {
      // Verificar se deve tentar renovar o token
      if (!shouldAttemptRefresh(error)) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Se a requisição que falhou for para o endpoint de refresh, fazer logout
      if (originalRequest.url?.includes('/v1/auth/refresh')) {
        tokenManager.clearAuthData();
        redirectToLogin();
        return Promise.reject(error);
      }

      // Se já está tentando renovar o token, enfileirar a requisição
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Marcar como tentativa de renovação
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tentar renovar o token usando cookies
        const response = await refreshToken();
        const newToken = response.token;

        // Salvar o novo token
        tokenManager.setToken(newToken);

        // Salvar o novo refresh token se fornecido
        if (response.refreshToken) {
          tokenManager.setRefreshToken(response.refreshToken);
        }

        // Processar fila de requisições com o novo token
        processQueue(null, newToken);

        // Atualizar a requisição original com o novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        isRefreshing = false;

        // Tentar a requisição original novamente
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token:', refreshError);

        // Se falhou ao renovar, limpar tudo e fazer logout
        tokenManager.clearAuthData();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        redirectToLogin();

        return Promise.reject(refreshError);
      }
    },
  );
};

export default setupTokenRefreshInterceptor;
