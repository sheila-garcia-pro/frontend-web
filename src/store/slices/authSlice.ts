import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import tokenManager from '@utils/tokenManager';

// Tipos
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  image?: string;
  dateOfBirth?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Verificar se há token armazenado para definir estado inicial
const getInitialAuthState = (): AuthState => {
  const token = tokenManager.getToken();

  if (token) {
    console.log('🔐 Token encontrado no localStorage - inicializando como autenticado');
    return {
      user: null, // Será preenchido quando checkAuth for executado
      token,
      isAuthenticated: true,
      loading: true, // Inicia carregando para verificar se o token é válido
      error: null,
    };
  }

  console.log('❌ Nenhum token encontrado - inicializando como não autenticado');
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

// Estado inicial
const initialState: AuthState = getInitialAuthState();

// Slice de autenticação
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login
    loginRequest: (state, _action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    // Registro
    registerRequest: (
      state,
      _action: PayloadAction<{ name: string; email: string; password: string; phone: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },

    // Recuperação de senha
    forgotPasswordRequest: (state, _action: PayloadAction<{ email: string }>) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Redefinição de senha com token
    resetPasswordRequest: (
      state,
      _action: PayloadAction<{ token: string; newPassword: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Verificação de token
    checkAuthRequest: (state) => {
      state.loading = true;
    },
    checkAuthSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    checkAuthFailure: (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    // Atualização do usuário
    updateUserRequest: (state, _action: PayloadAction<Partial<User>>) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
    },
    updateUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    }, // Limpar erros
    clearError: (state) => {
      state.error = null;
    },

    // Sessão expirada - limpa tudo e força logout
    sessionExpired: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = 'Sua sessão expirou. Faça login novamente.';
    },
  },
});

// Exporta actions
export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  registerRequest,
  registerSuccess,
  registerFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  checkAuthRequest,
  checkAuthSuccess,
  checkAuthFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  clearError,
  sessionExpired,
} = authSlice.actions;

// Exporta reducer
export default authSlice.reducer;
