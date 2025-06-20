import axios from 'axios';
import { setupInterceptors } from '@services/interceptors/index_with_refresh';

// Constantes
const API_URL = import.meta.env.VITE_API_URL || 'https://sgpro-api.squareweb.app';
const TIMEOUT = 30000; // 30 segundos

// Cria uma instância do axios com configurações personalizadas
const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Não lançar erro para respostas com status 400-499
  validateStatus: (status) => status >= 200 && status < 500,
});

// Configura os interceptors
setupInterceptors(api);

// Cache simples para armazenar resultados de requisições GET
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

// Exporta uma API com cache para requisições GET
export const cachedGet = async <T>(
  url: string,
  params?: any,
  customCacheKey?: string,
): Promise<T> => {
  // Usa a chave personalizada se fornecida, caso contrário cria uma baseada na URL e parâmetros
  const cacheKey = customCacheKey || `${url}?${new URLSearchParams(params || {}).toString()}`;
  const cachedResponse = apiCache.get(cacheKey);

  // Verifica se existe cache válido
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
    return cachedResponse.data as T;
  }

  // Se não existe cache válido, faz a requisição
  const response = await api.get<T>(url, { params });

  // Armazena no cache
  apiCache.set(cacheKey, {
    data: response.data,
    timestamp: Date.now(),
  });

  return response.data;
};

// Função para limpar o cache quando necessário
export const clearCache = (url?: string): void => {
  if (url) {
    // Remove apenas o cache para a URL específica
    // Usar Array.from para converter as chaves em array e evitar problemas de iteração
    Array.from(apiCache.keys()).forEach((key) => {
      if (key.startsWith(url)) {
        apiCache.delete(key);
      }
    });
  } else {
    // Limpa todo o cache
    apiCache.clear();
  }
};

export default api;
