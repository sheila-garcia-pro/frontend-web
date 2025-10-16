// Interface para ingredientes da receita vindos da API
export interface RecipeIngredientAPI {
  idIngredient: string;
  quantityIngredientRecipe: string;
  unitAmountUseIngredient: string;
  priceQuantityIngredient?: number;
  unitMeasure?: string;
}

export interface Recipe {
  _id: string;
  name: string;
  category: string;
  image: string;
  yieldRecipe: string;
  typeYield: string;
  preparationTime: string;
  weightRecipe: string;
  typeWeightRecipe: string;
  descripition: string;
  ingredients: RecipeIngredientAPI[];
  modePreparation?: string[];
  // Campos financeiros atualizados
  priceSale?: number;
  priceCost?: number;
  priceProfit?: number;
  costDirect?: CostItem[];
  costIndirect?: CostItem[];
  // Campos antigos para compatibilidade
  sellingPrice?: number;
  costPrice?: number;
  profit?: number;
}

export interface RecipesResponse {
  data: Recipe[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface RecipeDetailResponse {
  recipes: Recipe;
}

export interface SearchParams {
  page?: number;
  itemPerPage?: number;
  category?: string;
  name?: string;
}

// Interface para custos diretos e indiretos
export interface CostItem {
  name: string;
  cost: number;
  description: string;
}

export interface CreateRecipeParams {
  name: string;
  category: string;
  image?: string | null;
  yieldRecipe: string;
  typeYield: string;
  preparationTime: string;
  weightRecipe: string;
  typeWeightRecipe: string;
  descripition: string;
  ingredients: RecipeIngredientAPI[];
  modePreparation?: string[];
  // Novos campos financeiros obrigatórios
  priceSale: number;
  priceCost: number;
  priceProfit: number;
  costDirect: CostItem[];
  costIndirect: CostItem[];
  // Campos antigos para compatibilidade
  sellingPrice?: number;
  costPrice?: number;
  profit?: number;
}
