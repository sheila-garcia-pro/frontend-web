// Interfaces para sistema financeiro de receitas

export interface DirectCost {
  id: string;
  name: string;
  value: number;
  isPercentage: boolean; // se é porcentagem do preço de venda
  description?: string;
}

export interface IndirectCost {
  id: string;
  name: string;
  monthlyValue: number;
  description?: string;
}

export interface FinancialData {
  // Custos
  ingredientsCost: number; // custo dos ingredientes
  directCosts: DirectCost[]; // outros custos diretos
  indirectCosts: IndirectCost[]; // custos indiretos
  monthlyRevenue: number; // faturamento médio mensal

  // Preços
  totalSalePrice: number; // preço de venda total
  unitSalePrice: number; // preço de venda unitário

  // Rendimento
  totalYield: number; // rendimento total da receita
  unitYield: number; // rendimento unitário

  // Configurações
  totalDirectCosts: DirectCost[]; // custos diretos específicos para quantidade total
  unitDirectCosts: DirectCost[]; // custos diretos específicos para quantidade unitária
}

export interface FinancialCalculations {
  // Custos totais
  totalCost: number; // custo total da receita
  unitCost: number; // custo unitário

  // Detalhes dos custos
  totalIngredientsCost: number;
  totalDirectCosts: number;
  unitDirectCosts: number;
  indirectCostsTotal: number;
  indirectCostsUnit: number;

  // Análises financeiras
  cmv: number; // custo de mercadoria vendida (%)
  profitMargin: number; // margem de lucro (%)
  markup: number; // markup sobre o CMV

  // Lucros
  totalProfit: number;
  unitProfit: number;

  // Porcentagens sobre preço de venda
  ingredientsCostPercentage: number;
  directCostsPercentage: number;
  indirectCostsPercentage: number;
  profitPercentage: number;
}

export interface FinancialChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
  description?: string;
}

export interface FinancialSettings {
  showTotalView: boolean; // true para total, false para unitário
  autoCalculateIndirectCosts: boolean;
  defaultMarkup: number;
  defaultProfitMargin: number;
}

// Tipos para formulários
export interface DirectCostForm {
  name: string;
  value: string;
  isPercentage: boolean;
  description?: string;
}

export interface IndirectCostForm {
  name: string;
  monthlyValue: string;
  description?: string;
}

export interface FinancialFormData {
  monthlyRevenue: string;
  totalSalePrice: string;
  unitSalePrice: string;
  directCosts: DirectCostForm[];
  indirectCosts: IndirectCostForm[];
  totalDirectCosts: DirectCostForm[];
  unitDirectCosts: DirectCostForm[];
}

// Constantes para cores do gráfico
export const CHART_COLORS = {
  ingredients: '#4CAF50', // Verde para ingredientes
  directCosts: '#FF9800', // Laranja para custos diretos
  indirectCosts: '#2196F3', // Azul para custos indiretos
  profit: '#9C27B0', // Roxo para lucro
} as const;

// Cores para status dos valores
export const STATUS_COLORS = {
  cost: {
    background: '#ffebee', // Vermelho claro
    border: '#f44336', // Vermelho
    text: '#c62828', // Vermelho escuro
  },
  price: {
    background: '#e8f5e8', // Verde claro
    border: '#4caf50', // Verde
    text: '#2e7d32', // Verde escuro
  },
  neutral: {
    background: '#f5f5f5', // Cinza claro
    border: '#9e9e9e', // Cinza
    text: '#424242', // Cinza escuro
  },
  warning: {
    background: '#fff3e0', // Laranja claro
    border: '#ff9800', // Laranja
    text: '#e65100', // Laranja escuro
  },
  info: {
    background: '#e3f2fd', // Azul claro
    border: '#2196f3', // Azul
    text: '#1565c0', // Azul escuro
  },
} as const;

// Tipos de visualização
export type ViewType = 'total' | 'unit';
export type CostType = 'ingredients' | 'direct' | 'indirect' | 'profit';
