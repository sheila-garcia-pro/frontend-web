/**
 * Utilitários para conversão de unidades de medida
 */

/**
 * Tabela de conversão de medidas culinárias para gramas
 * Valores baseados em medidas culinárias padrões brasileiras
 */
export const culinaryConversions: Record<string, number> = {
  // Colheres de chá (5g)
  'colher de chá': 5,
  'colher (chá)': 5,
  'colher chá': 5,
  'colheres de chá': 5,
  'colheres (chá)': 5,
  'colheres chá': 5,
  'c. chá': 5,
  'c.chá': 5,

  // Colheres de sopa (15g)
  'colher de sopa': 15,
  'colher (sopa)': 15,
  'colher sopa': 15,
  'colheres de sopa': 15,
  'colheres (sopa)': 15,
  'colheres sopa': 15,
  'c. sopa': 15,
  'c.sopa': 15,
  cs: 15,

  // Colheres de sobremesa (10g)
  'colher de sobremesa': 10,
  'colher (sobremesa)': 10,
  'colher sobremesa': 10,
  'colheres de sobremesa': 10,
  'colheres (sobremesa)': 10,
  'colheres sobremesa': 10,
  'c. sobremesa': 10,
  'c.sobremesa': 10,

  // Xícaras (120g para farinha, 200g para líquidos - usando média 160g)
  xícara: 160,
  xícaras: 160,
  xic: 160,
  x: 160,
  'xícara de chá': 160,
  'xícaras de chá': 160,

  // Copos (240ml = 240g para líquidos)
  copo: 240,
  copos: 240,
  'copo americano': 240,
  'copos americanos': 240,

  // Pitadas e punhados
  pitada: 1,
  pitadas: 1,
  punhado: 30,
  punhados: 30,

  // Dentes de alho
  dente: 3,
  dentes: 3,
  'dente de alho': 3,
  'dentes de alho': 3,
};

/**
 * Converte uma quantidade para gramas baseado na unidade de medida
 * @param quantity - Quantidade a ser convertida
 * @param unitMeasure - Unidade de medida (ex: "Quilogramas", "Gramas", "1 colher (chá)")
 * @returns Quantidade convertida em gramas
 */
export const convertToGrams = (quantity: number, unitMeasure: string): number => {
  if (!unitMeasure) return quantity;

  const unit = unitMeasure.toLowerCase().trim();

  // Primeiro, verificar conversões culinárias
  for (const [key, gramsPerUnit] of Object.entries(culinaryConversions)) {
    if (unit.includes(key)) {
      return quantity * gramsPerUnit;
    }
  }

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

/**
 * Converte dados de preço para o formato padronizado em gramas para envio à API
 * @param price - Preço do ingrediente
 * @param quantity - Quantidade do ingrediente
 * @param unitMeasure - Unidade de medida original
 * @returns Objeto com dados convertidos para gramas
 */
export const convertPriceDataToGrams = (
  price: number,
  quantity: number,
  unitMeasure: string,
): { price: number; quantity: number; unitMeasure: string } => {
  // Converter a quantidade para gramas
  const quantityInGrams = convertToGrams(quantity, unitMeasure);

  // Se a conversão resultou em uma mudança (não é uma unidade já em gramas)
  if (quantityInGrams !== quantity || !unitMeasure.toLowerCase().includes('gram')) {
    return {
      price,
      quantity: quantityInGrams,
      unitMeasure: 'Gramas',
    };
  }

  // Se já está em gramas ou não foi convertido, manter original
  return {
    price,
    quantity,
    unitMeasure,
  };
};

/**
 * Obtém a descrição da conversão realizada para fins de log/debug
 * @param originalQuantity - Quantidade original
 * @param originalUnit - Unidade original
 * @param convertedQuantity - Quantidade convertida
 * @returns Descrição da conversão
 */
export const getConversionDescription = (
  originalQuantity: number,
  originalUnit: string,
  convertedQuantity: number,
): string => {
  if (convertedQuantity === originalQuantity) {
    return `Mantido: ${originalQuantity} ${originalUnit}`;
  }
  return `Convertido: ${originalQuantity} ${originalUnit} → ${convertedQuantity} Gramas`;
};
