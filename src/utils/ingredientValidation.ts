import { RecipeIngredient } from '../types/recipeIngredients';

/**
 * Valida se um ingrediente da receita tem dados válidos para sincronização
 * @param recipeIngredient - Ingrediente da receita
 * @returns objeto com validação e mensagens de erro
 */
export const validateRecipeIngredient = (recipeIngredient: RecipeIngredient) => {
  const errors: string[] = [];

  if (!recipeIngredient.ingredient._id) {
    errors.push('ID do ingrediente é obrigatório');
  }

  if (!recipeIngredient.ingredient.name?.trim()) {
    errors.push('Nome do ingrediente é obrigatório');
  }

  if (!recipeIngredient.ingredient.category?.trim()) {
    errors.push('Categoria do ingrediente é obrigatória');
  }

  if (recipeIngredient.ingredient.price) {
    if (recipeIngredient.ingredient.price.price <= 0) {
      errors.push('Preço deve ser maior que zero');
    }

    if (recipeIngredient.ingredient.price.quantity <= 0) {
      errors.push('Quantidade deve ser maior que zero');
    }

    if (!recipeIngredient.ingredient.price.unitMeasure?.trim()) {
      errors.push('Unidade de medida é obrigatória');
    }
  }

  if (recipeIngredient.quantity <= 0) {
    errors.push('Quantidade do ingrediente na receita deve ser maior que zero');
  }

  if (!recipeIngredient.unitMeasure?.trim()) {
    errors.push('Unidade de medida do ingrediente na receita é obrigatória');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Filtra ingredientes válidos para sincronização
 * @param recipeIngredients - Array de ingredientes da receita
 * @returns Array de ingredientes válidos e array de erros
 */
export const filterValidIngredients = (recipeIngredients: RecipeIngredient[]) => {
  const validIngredients: RecipeIngredient[] = [];
  const invalidIngredients: Array<{ ingredient: RecipeIngredient; errors: string[] }> = [];

  recipeIngredients.forEach((ingredient) => {
    const validation = validateRecipeIngredient(ingredient);

    if (validation.isValid) {
      validIngredients.push(ingredient);
    } else {
      invalidIngredients.push({
        ingredient,
        errors: validation.errors,
      });
    }
  });

  return {
    validIngredients,
    invalidIngredients,
  };
};

/**
 * Calcula estatísticas dos ingredientes
 * @param recipeIngredients - Array de ingredientes da receita
 * @returns Estatísticas dos ingredientes
 */
export const calculateIngredientStats = (recipeIngredients: RecipeIngredient[]) => {
  const totalIngredients = recipeIngredients.length;
  const ingredientsWithPrice = recipeIngredients.filter((ri) => ri.ingredient.price).length;
  const ingredientsWithoutPrice = totalIngredients - ingredientsWithPrice;
  const totalCost = recipeIngredients.reduce((sum, ri) => sum + ri.totalCost, 0);
  const totalWeight = recipeIngredients.reduce((sum, ri) => sum + ri.totalWeight, 0);

  return {
    totalIngredients,
    ingredientsWithPrice,
    ingredientsWithoutPrice,
    totalCost,
    totalWeight,
  };
};
