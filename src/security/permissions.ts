export enum Role {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  STARTER = 'starter_user',
}

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
  | 'update_image'
  | 'delete_image'

  // Relacionamentos e consultas
  | 'get_user_recipes_ingredients'
  | 'get_table_nutritional'
  | 'get_ingredient_category'
  | 'get_unit_measure'

  // Menus de usuário (scoped)
  | 'create_user_menu'
  | 'get_user_menu'
  | 'update_user_menu'
  | 'delete_user_menu'

  // Preços de ingredientes do usuário
  | 'create_user_price_ingredient'
  | 'get_user_price_ingredient'
  | 'get_user_historic_ingredient'

  // Unidades de medida de receitas do usuário
  | 'create_user_unit_measure_recipe'
  | 'get_user_unit_measure_recipe'
  | 'update_user_unit_measure_recipe'
  | 'delete_user_unit_measure_recipe'

  // Categorias de receitas do usuário
  | 'create_user_recipe_category'
  | 'get_user_recipe_category'
  | 'update_user_recipe_category'
  | 'delete_user_recipe_category'

  // Rendimentos de receitas
  | 'get_yields_recipes'

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
  | 'change_password'

  // Novas permissões baseadas no JWT token fornecido
  | 'get_all_ingredient'
  | 'update_all_ingredient'
  | 'delete_all_ingredient'
  | 'get_all_recipe'
  | 'create_all_recipe'
  | 'update_all_recipe'
  | 'delete_all_recipe'
  | 'get_all_supplier'
  | 'create_all_supplier'
  | 'update_all_supplier'
  | 'delete_all_supplier'
  | 'get_all_menu'
  | 'create_all_menu'
  | 'update_all_menu'
  | 'delete_all_menu'
  | 'create_all_ingredient'
  | 'get_all_user_ingredient'
  | 'create_all_user_ingredient'
  | 'update_all_user_ingredient'
  | 'delete_all_user_ingredient'
  | 'get_all_user_recipe'
  | 'create_all_user_recipe'
  | 'update_all_user_recipe'
  | 'delete_all_user_recipe'
  | 'get_all_user_recipes_ingredients'
  | 'get_all_table_nutritional'
  | 'create_all_user_table_nutritional'
  | 'get_all_user_table_nutritional'
  | 'update_all_user_table_nutritional'
  | 'delete_all_user_table_nutritional'
  | 'get_all_ingredient_category'
  | 'get_all_unit_measure'
  | 'create_all_roles'
  | 'get_all_roles'
  | 'update_all_roles'
  | 'delete_all_roles'
  | 'create_all_permissions'
  | 'get_all_permissions'
  | 'update_all_permissions'
  | 'delete_all_permissions'
  | 'create_all_image';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

export const ROLE_BASELINE: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    // Super Admin tem acesso a TODAS as permissões
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
    'get_all_ingredient',
    'update_all_ingredient',
    'delete_all_ingredient',
    'get_all_recipe',
    'create_all_recipe',
    'update_all_recipe',
    'delete_all_recipe',
    'get_all_supplier',
    'create_all_supplier',
    'update_all_supplier',
    'delete_all_supplier',
    'get_all_menu',
    'create_all_menu',
    'update_all_menu',
    'delete_all_menu',
    'create_all_ingredient',
    'get_all_user_ingredient',
    'create_all_user_ingredient',
    'update_all_user_ingredient',
    'delete_all_user_ingredient',
    'get_all_user_recipe',
    'create_all_user_recipe',
    'update_all_user_recipe',
    'delete_all_user_recipe',
    'get_all_user_recipes_ingredients',
    'get_all_table_nutritional',
    'create_all_user_table_nutritional',
    'get_all_user_table_nutritional',
    'update_all_user_table_nutritional',
    'delete_all_user_table_nutritional',
    'get_all_ingredient_category',
    'get_all_unit_measure',
    'create_all_roles',
    'get_all_roles',
    'update_all_roles',
    'delete_all_roles',
    'create_all_permissions',
    'get_all_permissions',
    'update_all_permissions',
    'delete_all_permissions',
    'create_all_image',
  ],

  [Role.ADMIN]: [
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
    'get_user_ingredient',
    'create_user_ingredient',
    'update_user_ingredient',
    'delete_user_ingredient',
    'create_user_price_ingredient',
    'get_user_price_ingredient',
    'get_user_historic_ingredient',
    'get_user_recipe',
    'create_user_recipe',
    'update_user_recipe',
    'delete_user_recipe',
    'create_user_unit_measure_recipe',
    'get_user_unit_measure_recipe',
    'update_user_unit_measure_recipe',
    'delete_user_unit_measure_recipe',
    'get_user_table_nutritional',
    'create_user_table_nutritional',
    'update_user_table_nutritional',
    'delete_user_table_nutritional',
    'create_user_menu',
    'get_user_menu',
    'update_user_menu',
    'delete_user_menu',
    'create_user_recipe_category',
    'get_user_recipe_category',
    'update_user_recipe_category',
    'delete_user_recipe_category',
    'get_ingredient',
    'get_recipe',
    'get_menu',
    'get_suppliers',
    'get_user_recipes_ingredients',
    'get_table_nutritional',
    'get_ingredient_category',
    'get_unit_measure',
    'get_yields_recipes',
    'create_image',
    'update_image',
    'delete_image',
    'update_profile',
    'upload_profile_image',
    'change_password',
  ],
};

export function mergePermissions(
  tokenPermissions?: Permission[],
  baseline?: Permission[],
): Permission[] {
  if (tokenPermissions && tokenPermissions.length > 0) {
    return tokenPermissions;
  }
  return baseline ?? [];
}

export function isAdminPermission(permission: Permission): boolean {
  return (
    ROLE_BASELINE[Role.SUPER_ADMIN].includes(permission) ||
    ROLE_BASELINE[Role.ADMIN].includes(permission)
  );
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_BASELINE[role] ?? [];
}
