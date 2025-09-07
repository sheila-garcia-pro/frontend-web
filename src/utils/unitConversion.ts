/**
 * Utilitários para conversão de unidades de medida
 */

/**
 * Converte uma quantidade para gramas baseado na unidade de medida
 * @param quantity - Quantidade a ser convertida
 * @param unitMeasure - Unidade de medida (ex: "Quilogramas", "Gramas", "KG", "G")
 * @returns Quantidade convertida em gramas
 */
export const convertToGrams = (quantity: number, unitMeasure: string): number => {
  if (!unitMeasure) return quantity;

  const unit = unitMeasure.toLowerCase().trim();

  // Quilogramas para Gramas
  if (unit.includes('quilogram') || unit.includes('kg') || unit === 'quilogramas') {
    return quantity * 1000;
  }

  // Gramas (já está na unidade correta)
  if (unit.includes('gram') || unit.includes('g') || unit === 'gramas') {
    return quantity;
  }

  // Litros para gramas (assumindo densidade da água: 1L = 1000g)
  if (unit.includes('litro') || unit.includes('l') || unit === 'litros') {
    return quantity * 1000;
  }

  // Mililitros para gramas (assumindo densidade da água: 1mL = 1g)
  if (unit.includes('mililitro') || unit.includes('ml') || unit === 'mililitros') {
    return quantity;
  }

  // Para unidades não reconhecidas, assumir que já está em gramas
  return quantity;
};

/**
 * Calcula o preço por porção (100g) baseado no preço, quantidade e unidade
 * @param price - Preço do ingrediente
 * @param quantity - Quantidade do ingrediente
 * @param unitMeasure - Unidade de medida
 * @param portionSize - Tamanho da porção em gramas (padrão: 100g)
 * @returns Preço por porção
 */
export const calculatePricePerPortion = (
  price: number,
  quantity: number,
  unitMeasure: string,
  portionSize: number = 100,
): number => {
  if (price <= 0 || quantity <= 0) return 0;

  const quantityInGrams = convertToGrams(quantity, unitMeasure);
  const pricePerGram = price / quantityInGrams;

  return pricePerGram * portionSize;
};

/**
 * Converte gramas para outras unidades
 * @param grams - Quantidade em gramas
 * @param targetUnit - Unidade de destino
 * @returns Quantidade convertida na unidade de destino
 */
export const convertFromGrams = (grams: number, targetUnit: string): number => {
  if (!targetUnit) return grams;

  const unit = targetUnit.toLowerCase().trim();

  // Gramas para Quilogramas
  if (unit.includes('quilogram') || unit.includes('kg') || unit === 'quilogramas') {
    return grams / 1000;
  }

  // Gramas para Litros (assumindo densidade da água)
  if (unit.includes('litro') || unit.includes('l') || unit === 'litros') {
    return grams / 1000;
  }

  // Gramas para Mililitros (assumindo densidade da água)
  if (unit.includes('mililitro') || unit.includes('ml') || unit === 'mililitros') {
    return grams;
  }

  // Para gramas ou unidades não reconhecidas, retornar como está
  return grams;
};
