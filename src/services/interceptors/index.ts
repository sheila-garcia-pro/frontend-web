import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token';

/**
 * Função que configura os interceptors do Axios
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

  // Interceptor de resposta para tratamento de erros
  api.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    (error: AxiosError): Promise<AxiosError> => {
      // Obter código de status e mensagem de erro
      const status = error.response?.status;
      const errorMessage = extractErrorMessage(error);

      // Tratar diferentes códigos de status
      switch (status) {
        case 401: // Não autorizado
          // Limpa o token e redireciona para login
          localStorage.removeItem(TOKEN_KEY);
          window.location.href = '/login';
          break;
        
        case 403: // Proibido (sem permissão)
          console.error('Acesso negado:', errorMessage);
          // Pode redirecionar para uma página de "Acesso negado" ou mostrar um alerta
          break;
        
        case 404: // Não encontrado
          console.error('Recurso não encontrado:', errorMessage);
          break;
        
        case 422: // Erro de validação
          console.error('Erro de validação:', errorMessage);
          break;
        
        case 500: // Erro de servidor
        case 502: // Bad Gateway
        case 503: // Serviço indisponível
          console.error('Erro do servidor:', errorMessage);
          // Pode mostrar uma página de "Serviço indisponível" ou uma mensagem global
          break;
        
        default:
          console.error(`Erro ${status || 'desconhecido'}:`, errorMessage);
      }

      // Aqui você pode integrar com um sistema de notificações global
      // Por exemplo: toast.error(errorMessage);
      
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
