import api from './index';

export interface Yield {
  _id: string;
  name: string;
  description?: string;
}

// Obter tipos de rendimento para receitas
export const getYieldsRecipes = async (): Promise<Yield[]> => {
  try {
    const response = await api.get<Yield[]>('/v1/yields-recipes');
    return response.data || [];
  } catch (error) {
    console.error('Erro ao buscar tipos de rendimento:', error);
    throw error;
  }
};
