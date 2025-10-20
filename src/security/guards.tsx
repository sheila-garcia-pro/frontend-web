import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Permission } from './permissions';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

interface PermissionRouteProps {
  required: Permission[];
  any?: boolean;
  children: React.ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function PermissionRoute({ required, any = false, children }: PermissionRouteProps) {
  const { user, loading, isAuthenticated, hasAnyPermission, hasAllPermissions } = useAuth();

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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredPermissions = any ? hasAnyPermission(required) : hasAllPermissions(required);

  if (!hasRequiredPermissions) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
