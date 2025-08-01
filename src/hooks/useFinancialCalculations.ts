import { useState, useCallback, useMemo } from 'react';
import {
  FinancialData,
  FinancialCalculations,
  FinancialChartData,
  DirectCost,
  IndirectCost,
  ViewType,
  CHART_COLORS,
} from '../types/financial';
import { RecipeIngredient } from '../types/recipeIngredients';

export const useFinancialCalculations = (
  recipeIngredients: RecipeIngredient[] = [],
  initialData?: Partial<FinancialData>,
) => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    ingredientsCost: 0,
    directCosts: [],
    indirectCosts: [],
    monthlyRevenue: 0,
    totalSalePrice: 0,
    unitSalePrice: 0,
    totalYield: 1,
    unitYield: 1,
    totalDirectCosts: [],
    unitDirectCosts: [],
    ...initialData,
  });

  const [viewType, setViewType] = useState<ViewType>('total');

  // Calcular custo dos ingredientes
  const ingredientsCost = useMemo(() => {
    return recipeIngredients.reduce((total, ingredient) => {
      return total + (ingredient.totalCost || 0);
    }, 0);
  }, [recipeIngredients]);

  // Calcular custos diretos
  const calculateDirectCosts = useCallback(
    (directCosts: DirectCost[], salePrice: number): number => {
      if (!isFinite(salePrice) || salePrice < 0) return 0;

      return directCosts.reduce((total, cost) => {
        if (!isFinite(cost.value) || cost.value < 0) return total;

        if (cost.isPercentage) {
          const percentageValue = Math.min(cost.value, 100); // Limitar a 100%
          return total + (salePrice * percentageValue) / 100;
        }
        return total + Math.min(cost.value, 999999); // Limitar valor máximo
      }, 0);
    },
    [],
  );

  // Calcular custos indiretos
  const calculateIndirectCosts = useCallback(
    (indirectCosts: IndirectCost[], monthlyRevenue: number, salePrice: number): number => {
      if (
        !isFinite(monthlyRevenue) ||
        monthlyRevenue <= 0 ||
        !isFinite(salePrice) ||
        salePrice <= 0
      )
        return 0;

      const totalIndirectCosts = indirectCosts.reduce((total, cost) => {
        if (!isFinite(cost.monthlyValue) || cost.monthlyValue < 0) return total;
        return total + Math.min(cost.monthlyValue, 999999); // Limitar valor máximo
      }, 0);

      if (totalIndirectCosts === 0) return 0;

      const indirectCostPercentage = totalIndirectCosts / monthlyRevenue;
      const limitedPercentage = Math.min(indirectCostPercentage, 1); // Limitar a 100%
      return salePrice * limitedPercentage;
    },
    [],
  );

  // Cálculos principais
  const calculations = useMemo((): FinancialCalculations => {
    const {
      directCosts,
      indirectCosts,
      monthlyRevenue,
      totalSalePrice,
      unitSalePrice,
      totalYield,
      unitYield,
      totalDirectCosts,
      unitDirectCosts,
    } = financialData;

    // Custos diretos
    const totalDirectCostsValue = calculateDirectCosts(
      [...directCosts, ...totalDirectCosts],
      totalSalePrice,
    );
    const unitDirectCostsValue = calculateDirectCosts(
      [...directCosts, ...unitDirectCosts],
      unitSalePrice,
    );

    // Custos indiretos
    const indirectCostsTotal = calculateIndirectCosts(
      indirectCosts,
      monthlyRevenue,
      totalSalePrice,
    );
    const indirectCostsUnit = calculateIndirectCosts(indirectCosts, monthlyRevenue, unitSalePrice);

    // Validar ingredientsCost
    const validIngredientsCost =
      isFinite(ingredientsCost) && ingredientsCost >= 0 ? ingredientsCost : 0;

    // Validar yields
    const validTotalYield = isFinite(totalYield) && totalYield > 0 ? totalYield : 1;
    const validUnitYield = isFinite(unitYield) && unitYield > 0 ? unitYield : 1;

    // Validar preços de venda
    const validTotalSalePrice =
      isFinite(totalSalePrice) && totalSalePrice >= 0 ? totalSalePrice : 0;
    const validUnitSalePrice = isFinite(unitSalePrice) && unitSalePrice >= 0 ? unitSalePrice : 0;

    // Custos totais
    const totalCost = Math.min(
      validIngredientsCost + totalDirectCostsValue + indirectCostsTotal,
      999999,
    );
    const unitCost = Math.min(
      validIngredientsCost / validTotalYield + unitDirectCostsValue + indirectCostsUnit,
      999999,
    );

    // CMV (Custo de Mercadoria Vendida)
    const cmvTotal =
      validTotalSalePrice > 0 ? Math.min((totalCost / validTotalSalePrice) * 100, 999) : 0;
    const cmvUnit =
      validUnitSalePrice > 0 ? Math.min((unitCost / validUnitSalePrice) * 100, 999) : 0;
    const cmv = viewType === 'total' ? cmvTotal : cmvUnit;

    // Margem de lucro
    const totalProfitMargin =
      validTotalSalePrice > 0
        ? Math.max(
            Math.min(((validTotalSalePrice - totalCost) / validTotalSalePrice) * 100, 999),
            -999,
          )
        : 0;
    const unitProfitMargin =
      validUnitSalePrice > 0
        ? Math.max(
            Math.min(((validUnitSalePrice - unitCost) / validUnitSalePrice) * 100, 999),
            -999,
          )
        : 0;
    const profitMargin = viewType === 'total' ? totalProfitMargin : unitProfitMargin;

    // Markup
    const totalMarkup = totalCost > 0 ? Math.min(validTotalSalePrice / totalCost, 99.9) : 1;
    const unitMarkup = unitCost > 0 ? Math.min(validUnitSalePrice / unitCost, 99.9) : 1;
    const markup = viewType === 'total' ? totalMarkup : unitMarkup;

    // Lucros
    const totalProfit = Math.max(Math.min(validTotalSalePrice - totalCost, 999999), -999999);
    const unitProfit = Math.max(Math.min(validUnitSalePrice - unitCost, 999999), -999999);

    // Porcentagens sobre preço de venda
    const currentSalePrice = viewType === 'total' ? validTotalSalePrice : validUnitSalePrice;
    const currentDirectCosts = viewType === 'total' ? totalDirectCostsValue : unitDirectCostsValue;
    const currentIndirectCosts = viewType === 'total' ? indirectCostsTotal : indirectCostsUnit;
    const currentIngredientsCost =
      viewType === 'total' ? validIngredientsCost : validIngredientsCost / validTotalYield;

    const ingredientsCostPercentage =
      currentSalePrice > 0 ? Math.min((currentIngredientsCost / currentSalePrice) * 100, 999) : 0;
    const directCostsPercentage =
      currentSalePrice > 0 ? Math.min((currentDirectCosts / currentSalePrice) * 100, 999) : 0;
    const indirectCostsPercentage =
      currentSalePrice > 0 ? Math.min((currentIndirectCosts / currentSalePrice) * 100, 999) : 0;
    const profitPercentage = profitMargin;

    return {
      totalCost,
      unitCost,
      totalIngredientsCost: ingredientsCost,
      totalDirectCosts: totalDirectCostsValue,
      unitDirectCosts: unitDirectCostsValue,
      indirectCostsTotal,
      indirectCostsUnit,
      cmv,
      profitMargin,
      markup,
      totalProfit,
      unitProfit,
      ingredientsCostPercentage,
      directCostsPercentage,
      indirectCostsPercentage,
      profitPercentage,
    };
  }, [financialData, ingredientsCost, viewType, calculateDirectCosts, calculateIndirectCosts]);

  // Dados para o gráfico
  const chartData = useMemo((): FinancialChartData[] => {
    const currentSalePrice =
      viewType === 'total' ? financialData.totalSalePrice : financialData.unitSalePrice;

    if (currentSalePrice === 0) return [];

    const data: FinancialChartData[] = [];

    // Ingredientes
    if (calculations.ingredientsCostPercentage > 0) {
      data.push({
        label: 'Ingredientes',
        value:
          viewType === 'total'
            ? calculations.totalIngredientsCost
            : calculations.totalIngredientsCost / (financialData.totalYield || 1),
        percentage: calculations.ingredientsCostPercentage,
        color: CHART_COLORS.ingredients,
        description: 'Custo dos ingredientes da receita',
      });
    }

    // Custos diretos
    if (calculations.directCostsPercentage > 0) {
      data.push({
        label: 'Custos Diretos',
        value: viewType === 'total' ? calculations.totalDirectCosts : calculations.unitDirectCosts,
        percentage: calculations.directCostsPercentage,
        color: CHART_COLORS.directCosts,
        description: 'Outros custos diretos (embalagem, taxas, etc.)',
      });
    }

    // Custos indiretos
    if (calculations.indirectCostsPercentage > 0) {
      data.push({
        label: 'Custos Indiretos',
        value:
          viewType === 'total' ? calculations.indirectCostsTotal : calculations.indirectCostsUnit,
        percentage: calculations.indirectCostsPercentage,
        color: CHART_COLORS.indirectCosts,
        description: 'Despesas fixas mensais rateadas',
      });
    }

    // Lucro
    if (calculations.profitPercentage > 0) {
      data.push({
        label: 'Lucro',
        value: viewType === 'total' ? calculations.totalProfit : calculations.unitProfit,
        percentage: calculations.profitPercentage,
        color: CHART_COLORS.profit,
        description: 'Margem de lucro da receita',
      });
    }

    return data;
  }, [calculations, financialData, viewType]);

  // Atualizar dados financeiros
  const updateFinancialData = useCallback((updates: Partial<FinancialData>) => {
    setFinancialData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Adicionar custo direto
  const addDirectCost = useCallback((cost: Omit<DirectCost, 'id'>, isForTotal: boolean = true) => {
    const newCost: DirectCost = {
      ...cost,
      id: Date.now().toString(),
    };

    if (isForTotal) {
      setFinancialData((prev) => ({
        ...prev,
        totalDirectCosts: [...prev.totalDirectCosts, newCost],
      }));
    } else {
      setFinancialData((prev) => ({
        ...prev,
        unitDirectCosts: [...prev.unitDirectCosts, newCost],
      }));
    }
  }, []);

  // Remover custo direto
  const removeDirectCost = useCallback((id: string, isForTotal: boolean = true) => {
    if (isForTotal) {
      setFinancialData((prev) => ({
        ...prev,
        totalDirectCosts: prev.totalDirectCosts.filter((cost) => cost.id !== id),
      }));
    } else {
      setFinancialData((prev) => ({
        ...prev,
        unitDirectCosts: prev.unitDirectCosts.filter((cost) => cost.id !== id),
      }));
    }
  }, []);

  // Adicionar custo indireto
  const addIndirectCost = useCallback((cost: Omit<IndirectCost, 'id'>) => {
    const newCost: IndirectCost = {
      ...cost,
      id: Date.now().toString(),
    };

    setFinancialData((prev) => ({
      ...prev,
      indirectCosts: [...prev.indirectCosts, newCost],
    }));
  }, []);

  // Remover custo indireto
  const removeIndirectCost = useCallback((id: string) => {
    setFinancialData((prev) => ({
      ...prev,
      indirectCosts: prev.indirectCosts.filter((cost) => cost.id !== id),
    }));
  }, []);

  // Calcular preço de venda baseado na margem
  const calculateSalePriceFromMargin = useCallback(
    (margin: number) => {
      const currentCost = viewType === 'total' ? calculations.totalCost : calculations.unitCost;
      if (currentCost === 0) return 0;

      return currentCost / (1 - margin / 100);
    },
    [calculations, viewType],
  );

  // Calcular preço de venda baseado no markup
  const calculateSalePriceFromMarkup = useCallback(
    (markup: number) => {
      const currentCost = viewType === 'total' ? calculations.totalCost : calculations.unitCost;
      return currentCost * markup;
    },
    [calculations, viewType],
  );

  return {
    financialData,
    calculations,
    chartData,
    viewType,
    ingredientsCost,
    updateFinancialData,
    setViewType,
    addDirectCost,
    removeDirectCost,
    addIndirectCost,
    removeIndirectCost,
    calculateSalePriceFromMargin,
    calculateSalePriceFromMarkup,
  };
};

export default useFinancialCalculations;
