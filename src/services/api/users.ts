import api, { cachedGet, clearCache } from './index';

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  phone: string;
}

// Obter usuário logado (com cache)
export const getCurrentUser = async (): Promise<User> => {
  const tokenKey = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';
  const token = localStorage.getItem(tokenKey);

  if (!token) {
    throw new Error('Token não encontrado');
  }

  return await cachedGet<User>('/v1/users/me');
};

// Obter usuário por ID (com cache)
export const getUserById = async (id: string): Promise<User> => {
  return await cachedGet<User>(`/v1/users/${id}`);
};

// Criar um novo usuário
export const createUser = async (params: CreateUserParams): Promise<User> => {
  const response = await api.post<User>('/v1/users', params);
  // Limpa o cache de usuários após criar um novo
  clearCache('/v1/users');
  return response.data;
};
