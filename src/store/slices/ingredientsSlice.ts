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
    sort: string;
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
    sort: 'name_asc',
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

      // Substitui completamente a lista com os dados da API
      state.items = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page || 1; // Normaliza valores undefined
      state.itemPerPage = action.payload.itemPerPage || 1000;
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
      state.error = null;

      // ✅ NÃO adiciona o item à lista - a lista já foi recarregada via fetchIngredientsSuccess
      // Apenas confirma que a operação foi bem sucedida
    },
    createIngredientFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Atualizar filtros
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.category = action.payload;
    },
    setSortFilter: (state, action: PayloadAction<string>) => {
      state.filter.sort = action.payload;
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
      // Atualiza o total para refletir a remoção
      state.total = Math.max(0, state.total - 1);
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
  setSortFilter,
  updatePriceMeasureRequest,
  updatePriceMeasureSuccess,
  updatePriceMeasureFailure,
} = ingredientsSlice.actions;

// Exporta reducer
export default ingredientsSlice.reducer;
