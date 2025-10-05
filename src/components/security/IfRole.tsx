import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../security/permissions';

interface IfRoleProps {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function IfRole({ role, children, fallback = null }: IfRoleProps) {
  const { hasRole } = useAuth();

  if (hasRole(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export default IfRole;
