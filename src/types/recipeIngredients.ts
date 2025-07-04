import { Ingredient } from './ingredients';
import { RecipeIngredientAPI } from './recipes';

// Interface para histórico de preços de ingredientes
export interface IngredientPriceHistory {
  id: string;
  idIngredient: string;
  date: string;
  price: number;
  quantity: number;
  unitMeasure: string;
}

// Interface para tabela nutricional
export interface NutritionalInfo {
  calories: number; // kcal por 100g
  carbohydrates: number; // gramas por 100g
  sugars: number; // gramas por 100g
  addedSugars: number; // gramas por 100g
  proteins: number; // gramas por 100g
  totalFats: number; // gramas por 100g
  saturatedFats: number; // gramas por 100g
  transFats: number; // gramas por 100g
  dietaryFiber: number; // gramas por 100g
  sodium: number; // miligramas por 100g
  monounsaturatedFats: number; // gramas por 100g
  polyunsaturatedFats: number; // gramas por 100g
  cholesterol: number; // miligramas por 100g
}

// Interface para ingredientes da receita
export interface RecipeIngredient {
  ingredient: {
    _id: string;
    name: string;
    category: string;
    image: string;
    price?: {
      price: number;
      quantity: number;
      unitMeasure: string;
    };
    nutritionalInfo?: NutritionalInfo;
  };
  quantity: number;
  unitMeasure: string;
  totalWeight: number; // peso total usado na receita
  totalCost: number; // custo total deste ingrediente na receita
  correctionFactor?: number; // fator de correção aplicado
  priceHistory?: IngredientPriceHistory[]; // histórico de preços
}

// Interface para o card de ingredientes da receita
export interface RecipeIngredientsCardProps {
  recipeId: string;
  onIngredientsUpdate?: (ingredients: RecipeIngredient[]) => void;
}

// Interface para busca de ingredientes no card
export interface IngredientSearchResult {
  _id: string;
  name: string;
  category: string;
  image: string;
  price?: {
    price: number;
    quantity: number;
    unitMeasure: string;
  };
  nutritionalInfo?: NutritionalInfo;
}

// Função utilitária para converter ingredientes da API para o formato do componente
export const convertAPIIngredientsToRecipeIngredients = async (
  apiIngredients: RecipeIngredientAPI[],
  getIngredientById: (id: string) => Promise<Ingredient>,
): Promise<RecipeIngredient[]> => {
  const convertedIngredients: RecipeIngredient[] = [];

  for (const apiIngredient of apiIngredients) {
    try {
      const ingredient = await getIngredientById(apiIngredient.idIngredient);
      const quantity = parseFloat(apiIngredient.quantityIngredientRecipe);

      // Usar preço salvo na receita se disponível, senão usar preço do ingrediente
      let ingredientWithPrice = ingredient;
      if (apiIngredient.priceQuantityIngredient && apiIngredient.unitMeasure) {
        // Se a receita tem informações de preço salvas, usá-las
        ingredientWithPrice = {
          ...ingredient,
          price: {
            price: apiIngredient.priceQuantityIngredient,
            quantity: quantity,
            unitMeasure: apiIngredient.unitMeasure,
          },
        };
      }

      // Calcular custo total
      const pricePerUnit = ingredientWithPrice.price
        ? ingredientWithPrice.price.price / ingredientWithPrice.price.quantity
        : 0;
      const totalCost = pricePerUnit * quantity;

      convertedIngredients.push({
        ingredient: ingredientWithPrice,
        quantity,
        unitMeasure: apiIngredient.unitAmountUseIngredient,
        totalWeight: quantity,
        totalCost,
      });
    } catch (error) {
      console.error(`Erro ao converter ingrediente ${apiIngredient.idIngredient}:`, error);
    }
  }

  return convertedIngredients;
};

// Interface para os ingredientes que vem da API da receita (para compatibilidade)
export interface RecipeIngredientsCardPropsWithAPI extends RecipeIngredientsCardProps {
  recipeIngredients?: RecipeIngredientAPI[]; // ingredientes que vem da API da receita
}
