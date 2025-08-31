/**
 * Utilitários para autenticação e autorização
 *
 * Funções puras para parsing de JWT, verificação de expiração,
 * checagem de roles e permissions.
 */

import { jwtDecode } from 'jwt-decode';
import { JwtPayload, Role, Permission, ROLE_BASELINE, mergePermissions } from './permissions';

/**
 * Parseia um token JWT e retorna o payload tipado.
 * Aplica merge com permissões baseline do role se necessário.
 */
export function parseToken(token: string): JwtPayload | null {
  try {
    const rawPayload = jwtDecode<Partial<JwtPayload>>(token);

    // Validar campos obrigatórios
    if (!rawPayload.id || !rawPayload.email || !rawPayload.role) {
      console.warn('Token JWT inválido: campos obrigatórios ausentes');
      return null;
    }

    // Garantir que o role é válido
    if (!Object.values(Role).includes(rawPayload.role as Role)) {
      console.warn('Token JWT inválido: role desconhecido:', rawPayload.role);
      return null;
    }

    const role = rawPayload.role as Role;
    const baseline = ROLE_BASELINE[role] ?? [];
    const finalPermissions = mergePermissions(rawPayload.permissions, baseline);

    return {
      id: rawPayload.id,
      email: rawPayload.email,
      role,
      permissions: finalPermissions,
      iat: rawPayload.iat,
      exp: rawPayload.exp,
    };
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

/**
 * Verifica se um payload JWT está expirado
 */
export function isExpired(payload?: { exp?: number } | null): boolean {
  if (!payload?.exp) {
    return true; // Sem expiração = considerado expirado
  }

  return Date.now() >= payload.exp * 1000;
}

/**
 * Verifica se um usuário tem um role específico
 */
export function hasRole(payload: JwtPayload | null, role: Role): boolean {
  return !!payload && payload.role === role;
}

/**
 * Verifica se um usuário tem uma permissão específica
 */
export function hasPermission(payload: JwtPayload | null, permission: Permission): boolean {
  if (!payload) {
    return false;
  }

  // Admin tem acesso a tudo
  if (payload.role === Role.ADMIN) {
    return true;
  }

  return payload.permissions.includes(permission);
}

/**
 * Verifica se um usuário tem pelo menos uma das permissões fornecidas
 */
export function hasAnyPermission(payload: JwtPayload | null, permissions: Permission[]): boolean {
  if (!payload || permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => hasPermission(payload, permission));
}

/**
 * Verifica se um usuário tem todas as permissões fornecidas
 */
export function hasAllPermissions(payload: JwtPayload | null, permissions: Permission[]): boolean {
  if (!payload || permissions.length === 0) {
    return false;
  }

  return permissions.every((permission) => hasPermission(payload, permission));
}

/**
 * Verifica se o token é válido e não está expirado
 */
export function isValidToken(token: string | null): boolean {
  if (!token) {
    return false;
  }

  const payload = parseToken(token);
  return payload !== null && !isExpired(payload);
}

/**
 * Extrai informações do usuário do token sem validar expiração
 */
export function getUserFromToken(token: string | null): JwtPayload | null {
  if (!token) {
    return null;
  }

  return parseToken(token);
}
