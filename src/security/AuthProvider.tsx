/**
 * AuthProvider para RBAC
 *
 * Context e hook customizado para gerenciar estado de autenticação
 * com suporte a roles e permissions.
 */

import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { JwtPayload } from './permissions';
import { parseToken, isExpired } from './auth';

// Chave do token - usando a mesma do tokenManager para compatibilidade
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';

// Estado da autenticação
interface AuthState {
  user: JwtPayload | null;
  token: string | null;
  loading: boolean;
}

// Contexto da autenticação
interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Props do provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação com suporte a RBAC
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  // Inicialização: verificar se há token válido no localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (storedToken) {
          const payload = parseToken(storedToken);

          if (payload && !isExpired(payload)) {
            setState({
              user: payload,
              token: storedToken,
              loading: false,
            });
            return;
          } else {
            // Token expirado ou inválido - limpar
            localStorage.removeItem(TOKEN_KEY);
          }
        }

        setState({
          user: null,
          token: null,
          loading: false,
        });
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        setState({
          user: null,
          token: null,
          loading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Realiza login com token JWT
   */
  const login = (token: string) => {
    try {
      const payload = parseToken(token);

      if (!payload) {
        throw new Error('Token inválido ou mal formatado');
      }

      if (isExpired(payload)) {
        throw new Error('Token expirado');
      }

      // Salvar token no localStorage
      localStorage.setItem(TOKEN_KEY, token);

      setState({
        user: payload,
        token,
        loading: false,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  /**
   * Realiza logout limpando estado e storage
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState({
      user: null,
      token: null,
      loading: false,
    });
  };

  // Memoizar contexto para evitar re-renders desnecessários
  const contextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acessar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
