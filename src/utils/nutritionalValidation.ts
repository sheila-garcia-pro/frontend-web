/**
 * Utilitários para validação e formatação de valores nutricionais
 */

/**
 * Verifica se um valor nutricional é válido
 * @param value - Valor a ser verificado
 * @returns true se o valor é válido, false caso contrário
 */
export const isValidNutritionalValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;

  const stringValue = value.toString().trim();

  // Verifica se é uma string vazia, zero, null ou undefined
  if (
    stringValue === '' ||
    stringValue === '0' ||
    stringValue === '0.0' ||
    stringValue === 'null' ||
    stringValue === 'undefined'
  ) {
    return false;
  }

  // Verifica se é um número válido e maior que zero
  const numericValue = parseFloat(stringValue);
  return !isNaN(numericValue) && numericValue > 0;
};

/**
 * Formata um valor nutricional para exibição
 * @param value - Valor a ser formatado
 * @returns String formatada do valor com 2 casas decimais ou '0.00' se inválido
 */
export const formatNutritionalValue = (value: any): string => {
  if (!isValidNutritionalValue(value)) return '0.00';
  const numericValue = parseFloat(value.toString());
  return numericValue.toFixed(2);
};

/**
 * Filtra uma lista de itens nutricionais, retornando apenas os válidos
 * @param items - Array de itens nutricionais
 * @returns Array filtrado com apenas itens válidos
 */
export const filterValidNutritionalItems = <T extends { value: any }>(items: T[]): T[] => {
  return items.filter((item) => isValidNutritionalValue(item.value));
};

/**
 * Verifica se há dados válidos de macronutrientes para gerar gráfico
 * @param carbs - Valor de carboidratos
 * @param proteins - Valor de proteínas
 * @param fats - Valor de gorduras
 * @returns true se há dados suficientes para gerar gráfico
 */
export const hasValidMacronutrients = (carbs: any, proteins: any, fats: any): boolean => {
  return (
    isValidNutritionalValue(carbs) ||
    isValidNutritionalValue(proteins) ||
    isValidNutritionalValue(fats)
  );
};
