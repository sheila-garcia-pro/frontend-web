import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import {
  loginRequest,
  logout as logoutAction,
  registerRequest,
  checkAuthRequest,
  User,
} from '@store/slices/authSlice';
import * as authService from '@services/api/auth';
import { addNotification } from '@store/slices/uiSlice';
import {
  parseToken,
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../security/auth';
import { Role, Permission, JwtPayload } from '../security/permissions';
import tokenManager from '@utils/tokenManager';

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

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => void;
  register: (credentials: RegisterCredentials) => void;
  logout: () => void;
  checkAuth: () => void;
  jwtPayload: JwtPayload | null;
  hasRole: (role: Role) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const jwtPayload = useMemo(() => {
    if (!isAuthenticated) return null;

    const token = tokenManager.getToken();
    if (!token) return null;

    return parseToken(token);
  }, [isAuthenticated]);

  const login = useCallback(
    (credentials: LoginCredentials) => {
      dispatch(loginRequest(credentials));
    },
    [dispatch],
  );

  const register = useCallback(
    (credentials: RegisterCredentials) => {
      dispatch(registerRequest(credentials));
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    authService.logout();
    dispatch(logoutAction());
    dispatch(
      addNotification({
        message: 'Logout realizado com sucesso!',
        type: 'success',
      }),
    );
    window.location.href = '/login';
  }, [dispatch]);

  const checkAuth = useCallback(() => {
    dispatch(checkAuthRequest());
  }, [dispatch]);

  const hasRoleCallback = useCallback((role: Role) => hasRole(jwtPayload, role), [jwtPayload]);
  const hasPermissionCallback = useCallback(
    (permission: Permission) => hasPermission(jwtPayload, permission),
    [jwtPayload],
  );
  const hasAnyPermissionCallback = useCallback(
    (permissions: Permission[]) => hasAnyPermission(jwtPayload, permissions),
    [jwtPayload],
  );
  const hasAllPermissionsCallback = useCallback(
    (permissions: Permission[]) => hasAllPermissions(jwtPayload, permissions),
    [jwtPayload],
  );

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    jwtPayload,
    hasRole: hasRoleCallback,
    hasPermission: hasPermissionCallback,
    hasAnyPermission: hasAnyPermissionCallback,
    hasAllPermissions: hasAllPermissionsCallback,
  };
};
