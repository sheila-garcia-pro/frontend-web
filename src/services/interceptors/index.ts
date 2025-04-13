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
      // Verifica se é erro de autenticação
      if (error.response && error.response.status === 401) {
        // Limpa o token e redireciona para login
        localStorage.removeItem(TOKEN_KEY);
        // Redireciona para a página de login
        window.location.href = '/login';
      }

      // Customize o tratamento de erros conforme necessário
      const errorMessage = extractErrorMessage(error);

      // Aqui você pode integrar com um sistema de notificações global
      // Por exemplo: toast.error(errorMessage);
      console.error('API Error:', errorMessage);

      return Promise.reject(error);
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
