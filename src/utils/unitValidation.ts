/**
 * Utilitários para validação e formatação de unidades de medida
 *
 * Este arquivo contém funções auxiliares para trabalhar com unidades de medida,
 * incluindo validação, formatação e normalização de entrada.
 */

import { convertToGrams, culinaryConversions } from './unitConversion';

/**
 * Verifica se uma unidade de medida é suportada para conversão
 */
export const isSupportedUnit = (unitMeasure: string): boolean => {
  const normalizedUnit = unitMeasure.toLowerCase().trim();
  return Object.keys(culinaryConversions).some((unit) =>
    normalizedUnit.includes(unit.toLowerCase()),
  );
};

/**
 * Extrai informações de quantidade e unidade de uma string
 * Exemplo: "2 colheres (sopa)" -> { quantity: 2, unit: "colher (sopa)" }
 */
export const parseUnitString = (
  unitMeasure: string,
): {
  quantity: number;
  unit: string;
  originalString: string;
} => {
  const cleanString = unitMeasure.trim();

  // Regex para capturar quantidade no início
  const quantityMatch = cleanString.match(/^(\d+(?:\.\d+)?)\s*/);

  if (quantityMatch) {
    const quantity = parseFloat(quantityMatch[1]);
    const unit = cleanString.replace(quantityMatch[0], '').trim();

    return {
      quantity,
      unit,
      originalString: cleanString,
    };
  }

  // Se não encontrar quantidade, assume 1
  return {
    quantity: 1,
    unit: cleanString,
    originalString: cleanString,
  };
};

/**
 * Formata uma quantidade em gramas para exibição
 */
export const formatGramsDisplay = (grams: number): string => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} Quilogramas`;
  }
  return `${grams.toFixed(1)} Gramas`;
};

/**
 * Valida se os dados de preço e medida são válidos
 */
export const validatePriceMeasureData = (data: {
  price: number;
  quantity: number;
  unitMeasure: string;
}): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações obrigatórias
  if (!data.price || data.price <= 0) {
    errors.push('Preço deve ser maior que zero');
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.push('Quantidade deve ser maior que zero');
  }

  if (!data.unitMeasure || data.unitMeasure.trim() === '') {
    errors.push('Unidade de medida é obrigatória');
  }

  // Validações de aviso
  if (data.unitMeasure && !isSupportedUnit(data.unitMeasure)) {
    warnings.push('Unidade de medida não reconhecida para conversão automática');
  }

  if (data.price && data.price > 1000) {
    warnings.push('Preço parece muito alto, verifique se está correto');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Converte dados de preço para formato padrão com conversão automática
 */
export const normalizePriceMeasureData = (data: {
  price: number;
  quantity: number;
  unitMeasure: string;
}): {
  original: typeof data;
  converted: {
    price: number;
    quantity: number;
    unitMeasure: string;
  };
  conversionApplied: boolean;
  conversionDetails?: {
    originalGrams: number;
    convertedGrams: number;
    conversionFactor: number;
  };
} => {
  const result = {
    original: { ...data },
    converted: { ...data },
    conversionApplied: false,
    conversionDetails: undefined as any,
  };

  try {
    const originalGrams = convertToGrams(data.quantity, data.unitMeasure);

    if (originalGrams !== null && originalGrams !== data.quantity) {
      // Conversão foi aplicada
      result.converted = {
        price: data.price,
        quantity: originalGrams,
        unitMeasure: 'Gramas',
      };

      result.conversionApplied = true;
      result.conversionDetails = {
        originalGrams: data.quantity,
        convertedGrams: originalGrams,
        conversionFactor: originalGrams / data.quantity,
      };
    }
  } catch (error) {
    console.warn('Erro na conversão de unidade:', error);
  }

  return result;
};

/**
 * Gera sugestões de unidades baseadas em texto parcial
 */
export const suggestUnits = (partialText: string): string[] => {
  const normalizedInput = partialText.toLowerCase().trim();

  if (!normalizedInput) {
    // Retorna unidades mais comuns
    return [
      'g',
      'kg',
      'ml',
      'l',
      '1 colher (sopa)',
      '1 colher (chá)',
      '1 xícara',
      '1 copo',
      '1 unidade',
    ];
  }

  const allUnits = Object.keys(culinaryConversions);
  const suggestions = allUnits.filter((unit) => unit.toLowerCase().includes(normalizedInput));

  // Adiciona variações comuns
  if (normalizedInput.includes('colher')) {
    suggestions.push('1 colher (sopa)', '1 colher (chá)');
  }

  if (normalizedInput.includes('xícara') || normalizedInput.includes('xicara')) {
    suggestions.push('1 xícara');
  }

  if (normalizedInput.includes('copo')) {
    suggestions.push('1 copo');
  }

  // Converte Set para Array de forma compatível
  const uniqueSuggestions = suggestions.filter(
    (value, index, self) => self.indexOf(value) === index,
  );

  return uniqueSuggestions.slice(0, 10); // Limita a 10
};
