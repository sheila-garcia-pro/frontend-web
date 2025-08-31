/**
 * IfPermission Simplificado
 *
 * Usa o sistema principal de autenticação + RBAC simplificado
 */

import React from 'react';
import { useAuth } from '@hooks/useAuth';
import { hasSimplePermission } from '../../security/simpleRBAC';
import { Permission } from '../../security/permissions';

interface SimpleIfPermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children apenas se o usuário tiver a permissão especificada
 */
export function SimpleIfPermission({
  permission,
  children,
  fallback = null,
}: SimpleIfPermissionProps) {
  const { user, isAuthenticated } = useAuth();

  // Se não está autenticado, retorna fallback
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const canAccess = hasSimplePermission(user, permission);

  return <>{canAccess ? children : fallback}</>;
}

export default SimpleIfPermission;
