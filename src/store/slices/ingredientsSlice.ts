import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Ingredient,
  IngredientsResponse,
  SearchParams,
  CreateIngredientParams,
} from '../../types/ingredients';

// Interface do estado
export interface IngredientsState {
  items: Ingredient[];
  loading: boolean;
  error: string | null;
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
    fetchIngredientsRequest: (state, _action: PayloadAction<SearchParams>) => {
      state.loading = true;
      state.error = null;
    },
    fetchIngredientsSuccess: (state, action: PayloadAction<IngredientsResponse>) => {
      state.loading = false;
      state.error = null;
      state.items = action.payload.data;
    },
    fetchIngredientsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.items = [];
    },

    // Criar ingrediente
    createIngredientRequest: (state, _action: PayloadAction<CreateIngredientParams>) => {
      state.loading = true;
      state.error = null;
    },
    createIngredientSuccess: (state, action: PayloadAction<Ingredient>) => {
      state.loading = false;
      state.items = [action.payload, ...state.items];
    },
    createIngredientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Atualizar filtros
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.category = action.payload;
    },
  },
});

// Exporta actions
export const {
  fetchIngredientsRequest,
  fetchIngredientsSuccess,
  fetchIngredientsFailure,
  createIngredientRequest,
  createIngredientSuccess,
  createIngredientFailure,
  setCategoryFilter,
} = ingredientsSlice.actions;

// Exporta reducer
export default ingredientsSlice.reducer;
