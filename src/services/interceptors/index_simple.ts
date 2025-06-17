import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';

/**
 * Função que configura os interceptors do Axios - VERSÃO SIMPLIFICADA
 */
export const setupInterceptors = (api: AxiosInstance): void => {
  // Interceptor de requisição para adicionar token
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = localStorage.getItem(TOKEN_KEY);

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

  // Interceptor de resposta - APENAS para tratar 401
  api.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    (error: AxiosError): Promise<AxiosError> => {
      const status = error.response?.status;

      // Se receber 401 Unauthorized, limpar token e redirecionar
      if (status === 401) {
        console.log('❌ 401 Unauthorized detectado - limpando token...');

        // Limpar token imediatamente
        localStorage.removeItem(TOKEN_KEY);

        // Verificar se não está já em uma rota de autenticação para evitar loops
        const currentPath = window.location.pathname;
        const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

        if (!authRoutes.includes(currentPath)) {
          console.log('🔄 Redirecionando para /login...');
          window.location.replace('/login');
        }
      }

      return Promise.reject(error);
    },
  );
};
