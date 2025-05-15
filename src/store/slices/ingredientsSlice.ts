import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ingredient, IngredientsResponse, SearchParams } from '../../types/ingredients';

// Interface do estado
export interface IngredientsState {
  items: Ingredient[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  itemPerPage: number;
  filter: {
    category: string | null;
    search: string;
  };
  selectedIngredient: Ingredient | null;
}

// Estado inicial
const initialState: IngredientsState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  itemPerPage: 12,
  filter: {
    category: null,
    search: '',
  },
  selectedIngredient: null,
};

// Slice de ingredientes
const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    // Obter lista de ingredientes
    fetchIngredientsRequest: (state, action: PayloadAction<SearchParams>) => {
      state.loading = true;
      state.error = null;
      state.page = action.payload.page;
      state.itemPerPage = action.payload.itemPerPage;
      if (action.payload.category) {
        state.filter.category = action.payload.category;
      }
      if (action.payload.search) {
        state.filter.search = action.payload.search;
      }
    },
    fetchIngredientsSuccess: (state, action: PayloadAction<IngredientsResponse>) => {
      state.loading = false;
      state.items = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.itemPerPage = action.payload.itemPerPage;
    },
    fetchIngredientsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Obter ingrediente por ID
    fetchIngredientByIdRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchIngredientByIdSuccess: (state, action: PayloadAction<Ingredient>) => {
      state.loading = false;
      state.selectedIngredient = action.payload;
    },
    fetchIngredientByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Criar ingrediente
    createIngredientRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createIngredientSuccess: (state, action: PayloadAction<Ingredient>) => {
      state.loading = false;
      // Adicionar o novo ingrediente ao início da lista
      state.items = [action.payload, ...state.items];
      // Atualizar o total
      state.total += 1;
    },
    createIngredientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Atualizar filtros
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filter.search = action.payload;
      // Resetar página ao mudar filtro
      state.page = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.category = action.payload;
      // Resetar página ao mudar filtro
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
});

// Exporta actions
export const {
  fetchIngredientsRequest,
  fetchIngredientsSuccess,
  fetchIngredientsFailure,
  fetchIngredientByIdRequest,
  fetchIngredientByIdSuccess,
  fetchIngredientByIdFailure,
  createIngredientRequest,
  createIngredientSuccess,
  createIngredientFailure,
  setSearchFilter,
  setCategoryFilter,
  setPage,
} = ingredientsSlice.actions;

// Exporta reducer
export default ingredientsSlice.reducer; 