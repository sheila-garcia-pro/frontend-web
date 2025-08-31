/**
 * Barrel export para módulo de segurança
 */

// Types e enums
export { Role, type Permission, type JwtPayload } from './permissions';

// Utilitários de auth
export {
  parseToken,
  isExpired,
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isValidToken,
  getUserFromToken,
} from './auth';

// Provider e hook
export { AuthProvider, useAuth } from './AuthProvider';

// Guards de rota
export { ProtectedRoute, PermissionRoute } from './guards';

// Instância do Axios
export { api as secureApi } from './axios';
