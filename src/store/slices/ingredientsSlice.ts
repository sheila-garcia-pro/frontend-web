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
  itemPerPage: 10,
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
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.itemPerPage = action.payload.itemPerPage;
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
      // Adiciona o novo ingrediente no início da lista, preservando a ordem existente
      state.items = [action.payload, ...state.items];
      state.error = null;
    },
    createIngredientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Atualizar filtros
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.category = action.payload;
    },

    // Atualizar ingrediente
    updateIngredientRequest: (
      state,
      _action: PayloadAction<{ id: string; params: Partial<CreateIngredientParams> }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateIngredientSuccess: (state, action: PayloadAction<Ingredient>) => {
      state.loading = false;
      state.error = null;
      // Atualiza o ingrediente na lista
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item,
      );
      // Atualiza o ingrediente selecionado se estiver aberto
      if (state.selectedIngredient?._id === action.payload._id) {
        state.selectedIngredient = action.payload;
      }
    },
    updateIngredientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Atualizar ingrediente específico
    fetchIngredientByIdRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchIngredientByIdSuccess: (state, action: PayloadAction<Ingredient>) => {
      state.loading = false;
      state.error = null;
      state.selectedIngredient = action.payload;
      // Também atualiza o item na lista
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item,
      );
    },
    fetchIngredientByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Deletar ingrediente
    deleteIngredientRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteIngredientSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = null;
      // Remove o ingrediente da lista
      state.items = state.items.filter((item) => item._id !== action.payload);
      // Limpa o ingrediente selecionado se for o mesmo
      if (state.selectedIngredient?._id === action.payload) {
        state.selectedIngredient = null;
      }
    },
    deleteIngredientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Atualizar preço e medida
    updatePriceMeasureRequest: (
      state,
      _action: PayloadAction<{
        id: string;
        params: { price: number; quantity: number; unitMeasure: string };
      }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updatePriceMeasureSuccess: (state, action: PayloadAction<Ingredient>) => {
      state.loading = false;
      state.error = null;
      // Atualiza o ingrediente na lista
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item,
      );
      // Atualiza o ingrediente selecionado se estiver aberto
      if (state.selectedIngredient?._id === action.payload._id) {
        state.selectedIngredient = action.payload;
      }
    },
    updatePriceMeasureFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchIngredientsRequest,
  fetchIngredientsSuccess,
  fetchIngredientsFailure,
  createIngredientRequest,
  createIngredientSuccess,
  createIngredientFailure,
  updateIngredientRequest,
  updateIngredientSuccess,
  updateIngredientFailure,
  fetchIngredientByIdRequest,
  fetchIngredientByIdSuccess,
  fetchIngredientByIdFailure,
  deleteIngredientRequest,
  deleteIngredientSuccess,
  deleteIngredientFailure,
  setCategoryFilter,
  updatePriceMeasureRequest,
  updatePriceMeasureSuccess,
  updatePriceMeasureFailure,
} = ingredientsSlice.actions;

// Exporta reducer
export default ingredientsSlice.reducer;
