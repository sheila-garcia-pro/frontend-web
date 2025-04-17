import api from './index';
import { User } from '@store/slices/authSlice';

// Interfaces
interface LoginCredentials {
  login: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface AuthResponse {
  token: string;
}

interface UserUpdateParams {
  id: string;
  [key: string]: any;
}

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/v1/login', credentials);
  return response.data;
};

// Registro
export const register = async (credentials: RegisterCredentials): Promise<User> => {
  const response = await api.post<User>('/v1/users', credentials);
  return response.data;
};

// Verificação de token/Obter usuário logado
export const verifyToken = async (): Promise<{ user: User }> => {
  const response = await api.get<User>('/v1/users/me');
  return { user: response.data };
};

// Atualização de usuário
export const updateUser = async (params: UserUpdateParams): Promise<User> => {
  const response = await api.put<User>(`/v1/users/${params.id}`, params);
  return response.data;
};

// Atualização de senha
export const updatePassword = async (
  userId: string,
  passwords: { currentPassword: string; newPassword: string },
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(`/users/${userId}/password`, passwords);
  return response.data;
};

// Logout (apenas local, não envolve API)
export const logout = (): void => {
  const tokenKey = process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token';
  localStorage.removeItem(tokenKey);
};
