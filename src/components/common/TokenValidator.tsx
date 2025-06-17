import React from 'react';
import { useInitialTokenCheck } from '@hooks/useInitialTokenCheck';

interface TokenValidatorProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica se existe token válido
 * Se não houver token, redireciona para login
 */
const TokenValidator: React.FC<TokenValidatorProps> = ({ children }) => {
  // Hook que faz a verificação inicial do token
  useInitialTokenCheck();

  return <>{children}</>;
};

export default TokenValidator;
