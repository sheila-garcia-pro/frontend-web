/**
 * Hook integrado que combina o sistema de autenticação Redux existente
 * com o novo sistema RBAC.
 *
 * Mantém compatibilidade com o sistema existente enquanto adiciona
 * funcionalidades de roles e permissions.
 */

import { useAuth as useReduxAuth } from '@hooks/useAuth';
import { useAuth as useRbacAuth } from '@/security/AuthProvider';
import { hasRole, hasPermission, hasAnyPermission, hasAllPermissions } from '@/security/auth';
import { Role, Permission } from '@/security/permissions';
import { useEffect } from 'react';

/**
 * Hook integrado que combina Redux Auth + RBAC
 */
export function useIntegratedAuth() {
  // Sistema Redux existente
  const reduxAuth = useReduxAuth();

  // Sistema RBAC
  const rbacAuth = useRbacAuth();

  // Sincronizar tokens quando o Redux recebe um novo token
  useEffect(() => {
    if (reduxAuth.isAuthenticated && reduxAuth.user && !rbacAuth.user) {
      // Se o Redux tem usuário mas o RBAC não, tentar sincronizar
      const tokenKey = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';
      const token = localStorage.getItem(tokenKey);

      if (token) {
        try {
          rbacAuth.login(token);
        } catch (error) {
          // Ignorar erro de sincronização RBAC - não crítico
        }
      }
    }
  }, [reduxAuth.isAuthenticated, reduxAuth.user, rbacAuth.user, rbacAuth.login]);

  return {
    // Estados básicos - priorizar RBAC se disponível, senão Redux
    user: rbacAuth.user || reduxAuth.user,
    token: rbacAuth.token,
    isAuthenticated: rbacAuth.user ? true : reduxAuth.isAuthenticated,
    loading: reduxAuth.loading || rbacAuth.loading,
    error: reduxAuth.error,

    // Funções de autenticação - usar Redux para manter compatibilidade
    login: reduxAuth.login,
    logout: () => {
      reduxAuth.logout();
      rbacAuth.logout();
    },
    register: reduxAuth.register,
    checkAuth: reduxAuth.checkAuth,

    // Funções RBAC - só funcionam se user do RBAC existir
    hasRole: (role: Role) => hasRole(rbacAuth.user, role),
    hasPermission: (permission: Permission) => hasPermission(rbacAuth.user, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(rbacAuth.user, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(rbacAuth.user, permissions),

    // Info adicional
    role: rbacAuth.user?.role,
    permissions: rbacAuth.user?.permissions || [],
  };
}
