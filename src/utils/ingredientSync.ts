import { updateIngredient } from '../services/api/ingredients';
import { RecipeIngredient } from '../types/recipeIngredients';
import { CreateIngredientParams } from '../types/ingredients';

/**
 * Atualiza os ingredientes na API quando eles são modificados na receita
 * @param recipeIngredients - Array de ingredientes da receita
 * @returns Promise<void>
 */
export const syncIngredientsWithAPI = async (
  recipeIngredients: RecipeIngredient[],
): Promise<void> => {
  const updatePromises = recipeIngredients
    .filter((ri) => ri.ingredient.price) // Apenas ingredientes com preço
    .map(async (recipeIngredient) => {
      try {
        const updateData: Partial<CreateIngredientParams> = {
          name: recipeIngredient.ingredient.name,
          category: recipeIngredient.ingredient.category,
          image: recipeIngredient.ingredient.image,
          price: recipeIngredient.ingredient.price
            ? {
                price: recipeIngredient.ingredient.price.price,
                quantity: recipeIngredient.ingredient.price.quantity,
                unitMeasure: recipeIngredient.ingredient.price.unitMeasure,
              }
            : undefined,
        };

        await updateIngredient(recipeIngredient.ingredient._id, updateData);
        console.log(`✅ Ingrediente ${recipeIngredient.ingredient.name} sincronizado com sucesso`);
      } catch (error) {
        console.error(
          `❌ Erro ao sincronizar ingrediente ${recipeIngredient.ingredient.name}:`,
          error,
        );
        throw error; // Re-throw para que o chamador possa tratar
      }
    });

  await Promise.all(updatePromises);
};

/**
 * Atualiza um ingrediente específico na API
 * @param ingredientId - ID do ingrediente
 * @param ingredientData - Dados do ingrediente para atualizar
 * @returns Promise<void>
 */
export const syncSingleIngredientWithAPI = async (
  ingredientId: string,
  ingredientData: Partial<CreateIngredientParams>,
): Promise<void> => {
  try {
    await updateIngredient(ingredientId, ingredientData);
    console.log(`✅ Ingrediente ${ingredientData.name} sincronizado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao sincronizar ingrediente ${ingredientData.name}:`, error);
    throw error;
  }
};

/**
 * Verifica se um ingrediente precisa ser sincronizado
 * @param recipeIngredient - Ingrediente da receita
 * @returns boolean - true se precisa sincronizar
 */
export const needsSync = (recipeIngredient: RecipeIngredient): boolean => {
  return !!(recipeIngredient.ingredient.price && recipeIngredient.ingredient.price.price > 0);
};
