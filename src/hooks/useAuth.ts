import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import {
  loginRequest,
  loginSuccess,
  logout as logoutAction,
  registerRequest,
  checkAuthRequest,
  User,
} from '@store/slices/authSlice';
import * as authService from '@services/api/auth';
import { addNotification } from '@store/slices/uiSlice';

// Interface para credenciais de login compatível com o authSlice
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => void;
  register: (credentials: RegisterCredentials) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  // Adicionando listener para evento de sessão expirada
  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(logoutAction());
    };

    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, [dispatch]);

  // Login usando o Redux
  const login = useCallback(
    (credentials: LoginCredentials) => {
      dispatch(loginRequest(credentials));
    },
    [dispatch],
  );

  // Registro usando o Redux
  const register = useCallback(
    (credentials: RegisterCredentials) => {
      // Enviar todas as credenciais, incluindo o phone
      dispatch(registerRequest(credentials));
    },
    [dispatch],
  );

  // Logout usando o Redux
  const logout = useCallback(() => {
    // Chamada direta ao serviço para limpar o localStorage
    authService.logout();

    // Atualiza o estado do Redux
    dispatch(logoutAction());

    // Notificação de sucesso
    dispatch(
      addNotification({
        message: 'Logout realizado com sucesso!',
        type: 'success',
      }),
    );

    // Redireciona para a página de login
    window.location.href = '/login';
  }, [dispatch]);
  // Verificação de autenticação
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem(
      import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token',
    );
    if (!token) {
      // Se não houver token, já marca como não autenticado
      dispatch(logoutAction());
      return;
    }
    dispatch(checkAuthRequest());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };
};
