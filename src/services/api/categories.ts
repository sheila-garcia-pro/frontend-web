import api, { cachedGet, clearCache } from './index';
import { 
  Category, 
  CreateCategoryParams, 
  CategoriesResponse, 
  SearchParams 
} from '../../types/ingredients';

// Obter lista de categorias com paginação
export const getCategories = async (params: Omit<SearchParams, 'category'>): Promise<CategoriesResponse> => {
  const response = await api.get<CategoriesResponse>('/v1/category', { params });
  return response.data;
};

// Obter lista de categorias com cache
export const getCachedCategories = async (params: Omit<SearchParams, 'category'>): Promise<CategoriesResponse> => {
  return await cachedGet<CategoriesResponse>('/v1/category', params);
};

// Obter categoria por ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get<Category>(`/v1/category/${id}`);
  return response.data;
};

// Obter categoria por ID (com cache)
export const getCachedCategoryById = async (id: string): Promise<Category> => {
  return await cachedGet<Category>(`/v1/category/${id}`);
};

// Criar uma nova categoria
export const createCategory = async (params: CreateCategoryParams): Promise<Category> => {
  const response = await api.post<Category>('/v1/category', params);
  // Limpa o cache de categorias após criar uma nova
  clearCache('/v1/category');
  return response.data;
}; 