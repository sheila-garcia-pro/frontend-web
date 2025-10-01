import { RecipeIngredient } from '../types/recipeIngredients';
import { Recipe } from '../types/recipes';
import { NutritionalTable } from '../types/nutritionalTable';
import { getNutritionalTable } from './api/nutritionalTable';

/**
 * Interface para informações nutricionais calculadas da receita
 */
export interface RecipeNutritionalInfo {
  energyKcal: number;
  carbohydrateG: number;
  proteinG: number;
  totalFatsG: number;
  totalSugarG: number;
  addSugarG: number;
  saturatedFatsG: number;
  transFatsG: number;
  dietaryFiberG: number;
  sodiumMG: number;
  cholesterolMG: number;
  calciumMG: number;
  ironMG: number;
  potassiumMG: number;
  vitaminCMCG: number;
  portionSize: number; // tamanho da porção em gramas
  servingsPerContainer: number; // número de porções
}

/**
 * Interface para rótulo nutricional formatado para exibição
 */
export interface NutritionalLabelData {
  productName: string;
  portionSize: number;
  servingsPerContainer: number;
  nutrients: {
    calories: number;
    totalFat: number;
    saturatedFat: number;
    transFat: number;
    cholesterol: number;
    sodium: number;
    totalCarbohydrate: number;
    dietaryFiber: number;
    totalSugars: number;
    addedSugars: number;
    protein: number;
    calcium: number;
    iron: number;
    potassium: number;
    vitaminC: number;
  };
  dailyValues: {
    totalFat: number;
    saturatedFat: number;
    cholesterol: number;
    sodium: number;
    totalCarbohydrate: number;
    dietaryFiber: number;
    calcium: number;
    iron: number;
    potassium: number;
    vitaminC: number;
  };
}

/**
 * Valores diários de referência (baseado nas diretrizes brasileiras)
 */
const DAILY_VALUES = {
  calories: 2000,
  totalFat: 65, // g
  saturatedFat: 20, // g
  cholesterol: 300, // mg
  sodium: 2300, // mg
  totalCarbohydrate: 300, // g
  dietaryFiber: 25, // g
  calcium: 1000, // mg
  iron: 14, // mg
  potassium: 3500, // mg
  vitaminC: 90, // mg (convertido de mcg)
};

/**
 * Converte valores nutricionais de string para número, verificando validade
 */
