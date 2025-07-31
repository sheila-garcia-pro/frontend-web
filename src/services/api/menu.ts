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
