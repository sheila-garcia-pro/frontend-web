/**
 * Gerenciador de estado de login para evitar condições de corrida
 */

let lastLoginTime: number | null = null;
const LOGIN_PROTECTION_WINDOW = 3000; // 3 segundos de proteção após login

export const markRecentLogin = () => {
  lastLoginTime = Date.now();
};

export const isRecentLogin = (): boolean => {
  if (!lastLoginTime) return false;

  const timeSinceLogin = Date.now() - lastLoginTime;
  const isRecent = timeSinceLogin < LOGIN_PROTECTION_WINDOW;

  return isRecent;
};

export const clearLoginProtection = () => {
  lastLoginTime = null;
};

export default {
  markRecentLogin,
  isRecentLogin,
  clearLoginProtection,
};
