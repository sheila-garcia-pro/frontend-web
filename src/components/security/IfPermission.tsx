import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Permission } from '../../security/permissions';

interface IfPermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function IfPermission({ permission, children, fallback = null }: IfPermissionProps) {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export default IfPermission;
