/**
 * Componente IfPermission
 *
 * Renderiza condicionalmente baseado em uma permissão específica.
 * Útil para mostrar/esconder botões, menus e outros elementos da UI.
 */

import React from 'react';
// Temporariamente desabilitado o sistema RBAC até unificação
// import { useAuth } from '../../security/AuthProvider';
// import { hasPermission } from '../../security/auth';
import { Permission } from '../../security/permissions';

interface IfPermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children apenas se o usuário tiver a permissão especificada
 */
export function IfPermission({ permission, children, fallback = null }: IfPermissionProps) {
  // Temporariamente desabilitado - sempre retorna fallback até sistema ser unificado
  console.warn('🚧 [IfPermission] Sistema RBAC temporariamente desabilitado. Retornando fallback.');

  return <>{fallback}</>;
}

export default IfPermission;
