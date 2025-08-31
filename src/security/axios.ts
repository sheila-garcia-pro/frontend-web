/**
 * Instância Axios com interceptors para RBAC
 *
 * Configuração centralizada do Axios com tratamento adequado de:
 * - Autenticação automática (Bearer token)
 * - Tratamento de erros 401/403
 * - Redirecionamentos seguros
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { isValidToken } from './auth';

// Chave do token - compatibilidade com tokenManager existente
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';

// Criar instância do axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição
 * Adiciona token de autorização automaticamente se disponível e válido
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token && isValidToken(token)) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor de resposta
 * Trata erros 401/403 com redirecionamentos adequados
 */
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    const status = error?.response?.status;
    const currentPath = window.location.pathname;

    // Rotas que não devem sofrer redirecionamento
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

    if (status === 401) {
      // Unauthorized - token inválido ou expirado
      localStorage.removeItem(TOKEN_KEY);

      // Disparar evento para que hooks possam reagir
      window.dispatchEvent(new CustomEvent('auth:tokenExpired'));

      // Redirecionar apenas se não estiver em rota pública
      if (!publicRoutes.includes(currentPath)) {
        window.location.replace('/login');
      }

      return Promise.reject({
        ...error,
        message: 'Sessão expirada. Redirecionando para login...',
      });
    }

    if (status === 403) {
      // Forbidden - usuário autenticado mas sem permissões

      // Disparar evento para que hooks possam reagir
      window.dispatchEvent(new CustomEvent('auth:accessDenied'));

      // Redirecionar para página 403 se não estiver em rota pública
      if (!publicRoutes.includes(currentPath) && currentPath !== '/403') {
        window.location.replace('/403');
      }

      return Promise.reject({
        ...error,
        message: 'Acesso negado. Você não tem permissão para este recurso.',
      });
    }

    // Para outros erros, apenas repassar
    return Promise.reject(error);
  },
);

export default api;
