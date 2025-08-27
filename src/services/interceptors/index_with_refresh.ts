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
 * Função que configura os interceptors do Axios com suporte a refresh token
 */
export const setupInterceptors = (api: AxiosInstance): void => {
  // Interceptor de requisição para adicionar token
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = tokenManager.getToken();

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
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
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      // Se receber 401 Unauthorized e não for uma tentativa de refresh
      if (status === 401 && originalRequest && !originalRequest._retry) {
        // Se a requisição que falhou for para o endpoint de refresh, não tentar novamente
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
          const newRefreshToken = response.refreshToken;

          // Salvar os novos tokens
          tokenManager.setToken(newToken);
          if (newRefreshToken) {
            tokenManager.setRefreshToken(newRefreshToken);
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
      }

      // Para outros erros, apenas retornar o erro
      return Promise.reject(error);
    },
  );
};

/**
 * Redireciona para a página de login
 */
const redirectToLogin = () => {
  // Verificar se não está já em uma rota de autenticação para evitar loops
  const currentPath = window.location.pathname;
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  if (!authRoutes.includes(currentPath)) {
    // Disparar evento para que hooks possam reagir
    window.dispatchEvent(new CustomEvent('auth:tokenExpired'));

    // Redirecionar
    window.location.replace('/login');
  }
};
