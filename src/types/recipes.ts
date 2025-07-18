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
  sku: string;
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
  search?: string;
}

export interface CreateRecipeParams {
  name: string;
  sku: string;
  category: string;
  image: string | null;
  yieldRecipe: string;
  typeYield: string;
  preparationTime: string;
  weightRecipe: string;
  typeWeightRecipe: string;
  descripition: string;
  ingredients?: RecipeIngredientAPI[];
  modePreparation?: string[];
}
