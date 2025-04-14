import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Tipos
export interface DashboardSummary {
  totalPedidos: number;
  pedidosEmAndamento: number;
  clientesCadastrados: number;
  faturamentoTotal: string;
}

export interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
};

// Dados mockados da dashboard
const mockDashboardData: DashboardSummary = {
  totalPedidos: 124,
  pedidosEmAndamento: 18,
  clientesCadastrados: 387,
  faturamentoTotal: 'R$ 28.456,00',
};

// Thunk para simular carregamento de dados
export const fetchDashboardData = createAsyncThunk('dashboard/fetchData', async (_, { rejectWithValue }) => {
  try {
    // Simulando um delay de carregamento
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Simulação de sucesso com 90% de chance
    if (Math.random() > 0.1) {
      return mockDashboardData;
    } else {
      // Simulação de erro com 10% de chance
      throw new Error('Erro ao carregar dados da dashboard');
    }
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

// Slice da dashboard
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.summary = null;
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Início da busca
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Busca concluída com sucesso
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<DashboardSummary>) => {
        state.loading = false;
        state.summary = action.payload;
        state.error = null;
      })
      // Erro na busca
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Exporta actions
export const { clearDashboardData, clearDashboardError } = dashboardSlice.actions;

// Exporta reducer
export default dashboardSlice.reducer; 