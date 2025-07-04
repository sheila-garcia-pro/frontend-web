import api, { cachedGet, clearCache } from './index';
import { Recipe, CreateRecipeParams, RecipesResponse, SearchParams } from '../../types/recipes';

type QueryParams = {
  [key: string]: number | string | undefined;
};

const createCacheKey = (params: SearchParams): string => {
  const normalizedParams = {
    page: params.page || 1,
    itemPerPage: params.itemPerPage || 12,
    category: params.category || '',
    search: params.search || '',
  };

  return Object.entries(normalizedParams)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

// Obter lista de receitas com paginação e filtros
export const getRecipes = async (params: SearchParams): Promise<RecipesResponse> => {
  const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as QueryParams);

  const response = await api.get<RecipesResponse>('/v1/users/me/recipe', {
    params: queryParams,
  });
  return response.data;
};

// Obter lista de receitas com cache
export const getCachedRecipes = async (params: SearchParams): Promise<RecipesResponse> => {
  const cacheKey = createCacheKey(params);

  try {
    const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as QueryParams);

    const response = await cachedGet<RecipesResponse>('/v1/users/me/recipe', queryParams, cacheKey);
    return response;
  } catch (error) {
    console.error('getCachedRecipes - erro:', error);
    throw error;
  }
};

// Obter receita por ID (sem cache)
export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await api.get<Recipe>(`/v1/users/me/recipe/${id}`);
  return response.data;
};

// Obter receita por ID (com cache)
export const getCachedRecipeById = async (id: string): Promise<Recipe> => {
  const response = await cachedGet<Recipe>(`/v1/users/me/recipe/${id}`);
  return response;
};

// Obter receita por ID (sem cache - para dados frescos após edição)
export const getFreshRecipeById = async (id: string): Promise<Recipe> => {
  if (!id || id === 'undefined') {
    throw new Error('ID da receita é obrigatório e não pode ser undefined');
  }

  console.log('🔍 getFreshRecipeById - Making request with ID:', id);
  const response = await api.get<Recipe>(`/v1/users/me/recipe/${id}`);
  console.log('🔍 getFreshRecipeById - API response:', response.data);
  return response.data;
};

// Criar uma nova receita
export const createRecipe = async (params: CreateRecipeParams): Promise<Recipe> => {
  const response = await api.post<Recipe>('/v1/users/me/recipe', params);
  clearCache('/v1/users/me/recipe');
  return response.data;
};

// Atualizar uma receita existente
export const updateRecipe = async (
  id: string,
  params: Partial<CreateRecipeParams>,
): Promise<Recipe> => {
  if (!id || id === 'undefined') {
    throw new Error('ID da receita é obrigatório para atualização');
  }

  console.log('🔍 updateRecipe - Making request with ID:', id);
  console.log('🔍 updateRecipe - Request params:', params);

  const response = await api.patch<Recipe>(`/v1/users/me/recipe/${id}`, params);

  console.log('🔍 updateRecipe - API response:', response.data);
  console.log('🔍 updateRecipe - Response _id:', response.data?._id);

  clearCache('/v1/users/me/recipe');
  clearCache(`/v1/users/me/recipe/${id}`);
  return response.data;
};

// Excluir uma receita
export const deleteRecipe = async (id: string): Promise<void> => {
  await api.delete(`/v1/users/me/recipe/${id}`);
  clearCache('/v1/users/me/recipe');
  clearCache(`/v1/users/me/recipe/${id}`);
};