const parseNutritionalValue = (value: string | undefined): number => {
  if (!value || value === '' || value === 'null' || value === 'undefined') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

/**
 * Busca informações nutricionais de um ingrediente
 */
const getIngredientNutritionalInfo = async (
  ingredientName: string,
): Promise<NutritionalTable | null> => {
  try {
    const tables = await getNutritionalTable(ingredientName);
    return tables.length > 0 ? tables[0] : null;
  } catch (error) {
    console.warn(`Não foi possível obter informações nutricionais para: ${ingredientName}`);
    return null;
  }
};

/**
 * Calcula informações nutricionais totais de uma receita
 */
export const calculateRecipeNutritionalInfo = async (
  recipe: Recipe,
  recipeIngredients: RecipeIngredient[],
): Promise<RecipeNutritionalInfo> => {
  const totalNutrients = {
    energyKcal: 0,
    carbohydrateG: 0,
    proteinG: 0,
    totalFatsG: 0,
    totalSugarG: 0,
    addSugarG: 0,
    saturatedFatsG: 0,
    transFatsG: 0,
    dietaryFiberG: 0,
    sodiumMG: 0,
    cholesterolMG: 0,
    calciumMG: 0,
    ironMG: 0,
    potassiumMG: 0,
    vitaminCMCG: 0,
  };

  // Calcular peso total da receita em gramas
  const totalRecipeWeight = recipeIngredients.reduce((sum, ri) => sum + ri.totalWeight, 0);

  // Para cada ingrediente, obter informações nutricionais e calcular proporcionalmente
  for (const recipeIngredient of recipeIngredients) {
    const nutritionalInfo = await getIngredientNutritionalInfo(recipeIngredient.ingredient.name);

    if (nutritionalInfo) {
      // Calcular a proporção baseada no peso do ingrediente (por 100g)
      const ingredientWeight = recipeIngredient.totalWeight; // já em gramas
      const proportion = ingredientWeight / 100; // nutrição é por 100g

      totalNutrients.energyKcal += parseNutritionalValue(nutritionalInfo.energyKcal) * proportion;
      totalNutrients.carbohydrateG +=
        parseNutritionalValue(nutritionalInfo.carbohydrateG) * proportion;
      totalNutrients.proteinG += parseNutritionalValue(nutritionalInfo.proteinG) * proportion;
      totalNutrients.totalFatsG += parseNutritionalValue(nutritionalInfo.totalFatsG) * proportion;
      totalNutrients.totalSugarG += parseNutritionalValue(nutritionalInfo.totalSugarG) * proportion;
      totalNutrients.addSugarG += parseNutritionalValue(nutritionalInfo.addSugarG) * proportion;
      totalNutrients.saturatedFatsG +=
        parseNutritionalValue(nutritionalInfo.saturatedFatsG) * proportion;
      totalNutrients.transFatsG += parseNutritionalValue(nutritionalInfo.transFatsG) * proportion;
      totalNutrients.dietaryFiberG +=
        parseNutritionalValue(nutritionalInfo.dietaryFiberG) * proportion;
      totalNutrients.sodiumMG += parseNutritionalValue(nutritionalInfo.sodiumMG) * proportion;
      totalNutrients.cholesterolMG +=
        parseNutritionalValue(nutritionalInfo.cholesterolMG) * proportion;
      totalNutrients.calciumMG += parseNutritionalValue(nutritionalInfo.calciumMG) * proportion;
      totalNutrients.ironMG += parseNutritionalValue(nutritionalInfo.ironMG) * proportion;
      totalNutrients.potassiumMG += parseNutritionalValue(nutritionalInfo.potassiumMG) * proportion;
      totalNutrients.vitaminCMCG += parseNutritionalValue(nutritionalInfo.vitaminCMCG) * proportion;
    }
  }

  // Calcular tamanho da porção e número de porções
  const yieldNumber = parseFloat(recipe.yieldRecipe) || 1;
  const portionSize = Math.round(totalRecipeWeight / yieldNumber); // peso por porção em gramas

  return {
    ...totalNutrients,
    portionSize,
    servingsPerContainer: yieldNumber,
  };
};

/**
 * Formata as informações nutricionais para o rótulo nutricional
 */
export const formatNutritionalLabel = (
  recipe: Recipe,
  nutritionalInfo: RecipeNutritionalInfo,
): NutritionalLabelData => {
  // Calcular valores por porção
  const perServingMultiplier = 1 / nutritionalInfo.servingsPerContainer;

  const nutrients = {
    calories: Math.round(nutritionalInfo.energyKcal * perServingMultiplier),
    totalFat: Math.round(nutritionalInfo.totalFatsG * perServingMultiplier * 10) / 10,
    saturatedFat: Math.round(nutritionalInfo.saturatedFatsG * perServingMultiplier * 10) / 10,
    transFat: Math.round(nutritionalInfo.transFatsG * perServingMultiplier * 10) / 10,
    cholesterol: Math.round(nutritionalInfo.cholesterolMG * perServingMultiplier),
    sodium: Math.round(nutritionalInfo.sodiumMG * perServingMultiplier),
    totalCarbohydrate: Math.round(nutritionalInfo.carbohydrateG * perServingMultiplier * 10) / 10,
    dietaryFiber: Math.round(nutritionalInfo.dietaryFiberG * perServingMultiplier * 10) / 10,
    totalSugars: Math.round(nutritionalInfo.totalSugarG * perServingMultiplier * 10) / 10,
    addedSugars: Math.round(nutritionalInfo.addSugarG * perServingMultiplier * 10) / 10,
    protein: Math.round(nutritionalInfo.proteinG * perServingMultiplier * 10) / 10,
    calcium: Math.round(nutritionalInfo.calciumMG * perServingMultiplier),
    iron: Math.round(nutritionalInfo.ironMG * perServingMultiplier * 10) / 10,
    potassium: Math.round(nutritionalInfo.potassiumMG * perServingMultiplier),
    vitaminC: Math.round(((nutritionalInfo.vitaminCMCG * perServingMultiplier) / 1000) * 10) / 10, // converter mcg para mg
  };

  // Calcular % valores diários
  const dailyValues = {
    totalFat: Math.round((nutrients.totalFat / DAILY_VALUES.totalFat) * 100),
    saturatedFat: Math.round((nutrients.saturatedFat / DAILY_VALUES.saturatedFat) * 100),
    cholesterol: Math.round((nutrients.cholesterol / DAILY_VALUES.cholesterol) * 100),
    sodium: Math.round((nutrients.sodium / DAILY_VALUES.sodium) * 100),
    totalCarbohydrate: Math.round(
      (nutrients.totalCarbohydrate / DAILY_VALUES.totalCarbohydrate) * 100,
    ),
    dietaryFiber: Math.round((nutrients.dietaryFiber / DAILY_VALUES.dietaryFiber) * 100),
    calcium: Math.round((nutrients.calcium / DAILY_VALUES.calcium) * 100),
    iron: Math.round((nutrients.iron / DAILY_VALUES.iron) * 100),
    potassium: Math.round((nutrients.potassium / DAILY_VALUES.potassium) * 100),
    vitaminC: Math.round((nutrients.vitaminC / DAILY_VALUES.vitaminC) * 100),
  };

  return {
    productName: recipe.name,
    portionSize: nutritionalInfo.portionSize,
    servingsPerContainer: nutritionalInfo.servingsPerContainer,
    nutrients,
    dailyValues,
  };
};

/**
 * Função principal para obter dados do rótulo nutricional de uma receita
 */
export const getRecipeNutritionalLabel = async (
  recipe: Recipe,
  recipeIngredients: RecipeIngredient[],
): Promise<NutritionalLabelData> => {
  const nutritionalInfo = await calculateRecipeNutritionalInfo(recipe, recipeIngredients);
  return formatNutritionalLabel(recipe, nutritionalInfo);
};
