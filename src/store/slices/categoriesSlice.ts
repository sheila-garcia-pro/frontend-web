import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategoriesResponse, SearchParams } from '../../types/ingredients';

// Interface do estado
export interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  itemPerPage: number;
  selectedCategory: Category | null;
}

// Estado inicial
const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  itemPerPage: 20, // Valor maior para categorias, pois geralmente são menos
  selectedCategory: null,
};

// Slice de categorias
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Obter lista de categorias
    fetchCategoriesRequest: (state, action: PayloadAction<Omit<SearchParams, 'category'>>) => {
      state.loading = true;
      state.error = null;
      state.page = action.payload.page;
      state.itemPerPage = action.payload.itemPerPage;
    },
    fetchCategoriesSuccess: (state, action: PayloadAction<CategoriesResponse>) => {
      state.loading = false;
      state.items = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.itemPerPage = action.payload.itemPerPage;
    },
    fetchCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Obter categoria por ID
    fetchCategoryByIdRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCategoryByIdSuccess: (state, action: PayloadAction<Category>) => {
      state.loading = false;
      state.selectedCategory = action.payload;
    },
    fetchCategoryByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Criar categoria
    createCategoryRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createCategorySuccess: (state, action: PayloadAction<Category>) => {
      state.loading = false;
      // Adicionar a nova categoria ao início da lista
      state.items = [action.payload, ...state.items];
      // Atualizar o total
      state.total += 1;
    },
    createCategoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Exporta actions
export const {
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchCategoryByIdRequest,
  fetchCategoryByIdSuccess,
  fetchCategoryByIdFailure,
  createCategoryRequest,
  createCategorySuccess,
  createCategoryFailure,
} = categoriesSlice.actions;

// Exporta reducer
export default categoriesSlice.reducer; 