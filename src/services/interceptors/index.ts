import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { sanitizeData } from '@utils/security';
import { log } from '../../utils/logger';

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
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Sanitizar dados em logs (em qualquer ambiente, não apenas em desenvolvimento)
      const methodsWithData = ['post', 'put', 'patch'];
      const method = config.method?.toLowerCase();

      if (method && methodsWithData.includes(method) && config.data) {
        // Não modifique dados reais, apenas faça log sanitizado
        const sanitizedData = sanitizeData(config.data);

        // Em desenvolvimento, loga os dados sanitizados usando o logger seguro
        if (import.meta.env.MODE !== 'production') {
          log.request(method, config.url || '', sanitizedData);
        }

        // Opcionalmente, podemos adicionar um cabeçalho personalizado para sinalizar
        // que esta requisição contém dados sensíveis
        if (JSON.stringify(sanitizedData) !== JSON.stringify(config.data)) {
          config.headers = config.headers || {};
          config.headers['X-Contains-Sensitive-Data'] = 'true';
        }
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
      // Obter código de status e mensagem de erro
      const status = error.response?.status;
      const errorMessage = extractErrorMessage(error); // Tratar diferentes códigos de status
      switch (status) {
        case 401: {
          // Limpa o token
          localStorage.removeItem(TOKEN_KEY);
          log.warn('Sessão expirada ou inválida. Redirecionando para login...');

          // Limpar o estado do Redux também
          const event = new CustomEvent('auth:sessionExpired');
          window.dispatchEvent(event);

          // Prevenir loops - só redireciona se não estiver em nenhuma rota de autenticação
          const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
          if (!authRoutes.includes(window.location.pathname)) {
            window.location.href = '/login';
          }
          break;
        }

        case 403: // Proibido (sem permissão)
          log.error('Acesso negado:', errorMessage);
          // Pode redirecionar para uma página de "Acesso negado" ou mostrar um alerta
          break;

        case 404: // Não encontrado
          log.error('Recurso não encontrado:', errorMessage);
          break;

        case 422: // Erro de validação
          log.error('Erro de validação:', errorMessage);
          break;

        case 500: // Erro de servidor
        case 502: // Bad Gateway
        case 503: // Serviço indisponível
          log.error('Erro do servidor:', errorMessage);
          // Pode mostrar uma página de "Serviço indisponível" ou uma mensagem global
          break;

        default:
          log.error(`Erro ${status || 'desconhecido'}:`, errorMessage);
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
