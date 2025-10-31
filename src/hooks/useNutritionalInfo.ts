import { useState, useEffect, useCallback, useMemo } from 'react';
import { Recipe } from '../types/recipes';
import { RecipeIngredient } from '../types/recipeIngredients';
import {
  NutritionalLabelData,
  getRecipeNutritionalLabel,
} from '../services/nutritionalCalculations';

/**
 * Hook customizado para gerenciar informações nutricionais de receitas
 * Versão aprimorada com detecção completa de mudanças
 */
export const useNutritionalInfo = (
  recipe: Recipe | null,
  recipeIngredients: RecipeIngredient[],
) => {
  const [nutritionalData, setNutritionalData] = useState<NutritionalLabelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 MEMOIZADO: Criar hash completo dos ingredientes para detectar qualquer mudança
  const ingredientsHash = useMemo(() => {
    if (!recipeIngredients.length) return '';

    return recipeIngredients
      .map((ri) => {
        // Inclui TODOS os campos relevantes para cálculo nutricional
        const parts = [
          ri.ingredient._id,
          ri.ingredient.name,
          ri.quantity.toString(),
          ri.unitMeasure,
          ri.totalWeight.toString(),
          ri.totalCost.toString(),
          // Incluir dados nutricionais do ingrediente se existirem
          ri.ingredient.nutritionalInfo
            ? JSON.stringify(ri.ingredient.nutritionalInfo)
            : 'no-nutrition',
        ];
        return parts.join(':');
      })
      .sort() // Garante ordem consistente
      .join('|');
  }, [recipeIngredients]);

  // 🔥 MEMOIZADO: Criar hash da receita para detectar mudanças relevantes
  const recipeHash = useMemo(() => {
    if (!recipe) return '';

    return [
      recipe._id,
      recipe.name,
      recipe.yieldRecipe,
      recipe.typeYield,
      recipe.weightRecipe,
      recipe.typeWeightRecipe,
    ].join(':');
  }, [recipe]);

  const calculateNutritionalInfo = useCallback(async () => {
    if (!recipe || !recipeIngredients.length) {
      console.log('🍎 [Nutritional] Limpando dados - sem receita ou ingredientes');
      setNutritionalData(null);
      setError(null);
      return;
    }

    console.log('🍎 [Nutritional] Iniciando cálculo para:', {
      recipe: recipe.name,
      ingredients: recipeIngredients.length,
      hash: ingredientsHash.substring(0, 50) + '...',
    });

    setLoading(true);
    setError(null);

    try {
      const data = await getRecipeNutritionalLabel(recipe, recipeIngredients);

      console.log('🍎 [Nutritional] Cálculo concluído:', {
        calories: data.nutrients.calories,
        portionSize: data.portionSize,
        servings: data.servingsPerContainer,
      });

      setNutritionalData(data);
    } catch (err) {
      console.error('🍎 [Nutritional] Erro ao calcular:', err);
      setError(
        'Não foi possível calcular as informações nutricionais. Verifique se os ingredientes têm dados nutricionais disponíveis.',
      );
      setNutritionalData(null);
    } finally {
      setLoading(false);
    }
  }, [recipe, recipeIngredients, recipeHash, ingredientsHash]);

  // 🔥 DEBOUNCE INTELIGENTE: Recalcular quando dados relevantes mudarem
  useEffect(() => {
    if (!recipe || !recipeIngredients.length) {
      console.log('🍎 [Nutritional] Resetando - sem dados');
      setNutritionalData(null);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log('🍎 [Nutritional] Trigger de recálculo detectado');
      calculateNutritionalInfo();
    }, 200); // 🔥 200ms para boa responsividade

    return () => {
      clearTimeout(timeoutId);
    };
  }, [recipeHash, ingredientsHash, calculateNutritionalInfo]); // 🔥 Usar hashes como dependências

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
