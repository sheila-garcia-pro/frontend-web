import api from './index';
import {
  Menu,
  MenusResponse,
  MenuListItem,
  CreateMenuParams,
  MenuSearchParams,
  MenuDetails,
} from '../../types/menu';

// Obter lista de cardápios do usuário
export const getUserMenus = async (params?: MenuSearchParams): Promise<MenusResponse> => {
  try {
    const response = await api.get<MenusResponse>('/v1/users/me/menu', { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cardápios:', error);
    throw error;
  }
};

// Obter detalhes de um cardápio específico
export const getMenuById = async (id: string): Promise<MenuDetails> => {
  try {
    const response = await api.get<MenuDetails>(`/v1/users/me/menu/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cardápio:', error);
    throw error;
  }
};

// Criar novo cardápio
export const createMenu = async (params: CreateMenuParams): Promise<Menu> => {
  try {
    const response = await api.post<Menu>('/v1/users/me/menu', params);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar cardápio:', error);
    throw error;
  }
};

// Atualizar cardápio
export const updateMenu = async (id: string, params: Partial<CreateMenuParams>): Promise<Menu> => {
  try {
    const response = await api.patch<Menu>(`/v1/users/me/menu/${id}`, params);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar cardápio:', error);
    throw error;
  }
};

// Excluir cardápio
export const deleteMenu = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/users/me/menu/${id}`);
  } catch (error) {
    console.error('Erro ao excluir cardápio:', error);
    throw error;
  }
};

// Interface para resposta de receitas e ingredientes combinados
export interface RecipeIngredientItem {
  id: string;
  _id: string;
  name: string;
  category: string;
  type: 'recipe' | 'ingredient';
  image?: string;
}

export interface RecipesIngredientsResponse {
  data: RecipeIngredientItem[];
  total: number;
}

// Obter receitas e ingredientes do usuário em uma única chamada
export const getRecipesIngredients = async (params?: {
  page?: number;
  itemPerPage?: number;
  name?: string; // Parâmetro de busca por nome
}): Promise<RecipesIngredientsResponse> => {
  try {
    const response = await api.get<RecipesIngredientsResponse>('/v1/users/me/recipes-ingredients', {
      params,
    });

    // A API pode retornar os dados diretamente em response.data ou em response.data.data
    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
      };
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data;
    } else {
      return {
        data: [],
        total: 0,
      };
    }
  } catch (error) {
    console.error('Erro ao buscar receitas e ingredientes:', error);
    throw error;
  }
};
