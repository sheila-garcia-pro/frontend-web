import api from './index';

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface RecipeCategoriesResponse {
  categoriesRecipes: RecipeCategory[];
}

// Obter categorias de receitas do usuário
export const getUserRecipeCategories = async (): Promise<RecipeCategory[]> => {
  try {
    const response = await api.get<RecipeCategoriesResponse[]>('/v1/users/me/category-recipe');

    // A API retorna um array com um objeto que contém categoriesRecipes
    if (response.data && response.data.length > 0 && response.data[0].categoriesRecipes) {
      return response.data[0].categoriesRecipes;
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar categorias de receitas:', error);
    throw error;
  }
};
