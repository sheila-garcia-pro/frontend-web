// utils/menuCalculations.ts - Sistema de cálculos financeiros para cardápios

export interface MenuFinancialData {
  totalCost: number;
  unitCost: number;
  sellPrice: number;
  profitMargin: number;
  markup: number;
  itemsCost: number;
  directCosts: number;
  indirectCosts: number;
}

export interface MenuCalculationParams {
  totalItems: number;
  itemsCost?: number;
  directCostsPercentage?: number;
  indirectCostsPercentage?: number;
  sellPrice?: number;
}

/**
 * Calcula todos os valores financeiros de um cardápio
 */
export const calculateMenuFinancials = (params: MenuCalculationParams): MenuFinancialData => {
  const {
    totalItems,
    itemsCost = 0,
    directCostsPercentage = 0,
    indirectCostsPercentage = 0,
    sellPrice = 0,
  } = params;

  // Cálculo dos custos
  const directCosts = (itemsCost * directCostsPercentage) / 100;
  const indirectCosts = (itemsCost * indirectCostsPercentage) / 100;
  const totalCost = itemsCost + directCosts + indirectCosts;

  // Custo unitário
  const unitCost = totalItems > 0 ? totalCost / totalItems : 0;

  // Cálculos de margem e markup
  let profitMargin = 0;
  let markup = 0;

  if (sellPrice > 0 && totalCost > 0) {
    // Margem de lucro: (Preço de Venda - Custo Total) / Preço de Venda * 100
    profitMargin = ((sellPrice - totalCost) / sellPrice) * 100;

    // Markup: (Preço de Venda - Custo Total) / Custo Total * 100
    markup = ((sellPrice - totalCost) / totalCost) * 100;
  } else if (sellPrice === 0 && totalCost > 0) {
    // Se não há preço de venda mas há custo, margem é -100%
    profitMargin = -100;
    markup = 0;
  }

  return {
    totalCost: Math.max(0, totalCost),
    unitCost: Math.max(0, unitCost),
    sellPrice: Math.max(0, sellPrice),
    profitMargin: Math.round(profitMargin * 100) / 100, // 2 casas decimais
    markup: Math.round(markup * 100) / 100, // 2 casas decimais
    itemsCost: Math.max(0, itemsCost),
    directCosts: Math.max(0, directCosts),
    indirectCosts: Math.max(0, indirectCosts),
  };
};

/**
 * Formata valor monetário para exibição
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Formata percentual para exibição
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Valida se os cálculos estão corretos
 */
export const validateCalculations = (data: MenuFinancialData): string[] => {
  const errors: string[] = [];

  // Verifica se custo total = soma dos custos detalhados
  const expectedTotal = data.itemsCost + data.directCosts + data.indirectCosts;
  if (Math.abs(data.totalCost - expectedTotal) > 0.01) {
    errors.push(
      `Custo total (${formatCurrency(data.totalCost)}) não confere com a soma dos custos detalhados (${formatCurrency(expectedTotal)})`,
    );
  }

  // Verifica custo unitário
  if (data.totalCost > 0 && data.unitCost <= 0) {
    errors.push('Custo unitário deve ser maior que zero quando há custo total');
  }

  // Verifica margem quando há preço de venda
  if (data.sellPrice > 0 && data.totalCost > 0) {
    const expectedMargin = ((data.sellPrice - data.totalCost) / data.sellPrice) * 100;
    if (Math.abs(data.profitMargin - expectedMargin) > 0.1) {
      errors.push(
        `Margem de lucro calculada incorretamente. Esperado: ${formatPercentage(expectedMargin)}, Atual: ${formatPercentage(data.profitMargin)}`,
      );
    }
  }

  return errors;
};
