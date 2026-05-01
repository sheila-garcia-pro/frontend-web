import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Coupon,
  CouponsResponse,
  CouponSearchParams,
  CreateCouponParams,
  UpdateCouponParams,
} from '../../types/coupons';

// Interface do estado
export interface CouponsState {
  items: Coupon[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  itemPerPage: number;
  selectedCoupon: Coupon | null;
}

// Estado inicial
const initialState: CouponsState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 1,
  itemPerPage: 10,
  selectedCoupon: null,
};

// Slice de cupons
const couponsSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    // Obter lista de cupons
    fetchCouponsRequest: (state, _action: PayloadAction<CouponSearchParams>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCouponsSuccess: (state, action: PayloadAction<CouponsResponse>) => {
      state.loading = false;
      state.error = null;
      state.items = action.payload.data;
      state.total = action.payload.total;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
    },
    fetchCouponsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.items = [];
    },

    // Criar cupom
    createCouponRequest: (state, _action: PayloadAction<CreateCouponParams>) => {
      state.loading = true;
      state.error = null;
    },
    createCouponSuccess: (state, action: PayloadAction<Coupon>) => {
      state.loading = false;
      state.error = null;
      // Adiciona o novo cupom no início da lista
      state.items = [action.payload, ...state.items];
      state.total = state.total + 1;
    },
    createCouponFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Atualizar cupom
    updateCouponRequest: (
      state,
      _action: PayloadAction<{ id: string; params: UpdateCouponParams }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    updateCouponSuccess: (state, action: PayloadAction<Coupon>) => {
      state.loading = false;
      state.error = null;
      // Atualiza o cupom na lista
      state.items = state.items.map((item) =>
        item._id === action.payload._id ? action.payload : item,
      );
      // Atualiza o cupom selecionado se estiver aberto
      if (state.selectedCoupon?._id === action.payload._id) {
        state.selectedCoupon = action.payload;
      }
    },
    updateCouponFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Deletar cupom
    deleteCouponRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteCouponSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = null;
      // Remove o cupom da lista
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
      // Limpa o cupom selecionado se for o mesmo
      if (state.selectedCoupon?._id === action.payload) {
        state.selectedCoupon = null;
      }
    },
    deleteCouponFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Obter cupom por ID
    fetchCouponByIdRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCouponByIdSuccess: (state, action: PayloadAction<Coupon>) => {
      state.loading = false;
      state.error = null;
      state.selectedCoupon = action.payload;
      // Atualiza o item na lista se existir
      const itemIndex = state.items.findIndex((item) => item._id === action.payload._id);
      if (itemIndex !== -1) {
        state.items[itemIndex] = action.payload;
      }
    },
    fetchCouponByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Selecionar cupom (para visualização)
    setSelectedCoupon: (state, action: PayloadAction<Coupon | null>) => {
      state.selectedCoupon = action.payload;
    },

    // Limpar erro
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchCouponsRequest,
  fetchCouponsSuccess,
  fetchCouponsFailure,
  createCouponRequest,
  createCouponSuccess,
  createCouponFailure,
  updateCouponRequest,
  updateCouponSuccess,
  updateCouponFailure,
  deleteCouponRequest,
  deleteCouponSuccess,
  deleteCouponFailure,
  fetchCouponByIdRequest,
  fetchCouponByIdSuccess,
  fetchCouponByIdFailure,
  setSelectedCoupon,
  clearError,
} = couponsSlice.actions;

// Selectors
export const selectCoupons = (state: { coupons: CouponsState }) => state.coupons.items;
export const selectCouponsLoading = (state: { coupons: CouponsState }) => state.coupons.loading;
export const selectCouponsError = (state: { coupons: CouponsState }) => state.coupons.error;
export const selectSelectedCoupon = (state: { coupons: CouponsState }) =>
  state.coupons.selectedCoupon;
export const selectCouponsPagination = (state: { coupons: CouponsState }) => ({
  total: state.coupons.total,
  currentPage: state.coupons.currentPage,
  totalPages: state.coupons.totalPages,
  itemPerPage: state.coupons.itemPerPage,
});

// Exporta reducer
export default couponsSlice.reducer;
