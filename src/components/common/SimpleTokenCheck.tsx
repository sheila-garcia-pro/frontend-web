import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SimpleTokenCheckProps {
  children: React.ReactNode;
}

/**
 * Componente simples que verifica token apenas na inicialização
 */
const SimpleTokenCheck: React.FC<SimpleTokenCheckProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const tokenKey = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';
      const token = localStorage.getItem(tokenKey);
      const currentPath = location.pathname;

      console.log('🔍 Verificação simples de token:', {
        hasToken: !!token,
        currentPath,
      });

      // Rotas públicas que não precisam de token
      const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicRoute = publicRoutes.includes(currentPath);

      // Se não tem token e não está em rota pública, redirecionar
      if (!token && !isPublicRoute) {
        console.log('❌ Sem token - redirecionando para login');
        navigate('/login', { replace: true });
      }

      // Se tem token e está em rota pública, redirecionar para home
      if (token && isPublicRoute) {
        console.log('✅ Token encontrado em rota pública - redirecionando para home');
        navigate('/', { replace: true });
      }

      setChecked(true);
    };

    checkToken();
  }, [navigate, location.pathname]);

  // Mostrar loading enquanto não verificou
  if (!checked) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          backgroundColor: '#f5f5f5',
        }}
      >
        Verificando autenticação...
      </div>
    );
  }

  return <>{children}</>;
};

export default SimpleTokenCheck;
