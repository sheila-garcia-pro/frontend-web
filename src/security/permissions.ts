/**
 * Sistema de Roles e Permissions para RBAC
 *
 * Define os contratos de autorização e mapeamento baseline por role.
 * Nunca confie apenas no front-end - o back-end deve validar tudo.
 */

// Enum para roles do sistema
export enum Role {
  ADMIN = 'admin',
  STARTER = 'starter_user',
}

// Union type para todas as permissões possíveis
export type Permission =
  // Ingredientes
  | 'get_ingredient'
  | 'create_ingredient'
  | 'update_ingredient'
  | 'delete_ingredient'

  // Receitas
  | 'get_recipe'
  | 'create_recipe'
  | 'update_recipe'
  | 'delete_recipe'

  // Cardápios
  | 'get_menu'
  | 'create_menu'
  | 'update_menu'
  | 'delete_menu'

  // Fornecedores
  | 'get_suppliers'
  | 'create_supplier'
  | 'update_supplier'
  | 'delete_supplier'

  // Ingredientes do usuário (scoped)
  | 'create_user_ingredient'
  | 'get_user_ingredient'
  | 'update_user_ingredient'
  | 'delete_user_ingredient'

  // Receitas do usuário (scoped)
  | 'create_user_recipe'
  | 'get_user_recipe'
  | 'update_user_recipe'
  | 'delete_user_recipe'

  // Tabela nutricional do usuário
  | 'create_user_table_nutritional'
  | 'get_user_table_nutritional'
  | 'update_user_table_nutritional'
  | 'delete_user_table_nutritional'

  // Uploads e recursos
  | 'create_image'

  // Relacionamentos e consultas
  | 'get_user_recipes_ingredients'
  | 'get_table_nutritional'
  | 'get_ingredient_category'
  | 'get_unit_measure'

  // Gestão do sistema (admin)
  | 'create_roles'
  | 'get_roles'
  | 'update_roles'
  | 'delete_roles'
  | 'create_permissions'
  | 'get_permissions'
  | 'update_permissions'
  | 'delete_permissions'

  // Perfil de usuário
  | 'update_profile'
  | 'upload_profile_image'
  | 'change_password';

// Interface para payload do JWT
export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

// Permissões baseline por role - fallback quando o backend não envia permissões específicas
export const ROLE_BASELINE: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin tem acesso total - representado por wildcard ou lista completa
    'get_ingredient',
    'create_ingredient',
    'update_ingredient',
    'delete_ingredient',
    'get_recipe',
    'create_recipe',
    'update_recipe',
    'delete_recipe',
    'get_menu',
    'create_menu',
    'update_menu',
    'delete_menu',
    'get_suppliers',
    'create_supplier',
    'update_supplier',
    'delete_supplier',
    'create_user_ingredient',
    'get_user_ingredient',
    'update_user_ingredient',
    'delete_user_ingredient',
    'create_user_recipe',
    'get_user_recipe',
    'update_user_recipe',
    'delete_user_recipe',
    'create_user_table_nutritional',
    'get_user_table_nutritional',
    'update_user_table_nutritional',
    'delete_user_table_nutritional',
    'create_image',
    'get_user_recipes_ingredients',
    'get_table_nutritional',
    'get_ingredient_category',
    'get_unit_measure',
    'create_roles',
    'get_roles',
    'update_roles',
    'delete_roles',
    'create_permissions',
    'get_permissions',
    'update_permissions',
    'delete_permissions',
    'update_profile',
    'upload_profile_image',
    'change_password',
  ],

  [Role.STARTER]: [
    // Starter user - acesso limitado às áreas do usuário e leitura básica do domínio
    'get_user_ingredient',
    'create_user_ingredient',
    'update_user_ingredient',
    'delete_user_ingredient',
    'get_user_recipe',
    'create_user_recipe',
    'update_user_recipe',
    'delete_user_recipe',
    'get_user_table_nutritional',
    'create_user_table_nutritional',
    'update_user_table_nutritional',
    'delete_user_table_nutritional',
    'get_menu',
    'create_menu',
    'update_menu',
    'delete_menu',
    'get_ingredient',
    'get_recipe',
    'get_suppliers', // leitura básica
    'get_user_recipes_ingredients',
    'get_table_nutritional',
    'get_ingredient_category',
    'get_unit_measure',
    'create_image',
    'update_profile',
    'upload_profile_image',
    'change_password',
  ],
};

/**
 * Mescla permissões vindas do token com as permissões baseline do role.
 * Se o backend enviar permissões específicas, usa elas. Caso contrário, usa baseline.
 */
export function mergePermissions(
  tokenPermissions?: Permission[],
  baseline?: Permission[],
): Permission[] {
  if (tokenPermissions && tokenPermissions.length > 0) {
    return tokenPermissions;
  }
  return baseline ?? [];
}

/**
 * Verifica se uma permission específica é permitida para admin (todas são)
 */
export function isAdminPermission(permission: Permission): boolean {
  return ROLE_BASELINE[Role.ADMIN].includes(permission);
}

/**
 * Obtém todas as permissões válidas para um role específico
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_BASELINE[role] ?? [];
}
