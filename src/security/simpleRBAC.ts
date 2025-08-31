/**
 * Sistema RBAC Simplificado
 *
 * Funciona com sistema de autenticação principal (useAuth)
 * Compatível com o tipo User atual
 */

// Importar o tipo User do sistema principal
import { User } from '@store/slices/authSlice';
import { Permission } from './permissions';

// Mapeamento simples de roles para permissões
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'create_ingredient',
    'update_ingredient',
    'delete_ingredient',
    'get_ingredient',
    'create_recipe',
    'update_recipe',
    'delete_recipe',
    'get_recipe',
    'create_menu',
    'update_menu',
    'delete_menu',
    'get_menu',
    'get_suppliers',
    'create_supplier',
    'update_supplier',
    'delete_supplier',
  ],
  user: ['get_ingredient', 'get_recipe', 'get_menu', 'get_suppliers'],
  starter: ['get_ingredient', 'get_recipe', 'get_menu', 'get_suppliers'],
  // starter_user agora tem TODAS as permissões, igual ao admin
  starter_user: [
    'create_ingredient', // ✅ Pode criar ingredientes
    'update_ingredient', // ✅ Pode editar ingredientes
    'delete_ingredient', // ✅ Pode deletar ingredientes
    'get_ingredient', // ✅ Pode ver ingredientes
    'create_recipe', // ✅ Pode criar receitas
    'update_recipe', // ✅ Pode editar receitas
    'delete_recipe', // ✅ Pode deletar receitas
    'get_recipe', // ✅ Pode ver receitas
    'create_menu', // ✅ Pode criar menus
    'update_menu', // ✅ Pode editar menus
    'delete_menu', // ✅ Pode deletar menus
    'get_menu', // ✅ Pode ver menus
    'get_suppliers', // ✅ Pode ver fornecedores
    'create_supplier', // ✅ Pode criar fornecedores
    'update_supplier', // ✅ Pode editar fornecedores
    'delete_supplier', // ✅ Pode deletar fornecedores
  ],
};

/**
 * Verifica se um usuário tem uma permissão específica
 */
export function hasSimplePermission(user: User | null, permission: Permission): boolean {
  if (!user || !user.role) {
    return false;
  }

  const userRole = user.role.toLowerCase();
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  const hasPermission = rolePermissions.includes(permission);

  return hasPermission;
}

/**
 * Verifica se um usuário tem pelo menos uma das permissões (OR)
 */
export function hasAnySimplePermission(user: User | null, permissions: Permission[]): boolean {
  if (!user || !permissions.length) {
    return false;
  }

  return permissions.some((permission) => hasSimplePermission(user, permission));
}

/**
 * Verifica se um usuário tem todas as permissões (AND)
 */
export function hasAllSimplePermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user || !permissions.length) {
    return false;
  }

  return permissions.every((permission) => hasSimplePermission(user, permission));
}

/**
 * Obtém todas as permissões de um usuário
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user || !user.role) {
    return [];
  }

  const userRole = user.role.toLowerCase();
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Verifica se um usuário tem um role específico
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user || !user.role) {
    return false;
  }

  const hasRoleResult = user.role.toLowerCase() === role.toLowerCase();

  return hasRoleResult;
}
