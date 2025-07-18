import api, { cachedGet, clearCache } from './index';
import {
  Ingredient,
  CreateIngredientParams,
  IngredientsResponse,
  SearchParams,
} from '../../types/ingredients';
import { IngredientPriceHistory } from '../../types/recipeIngredients';

type QueryParams = {
  [key: string]: number | string | undefined;
};

/**
 * Cria uma chave de cache consistente para os parâmetros de busca
 * @param params Parâmetros de busca
 * @returns String formatada como chave de cache
 */
const createCacheKey = (params: SearchParams): string => {
  // Normaliza os parâmetros para garantir consistência na chave de cache
  const normalizedParams = {
    page: params.page || 1,
    itemPerPage: params.itemPerPage || 12,
    category: params.category || '',
    search: params.search || '',
  };

  // Cria uma chave ordenada para evitar diferenças por ordem dos parâmetros
  return Object.entries(normalizedParams)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

// Obter lista de ingredientes com paginação e filtros
export const getIngredients = async (params: SearchParams): Promise<IngredientsResponse> => {
  // Remove parâmetros vazios ou nulos
  const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as QueryParams);

  const response = await api.get<IngredientsResponse>('/v1/users/me/ingredient', {
    params: queryParams,
  });
  return response.data;
};

// Obter lista de ingredientes com cache
export const getCachedIngredients = async (params: SearchParams): Promise<IngredientsResponse> => {
  // Usa a função auxiliar para criar uma chave de cache consistente
  const cacheKey = createCacheKey(params);

  try {
    // Remove parâmetros vazios ou nulos para a chamada à API
    const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as QueryParams);

    const response = await cachedGet<IngredientsResponse>(
      '/v1/users/me/ingredient',
      queryParams,
      cacheKey,
    );
    return response;
  } catch (error) {
    console.error('getCachedIngredients - erro:', error);
    throw error;
  }
};

// Obter ingrediente por ID (sem cache)
export const getIngredientById = async (id: string): Promise<Ingredient> => {
  const response = await api.get<Ingredient>(`/v1/users/me/ingredient/${id}`);
  return response.data;
};

// Obter ingrediente por ID (com cache)
export const getCachedIngredientById = async (id: string): Promise<Ingredient> => {
  const response = await cachedGet<Ingredient>(`/v1/users/me/ingredient/${id}`);
  return response;
};

// Criar um novo ingrediente
export const createIngredient = async (params: CreateIngredientParams): Promise<Ingredient> => {
  const response = await api.post<Ingredient>('/v1/users/me/ingredient', params);
  // Limpa o cache de ingredientes após criar um novo
  clearCache('/v1/users/me/ingredient');
  return response.data;
};

// Atualizar um ingrediente existente
export const updateIngredient = async (
  id: string,
  params: Partial<CreateIngredientParams>,
): Promise<Ingredient> => {
  const response = await api.patch<Ingredient>(`/v1/users/me/ingredient/${id}`, params);
  // Limpa o cache de ingredientes e do ingrediente específico
  clearCache('/v1/users/me/ingredient');
  clearCache(`/v1/users/me/ingredient/${id}`);
  return response.data;
};

// Excluir um ingrediente
export const deleteIngredient = async (id: string): Promise<void> => {
  await api.delete(`/v1/users/me/ingredient/${id}`);
  // Limpa o cache de ingredientes e do ingrediente específico
  clearCache('/v1/users/me/ingredient');
  clearCache(`/v1/users/me/ingredient/${id}`);
};

// Atualizar preço e medida de um ingrediente
export const updateIngredientPriceMeasure = async (
  id: string,
  params: {
    price: number;
    quantity: number;
    unitMeasure: string;
  },
): Promise<Ingredient> => {
  const response = await api.post<Ingredient>(
    `/v1/users/me/ingredient/${id}/price-measure`,
    params,
  );
  // Limpa o cache de ingredientes e do ingrediente específico
  clearCache('/v1/users/me/ingredient');
  clearCache(`/v1/users/me/ingredient/${id}`);
  return response.data;
};

// Obter preço e medida de um ingrediente
export const getIngredientPriceMeasure = async (id: string): Promise<Ingredient> => {
  const response = await api.get<Ingredient>(`/v1/users/me/ingredient/${id}/price-measure`);
  return response.data;
};

// Obter histórico de preços de um ingrediente
export const getIngredientPriceHistory = async (id: string): Promise<IngredientPriceHistory[]> => {
  const response = await api.get<IngredientPriceHistory[]>(
    `/v1/users/me/ingredient/${id}/historic`,
  );
  return response.data;
};

// Obter histórico de preços com cache
export const getCachedIngredientPriceHistory = async (
  id: string,
): Promise<IngredientPriceHistory[]> => {
  const response = await cachedGet<IngredientPriceHistory[]>(
    `/v1/users/me/ingredient/${id}/historic`,
  );
  return response;
};
