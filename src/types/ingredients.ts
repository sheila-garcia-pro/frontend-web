// Interfaces para Ingredientes
export interface Ingredient {
  _id: string;
  name: string;
  category: string;
  image: string;
  isEdit?: boolean;
  correctionFactor?: number; // Fator de correção para perdas e desperdício
  price?: {
    price: number;
    quantity: number;
    unitMeasure: string;
    pricePerPortion?: number; // Preço por porção calculado
  };
}

// Interface para criação de ingrediente
export interface CreateIngredientParams {
  name: string;
  category: string;
  image: string;
  correctionFactor?: number; // Fator de correção para perdas e desperdício
  price?: {
    price: string | number;
    quantity: string | number;
    unitMeasure: string;
    pricePerPortion?: string | number; // Preço por porção
  };
}

// Interface para parâmetros de busca
export interface SearchParams {
  page: number;
  itemPerPage: number;
  category?: string;
  search?: string;
  forceRefresh?: boolean;
}

// Interface para resposta da API de ingredientes
export interface IngredientsResponse {
  data: Ingredient[];
  total: number;
  page: number;
  itemPerPage: number;
}

// Interfaces para Categorias
export interface Category {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
}

// Interface para criação de categoria
export interface CreateCategoryParams {
  name: string;
}

// Interface para resposta da API de categorias
export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  itemPerPage: number;
}

// (Removido: declaração duplicada de SearchParams)
