import { jwtDecode } from 'jwt-decode';
import { JwtPayload, Role, Permission, ROLE_BASELINE, mergePermissions } from './permissions';

export function parseToken(token: string): JwtPayload | null {
  try {
    const rawPayload = jwtDecode<Partial<JwtPayload>>(token);

    if (!rawPayload.id || !rawPayload.email || !rawPayload.role) {
      return null;
    }

    if (!Object.values(Role).includes(rawPayload.role as Role)) {
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
    return null;
  }
}

export function isExpired(payload?: { exp?: number } | null): boolean {
  if (!payload?.exp) {
    return true;
  }

  return Date.now() >= payload.exp * 1000;
}

export function hasRole(payload: JwtPayload | null, role: Role): boolean {
  return !!payload && payload.role === role;
}

export function hasPermission(payload: JwtPayload | null, permission: Permission): boolean {
  if (!payload) {
    return false;
  }

  if (payload.role === Role.SUPER_ADMIN || payload.role === Role.ADMIN) {
    return true;
  }

  return payload.permissions.includes(permission);
}

export function hasAnyPermission(payload: JwtPayload | null, permissions: Permission[]): boolean {
  if (!payload || permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => hasPermission(payload, permission));
}

export function hasAllPermissions(payload: JwtPayload | null, permissions: Permission[]): boolean {
  if (!payload || permissions.length === 0) {
    return false;
  }

  return permissions.every((permission) => hasPermission(payload, permission));
}

export function isValidToken(token: string | null): boolean {
  if (!token) {
    return false;
  }

  const payload = parseToken(token);
  return payload !== null && !isExpired(payload);
}

export function getUserFromToken(token: string | null): JwtPayload | null {
  if (!token) {
    return null;
  }

  return parseToken(token);
}
