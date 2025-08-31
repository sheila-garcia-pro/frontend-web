/**
 * Gerenciador de estado de login para evitar condições de corrida
 */

let lastLoginTime: number | null = null;
const LOGIN_PROTECTION_WINDOW = 3000; // 3 segundos de proteção após login

export const markRecentLogin = () => {
  lastLoginTime = Date.now();
  console.log('🛡️ [LOGIN PROTECTION] Login marcado:', new Date().toISOString());
};

export const isRecentLogin = (): boolean => {
  if (!lastLoginTime) return false;

  const timeSinceLogin = Date.now() - lastLoginTime;
  const isRecent = timeSinceLogin < LOGIN_PROTECTION_WINDOW;

  console.log('🛡️ [LOGIN PROTECTION] Verificando login recente:', {
    timeSinceLogin,
    isRecent,
    lastLoginTime: lastLoginTime ? new Date(lastLoginTime).toISOString() : null,
  });

  return isRecent;
};

export const clearLoginProtection = () => {
  lastLoginTime = null;
  console.log('🛡️ [LOGIN PROTECTION] Proteção limpa');
};

export default {
  markRecentLogin,
  isRecentLogin,
  clearLoginProtection,
};
