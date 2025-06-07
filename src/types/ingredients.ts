// Interfaces para Ingredientes
export interface Ingredient {
  _id: string;
  name: string;
  category: string;
  image: string;
  isEdit?: boolean;
  price?: {
    price: number;
    quantity: number;
    unitMeasure: string;
  };
}

// Interface para criação de ingrediente
export interface CreateIngredientParams {
  name: string;
  category: string;
  image: string;
  price?: {
    price: string | number;
    quantity: string | number;
    unitMeasure: string;
  };
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

// Interface para parâmetros de busca
export interface SearchParams {
  page: number;
  itemPerPage: number;
  category?: string | null;
  search?: string;
}
