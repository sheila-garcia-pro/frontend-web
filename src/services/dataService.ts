import { receitasMock } from '../mocks/receitasMock';
import * as ingredientsService from './api/ingredients';
import { Ingredient } from '../types/ingredients';

// Interface para uma receita
export interface Recipe {
  id: string;
  name: string;
  image: string;
  dishType: string;
  servings: number;
}

// Interface para o payload de retorno da Home
export interface HomeDataPayload {
  ingredientes: Ingredient[];
  receitas: Recipe[];
}

// Função para buscar receitas
export const fetchReceitas = async (): Promise<Recipe[]> => {
  try {
    // Por enquanto, vamos usar o mock até a API estar pronta
    // Simulando um delay para parecer uma chamada real
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Convertendo o mock para o formato correto
    const recipes: Recipe[] = receitasMock.map((recipe) => ({
      id: recipe.id.toString(),
      name: recipe.name,
      image: recipe.image,
      dishType: recipe.dishType || 'Prato Principal',
      servings: recipe.servings || 4,
    }));

    return recipes;
  } catch (error) {
    console.error('Erro ao carregar receitas:', error);
    throw error;
  }
};

export const fetchHomeData = async (): Promise<HomeDataPayload> => {
  try {
    const [ingredientesResponse, receitas] = await Promise.all([
      ingredientsService.getIngredients({ page: 1, itemPerPage: 10 }),
      fetchReceitas(),
    ]);

    return {
      ingredientes: ingredientesResponse.data,
      receitas,
    };
  } catch (error) {
    console.error('Erro ao carregar dados da home:', error);
    throw error;
  }
};
