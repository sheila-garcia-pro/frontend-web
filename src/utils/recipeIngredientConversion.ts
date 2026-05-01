/**
 * Utilitário para conversão de ingredientes de receitas
 *
 * Este arquivo contém funções específicas para converter unidades de medida
 * nos ingredientes das receitas antes de enviar para a API.
 */

import { convertToGrams } from './unitConversion';

/**
 * Interface para ingredientes de receita antes da conversão
 */
export interface RecipeIngredientInput {
  ingredient: {
    _id: string;
    name: string;
  };
  quantity: number;
  unitMeasure: string;
}

/**
 * Interface para ingredientes de receita após conversão (formato API)
 */
export interface RecipeIngredientAPI {
  idIngredient: string;
  quantityIngredientRecipe: string;
  unitAmountUseIngredient: string;
}

/**
 * Converte ingredientes de receita para o formato da API com conversão automática de unidades
 */
export const convertRecipeIngredientsForAPI = (
  ingredients: RecipeIngredientInput[],
): RecipeIngredientAPI[] => {
  return ingredients.map((item) => {
    let convertedQuantity = item.quantity;
    let convertedUnit = item.unitMeasure;

    try {
      // Tenta converter a unidade para gramas
      const quantityInGrams = convertToGrams(item.quantity, item.unitMeasure);

      if (quantityInGrams !== null) {
        // Se a conversão foi bem-sucedida e diferente do original
        convertedQuantity = quantityInGrams;
        convertedUnit = 'Gramas';

        console.log(`🔄 Convertendo ingrediente da receita:`, {
          ingredient: item.ingredient.name,
          original: `${item.quantity} ${item.unitMeasure}`,
          converted: `${convertedQuantity} Gramas`,
        });
      } else {
        console.log(`ℹ️ Mantendo unidade original para ingrediente:`, {
          ingredient: item.ingredient.name,
          unit: item.unitMeasure,
          reason: 'Unidade não requer conversão ou não é suportada',
        });
      }
    } catch (error) {
      console.warn(
        `⚠️ Erro na conversão de unidade para ingrediente ${item.ingredient.name}:`,
        error,
      );
      // Mantém valores originais em caso de erro
    }

    return {
      idIngredient: item.ingredient._id,
      quantityIngredientRecipe: convertedQuantity.toString(),
      unitAmountUseIngredient: convertedUnit,
    };
  });
};

/**
 * Valida ingredientes de receita antes da conversão
 */
export const validateRecipeIngredients = (
  ingredients: RecipeIngredientInput[],
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!ingredients || ingredients.length === 0) {
    errors.push('A receita deve ter pelo menos um ingrediente');
  }

  ingredients.forEach((item, index) => {
    const prefix = `Ingrediente ${index + 1} (${item.ingredient.name})`;

    if (!item.ingredient || !item.ingredient._id) {
      errors.push(`${prefix}: ID do ingrediente inválido`);
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push(`${prefix}: Quantidade deve ser maior que zero`);
    }

    if (!item.unitMeasure || item.unitMeasure.trim() === '') {
      errors.push(`${prefix}: Unidade de medida é obrigatória`);
    }

    // Validações de aviso
    if (item.quantity && item.quantity > 10000) {
      warnings.push(`${prefix}: Quantidade parece muito alta (${item.quantity})`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Formata dados de ingredientes para log/debug
 */
export const formatIngredientsForLog = (
  ingredients: RecipeIngredientInput[],
  converted: RecipeIngredientAPI[],
): string => {
  const comparisons = ingredients
    .map((original, index) => {
      const conv = converted[index];
      return `  • ${original.ingredient.name}: ${original.quantity} ${original.unitMeasure} → ${conv.quantityIngredientRecipe} ${conv.unitAmountUseIngredient}`;
    })
    .join('\n');

  return `Conversão de ingredientes da receita:\n${comparisons}`;
};
