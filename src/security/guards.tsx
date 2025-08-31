/**
 * Guards de rota para RBAC
 *
 * Componentes para proteger rotas baseado em autenticação e permissões.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth as useMainAuth } from '@hooks/useAuth';
import { hasAnySimplePermission, hasAllSimplePermissions } from './simpleRBAC';
import { Permission } from './permissions';

// Props para ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactElement;
}

// Props para PermissionRoute
interface PermissionRouteProps {
  required: Permission[];
  any?: boolean; // Se true, precisa de apenas uma das permissões. Se false, precisa de todas.
  children: React.ReactElement;
}

/**
 * Guard básico - protege rota exigindo usuário autenticado
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useMainAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          backgroundColor: '#f5f5f5',
        }}
      >
        Carregando...
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar conteúdo se autenticado
  return children;
}

/**
 * Guard avançado - protege rota exigindo permissões específicas
 */
export function PermissionRoute({ required, any = false, children }: PermissionRouteProps) {
  const { user, loading, isAuthenticated } = useMainAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          backgroundColor: '#f5f5f5',
        }}
      >
        Carregando...
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permissões usando o sistema simplificado
  const hasRequiredPermissions = any
    ? hasAnySimplePermission(user, required)
    : hasAllSimplePermissions(user, required);

  // Redirecionar para 403 se não tem permissões
  if (!hasRequiredPermissions) {
    return <Navigate to="/not-found" replace />;
  }

  // Renderizar conteúdo se tem permissões
  return children;
}
