import api from './index';
import { User } from '@store/slices/authSlice';
import tokenManager from '@utils/tokenManager';

// Interfaces
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  status?: number;
  message?: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface UserUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  image?: string | null;
  password?: string;
  newPassword?: string;
  dateOfBirth?: string;
}

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Mapear email para login conforme esperado pela API
  const apiCredentials = {
    login: credentials.email,
    password: credentials.password,
  };

  const response = await api.post<AuthResponse>('/v1/auth/login', apiCredentials);
  return response.data;
};

// Registro
export const register = async (credentials: RegisterCredentials): Promise<User> => {
  const response = await api.post<User>('/v1/users', credentials);
  return response.data;
};

// Verificação de token/Obter usuário logado
export const verifyToken = async (): Promise<{ user: User }> => {
  const token = tokenManager.getToken();

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await api.get<User>('/v1/users/me');
  return { user: response.data };
};

// Atualização de usuário
export const updateUser = async (params: UserUpdateInput): Promise<User> => {
  const response = await api.patch<User>('/v1/users/me', params);
  return response.data;
};

// Upload de imagem do usuário
export const uploadUserImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'users');

  const response = await api.post<{ url: string }>('/v1/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Recuperação de senha (solicitação de email)
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/v1/auth/forgot-password', { email });
  return response.data;
};

// Redefinição de senha com token
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/v1/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};

// Logout (apenas local, não envolve API)
export const logout = (): void => {
  // Usar tokenManager para limpar todos os dados de autenticação
  tokenManager.clearAuthData();
};

// Refresh Token - renovar token de acesso usando cookies
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  // A API /v1/auth/refresh usa cookies para verificar o refresh token
  // O withCredentials será configurado automaticamente pelo interceptor
  const response = await api.post<RefreshTokenResponse>('/v1/auth/refresh', {});

  return response.data;
};
