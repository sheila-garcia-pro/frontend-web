import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { useTokenExpirationMonitor } from '@hooks/useTokenExpirationMonitor';
import AuthenticationMonitor from '@components/common/AuthenticationMonitor';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Componente que gerencia todos os aspectos de autenticação da aplicação
 * Inclui monitoramento de expiração de token e outros aspectos de auth
 */
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Monitorar expiração do token e renovar automaticamente quando necessário
  useTokenExpirationMonitor(isAuthenticated);

  return (
    <>
      {children}
      {/* Monitor para exibir modais de sessão expirada */}
      <AuthenticationMonitor />
    </>
  );
};

export default AuthProvider;
