/**
 * Componente IfRole
 *
 * Renderiza condicionalmente baseado no role do usuário.
 * Útil para mostrar funcionalidades específicas para admin ou outros roles.
 */

import React from 'react';
import { useAuth } from '../../security/AuthProvider';
import { hasRole } from '../../security/auth';
import { Role } from '../../security/permissions';

interface IfRoleProps {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children apenas se o usuário tiver o role especificado
 */
export function IfRole({ role, children, fallback = null }: IfRoleProps) {
  const { user } = useAuth();

  const hasRequiredRole = hasRole(user, role);

  return <>{hasRequiredRole ? children : fallback}</>;
}

export default IfRole;
