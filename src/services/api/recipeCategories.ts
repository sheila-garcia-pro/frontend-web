import api from './index';

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface RecipeCategoriesResponse {
  categoriesRecipes: RecipeCategory[];
}

export interface CreateRecipeCategoryParams {
  name: string;
}

export interface UpdateRecipeCategoryParams {
  name: string;
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

// Criar nova categoria de receita
export const createRecipeCategory = async (params: CreateRecipeCategoryParams): Promise<void> => {
  try {
    await api.post('/v1/users/me/category-recipe', params);
  } catch (error) {
    console.error('Erro ao criar categoria de receita:', error);
    throw error;
  }
};

// Atualizar categoria de receita
export const updateRecipeCategory = async (
  id: string,
  params: UpdateRecipeCategoryParams,
): Promise<void> => {
  try {
    await api.patch(`/v1/users/me/category-recipe/${id}`, params);
  } catch (error) {
    console.error('Erro ao atualizar categoria de receita:', error);
    throw error;
  }
};

// Excluir categoria de receita
export const deleteRecipeCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/users/me/category-recipe/${id}`);
  } catch (error) {
    console.error('Erro ao excluir categoria de receita:', error);
    throw error;
  }
};
