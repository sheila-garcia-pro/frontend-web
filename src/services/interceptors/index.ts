import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { sanitizeData } from '@utils/security';
import { log } from '../../utils/logger';
import tokenManager from '@utils/tokenManager';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';

/**
 * Função para sanitizar o payload da requisição, removendo dados sensíveis dos logs
 * Realiza verificação profunda em objetos aninhados e arrays
 * @deprecated Use sanitizeData de @utils/security em seu lugar
 */
const sanitizeRequestData = (data: any): any => {
  // Usar a implementação mais robusta de sanitizeData
  return sanitizeData(data);
};

/**
 * Função que configura os interceptors do Axios
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

  // Interceptor de resposta para tratamento de erros e sanitização
  api.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      // Sanitizar dados sensíveis nas respostas bem-sucedidas para logs
      if (import.meta.env.MODE !== 'production' && response.data) {
        // Somente para logging, não modifica os dados reais usando logger seguro
        log.response(response.status, response.config.url || '', response.data);
      }
      return response;
    },
    (error: AxiosError): Promise<AxiosError> => {
      const status = error.response?.status;
      const errorMessage = extractErrorMessage(error);

      // Se receber 401 Unauthorized, limpar token e redirecionar
      if (status === 401) {
        // Limpar token imediatamente
        tokenManager.clearAuthData();

        // Disparar evento para que hooks possam reagir
        window.dispatchEvent(new CustomEvent('auth:tokenExpired'));

        // Verificar se não está já em uma rota de autenticação para evitar loops
        const currentPath = window.location.pathname;
        const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

        if (!authRoutes.includes(currentPath)) {
          // Redirecionar para login imediatamente
          window.location.replace('/login');
        }

        // Ainda retornar o erro para que os componentes possam tratar se necessário
        return Promise.reject({
          ...error,
          message: 'Sessão expirada. Redirecionando para login...',
        });
      }

      // Se receber 403 Forbidden, redirecionar para página de acesso negado
      if (status === 403) {
        // Disparar evento para que hooks possam reagir
        window.dispatchEvent(new CustomEvent('auth:accessDenied'));

        // Verificar se não está já na página 403 para evitar loops
        const currentPath = window.location.pathname;
        const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

        if (!authRoutes.includes(currentPath) && currentPath !== '/403') {
          // Redirecionar para página 403
          window.location.replace('/403');
        }

        return Promise.reject({
          ...error,
          message: 'Acesso negado. Você não tem permissão para este recurso.',
        });
      }

      // Para outros erros, apenas registrar no log
      log.error(`Erro ${status || 'desconhecido'}:`, errorMessage);

      return Promise.reject({
        ...error,
        message: errorMessage,
      });
    },
  );
};

/**
 * Função de utilidade para extrair mensagens de erro de diferentes formatos
 */
const extractErrorMessage = (error: AxiosError): string => {
  if (error.response) {
    // A requisição foi feita e o servidor respondeu com um status fora do intervalo 2xx
    const responseData = error.response.data as any;
    if (responseData) {
      if (responseData.message) return responseData.message;
      if (responseData.error) return responseData.error;
      if (Array.isArray(responseData.errors)) {
        // Alguns APIs retornam um array de erros
        return responseData.errors.map((e: any) => e.message || e).join(', ');
      }
      if (typeof responseData === 'string') return responseData;
    }
    return `Erro ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // A requisição foi feita mas nenhuma resposta foi recebida
    return 'Não foi possível se comunicar com o servidor. Verifique sua conexão.';
  } else {
    // Algo aconteceu na configuração da requisição que acionou um erro
    return error.message || 'Ocorreu um erro inesperado';
  }
};
