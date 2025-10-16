import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '../types/recipes';
import { RecipeIngredient } from '../types/recipeIngredients';
import {
  NutritionalLabelData,
  getRecipeNutritionalLabel,
} from '../services/nutritionalCalculations';

/**
 * Hook customizado para gerenciar informações nutricionais de receitas
 */
export const useNutritionalInfo = (
  recipe: Recipe | null,
  recipeIngredients: RecipeIngredient[],
) => {
  const [nutritionalData, setNutritionalData] = useState<NutritionalLabelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateNutritionalInfo = useCallback(async () => {
    if (!recipe || !recipeIngredients.length) {
      setNutritionalData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getRecipeNutritionalLabel(recipe, recipeIngredients);
      setNutritionalData(data);
    } catch (err) {
      console.error('Erro ao calcular informações nutricionais:', err);
      setError(
        'Não foi possível calcular as informações nutricionais. Verifique se os ingredientes têm dados nutricionais disponíveis.',
      );
      setNutritionalData(null);
    } finally {
      setLoading(false);
    }
  }, [
    recipe?.id,
    recipeIngredients.length,
    recipeIngredients.map((i) => i.ingredient._id).join(','),
  ]); // 🔥 Dependências específicas para evitar loops

  // 🔥 DEBOUNCE: Recalcular apenas após um delay para evitar múltiplas chamadas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recipe && recipeIngredients.length > 0) {
        calculateNutritionalInfo();
      } else {
        setNutritionalData(null);
        setError(null);
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(timeoutId);
  }, [
    recipe?.id,
    recipeIngredients.length,
    recipeIngredients.map((i) => i.ingredient._id).join(','),
  ]); // 🔥 Mesmas dependências específicas

  const refresh = useCallback(() => {
    calculateNutritionalInfo();
  }, [calculateNutritionalInfo]);

  return {
    nutritionalData,
    loading,
    error,
    refresh,
    hasData: nutritionalData !== null,
  };
};
